import test from 'node:test'
import assert from 'node:assert/strict'
import {createServer} from 'node:http'
import {mkdtemp} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {pathToFileURL} from 'node:url'
const moduleUrl=name=>process.env.BEELLIX_UI_PACKAGE_DIR?pathToFileURL(join(process.env.BEELLIX_UI_PACKAGE_DIR,'lib',name)):new URL('../src/'+name,import.meta.url)
test('插件模型 HTTP：用途写入鉴权、能力与修订校验，拒绝通用路由并保留旧接口',async()=>{
 const [{consoleApi},{PluginModels}]=await Promise.all([import(moduleUrl('console-api.mjs')),import(moduleUrl('plugin-models.mjs'))])
 let revision=0,selection=null
 const root=await mkdtemp(join(tmpdir(),'beellix-routing-api-')),models=new PluginModels(root,{catalog:async()=>[{id:'plugin',enabled:true}],models:async()=>({groups:[{id:'native',models:[{id:'text',inputModalities:['text']},{id:'vision',inputModalities:['image']}]}]}),configuration:()=>({read:async()=>({revision,purposes:[{id:'ocr',title:'文字识别',kind:'document',inputModalities:['image'],selection}]}),write:async input=>{selection=input.selection;revision++;return{application:'applied'}}})})
 const ctx={get:()=>undefined},handler=consoleApi({ctx,addons:{snapshot:async()=>[]},ready:()=>true,catalog:async()=>[],authorize:()=>undefined,pluginModels:models,sceneModels:{snapshot:async()=>({scenes:['legacy']}),save:async()=>({application:'applied'})}}),server=createServer(handler)
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${server.address().port}/beellix/console`
 try{
  const token=(await(await fetch(base+'/state')).json()).csrfToken,input={pluginId:'plugin',purposeId:'ocr',expectedRevision:0,selection:{provider:'native',model:'vision'}}
  const post=(value,auth=true)=>fetch(base+'/models/plugins',{method:'POST',headers:{'content-type':'application/json',...auth?{'x-beellix-console-token':token}:{}},body:JSON.stringify(value)})
  assert.equal((await post(input,false)).status,403);assert.equal(revision,0)
  assert.equal((await post({target:'routing',selection:null,expectedRevision:0})).status,400)
  const rejected=await post({...input,selection:{provider:'native',model:'text'}});assert.equal(rejected.status,400);assert.equal((await rejected.json()).error.reason,'MODEL_CAPABILITY_REQUIRED')
  assert.equal((await post(input)).status,200);assert.equal((await post(input)).status,409)
  const state=await(await fetch(base+'/models/plugins')).json();assert.equal(Object.hasOwn(state,'routing'),false);assert.deepEqual(state.plugins[0].purposes[0].selection,input.selection)
  assert.deepEqual(await(await fetch(base+'/models/scenes')).json(),{scenes:['legacy']})
 }finally{await new Promise(resolve=>server.close(resolve))}
})
