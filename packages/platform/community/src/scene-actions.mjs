/** 只复用DSH原归档行操作及其确认/恢复回调，不复制归档存储。 */
export function installSceneSessionActions(ctx,options){
 const releaseActions=ctx.slots.inject('beellix.scene.session.action',()=>{
  let active,dispose,syncing=false
  const sync=()=>{if(syncing)return;syncing=true;try{const source=(ctx.slots.entries?.('sidebar.workspaces.session.row.action')??[]).find(row=>row.options.id==='archive');if(source===active)return;dispose?.();dispose=undefined;active=source;if(source&&!source.children)dispose=ctx.slots.register({...source.options,name:'beellix.scene.session.action',...source.locale?{locale:source.locale}:{},...source.inject?{inject:source.inject}:{}},source.component)}finally{syncing=false}}
  const off=ctx.slots.subscribe?.('sidebar.workspaces.session.row.action',sync);sync()
  return()=>{off?.();dispose?.()}
 })
 const releaseRename=ctx.slots.inject('beellix.scene.session.action',()=>{
  if(typeof options?.menuComponent!=='function')return()=>{}
  let active,dispose
  let archiveSource
  const sync=()=>{const source=(ctx.slots.entries?.('sidebar.workspaces.session.menu.item')??[]).find(row=>row.options.id==='rename'),archive=(ctx.slots.entries?.('sidebar.workspaces.session.row.action')??[]).find(row=>row.options.id==='archive');if(source===active&&archive===archiveSource)return;dispose?.();dispose=undefined;active=source;archiveSource=archive;const face=source?.inject?.()??source?.options.inject?.(),archiveFace=archive?.inject?.()??archive?.options.inject?.();if(typeof face?.requestSessionRename==='function'||typeof archiveFace?.archiveSession==='function')dispose=ctx.slots.register({name:'beellix.scene.session.action',id:'rename',order:0,inject:()=>({...typeof face?.requestSessionRename==='function'?{requestSessionRename:(...args)=>face.requestSessionRename(...args)}:{},...typeof archiveFace?.archiveSession==='function'?{archiveSession:(...args)=>archiveFace.archiveSession(...args)}:{}})},options.menuComponent)}
  const off=ctx.slots.subscribe?.('sidebar.workspaces.session.menu.item',sync),offArchive=ctx.slots.subscribe?.('sidebar.workspaces.session.row.action',sync);sync();return()=>{off?.();offArchive?.();dispose?.()}
 })
 const releaseNotice=options?.viewSource&&ctx.slots.inject('workspace.toast',()=>{
  const ownInjections=new WeakSet();let sources=[],releases=[],syncing=false
  const sync=()=>{if(syncing)return;syncing=true;try{
   const next=options.viewSource.getSnapshot().mode==='scenes'?(ctx.slots.entries?.('workspace.toast')??[]).filter(row=>['archived','stoppedAndArchived'].includes(row.options.key)&&!ownInjections.has(row.inject)):[]
   if(next.length===sources.length&&next.every((row,index)=>row===sources[index]))return
   for(const release of releases)release();sources=next;releases=[]
   for(const source of next){const inject=(...args)=>{const face=source.inject(...args);return{...face,filterAction:(...parameters)=>{const action=face.filterAction(...parameters);return{...action,onClick:()=>options.showArchived()}}}};ownInjections.add(inject);releases.push(ctx.slots.register({...source.options,name:'workspace.toast',priority:-100,locale:source.locale,store:source.store,inject},source.component))}
  }finally{syncing=false}}
  const offSlots=ctx.slots.subscribe?.('workspace.toast',sync),offView=options.viewSource.subscribe(sync);sync()
  return()=>{offSlots?.();offView();for(const release of releases)release()}
 })
 return()=>{releaseNotice?.();releaseRename?.();releaseActions?.()}
}
