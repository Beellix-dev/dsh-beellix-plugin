import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync,mkdirSync} from 'node:fs'
import {createRequire} from 'node:module'
import {join,dirname} from 'node:path'
import ts from 'typescript'
import {chromium} from 'playwright'
import {safeChromiumOptions} from '../../../../dev/scripts/browser-launch-options.mjs'
import {browserModules} from './browser-modules.mjs'
import {browserTheme} from './browser-theme.mjs'
const require=createRequire(import.meta.url),nativeFixture=JSON.parse(readFileSync(new URL('../../../../test/fixtures/native-agent-preset.json',import.meta.url),'utf8'))
async function setup(){
 const browser=await chromium.launch(safeChromiumOptions({...process.platform==='win32'?{channel:'msedge'}:{},headless:true}))
 try{
 const page=await browser.newPage({viewport:{width:420,height:400}});page.setDefaultTimeout(2200)
 await page.setContent('<style>body{margin:0;padding:24px;box-sizing:border-box;font:14px system-ui;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary)}#root{margin-top:200px}</style><div id="root"></div>')
 for(const pkg of ['react','react-dom'])await page.addScriptTag({path:join(dirname(require.resolve(pkg+'/package.json')),'umd/'+pkg+'.development.js')})
 await browserModules(page);await browserTheme(page)
 await page.addStyleTag({content:readFileSync(new URL('../src/style.css',import.meta.url),'utf8')})
 await page.addStyleTag({content:nativeFixture.switchCss.replaceAll('.switch','.native-switch').replaceAll('.thumb','.native-thumb')})
 const switchSource=ts.transpileModule(nativeFixture.switchSource,{fileName:'Switch.tsx',compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText
 const source=readFileSync(new URL('../src/knowledge-switch.mjs',import.meta.url),'utf8').replace("import React,{useEffect,useRef,useState} from 'react'","const React=window.React,{useEffect,useRef,useState}=React").replace("import {Switch} from '@deepseek-ai/dsh-client-ui-primitives'","const {Switch}=window.knowledgePrimitives").replace("import {ConsoleIcon} from './console-icons.mjs'","const {ConsoleIcon}=window.knowledgeIcons")
 const icons=readFileSync(new URL('../src/console-icons.mjs',import.meta.url),'utf8').replace("import React from 'react'","const React=window.React")
 await page.evaluate(async({source,icons,switchSource})=>{const module={exports:{}};new Function('require','module','exports',switchSource)(id=>id==='clsx'?{__esModule:true,default:(...args)=>args.filter(Boolean).join(' ')}:id.endsWith('.css')?{__esModule:true,default:{switch:'native-switch',thumb:'native-thumb'}}:moduleRequire(id),module,module.exports);window.knowledgePrimitives=module.exports;window.knowledgeIcons=await import('data:text/javascript;base64,'+btoa(unescape(encodeURIComponent(icons))));window.KnowledgeModule=await import('data:text/javascript;base64,'+btoa(unescape(encodeURIComponent(source))));window.KnowledgeSwitch=KnowledgeModule.KnowledgeSwitch},{source,icons,switchSource})
 if(process.env.BEELLIX_KNOWLEDGE_SWITCH_CLIENT){
  const client=readFileSync(process.env.BEELLIX_KNOWLEDGE_SWITCH_CLIENT,'utf8'),marker='"./knowledge-switch.mjs":(require)=>{',start=client.indexOf(marker),end=client.indexOf('\nreturn module.exports;}',start)
  assert.ok(start>=0&&end>start,'最终客户端必须包含实际知识入口模块')
  const factory=client.slice(start+marker.length,end)+'\nreturn module.exports;'
  await page.evaluate(factory=>{window.KnowledgeModule=new Function('require',factory)(id=>id==='./console-icons.mjs'?knowledgeIcons:id==='@deepseek-ai/dsh-client-ui-primitives'?knowledgePrimitives:moduleRequire(id));window.KnowledgeSwitch=KnowledgeModule.KnowledgeSwitch},factory)
 }
 return{browser,page}
 }catch(error){await browser.close();throw error}
}
test('原生知识开关无可见文字，切会话解除保存锁，迟到写入不覆盖新会话',async()=>{
 const {browser,page}=await setup()
 try{
 await page.evaluate(()=>{window.pending=[];window.calls=[];window.states={};window.read=async(id,input)=>{calls.push({id,input});if(input)return new Promise((resolve,reject)=>pending.push({resolve,reject,id})).then(value=>states[id]=value);return states[id]??{sessionId:id,installed:true,status:'ready',enabled:false,revision:0,spaceIds:[],selectedSpaceIds:[],spaces:[{id:id+'-space',title:'空间'+id}],csrfToken:'fixture'}};const root=ReactDOM.createRoot(document.querySelector('#root'));window.mount=id=>root.render(React.createElement(KnowledgeSwitch,{sessionId:id,read}));mount('a')})
 const toggle=page.getByRole('switch',{name:'当前对话知识库',exact:true})
 await toggle.waitFor();assert.equal(await page.locator('.beellix-knowledge-switch').innerText(),'');assert.equal(await toggle.evaluate(node=>getComputedStyle(node).width),'36px')
 await toggle.click();await page.waitForFunction(()=>pending.length===1)
 await page.evaluate(()=>mount('b'));await page.waitForFunction(()=>calls.some(row=>row.id==='b'))
 await page.getByRole('button',{name:'选择知识空间',exact:true}).click();await page.getByText('空间b',{exact:true}).waitFor();assert.equal(await toggle.isEnabled(),true)
 await page.evaluate(()=>pending[0].resolve({installed:true,status:'ready',enabled:true,revision:1,spaceIds:['a-space'],selectedSpaceIds:['a-space'],spaces:[{id:'a-space',title:'空间a'}]}));assert.equal(await page.getByText('空间a',{exact:true}).count(),0)
 await toggle.click();await page.waitForFunction(()=>pending.length===2)
 await page.evaluate(()=>pending[1].resolve({installed:true,status:'ready',enabled:true,revision:1,spaceIds:['b-space'],selectedSpaceIds:['b-space'],spaces:[{id:'b-space',title:'空间b'}]}));await page.waitForFunction(()=>document.querySelector('[role=switch]').getAttribute('aria-checked')==='true')
 await page.keyboard.press('Escape')
 const output=join(import.meta.dirname,'../../../../dev/artifacts/test-results/knowledge-toggle-20261102');mkdirSync(output,{recursive:true})
 for(const dark of [false,true]){await page.evaluate(dark=>document.body.toggleAttribute('data-ds-dark-theme',dark),dark);await page.screenshot({path:join(output,dark?'dark.png':'light.png'),animations:'disabled'})}
 await toggle.click();await page.waitForFunction(()=>pending.length===3)
 await page.evaluate(()=>pending[2].reject(Error('保存失败，请重试')))
 await page.getByRole('alert').filter({hasText:'保存失败，请重试'}).waitFor()
 assert.equal(await toggle.getAttribute('aria-checked'),'true','写入失败后保留服务端原状态')
 }finally{await browser.close()}
})
test('未安装时隐藏开关，安装后未就绪禁用，刷新就绪及卸载立即反映',async()=>{
 const {browser,page}=await setup()
 try{
 await page.evaluate(()=>{window.status='not-installed';window.reads=0;window.pluginListeners=new Set();window.stopKnowledge=KnowledgeModule.installKnowledgeSwitch({slots:{inject:(_name,fn)=>fn(),register:()=>()=>{}}},{changes:{subscribe:fn=>{pluginListeners.add(fn);return()=>pluginListeners.delete(fn)}}});ReactDOM.createRoot(document.querySelector('#root')).render(React.createElement(KnowledgeSwitch,{sessionId:'fresh',read:async()=>{reads++;return{sessionId:'fresh',installed:status!=='not-installed',status,enabled:false,revision:0,spaceIds:[],selectedSpaceIds:[],spaces:status==='ready'?[{id:'s',title:'可用空间'}]:[]}}}))})
 await page.waitForFunction(()=>reads===1);assert.equal(await page.locator('#root').innerText(),'');assert.equal(await page.getByRole('switch').count(),0)
 await page.evaluate(()=>{status='uninitialized';pluginListeners.forEach(fn=>fn())})
 const toggle=page.getByRole('switch',{name:'当前对话知识库',exact:true});await toggle.waitFor();assert.equal(await toggle.isDisabled(),true)
 await page.evaluate(()=>{status='ready';dispatchEvent(new Event('beellix:knowledge-change'))});await page.waitForFunction(()=>!document.querySelector('[role=switch]').disabled);await page.getByRole('button',{name:'选择知识空间',exact:true}).click();await page.getByText('可用空间',{exact:true}).waitFor();assert.equal(await toggle.isEnabled(),true)
 await page.evaluate(()=>{status='not-installed';pluginListeners.forEach(fn=>fn())});await page.waitForFunction(()=>!document.querySelector('[role=switch]'));assert.equal(await page.getByRole('dialog').count(),0);await page.evaluate(()=>stopKnowledge());assert.equal(await page.evaluate(()=>pluginListeners.size),0)
 }finally{await browser.close()}
})

test('未就绪或没有空间时直接打开知识库，不显示重复提示弹层；就绪后才选择空间',async()=>{
 const {browser,page}=await setup()
 try{
  await page.evaluate(()=>{window.knowledgeStatus='uninitialized';window.hasSpaces=false;window.opened=0;window.writes=0;const read=async(id,input)=>{if(input)writes++;return{sessionId:id,installed:true,status:knowledgeStatus,enabled:false,revision:0,selectedSpaceIds:[],spaces:hasSpaces?[{id:'s',title:'实际知识空间'}]:[]}};ReactDOM.createRoot(document.querySelector('#root')).render(React.createElement(KnowledgeSwitch,{sessionId:'one',read,openKnowledge:()=>opened++}))})
  const open=page.getByRole('button',{name:'打开知识库',exact:true})
  await open.click();assert.equal(await page.evaluate(()=>opened),1);assert.equal(await page.getByRole('dialog').count(),0)
  for(const status of ['unavailable','database-required','paused','ready']){
   await page.evaluate(status=>{knowledgeStatus=status;dispatchEvent(new Event('beellix:knowledge-change'))},status)
   await open.click();assert.equal(await page.getByRole('dialog').count(),0)
  }
  assert.equal(await page.evaluate(()=>opened),5);assert.equal(await page.evaluate(()=>writes),0)
  await page.evaluate(()=>{hasSpaces=true;dispatchEvent(new Event('beellix:knowledge-change'))})
  const choose=page.getByRole('button',{name:'选择知识空间',exact:true});await choose.click();await page.getByText('实际知识空间',{exact:true}).waitFor()
  await page.evaluate(()=>{knowledgeStatus='unavailable';dispatchEvent(new Event('beellix:knowledge-change'))})
  await page.getByRole('dialog').waitFor({state:'detached'});assert.equal(await open.isVisible(),true)
 }finally{await browser.close()}
})
