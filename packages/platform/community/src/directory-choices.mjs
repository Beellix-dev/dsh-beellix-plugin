/** 执行目录只投影显示；不重命名目录、不改工作区登记或会话归属。 */
import React,{useCallback,useLayoutEffect,useMemo,useSyncExternalStore} from 'react'
import {projectWorkspaceDirectory} from './workspace-scope.mjs'
const h=React.createElement,PICKER='conversation.hero.workspace',OWN='beellix-directory-picker-refresh'

export function projectDirectoryChoices({scene,sessions,workspaces,sessionId,workspaceId}){
 if(!scene.ready)return{...workspaces,phase:'ready',items:[]}
 const projected=projectWorkspaceDirectory({scene,sessions,workspaces}).workspaces
 if(scene.mode!=='scenes'||!scene.links?.[sessionId])return projected
 const current=workspaces.items.find(row=>row.workspaceId===workspaceId)??workspaces.items.find(row=>row.sessionIds.includes(sessionId))
 if(!current)return projected
 const managed=scene.managedWorkspaceIds?.includes(current.workspaceId)
 return{...projected,items:[managed?{...current,title:'会话文件'}:current,...projected.items.filter(row=>row.workspaceId!==current.workspaceId)]}
}

/** 只适配公开 picker 的快照及 anchorRef；不访问或替换 DSH 内部界面 Factory。 */
export function installDirectoryChoices(ctx,viewSource,{compatibility}={}){
 let disposed=false,source,release;const listeners=new Set()
 const subscribe=listener=>{listeners.add(listener);return()=>listeners.delete(listener)}
 function useScopedProps(props){
  const enabled=useSyncExternalStore(subscribe,()=>!disposed)
  const scene=useSyncExternalStore(viewSource.subscribe,viewSource.getSnapshot)
  const sessions=useSyncExternalStore(fn=>ctx.sessions.list.subscribe(fn),()=>ctx.sessions.list.getSnapshot())
  const selected=useSyncExternalStore(fn=>ctx.uiSession.adapter.current.subscribe(fn),()=>ctx.uiSession.adapter.current.getSnapshot())
  const sessionId=selected?.key
  const workspaces=props.useWorkspaces(value=>value)
  const snapshot=useMemo(()=>enabled?projectDirectoryChoices({scene,sessions,workspaces,sessionId,workspaceId:props.selectedId}):workspaces,[enabled,scene,sessions,workspaces,sessionId,props.selectedId])
  const useWorkspaces=useCallback(selector=>selector(snapshot),[snapshot])
  const inScene=enabled&&scene.mode==='scenes'&&Boolean(scene.links?.[sessionId])
  const t=useCallback((key,...args)=>inScene&&key==='hero.chooseWorkspace'?'执行目录':inScene&&key==='menu.addWorkspace'?'选择其他目录…':props.t(key,...args),[inScene,props.t])
  const current=workspaces.items.find(row=>row.workspaceId===props.selectedId)
  const label=enabled&&!scene.ready?'执行目录':inScene&&scene.managedWorkspaceIds?.includes(current?.workspaceId)?'会话文件':undefined
  useLayoutEffect(()=>{
   const anchor=props.anchorRef?.current;if(!anchor||label===undefined)return
   const names=['data-beellix-execution-label','aria-label','title'],previous=names.map(name=>anchor.getAttribute(name))
   anchor.setAttribute(names[0],label);anchor.setAttribute('aria-label','执行目录：'+label)
   if(current?.path)anchor.setAttribute('title',current.path)
   const restore=()=>{for(let index=0;index<names.length;index++)if(previous[index]===null)anchor.removeAttribute(names[index]);else anchor.setAttribute(names[index],previous[index])}
   listeners.add(restore)
   return()=>{listeners.delete(restore);restore()}
  },[props.anchorRef,label,current?.path])
  return{...props,useWorkspaces,t}
 }
 const sync=()=>{
  if(disposed)return
  const next=(ctx.slots.entries?.(PICKER)??[]).find(row=>row.options.id!==OWN&&typeof row.component==='function')
  if(source===next)return
  const previousRelease=release;release=undefined;source=next;previousRelease?.()
  if(!source)return
  if(Object.getOwnPropertyDescriptor(source,'component')?.writable!==true){compatibility?.report?.({code:'DIRECTORY_DISPLAY_UNAVAILABLE',message:'当前 DSH 目录显示接口有变化，已保留原生入口。'});return}
  const Native=source.component
  function Scoped(props){return h(Native,useScopedProps(props))}
  source.component=Scoped
  let notify
  const original=source
  release=()=>{if(original.component===Scoped)original.component=Native;notify?.()}
  // 空登记只通知原生选择器重读，原 owner 和目录子槽不变。
  try{notify=ctx.slots.register({name:PICKER,id:OWN,priority:(source.options.priority??0)+1},()=>null);compatibility?.clear?.('DIRECTORY_DISPLAY_UNAVAILABLE')}
  catch(error){release();release=undefined;compatibility?.report?.({code:'DIRECTORY_DISPLAY_UNAVAILABLE',message:'执行目录显示适配未就绪，已保留原生入口：'+error.message})}
 }
 const off=ctx.slots.subscribe?.(PICKER,sync);sync()
 return()=>{disposed=true;off?.();release?.();for(const listener of [...listeners])listener();listeners.clear()}
}
