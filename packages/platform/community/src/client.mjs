/** 通过原生面板与设置槽位提供入口；样式仅作用于本包页面。 */
import { zh, en } from './panel.mjs'
import { installMoreNavigation } from './navigation.mjs'
import {SceneNavigation,StartupLanding,STARTUP_PANEL} from './scene-panel.mjs'
import {createClientSettings,ClientSettingsRows} from './client-settings.mjs'
import {installProportionalFrame} from './frame-adapter.mjs'
import { PlatformPanel, PlatformSidebar } from './usage-panel.mjs'
import { createConsoleFace } from './console-page.mjs'
import { installProductBrand, productSymbol } from './brand.mjs'
import {installModeSeat} from './mode-control.mjs'
import {installSceneSessionActions} from './scene-actions.mjs'
import {SessionMenuAction} from './scene-session-menu.mjs'
import {ModeSeat} from './mode-seat.mjs'
import {installManagedPluginNavigation} from './managed-plugins.mjs'
import {createSceneChanges} from './scene-changes.mjs'
import {createCompatibilityStore} from './host-compatibility.mjs'
import {installWorkspaceScope,installWorkspaceNavigation} from './workspace-scope.mjs'
import {installDirectoryChoices} from './directory-choices.mjs'
import {installKnowledgeSwitch} from './knowledge-switch.mjs'
import {installSceneWorkbench} from './scene-workbench.mjs'
const NS = 'beellixBootstrap'
const PANEL = 'beellix-platform'
const stylesheet = __BEELLIX_STYLESHEET__
export const inject = ['slots', 'locale', 'layout','sessions','uiSession','uiWorkspace','workspaces','sidebarRight','sidebarRightTabs','configForms','settingsSchema','remote','remote.settings','remote.llm','remote.credentials','remote.agentPresets']

async function request(path, options = {}) {
  const response = await fetch(new URL('/beellix/bootstrap/' + path, document.baseURI), { credentials: 'same-origin', cache: 'no-store', ...options })
  if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('中台接口尚未就绪，请在插件管理中检查启用状态后重试。')
  const result = await response.json()
  if (!response.ok) throw new Error(result.message ?? '中台连接暂不可用。')
  return result
}

