import {safeChromiumOptions} from "../../../../dev/scripts/browser-launch-options.mjs"
import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import ts from 'typescript'
import {chromium} from 'playwright'
import {createRequire} from 'node:module'
import {dirname,join} from 'node:path'
const require=createRequire(import.meta.url)
test('工作区普通列表与搜索排除场景记录，迟到归属即时生效；原始数据和回调保留',async()=>{
 const browser=await chromium.launch(safeChromiumOptions({...process.platform==='win32'?{channel:'msedge'}:{},headless:true}))
 try{
  const page=await browser.newPage();page.setDefaultTimeout(3000);const errors=[];page.on('pageerror',error=>errors.push(error.message))
  await page.setContent('<div id="root"></div>')
  for(const name of ['react','react-dom'])await page.addScriptTag({path:join(dirname(require.resolve(name+'/package.json')),'umd/'+name+'.development.js')})
  const code=ts.transpileModule(readFileSync(new URL('../src/workspace-scope.mjs',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText
  await page.addScriptTag({content:`window.scopeModule={exports:{}};(function(require,module,exports){${code}\n})(()=>React,scopeModule,scopeModule.exports);`})
  await page.evaluate(()=>{
   const listeners=new Set(),dataListeners=new Set();window.view={ready:false,links:{}};window.callbacks=[]
   window.data={ids:['plain','scene','legacy','child'],byId:{plain:{id:'plain',displayTitle:'普通对话'},scene:{id:'scene',displayTitle:'场景对话',projectionValues:{agentPreset:'standard'}},legacy:{id:'legacy',displayTitle:'旧场景对话',projectionValues:{agentPreset:'beellix-scene'}},child:{id:'child',parentId:'scene',origin:'subagent',displayTitle:'场景子代理'}}}
   window.workspace={items:[{workspaceId:'all',title:'项目',sessionIds:data.ids}],archivedSessionIds:['scene'],pinnedSessionIds:['scene','plain']}
   window.change=value=>{view=value;for(const fn of listeners)fn()}
   function NativeFixture({useSessions,useWorkspaces,startSession,searchSessions,renderSlot}){const sessions=useSessions(x=>x),workspaces=useWorkspaces(x=>x),[results,setResults]=React.useState([]);return React.createElement('div',null,React.createElement('button',{onClick:startSession},'新建工作区对话'),React.createElement('button',{onClick:async()=>setResults((await searchSessions('query')).items)},'搜索'),React.createElement('ul',{'aria-label':'原生工作区列表'},...sessions.ids.map(id=>React.createElement('li',{key:id},sessions.byId[id].displayTitle))),React.createElement('ul',{'aria-label':'搜索结果'},...results.map(row=>React.createElement('li',{key:row.sessionId},row.sessionId))),React.createElement('span',null,'置顶：'+workspaces.pinnedSessionIds.join(',')),renderSlot('native.action',{}))}
   const subscribe=fn=>{dataListeners.add(fn);return()=>dataListeners.delete(fn)}
   // 原生注入的是会调用 React Hook 的读取函数；纯 selector 会漏掉加载完成时的 Hook 顺序错误。
   const nativeProps={renderSlot:(key)=>React.createElement('button',{onClick:()=>callbacks.push(key)},'原生菜单操作'),startSession:()=>callbacks.push('native-new'),searchSessions:async()=>new Promise(resolve=>window.resolveSearch=resolve),useSessions:selector=>selector(React.useSyncExternalStore(subscribe,()=>data)),useWorkspaces:selector=>selector(React.useSyncExternalStore(subscribe,()=>workspace))}
   window.original={options:{},children:{'native.action':{kind:'list',scope:'root'}},component:NativeFixture,inject:()=>nativeProps}
   let registered
   const ctx={sessions:{list:{getSnapshot:()=>data,subscribe:fn=>{dataListeners.add(fn);return()=>dataListeners.delete(fn)}}},workspaces:{list:{getSnapshot:()=>workspace,subscribe:fn=>{dataListeners.add(fn);return()=>dataListeners.delete(fn)}}},slots:{entries:()=>[original],subscribe:()=>()=>{},register:(options,component)=>{registered={options,component};return()=>registered=undefined}}}
   window.dispose=scopeModule.exports.installWorkspaceScope(ctx,{getSnapshot:()=>view,subscribe:fn=>{listeners.add(fn);return()=>listeners.delete(fn)}})
   window.root=ReactDOM.createRoot(document.querySelector('#root'));root.render(React.createElement(original.component,nativeProps))
   window.restoreNative=()=>root.render(React.createElement(original.component,nativeProps))
  })
  await page.getByRole('list',{name:'原生工作区列表'}).getByText('普通对话',{exact:true}).waitFor()
  assert.equal(await page.getByRole('status').filter({hasText:'正在读取工作区'}).count(),0)
  await page.evaluate(()=>change({ready:false,links:{},error:'配套目录不可用'}))
  await page.getByRole('list',{name:'原生工作区列表'}).getByText('普通对话',{exact:true}).waitFor()
  await page.getByRole('button',{name:'新建工作区对话'}).click();assert.deepEqual(await page.evaluate(()=>callbacks),['native-new'])
  assert.deepEqual(await page.evaluate(()=>data.ids),['plain','scene','legacy','child'])
  await page.evaluate(()=>{callbacks=[]})
  await page.evaluate(()=>change({ready:true,links:{scene:'quotation'}}))
  await page.getByText('普通对话',{exact:true}).waitFor()
  for(const text of ['场景对话','旧场景对话','场景子代理'])assert.equal(await page.getByText(text,{exact:true}).count(),0)
  await page.getByRole('button',{name:'新建工作区对话'}).click();assert.deepEqual(await page.evaluate(()=>callbacks),['native-new']);await page.getByRole('button',{name:'原生菜单操作'}).click();assert.deepEqual(await page.evaluate(()=>callbacks),['native-new','native.action'])
  await page.getByRole('button',{name:'搜索',exact:true}).click();await page.waitForFunction(()=>typeof resolveSearch==='function')
  await page.evaluate(()=>{change({...view,links:{scene:'quotation','new-bound':'quotation'}});resolveSearch({items:[{sessionId:'plain'},{sessionId:'scene'},{sessionId:'new-bound'}],hasMore:false})})
  await page.getByRole('list',{name:'搜索结果'}).getByText('plain',{exact:true}).waitFor();assert.equal(await page.getByRole('list',{name:'搜索结果'}).locator('li').count(),1)
  assert.deepEqual(await page.evaluate(()=>data.ids),['plain','scene','legacy','child'])
  // 失去场景服务再恢复不能卸空原生组件，也不能改变其 Hook 调用顺序。
  for(let i=0;i<2;i++){
   await page.evaluate(()=>change({ready:false,links:{},error:'暂时离线'}))
   await page.getByRole('list',{name:'原生工作区列表'}).getByText('场景对话',{exact:true}).waitFor()
   await page.evaluate(()=>change({ready:true,links:{scene:'quotation'}}))
   await page.getByRole('list',{name:'原生工作区列表'}).getByText('普通对话',{exact:true}).waitFor()
   assert.equal(await page.getByRole('list',{name:'原生工作区列表'}).getByText('场景对话',{exact:true}).count(),0)
  }
  assert.deepEqual(errors,[],'原生 Hook 在加载、失败、恢复及归属更新过程中均无渲染错误')
  await page.evaluate(()=>{dispose();restoreNative()});await page.getByRole('list',{name:'原生工作区列表'}).getByText('场景对话',{exact:true}).waitFor()
 }finally{await browser.close()}
})
