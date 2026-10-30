/** 原生 blank 表示尚未开始执行；实际用户输入和独立保存的业务资料也属于记录。 */
export function isSessionRecord(row,retained=new Set()){
 if(!row||row.blank!==true||row.running===true||retained.has(row.id??row.sessionId))return true
 const values=row.projectionValues??row.projections?.values
 const sent=values?.sessionListMetadata?.lastPromptAt
 const pending=['next-turn','next-step'].some(target=>Array.isArray(values?.inbox?.[target])&&values.inbox[target].some(message=>message?.source?.kind==='user'&&Array.isArray(message.content)&&message.content.some(part=>part?.type==='text'?Boolean(part.text?.trim()):Boolean(part?.type))))
 return pending||Number.isFinite(sent)||typeof values?.title==='string'&&Boolean(values.title.trim())
}

/** 当前空白仅展示编辑占位；离开后不加入历史，未知旧资料不猜测为空。 */
export function sceneSessionRows(sessions,{links={},recoveries={},retainedSessionIds=[]},sceneId,{current,archived=new Set()}={}){
 const retained=new Set(retainedSessionIds)
 return Object.entries(links).filter(([id,scene])=>scene===sceneId&&!recoveries[id]).map(([id])=>sessions.byId[id]).filter(row=>row&&row.origin!=='subagent'&&!archived.has(row.id)&&(row.id===current||isSessionRecord(row,retained))).sort((a,b)=>(b.updatedAt??0)-(a.updatedAt??0))
}
