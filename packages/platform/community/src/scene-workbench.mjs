/** 当前场景工作台是固定席位；文件等原生页仍使用宿主关闭行为。 */
import React,{useSyncExternalStore} from 'react'

export function fixedScene(view,sessionId,kind){
 if(view.mode!=='scenes'||!view.ready||!sessionId)return undefined
 return (view.installed??[]).find(scene=>scene.enabled&&scene.id===view.links?.[sessionId]&&scene.tabKind===kind)
}

export function SceneWorkbenchTitle({sessionId,useTabInfo,viewSource}){
 const view=useSyncExternalStore(viewSource.subscribe,viewSource.getSnapshot),{tab}=useTabInfo(),scene=fixedScene(view,sessionId,tab.kind)
 return scene?React.createElement('span',{className:'beellix-scene-workbench-title','data-beellix-fixed-tab':tab.id},scene.title):tab.title
}

export function installSceneWorkbench(ctx,viewSource,{document:doc=globalThis.document,compatibility}={}){
 const service=ctx.sidebarRight,disposers=[],titles=new Map(),code='SCENE_WORKBENCH_PIN_UNAVAILABLE'
 const pinned=(sessionId,tabId)=>{const tab=service.openTabs.getSnapshot().find(row=>row.sessionId===sessionId&&row.tabId===tabId);return Boolean(tab&&fixedScene(viewSource.getSnapshot(),sessionId,tab.kind))}
 // 当前 Next 未提供 closable 声明；仅在已核验的控制器形态上拦截移除及替换。
 // 不修改原生包、持久状态或清理回调；宿主形态变化时报告兼容问题。
 const supported=['closeIn','place','canCloseTarget','closeTarget'].every(key=>typeof service?.[key]==='function')&&typeof service?.openTabs?.getSnapshot==='function'
 const wrap=(key,make)=>{const original=service[key],own=Object.getOwnPropertyDescriptor(service,key),wrapped=make(original);service[key]=wrapped;disposers.push(()=>{if(service[key]!==wrapped)return;if(own)Object.defineProperty(service,key,own);else delete service[key]})}
 if(supported){
  wrap('closeIn',original=>function(sessionId,tabId){if(!pinned(sessionId,tabId))return original.call(this,sessionId,tabId)})
  wrap('place',original=>function(sessionId,actions,claim,address,placement={},params){if(pinned(sessionId,placement.replaceTab)){const{replaceTab,...rest}=placement;placement=rest}return original.call(this,sessionId,actions,claim,address,placement,params)})
  // 保留原生快捷键命中；返回不可命中会令 Next 回退为关闭整个客户端窗口。
  wrap('closeTarget',original=>function(target){return pinned(target?.sessionId,target?.tabId)?'unavailable':original.call(this,target)})
  compatibility?.clear?.(code)
 }else compatibility?.report({code,message:'当前 DSH 工作台接口有变化，固定标签尚未生效。'})
 const refresh=()=>{
  const scenes=viewSource.getSnapshot().installed??[],wanted=new Set(scenes.map(scene=>scene.packageName))
  for(const[key,dispose]of titles)if(!wanted.has(key)){dispose();titles.delete(key)}
  for(const key of wanted)if(!titles.has(key))titles.set(key,ctx.slots.inject('sidebar.right.pane.tab.title',()=>ctx.slots.register({name:'sidebar.right.pane.tab.title',key,inject:()=>({viewSource})},SceneWorkbenchTitle)))
 }
 const menu=event=>{if(event.target?.closest?.('[data-dockkit-tab]:has([data-beellix-fixed-tab])')){event.preventDefault();event.stopPropagation()}}
 if(supported){refresh();disposers.push(viewSource.subscribe(refresh));doc?.addEventListener('contextmenu',menu,true);disposers.push(()=>doc?.removeEventListener('contextmenu',menu,true))}
 return()=>{for(const dispose of titles.values())dispose();for(const dispose of disposers.reverse())dispose();compatibility?.clear?.(code)}
}
