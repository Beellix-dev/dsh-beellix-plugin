import test from 'node:test'
import assert from 'node:assert/strict'
import {createServer} from 'node:http'
import {createApiHandler} from '../src/api.mjs'
test('中台更新在未初始化时可检查，只接受原生主用户、CSRF 与固定动作，不泄露安装输出',async()=>{
 const calls=[],selfUpdate={snapshot:async()=>({status:'unchecked'}),check:async input=>{calls.push(input);return{status:'available'}},install:async()=>{throw Error('private install path and token')},restart:async()=>({status:'restart-required'})}
 const server=createServer(createApiHandler({store:{state:()=>({status:'uninitialized'})},version:'0.1.1',authorize:()=>undefined,authorizeUpdate:req=>req.headers['x-owner']==='yes'?undefined:403,selfUpdate}))
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}/beellix/bootstrap/update/`
 try{
  assert.equal((await fetch(base+'state')).status,403)
  const headers={'x-owner':'yes'},state=await(await fetch(base+'state',{headers})).json()
  assert.equal(state.status,'unchecked');assert.ok(state.csrfToken)
  const post=(action,token=state.csrfToken)=>fetch(base+action,{method:'POST',headers:{...headers,'content-type':'application/json','x-beellix-bootstrap-token':token},body:'{}'})
  assert.equal((await post('check','wrong')).status,403);assert.equal(calls.length,0)
  assert.equal((await post('check')).status,200);assert.deepEqual(calls,[{}])
  assert.equal((await post('arbitrary-command')).status,404)
  const error=await post('install');assert.equal(error.status,500);assert.doesNotMatch(await error.text(),/private|token/)
 }finally{await new Promise(r=>server.close(r))}
})
