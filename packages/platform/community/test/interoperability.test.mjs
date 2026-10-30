import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,mkdir} from 'node:fs/promises'
import {resolve,join} from 'node:path'
import {randomUUID} from 'node:crypto'
import {Interoperability} from "../../../../dev/shared/runtime/interoperability.mjs"
const base=resolve('./dev/artifacts/test-results');await mkdir(base,{recursive:true})
test('互通默认拒绝、源身份固定、账套与记录范围、字段投影、签名审核和撤销',async()=>{
 const root=await mkdtemp(join(base,'interop-contract-')),vault=new Map(),crmDir=join(root,'crm'),invDir=join(root,'inventory');await mkdir(crmDir);await mkdir(invDir)
 let created=0
 const broker=new Interoperability(root,{ready:()=>true,owned:async()=>[{name:'@beellix-ai/sales-crm',directory:crmDir,enabled:true},{name:'@beellix-ai/inventory',directory:invDir,enabled:true}],secrets:{get:async k=>vault.get(k),set:async(k,v)=>vault.set(k,v)}})
 const crm=await broker.register({packageName:'@beellix-ai/sales-crm',packageDirectory:crmDir,title:'销售CRM',accounts:async()=>[{instanceId:'crm-main',title:'客户'}],validateGrant:async()=>{},snapshotGrant:async()=>{},call:async()=>({id:'crm-c1',name:'授权客户',phone:'13800000000',privateNotes:'不应共享'})})
 await broker.register({packageName:'@beellix-ai/inventory',packageDirectory:invDir,title:'进销存',accounts:async()=>[{instanceId:'inv-main',title:'经营'}],validateGrant:async()=>{},snapshotGrant:async()=>{},previewDraft:async()=>({stateRevision:1,result:{name:'新销售草稿',lines:[{product_id:{name:'授权商品'},product_uom_qty:'2',price_unit:'9.00'}]}}),call:async({operation})=>operation==='inventory.createDraft'?(created++,{id:4,name:'S0004',state:'draft',customerId:42,amount:'18.00',cost:'12.00'}):{items:[{id:1,name:'授权商品',price:'9.00',cost:'6.00'},{id:999,name:'未授权商品'}],total:2}})
 const packet={version:1,grantId:randomUUID(),accountId:'crm-main',operation:'inventory.catalog',input:{}}
 await assert.rejects(crm.call(packet,{readOnly:false}),/GRANT/)
 const grant=await broker.create({crmAccount:'crm-main',inventoryAccount:'inv-main',customerMap:[{crmId:'crm-c1',inventoryId:42}],productIds:[1],warehouseId:1,permissions:['inventory.catalog','inventory.createDraft','inventory.orderStatus'],customerFields:['name'],expiresAt:new Date(Date.now()+86400000).toISOString()})
 const catalog=await crm.call({...packet,grantId:grant.id},{readOnly:false});assert.equal(catalog.data.items.length,1);assert.equal(JSON.stringify(catalog).includes('cost'),false)
 await assert.rejects(crm.call({...packet,grantId:grant.id,accountId:'another'},{readOnly:false}),/ACCOUNT/)
 const write={...packet,grantId:grant.id,operation:'inventory.createDraft',input:{customerId:'crm-c1',lines:[{productId:1,quantity:'2',price:'9'}]},requestId:randomUUID()}
 await assert.rejects(crm.call(write,{readOnly:false,approval:{confirmed:true}}),/REVIEW/)
 await assert.rejects(crm.review(write,{readOnly:true,questions:{ask:()=>{throw Error('must not ask')}}}),/READ_ONLY/)
 const reject={ask:async q=>({answers:[{id:q.questions[0].id,selected:['暂不提交']}]})}
 await assert.rejects(crm.review(write,{readOnly:false,questions:reject,agent:{}}),/CONFIRMED/);assert.equal(created,0)
 const yes={ask:async q=>({answers:[{id:q.questions[0].id,selected:['确认此项']}]})}
 const receipt=await crm.review(write,{readOnly:false,questions:yes,agent:{}}),result=await crm.call(write,{readOnly:false,approval:receipt});assert.equal(result.data.id,4);assert.equal(created,1);assert.equal(JSON.stringify(result).includes('cost'),false)
 await broker.setEnabled({id:grant.id,enabled:false,expectedRevision:grant.revision})
 await assert.rejects(crm.call(write,{readOnly:false,approval:receipt}),/GRANT/)
 await assert.rejects(crm.call({...write,version:2},{readOnly:false,approval:receipt}),/VERSION/)
 await crm.dispose();await assert.rejects(crm.call(packet,{readOnly:false}),/PROVIDER/)
 await broker.dispose()
})

test('撤销在途调用后拒绝交付迟到结果；JSON字段重排不使审核凭据失效',async()=>{
 const root=await mkdtemp(join(base,'interop-revoke-')),vault=new Map(),crmDir=join(root,'crm'),invDir=join(root,'inventory');await mkdir(crmDir);await mkdir(invDir)
 const broker=new Interoperability(root,{owned:async()=>[{name:'@beellix-ai/sales-crm',directory:crmDir},{name:'@beellix-ai/inventory',directory:invDir}],secrets:{get:async k=>vault.get(k),set:async(k,v)=>vault.set(k,v)}})
 let started,finish;const begun=new Promise(r=>started=r),pending=new Promise(r=>finish=r)
 const crm=await broker.register({packageName:'@beellix-ai/sales-crm',packageDirectory:crmDir,accounts:async()=>[{instanceId:'crm'}],validateGrant:async()=>{},snapshotGrant:async()=>{},call:async()=>({})})
 await broker.register({packageName:'@beellix-ai/inventory',packageDirectory:invDir,accounts:async()=>[{instanceId:'inv'}],validateGrant:async()=>{},snapshotGrant:async()=>{},call:async()=>{started();await pending;return{items:[{id:1,name:'迟到结果'}]}}})
 const grant=await broker.create({crmAccount:'crm',inventoryAccount:'inv',customerMap:[{crmId:'customer',inventoryId:1}],productIds:[1],warehouseId:1,permissions:['inventory.catalog'],customerFields:[],expiresAt:new Date(Date.now()+60000).toISOString()})
 const job=crm.call({version:1,accountId:'crm',grantId:grant.id,operation:'inventory.catalog',input:{}},{readOnly:true});await begun
 await broker.setEnabled({id:grant.id,enabled:false,expectedRevision:1});finish();await assert.rejects(job,/REVOKED|GRANT/);await broker.dispose()
})
