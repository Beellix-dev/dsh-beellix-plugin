import React,{useState,useEffect} from 'react'
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

function IngestionModelForm({row,groups,defaultSelection,busy,onSave,onMainModels}:any){
 const selection=row.purpose.selection,stored=JSON.stringify(selection??null)
 const [enhanced,setEnhanced]=useState(!!selection),[provider,setProvider]=useState(selection?.provider??defaultSelection?.provider??''),[model,setModel]=useState(selection?.model??''),[saving,setSaving]=useState(false)
 const reset=()=>{setEnhanced(!!selection);setProvider(selection?.provider??defaultSelection?.provider??'');setModel(selection?.model??'')}
 useEffect(reset,[stored])
 const choices=groups.filter((group:any)=>group.models.length),current=groups.find((group:any)=>group.id===provider),selected=current?.models.find((item:any)=>item.id===model)
 const defaultGroup=groups.find((group:any)=>group.id===defaultSelection?.provider),defaultModel=defaultGroup?.models.find((item:any)=>item.id===defaultSelection?.model)
 const draft=enhanced?{provider,model}:null,dirty=JSON.stringify(draft)!==stored,disabled=busy||saving||!row.enabled
 const save=async(event:any)=>{event.preventDefault();if(disabled||!dirty||enhanced&&!selected)return;setSaving(true);try{await onSave({pluginId:row.id,purposeId:row.purpose.id,selection:draft,expectedRevision:row.revision})}finally{setSaving(false)}}
 return <form className="beellix-ingestion-model" aria-label="入库模型" onSubmit={event=>void save(event)}>
  <div className="beellix-model-default"><div className="beellix-model-field-title">默认模型</div><div className="beellix-model-default-value">{defaultModel?<><strong>{defaultModel.name??defaultModel.id}</strong><span>{defaultGroup.name??defaultGroup.id} · 跟随 DSH 主模型配置</span></>:<><strong>尚无可用的默认模型</strong><span>请先在主模型配置中连接服务并启用模型。</span></>}{onMainModels&&<button type="button" className="beellix-model-text-action" disabled={disabled} onClick={onMainModels}>管理主模型</button>}</div></div>
  <div className="beellix-model-enhancement"><div className="beellix-model-enhancement-heading"><div><h3>增强模型<span>可选</span></h3><p>为入库整理单独选用模型；关闭后使用默认模型。</p></div><Switch label="启用增强模型" checked={enhanced} disabled={disabled} onChange={setEnhanced}/></div>
   {enhanced&&<div className="beellix-model-form-fields"><label>模型服务<select aria-label="模型服务" disabled={disabled} value={provider} onChange={event=>{setProvider(event.target.value);setModel('')}}><option value="">选择已配置的服务</option>{provider&&!choices.some((group:any)=>group.id===provider)&&<option value={provider} disabled>{provider}（不可用）</option>}{choices.map((group:any)=><option key={group.id} value={group.id}>{group.name??group.id}</option>)}</select></label><label>增强模型<select aria-label="增强模型" disabled={disabled||!current?.models.length} value={model} onChange={event=>setModel(event.target.value)}><option value="">选择模型</option>{model&&!selected&&<option value={model} disabled>{model}（不可用）</option>}{(current?.models??[]).map((item:any)=><option key={item.id} value={item.id}>{item.name??item.id}</option>)}</select></label>{!choices.length&&<p className="beellix-model-field-help">没有可选的已配置模型，请先在主模型配置中添加。</p>}{model&&!selected&&<p className="beellix-model-field-help" role="alert">原模型已不可用。请选择其他模型，或关闭增强以使用默认模型。</p>}</div>}
  </div>
  {dirty&&<footer className="beellix-model-form-footer"><span>有未保存的更改</span><button type="button" disabled={disabled} onClick={reset}>取消更改</button><button type="submit" className="beellix-model-form-save" disabled={disabled||enhanced&&!selected}>{saving?'保存中…':'保存更改'}</button></footer>}
 </form>
}

export function PluginModelPlan({group,items,groups=[],defaultSelection,busy,onSave,onConfigure,onMainModels}:any){
 const optional=(row:any)=>row.models?.purposes?.find((purpose:any)=>purpose.id===row.purpose.id)?.required===false
 const main=items.filter((row:any)=>!optional(row)),extra=items.filter(optional)
 const render=(row:any)=>{
  if(chat(row))return <IngestionModelForm key={key(row)} row={row} groups={groups} defaultSelection={defaultSelection} busy={busy} onSave={onSave} onMainModels={onMainModels}/>
  const purpose=row.purpose,ready=configured(row),toggleReason=!row.enabled?'请先启用插件':!ready?'配置完成后可启用':!purpose.canToggle?'此能力不支持独立启停':undefined
  const name=purpose.operation==='parse'?'MinerU':purpose.connection?.model??'尚未配置'
  const description=purpose.operation==='embedding'?'资料索引与查询共用此向量模型。':purpose.operation==='rerank'?'对召回结果进一步排序，未启用时使用原检索排序。':'启用后，适用的 PDF、Word、PPT 和图片上传至 MinerU 解析。'
  return <section className="beellix-model-plan-row" key={key(row)} aria-label={purpose.title}>
   <div className="beellix-model-plan-copy"><h3>{purpose.operation==='parse'?'文档解析':purpose.title}</h3><p>{description}</p><div className="beellix-model-plan-connection"><span className="beellix-model-plan-name">{name}</span><span>{purpose.operation==='parse'&&purpose.enabled===false?'当前使用本地解析':status(row)}</span></div></div>
   <div className="beellix-model-plan-actions"><button className="beellix-model-plan-configure" type="button" aria-label={'配置 '+title(row)} disabled={busy||!row.enabled||!onConfigure||!purpose.configurationPanel} onClick={()=>onConfigure(row.purpose.configurationPanel,{capabilityId:row.id.split('/').at(-1),title:row.title,view:'model:'+row.purpose.id})}>{ready?'更改配置':'配置'}</button><Switch label={'启用 '+title(row)} checked={!!active(row)} disabled={busy||!!toggleReason} title={toggleReason} onChange={enabled=>onSave({pluginId:row.id,purposeId:purpose.id,enabled,expectedRevision:row.revision})}/></div>
  </section>
 }
 return <section className="beellix-model-plan" aria-label={group.title+'设置'}>
  <div className="beellix-model-plan-main">{main.map(render)}</div>
  {!!extra.length&&<details className="beellix-model-plan-extra"><summary>{extra.every((row:any)=>row.purpose.operation==='rerank')?'检索重排':extra.every((row:any)=>row.purpose.operation==='parse')?'文档解析服务':'扩展能力'}<span>{extra.some(row=>active(row))?'已启用':'可选'}</span></summary>{extra.map(render)}</details>}
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
