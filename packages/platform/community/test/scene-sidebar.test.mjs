import {safeChromiumOptions} from "../../../../dev/scripts/browser-launch-options.mjs"
import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {chromium} from 'playwright'
test('原工作区保持原节点和操作，切换仅隐藏原列表，卸载恢复',async()=>{
  const code=readFileSync(new URL('../src/host-compatibility.mjs',import.meta.url),'utf8').replaceAll('export function','function')+'\n'+readFileSync(new URL('../src/scene-sidebar.mjs',import.meta.url),'utf8').replace(/import .*host-compatibility.mjs'\r?\n/u,'')
  const browser=await chromium.launch(safeChromiumOptions({...process.platform==='win32'?{channel:'msedge'}:{},headless:true}))
  try{
    const page=await browser.newPage();await page.setContent('<div data-slot="sidebar"><button aria-label="新建会话">新会话</button><div data-slot="sidebar.workspaces"><div id="native"><div id="header"><span>工作区</span><button id="search">搜索</button></div><div role="tree" id="original">原生会话</div></div></div></div>')
    await page.evaluate(async code=>{const{installSceneSidebar}=await import('data:text/javascript;base64,'+btoa(unescape(encodeURIComponent(code))));window.original=document.querySelector('#original');window.targets=null;window.mode='workspace';window.newCount=0;window.issues=[];window.disposeScene=installSceneSidebar({document,onTargets:targets=>{window.targets=targets},getMode:()=>window.mode,onNewSession:()=>window.newCount++,compatibility:{report:issue=>window.issues.push(issue),clear:()=>{}}})},code)
    await page.waitForFunction(()=>window.targets?.head.isConnected)
    assert.equal(await page.locator('#original').isVisible(),true)
    await page.evaluate(()=>{window.mode='scenes';window.targets.refresh()})
    assert.equal(await page.locator('#original').isVisible(),false)
    await page.getByRole('button',{name:'新建会话',exact:true}).click();assert.equal(await page.evaluate(()=>window.newCount),1)
    await page.evaluate(()=>{window.mode='workspace';window.targets.refresh()})
    assert.equal(await page.locator('#original').isVisible(),true)
    assert.equal(await page.evaluate(()=>window.original===document.querySelector('#original')),true)
    await page.evaluate(()=>{document.querySelector('#header span').textContent='Unknown host layout';window.targets.refresh()})
    assert.equal(await page.locator('#original').isVisible(),true);assert.equal(await page.locator('[data-beellix-scene-head]').count(),0);assert.equal(await page.evaluate(()=>window.issues.at(-1).code),'NATIVE_SIDEBAR_SHAPE_CHANGED')
    await page.evaluate(()=>window.disposeScene());assert.equal(await page.locator('[data-beellix-scene-head]').count(),0);assert.equal(await page.locator('#header span').isVisible(),true)
    await page.evaluate(async code=>{document.querySelector('[data-slot="sidebar.workspaces"]').innerHTML='<div data-beellix-workspace-state="loading" role="status">正在读取工作区…</div>';window.issues=[];const{installSceneSidebar}=await import('data:text/javascript;base64,'+btoa(unescape(encodeURIComponent(code))));window.disposeLoading=installSceneSidebar({document,onTargets:()=>{},getMode:()=> 'workspace',onNewSession:()=>{},compatibility:{report:issue=>issues.push(issue),clear:()=>{}}})},code)
    assert.deepEqual(await page.evaluate(()=>issues),[],'中台自己的加载占位不能误报 DSH 导航变更')
    await page.evaluate(()=>window.disposeLoading())
  }finally{await browser.close()}
})
