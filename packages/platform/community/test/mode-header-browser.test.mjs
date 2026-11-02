import {safeChromiumOptions} from "../../../../dev/scripts/browser-launch-options.mjs"
import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {createRequire} from 'node:module'
import {dirname,join} from 'node:path'
import ts from 'typescript'
import {chromium} from 'playwright'
import {browserModules} from './browser-modules.mjs'
const nativeFixture=JSON.parse(readFileSync(new URL('../../../../test/fixtures/native-agent-preset.json',import.meta.url),'utf8'));const require=createRequire(import.meta.url),compile=(text,jsx=false)=>ts.transpileModule(text,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText

test('已开始会话顶部按可信归属显示场景，普通会话沿原生标签，团队保留且不修改执行预设',async()=>{
 const browser=await chromium.launch(safeChromiumOptions({...process.platform==='win32'?{channel:'msedge'}:{},headless:true}))
 try{
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(2500)
  await page.setContent('<div id="quote"></div><div id="plain"></div>')
  await page.addStyleTag({content:readFileSync(new URL('../src/scenes.css',import.meta.url),'utf8')})
  for(const name of ['react','react-dom'])await page.addScriptTag({path:join(dirname(require.resolve(name+'/package.json')),'umd/'+name+'.development.js')})
  await browserModules(page)
  const modules={control:compile(readFileSync(new URL('../src/mode-control.mjs',import.meta.url),'utf8')),seat:compile(readFileSync(new URL('../src/mode-seat.mjs',import.meta.url),'utf8')),native:compile(nativeFixture.headerSource,true)}
  await page.evaluate(modules=>{
   const names={standard:'标准模式',ptc:'PTC 模式',minimal:'极简模式',cordis:'创造模式'},cache={}
   const load=name=>{if(cache[name])return cache[name];const module={exports:{}};cache[name]=module.exports;new Function('require','module','exports',modules[name])(id=>{
    if(id==='./host-compatibility.mjs')return{filterNativePresetSnapshot:state=>state}
    if(id==='./locales.ts')return{presetDisplayText:option=>({name:names[option.id],description:'原生模式'})}
    if(id.endsWith('.css'))return new Proxy({},{get:(_t,key)=>String(key)})
    return window.moduleRequire(id)
   },module,module.exports);return module.exports}
   const h=React.createElement,listeners=new Set(),viewListeners=new Set(),slotListeners=new Set()
   window.view={ready:true,mode:'scenes',links:{quote:'smart-quotation'}}
   window.sessions={byId:{quote:{id:'quote',blank:false,projectionValues:{agentPreset:'standard'}},plain:{id:'plain',blank:false,projectionValues:{agentPreset:'standard'}}}}
   const roster={options:Object.keys(names).map(id=>({id}))}
   window.header={options:{id:'agent-preset',order:-10},component:load('native').AgentPresetLabel}
   window.nativeHeader=header.component;window.teamClicks=0
   window.team={options:{id:'agent-team',order:-20},component:()=>h('button',{onClick:()=>window.teamClicks++},'智能体团队')}
   const extras=[],ctx={slots:{entries:name=>name==='conversation.session.header.actions'?[team,header,...extras]:[],subscribe:(_name,listener)=>{slotListeners.add(listener);return()=>slotListeners.delete(listener)},register:(options,component)=>{const entry={options,component};extras.push(entry);for(const fn of slotListeners)fn();return()=>{extras.splice(extras.indexOf(entry),1);for(const fn of slotListeners)fn()}}}}
   window.dispose=load('control').installModeSeat(ctx,{subscribe:fn=>{viewListeners.add(fn);return()=>viewListeners.delete(fn)},getSnapshot:()=>view},load('seat').ModeSeat)
   const useSessions=selector=>React.useSyncExternalStore(fn=>{listeners.add(fn);return()=>listeners.delete(fn)},()=>selector(sessions))
   const roots={quote:ReactDOM.createRoot(document.querySelector('#quote')),plain:ReactDOM.createRoot(document.querySelector('#plain'))}
   window.render=()=>{for(const [id,root]of Object.entries(roots))root.render(h(React.Fragment,null,h(team.component),h(header.component,{sessionId:id,useSessions,useAgentPresets:selector=>selector(roster),load:async()=>{},t:key=>key})))}
   window.update=(nextView,nextSessions)=>{view=nextView;sessions=nextSessions;for(const fn of viewListeners)fn();for(const fn of listeners)fn();render()};render()
  },modules)
  await page.locator('#quote').getByLabel('执行模式：场景模式',{exact:true}).waitFor()
  assert.equal(await page.locator('#quote').getByText('标准模式',{exact:true}).count(),0)
  assert.equal(await page.locator('#plain').getByText('标准模式',{exact:true}).count(),1,'全局在场景视图也不能把普通会话标成场景')
  assert.equal(await page.locator('#quote').getByLabel('执行模式：场景模式',{exact:true}).getAttribute('aria-haspopup'),null)
  await page.locator('#quote').getByRole('button',{name:'智能体团队',exact:true}).click();assert.equal(await page.evaluate(()=>teamClicks),1)
  await page.evaluate(()=>update({...view,mode:'workspace'},{byId:{...sessions.byId,quote:{...sessions.byId.quote,projectionValues:{agentPreset:'ptc'}}}}))
  await page.locator('#quote').getByLabel('执行模式：场景模式',{exact:true}).waitFor()
  assert.match(await page.locator('#quote .beellix-mode-seat').getAttribute('title'),/历史场景会话的执行组成：PTC 模式/)
  assert.equal(await page.locator('#plain').getByText('标准模式',{exact:true}).count(),1)
  assert.equal(await page.evaluate(()=>sessions.byId.quote.projectionValues.agentPreset),'ptc')
  await page.evaluate(()=>update({...view,links:{parent:'smart-quotation'}},{byId:{...sessions.byId,quote:{id:'quote',origin:'subagent',parentId:'parent',projectionValues:{agentPreset:'standard'}}}}))
  await page.locator('#quote').getByLabel('执行模式：场景模式',{exact:true}).waitFor()
  await page.evaluate(()=>{dispose();render()})
  await page.locator('#quote').getByText('标准模式',{exact:true}).waitFor()
  assert.equal(await page.evaluate(()=>header.component===nativeHeader),true);assert.deepEqual(errors,[])
 }finally{await browser.close()}
})
