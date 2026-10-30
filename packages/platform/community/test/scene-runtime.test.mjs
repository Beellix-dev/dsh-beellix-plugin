import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,mkdir,writeFile,readFile} from 'node:fs/promises'
import {resolve,join} from 'node:path'
import {SceneRuntime,registerScenePreset} from "../../../../dev/shared/runtime/native-scenes.mjs"
import fs from 'node:fs/promises'
import {syncBuiltinESMExports} from 'node:module'

async function fixture(){
  const root=await mkdtemp(resolve(import.meta.dirname,"../../../../dev/artifacts/test-results/scene-runtime-"))
  await mkdir(join(root,'config'))
  const runtime=new SceneRuntime(root),mounts=[],nativeDisposers=new Map()
  const provider={id:'smart-quotation',packageName:'@beellix-ai/smart-quotation',version:'0.15.0',skill:'list-quotation',mount:async(agent,binding)=>{mounts.push({agent:agent.id,binding});let released=false;const dispose=()=>{if(released)throw Error('already owner-disposed');released=true;mounts.push({disposed:agent.id})};nativeDisposers.set(agent.id,dispose);return dispose}}
  const agent=(id,parent,preset='beellix-scene')=>({id,session:{header:{id,agentPreset:preset,...parent?{parentSession:parent,origin:'subagent'}:{}}},ctx:{get:()=>undefined,systemPrompt:{context:()=>()=>{}}}})
  await runtime.registerProvider(provider)
  return{root,runtime,mounts,agent,nativeDisposers}
}

test('普通会话不挂场景；场景和子代理沿可信父会话绑定，子代理只读',async()=>{
  const f=await fixture()
  assert.equal(await f.runtime.mountAgent(f.agent('plain',undefined,'standard')),undefined)
  await f.runtime.bind({sessionId:'scene-parent',sceneId:'smart-quotation',packageName:'@beellix-ai/smart-quotation',packageVersion:'0.15.0'})
  const root=await f.runtime.mountAgent(f.agent('scene-parent'))
  assert.equal(root.businessSessionId,'scene-parent');assert.equal(root.readOnly,false)
  const child=await f.runtime.mountAgent(f.agent('child','scene-parent'))
  assert.equal(child.businessSessionId,'scene-parent');assert.equal(child.readOnly,true);assert.equal(child.attachmentSessionId,'scene-parent')
  assert.equal(await f.runtime.mountAgent(f.agent('unrelated','absent')),undefined)
  assert.equal(await f.runtime.mountAgent(f.agent('changed-mode','scene-parent','standard')),undefined)
  assert.deepEqual(f.mounts.map(x=>x.agent),['scene-parent','child'])
  const reopened=new SceneRuntime(f.root);await reopened.registerProvider({id:'smart-quotation',packageName:'@beellix-ai/smart-quotation',version:'0.15.0',mount:async()=>()=>{}})
  assert.equal((await reopened.bindingFor(f.agent('child','scene-parent'))).businessSessionId,'scene-parent')
})

test('旧导航只迁移绑定信息，不改业务文件、不把普通会话变成场景',async()=>{
  const f=await fixture(),file=join(f.root,'config/scene-navigation.json')
  const original=JSON.stringify({schemaVersion:1,revision:1,added:['smart-quotation'],links:{legacy:'smart-quotation'},requests:[]})
  await writeFile(file,original)
  assert.equal((await f.runtime.mountAgent(f.agent('legacy',undefined,'standard'))).legacy,true)
  const child=await f.runtime.mountAgent(f.agent('legacy-child','legacy','standard'))
  assert.equal(child.readOnly,true);assert.equal(child.businessSessionId,'legacy')
  assert.equal(await f.runtime.mountAgent(f.agent('legacy-switched','legacy','different')),undefined)
  assert.equal(await f.runtime.mountAgent(f.agent('other',undefined,'standard')),undefined)
  assert.equal(await readFile(file,'utf8'),original)
  await assert.rejects(f.runtime.bind({sessionId:'legacy',sceneId:'different',packageName:'@beellix-ai/different',packageVersion:'1.0.0'}),/BINDING_CONFLICT/)
})

