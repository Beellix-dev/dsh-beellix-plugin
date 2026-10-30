import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import vm from 'node:vm'
import React from 'react'
import * as ReactDom from 'react-dom'
import * as ReactJSX from 'react/jsx-runtime'
import { renderToStaticMarkup } from 'react-dom/server'
import { BootstrapView, zh, en } from '../src/panel.mjs'

const t = key => zh[key] ?? key
test('初始化界面显示真实目标位置，受阻时禁用写入操作并解释原因', () => {
  const html = renderToStaticMarkup(React.createElement(BootstrapView, { snapshot: { status: 'blocked', root: 'D:/DSH/DSH NEXT/Beellix', message: '目录已有内容', directories: [] }, t }))
  assert.match(html, /D:\/DSH\/DSH NEXT\/Beellix/)
  assert.match(html, /目录已有内容/)
  assert.match(html, /disabled=""/)
})
test('中台首页不重复展示健康应用卡，低频操作默认收起，不重复说明', () => {
  const html = renderToStaticMarkup(React.createElement(BootstrapView, { snapshot: { status: 'ready', root: 'D:/DSH/DSH NEXT/Beellix', version: '0.4.2', applications: { status: 'ready' }, directories: [{ path: 'knowledge', exists: true }] }, onChoose:()=>{}, onReconnect:()=>{}, t }))
  assert.match(html, /<h1[^>]*>.*中台.*<\/h1>/)
  assert.match(html, /数据目录/)
  assert.match(html, /更换目录/)
  assert.doesNotMatch(html, /应用管理|aria-label="应用"|app\.ready/)
  assert.match(html, /<details[^>]*><summary>维护与目录<\/summary>/)
  assert.doesNotMatch(html, /<details[^>]*\sopen[\s=>]/)
  const visible = html.replace(/<details\b[\s\S]*?<\/details>/g, '')
  assert.doesNotMatch(visible, /检查目录|重新接入应用|DSH 安装位置|配套目录已连接|基于 DSH|已有资料会保留|应用已接回；/)
  assert.match(html, /知识资料/)
  assert.match(html, /已建立/)
  assert.doesNotMatch(html, /disabled=""/)
  assert.deepEqual(Object.keys(en).sort(), Object.keys(zh).sort())
})

test('资料目录就绪与应用失败分别展示，多副本使用宿主选择入口',()=>{
  const failed=renderToStaticMarkup(React.createElement(BootstrapView,{snapshot:{status:'ready',applications:{status:'failed'},directories:[]},t}))
  assert.match(failed,/接入失败/)
  const choice=renderToStaticMarkup(React.createElement(BootstrapView,{snapshot:{status:'choice-required',candidates:[{root:'D:/one'},{root:'E:/two'}],directories:[]},onChoose:()=>{},t}))
  assert.match(choice,/选择已有目录/);assert.match(choice,/不合并数据/);assert.match(choice,/disabled=""/)
})

