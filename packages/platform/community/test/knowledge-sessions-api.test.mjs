import test from 'node:test'
import assert from 'node:assert/strict'
import {createServer} from 'node:http'
import {knowledgeSessionsApi} from '../src/knowledge-sessions-api.mjs'
test('知识选择接口默认拒绝无授权连接，操作令牌按字节校验，不向模型开放写入',async()=>{
 let saved=0
 const store={read:async()=>({enabled:false,revision:0}),select:async()=>{saved++;return{enabled:true,revision:1}}}
 for(const authorize of [undefined,()=>403,()=>undefined]){
  const server=createServer(knowledgeSessionsApi({store,authorize}));await new Promise(r=>server.listen(0,'127.0.0.1',r))
  try{const url='http://127.0.0.1:'+server.address().port+'/beellix/knowledge-sessions/',state=await fetch(url+'state?sessionId=a')
   if(!authorize){assert.equal(state.status,503);continue}if(authorize()===403){assert.equal(state.status,403);continue}
   const token=(await state.json()).csrfToken
   for(const value of ['',token.slice(1),Array(64).fill('é').join('')])assert.equal((await fetch(url+'selection',{method:'POST',headers:{'x-beellix-knowledge-token':value,'content-type':'application/json'},body:'{}'})).status,403)
   assert.equal(saved,0);assert.equal((await fetch(url+'selection',{method:'POST',headers:{'x-beellix-knowledge-token':token,'content-type':'application/json'},body:'{}'})).status,200);assert.equal(saved,1)
  }finally{await new Promise(r=>server.close(r))}
 }
})
