/** 只选择已存在的有效会话；不创建记录，也不按执行目录推断场景。 */
export function startupTarget({startup,last,current,sessions,scene,archived=[]}){
 const mode=startup==='last'?(last==='scenes'?'scenes':'workspace'):startup==='scenes'?'scenes':'workspace',hidden=new Set(archived)
 const isScene=row=>Boolean(scene.links[row.id]||row.projectionValues?.agentPreset==='beellix-scene')
 const rows=Object.values(sessions.byId).filter(row=>row.origin!=='subagent'&&!hidden.has(row.id)&&(mode==='scenes'?isScene(row)&&!scene.recoveries?.[row.id]&&scene.scenes.some(s=>s.id===scene.links[row.id]&&s.enabled):!isScene(row))).sort((a,b)=>b.updatedAt-a.updatedAt)
 return{mode,sessionId:(rows.find(row=>row.id===current)??rows[0])?.id??null}
}
