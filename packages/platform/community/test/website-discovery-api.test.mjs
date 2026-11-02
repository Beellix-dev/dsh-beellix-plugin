import test from 'node:test'
import assert from 'node:assert/strict'
import {createServer} from 'node:http'
import {consoleApi} from '../src/console-api.mjs'
test('官网目录由客户端原接口读取，预览与安装保持连接授权、owner及CSRF约束',async()=>{
 const calls=[],discovery={list:async input=>{calls.push(['list',input]);return{items:[{id:'web-only'}],total:1}},detail:async id=>({id}),preview:async input=>{calls.push(['preview',input]);return{confirmation:{id:input.id}}},install:async input=>{calls.push(['install',input]);return{application:'applied'}}}
 const server=createServer(consoleApi({ctx:{},addons:{snapshot:async()=>[]},discovery,authorizeDiscovery:req=>req.headers['x-owner']==='yes'?undefined:403,ready:()=>true,authorize:req=>req.headers['x-connection']==='yes'?undefined:403}));await new Promise(r=>server.listen(0,'127.0.0.1',r))
 try{const base=`http://127.0.0.1:${server.address().port}/beellix/console`,headers={'x-connection':'yes','content-type':'application/json'}
  assert.equal((await fetch(base+'/discovery')).status,403)
  const list=await(await fetch(base+'/discovery?q=hello&offset=20',{headers})).json();assert.equal(list.items[0].id,'web-only');assert.equal(calls[0][1].q,'hello');assert.equal(calls[0][1].offset,20)
  const state=await(await fetch(base+'/state',{headers})).json()
  for(const route of ['preview','install']){
   assert.equal((await fetch(base+'/discovery/'+route,{method:'POST',headers:{...headers,'x-beellix-console-token':state.csrfToken},body:'{"id":"one"}'})).status,403)
   assert.equal((await fetch(base+'/discovery/'+route,{method:'POST',headers:{...headers,'x-owner':'yes'},body:'{"id":"one"}'})).status,403)
   assert.equal((await fetch(base+'/discovery/'+route,{method:'POST',headers:{...headers,'x-owner':'yes','x-beellix-console-token':state.csrfToken},body:'{"id":"one"}'})).status,200)
  }
 }finally{await new Promise(r=>server.close(r))}
})
