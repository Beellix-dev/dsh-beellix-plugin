import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,mkdir,readFile,writeFile} from 'node:fs/promises'
import {resolve,join} from 'node:path'
import {Interoperability} from "../../../../dev/shared/runtime/interoperability.mjs"
import {consoleApi} from '../src/console-api.mjs'
import {createServer} from 'node:http'

async function fixture(){
 const root=await mkdtemp(resolve("./dev/artifacts/integration-management-")),dirs={crm:join(root,'crm'),inventory:join(root,'inventory')},vault=new Map(),snapshots=[]
 await Promise.all(Object.values(dirs).map(p=>mkdir(p)))
 const broker=new Interoperability(root,{owned:async()=>[{name:'@beellix-ai/sales-crm',directory:dirs.crm,enabled:true},{name:'@beellix-ai/inventory',directory:dirs.inventory,enabled:true}],secrets:{get:async k=>vault.get(k),set:async(k,v)=>vault.set(k,v)}})
 const common={validateGrant:async()=>{},snapshotGrant:async g=>snapshots.push(structuredClone(g))}
 const crm=await broker.register({...common,packageName:'@beellix-ai/sales-crm',packageDirectory:dirs.crm,title:'销售 CRM',accounts:async()=>[{instanceId:'crm-main',title:'客户库'}],choices:async()=>({items:[{id:'c1',name:'客户甲'}],total:1,nextOffset:null}),call:async()=>({id:'c1',name:'客户甲',phone:'private'})})
 await broker.register({...common,packageName:'@beellix-ai/inventory',packageDirectory:dirs.inventory,title:'进销存',accounts:async()=>[{instanceId:'inv-main',title:'经营账套'}],choices:async()=>({items:[{id:1,name:'商品甲'}],total:1,nextOffset:null}),previewDraft:async()=>({stateRevision:1,result:{lines:[]}}),call:async()=>({items:[{id:1,name:'商品甲',cost:'secret'}]})})
 const input={crmAccount:'crm-main',inventoryAccount:'inv-main',customerMap:[{crmId:'c1',inventoryId:42}],productIds:[1],warehouseId:1,permissions:['inventory.catalog'],customerFields:['name'],expiresAt:new Date(Date.now()+86400000).toISOString()}
 return{root,broker,crm,input,snapshots}
}

test('业务插件只能注册和调用，不能管理连接；中台编辑权限及映射推进修订并保留旧记录',async()=>{
 const{root,broker,crm,input}=await fixture()
 try{
  const pluginApi=broker.publicService();assert.deepEqual(Object.keys(pluginApi).sort(),['contractVersion','register']);assert.equal(pluginApi.create,undefined);assert.equal(pluginApi.setEnabled,undefined)
  const grant=await broker.create(input),before=await readFile(join(root,'config/integration/grants.json'),'utf8')
  const state=await broker.managementSnapshot();assert.equal(state.contracts[0].title,'CRM 与进销存');assert.equal(state.connections[0].sourceTitle,'客户库');assert.equal(state.connections[0].targetTitle,'经营账套')
  assert.equal(await readFile(join(root,'config/integration/grants.json'),'utf8'),before,'查看中台不能重写旧授权')
  await assert.rejects(broker.update({id:grant.id,expectedRevision:1,input:{...input,crmAccount:'another'}}),/ACCOUNT|IDENTITY/)
  const next=await broker.update({id:grant.id,expectedRevision:1,input:{...input,permissions:['inventory.orderStatus'],customerMap:[{crmId:'c1',inventoryId:42}],productIds:[1]}})
  assert.equal(next.revision,2);assert.equal(next.id,grant.id);assert.equal(next.createdAt,grant.createdAt)
  await assert.rejects(crm.call({version:1,grantId:grant.id,accountId:'crm-main',operation:'inventory.catalog',input:{}},{}),/PERMISSION/)
  await assert.rejects(broker.update({id:grant.id,expectedRevision:1,input}),/REVISION/)
  await broker.setEnabled({id:grant.id,expectedRevision:2,enabled:false});await assert.rejects(crm.call({version:1,grantId:grant.id,accountId:'crm-main',operation:'inventory.catalog',input:{}},{}),/GRANT/)
  const audit=await broker.auditSnapshot({offset:0,limit:10});assert.ok(audit.items.some(x=>x.operation==='grant.update'));assert.ok(!JSON.stringify(audit).includes('private'))
 }finally{await broker.dispose()}
})

