import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,mkdir,readFile,writeFile} from 'node:fs/promises'
import {resolve,join} from 'node:path'
import {createServer} from 'node:http'
import {LocalDataAccess} from "../../../../dev/shared/runtime/local-data-access.mjs"
import {consoleApi} from '../src/console-api.mjs'

async function fixture(){
 const root=await mkdtemp(resolve("./dev/artifacts/local-owner-")),directory=join(root,'inventory');await mkdir(directory)
 const owned=[{name:'@beellix-ai/inventory',id:'inventory',directory,enabled:true,title:'进销存'}],agents=new Map(['workspace','scene','child'].map(id=>[id,{id}])),calls=[]
 const resolveAgent=agent=>{if(agents.get(agent?.id)!==agent)throw Error('DATA_IDENTITY');return{principal:'owner',subject:agent.id==='scene'?'@beellix-ai/inventory':'workspace',sessionId:agent.id,identity:agent.id,readOnly:agent.id==='child'}}
 const access=new LocalDataAccess(root,{owned:async()=>owned,resolveAgent}),accounts=[{instanceId:'one',title:'我的账套'},{instanceId:'two',title:'其他账套'}]
 const register=(service=access)=>service.register({packageName:owned[0].name,packageDirectory:directory,accounts:async()=>accounts,resources:[{id:'inventory.business',title:'进销存业务',actions:['read','write','export'],invoke:async(packet,ctx)=>{calls.push(packet);await ctx.validate();return{items:[{name:'商品'}]}}}]})
 const provider=await register();return{root,access,provider,owned,agents,calls,register,accounts,resolveAgent}
}
const packet={resource:'inventory.business',action:'read',accountId:'one',input:{action:'list'}}

test('本机主用户默认全权，工作区与场景无需插件授权；新增和恢复账套同样可用',async()=>{
 const f=await fixture()
 try{
  for(const name of ['workspace','scene']){
   const api=f.access.publicService().forAgent(f.agents.get(name)),rows=(await api.catalog()).resources
   assert.deepEqual(rows[0].actions,['read','write','export']);assert.deepEqual(rows[0].accounts.map(a=>a.instanceId),['one','two'])
   for(const action of ['read','write','export'])assert.equal((await api.call({...packet,action})).items[0].name,'商品')
  }
  f.accounts.push({instanceId:'restored',title:'恢复副本'})
  assert.equal((await f.access.publicService().forAgent(f.agents.get('workspace')).call({...packet,accountId:'restored'})).items.length,1)
  await assert.rejects(f.access.publicService().forAgent(f.agents.get('workspace')).call({...packet,accountId:'missing'}),/DATA_ACCOUNT_FORBIDDEN/)
  assert.equal(f.access.publicService().save,undefined)
 }finally{await f.access.dispose()}
})

test('不读取或重写上一轮错误插件策略；重启后无需重新配置，假Agent和自报身份仍被拒绝',async()=>{
 const f=await fixture(),path=join(f.root,'config/permissions/policies.json');await mkdir(join(f.root,'config/permissions'),{recursive:true});const old='historical policy file is left byte-for-byte';await writeFile(path,old)
 try{
  await f.access.publicService().forAgent(f.agents.get('workspace')).call(packet)
  await assert.rejects(f.access.publicService().forAgent({id:'workspace'}).call(packet),/DATA_IDENTITY/)
  await assert.rejects(f.access.publicService().forAgent({id:'workspace'}).catalog(),/DATA_IDENTITY/)
  await assert.rejects(f.access.publicService().forAgent(f.agents.get('workspace')).call({...packet,principal:'owner'}),/DATA_REQUEST/)
  await f.access.dispose();f.access=new LocalDataAccess(f.root,{owned:async()=>f.owned,resolveAgent:f.resolveAgent});await f.register(f.access)
  assert.equal((await f.access.publicService().forAgent(f.agents.get('workspace')).call(packet)).items.length,1)
  assert.equal(await readFile(path,'utf8'),old)
  const audit=await readFile(join(f.root,'data/permissions/audit.jsonl'),'utf8');assert.ok(audit.includes('"principal":"owner"'));assert.equal(audit.includes('商品'),false)
 }finally{await f.access.dispose()}
})

test('默认全权仍遵循原生只读、插件停用、取消和会话变化；不交付过期在途结果',async()=>{
 const f=await fixture(),api=f.access.publicService().forAgent(f.agents.get('workspace'))
 try{
  await assert.rejects(f.access.publicService().forAgent(f.agents.get('child')).call({...packet,action:'write'}),/DATA_READ_ONLY/)
  f.owned[0].enabled=false;await assert.rejects(api.call(packet),/DATA_PROVIDER_UNAVAILABLE/);f.owned[0].enabled=true
  let release,started;const entered=new Promise(r=>started=r),pending=f.access.guardAgent(f.agents.get('workspace'),{resource:packet.resource,action:packet.action,accountId:packet.accountId},async()=>{started();await new Promise(r=>release=r);return{ok:true}})
  await entered;f.provider.dispose();release();await assert.rejects(pending,/DATA_SCOPE_CHANGED/)
  f.provider=await f.register();const controller=new AbortController();controller.abort(Error('cancelled'));await assert.rejects(api.call(packet,{signal:controller.signal}),/cancelled/)
  const old=f.agents.get('workspace');f.agents.set('workspace',{id:'workspace'});await assert.rejects(f.access.publicService().forAgent(old).call(packet),/DATA_IDENTITY/)
 }finally{await f.access.dispose()}
})

test('多余插件权限配置接口已移除，原生中台连接校验与CSRF仍生效',async()=>{
 const server=createServer(consoleApi({addons:{snapshot:async()=>[]},ctx:{},ready:()=>true,authorize:req=>req.headers['x-local-owner']==='yes'?undefined:403}));await new Promise(r=>server.listen(0,'127.0.0.1',r))
 try{
  const base=`http://127.0.0.1:${server.address().port}/beellix/console`,headers={'x-local-owner':'yes'},token=(await(await fetch(base+'/state',{headers})).json()).csrfToken
  assert.equal((await fetch(base+'/permissions')).status,403)
  assert.equal((await fetch(base+'/permissions',{headers})).status,404)
  assert.equal((await fetch(base+'/permissions/save',{method:'POST',headers,body:'{}'})).status,403)
  assert.equal((await fetch(base+'/permissions/save',{method:'POST',headers:{...headers,'content-type':'application/json','x-beellix-console-token':token},body:'{}'})).status,404)
 }finally{await new Promise(r=>server.close(r))}
})
