import {safeChromiumOptions} from "../../../../dev/scripts/browser-launch-options.mjs"
import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync,mkdirSync} from 'node:fs'
import {createRequire} from 'node:module'
import {dirname,join} from 'node:path'
import {chromium} from 'playwright'
import {browserModules} from './browser-modules.mjs'
import {browserTheme} from './browser-theme.mjs'
const require=createRequire(import.meta.url)
test('无场景时切换显示页内空状态且不弹窗，安装入口可用，已有场景由用户选择后打开',async()=>{
 const browser=await chromium.launch(safeChromiumOptions({...process.platform==='win32'?{channel:'msedge'}:{},headless:true}))
 try{
  const page=await browser.newPage({viewport:{width:1100,height:800}}),errors=[];page.setDefaultTimeout(4000);page.on('pageerror',e=>errors.push(e.message))
  await page.route('http://picker.test/**',r=>r.fulfill({contentType:'text/html; charset=utf-8',body:'<html><style>body{font:14px system-ui}body{margin:0;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary)}#sidebar{width:260px;min-height:100vh;padding:12px;box-sizing:border-box}</style><div id="sidebar" data-slot="sidebar"><div data-slot="sidebar.workspaces"><div><header><span>工作区</span></header><div>DSH原列表</div></div></div></div><div id="overlay"></div></html>'}));await page.goto('http://picker.test/')
  for(const name of ['react','react-dom'])await page.addScriptTag({path:join(dirname(require.resolve(name+'/package.json')),'umd/'+name+'.development.js')})
  await browserModules(page);await browserTheme(page)
  await page.evaluate(()=>{
   Object.defineProperty(crypto,'randomUUID',{configurable:true,value:()=> 'picker-request'});window.__ModuleLoader__={load:value=>window.entry=value};window.calls=[];window.added=[];window.links={};window.revision=0;window.value={byId:{}};window.current={key:undefined};window.listeners=new Set();window.listListeners=new Set();window.nativeNew=0;window.types=[];window.panels=[]
   window.available=[{id:'smart-quotation',title:'智能报价-建筑',version:'0.15.3',enabled:true,tabKind:'quote'},{id:'notes',title:'会议纪要',version:'1.0.0',enabled:false,tabKind:'notes'}]
   window.installed=[];window.snapshot=()=>({revision,csrfToken:'test-token',scenes:installed.filter(x=>added.includes(x.id)),installed,links})
   window.fetch=async(url,options={})=>{const path=new URL(url).pathname;calls.push({path,body:options.body?JSON.parse(options.body):undefined});let result=path.endsWith('/bootstrap/state')?{status:'ready',applications:{status:'ready'}}:path.endsWith('/console/state')?{managedPackages:[]}:snapshot();if(path.endsWith('/add')){const packet=JSON.parse(options.body);added.push(packet.sceneId);revision++;result=snapshot()}if(path.endsWith('/create-session')){const packet=JSON.parse(options.body),id='new-'+packet.sceneId;links[id]=packet.sceneId;value={byId:{...value.byId,[id]:{id,displayTitle:'新场景对话',blank:true,updatedAt:1,projectionValues:{agentPreset:'standard'}}}};result={sessionId:id};for(const fn of listListeners)fn()}return new Response(JSON.stringify(result),{headers:{'content-type':'application/json'}})}
  })
  await page.addScriptTag({content:readFileSync(process.env.BEELLIX_TEST_CLIENT??new URL('../lib/client.js',import.meta.url),'utf8')})
  await page.evaluate(()=>{
   const hooks=source=>selector=>React.useSyncExternalStore(source.subscribe,()=>selector(source.getSnapshot())),bind=injected=>({...injected,...Object.fromEntries(Object.entries(injected.hooks??{}).map(([key,source])=>['use'+key[0].toUpperCase()+key.slice(1),hooks(source)]))})
   const workspaceState={items:[{workspaceId:'ordinary',sessionIds:[]}]};const ctx={workspaces:{list:{getSnapshot:()=>workspaceState,subscribe:()=>()=>{}}},remote:{$on:()=>()=>{}},sessions:{list:{subscribe:fn=>{listListeners.add(fn);return()=>listListeners.delete(fn)},getSnapshot:()=>value}},uiSession:{adapter:{current:{subscribe:fn=>{listeners.add(fn);return()=>listeners.delete(fn)},getSnapshot:()=>current}}},uiWorkspace:{openSession:id=>{current={key:id};for(const fn of listeners)fn()},startSession:()=>{nativeNew++;current={key:undefined};for(const fn of listeners)fn()}},sidebarRightTabs:{entries:()=>window.types,subscribe:()=>()=>{}},sidebarRight:{mounted:{getSnapshot:()=>undefined,subscribe:()=>()=>{}}},locale:{register:()=>()=>{},bind:()=>key=>key},effect:fn=>fn(),layout:{selectPanel:id=>panels.push(id)},slots:{entries:()=>[],subscribe:()=>()=>{},inject:(_key,fn)=>fn(),register:(options,Component)=>{if(options.name!=='shell.overlay')return()=>{};const root=ReactDOM.createRoot(document.querySelector('#overlay'));root.render(React.createElement(Component,{...bind(options.inject()),renderSlot:()=>null}));return()=>root.unmount()}}}
   entry.factory(moduleRequire).apply(ctx)
  })
  await page.getByRole('button',{name:'场景',exact:true}).waitFor().catch(async e=>{throw Error(JSON.stringify({errors,html:await page.locator('body').innerHTML()}),{cause:e})});await page.getByRole('button',{name:'场景',exact:true}).click()
  await page.getByText('还没有场景',{exact:true}).waitFor()
  assert.equal(await page.getByRole('dialog').count(),0)
  assert.equal(await page.evaluate(()=>calls.filter(x=>x.path.endsWith('/create-session')).length),0)
  const captures=join(import.meta.dirname,'../../../../dev/artifacts/test-results/scene-empty-20261102');mkdirSync(captures,{recursive:true})
  for(const width of [360,1100])for(const dark of [false,true]){
   await page.setViewportSize({width,height:720})
   await page.evaluate(dark=>{document.body.toggleAttribute('data-ds-dark-theme',dark);document.documentElement.style.colorScheme=dark?'dark':'light'},dark)
   await page.locator('#sidebar').screenshot({path:join(captures,`${width}-${dark?'dark':'light'}.png`)})
   assert.equal(await page.getByRole('dialog').count(),0)
  }
  await page.getByRole('button',{name:'安装场景',exact:true}).click()
  assert.ok((await page.evaluate(()=>panels)).includes('beellix-platform'))
  assert.equal(await page.getByRole('link',{name:'安装场景',exact:true}).count(),0)
  await page.evaluate(()=>{window.installed=window.available;window.dispatchEvent(new Event('online'))})
  await page.locator('.beellix-scene-empty').getByRole('button',{name:'添加已安装场景',exact:true}).click()
  await page.getByRole('dialog',{name:'添加场景',exact:true}).waitFor()
  await page.getByRole('button',{name:'添加 会议纪要',exact:true}).waitFor()
  assert.equal(await page.getByRole('button',{name:'添加 会议纪要',exact:true}).isDisabled(),true)
  await page.getByRole('searchbox',{name:'搜索已安装场景'}).fill('建筑')
  assert.equal(await page.getByRole('button',{name:'添加 会议纪要',exact:true}).count(),0)
  await page.getByRole('button',{name:'添加 智能报价-建筑',exact:true}).click()
  await page.waitForFunction(()=>current.key==='new-smart-quotation')
  assert.equal(await page.getByRole('dialog').count(),0)
  assert.deepEqual(await page.evaluate(()=>calls.filter(x=>x.path.endsWith('/create-session')).map(x=>x.body.sceneId)),['smart-quotation'])
  await page.getByRole('button',{name:'添加已安装场景',exact:true}).click()
  await page.getByRole('button',{name:'打开 智能报价-建筑',exact:true}).waitFor()
  const artifact=join(import.meta.dirname,"../../../../dev/artifacts/test-results/scene-workflow");mkdirSync(artifact,{recursive:true});await page.screenshot({path:join(artifact,'scene-picker.png')})
  await page.getByRole('dialog').getByRole('button',{name:'关闭',exact:true}).click()
  await page.getByRole('button',{name:'工作区',exact:true}).click()
  await page.waitForFunction(()=>nativeNew===1)
  assert.equal(await page.evaluate(()=>calls.filter(x=>x.path.endsWith('/create-workspace-session')).length),0)
  assert.deepEqual(errors,[])
 }finally{await browser.close()}
})
