import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync,mkdirSync} from 'node:fs'
import {createRequire} from 'node:module'
import {dirname,join} from 'node:path'
import ts from 'typescript'
import {chromium} from 'playwright'
import {safeChromiumOptions} from '../../../../dev/scripts/browser-launch-options.mjs'
import {browserModules} from './browser-modules.mjs'
import {browserTheme} from './browser-theme.mjs'
const require=createRequire(import.meta.url),nativeFixture=JSON.parse(readFileSync(new URL('../../../../test/fixtures/native-agent-preset.json',import.meta.url),'utf8'))
const compile=source=>ts.transpileModule(source,{fileName:'mode.tsx',compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText
test('场景入口沿原生字体，工作区创造预选和场景显示相互独立',async t=>{
 const browser=await chromium.launch(safeChromiumOptions({...process.platform==='win32'?{channel:'msedge'}:{},headless:true}))
 try{
  const page=await browser.newPage({viewport:{width:900,height:360}}),errors=[];page.on('pageerror',error=>errors.push(error.message))
  await page.setContent('<style>button{font-family:inherit}body{margin:24px;font:16px var(--dsw-font-family);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary)}.row{display:flex;align-items:center;gap:12px;min-width:0;max-width:100%;margin-bottom:20px}.workspace{flex:none;font-size:13px;font-weight:500;line-height:20px}</style><div class="row"><span class="workspace">默认工作区</span><div id="native"></div></div><div class="row"><span class="workspace">默认工作区</span><div id="scene"></div></div>')
  for(const pkg of ['react','react-dom'])await page.addScriptTag({path:join(dirname(require.resolve(pkg+'/package.json')),'umd/'+pkg+'.development.js')})
  await browserModules(page);await browserTheme(page)
  await page.addStyleTag({content:nativeFixture.seatCss});await page.addStyleTag({content:readFileSync(new URL('../src/scenes.css',import.meta.url),'utf8')})
  const modules={native:compile(nativeFixture.seatSource),scene:compile(readFileSync(new URL('../src/mode-seat.mjs',import.meta.url),'utf8'))}
  await page.evaluate(modules=>{
   const names={standard:'标准模式',ptc:'PTC 模式',minimal:'极简模式',cordis:'创造模式'},load=name=>{const module={exports:{}};new Function('require','module','exports',modules[name])(id=>id.endsWith('.css')?{__esModule:true,default:new Proxy({},{get:(_target,key)=>String(key)})}:id==='./locales.ts'?{presetDisplayText:option=>({name:names[option.id]})}:id==='./settings-store.ts'?{requiresCodingTools:()=>false}:moduleRequire(id),module,module.exports);return module.exports}
   const Native=load('native').AgentPresetSeat,Scene=load('scene').ModeSeat;window.mode='cordis';window.variant=undefined;window.selectionWrites=[];window.sceneView={ready:true,mode:'scenes',links:{}};window.session={projectionValues:{agentPreset:'cordis'}}
   const nativeRoot=ReactDOM.createRoot(document.querySelector('#native')),sceneRoot=ReactDOM.createRoot(document.querySelector('#scene'))
   window.render=()=>{nativeRoot.render(React.createElement(Native,{useDeveloperTools:selector=>selector(true),useAgentPresetSeat:selector=>selector({current:mode,options:Object.keys(names).map(id=>({id})),error:null,busy:false}),useSessionRetainInfo:selector=>selector(undefined),load:async()=>{},select:async id=>{selectionWrites.push(id);mode=id;render()},dismissRefusal:()=>{},introduced:()=>{},t:key=>key}));sceneRoot.render(React.createElement(Scene,{sessionId:'workspace',variant,useSceneView:selector=>selector(sceneView),useSessions:selector=>selector({byId:{workspace:session}})}))};render()
  },modules)
  await page.locator('#native button').waitFor();await page.locator('#scene .beellix-mode-seat').waitFor()
  await t.test('字号、字重、行高、字体、间距及高度与真实原生模式入口一致',async()=>{
   const metrics=selector=>page.locator(selector).evaluate(element=>{const style=getComputedStyle(element);return Object.fromEntries(['fontFamily','fontSize','fontWeight','lineHeight','columnGap','paddingTop','paddingRight','paddingBottom','paddingLeft','minHeight'].map(key=>[key,style[key]]))})
   assert.deepEqual(await metrics('#scene .beellix-mode-seat'),await metrics('#native button'))
  })
  await t.test('工作区创造模式不能成为场景文案，往返切换不写原生预选',async()=>{
   assert.equal(await page.locator('#scene').innerText(),'场景模式');assert.equal(await page.locator('#native .seatLabel').innerText(),'创造模式')
   for(const preset of ['standard','ptc','minimal','cordis']){await page.evaluate(preset=>{mode=preset;session={projectionValues:{agentPreset:preset}};render()},preset);await page.locator('#native .seatLabel').filter({hasText:({standard:'标准模式',ptc:'PTC 模式',minimal:'极简模式',cordis:'创造模式'})[preset]}).waitFor();assert.equal(await page.locator('#scene').innerText(),'场景模式')}
   assert.deepEqual(await page.evaluate(()=>selectionWrites),[])
  })
  const captures=join(import.meta.dirname,'../../../../dev/artifacts/test-results/mode-seat-20261102');mkdirSync(captures,{recursive:true})
  for(const width of [360,900])for(const dark of [false,true]){await page.setViewportSize({width,height:360});await page.evaluate(dark=>document.body.toggleAttribute('data-ds-dark-theme',dark),dark);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.screenshot({path:join(captures,`${width}-${dark?'dark':'light'}.png`)})}
  assert.deepEqual(errors,[])
 }finally{await browser.close()}
})