test('首次使用和待重启状态提供必要操作，不隐藏待切换位置',()=>{
  const initial=renderToStaticMarkup(React.createElement(BootstrapView,{snapshot:{status:'uninitialized',root:'D:/Beellix',directories:[]},onChoose:()=>{},t}))
  assert.match(initial,/初始化目录/);assert.match(initial,/选择已有目录/)
  const pending=renderToStaticMarkup(React.createElement(BootstrapView,{snapshot:{status:'ready',root:'D:/Beellix',pendingRoot:'E:/Beellix',applications:{status:'ready',restartRequired:true},directories:[]},t}))
  assert.match(pending,/重启后切换至/);assert.match(pending,/E:\/Beellix/);assert.match(pending,/重启生效/)
})
test('打包产物通过原生模块工厂注册主面板，不重复添加侧栏或设置页，并能释放样式', () => {
  let entry
  const styles = [], entries = [], effects = []
  const sandbox = {
    window: { __ModuleLoader__: { load(value) { entry = value } } },
    document: { defaultView: { MutationObserver: class { observe() {} disconnect() {} }, cancelAnimationFrame() {} }, body: {}, querySelector: () => null, createElement: () => ({ dataset: {}, remove() { styles.pop() } }), head: { append(value) { styles.push(value) } } },
  }
  sandbox.localStorage={getItem:()=>null,setItem(){},removeItem(){}};sandbox.window.addEventListener=()=>{};sandbox.window.removeEventListener=()=>{};
  vm.runInNewContext(readFileSync(resolve(import.meta.dirname, '../lib/client.js'), 'utf8'), sandbox)
  assert.equal(entry.id, '@beellix-ai/dsh-beellix-plugin')
  const plugin = entry.factory(name => { assert.ok(['react','react-dom','react/jsx-runtime','@deepseek-ai/dsh-client-ui-primitives'].includes(name)); return name==='react'?React:name==='react/jsx-runtime'?ReactJSX:ReactDom })
  plugin.apply({
    locale: { register: () => () => {}, bind: () => t },
    effect(fn) { effects.push(fn()) },
    slots: { inject(_name, fn) { return fn() }, register(options, component) { entries.push({ options, component }); return () => {} } },
  })
  assert.equal(styles.length, 1)
  assert.deepEqual(entries.map(item => item.options.name).sort(), ['main','main','settings.general.item','shell.overlay','sidebar.brand.mark','sidebar.brand.name','conversation.hero.brand.mark','conversation.input.left'].sort())
  assert.equal(entries.filter(item=>item.options.name==='conversation.input.left').length,1,'对话知识开关只有一个，知识业务包不得再注册一份')
  assert.equal(entries.find(item=>item.options.key==='beellix-platform').options.key, 'beellix-platform')
  const sidebarName=entries.find(item=>item.options.name==='sidebar.brand.name')
  const sidebarHtml=renderToStaticMarkup(React.createElement(sidebarName.component))
  assert.equal(sidebarHtml.replace(/<[^>]*>/g,''),'Beelli X')
  assert.doesNotMatch(sidebarHtml,/BEELLIX|\bOS\b/)
  const hero=entries.find(item=>item.options.name==='conversation.hero.brand.mark')
  const heroHtml=renderToStaticMarkup(React.createElement(hero.component))
  assert.match(heroHtml,/Beelli X/);assert.match(heroHtml,/基于 DSH 构建的智能助手/)
  assert.match(heroHtml,new RegExp(JSON.parse(readFileSync(resolve(import.meta.dirname,'../package.json'),'utf8')).version.replaceAll('.','\\.')))
  for (const dispose of effects.reverse()) dispose?.()
  assert.equal(styles.length, 0)
})

test('客户端自动接回通过授权 POST，两个入口共享一次准备流程',async()=>{
  let entry;const entries=[],calls=[]
  const sandbox={URL,window:{__ModuleLoader__:{load:value=>entry=value}},document:{baseURI:'http://bootstrap.test/',defaultView:{MutationObserver:class{observe(){}disconnect(){}},cancelAnimationFrame(){}},body:{},querySelector:()=>null,createElement:()=>({dataset:{},remove(){}}),head:{append(){}}},fetch:async(url,options={})=>{
    const path=new URL(url).pathname;calls.push({path,options})
    return{ok:true,headers:{get:()=> 'application/json'},json:async()=>path.endsWith('/reconnect')?{reconnection:{items:[{application:'applied'}]}}:{status:'ready',csrfToken:'fixture-token',applications:{status:'pending'}}}
  }}
  sandbox.localStorage={getItem:()=>null,setItem(){},removeItem(){}};sandbox.window.addEventListener=()=>{};sandbox.window.removeEventListener=()=>{};
  vm.runInNewContext(readFileSync(resolve(import.meta.dirname,'../lib/client.js'),'utf8'),sandbox)
  entry.factory(name=>name==='react'?React:name==='react/jsx-runtime'?ReactJSX:ReactDom).apply({sidebarRight:{mounted:{getSnapshot:()=>undefined,subscribe:()=>()=>{}}},locale:{register:()=>()=>{},bind:()=>t},effect:fn=>fn(),slots:{inject:(_name,fn)=>fn(),register:options=>{entries.push(options);return()=>{}}}})
  const prepare=entries.find(item=>item.name==='shell.overlay').inject().prepare
  await Promise.all([prepare(),prepare()])
  const posts=calls.filter(item=>item.options.method==='POST');assert.equal(posts.length,1)
  assert.equal(posts[0].path,'/beellix/bootstrap/reconnect');assert.equal(posts[0].options.body,'{}');assert.equal(posts[0].options.headers['x-beellix-bootstrap-token'],'fixture-token')
})

