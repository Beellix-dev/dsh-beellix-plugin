import {safeChromiumOptions} from "../../../../dev/scripts/browser-launch-options.mjs"
import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync,mkdirSync} from 'node:fs'
import {createRequire} from 'node:module'
import {dirname,join,resolve} from 'node:path'
import {chromium} from 'playwright'
import {browserModules} from './browser-modules.mjs'
import {browserTheme} from './browser-theme.mjs'
const require=createRequire(import.meta.url)
const packedClient=process.env.BEELLIX_PLUGIN_MODEL_CLIENT?readFileSync(process.env.BEELLIX_PLUGIN_MODEL_CLIENT,'utf8'):null
function packedConsole(){
 const marker='"./console-page.mjs":(require)=>{',start=packedClient.indexOf(marker),end=packedClient.indexOf('\nreturn module.exports;}',start)
 assert.ok(start>=0&&end>start);return packedClient.slice(start+marker.length,end)+'\nreturn module.exports;'
}
function packedStyles(){const prefix='const stylesheet = ',start=packedClient.indexOf(prefix);assert.ok(start>=0);return JSON.parse(packedClient.slice(start+prefix.length,packedClient.indexOf('\n',start)).trim().replace(/;$/,''))}

test('插件声明几项即显示几项，必配选配、型号、沿用主模型及启停复用同一模型卡片',async()=>{
 const browser=await chromium.launch(safeChromiumOptions({channel:'msedge',headless:true})),capture=resolve(process.env.BEELLIX_PLUGIN_MODEL_CAPTURE??'./dev/artifacts/knowledge-model-declarations-20261102/screenshots');mkdirSync(capture,{recursive:true})
 try{
  const page=await browser.newPage({viewport:{width:1440,height:950}}),errors=[];page.setDefaultTimeout(4000);page.on('pageerror',e=>errors.push(e.message))
  await page.route('http://plugin-cards.test/**',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><html lang="zh"><meta charset="utf-8"><style>body{margin:0;font:14px system-ui}*{box-sizing:border-box}</style><div id="root" class="beellix-bootstrap beellix-console"></div></html>'}));await page.goto('http://plugin-cards.test/')
  for(const pkg of ['react','react-dom'])await page.addScriptTag({path:join(dirname(require.resolve(pkg+'/package.json')),'umd/'+pkg+'.development.js')})
  await browserModules(page);await browserTheme(page)
  if(packedClient){await page.addStyleTag({content:packedStyles()});await page.addScriptTag({content:'window.consoleModule={exports:new Function("require",'+JSON.stringify(packedConsole())+')(moduleRequire)};'})}
  else{for(const file of ['../lib/console.css','../src/style.css','../../../../dev/shared/console/section-tabs.css'])await page.addStyleTag({content:readFileSync(new URL(file,import.meta.url),'utf8')});await page.addScriptTag({content:`window.consoleModule={exports:{}};((require,module,exports)=>{${readFileSync(new URL('../lib/console-client.cjs',import.meta.url),'utf8')}\n})(moduleRequire,consoleModule,consoleModule.exports);`})}
  await page.evaluate(()=>{
   window.calls=[];window.failWrite=false;window.mainDefault={provider:'deepseek',model:'flash'}
   window.knowledgePlugin={id:'@beellix-ai/knowledge',title:'知识库',enabled:true,revision:2,models:{purposes:[{id:'organize',required:true,default:'host-main'}]},purposes:[
    {id:'organize',title:'入库整理',operation:'chat',required:true,default:'host-main',selection:null},
    {id:'embedding',title:'向量检索',operation:'embedding',kind:'retrieval',required:true,configured:true,enabled:true,canToggle:true,modelOptions:['text-embedding-v4','text-embedding-v3'],connection:{kind:'api',model:'text-embedding-v4'},configurationPanel:'beellix-knowledge',selection:null},
    {id:'parser',title:'MinerU 解析增强',operation:'parse',kind:'document',required:false,configured:false,enabled:false,canToggle:false,configurationPanel:'beellix-knowledge',selection:null},
    {id:'rerank',title:'检索重排',operation:'rerank',kind:'retrieval',required:false,configured:false,enabled:false,canToggle:true,modelOptions:['qwen3-rerank','qwen3.7-text-rerank'],configurationPanel:'beellix-knowledge',selection:null}
   ]};window.modelPlugins=[knowledgePlugin]
   window.nativeModelState={status:'ready',rows:[{entry:{provider:'deepseek',active:true},credential:{configured:true}}]};const face={operations:{},models:{load:async()=>{},store:{subscribe:()=>()=>{},getSnapshot:()=>nativeModelState}}}
   const api={read:async path=>path==='models/plugins'?{plugins:modelPlugins,default:mainDefault,groups:[{id:'deepseek',name:'DeepSeek',models:[{id:'flash',name:'DeepSeek Flash'},{id:'pro',name:'DeepSeek Pro'}]}]}:path==='models/catalog'?{items:[]}:{},mutate:async(path,input)=>{calls.push({path,input});if(failWrite){failWrite=false;throw Error('设置未保存，请重试。')}const plugin=modelPlugins.find(row=>row.id===input.pluginId);if(input.expectedRevision!==plugin.revision)throw Error('修订冲突');const purpose=plugin.purposes.find(row=>row.id===input.purposeId);if(Object.hasOwn(input,'modelId'))Object.assign(purpose,{connection:{kind:'api',model:input.modelId},configured:true});else if(Object.hasOwn(input,'selection'))purpose.selection=input.selection;else Object.assign(purpose,{enabled:input.enabled,...input.enabled?{configured:true,connection:purpose.connection??{kind:'api',model:purpose.modelOptions?.[0]}}:{}});plugin.revision++;return{application:'applied'}}}
   ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(consoleModule.exports.ConsoleContent,{tab:'models',api,modelFace:()=>face,openPanel:(panel,detail)=>calls.push({panel,detail})}))
  })
  await page.getByRole('link',{name:'插件模型配置',exact:true}).click();const cards=page.locator('[data-model-card="vendor-summary"]');await page.getByRole('button',{name:'知识库',exact:true}).waitFor()
  assert.equal(await cards.count(),4,'四项模型声明必须完整显示，沿用主模型也保留该配置项');assert.equal(await cards.getByText('必配',{exact:true}).count(),2);assert.equal(await cards.getByText('选配',{exact:true}).count(),2)
  for(const name of ['Qwen API','入库处理','检索与重排'])assert.equal(await page.getByRole('heading',{name,exact:true}).count(),0)
  const organizer=page.getByRole('article',{name:'知识库 · 入库整理',exact:true}),rerank=page.getByRole('article',{name:'知识库 · 检索重排',exact:true}),vector=page.getByRole('article',{name:'知识库 · 向量检索',exact:true})
  assert.equal(await organizer.getByText('DeepSeek Flash',{exact:true}).count(),1);assert.equal(await organizer.getByText('沿用主模型',{exact:true}).count(),1)
  await organizer.getByRole('button',{name:'选择模型 知识库 · 入库整理',exact:true}).click();await page.getByRole('button',{name:'返回插件模型',exact:true}).click()
  const choose=rerank.getByRole('combobox',{name:'知识库 · 检索重排模型',exact:true}),toggle=rerank.getByRole('switch',{name:'启用 知识库 · 检索重排',exact:true});assert.equal(await choose.inputValue(),'qwen3-rerank');assert.equal(await toggle.isEnabled(),true)
  await toggle.click();await page.waitForFunction(()=>knowledgePlugin.purposes.find(p=>p.id==='rerank').enabled===true);await choose.selectOption('qwen3.7-text-rerank');await page.waitForFunction(()=>knowledgePlugin.purposes.find(p=>p.id==='rerank').connection.model==='qwen3.7-text-rerank')
  await page.evaluate(()=>failWrite=true);await choose.selectOption('qwen3-rerank');await page.getByRole('alert').filter({hasText:'设置未保存'}).waitFor();assert.equal(await choose.inputValue(),'qwen3.7-text-rerank','失败保持原型号')
  await vector.getByRole('button',{name:'配置 知识库 · 向量检索',exact:true}).click();assert.equal((await page.evaluate(()=>calls)).at(-1).detail.view,'model:embedding')
  await page.evaluate(()=>{knowledgePlugin.purposes.find(p=>p.id==='organize').selection={provider:'deepseek',model:'pro'};Object.assign(knowledgePlugin.purposes.find(p=>p.id==='rerank'),{configured:false,canToggle:false})});await page.getByRole('button',{name:'刷新',exact:true}).click();await organizer.getByRole('button',{name:'恢复DSH主模型',exact:true}).click();await page.waitForFunction(()=>knowledgePlugin.purposes[0].selection===null);await toggle.click();assert.equal((await page.evaluate(()=>calls)).at(-1).detail.view,'model:rerank:enable')
  await page.evaluate(()=>{knowledgePlugin.purposes.push({id:'custom',title:'合同识别服务',operation:'parse',required:true,configured:false,configurationPanel:'beellix-knowledge'});Object.assign(knowledgePlugin.purposes.find(p=>p.id==='rerank'),{configured:true,canToggle:true});});await page.getByRole('button',{name:'刷新',exact:true}).click();assert.equal(await cards.count(),5);assert.equal(await page.getByRole('heading',{name:'合同识别服务',exact:true}).count(),1,'中台不把第三方解析用途改名为MinerU');assert.equal(await cards.getByText('必配',{exact:true}).count(),3)
  await page.evaluate(()=>knowledgePlugin.purposes.pop());await page.getByRole('button',{name:'刷新',exact:true}).click()
  for(const width of [360,1440,2560])for(const dark of [false,true]){await page.setViewportSize({width,height:950});await page.evaluate(value=>document.body.toggleAttribute('data-ds-dark-theme',value),dark);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);await page.screenshot({path:join(capture,`models-${width}-${dark?'dark':'light'}.png`),animations:'disabled'})}
  await page.evaluate(()=>knowledgePlugin.enabled=false);await page.getByRole('button',{name:'刷新',exact:true}).click();assert.equal(await choose.isDisabled(),true);assert.equal(await toggle.isDisabled(),true);assert.deepEqual(errors,[])
 }finally{await browser.close()}
})
