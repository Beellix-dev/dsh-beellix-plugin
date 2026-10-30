import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,mkdir,writeFile,readFile} from 'node:fs/promises'
import {join,resolve} from 'node:path'
import {createHash} from 'node:crypto'
import {SceneNavigationStore} from '../src/scenes.mjs'

async function fixture(){
  const root=await mkdtemp(resolve(import.meta.dirname,"../../../../dev/artifacts/test-results/scene-nav-"))
  await mkdir(join(root,'config'));await mkdir(join(root,'data/smart-quotation/sessions'),{recursive:true})
  const catalog=async()=>[{id:'smart-quotation',title:'装修智能报价',packageName:'@beellix-ai/smart-quotation',version:'0.14.9',enabled:true,tabKind:'beellix-quotation'}]
  let creations=0;const workspaces=[]
  const workspace=async request=>{workspaces.push(request);return{workspace:{workspaceId:'native-scene-workspace'}}}
  const create=async request=>{assert.equal(request.workspaceId,'native-scene-workspace');assert.equal(request.cwd,undefined);assert.equal(request.agentPreset,'standard');creations++;return{sessionId:request.sessionId}}
  const store=new SceneNavigationStore(root,{catalog,create,workspace})
  return{root,store,catalog,create,workspace,workspaces,creations:()=>creations}
}

test('普通入口创建独立工作区会话，不改旧场景导航、绑定或业务文件',async()=>{
  const root=await mkdtemp(resolve(import.meta.dirname,"../../../../dev/artifacts/test-results/workspace-mode-")),calls=[]
  await mkdir(join(root,'config'));const path=join(root,'config/scene-navigation.json'),bytes=JSON.stringify({schemaVersion:1,revision:2,added:[],links:{legacy:'smart-quotation'},requests:[]});await writeFile(path,bytes)
  const store=new SceneNavigationStore(root,{catalog:async()=>[],workspace:async value=>{calls.push(value);return{workspace:{workspaceId:'workspace'}}},create:async value=>{calls.push(value);return{sessionId:value.sessionId}}})
  const result=await store.createWorkspaceSession({agentPreset:'ptc',requestId:'request-1'})
  assert.equal(calls[0].path,join(root,'files/workspace'));assert.equal(calls[1].agentPreset,'ptc');assert.equal(calls[1].workspaceId,'workspace');assert.equal(result.sessionId,calls[1].sessionId)
  assert.equal(await readFile(path,'utf8'),bytes)
  await assert.rejects(store.createWorkspaceSession({agentPreset:'beellix-scene',requestId:'request-2'}),/MODE_INVALID/)
})
test('添加已安装场景仅保存入口，发现已有业务会话，不复制原记录',async()=>{
  const f=await fixture(),recordPath=join(f.root,'data/smart-quotation/sessions/existing.json'),bytes=JSON.stringify({schemaVersion:1,sessionId:'old-session',record:{revision:4},requests:[]})
  await writeFile(recordPath,bytes)
  const first=await f.store.add({sceneId:'smart-quotation',expectedRevision:0})
  assert.equal(first.scenes[0].id,'smart-quotation');assert.equal(first.links['old-session'],'smart-quotation');assert.equal(f.creations(),0)
  assert.equal(await readFile(recordPath,'utf8'),bytes)
  const reopened=new SceneNavigationStore(f.root,{catalog:f.catalog,create:f.create})
  assert.deepEqual((await reopened.snapshot()).links,first.links)
  await assert.rejects(f.store.add({sceneId:'not-installed',expectedRevision:1}),/SCENE_NOT_INSTALLED/)
  await assert.rejects(f.store.add({sceneId:'smart-quotation',expectedRevision:0}),/REVISION_CONFLICT/)
})
test('同一场景多次新建使用不同原生会话，重试不会重复创建，路径由宿主确定',async()=>{
  const f=await fixture();await f.store.add({sceneId:'smart-quotation',expectedRevision:0})
  const first=await f.store.createSession({sceneId:'smart-quotation',requestId:'create-1'})
  assert.equal((await f.store.createSession({sceneId:'smart-quotation',requestId:'create-1'})).sessionId,first.sessionId)
  const second=await f.store.createSession({sceneId:'smart-quotation',requestId:'create-2'})
  assert.notEqual(first.sessionId,second.sessionId);assert.equal(f.creations(),2)
  assert.deepEqual(f.workspaces,[{path:join(f.root,'files/scenes/smart-quotation',first.sessionId)},{path:join(f.root,'files/scenes/smart-quotation',second.sessionId)}])
  const state=await f.store.snapshot();assert.equal(state.links[first.sessionId],'smart-quotation');assert.equal(state.links[second.sessionId],'smart-quotation')
  await assert.rejects(f.store.createSession({sceneId:'../escape',requestId:'bad'}),/SCENE_NOT_ADDED/)
  await assert.rejects(f.store.createSession({sceneId:'smart-quotation',requestId:'bad',cwd:'C:/'}),/INPUT_INVALID/)
})
test('未启用场景不能假装可用，已有会话关联仍保留',async()=>{
  const f=await fixture();await f.store.add({sceneId:'smart-quotation',expectedRevision:0})
  const disabled=new SceneNavigationStore(f.root,{catalog:async()=>[{...(await f.catalog())[0],enabled:false}],create:f.create})
  assert.equal((await disabled.snapshot()).scenes[0].enabled,false)
  await assert.rejects(disabled.createSession({sceneId:'smart-quotation',requestId:'disabled'}),/SCENE_DISABLED/)
})

