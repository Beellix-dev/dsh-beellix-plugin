import test from 'node:test'
import assert from 'node:assert/strict'
import {createServer} from 'node:http'
import {consoleApi} from '../src/console-api.mjs'

const fixture=async()=>{
 const {OfficialModels}=await import('../src/official-models.mjs')
 const requests=[]
 const profile={apiKeyEnv:'TEST_KEY'}
 const services={llm:{listConfigurableProviders:()=>[{provider:'deepseek-official',displayName:'DeepSeek',settingsNs:'ds',settingsPath:[]}]},settings:{describe:()=>[{ns:'ds',value:profile}]},credentials:{resolve:async()=>({value:'never-return-this-secret'})}};const ctx={get:name=>services[name]}
 const fetcher=async(url,options)=>{requests.push({url,options});if(url.endsWith('/models'))return Response.json({data:[{id:'deepseek-flash',name:'Flash'}]});if(url.endsWith('/user/balance'))return Response.json({is_available:true,balance_infos:[{currency:'CNY',total_balance:'10.25',granted_balance:'0',topped_up_balance:'10.25'}]});return new Response('<html>changed pricing document</html>')}
 return{official:new OfficialModels(ctx,{fetch:fetcher}),requests,profile}
}
test('官方模型和余额复用已配置凭据，响应不泄露密钥；未开放账单接口不能返回伪造的零用量',async()=>{
 const {official,requests}=await fixture(),state=await official.snapshot()
 const row=state.items[0]
 assert.equal(row.models.status,'ready');assert.equal(row.balance.value[0].total_balance,'10.25')
 assert.equal(row.usage.status,'unsupported');assert.equal(row.prices.status,'unavailable')
 assert.ok(!JSON.stringify(state).includes('never-return-this-secret'))
 assert.ok(requests.every(x=>new URL(x.url).hostname.endsWith('deepseek.com')))
 assert.equal(requests.find(x=>x.url.endsWith('/models')).options.headers.Authorization,'Bearer never-return-this-secret')
})
test('配置指向中转地址时不把该密钥发到原厂，错误、重定向和未知字段不伪装同步成功',async()=>{
 const {official,requests,profile}=await fixture();profile.baseURL='https://gateway.example/v1'
 assert.equal((await official.snapshot()).items[0].balance.status,'unsupported');assert.equal(requests.length,0)
 delete profile.baseURL;official.fetch=async()=>new Response('',{status:401})
 assert.equal((await official.snapshot({refresh:true})).items[0].balance.status,'unauthorized')
 official.fetch=async()=>Response.json({balance_infos:[{currency:'CNY',total_balance:'bad'}]})
 assert.equal((await official.snapshot({refresh:true})).items[0].balance.status,'unavailable')
})

test('官方查询仍要求 DSH 连接授权，场景全局保存要求操作令牌且不接收任意字段',async()=>{
 let reads=0,writes=0
 const server=createServer(consoleApi({ctx:{},addons:{snapshot:async()=>[]},ready:()=>true,authorize:req=>req.headers['x-owner']==='yes'?undefined:403,officialModels:{snapshot:async()=>{reads++;return{items:[]}}},sceneModels:{snapshot:async()=>({scenes:[]}),save:async input=>{assert.deepEqual(input,{sceneId:'quote',selection:null,expectedRevision:0});writes++;return{application:'applied'}}}}))
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
 try{
  const base=`http://127.0.0.1:${server.address().port}/beellix/console`
  assert.equal((await fetch(base+'/models/official')).status,403);assert.equal(reads,0)
  assert.equal((await fetch(base+'/models/official',{headers:{'x-owner':'yes'}})).status,200);assert.equal(reads,1)
  const {csrfToken}=await(await fetch(base+'/state',{headers:{'x-owner':'yes'}})).json()
  const headers={'x-owner':'yes','content-type':'application/json'},body=JSON.stringify({sceneId:'quote',selection:null,expectedRevision:0})
  assert.equal((await fetch(base+'/models/scenes',{method:'POST',headers,body})).status,403);assert.equal(writes,0)
  assert.equal((await fetch(base+'/models/scenes',{method:'POST',headers:{...headers,'x-beellix-console-token':csrfToken},body})).status,200);assert.equal(writes,1)
 }finally{await new Promise(resolve=>server.close(resolve))}
})

test('账户认证路线不借用其他 DeepSeek API Key 冒充自己的余额',async()=>{
 const {official,requests}=await fixture()
 official.ctx.get('llm').listConfigurableProviders=()=>[{provider:'deepseek-account',settingsNs:'ds',settingsPath:[]}]
 assert.equal((await official.snapshot()).items[0].balance.status,'unsupported');assert.equal(requests.length,0)
})
