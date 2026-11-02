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

test('向量与重排配置共用主模型卡片，保留真实启停、配置和详情，宽窄日夜一致',async()=>{
 const browser=await chromium.launch(safeChromiumOptions({channel:'msedge',headless:true})),capture=resolve("./dev/artifacts/plugin-model-grouping-20261027/screenshots");mkdirSync(capture,{recursive:true})
 try{
  const page=await browser.newPage({viewport:{width:1440,height:950}}),errors=[]
  page.setDefaultTimeout(4000);page.on('pageerror',e=>errors.push(e.message))
  await page.route('http://plugin-cards.test/**',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><html lang="zh"><meta charset="utf-8"><style>body{margin:0;font:14px system-ui}*{box-sizing:border-box}</style><div id="root" class="beellix-bootstrap beellix-console"></div></html>'}));await page.goto('http://plugin-cards.test/')
  for(const pkg of ['react','react-dom'])await page.addScriptTag({path:join(dirname(require.resolve(pkg+'/package.json')),'umd/'+pkg+'.development.js')})
  await browserModules(page);await browserTheme(page)
  for(const file of ['../lib/console.css','../src/style.css','../../../../dev/shared/console/section-tabs.css'])await page.addStyleTag({content:readFileSync(new URL(file,import.meta.url),'utf8')})
  await page.addScriptTag({content:`window.consoleModule={exports:{}};((require,module,exports)=>{${readFileSync(new URL('../lib/console-client.cjs',import.meta.url),'utf8')}\n})(moduleRequire,consoleModule,consoleModule.exports);`})
  await page.evaluate(()=>{
   window.calls=[];window.failWrite=false
   const plugin=window.knowledgePlugin={id:'@beellix-ai/knowledge',title:'知识库',enabled:true,version:'0.1.1',revision:2,purposes:[{id:'parser',title:'文档解析 · MinerU',kind:'document',operation:'parse',configured:true,enabled:true,canToggle:true,connection:{kind:'api',model:'MinerU VLM',endpoint:'https://mineru.net/api/v4'},configurationPanel:'beellix-knowledge',selection:null},{id:'embedding',title:'向量检索',kind:'retrieval',operation:'embedding',configured:true,enabled:true,canToggle:true,connection:{kind:'local',model:'qwen3-embedding:0.6b'},configurationPanel:'beellix-knowledge',selection:null},{id:'rerank',title:'检索重排',kind:'retrieval',operation:'rerank',configured:false,enabled:true,canToggle:false,configurationPanel:'beellix-knowledge',selection:null}]}
   window.modelPlugins=[plugin]
   const api={read:async path=>path==='models/plugins'?{plugins:window.modelPlugins,groups:[]}:path==='models/catalog'?{items:[]}:{},mutate:async(path,input)=>{calls.push({path,input});if(failWrite){failWrite=false;throw Error('设置未保存，请重试。')}if(path==='models/plugins'){if(input.expectedRevision!==plugin.revision)throw Error('修订冲突');plugin.purposes.find(p=>p.id===input.purposeId).enabled=input.enabled;plugin.revision++}return{application:'applied'}}}
   ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(consoleModule.exports.ConsoleContent,{tab:'models',api,openPanel:(panel,detail)=>calls.push({panel,detail})}))
  })
  await page.getByRole('link',{name:'插件模型配置',exact:true}).click()
  await page.getByRole('navigation',{name:'插件模型分组',exact:true}).waitFor()
  await page.getByRole('button',{name:'知识库',exact:true}).waitFor()
  for(const name of ['文档','检索','其他'])assert.equal(await page.getByRole('button',{name,exact:true}).count(),0,'模型用途不能拆成插件标签')
  const cards=page.locator('[data-model-card="vendor-summary"]')
  assert.equal(await cards.count(),3,'一个知识库标签下应同时展示全部用途卡片')
  assert.equal(await page.getByRole('combobox',{name:'配置用途',exact:true}).count(),0)
  assert.equal(await page.getByRole('button',{name:'添加模型',exact:true}).count(),0,'向量/重排不能显示创建聊天模型的无效按钮')
  assert.equal(await page.locator('.beellix-plugin-model-connection').count(),0)
  const embedding=page.getByRole('article',{name:'知识库 · 向量检索',exact:true}),rerank=page.getByRole('article',{name:'知识库 · 检索重排',exact:true})
  assert.equal(await embedding.locator('[data-vendor-icon=qwen]').count(),1)
  assert.equal(await embedding.getByRole('button',{name:'配置 知识库 · 向量检索',exact:true}).isEnabled(),true)
  assert.equal(await rerank.getByRole('switch',{name:'启用 知识库 · 检索重排',exact:true}).isEnabled(),false)
  await rerank.getByRole('button',{name:'配置 知识库 · 检索重排',exact:true}).click()
  assert.deepEqual((await page.evaluate(()=>calls)).at(-1),{panel:'beellix-knowledge',detail:{capabilityId:'knowledge',title:'知识库',view:'model:rerank'}})
  await page.screenshot({path:join(capture,'initial-light.png'),animations:'disabled'})
  const toggle=embedding.getByRole('switch',{name:'启用 知识库 · 向量检索',exact:true})
  await toggle.click();await page.getByRole('status').filter({hasText:'已保存'}).waitFor();assert.equal(await toggle.getAttribute('aria-checked'),'false')
  assert.deepEqual((await page.evaluate(()=>calls)).at(-1),{path:'models/plugins',input:{pluginId:'@beellix-ai/knowledge',purposeId:'embedding',enabled:false,expectedRevision:2}})
  await page.evaluate(()=>failWrite=true);await toggle.click();await page.getByRole('alert').filter({hasText:'设置未保存'}).waitFor();assert.equal(await toggle.getAttribute('aria-checked'),'false','写入失败不能假装开关已开启')
  await toggle.click();await page.getByRole('status').filter({hasText:'已保存'}).waitFor();assert.equal(await toggle.getAttribute('aria-checked'),'true')
  await embedding.getByRole('button',{name:'查看详情 知识库 · 向量检索',exact:true}).click()
  const dialog=page.getByRole('dialog',{name:'知识库 · 向量检索',exact:true});await dialog.waitFor();assert.equal(await dialog.getByText('qwen3-embedding:0.6b',{exact:true}).count(),1);await dialog.getByRole('button',{name:'关闭',exact:true}).click()
  await page.getByLabel('搜索厂商或模型',{exact:true}).fill('重排');assert.equal(await cards.count(),1);await page.getByLabel('搜索厂商或模型',{exact:true}).fill('')
  await page.getByRole('combobox',{name:'状态',exact:true}).selectOption('enabled');assert.equal(await cards.count(),2);await page.getByRole('combobox',{name:'状态',exact:true}).selectOption('all')
  for(const width of [360,1440,2560])for(const dark of [false,true]){
   await page.setViewportSize({width,height:950});await page.evaluate(dark=>document.body.toggleAttribute('data-ds-dark-theme',dark),dark)
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true)
   const boxes=await cards.evaluateAll(items=>items.map(e=>({x:e.getBoundingClientRect().x,width:e.getBoundingClientRect().width,y:e.getBoundingClientRect().y})))
   assert.ok(width===360?boxes[0].y!==boxes[1].y:boxes[0].y===boxes[1].y,'卡片列数跟随主模型的实际布局')
   await page.screenshot({path:join(capture,`${width}-${dark?'dark':'light'}.png`),animations:'disabled'})
  }
  const parser=page.getByRole('article',{name:'知识库 · 文档解析 · MinerU',exact:true})
  assert.equal(await parser.count(),1);assert.equal(await cards.count(),3)
  await parser.getByRole('button',{name:'配置 知识库 · 文档解析 · MinerU',exact:true}).click()
  assert.deepEqual((await page.evaluate(()=>calls)).at(-1),{panel:'beellix-knowledge',detail:{capabilityId:'knowledge',title:'知识库',view:'model:parser'}})
  await page.setViewportSize({width:1440,height:950});await page.screenshot({path:join(capture,'mineru-model-card.png'),animations:'disabled'})
  await page.evaluate(()=>{knowledgePlugin.models={purposes:[{id:'organize',default:'host-main'}]};knowledgePlugin.purposes.push({id:'organize',title:'分类与知识整理',kind:'other',operation:'chat',selection:null},...Array.from({length:6},(_,i)=>({id:'extra'+i,title:'用途'+i,kind:i%2?'document':'retrieval',operation:'embedding',configured:false,configurationPanel:'beellix-knowledge'})));window.otherPlugin={id:'@beellix-ai/drawings',title:'图纸工具',enabled:false,version:'0.1.1',revision:0,purposes:[{id:'ocr',title:'图纸识别',kind:'document',operation:'parse',configured:false,configurationPanel:'beellix-drawings'}]};window.modelPlugins.push(otherPlugin)})
  await page.getByRole('button',{name:'刷新',exact:true}).click()
  assert.equal(await cards.count(),10,'知识库十项用途必须仍在同一个插件标签内');assert.equal(await page.getByRole('article',{name:'知识库 · 分类与知识整理',exact:true}).getByText('沿用主模型',{exact:true}).count(),1)
  await page.evaluate(()=>document.body.removeAttribute('data-ds-dark-theme'));await page.screenshot({path:join(capture,'ten-purposes-one-plugin.png'),animations:'disabled'})
  assert.equal(await page.getByRole('navigation',{name:'插件模型分组',exact:true}).getByRole('button').count(),2)
  await page.getByRole('button',{name:'图纸工具',exact:true}).click();assert.equal(await cards.count(),1);assert.equal(await page.getByRole('button',{name:'配置 图纸工具 · 图纸识别',exact:true}).isDisabled(),true)
  await page.getByRole('button',{name:'知识库',exact:true}).click();assert.equal(await cards.count(),10)
  await page.evaluate(()=>knowledgePlugin.enabled=false);await page.getByRole('button',{name:'刷新',exact:true}).click()
  assert.equal(await toggle.isEnabled(),false);assert.equal(await embedding.getByRole('button',{name:'配置 知识库 · 向量检索',exact:true}).isEnabled(),false)
  assert.equal((await page.evaluate(()=>calls)).filter(r=>['models/enabled','models/selection'].includes(r.path)).length,0)
  await page.evaluate(()=>{knowledgePlugin.enabled=true;knowledgePlugin.purposes=knowledgePlugin.purposes.filter(p=>['organize','parser','embedding','rerank'].includes(p.id));knowledgePlugin.configurationGroups=[{id:'ingestion',title:'入库处理',description:'所有入口共用的解析与整理。',purposeIds:['organize','parser']},{id:'retrieval',title:'检索与重排',description:'统一向量检索与可选重排。',purposeIds:['embedding','rerank']}]})
  await page.getByRole('button',{name:'刷新',exact:true}).click();assert.equal(await cards.count(),2)
  const unified=resolve('./dev/artifacts/knowledge-unified-pipelines-20261102/screenshots');mkdirSync(unified,{recursive:true})
  for(const width of [360,1440])for(const dark of [false,true]){await page.setViewportSize({width,height:950});await page.evaluate(value=>document.body.toggleAttribute('data-ds-dark-theme',value),dark);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);await page.screenshot({path:join(unified,`model-plans-${width}-${dark?'dark':'light'}.png`),animations:'disabled'})}
  await page.getByRole('button',{name:'配置 检索与重排',exact:true}).click();assert.equal(await cards.count(),2);assert.equal(await page.getByRole('article',{name:'知识库 · 文档解析 · MinerU',exact:true}).count(),0)
  await page.getByRole('button',{name:'配置 知识库 · 向量检索',exact:true}).click();assert.equal((await page.evaluate(()=>calls)).at(-1).detail.view,'model:embedding')
  await page.getByRole('button',{name:'返回模型方案',exact:true}).click();await page.getByRole('button',{name:'配置 入库处理',exact:true}).click();assert.equal(await cards.count(),2);assert.equal(await page.getByRole('article',{name:'知识库 · 向量检索',exact:true}).count(),0)
  await page.getByRole('button',{name:'配置 知识库 · 文档解析 · MinerU',exact:true}).click();assert.equal((await page.evaluate(()=>calls)).at(-1).detail.view,'model:parser')
  assert.deepEqual(errors,[])
 }finally{await browser.close()}
})
