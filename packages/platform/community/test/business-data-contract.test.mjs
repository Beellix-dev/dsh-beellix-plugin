import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,mkdir,readFile,writeFile} from 'node:fs/promises'
import {join,resolve} from 'node:path'
import {LocalDataAccess} from "../../../../dev/shared/runtime/local-data-access.mjs"
import {dataReferenceKey,requireDataFeatures} from "../../../../dev/shared/runtime/data-contract.mjs"

async function fixture(){
 const root=await mkdtemp(resolve("./dev/artifacts/business-data-")),directory=join(root,'crm');await mkdir(directory)
 const owner={id:'owner'},child={id:'child'},owned=[{id:'sales-crm',name:'@beellix-ai/sales-crm',directory,enabled:true}],calls=[]
 const access=new LocalDataAccess(root,{owned:async()=>owned,resolveAgent:async agent=>{if(agent!==owner&&agent!==child)throw Error('DATA_IDENTITY');return{principal:'owner',subject:'workspace',sessionId:agent.id,identity:agent.id,readOnly:agent===child}}})
 const register=async(resources)=>access.register({packageName:owned[0].name,packageDirectory:directory,accounts:async()=>[{instanceId:'original',title:'原数据库'},{instanceId:'restored',title:'恢复副本'}],resources})
 const resource={id:'sales-crm.business',title:'CRM',actions:['read','write'],inputSchema:{read:{type:'object',properties:{action:{const:'get'},id:{type:'string'}},required:['action','id'],additionalProperties:false},write:{type:'object',properties:{requestId:{type:'string',minLength:8}},required:['requestId'],additionalProperties:false}},recordTypes:[{entity:'customers',title:'客户',idType:'string',read:async(ref,scope)=>{await scope.validate();calls.push(ref);return{id:ref.id,name:'原客户',revision:2}}}],invoke:async p=>{calls.push(p);return{ok:true}}}
 return{root,access,register,resource,calls,owned,owner,child}
}
test('统一入口执行动作Schema，拒绝未知字段和类型，原参数不被默认值或强制转换改写',async()=>{
 const f=await fixture();try{await f.register([f.resource]);const api=f.access.publicService().forAgent(f.owner),base={resource:f.resource.id,accountId:'original',action:'read'}
  await assert.rejects(api.call({...base,input:{action:'save',id:'one'}}),/DATA_INPUT/)
  await assert.rejects(api.call({...base,input:{action:'get',id:1}}),/DATA_INPUT/)
  await assert.rejects(api.call({...base,input:{action:'get',id:'one',principal:'owner'}}),/DATA_INPUT/)
  assert.equal(f.calls.length,0)
  const input={action:'get',id:'one'};assert.equal((await api.call({...base,input})).ok,true);assert.deepEqual(input,{action:'get',id:'one'})
  await assert.rejects(api.call({...base,action:'write',input:{}}),/DATA_INPUT/)
  const logs=await readFile(join(f.root,'data/permissions/audit.jsonl'),'utf8');assert.ok(!logs.includes('"id":"one"'));assert.ok(logs.includes('DATA_INPUT'))
 }finally{await f.access.dispose()}
})

test('引用结果交付前重验取消与提供方生命周期，引用键保留数据库和ID类型',async()=>{
 const f=await fixture();try{
  let release,enter;const entered=new Promise(r=>enter=r)
  const resource={...f.resource,recordTypes:[{...f.resource.recordTypes[0],read:async ref=>{enter();await new Promise(r=>release=r);return{id:ref.id}}}]}
  const handle=await f.register([resource]),api=f.access.publicService().forAgent(f.owner),ref={version:1,resource:resource.id,accountId:'original',entity:'customers',id:'one'}
  const promise=api.resolve(ref);await entered;handle.dispose();release();await assert.rejects(promise,/DATA_SCOPE_CHANGED/)
  await f.register([f.resource]);const cancel=new AbortController();cancel.abort(Error('cancelled'));await assert.rejects(api.resolve(ref,{signal:cancel.signal}),/cancelled/)
  assert.notEqual(dataReferenceKey({...ref,id:1}),dataReferenceKey({...ref,id:'1'}));assert.notEqual(dataReferenceKey(ref),dataReferenceKey({...ref,accountId:'restored'}))
  assert.equal(requireDataFeatures(f.access.publicService(),['record-references']).contractVersion,1)
  assert.throws(()=>requireDataFeatures({contractVersion:1},['record-references']),/DATA_FEATURE_UNAVAILABLE/)
 }finally{await f.access.dispose()}
})
test('跨模块对象引用复用原数据库和编号，子代理只读解析，恢复副本不能替代原引用',async()=>{
 const f=await fixture();try{await f.register([f.resource]);const api=f.access.publicService().forAgent(f.owner),reference={version:1,resource:f.resource.id,accountId:'original',entity:'customers',id:'existing-001'}
  const result=await api.resolve(reference);assert.deepEqual(result.reference,reference);assert.equal(result.record.name,'原客户')
  assert.equal((await f.access.publicService().forAgent(f.child).resolve(reference)).record.id,'existing-001')
  const clone={...reference,accountId:'restored'};assert.equal((await api.resolve(clone)).reference.accountId,'restored');assert.equal((await api.resolve(reference)).reference.accountId,'original')
  await assert.rejects(api.resolve({...reference,id:1}),/DATA_REFERENCE/)
  await assert.rejects(api.resolve({...reference,entity:'contracts'}),/DATA_REFERENCE/)
  await assert.rejects(api.resolve({...reference,accountId:'missing'}),/DATA_ACCOUNT/)
  await assert.rejects(api.resolve({...reference,principal:'owner'}),/DATA_REFERENCE/)
  f.owned[0].enabled=false;await assert.rejects(api.resolve(reference),/DATA_PROVIDER/)
 }finally{await f.access.dispose()}
})
test('不完整或异步／远程Schema在登记时拒绝，旧提供方仍兼容且不改旧策略资料',async()=>{
 const f=await fixture();try{
  await assert.rejects(f.register([{...f.resource,inputSchema:{read:{$ref:'https://example.test/schema.json'}}}]),/DATA_SCHEMA/)
  await assert.rejects(f.register([{...f.resource,inputSchema:{read:{$async:true,type:'object'}}}]),/DATA_SCHEMA/)
  const legacy={...f.resource};delete legacy.inputSchema;delete legacy.recordTypes
  await f.register([legacy]);const api=f.access.publicService().forAgent(f.owner)
  assert.equal((await api.call({resource:legacy.id,action:'read',accountId:'original',input:{old:'still supported'}})).ok,true)
  await assert.rejects(api.resolve({version:1,resource:legacy.id,accountId:'original',entity:'customers',id:'old'}),/DATA_REFERENCE_UNSUPPORTED/)
  await mkdir(join(f.root,'config/permissions'),{recursive:true});const file=join(f.root,'config/permissions/policies.json');await writeFile(file,'old-data');await api.catalog();assert.equal(await readFile(file,'utf8'),'old-data')
 }finally{await f.access.dispose()}
})
