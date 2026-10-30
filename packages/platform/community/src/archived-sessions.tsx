import {OperationFeedback} from "../../../../dev/shared/console/operation-feedback.mjs"
/** 沿旧版 ArchiveList 的恢复、选择及确认清理流程；原存储由 DSH 和归档适配器承载。 */
import React,{useEffect,useRef,useState} from 'react'
import {Modal} from '@deepseek-ai/dsh-client-ui-primitives'
import {ConsoleIcon} from './console-icons.mjs'
import {SectionTabs} from './console-structure.tsx'

export function ArchivedConversations({api,restore}:any){
 const [state,setState]=useState<any>(),[query,setQuery]=useState(''),[location,setLocation]=useState('*'),[selected,setSelected]=useState<string[]>([]),[scope,setScope]=useState('all')
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[confirmation,setConfirmation]=useState<any>(),[deleteError,setDeleteError]=useState('')
 const generation=useRef(0)
 const load=async()=>{const ticket=++generation.current;setBusy(true);setError('');try{const value=await api.read('archives');if(ticket===generation.current)setState(value)}catch(e:any){if(ticket===generation.current)setError(e.message)}finally{if(ticket===generation.current)setBusy(false)}}
 useEffect(()=>{void load();return()=>{generation.current++}},[])
 const scoped=(state?.items??[]).filter((row:any)=>scope==='all'||(scope==='scene'?Boolean(row.sceneId):!row.sceneId))
 const locations=[...new Set(scoped.map((row:any)=>row.location))]as string[]
 const rows=scoped.filter((row:any)=>(location==='*'||row.location===location)&&`${row.title} ${row.location}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))
 const visible=new Set(rows.map((row:any)=>row.id)),selection=selected.filter(id=>visible.has(id))
 const requestClear=(ids:string[])=>{setDeleteError('');setConfirmation({ids,revision:state.revision})}
 const clear=async()=>{if(busy||!confirmation)return;setBusy(true);setDeleteError('');try{await api.mutate('archives/clear',{sessionIds:confirmation.ids,expectedRevision:confirmation.revision});setSelected(previous=>previous.filter(id=>!confirmation.ids.includes(id)));setConfirmation(undefined);await load()}catch(e:any){setDeleteError(e.message)}finally{setBusy(false)}}
 const recover=async(id:string)=>{if(busy)return;setBusy(true);setError('');try{await restore(id);setSelected(previous=>previous.filter(value=>value!==id));await load()}catch(e:any){setError(e.message)}finally{setBusy(false)}}
 return <div className="beellix-bootstrap"><div className="beellix-bootstrap__page beellix-console" aria-busy={busy}>
  <header className="beellix-page-toolbar" aria-label="归档操作"><SectionTabs buttons label="归档对话分类" items={[["all","全部对话"],["workspace","工作区对话"],["scene","场景对话"]]} active={scope} disabled={busy||Boolean(confirmation)} onChange={id=>{setScope(id);setLocation('*');setSelected([])}}/><div className="beellix-bootstrap__actions">{selection.length>0&&<button disabled={busy} onClick={()=>requestClear(selection)}>清理所选（{selection.length}）</button>}<button disabled={busy} onClick={()=>void load()}>刷新</button></div></header>
  <OperationFeedback error={error} onErrorDone={()=>setError('')}/>
  {!state?<p role="status" className="beellix-console__empty">{busy?'读取中…':'请刷新重试'}</p>:!state.items.length?<div className="beellix-console__empty"><ConsoleIcon kind="archives" size={26}/><p>暂无已归档对话</p></div>:<>
   <div className="beellix-archive-toolbar"><input type="search" aria-label="搜索归档对话" placeholder="搜索对话" value={query} disabled={busy} onChange={e=>{setQuery(e.target.value);setSelected([])}}/>{locations.length>1&&<select aria-label="对话归属" value={location} disabled={busy} onChange={e=>{setLocation(e.target.value);setSelected([])}}><option value="*">全部位置</option>{locations.map(value=><option key={value} value={value}>{value}</option>)}</select>}</div>
   <div className="beellix-model-table"><table aria-label="已归档对话列表"><thead><tr><th><input type="checkbox" aria-label="全选归档对话" disabled={busy||!rows.length||rows.length>1000} checked={!!rows.length&&selection.length===rows.length} onChange={e=>setSelected(e.target.checked?rows.map((row:any)=>row.id):[])}/></th><th>对话</th><th>归属</th><th>更新时间</th><th aria-label="操作"/></tr></thead><tbody>{rows.map((row:any)=><tr key={row.id}><td><input type="checkbox" aria-label={'选择 '+row.title} checked={selection.includes(row.id)} disabled={busy||!selection.includes(row.id)&&selection.length>=1000} onChange={e=>setSelected(e.target.checked?[...selection,row.id]:selection.filter(id=>id!==row.id))}/></td><td><span className="beellix-model-name"><ConsoleIcon kind={row.sceneId?'scenarios':'chat'} size={16}/>{row.title}</span></td><td>{row.location}</td><td>{row.updatedAt?new Date(row.updatedAt).toLocaleString():'—'}</td><td className="beellix-archive-row-actions"><button disabled={busy||!row.recoverable} aria-label={'恢复 '+row.title} title={!row.recoverable?'原对话暂不可读取':undefined} onClick={()=>void recover(row.id)}>恢复</button><button disabled={busy} aria-label={'清理 '+row.title} onClick={()=>requestClear([row.id])}>清理</button></td></tr>)}{!rows.length&&<tr><td colSpan={5} className="beellix-model-no-data">没有匹配的对话</td></tr>}</tbody></table></div>
  </>}
  <Modal open={!!confirmation} title={`清理这 ${confirmation?.ids.length??0} 条归档对话？`} closeLabel="关闭" onClose={()=>{if(!busy)setConfirmation(undefined)}} footer={<div className="beellix-bootstrap__actions"><button disabled={busy} onClick={()=>setConfirmation(undefined)}>取消</button><button disabled={busy} onClick={()=>void clear()}>{busy?'清理中…':'确认清理'}</button></div>}><p>从 Beelli X 归档清单移除，保留会话文件和场景资料。</p>{deleteError&&<p role="alert">{deleteError}</p>}</Modal>
 </div></div>
}