test('移除导航入口不卸载插件、不删会话、绑定或业务文件，重新添加可恢复',async()=>{
 const f=await fixture(),file=join(f.root,'data/smart-quotation/sessions/retained.json'),bytes=JSON.stringify({schemaVersion:1,sessionId:'retained-session',record:{revision:8}})
 await writeFile(file,bytes);await f.store.add({sceneId:'smart-quotation',expectedRevision:0})
 const before=await f.store.load()
 await assert.rejects(f.store.remove({sceneId:'smart-quotation',expectedRevision:0}),/REVISION_CONFLICT/)
 const removed=await f.store.remove({sceneId:'smart-quotation',expectedRevision:before.revision})
 assert.equal(removed.scenes.length,0);assert.deepEqual(removed.links,before.links);assert.equal(await readFile(file,'utf8'),bytes)
 const added=await f.store.add({sceneId:'smart-quotation',expectedRevision:removed.revision});assert.equal(added.scenes.length,1);assert.deepEqual(added.links,before.links)
})

test('丢失原生对话时接回业务记录，不改写原件；对话读取失败不能冒充丢失',async()=>{
  const f=await fixture(),sessionId='old-native-session',file=join(f.root,'data/smart-quotation/sessions',createHash('sha256').update(sessionId).digest('hex')+'.json')
  const bytes=JSON.stringify({schemaVersion:1,sessionId,record:{revision:4},requests:[]});await writeFile(file,bytes)
  await f.store.add({sceneId:'smart-quotation',expectedRevision:0})
  assert.deepEqual((await f.store.snapshot()).retainedSessionIds,[sessionId])
  const bound=[],store=new SceneNavigationStore(f.root,{catalog:f.catalog,create:f.create,workspace:f.workspace,inspect:async()=>null,bindings:{load:async()=>({bindings:{}}),bind:async value=>bound.push(value)}})
  const request={sceneId:'smart-quotation',sessionId,requestId:'recover-1'}
  const restored=await store.reconnectSession(request)
  assert.notEqual(restored.sessionId,sessionId);assert.equal(bound[0].businessSessionId,sessionId)
  assert.equal((await store.reconnectSession(request)).sessionId,restored.sessionId)
  assert.equal((await store.snapshot()).recoveries[sessionId],restored.sessionId)
  assert.equal(await readFile(file,'utf8'),bytes);assert.equal(f.creations(),1)
  const blocked=new SceneNavigationStore(f.root,{catalog:f.catalog,create:f.create,workspace:f.workspace,inspect:async()=>{throw Error('connection failure')}})
  await assert.rejects(blocked.reconnectSession({...request,requestId:'recover-2'}),/connection failure/);assert.equal(f.creations(),1)
  await assert.rejects(store.reconnectSession({...request,sessionId:'unrelated'}),/SCENE_SESSION_UNKNOWN/)
})

test('原会话仍在旧工作区时接回当前目录，保留业务 ID 和原对话，不复用失效 cwd',async()=>{
  const f=await fixture(),sessionId='old-path-session',file=join(f.root,'data/smart-quotation/sessions',createHash('sha256').update(sessionId).digest('hex')+'.json')
  const bytes=JSON.stringify({schemaVersion:1,sessionId,record:{revision:7},requests:[]});await writeFile(file,bytes);await f.store.add({sceneId:'smart-quotation',expectedRevision:0})
  const oldRoot=resolve(f.root,'../old-place'),bound=[]
  const originalCwd=join(oldRoot,'files/scenes/smart-quotation'),cwd=process.platform==='win32'?originalCwd.toUpperCase():originalCwd
  const store=new SceneNavigationStore(f.root,{catalog:f.catalog,create:f.create,workspace:f.workspace,previousRoots:()=>[oldRoot],inspect:async()=>({meta:{cwd}}),bindings:{load:async()=>({bindings:{}}),bind:async value=>bound.push(value)}})
  const result=await store.reconnectSession({sceneId:'smart-quotation',sessionId,requestId:'move-1'})
  assert.notEqual(result.sessionId,sessionId);assert.equal(bound[0].businessSessionId,sessionId)
  assert.equal(f.workspaces[0].path,join(f.root,'files/scenes/smart-quotation',result.sessionId));assert.equal(await readFile(file,'utf8'),bytes)
})

