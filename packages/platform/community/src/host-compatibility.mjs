/** Next 公共槽位旁的有限适配集中在这里；形态变化时保留原生界面。 */
export function createCompatibilityStore(){
 let state={issues:[]},queued=false;const listeners=new Set()
 const update=issues=>{state={issues};if(!queued){queued=true;void Promise.resolve().then(()=>{queued=false;for(const fn of listeners)fn()})}}
 return{getSnapshot:()=>state,subscribe:fn=>{listeners.add(fn);return()=>listeners.delete(fn)},report:issue=>{if(!state.issues.some(row=>row.code===issue.code))update([...state.issues,issue])},clear:code=>{if(state.issues.some(row=>row.code===code))update(state.issues.filter(row=>row.code!==code))}}
}
export function locateSceneSidebar(document){
 const slot=document.querySelector('[data-slot="sidebar.workspaces"]')
 const labels=slot&&[...slot.querySelectorAll('span')].filter(node=>!node.closest('[data-beellix-scene-head]')&&!node.childElementCount&&['工作区','会话','Workspaces','Sessions'].includes(node.textContent.trim()))
 if(labels?.length!==1)return undefined
 const label=labels[0],header=label.parentElement,root=header?.parentElement
 if(!root||!slot.contains(root)||root===label)return undefined
 return{label,header,root}
}
export function filterNativePresetSnapshot(next,compatibility){
 if(!Array.isArray(next?.options)){compatibility?.report({code:'NATIVE_PRESET_SHAPE_CHANGED',message:'当前 DSH 模式接口有变化，已保留原生模式选择。'});return next}
 compatibility?.clear?.('NATIVE_PRESET_SHAPE_CHANGED')
 return{...next,options:next.options.filter(row=>row.id!=='beellix-scene')}
}
