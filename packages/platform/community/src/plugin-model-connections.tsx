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

export function PluginModelGroups({plugin,groups,busy,onConfigure}:any){
 const rows=plugin.purposes.map((purpose:any)=>({...plugin,purpose}))
 return <div className={css.catalog} data-model-page="plugin-workflows"><div className={css.grid}>{groups.map((group:any)=>{
  const members=group.purposeIds.map((id:string)=>rows.find((row:any)=>row.purpose.id===id)),primary=members[0],ready=!!primary&&configured(primary)
  const descriptions=members.map((row:any)=>chat(row)?row.purpose.selection?.model??(inheritsMain(row)?'沿用主模型':'未选择整理模型'):row.purpose.operation==='parse'&&row.purpose.enabled===false?'本地文档解析':row.purpose.connection?.model??(row.purpose.operation==='rerank'?'未启用重排':'尚未配置'))
  return <CatalogVendorCard key={group.id} label={group.title} title={group.title} identity={<span className={css.mark}><ConsoleIcon kind="resources"/></span>}
   actions={<button type="button" aria-label={'配置 '+group.title} disabled={busy||!plugin.enabled} onClick={()=>onConfigure(group.id)}>配置</button>}
   summary={<span>{descriptions.join(' · ')}</span>} status={<span className={css.status} data-active={!!plugin.enabled&&ready}><i aria-hidden="true"/>{!plugin.enabled?'插件已停用':ready?'已配置':'待配置'}</span>} version={plugin.version} details={<span>{group.description}</span>}/>
 })}</div></div>
}

export function PluginModelPlan({group,items,groups=[],busy,onSave,onConfigure,onCatalog,onBack}:any){
 const optional=(row:any)=>row.models?.purposes?.find((purpose:any)=>purpose.id===row.purpose.id)?.required===false
 const main=items.filter((row:any)=>!optional(row)),extra=items.filter(optional)
 const name=(row:any)=>chat(row)?row.purpose.selection?.model??(inheritsMain(row)?'沿用 DSH 主模型':'尚未选择模型'):row.purpose.operation==='parse'?'MinerU':row.purpose.connection?.model
 const provider=(row:any)=>groups.find((g:any)=>g.id===row.purpose.selection?.provider)?.name??row.purpose.selection?.provider
 const description=(row:any)=>row.purpose.operation==='embedding'?'资料索引与查询共用此向量模型。':row.purpose.operation==='rerank'?'对召回结果进一步排序，未启用时使用原检索排序。':row.purpose.operation==='parse'?'启用后，适用的 PDF、Word、PPT 和图片上传至 MinerU 解析。':'统一整理所有入口提交的资料，并遵循本次入库规则。'
 const configure=(row:any)=>chat(row)?onCatalog?.(row):onConfigure?.(row.purpose.configurationPanel,{capabilityId:row.id.split('/').at(-1),title:row.title,view:'model:'+row.purpose.id})
 const render=(row:any)=>{
  const purpose=row.purpose,ready=configured(row),toggleReason=!row.enabled?'请先启用插件':!ready?'配置完成后可启用':!purpose.canToggle?'此能力不支持独立启停':undefined
  const state=!row.enabled?'插件已停用':purpose.operation==='parse'&&purpose.enabled===false?'当前使用本地解析':status(row)
  return <section className="beellix-model-plan-row" key={key(row)} aria-label={purpose.title}>
   <div className="beellix-model-plan-copy"><h3>{purpose.operation==='parse'?'文档解析':purpose.title}</h3><p>{description(row)}</p><div className="beellix-model-plan-connection">{name(row)&&<span className="beellix-model-plan-name">{name(row)}</span>}{provider(row)&&<span>{provider(row)}</span>}{!chat(row)&&purpose.connection&&<span>{purpose.connection.kind==='local'?'本地运行':'API'}</span>}<span className="beellix-model-plan-status" data-active={!!active(row)}>{chat(row)?ready?'已选用':'未配置':state}</span></div></div>
   <div className="beellix-model-plan-actions"><button className="beellix-model-plan-configure" type="button" aria-label={'配置 '+title(row)} disabled={busy||!row.enabled||(chat(row)?!onCatalog:!onConfigure||!purpose.configurationPanel)} onClick={()=>configure(row)}>{chat(row)?'选择模型':ready?'更改配置':'配置'}</button>{!chat(row)&&<Switch label={'启用 '+title(row)} checked={!!active(row)} disabled={busy||!!toggleReason} title={toggleReason} onChange={enabled=>onSave({pluginId:row.id,purposeId:purpose.id,enabled,expectedRevision:row.revision})}/>}</div>
  </section>
 }
 return <section className="beellix-model-plan" aria-label={group.title+'设置'}>
  <header className="beellix-model-plan-header"><button type="button" className="beellix-model-plan-back" aria-label="返回模型方案" disabled={busy} onClick={onBack}><ConsoleIcon kind="back" size={16}/>模型方案</button><h2>{group.title}</h2><p>{group.description}</p></header>
  <div className="beellix-model-plan-main">{main.map(render)}</div>
  {!!extra.length&&<details className="beellix-model-plan-extra" open={extra.some((row:any)=>configured(row)&&row.purpose.enabled!==false)||undefined}><summary>{extra.every((row:any)=>row.purpose.operation==='rerank')?'检索增强':extra.every((row:any)=>row.purpose.operation==='parse')?'文档解析服务':'扩展能力'}<span>可选</span></summary>{extra.map(render)}</details>}
 </section>
}

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
