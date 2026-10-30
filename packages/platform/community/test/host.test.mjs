import test from 'node:test'
import assert from 'node:assert/strict'
import { apply } from '../lib/host.mjs'
import {createServer} from 'node:http'

test('宿主注册符合 DSH 前缀路由契约，能覆盖状态查询与初始化地址', async () => {
  const routes = []
  await apply({
    profileContext: {},
    get:()=>undefined,
    provide:()=>{},
    connection: { requestRejection: () => undefined },
    webServer: { register: route => { routes.push(route); return () => {} } },
    effect: callback => callback(),
  })
  assert.equal(routes.length, 2)
  const bootstrap=routes.find(route=>route.path==='/beellix/bootstrap')
  assert.equal(bootstrap.kind, 'prefix')
  // DSH WebServer 用 `${prefix}/` 匹配子路径；尾斜杠会使所有请求落入页面回退。
  for (const path of ['/beellix/bootstrap/state', '/beellix/bootstrap/initialize']) assert.ok(path.startsWith(bootstrap.path + '/'))
})

test('成包宿主在目录尚未初始化时提供独立账号入口，按DSH真实连接身份限制访问且不触碰旧凭据',async()=>{
  const routes=[],services=new Map(),effects=[];let reads=0
  await apply({profileContext:{},get:key=>{if(key==='credentials'){reads++;throw Error('must not access unconfigured credentials')}return undefined},provide:(key,value)=>services.set(key,value),connection:{requestRejection:req=>req.headers['x-denied']?401:undefined,admit:req=>({peer:{principal:{kind:req.headers['x-owner']?'owner':'guest'}}})},webServer:{register:route=>{routes.push(route);return()=>{}}},effect:fn=>effects.push(fn())})
  const handler=routes.find(row=>row.path==='/beellix/account').handler,server=createServer(handler)
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}/beellix/account`
  try{
    assert.equal(services.get('beellixAccount').begin,undefined)
    assert.equal((await fetch(base+'/state')).status,403)
    assert.equal((await fetch(base+'/state',{headers:{'x-denied':'yes','x-owner':'yes'}})).status,401)
    const state=await(await fetch(base+'/state',{headers:{'x-owner':'yes'}})).json()
    assert.equal(state.status,'unconfigured');assert.equal(state.canLogin,false)
    const response=await fetch(base+'/login',{method:'POST',headers:{'x-owner':'yes','content-type':'application/json','x-beellix-account-token':state.csrfToken},body:'{}'})
    assert.equal(response.status,503);assert.equal((await response.json()).error.reason,'ACCOUNT_NOT_CONFIGURED');assert.equal(reads,0)
  }finally{await new Promise(r=>server.close(r));for(const dispose of effects.reverse())dispose?.()}
})
