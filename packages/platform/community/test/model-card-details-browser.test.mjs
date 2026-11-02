import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync,mkdirSync} from 'node:fs'
import {createRequire} from 'node:module'
import {dirname,join,resolve} from 'node:path'
import {chromium} from 'playwright'
import {safeChromiumOptions} from '../../../../dev/scripts/browser-launch-options.mjs'
import {browserModules} from './browser-modules.mjs'
import {browserTheme} from './browser-theme.mjs'
const require=createRequire(import.meta.url),build=process.env.BEELLIX_CONSOLE_BUILD_DIR??resolve(import.meta.dirname,'../lib')
test('模型卡片详情具有统一内边距和字段对齐，长ID、折叠键盘及窄屏日夜均正常',async()=>{
 const browser=await chromium.launch(safeChromiumOptions({...process.platform==='win32'?{channel:'msedge'}:{},headless:true}))
 try{
 const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];page.setDefaultTimeout(3500);page.on('pageerror',error=>errors.push(error.message))
 await page.route('http://model-details.test/**',route=>route.fulfill({contentType:'text/html',body:'<html><style>body{margin:0;font:14px system-ui;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary)}</style><div id="root"></div></html>'}));await page.goto('http://model-details.test/')
 for(const pkg of ['react','react-dom'])await page.addScriptTag({path:join(dirname(require.resolve(pkg+'/package.json')),'umd/'+pkg+'.development.js')})
 await browserModules(page);await browserTheme(page)
 for(const file of [join(build,'console.css'),new URL('../src/style.css',import.meta.url),new URL('../../../../dev/shared/console/section-tabs.css',import.meta.url)])await page.addStyleTag({content:readFileSync(file,'utf8')})
 await page.addScriptTag({content:'window.face={exports:{}};(function(require,module,exports){'+readFileSync(join(build,'console-client.cjs'),'utf8')+'\n})(moduleRequire,face,face.exports)'})
 await page.evaluate(()=>{
  window.actions=[];const state={status:'ready',writable:true,rows:[],namespaces:new Map()},modelFace={models:{store:{getSnapshot:()=>state,subscribe:()=>()=>{}},load:async()=>{}},schema:{rehydrate:x=>x},operations:{}}
  const api={read:async path=>path==='state'?{}:path==='models/catalog'?{items:[{provider:'deepseek',displayName:'DeepSeek',enabled:true,canToggle:true,canModelToggle:true,modelsKnown:true,models:[{id:'deepseek-flash-'+('long-model-identifier-'.repeat(8)),name:'DeepSeek V4.1 Flash',contextWindow:1000000,inputModalities:['text','image']},{id:'deepseek-unknown',name:'未声明上下文的模型',inputModalities:['text']}]}]}:path==='models/search'?{enabled:false,writable:true,revision:'fixture'}:path==='models/plugins'?{plugins:[],groups:[]}:{items:[]},mutate:async(...args)=>{actions.push(args);throw Error('详情排布不应写模型配置')}}
  ReactDOM.createRoot(document.querySelector('#root')).render(React.createElement(face.exports.ConsoleContent,{tab:'models',api,modelFace:()=>modelFace}))
 })
 await page.getByRole('link',{name:'查看厂商 DeepSeek',exact:true}).click()
 const card=page.locator('article[data-model-kind=chat]').filter({has:page.getByRole('heading',{name:'DeepSeek V4.1 Flash',exact:true})}),details=card.locator('details'),summary=details.locator('summary')
 assert.equal(await card.getByText('上下文窗口',{exact:true}).isVisible(),false,'字段统一在详情内，收起时不散落在外')
 await summary.focus();await page.keyboard.press('Enter');await card.getByText('模型 ID',{exact:true}).waitFor();await card.getByText('1M',{exact:true}).waitFor()
 assert.equal(await details.locator('dl>div').count(),2)
 const output=join(import.meta.dirname,'../../../../dev/artifacts/test-results/model-card-details-20261102');mkdirSync(output,{recursive:true})
 for(const width of [360,1280])for(const dark of [false,true]){
  await page.setViewportSize({width,height:800});await page.evaluate(dark=>document.body.toggleAttribute('data-ds-dark-theme',dark),dark)
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true)
  const boxes=await card.evaluate(card=>{const box=element=>{const r=element.getBoundingClientRect();return{left:r.left,right:r.right,top:r.top,bottom:r.bottom}},details=card.querySelector('details');return{card:box(card),summary:box(details.querySelector('summary')),fields:[...details.querySelectorAll('dl>div')].map(row=>({label:box(row.querySelector('dt')),value:box(row.querySelector('dd'))}))}})
  assert.ok(boxes.summary.left>=boxes.card.left+12&&boxes.summary.right<=boxes.card.right-12,'详情与卡片内容留同一内边距')
  assert.ok(boxes.fields.every(row=>Math.abs(row.label.left-boxes.summary.left)<=1&&row.value.left>=row.label.right+6&&row.value.right<=boxes.summary.right+1),'字段名称和值统一对齐且不溢出')
  await page.screenshot({path:join(output,width+'-'+(dark?'dark':'light')+'.png'),animations:'disabled'})
 }
 await summary.press('Enter');assert.equal(await card.getByText('模型 ID',{exact:true}).isVisible(),false)
 const unknown=page.locator('article[data-model-kind=chat]').filter({has:page.getByRole('heading',{name:'未声明上下文的模型',exact:true})});await unknown.locator('summary').click();await unknown.getByText('未提供',{exact:true}).waitFor()
 assert.deepEqual(await page.evaluate(()=>actions),[]);assert.deepEqual(errors,[])
 }finally{await browser.close()}
})