test('中台互通API独立核验原生管理者和CSRF；正文伪造权限不生效',async()=>{
 const{broker,input}=await fixture(),server=createServer(consoleApi({addons:{snapshot:async()=>[]},ctx:{},ready:()=>true,authorize:()=>undefined,interoperability:broker,authorizeIntegration:req=>req.headers['x-owner']==='yes'?undefined:403}))
 await new Promise(r=>server.listen(0,'127.0.0.1',r))
 try{
  const base=`http://127.0.0.1:${server.address().port}/beellix/console`,headers={'x-owner':'yes','content-type':'application/json'},state=await(await fetch(base+'/state')).json()
  assert.equal((await fetch(base+'/integrations')).status,403)
  assert.equal((await fetch(base+'/integrations/create',{method:'POST',headers,body:JSON.stringify(input)})).status,403)
  assert.equal((await fetch(base+'/integrations/create',{method:'POST',headers:{'content-type':'application/json','x-beellix-console-token':state.csrfToken},body:JSON.stringify({...input,role:'owner'})})).status,403)
  const response=await fetch(base+'/integrations/create',{method:'POST',headers:{...headers,'x-beellix-console-token':state.csrfToken},body:JSON.stringify(input)});assert.equal(response.status,200)
  const management=await(await fetch(base+'/integrations',{headers})).json();assert.equal(management.connections.length,1);assert.equal(management.authority.kind,'local-owner')
  assert.equal((await fetch(base+'/integrations/choices?contractId=beellix.crm-inventory.v1&side=source&accountId=crm-main&collection=secret',{headers})).status,400)
 }finally{await new Promise(r=>server.close(r));await broker.dispose()}
})

test('旧v1授权原字节读取兼容；不能通过停用再启用绕过过期或缺少提供方',async()=>{
 const{root,broker,input}=await fixture()
 try{
  const grant=await broker.create(input),file=join(root,'config/integration/grants.json'),store=JSON.parse(await readFile(file,'utf8'));delete store.grants[0].contractId;await writeFile(file,JSON.stringify(store,null,3));const before=await readFile(file)
  assert.equal((await broker.managementSnapshot()).connections[0].id,grant.id);assert.deepEqual(await readFile(file),before)
  await broker.setEnabled({id:grant.id,expectedRevision:1,enabled:false});const state=JSON.parse(await readFile(file,'utf8'));state.grants[0].expiresAt='2020-01-01T00:00:00Z';await writeFile(file,JSON.stringify(state));await assert.rejects(broker.setEnabled({id:grant.id,expectedRevision:2,enabled:true}),/EXPIRY/)
 }finally{await broker.dispose()}
})

test('提供方故障仍可在中台停用；映射发布失败保持拒绝，不能留下半生效连接',async()=>{
 const{broker,input,crm}=await fixture()
 try{
  const grant=await broker.create(input),provider=broker.providers.get('@beellix-ai/inventory'),accounts=provider.accounts,snapshot=provider.snapshotGrant
  provider.accounts=async()=>{throw Error('BUSINESS_OFFLINE')}
  const state=await broker.managementSnapshot();assert.equal(state.connections[0].available,false);assert.equal(state.connections[0].id,grant.id)
  await broker.setEnabled({id:grant.id,expectedRevision:1,enabled:false});await assert.rejects(broker.setEnabled({id:grant.id,expectedRevision:2,enabled:true}),/BUSINESS_OFFLINE/)
  provider.accounts=accounts;await broker.setEnabled({id:grant.id,expectedRevision:2,enabled:true});provider.snapshotGrant=async()=>{throw Error('SNAPSHOT_FAILED')}
  await assert.rejects(broker.update({id:grant.id,expectedRevision:3,input:{...input,productIds:[2]}}),/SNAPSHOT_FAILED/)
  const pending=(await broker.list())[0];assert.equal(pending.enabled,false);assert.equal(pending.status,'pending')
  await assert.rejects(crm.call({version:1,grantId:grant.id,accountId:'crm-main',operation:'inventory.catalog',input:{}},{}),/GRANT_UNAVAILABLE/)
  provider.snapshotGrant=snapshot;await broker.setEnabled({id:grant.id,expectedRevision:4,enabled:false});assert.equal((await broker.list())[0].enabled,false)
 }finally{await broker.dispose()}
})