test('Next 目录选择复用客户端桥，取消不提交，选中后仅提交待核验的目录',async()=>{
  let entry,chosen=null;const entries=[],calls=[]
  const sandbox={URL,__DSH_DIRECTORY_PICKER__:{pick:async()=>chosen},window:{__ModuleLoader__:{load:value=>entry=value}},document:{baseURI:'http://bootstrap.test/',defaultView:{MutationObserver:class{observe(){}disconnect(){}},cancelAnimationFrame(){}},body:{},querySelector:()=>null,createElement:()=>({dataset:{},remove(){}}),head:{append(){}}},fetch:async(url,options={})=>{calls.push({url:String(url),options});return{ok:true,headers:{get:()=> 'application/json'},json:async()=>({status:'ready',csrfToken:'fixture-token'})}}}
  sandbox.localStorage={getItem:()=>null,setItem(){},removeItem(){}};sandbox.window.addEventListener=()=>{};sandbox.window.removeEventListener=()=>{};
  vm.runInNewContext(readFileSync(resolve(import.meta.dirname,'../lib/client.js'),'utf8'),sandbox)
  entry.factory(name=>name==='react'?React:name==='react/jsx-runtime'?ReactJSX:ReactDom).apply({uiWorkspace:{pickDirectory:()=>{throw Error('不应绕过已有 Next 桥')}},locale:{register:()=>()=>{},bind:()=>t},effect:fn=>fn(),slots:{inject:(_name,fn)=>fn(),register:options=>{entries.push(options);return()=>{}}}})
  const choose=entries.find(item=>item.key==='beellix-platform').inject().chooseDirectory
  assert.equal((await choose()).selection.cancelled,true);assert.equal(calls.filter(item=>item.options.method==='POST').length,0)
  chosen='D:/fixture/Beellix';await choose()
  const post=calls.find(item=>item.options.method==='POST');assert.equal(post.options.body,JSON.stringify({directory:chosen}));assert.equal(post.options.headers['x-beellix-bootstrap-token'],'fixture-token')
})

test('中台侧栏以原生较低优先级覆盖默认项，离开后释放登记',()=>{
  let entry,disposed=0;const entries=[]
  const sandbox={window:{__ModuleLoader__:{load:value=>entry=value}},document:{defaultView:{MutationObserver:class{observe(){}disconnect(){}},cancelAnimationFrame(){}},body:{},querySelector:()=>null,createElement:()=>({dataset:{},remove(){}}),head:{append(){}}}}
  sandbox.localStorage={getItem:()=>null,setItem(){},removeItem(){}};sandbox.window.addEventListener=()=>{};sandbox.window.removeEventListener=()=>{};
  vm.runInNewContext(readFileSync(resolve(import.meta.dirname,'../lib/client.js'),'utf8'),sandbox)
  entry.factory(name=>name==='react'?React:name==='react/jsx-runtime'?ReactJSX:ReactDom).apply({sidebarRight:{mounted:{getSnapshot:()=>undefined,subscribe:()=>()=>{}}},locale:{register:()=>()=>{},bind:()=>t},effect:fn=>fn(),slots:{inject:(_name,fn)=>fn(),register:options=>{entries.push(options);return()=>{disposed++}}},layout:{selectPanel(){},toggleSidebar(){}}})
  const release=entries.find(row=>row.key==='beellix-platform').inject().mountNavigation({})
  const sidebar=entries.find(row=>row.name==='sidebar')
  assert.ok(sidebar.priority<0,'DSH 最低优先级生效，必须优先于默认0')
  release();assert.equal(disposed,1)
})
