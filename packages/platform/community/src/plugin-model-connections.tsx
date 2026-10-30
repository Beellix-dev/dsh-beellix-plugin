import React,{useState} from 'react'
import {Modal,Switch} from '@beellix-ai/ui-components'
import {CatalogVendorCard} from "../../../../dev/shared/console/packages/ui/admin/src/models/client/VendorCatalog.tsx"
import {Mark} from "../../../../dev/shared/console/packages/ui/admin/src/models/client/CatalogModelCard.tsx"
import css from "../../../../dev/shared/console/packages/ui/admin/src/models/client/VendorCatalog.module.css"
import navigation from "../../../../dev/shared/console/packages/ui/admin/src/client/NavigationLink.module.css"
import {ConsoleIcon} from './console-icons.mjs'

const key=(row:any)=>row.id+':'+row.purpose.id
const title=(row:any)=>row.title+' · '+row.purpose.title
const chat=(row:any)=>!row.purpose.operation||row.purpose.operation==='chat'
const inheritsMain=(row:any)=>row.models?.purposes?.find((purpose:any)=>purpose.id===row.purpose.id)?.default==='host-main'
const configured=(row:any)=>chat(row)?!!row.purpose.selection||inheritsMain(row):row.purpose.configured
const active=(row:any)=>row.enabled&&configured(row)&&row.purpose.enabled!==false
const status=(row:any)=>!row.enabled?'插件已停用':!configured(row)?'未配置':row.purpose.enabled===false?'已停用':'已启用'
const localQwen=new Set(['qwen3-embedding:0.6b','qwen3-embedding:4b'])

export function PluginModelConnections({items,groups=[],busy,onSave,onConfigure,onCatalog}:any){
 const [query,setQuery]=useState(''),[filter,setFilter]=useState('all'),[detail,setDetail]=useState('')
 const needle=query.trim().toLocaleLowerCase()
 const model=(row:any)=>chat(row)?row.purpose.selection?.model??(inheritsMain(row)?'沿用主模型':'未选择模型'):row.purpose.connection?.model
 const provider=(row:any)=>groups.find((group:any)=>group.id===row.purpose.selection?.provider)?.name??row.purpose.selection?.provider
 const rows=items.filter((row:any)=>(filter==='all'||(filter==='enabled')===!!active(row))&&[row.title,row.purpose.title,model(row),provider(row),row.purpose.connection?.endpoint].some(value=>value?.toLocaleLowerCase().includes(needle)))
 const selected=items.find((row:any)=>key(row)===detail)
 const configure=(row:any)=>chat(row)?onCatalog?.(row):onConfigure(row.purpose.configurationPanel,{capabilityId:row.id.split('/').at(-1),title:row.title,view:'model:'+row.purpose.id})
 return <div className={css.catalog} data-model-page="plugin-connections">
  <div className={css.toolbar}><label><span>搜索厂商或模型</span><input type="search" value={query} onChange={e=>setQuery(e.target.value)}/></label><label className={css.statusFilter}><span>状态</span><select aria-label="状态" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">全部</option><option value="enabled">已启用</option><option value="disabled">未启用</option></select></label></div>
  <p className={css.resultCount}>{rows.length} / {items.length}</p>
  <div className={css.grid}>{rows.map((row:any)=>{
   const name=title(row),purpose=row.purpose,connection=purpose.connection
   const reason=!row.enabled?'请先启用插件':!purpose.configured?'请先配置模型':!purpose.canToggle?'此插件尚未提供模型启停':undefined
   return <CatalogVendorCard key={key(row)} label={name} title={name}
    identity={connection?.kind==='local'&&localQwen.has(connection.model)?<Mark id="qwen"/>:<span className={css.mark}><ConsoleIcon kind="resources"/></span>}
    actions={<div className={css.headerActions}><button type="button" aria-label={'配置 '+name} disabled={busy||!row.enabled||(chat(row)?!onCatalog:!onConfigure||!purpose.configurationPanel)} onClick={()=>configure(row)}>配置</button>{!chat(row)&&<Switch label={'启用 '+name} checked={!!active(row)} disabled={busy||!!reason} title={reason} onChange={enabled=>onSave({pluginId:row.id,purposeId:purpose.id,enabled,expectedRevision:row.revision})}/>}</div>}
    summary={chat(row)?<><span className="beellix-plugin-model-id">{model(row)}</span>{provider(row)&&<><span aria-hidden="true">·</span><span>{provider(row)}</span></>}</>:connection?<><span className="beellix-plugin-model-id">{connection.model}</span><span aria-hidden="true">·</span><span>{connection.kind==='local'?'本地运行':'API'}</span></>:purpose.operation==='embedding'?'本地模型或 API':'API 服务'}
    status={<span className={css.status} data-active={!!active(row)}><i aria-hidden="true"/>{status(row)}</span>} version={row.version}
    details={<button type="button" className={navigation.link} aria-label={'查看详情 '+name} onClick={()=>setDetail(key(row))}>查看详情</button>}/>
  })}</div>
  {!rows.length&&<div className={css.empty}>没有匹配的模型</div>}
  <Modal open={!!selected} title={selected?title(selected):'模型详情'} closeLabel="关闭" onClose={()=>setDetail('')} className="beellix-plugin-model-details">
   {selected&&<dl className={css.facts}><div><dt>插件</dt><dd>{selected.title}</dd></div><div><dt>用途</dt><dd>{selected.purpose.title}</dd></div><div><dt>状态</dt><dd>{status(selected)}</dd></div><div><dt>模型</dt><dd>{model(selected)??'未配置'}</dd></div>{selected.purpose.connection&&<div><dt>运行方式</dt><dd>{selected.purpose.connection.kind==='local'?'本地运行':'API'}</dd></div>}{selected.purpose.connection?.endpoint&&<div><dt>API 地址</dt><dd>{selected.purpose.connection.endpoint}</dd></div>}</dl>}
  </Modal>
 </div>
}