test('卸载提供方释放已挂载的会话资源，重新挂载不重复注册',async()=>{
  const f=await fixture();await f.runtime.bind({sessionId:'s',sceneId:'smart-quotation',packageName:'@beellix-ai/smart-quotation',packageVersion:'0.15.0'})
  const a=f.agent('s');await Promise.all([f.runtime.mountAgent(a),f.runtime.mountAgent(a)])
  assert.equal(f.mounts.length,1);await f.runtime.dispose();assert.deepEqual(f.mounts[1],{disposed:'s'})
})

test('场景预设直接继承宿主原版组成，只替换职业身份，原声明不变',async()=>{
  const standard=[{id:'persona',name:'@deepseek-ai/dsh-persona',config:{prefix:'coding'}},{id:'compact',name:'original-compaction'},{id:'subagents',name:'original-subagents'}],registered=[]
  const ctx={agentPresets:{readDocument:async id=>{assert.equal(id,'standard');return{content:'native-yaml'}} ,register:async d=>{registered.push(d);return()=>{}}},loader:{import:async name=>name==='js-yaml'?{load:()=>structuredClone(standard)}:{entryListSchema:{}}}}
  await registerScenePreset(ctx)
  assert.equal(registered[0].id,'beellix-scene');assert.equal(registered[0].name,'场景模式')
  assert.equal(registered[0].plugins[1].name,'original-compaction');assert.equal(registered[0].plugins[2].name,'original-subagents')
  assert.match(registered[0].plugins[0].config.prefix,/场景/);assert.equal(standard[0].config.prefix,'coding')
})

test('DSH 已释放 Agent 作用域后，只移除中台索引，不再次调用资源释放器',async()=>{
  const f=await fixture();await f.runtime.bind({sessionId:'s',sceneId:'smart-quotation',packageName:'@beellix-ai/smart-quotation',packageVersion:'0.15.0'})
  const a=f.agent('s');await f.runtime.mountAgent(a)
  f.nativeDisposers.get('s')()
  await f.runtime.removeAgent(a);await f.runtime.dispose()
  assert.equal(f.mounts.filter(x=>x.disposed==='s').length,1)
})

test('重启后冷会话可核对原生日志与既有绑定打开工作台，不激活Agent、不改绑定；组成不匹配和停用提供方拒绝',async()=>{
 const f=await fixture();await f.runtime.bind({sessionId:'cold',sceneId:'smart-quotation',packageName:'@beellix-ai/smart-quotation',packageVersion:'0.15.0',readOnly:true,executionPreset:'beellix-scene'})
 const before=await readFile(f.runtime.path,'utf8');let preset='beellix-scene',events=[];const calls=[]
 const runtime=new SceneRuntime(f.root,{inspectSession:async id=>{calls.push(id);return{meta:{id,agentPreset:preset},events}}})
 const dispose=await runtime.registerProvider({id:'smart-quotation',packageName:'@beellix-ai/smart-quotation',version:'0.15.3',mount:async()=>{throw Error('查看页面不能激活Agent')}})
 const binding=await runtime.requireBinding('cold','smart-quotation');assert.equal(binding.readOnly,true);assert.equal(binding.activePackageVersion,'0.15.3');assert.deepEqual(calls,['cold']);assert.equal(await readFile(runtime.path,'utf8'),before)
 events=[{type:'agent-preset/selected',data:{agentPreset:'standard'}}];await assert.rejects(runtime.requireBinding('cold','smart-quotation'),/SCENE_SESSION_REQUIRED/)
 events=[];preset='standard';await assert.rejects(runtime.requireBinding('cold','smart-quotation'),/SCENE_SESSION_REQUIRED/)
 preset='beellix-scene';await assert.rejects(runtime.requireBinding('cold','another-scene'),/SCENE_SESSION_REQUIRED/)
 await dispose();await assert.rejects(runtime.requireBinding('cold','smart-quotation'),/SCENE_SESSION_REQUIRED/)
})

