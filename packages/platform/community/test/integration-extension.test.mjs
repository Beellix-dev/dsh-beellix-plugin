import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,mkdir,readFile} from 'node:fs/promises'
import {resolve,join} from 'node:path'
import {Interoperability} from "../../../../dev/shared/runtime/interoperability.mjs"

test('其他受管插件通过同一中台协议接入：范围投影、原生审核、旧凭据失效、撤权和重启',{timeout:20000},async()=>{
 const root=await mkdtemp(resolve("./dev/artifacts/integration-extension-")),vault=new Map(),sourceDir=join(root,'source'),targetDir=join(root,'target');await mkdir(sourceDir);await mkdir(targetDir)
 const options={owned:async()=>[{name:'@beellix-ai/test-source',directory:sourceDir},{name:'@beellix-ai/test-target',directory:targetDir}],secrets:{get:async k=>vault.get(k),set:async(k,v)=>vault.set(k,v)}}
 let broker=new Interoperability(root,options),writes=0
 const contract={id:'beellix.test-sharing.v1',title:'测试资料共享',source:{packageName:'@beellix-ai/test-source',accountKey:'sourceAccount'},target:{packageName:'@beellix-ai/test-target',accountKey:'targetAccount'},operations:[{id:'documents.read',title:'读取资料',effect:'read',default:true},{id:'documents.draft',title:'创建草稿',effect:'write'}],fields:[{key:'documentIds',title:'共享资料',kind:'multiple',side:'target',collection:'documents',required:true}],validate:input=>{if(!Array.isArray(input.documentIds)||input.documentIds.some(id=>!Number.isSafeInteger(id)))throw Error('INTEGRATION_FIELDS')},authorize:({grant,packet})=>{if(!grant.documentIds.includes(packet.input.id))throw Error('INTEGRATION_OBJECT_SCOPE')},project:({result})=>({id:result.id,title:result.title}),review:()=>['核对资料草稿']}
 const register=async()=>{const source=await broker.publicService().register({packageName:'@beellix-ai/test-source',packageDirectory:sourceDir,title:'测试来源',accounts:async()=>[{instanceId:'source',title:'来源账套'}],validateGrant:async()=>{},snapshotGrant:async()=>{},call:async()=>({})});const target=await broker.publicService().register({packageName:'@beellix-ai/test-target',packageDirectory:targetDir,title:'测试目标',contracts:[contract],accounts:async()=>[{instanceId:'target',title:'目标账套'}],choices:async()=>({items:[{id:1,name:'授权资料'}],total:1,nextOffset:null}),validateGrant:async()=>{},snapshotGrant:async()=>{},preview:async()=>({stateRevision:1,result:{}}),call:async({operation})=>{if(operation==='documents.draft')writes++;return{id:1,title:'授权资料',private:'不能返回'}}});return{source,target}}
 let{source,target}=await register()
 try{
  const title=contract.fields[0].title;contract.fields[0].title='外部变更';assert.equal((await broker.managementSnapshot()).contracts.find(c=>c.id===contract.id).fields[0].title,title);contract.fields[0].title=title
  const input={contractId:contract.id,sourceAccount:'source',targetAccount:'target',documentIds:[1],permissions:['documents.read','documents.draft'],expiresAt:new Date(Date.now()+86400000).toISOString()},grant=await broker.create(input),packet={version:1,grantId:grant.id,accountId:'source',operation:'documents.read',input:{id:1}}
  assert.equal((await broker.managementSnapshot()).contracts.length,2);assert.equal((await broker.choice({contractId:contract.id,side:'target',accountId:'target',collection:'documents'})).items.length,1)
  assert.deepEqual((await source.call(packet,{})).data,{id:1,title:'授权资料'});await assert.rejects(target.call({...packet,accountId:'target'},{}),/PROVIDER/);await assert.rejects(source.call({...packet,input:{id:2}},{}),/OBJECT_SCOPE/)
  const write={...packet,operation:'documents.draft',requestId:'extension-draft-0001'},yes={ask:async q=>({answers:q.questions.map(r=>({id:r.id,selected:['确认此项']}))})}
  await assert.rejects(source.review(write,{readOnly:true,questions:yes}),/READ_ONLY/);await assert.rejects(source.call(write,{}),/REVIEW_REQUIRED/)
  const approval=await source.review(write,{questions:yes});await broker.update({id:grant.id,expectedRevision:1,input});await assert.rejects(source.call(write,{approval}),/REVIEW_REQUIRED/);assert.equal(writes,0)
  const next=await source.review(write,{questions:yes});await source.call(write,{approval:next});assert.equal(writes,1)
  const file=join(root,'config/integration/grants.json'),before=await readFile(file);await broker.dispose();broker=new Interoperability(root,options);({source,target}=await register());await broker.managementSnapshot();assert.deepEqual(await readFile(file),before);assert.equal((await source.call(packet,{})).data.title,'授权资料')
  await broker.setEnabled({id:grant.id,expectedRevision:2,enabled:false});await assert.rejects(source.call(packet,{}),/GRANT_UNAVAILABLE/);await broker.setEnabled({id:grant.id,expectedRevision:3,enabled:true});assert.equal((await source.call(packet,{})).data.id,1)
 }finally{await broker.dispose()}
})
