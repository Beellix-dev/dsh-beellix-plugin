import React,{useRef,useState} from 'react'
import {Modal} from '@beellix-ai/ui-components'
import {ObjectFacts,SectionTabs} from './console-structure.tsx'
import {SourceInstaller} from './source-installer.tsx'

/** 两种安装方式共用目标、校验与完成回调；业务功能仍由实际插件提供。 */
export function ResourceInstaller({api,target,offered,onClose,onInstalled}:any){
 const [method,setMethod]=useState('local'),[busy,setBusy]=useState(false),[error,setError]=useState('')
 const [preview,setPreview]=useState<any>(offered?.state==='available'?offered:undefined)
 const generation=useRef(0)
 const readFile=async(file?:File)=>{
  if(!file||busy)return;setError('');setPreview(undefined)
  if(!file.name.endsWith('.tgz')||file.size>64*1024*1024){setError('请选择不超过64 MiB的 .tgz 安装包。');return}
  const ticket=++generation.current;setBusy(true)
  try{
   const value=await api.importArchive(file,{expectedName:target.name})
   if(value.name!==target.name||value.id!==target.id||!/^[a-f0-9]{64}$/u.test(value.digest??''))throw Error('安装包与所选插件不一致。')
   const state=await api.read('state'),owned=(state.applications??state.capabilities??[]).find((row:any)=>row.name===target.name&&['enabled','disabled','pending','failed'].includes(row.state))
   if(ticket===generation.current)setPreview({...value,...owned?{expectedVersion:owned.version}:{}})
  }catch(e:any){if(ticket===generation.current)setError(e.message)}finally{if(ticket===generation.current)setBusy(false)}
 }
 const install=async()=>{
  if(busy||!preview)return;setBusy(true);setError('')
  try{
   const result=await api.mutate('addons/install',{id:target.id,digest:preview.digest,...preview.expectedVersion?{expectedVersion:preview.expectedVersion}:{}})
   if(['failed','cancelled'].includes(result.application))throw Error('安装未完成，原环境已保留。')
   await onInstalled(result,target.id)
  }catch(e:any){setError(e.message)}finally{setBusy(false)}
 }
 return <Modal open title={'安装'+target.title} closeLabel="关闭" className="beellix-resource-installer beellix-console" contentClassName="beellix-resource-installer__content" onClose={()=>{if(!busy){generation.current++;onClose()}}}>
  <SectionTabs buttons label="安装方式" items={[['local','本地安装包'],['npm','pnpm 安装']]} active={method} disabled={busy} onChange={id=>{setMethod(id);setError('')}}/>
  {method==='npm'?<SourceInstaller embedded api={api} expectedName={target.name} onBusyChange={setBusy} onInstalled={(result:any)=>onInstalled(result,target.id)}/>:<div className="beellix-resource-installer__local" aria-busy={busy}>
   {api.importArchive&&<label className="beellix-resource-installer__file">选择安装包<input type="file" accept=".tgz" disabled={busy} onChange={event=>{const file=event.target.files?.[0];event.target.value='';void readFile(file)}}/></label>}
   {!api.importArchive&&!preview&&<p role="status">当前连接不支持本地包导入。</p>}
   {error&&<p role="alert" className="beellix-market__message">{error}</p>}
   {preview&&<><ObjectFacts items={[[ '插件',target.title],['版本','v'+preview.version]]}/><button className="beellix-bootstrap__primary" disabled={busy} onClick={()=>void install()}>{busy?'正在安装…':'确认安装'}</button></>}
  </div>}
 </Modal>
}
