/** 工作区只投影自己的目录；保留 DSH 组件、操作、存储及原始会话集合。 */
import React,{useMemo,useCallback,useSyncExternalStore} from 'react'
const SLOT='sidebar.workspaces',OWN='beellix-workspace-scope'
const EMPTY_SESSIONS=Object.freeze({ids:[],byId:{}}),EMPTY_WORKSPACES=Object.freeze({items:[],archivedSessionIds:[],pinnedSessionIds:[]})

export function projectWorkspaceDirectory({sessions=EMPTY_SESSIONS,workspaces=EMPTY_WORKSPACES,scene={}}){
 const archived=new Set(workspaces.archivedSessionIds??[])
 const excluded=new Set([...Object.keys(scene.links??{}),...(scene.sceneSessionIds??[]),...(scene.clearedSessionIds??[]).filter(id=>archived.has(id))])
 for(const [id,row]of Object.entries(sessions.byId??{}))if(row.projectionValues?.agentPreset==='beellix-scene')excluded.add(id)
 // 场景子代理可能先于父会话广播；沿原生父标识处理，不靠名称、目录或 standard 模式猜归属。
 let changed=true
 while(changed){changed=false;for(const [id,row]of Object.entries(sessions.byId??{})){if(!excluded.has(id)&&row.origin==='subagent'&&excluded.has(row.parentId)){excluded.add(id);changed=true}}}
 const keep=id=>!excluded.has(id),map=value=>value?Object.fromEntries(Object.entries(value).filter(([id])=>keep(id))):value
 const managed=new Set(scene.managedWorkspaceIds??[])
 const items=(workspaces.items??[]).flatMap(row=>{const ids=row.sessionIds.filter(keep);return !ids.length&&(row.sessionIds.length||managed.has(row.workspaceId))?[]:[ids.length===row.sessionIds.length?row:{...row,sessionIds:ids}]})
 return{excluded,sessions:{...sessions,ids:(sessions.ids??Object.keys(sessions.byId??{})).filter(keep),byId:map(sessions.byId),...sessions.projectionsBySession?{projectionsBySession:map(sessions.projectionsBySession)}:{}},workspaces:{...workspaces,items,archivedSessionIds:(workspaces.archivedSessionIds??[]).filter(keep),pinnedSessionIds:(workspaces.pinnedSessionIds??[]).filter(keep)}}
}
export function filterWorkspaceSearch(result,projection){return{...result,items:result.items.filter(row=>!projection.excluded.has(row.sessionId))}}

/** 只明确原生新会话的目标；不改 Session Controller、执行模式或历史。 */
export function installWorkspaceNavigation(ctx,viewSource,{compatibility}={}){
 const service=ctx.uiWorkspace,native=service?.startSession
 if(typeof native!=='function')return{dispose:()=>{},startWorkspaceSession:()=>{}}
 let disposed=false,picking,workspaceStartDepth=0
 const nativeOpen=service.openWorkspace
 const runNative=(...args)=>{workspaceStartDepth++;try{return native.call(service,...args)}finally{workspaceStartDepth--}}
 const openWorkspace=async(workspaceId,beforeOpen,options)=>{
  const view=viewSource.getSnapshot(),sessionId=ctx.uiSession.adapter.current.getSnapshot()?.key,sceneId=view.links?.[sessionId]
  if(workspaceStartDepth||view.mode!=='scenes'||!sceneId)return nativeOpen.call(service,workspaceId,beforeOpen,options)
  if(disposed)return
  if(!view.ready||typeof view.changeSceneDirectory!=='function')throw Error('场景目录入口尚未就绪，请稍后重试')
  return view.changeSceneDirectory({sessionId,sceneId,workspaceId,beforeOpen})
 }
 if(typeof nativeOpen==='function')service.openWorkspace=openWorkspace
 async function start(workspaceId,options,requestedMode){
  try{
   const snapshot=viewSource.getSnapshot(),view=requestedMode?{...snapshot,mode:requestedMode}:snapshot
   if(!view.ready){compatibility?.report?.({code:'WORKSPACE_SCOPE_PENDING',message:'对话归属仍在读取，请稍后重试新建。'});return}
   compatibility?.clear?.('WORKSPACE_SCOPE_PENDING')
   if(view.mode==='scenes'&&workspaceId===undefined)return view.startSceneSession?.()
   const freshRequested=options===undefined;let correctedDefault=false
   if(options?.agentPreset===undefined&&ctx.remote?.agentPresets?.list){
    const roster=await ctx.remote.agentPresets.list()
    if(!roster.ok)throw Error(roster.error?.message??'执行模式暂不可用')
    if(roster.value.presets.find(row=>row.isDefault)?.id==='beellix-scene'){correctedDefault=true;options={...options,agentPreset:'standard'}}
   }
   if(disposed)return
   compatibility?.clear?.('WORKSPACE_START_FAILED')
   const sessions=ctx.sessions.list.getSnapshot(),workspaces=ctx.workspaces.list.getSnapshot()
   const projection=projectWorkspaceDirectory({sessions,workspaces,scene:view}),items=projection.workspaces.items
   const current=ctx.uiSession.adapter.current.getSnapshot()?.key
   const ordinaryCurrent=projection.excluded.has(current)?undefined:items.find(row=>row.sessionIds.includes(current))
   const score=row=>Math.max(0,...row.sessionIds.map(id=>sessions.byId[id]?.updatedAt??0))
   let target=items.find(row=>row.workspaceId===workspaceId)??ordinaryCurrent??[...items].sort((a,b)=>score(b)-score(a))[0]
   if(!target){
    if(picking)return picking
    picking=(async()=>{const path=await service.pickDirectory();if(!path||disposed||viewSource.getSnapshot().mode!==snapshot.mode)return;const workspace=await ctx.workspaces.create({path});if(!disposed)return runNative(workspace.workspaceId,options)})()
    try{return await picking}finally{picking=undefined}
   }
   const original=workspaces.items.find(row=>row.workspaceId===target.workspaceId)
   // 项目“+”传入空草稿选项时，原生会复用首个空会话；混合旧目录必须避开场景空会话。
   if(correctedDefault&&freshRequested||options!==undefined&&original?.sessionIds.some(id=>projection.excluded.has(id))){
    const signal=ctx.layout?.beginNavigation?.()
    const sessionId=await ctx.sessions.create({workspaceId:target.workspaceId,...options.agentPreset===undefined?{}:{agentPreset:options.agentPreset}})
    if(disposed||signal?.aborted)return
    const {agentPreset:_preset,...draft}=options
    if(draft.prompt!==undefined||draft.clearPreviousDraft===true){
     await ctx.sessions.using(sessionId,{source:'workspaceOperation'},reference=>{
      const conversation=ctx.get('conversation')
      if(!conversation||conversation.input.requestDraftInitialization(reference.binding,draft)==='blocked')throw Error('草稿尚未就绪，原内容已保留')
     })
    }
    if(!disposed&&!signal?.aborted)return service.openSession(sessionId)
    return
   }
   if(!disposed)return runNative(target.workspaceId,options)
  }catch(error){compatibility?.report?.({code:'WORKSPACE_START_FAILED',message:'新建对话未完成：'+error.message})}
 }
 const routed=(workspaceId,options)=>start(workspaceId,options)
 service.startSession=routed
 return{startWorkspaceSession:(workspaceId,options)=>start(workspaceId,options,'workspace'),dispose:()=>{disposed=true;if(service.startSession===routed)service.startSession=native;if(service.openWorkspace===openWorkspace)service.openWorkspace=nativeOpen}}
}

