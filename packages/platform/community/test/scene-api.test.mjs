import test from 'node:test'
import assert from 'node:assert/strict'
import {createServer} from 'node:http'
import {sceneApi} from '../src/scene-api.mjs'
test('场景导航沿宿主授权且创建请求需要令牌，不接受额外目录字段',async t=>{
  let calls=0
  const store={snapshot:async()=>({revision:0,scenes:[],installed:[],links:{}}),createSession:async packet=>{assert.deepEqual(Object.keys(packet),['sceneId','requestId']);calls++;return{sessionId:'native-1'}},createWorkspaceSession:async packet=>{assert.deepEqual(Object.keys(packet),['agentPreset','requestId']);calls++;return{sessionId:'workspace-1'}}}
  const server=createServer(sceneApi({store,authorize:req=>req.headers['x-test']==='yes'?undefined:403}));await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));t.after(()=>server.close())
  const base='http://127.0.0.1:'+server.address().port+'/beellix/scenes/',headers={'x-test':'yes','content-type':'application/json'}
  assert.equal((await fetch(base+'state')).status,403)
  const state=await(await fetch(base+'state',{headers})).json(),body=JSON.stringify({sceneId:'smart-quotation',requestId:'new-1'})
  assert.equal((await fetch(base+'create-session',{method:'POST',headers,body})).status,403)
  const reply=await fetch(base+'create-session',{method:'POST',headers:{...headers,'x-beellix-scenes-token':state.csrfToken},body});assert.equal(reply.status,200);assert.equal(calls,1)
  assert.equal((await fetch(base+'create-session',{method:'POST',headers:{...headers,'x-beellix-scenes-token':state.csrfToken},body:JSON.stringify({sceneId:'smart-quotation',requestId:'bad',cwd:'C:/'})})).status,400);assert.equal(calls,1)
  const workspaceBody=JSON.stringify({agentPreset:'standard',requestId:'workspace-1'})
  assert.equal((await fetch(base+'create-workspace-session',{method:'POST',headers,body:workspaceBody})).status,403)
  assert.equal((await fetch(base+'create-workspace-session',{method:'POST',headers:{...headers,'x-beellix-scenes-token':state.csrfToken},body:workspaceBody})).status,200);assert.equal(calls,2)
})

test('选择本机工作区需要 owner 授权；通过后只转交原生 workspaceId',async t=>{
 const calls=[],store={snapshot:async()=>({}),createSession:async packet=>{calls.push(packet);return{sessionId:'scene-picked'}}}
 const server=createServer(sceneApi({store,authorize:()=>undefined,authorizeDirectory:req=>req.headers['x-owner']==='yes'?undefined:403}));await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));t.after(()=>server.close())
 const base='http://127.0.0.1:'+server.address().port+'/beellix/scenes/',state=await(await fetch(base+'state')).json(),headers={'content-type':'application/json','x-beellix-scenes-token':state.csrfToken},input={sceneId:'quote',requestId:'picked',workspaceId:'native-id'}
 assert.equal((await fetch(base+'create-session',{method:'POST',headers,body:JSON.stringify(input)})).status,403);assert.deepEqual(calls,[])
 assert.equal((await fetch(base+'create-session',{method:'POST',headers:{...headers,'x-owner':'yes'},body:JSON.stringify(input)})).status,200);assert.deepEqual(calls,[input])
})