test('标准预设加当前场景绑定可挂工具，旧兼容会话不重装配也不改日志或绑定，普通标准不获得场景',async()=>{
 const f=await fixture(),a=f.agent('standard-scene',undefined,'standard'),changes=[]
 a.ctx.get=name=>name==='agentPresets'?{composedPreset:()=> 'standard',recompose:async()=>changes.push('must-not-call')}:undefined
 await f.runtime.bind({sessionId:a.id,sceneId:'smart-quotation',packageName:'@beellix-ai/smart-quotation',packageVersion:'0.15.3',executionPreset:'standard'})
 const before=await readFile(f.runtime.path,'utf8');await f.runtime.mountAgent(a);assert.equal((await f.runtime.requireBinding(a.id,'smart-quotation')).executionPreset,'standard');assert.equal(f.mounts.length,1);assert.deepEqual(changes,[]);assert.equal(await readFile(f.runtime.path,'utf8'),before)
 const child=await f.runtime.mountAgent(f.agent('standard-child',a.id,'standard'));assert.equal(child.readOnly,true);assert.equal(child.businessSessionId,a.id)
 assert.equal(await f.runtime.bindingFor(f.agent('ordinary',undefined,'standard')),undefined)
 assert.equal(await f.runtime.bindingFor(f.agent(a.id,undefined,'ptc')),undefined)
 await f.runtime.bind({sessionId:'old-compatible',sceneId:'smart-quotation',packageName:'@beellix-ai/smart-quotation',packageVersion:'0.15.0'})
 const old=f.agent('old-compatible');old.ctx.get=()=>({composedPreset:()=> 'standard',recompose:async()=>changes.push('must-not-call')})
 const preserved=await readFile(f.runtime.path,'utf8');assert.equal((await f.runtime.mountAgent(old)).businessSessionId,'old-compatible');assert.equal(await readFile(f.runtime.path,'utf8'),preserved);assert.deepEqual(changes,[])
})
test('连续执行步骤复用未变更绑定，文件更新立即失效，调用方修改快照不污染缓存',async()=>{
 const f=await fixture();await f.runtime.bind({sessionId:'cached',sceneId:'smart-quotation',packageName:'@beellix-ai/smart-quotation',packageVersion:'0.15.3',executionPreset:'standard'})
 const original=fs.readFile;let reads=0
 fs.readFile=async(path,...args)=>{if(path===f.runtime.path)reads++;return original(path,...args)};syncBuiltinESMExports()
 try{
   for(let index=0;index<30;index++)assert.equal((await f.runtime.bindingFor(f.agent('cached',undefined,'standard'))).readOnly,false)
   assert.ok(reads<=1,'相同文件不应每个 Agent 步骤重新读取和解析：'+reads)
   const state=await f.runtime.load();state.bindings.cached.readOnly=true
   assert.equal((await f.runtime.bindingFor(f.agent('cached',undefined,'standard'))).readOnly,false)
   await writeFile(f.runtime.path,JSON.stringify(state));assert.equal((await f.runtime.bindingFor(f.agent('cached',undefined,'standard'))).readOnly,true)
 }finally{fs.readFile=original;syncBuiltinESMExports()}
})

test('历史标准场景被旧版原生预选改为兼容场景预设时接回原绑定，保留日志；不接受 PTC 或普通会话',async()=>{
 const f=await fixture();await f.runtime.bind({sessionId:'compatible',sceneId:'smart-quotation',packageName:'@beellix-ai/smart-quotation',packageVersion:'0.15.3',executionPreset:'standard'})
 const before=await readFile(f.runtime.path,'utf8');let preset='beellix-scene'
 const snapshot={meta:{id:'compatible',agentPreset:'standard'},events:[{type:'agent-preset/selected',data:{agentPreset:preset}}]}
 const r=new SceneRuntime(f.root,{inspectSession:async()=>structuredClone(snapshot)})
 await r.registerProvider({id:'smart-quotation',packageName:'@beellix-ai/smart-quotation',version:'0.15.3',mount:async()=>()=>{}})
 assert.equal((await r.requireBinding('compatible','smart-quotation')).businessSessionId,'compatible')
 await r.mountAgent(f.agent('compatible',undefined,'beellix-scene'))
 assert.equal((await r.requireBinding('compatible','smart-quotation')).executionPreset,'standard')
 await assert.rejects(r.requireBinding(f.agent('compatible',undefined,'ptc'),'smart-quotation'),/SCENE_SESSION_REQUIRED/)
 await assert.rejects(r.requireBinding(f.agent('ordinary',undefined,'beellix-scene'),'smart-quotation'),/SCENE_SESSION_REQUIRED/)
 assert.equal(await readFile(f.runtime.path,'utf8'),before);assert.deepEqual(snapshot.events,[{type:'agent-preset/selected',data:{agentPreset:'beellix-scene'}}])
 await r.dispose()
})