export function installWorkspaceScope(ctx,viewSource,{retry,compatibility}={}){
 let current,release,updating=false,disposed=false
 const project=()=>projectWorkspaceDirectory({sessions:ctx.sessions.list.getSnapshot(),workspaces:ctx.workspaces.list.getSnapshot(),scene:viewSource.getSnapshot()})
 const sync=()=>{
  if(disposed||updating)return;updating=true
  try{
   const source=(ctx.slots.entries?.(SLOT)??[]).find(row=>row.options.id!==OWN&&typeof row.component==='function')
   if(source===current)return
   release?.();release=undefined;current=source
   if(!source)return
   const NativeWorkspace=source.component
   function WorkspaceScope(props){
    const scene=useSyncExternalStore(viewSource.subscribe,viewSource.getSnapshot)
    const sessions=useSyncExternalStore(fn=>ctx.sessions.list.subscribe(fn),()=>ctx.sessions.list.getSnapshot())
    const workspaces=useSyncExternalStore(fn=>ctx.workspaces.list.subscribe(fn),()=>ctx.workspaces.list.getSnapshot())
    const projection=useMemo(()=>projectWorkspaceDirectory({sessions,workspaces,scene}),[sessions,workspaces,scene])
    const useSessions=useCallback(selector=>selector(projection.sessions),[projection.sessions]),useWorkspaces=useCallback(selector=>selector(projection.workspaces),[projection.workspaces])
    const searchSessions=useCallback(async(...args)=>{const result=await props.searchSessions(...args);return filterWorkspaceSearch(result,project())},[props.searchSessions,scene])
    if(!scene.ready)return React.createElement('div',{className:'beellix-workspace-reading',role:scene.error?'alert':'status'},scene.error?'工作区列表暂不可用':'正在读取工作区…',scene.error&&React.createElement('button',{type:'button',onClick:retry},'重试'))
    return React.createElement(NativeWorkspace,{...props,useSessions,useWorkspaces,searchSessions})
   }
   // 保留原登记身份：renderSlot 授权属于它，复制登记会丢失子槽，重声明又会冲突。
   // 这里只包裹可写的组件字段；不改 children、store、inject 或全局数据服务。
   if(Object.getOwnPropertyDescriptor(source,'component')?.writable!==true){compatibility?.report?.({code:'NATIVE_WORKSPACE_SCOPE_UNAVAILABLE',message:'当前工作区组件不支持归属适配，已保留原生列表。'});return}
   source.component=WorkspaceScope
   let notify
   const restore=()=>{if(source.component===WorkspaceScope)source.component=NativeWorkspace;notify?.()}
   release=restore
   try{
    // 低优先级登记只通知原生渲染器重新读取组件；它不抢占原组件或声明任何子槽。
    notify=ctx.slots.register({name:SLOT,id:OWN,priority:(source.options.priority??0)+1},()=>null)
   }catch(error){restore();release=undefined;throw error}
   compatibility?.clear?.('NATIVE_WORKSPACE_SCOPE_UNAVAILABLE')
  }finally{updating=false}
 }
 const off=ctx.slots.subscribe?.(SLOT,sync);sync()
 return()=>{disposed=true;off?.();release?.()}
}
