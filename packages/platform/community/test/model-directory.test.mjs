import test from 'node:test'
import assert from 'node:assert/strict'
import { ModelDirectory } from '../src/model-directory.mjs'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

function fixture() {
  let revision=1
  const changes=[]
  const profiles={anthropic:{apiKeyEnv:'ANTHROPIC_API_KEY'},google:{apiKeyEnv:'GEMINI_API_KEY'}}
  const entries=['anthropic','google','cloudflare-workers-ai'].map(provider=>({provider,displayName:provider,settingsNs:'pi',settingsPath:['providers',provider],nativeAuth:{env:[provider==='google'?'GEMINI_API_KEY':provider.toUpperCase()+'_API_KEY'],oauth:false}}))
  const models=provider=>[{id:'one',name:provider+' One',contextWindow:200000,maxTokens:8192,inputModalities:['text']},{id:'two',name:provider+' Two'}]
  const settings={writable:true,describe:()=>[{ns:'pi',revision,value:{providers:structuredClone(profiles)},user:{providers:structuredClone(profiles)},base:{providers:{}},schema:{}}],mutate:async(ns,ops,expected)=>{assert.equal(expected,revision);changes.push(ops);for(const op of ops){const route=op.path[1];if(op.path.length===2){if(op.op==='unset')delete profiles[route];else profiles[route]=op.value}else if(op.op==='unset')delete profiles[route][op.path[2]];else(profiles[route]??={})[op.path[2]]=op.value}revision++}}
  const llm={listConfigurableProviders:()=>entries,listProviders:()=>Object.keys(profiles).map(id=>({id})),discoverModels:async(ns,{provider})=>models(provider)}
  const ctx={get:name=>({llm,settings})[name],pluginManager:{listPlugins:async()=>[{entryId:'pi-entry',patchId:'pi',moduleName:'@deepseek-ai/dsh-llm-pi-ai',enabled:true}],listBundles:async()=>[],setPluginEnabled:async()=>{throw Error('must not stop shared adapter')}},sessionController:{modelCatalog:async()=>({groups:Object.keys(profiles).map(id=>({id,models:(profiles[id].models??models(id)).map(m=>({...models(id).find(x=>x.id===m.id),...m}))})),failures:[]})}}
  return {directory:new ModelDirectory(ctx),profiles,changes,ctx}
}

test('共享适配器按原生配置地址启停厂商，不停用整个适配器，未启用厂商仍有真实目录及容量',async()=>{
 const {directory,profiles}=fixture()
 let rows=(await directory.snapshot()).items
 assert.equal(rows.find(x=>x.provider==='anthropic').canToggle,true)
 assert.equal(rows.find(x=>x.provider==='cloudflare-workers-ai').models.length,2)
 assert.equal(rows.find(x=>x.provider==='google').models[0].maxTokens,8192)
 assert.equal(rows.find(x=>x.provider==='google').nativeAuth.env[0],'GEMINI_API_KEY')
 await directory.setEnabled({provider:'anthropic',enabled:false,expectedEnabled:true})
 assert.equal(profiles.anthropic,undefined)
 assert.deepEqual(profiles.google,{apiKeyEnv:'GEMINI_API_KEY'})
 await directory.setEnabled({provider:'anthropic',enabled:true,expectedEnabled:false})
 assert.deepEqual(profiles.anthropic,{apiKeyEnv:'ANTHROPIC_API_KEY'})
 await assert.rejects(directory.setEnabled({provider:'google',enabled:false,expectedEnabled:false}),/CHANGED/)
})

test('会话目录只有模型名称时，不得覆盖原生模型发现提供的容量和输入类型',async()=>{
 const {ctx,directory}=fixture()
 ctx.sessionController.modelCatalog=async()=>({groups:[{id:'google',models:[{id:'one',name:'Current name'}]}],failures:[]})
 const row=(await directory.snapshot()).items.find(x=>x.provider==='google').models[0]
 assert.equal(row.name,'Current name')
 assert.equal(row.contextWindow,200000)
 assert.deepEqual(row.inputModalities,['text'])
})

test('厂商停用时切换模型只保存选择，不应偷偷启用连接',async()=>{
 const {directory,profiles}=fixture();await directory.snapshot()
 await directory.setModelEnabled({provider:'cloudflare-workers-ai',model:'one',enabled:false,expectedEnabled:true})
 assert.equal(profiles['cloudflare-workers-ai'],undefined)
 assert.equal((await directory.snapshot()).items.find(x=>x.provider==='cloudflare-workers-ai').models.find(m=>m.id==='one').enabled,false)
 await directory.setEnabled({provider:'cloudflare-workers-ai',enabled:true,expectedEnabled:false})
 assert.deepEqual(profiles['cloudflare-workers-ai'].models.map(x=>x.id),['two'])
})

test('模型开关写入原生 models 列表，容量保留，重开可恢复；最后一项关闭不会让空列表恢复全量',async()=>{
 const {directory,profiles}=fixture();await directory.snapshot()
 await directory.setModelEnabled({provider:'google',model:'one',enabled:false,expectedEnabled:true})
 assert.deepEqual(profiles.google.models.map(x=>x.id),['two'])
 let row=(await directory.snapshot()).items.find(x=>x.provider==='google')
 assert.equal(row.models.find(x=>x.id==='one').enabled,false)
 await directory.setModelEnabled({provider:'google',model:'two',enabled:false,expectedEnabled:true})
 assert.equal(profiles.google,undefined)
 await directory.setModelEnabled({provider:'google',model:'one',enabled:true,expectedEnabled:false})
 await directory.setEnabled({provider:'google',enabled:true,expectedEnabled:false})
 assert.equal(profiles.google.models[0].id,'one')
 assert.equal((await directory.snapshot()).items.find(x=>x.provider==='google').models[0].contextWindow,200000)
 await assert.rejects(directory.setModelEnabled({provider:'google',model:'foreign',enabled:false,expectedEnabled:true}),/FORBIDDEN/)
})

test('停用恢复资料持久保存，进程重建后仍可恢复原配置；修订变化及固定启动配置拒绝修改',async()=>{
 const root=await mkdtemp(join(tmpdir(),'beellix-model-controls-'))
 try{
  const {ctx,profiles}=fixture(),statePath=join(root,'private/state.json')
  let directory=new ModelDirectory(ctx,{statePath});await directory.snapshot()
  await directory.setEnabled({provider:'anthropic',enabled:false,expectedEnabled:true})
  directory=new ModelDirectory(ctx,{statePath});await directory.snapshot()
  await directory.setEnabled({provider:'anthropic',enabled:true,expectedEnabled:false})
  assert.equal(profiles.anthropic.apiKeyEnv,'ANTHROPIC_API_KEY')
  await assert.rejects(directory.setEnabled({provider:'google',enabled:false,expectedEnabled:true,expectedRevision:1}),/CHANGED/)
  const settings=ctx.get('settings'),describe=settings.describe
  settings.describe=()=>describe().map(view=>({...view,base:{providers:{google:{apiKeyEnv:'BASE_REFERENCE'}}}}))
  assert.equal((await directory.snapshot()).items.find(x=>x.provider==='google').canToggle,false)
  await assert.rejects(directory.setEnabled({provider:'google',enabled:false,expectedEnabled:true}),/FORBIDDEN/)
 }finally{await rm(root,{recursive:true})}
})