export function apply(ctx) {
  installProductBrand(ctx)
  const sceneChanges=createSceneChanges({remote:ctx.remote,events:window}),compatibility=createCompatibilityStore()
  ctx.effect(()=>()=>sceneChanges.dispose(),'Beelli X：场景变化订阅')
  let view={mode:'workspace',links:{},ready:false};const listeners=new Set()
  const sceneView={getSnapshot:()=>view,subscribe:listener=>{listeners.add(listener);return()=>listeners.delete(listener)}}
  const setSceneView=value=>{view=value;for(const listener of listeners)listener()}
  ctx.effect(()=>installWorkspaceScope(ctx,sceneView,{retry:()=>sceneChanges.invalidate(),compatibility}),'Beelli X：工作区与场景会话分离')
  ctx.effect(()=>installDirectoryChoices(ctx,sceneView,{compatibility}),'Beelli X：执行目录显示及原生菜单投影')
  let conversationNavigation
  ctx.effect(()=>{conversationNavigation=installWorkspaceNavigation(ctx,sceneView,{compatibility});return()=>conversationNavigation.dispose()},'Beelli X：原生新会话目录目标')
  ctx.effect(()=>installModeSeat(ctx,sceneView,ModeSeat,compatibility),'Beelli X：原生工作区预设与场景标识')
  ctx.effect(()=>installSceneWorkbench(ctx,sceneView,{compatibility}),'Beelli X：固定场景工作台标签')
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'Beelli X 中台：语言')
  const t = ctx.locale.bind(NS)
  ctx.effect(() => installMoreNavigation({ document, t, logo: productSymbol, onOpen: () => ctx.layout.selectPanel(PANEL) }), 'Beelli X 中台：更多导航适配')
  ctx.effect(() => {
    const element = document.createElement('style'); element.dataset.beellixBootstrap = ''; element.textContent = stylesheet
    document.head.append(element)
    return () => element.remove()
  }, 'Beelli X 中台：局部样式')
  let modelFace
  const consoleRead = async (path, options = {}) => {
    const response = await fetch(new URL('/beellix/console/' + path, document.baseURI), { credentials: 'same-origin', cache: 'no-store', ...options })
    if (!response.headers.get('content-type')?.includes('application/json')) throw Error('中台接口尚未就绪，请刷新')
    const value = await response.json(); if (!response.ok) throw Error(value.message ?? '中台操作失败'); return value
  }
  const consoleApi = {
    read: consoleRead,
    mutate: async (path, input) => { const state = await consoleRead('state'); const value=await consoleRead(path, { method: 'POST', headers: { 'content-type': 'application/json', 'x-beellix-console-token': state.csrfToken }, body: JSON.stringify(input) });sceneChanges.invalidate();return value },
    importArchive:async(file,{expectedName}={})=>{const state=await consoleRead('state');const value=await consoleRead('addons/import',{method:'POST',headers:{'content-type':'application/octet-stream','x-beellix-console-token':state.csrfToken,...expectedName?{'x-beellix-expected-package':expectedName}:{}},body:file});sceneChanges.invalidate();return value},
  }
  const preferences=createClientSettings({api:{read:consoleRead,mutate:async(path,input)=>{const state=await consoleRead('state');return consoleRead(path,{method:'POST',headers:{'content-type':'application/json','x-beellix-console-token':state.csrfToken},body:JSON.stringify(input)})}}})
  ctx.effect(()=>()=>preferences.dispose(),'Beelli X：客户端偏好订阅')
  ctx.effect(()=>installProportionalFrame(ctx,preferences,compatibility),'Beelli X：原生三栏比例')
  ctx.effect(()=>ctx.slots.inject('settings.general.item',()=>ctx.slots.register({name:'settings.general.item',id:'beellix-client-preferences',order:14,inject:()=>({preferences,english:document.documentElement.lang.startsWith('en')})},ClientSettingsRows)),'Beelli X：原生通用设置')
  ctx.effect(()=>ctx.slots.inject('main',()=>ctx.slots.register({name:'main',id:STARTUP_PANEL,key:STARTUP_PANEL,inject:()=>({viewSource:sceneView,startWorkspaceSession:()=>conversationNavigation.startWorkspaceSession()})},StartupLanding)),'Beelli X：空目录启动页')
  let platformNavigation,pendingPlatformPage,disposeManaged=()=>{},managedGeneration=0
  ctx.effect(()=>installKnowledgeSwitch(ctx,{openKnowledge:()=>{pendingPlatformPage='resources';ctx.layout.selectPanel(PANEL);platformNavigation?.select('resources')}}),'Beelli X：当前对话知识开关')
  const refreshManaged=async()=>{const ticket=++managedGeneration;try{const state=await consoleRead('state');if(ticket!==managedGeneration)return;disposeManaged();disposeManaged=installManagedPluginNavigation({document,packages:state.managedPackages??[],open:()=>{pendingPlatformPage='plugins';ctx.layout.selectPanel(PANEL);platformNavigation?.select('plugins')}})}catch{/* 归属无法核验时不隐藏任何新入口，正常中台页面保留错误恢复。 */}}
  ctx.effect(()=>{void refreshManaged();const off=sceneChanges.subscribe(()=>{void refreshManaged()});return()=>{managedGeneration++;off();disposeManaged()}},'Beelli X：自有插件管理归属')
  const accountRead=async(signal)=>{const response=await fetch(new URL('/beellix/account/state',document.baseURI),{credentials:'same-origin',cache:'no-store',signal});const value=await response.json();if(!response.ok)throw Error(value.message??'账号状态暂不可用');return value}
  const accountApi={read:accountRead,mutate:async(action,input,signal)=>{const state=await accountRead(signal),response=await fetch(new URL('/beellix/account/'+action,document.baseURI),{method:'POST',credentials:'same-origin',signal,headers:{'content-type':'application/json','x-beellix-account-token':state.csrfToken},body:JSON.stringify(input)});const value=await response.json();if(!response.ok)throw Error(value.message??'账号操作未完成');return value}}
  const callbacks = {
    accountApi,openAccountWebsite:url=>window.open(url,'_blank','noopener,noreferrer'),
    consoleApi,
    modelFace: () => modelFace ??= createConsoleFace(ctx),
    openSession: id => { ctx.layout.selectPanel(null); ctx.uiWorkspace.openSession(id) },
    restoreArchive:async id=>{await ctx.workspaces.unarchiveSession(id);sceneChanges.invalidate()},
    mountNavigation: navigation => {platformNavigation=navigation;if(pendingPlatformPage){navigation.select(pendingPlatformPage);pendingPlatformPage=undefined}const dispose=ctx.slots.inject('sidebar', () => ctx.slots.register({ name: 'sidebar', id: 'beellix-platform-sidebar', priority: -100, locale: NS, inject: () => ({ navigation, close: () => ctx.layout.selectPanel(null), toggle: () => ctx.layout.toggleSidebar() }) }, PlatformSidebar));return()=>{if(platformNavigation===navigation)platformNavigation=undefined;dispose?.()}},
    readUsage: async (query, signal) => {
      const response = await fetch(new URL('/beellix/usage/state?' + new URLSearchParams(query), document.baseURI), { credentials: 'same-origin', cache: 'no-store', signal })
      if (!response.headers.get('content-type')?.includes('application/json')) throw Error('用量接口尚未就绪，请刷新重试。')
      const value = await response.json(); if (!response.ok) throw Error(value.message ?? '用量读取失败'); return value
    },
    syncUsage: token => usageMutation('sync', {}, token),
    saveUsagePrice: (input, token) => usageMutation('prices', input, token),
    readState: signal => request('state', { signal }),
    initializeDirectories: async (token, signal) => {const value=await request('initialize', { method: 'POST', signal, headers: { 'content-type': 'application/json', 'x-beellix-bootstrap-token': token }, body: '{}' });sceneChanges.invalidate();return value},
    openPanel: id => ctx.layout.selectPanel(id),
    copyPath: path => navigator.clipboard.writeText(path),
    reconnectApplications:async signal=>{
      const state=await request('state',{signal})
      const value=await request('reconnect',{method:'POST',signal,headers:{'content-type':'application/json','x-beellix-bootstrap-token':state.csrfToken},body:'{}'})
      if(value.reconnection.items.some(item=>item.application==='failed'))throw Error('部分应用尚未接回，请在中台重试或查看运行记录')
      sceneChanges.invalidate()
      return value.reconnection
    },
    chooseDirectory:async signal=>{
      const picker=globalThis.__DSH_DIRECTORY_PICKER__
      const directory=typeof picker?.pick==='function'?await picker.pick():await ctx.uiWorkspace.pickDirectory()
      if(signal?.aborted)throw signal.reason
      const state=await request('state',{signal});if(directory===null)return{...state,selection:{cancelled:true}}
      const value=await request('choose-directory',{method:'POST',signal,headers:{'content-type':'application/json','x-beellix-bootstrap-token':state.csrfToken},body:JSON.stringify({directory})});sceneChanges.invalidate();return value
    },
  }
  let preparation
  const prepare=()=>preparation??=request('state').then(async state=>{if(state.status==='ready'&&['pending','needs-repair'].includes(state.applications?.status))await callbacks.reconnectApplications()}).catch(error=>{preparation=undefined;throw error})
  const capabilitySlots={subscribe:listener=>ctx.slots.subscribe('beellix.platform.capability',listener),getSnapshot:()=>ctx.slots.entries('beellix.platform.capability')}
  ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: PANEL, locale: NS, children:{'beellix.platform.capability':{kind:'list',scope:'root'}}, inject: () => ({...callbacks,hooks:{capabilitySlots}}) }, PlatformPanel))
  const sidebarTypes={subscribe:listener=>ctx.sidebarRightTabs.subscribe(listener),getSnapshot:()=>ctx.sidebarRightTabs.entries()}
  ctx.slots.inject('shell.overlay',()=>ctx.slots.register({name:'shell.overlay',id:'beellix-scene-navigation',children:{'beellix.scene.session.action':{kind:'list',scope:'root'}},inject:()=>({ctx,prepare,setSceneView,sceneChanges,compatibility,preferences,startWorkspaceSession:()=>conversationNavigation.startWorkspaceSession(),openSceneManager:()=>{pendingPlatformPage='scenarios';ctx.layout.selectPanel(PANEL);platformNavigation?.select('scenarios')},hooks:{sidebarMounted:ctx.sidebarRight.mounted,sidebarTypes}})},SceneNavigation))
  ctx.effect(()=>installSceneSessionActions(ctx,{menuComponent:SessionMenuAction,viewSource:sceneView,showArchived:()=>{pendingPlatformPage='archives';ctx.layout.selectPanel(PANEL);platformNavigation?.select('archives')}}),'Beelli X：原生会话归档操作')
}

async function usageMutation(path, body, token) {
  const response = await fetch(new URL('/beellix/usage/' + path, document.baseURI), { credentials: 'same-origin', method: 'POST', headers: { 'content-type': 'application/json', 'x-beellix-usage-token': token }, body: JSON.stringify(body) })
  if (!response.headers.get('content-type')?.includes('application/json')) throw Error('用量接口尚未就绪，请刷新重试。')
  const value = await response.json(); if (!response.ok) throw Error(value.message ?? '用量操作失败'); return value
}
