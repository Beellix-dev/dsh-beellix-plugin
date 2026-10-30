import React,{useEffect,useRef,useState} from 'react'
import {DetailSection,ObjectFacts} from './console-structure.tsx'

/** 同一安装表单供插件管理、知识库和数据中台使用；不执行用户粘贴的命令。 */
export function SourceInstaller({api,expectedName,close,onInstalled,embedded=false,onBusyChange}:any){
 const [source,setSource]=useState(expectedName??''),[preview,setPreview]=useState<any>(),[busy,setBusy]=useState(false),[error,setError]=useState('')
 const alive=useRef(true)
 useEffect(()=>{alive.current=true;return()=>{alive.current=false}},[])
 useEffect(()=>{onBusyChange?.(busy)},[busy,onBusyChange])
 const check=async(event:React.FormEvent)=>{
  event.preventDefault();if(busy||!source.trim())return
  setBusy(true);setError('');setPreview(undefined)
  try{const value=await api.mutate('addons/source/preview',{source:source.trim(),...expectedName?{expectedName}:{}});if(alive.current)setPreview(value)}catch(e:any){if(alive.current)setError(e.message)}finally{if(alive.current)setBusy(false)}
 }
 const install=async()=>{
  if(busy||!preview)return;setBusy(true);setError('')
  try{
   const result=await api.mutate('addons/source/install',{name:preview.name,version:preview.version,digest:preview.digest,...preview.expectedVersion?{expectedVersion:preview.expectedVersion}:{}})
   if(['failed','cancelled'].includes(result.application))throw Error('安装未完成，原环境已保留。')
   if(alive.current)await onInstalled?.(result,preview)
  }catch(e:any){if(alive.current)setError(e.message)}finally{if(alive.current)setBusy(false)}
 }
 const content=<>
  <form className="beellix-source-form" onSubmit={event=>void check(event)} aria-busy={busy}>
   <label>包名或链接<input value={source} disabled={busy} required data-modal-autofocus={embedded?'':undefined} maxLength={500} spellCheck={false} autoComplete="off" placeholder="@beellix-ai/插件名 或 npm 链接" onChange={event=>{setSource(event.target.value);setPreview(undefined);setError('')}}/></label>
   <button type="submit" disabled={busy||!source.trim()}>{busy&&!preview?'正在检查…':'检查安装包'}</button>
  </form>
  {error&&<p role="alert" className="beellix-market__message">{error}</p>}
  {preview&&<div className="beellix-source-preview"><ObjectFacts items={[[ '插件',preview.title??preview.name],['安装包',preview.name],['版本','v'+preview.version],...preview.expectedVersion?[[ '当前版本','v'+preview.expectedVersion]] as [string,React.ReactNode][]:[]]}/><button className="beellix-bootstrap__primary" disabled={busy} onClick={()=>void install()}>{busy?'正在安装…':preview.expectedVersion?'确认升级':'确认安装'}</button></div>}
 </>
 return embedded?<div className="beellix-source-installer">{content}</div>:<DetailSection kind="plugins" title="npm / pnpm 安装" actions={<button disabled={busy} onClick={close}>取消</button>}>{content}</DetailSection>
}
