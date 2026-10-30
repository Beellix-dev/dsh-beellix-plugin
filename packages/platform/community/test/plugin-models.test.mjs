import {pathToFileURL} from 'node:url'
import {join as packageJoin} from 'node:path'
const moduleUrl=name=>process.env.BEELLIX_UI_PACKAGE_DIR?pathToFileURL(packageJoin(process.env.BEELLIX_UI_PACKAGE_DIR,'lib',name)):new URL('../src/'+name,import.meta.url)
import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,readFile,writeFile,mkdir} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'

test('只列插件声明的模型用途，保留旧配置，不提供通用视觉路由',async()=>{
 const {PluginModels}=await import(moduleUrl('plugin-models.mjs'))
 const root=await mkdtemp(join(tmpdir(),'beellix-plugin-models-'));await mkdir(join(root,'config'))
 await writeFile(join(root,'config/scene-models.json'),'legacy-do-not-change')
 await writeFile(join(root,'config/model-routing.json'),'old-routing-do-not-change')
 let revision=2;const calls=[]
 const adapter={read:async()=>({revision,purposes:[{id:'ocr',title:'文字识别',kind:'document',inputModalities:['image'],selection:null}]}),write:async input=>{calls.push(input);revision++;return {application:'applied'}}}
 const service=new PluginModels(root,{catalog:async()=>[{id:'@beellix-ai/knowledge',title:'知识库',enabled:true}],models:async()=>({groups:[{id:'native',models:[{id:'text',inputModalities:['text']},{id:'vision',inputModalities:['text','image']}]}]}),configuration:()=>adapter,resolveModel:async(_p,m)=>({inputModalities:m==='vision'?['text','image']:['text']})})
 const state=await service.snapshot();assert.equal(state.plugins[0].purposes[0].kind,'document');assert.equal(Object.hasOwn(state,'routing'),false)
 assert.equal(typeof service.routing,'undefined')
 await assert.rejects(service.save({target:'routing',selection:{provider:'native',model:'vision'},expectedRevision:0}),/MODEL_CONTROL_INVALID/)
 await assert.rejects(service.save({pluginId:'@beellix-ai/knowledge',purposeId:'ocr',selection:{provider:'native',model:'text'},expectedRevision:2}),/CAPABILITY/)
 await service.save({pluginId:'@beellix-ai/knowledge',purposeId:'ocr',selection:{provider:'native',model:'vision'},expectedRevision:2})
 await assert.rejects(service.save({pluginId:'@beellix-ai/knowledge',purposeId:'ocr',selection:null,expectedRevision:2}),/CHANGED/)
 assert.equal(calls.length,1);assert.equal(calls[0].purposeId,'ocr');assert.equal(await readFile(join(root,'config/scene-models.json'),'utf8'),'legacy-do-not-change')
 const empty=new PluginModels(root,{catalog:async()=>[],models:async()=>({groups:[]})});assert.deepEqual((await empty.snapshot()).plugins,[])
 assert.equal(await readFile(join(root,'config/model-routing.json'),'utf8'),'old-routing-do-not-change')
})

test('插件用途类别只能使用稳定分类；没有声明时归入其他，不把 OCR 字串猜成视觉',async()=>{
 const {PluginModels}=await import(moduleUrl('plugin-models.mjs'))
 const root=await mkdtemp(join(tmpdir(),'beellix-model-kinds-'))
 const service=new PluginModels(root,{catalog:async()=>[{id:'legacy',enabled:true}],models:async()=>({groups:[]}),configuration:()=>({read:async()=>({revision:0,purposes:[{id:'ocr',title:'OCR',selection:null}]}),write:async()=>{}})})
 assert.equal((await service.snapshot()).plugins[0].purposes[0].kind,'other')
})

test('专用连接的启停仅转交插件适配器，不借用主聊天目录，保留模型元信息且拒绝混合写入',async()=>{
 const {PluginModels}=await import(moduleUrl('plugin-models.mjs'))
 let revision=3,enabled=true;const calls=[]
 const adapter={read:async()=>({revision,purposes:[{id:'embedding',title:'向量检索',kind:'retrieval',operation:'embedding',configured:true,enabled,canToggle:true,connection:{kind:'local',model:'qwen3-embedding:0.6b'},configurationPanel:'beellix-knowledge',selection:null}]}),write:async input=>{calls.push(input);enabled=input.enabled;revision++;return{application:'applied'}}}
 const service=new PluginModels('',{catalog:async()=>[{id:'@beellix-ai/knowledge',title:'知识库',enabled:true}],models:async()=>({groups:[]}),configuration:()=>adapter})
 const purpose=(await service.snapshot()).plugins[0].purposes[0]
 assert.equal(purpose.canToggle,true);assert.deepEqual(purpose.connection,{kind:'local',model:'qwen3-embedding:0.6b'})
 await service.save({pluginId:'@beellix-ai/knowledge',purposeId:'embedding',enabled:false,expectedRevision:3})
 assert.deepEqual(calls,[{purposeId:'embedding',enabled:false,expectedRevision:3}]);assert.equal((await service.snapshot()).plugins[0].purposes[0].enabled,false)
 await assert.rejects(service.save({pluginId:'@beellix-ai/knowledge',purposeId:'embedding',enabled:true,expectedRevision:3}),/CHANGED/)
 await assert.rejects(service.save({pluginId:'@beellix-ai/knowledge',purposeId:'embedding',selection:null,enabled:true,expectedRevision:4}),/INVALID/)
})
