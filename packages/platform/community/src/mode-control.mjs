/** 工作区复用DSH原生预选控制器和组件；场景仅替换显示，内部预设不进入普通菜单。 */
import {filterNativePresetSnapshot} from './host-compatibility.mjs'
import React,{useCallback,useSyncExternalStore} from 'react'
const KEY='conversation.hero.agentPreset',OWN='beellix-execution-mode'
const HEADER='conversation.session.header.actions'

function isSceneSession(view,sessions,sessionId){
 const seen=new Set()
 while(sessionId&&!seen.has(sessionId)){
  seen.add(sessionId)
  if(view.links?.[sessionId]||sessions.byId[sessionId]?.projectionValues?.agentPreset==='beellix-scene')return true
  const row=sessions.byId[sessionId];if(row?.origin!=='subagent')return false
  sessionId=row.parentId
 }
 return false
}

function installHeaderMode(ctx,viewSource,SceneSeat,compatibility){
 let source,release,disposed=false,syncing=false
 const sync=()=>{if(disposed||syncing)return;syncing=true;try{
  const next=(ctx.slots.entries?.(HEADER)??[]).find(row=>row.options.id==='agent-preset')
  if(next===source)return
  release?.();release=undefined;source=next
  if(!source)return
  if(typeof source.component!=='function'||Object.getOwnPropertyDescriptor(source,'component')?.writable!==true){compatibility?.report?.({code:'SCENE_HEADER_MODE_UNAVAILABLE',message:'当前 DSH 顶部模式接口有变化，已保留原生标识。'});return}
  const original=source,NativeLabel=source.component
  function HeaderMode(props){
   const view=useSyncExternalStore(viewSource.subscribe,viewSource.getSnapshot),sessions=props.useSessions(value=>value)
   const useSceneView=useCallback(selector=>selector(view),[view])
   return isSceneSession(view,sessions,props.sessionId)?React.createElement(SceneSeat,{...props,useSceneView,variant:'header'}):React.createElement(NativeLabel,props)
  }
  original.component=HeaderMode
  let notify
  release=()=>{if(original.component===HeaderMode)original.component=NativeLabel;notify?.()}
  try{notify=ctx.slots.register({name:HEADER,id:'beellix-mode-header-refresh',order:source.options.order,priority:(source.options.priority??0)+1},()=>null);compatibility?.clear?.('SCENE_HEADER_MODE_UNAVAILABLE')}
  catch(error){release();release=undefined;compatibility?.report?.({code:'SCENE_HEADER_MODE_UNAVAILABLE',message:'顶部场景标识适配失败，已保留原生标识：'+error.message})}
 }finally{syncing=false}}
 const off=ctx.slots.subscribe?.(HEADER,sync);sync()
 return()=>{disposed=true;off?.();release?.()}
}

export function installModeSeat(ctx,viewSource,SceneSeat,compatibility){
 const releaseHeader=installHeaderMode(ctx,viewSource,SceneSeat,compatibility)
 const filtered=new WeakMap();let mounted,source,kind,syncing=false
 const filterFace=face=>{const native=face?.hooks?.agentPresetSeat;if(!native||typeof native.getSnapshot!=='function'||typeof native.subscribe!=='function'){compatibility?.report({code:'NATIVE_PRESET_SHAPE_CHANGED',message:'当前 DSH 模式接口有变化，已保留原生模式选择。'});return face}let store=filtered.get(native);if(!store){let previous,result;store={...native,subscribe:fn=>native.subscribe(fn),getSnapshot:()=>{const next=native.getSnapshot();if(next!==previous){previous=next;result=filterNativePresetSnapshot(next,compatibility)}return result}};filtered.set(native,store)}return{...face,hooks:{...face.hooks,agentPresetSeat:store}}}
 const sync=()=>{if(syncing)return;syncing=true;try{
  const view=viewSource.getSnapshot(),nextKind=view.mode==='scenes'?'scene':'native',nextSource=nextKind==='native'?(ctx.slots.entries?.(KEY)??[]).find(row=>row.options.id!==OWN&&typeof row.component==='function'):undefined
  if(nextKind===kind&&nextSource===source)return
  mounted?.();mounted=undefined;kind=nextKind;source=nextSource
  if(nextKind==='scene')mounted=ctx.slots.register({name:KEY,id:OWN,priority:-100,inject:()=>({hooks:{sceneView:viewSource}})},SceneSeat)
  else if(nextSource)mounted=ctx.slots.register({...nextSource.options,name:KEY,id:OWN,priority:-100,...nextSource.locale?{locale:nextSource.locale}:{},inject:(...args)=>filterFace(nextSource.inject?.(...args)??nextSource.options.inject?.(...args)??{})},nextSource.component)
 }finally{syncing=false}}
 const offView=viewSource.subscribe(sync),offSlots=ctx.slots.subscribe?.(KEY,sync);sync()
 return()=>{offView();offSlots?.();mounted?.();releaseHeader()}
}