test('早期普通工作区的旧报价保留有效自选目录，不按目录重建会话',async()=>{
  const f=await fixture(),sessionId='legacy-workspace-quote',file=join(f.root,'data/smart-quotation/sessions',createHash('sha256').update(sessionId).digest('hex')+'.json')
  const bytes=JSON.stringify({schemaVersion:1,sessionId,record:{revision:4},requests:[]});await writeFile(file,bytes);await f.store.add({sceneId:'smart-quotation',expectedRevision:0})
  const bound=[],bindings={load:async()=>({bindings:{[sessionId]:{businessSessionId:sessionId,attachmentSessionId:sessionId}}}),bind:async value=>bound.push(value)}
  const cwd=join(f.root,'legacy-workspace');await mkdir(cwd)
  const before=await readFile(f.store.path,'utf8')
  const store=new SceneNavigationStore(f.root,{catalog:f.catalog,create:f.create,workspace:f.workspace,bindings,inspect:async()=>({meta:{cwd}})})
  const result=await store.reconnectSession({sceneId:'smart-quotation',sessionId,requestId:'legacy-1'})
  assert.equal(result.sessionId,sessionId);assert.equal(result.restored,false);assert.deepEqual(bound,[])
  assert.equal(await readFile(file,'utf8'),bytes);assert.equal(await readFile(f.store.path,'utf8'),before);assert.equal(f.creations(),0)
})

test('原生选择的工作区仍创建标准场景会话，归属不依赖目录；请求重试冻结目录',async()=>{
 const f=await fixture();await f.store.add({sceneId:'smart-quotation',expectedRevision:0})
 const cwd=join(f.root,'chosen-project');await mkdir(cwd);let path=cwd,fail=true
 const bindings=[],store=new SceneNavigationStore(f.root,{catalog:f.catalog,workspace:f.workspace,resolveWorkspace:async id=>id==='chosen'?{workspaceId:id,path}:undefined,bindings:{load:async()=>({bindings:{}}),bind:async row=>bindings.push(row)},create:async request=>{assert.equal(request.workspaceId,'chosen');assert.equal(request.agentPreset,'standard');if(fail)throw Error('temporary');return{sessionId:request.sessionId}}})
 const input={sceneId:'smart-quotation',requestId:'pick-directory',workspaceId:'chosen'}
 await assert.rejects(store.createSession(input),/temporary/)
 const pending=await store.load();assert.equal(pending.requests[0].status,'pending')
 await assert.rejects(store.createSession({...input,workspaceId:'other'}),/REQUEST_ID_CONFLICT/)
 path=join(f.root,'another-project');await mkdir(path)
 await assert.rejects(store.createSession(input),/WORKSPACE_CHANGED/)
 path=cwd;fail=false;const result=await store.createSession(input)
 assert.equal(result.sessionId,pending.requests[0].sessionId);assert.equal((await store.snapshot()).links[result.sessionId],'smart-quotation')
 assert.equal(bindings[0].businessSessionId,undefined,'选择另一个目录沿 DSH 新会话语义，不复用旧报价 ID')
 assert.deepEqual(f.workspaces,[],'已有原生工作区不重复注册、不创建默认文件夹')
 assert.equal((await store.createSession(input)).sessionId,result.sessionId)
 await assert.rejects(store.createSession({...input,requestId:'unknown',workspaceId:'unknown'}),/WORKSPACE_NOT_READY/)
})

test('自选目录丢失不能当作场景迁移，原记录与归属不变',async()=>{
 const f=await fixture();await f.store.add({sceneId:'smart-quotation',expectedRevision:0})
 const result=await f.store.createSession({sceneId:'smart-quotation',requestId:'old-custom'})
 const before=await readFile(f.store.path,'utf8')
 const store=new SceneNavigationStore(f.root,{catalog:f.catalog,workspace:f.workspace,create:f.create,inspect:async()=>({meta:{cwd:join(f.root,'missing-custom')}})})
 await assert.rejects(store.reconnectSession({sceneId:'smart-quotation',sessionId:result.sessionId,requestId:'missing-custom'}),/SCENE_DIRECTORY_UNAVAILABLE/)
 assert.equal(await readFile(f.store.path,'utf8'),before);assert.equal(f.creations(),1)
})

test('内部工作区清单来自可信配套路径和会话绑定，兼容旧共享目录，不按文件夹名称猜测',async()=>{
 const f=await fixture();await f.store.add({sceneId:'smart-quotation',expectedRevision:0})
 const {sessionId}=await f.store.createSession({sceneId:'smart-quotation',requestId:'owned-dir'})
 const rows=[{id:'owned',path:join(f.root,'files/scenes/smart-quotation',sessionId),sessionIds:[sessionId]},{id:'legacy',path:join(f.root,'files/scenes/smart-quotation'),sessionIds:[sessionId]},{id:'user',path:join(f.root,'user/session-example'),sessionIds:[sessionId]}]
 const store=new SceneNavigationStore(f.root,{catalog:f.catalog,listWorkspaces:()=>rows})
 const before=await readFile(f.store.path,'utf8')
 assert.deepEqual((await store.snapshot()).managedWorkspaceIds,['owned','legacy'])
 assert.equal(await readFile(f.store.path,'utf8'),before)
})
