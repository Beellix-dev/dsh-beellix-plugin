import React,{useEffect,useState} from 'react'
import {ConsoleIcon} from './console-icons.mjs'
import {Mark} from "../../../../dev/shared/console/packages/ui/admin/src/models/client/CatalogModelCard.tsx"
import {vendorIdentity} from './model-catalog.tsx'
import {SectionTabs} from './console-structure.tsx'
import {PluginModelConnections} from './plugin-model-connections.tsx'

export function PluginModelConfiguration({state,busy,onSave,renderModels,onConfigure,onCatalogChange}:any){
 const [pluginId,setPluginId]=useState(''),[target,setTarget]=useState('')
 const plugins=(state?.plugins??[]).filter((plugin:any)=>plugin.purposes?.length)
 const plugin=plugins.find((item:any)=>item.id===pluginId)??plugins[0],active=plugin?.id
 const rows=(plugin?.purposes??[]).map((purpose:any)=>({...plugin,purpose}))
 const row=rows.find((item:any)=>item.id+':'+item.purpose.id===target)
 const nativeCatalog=!!row&&(!row.purpose.operation||row.purpose.operation==='chat')
 useEffect(()=>{onCatalogChange?.(nativeCatalog)},[nativeCatalog,onCatalogChange])
 if(!state)return <p role="status" className="beellix-console__empty">读取中…</p>
 if(!plugins.length)return <p role="status" className="beellix-console__empty">暂无需要配置的插件模型</p>
 const key=row?row.id+':'+row.purpose.id:''
 const save=(selection:any)=>onSave({pluginId:row.id,purposeId:row.purpose.id,selection,expectedRevision:row.revision})
 return <section aria-label="插件模型配置"><div className="beellix-plugin-model-toolbar"><SectionTabs label="插件模型分组" buttons disabled={busy} items={plugins.map((item:any)=>[item.id,item.title])} active={active} onChange={id=>{setPluginId(id);setTarget('')}}/></div>{nativeCatalog?<><div className="beellix-plugin-model-toolbar"><button onClick={()=>setTarget('')}>返回插件模型</button><strong>{row.purpose.title}</strong>{row.purpose.selection&&!state.groups?.some((group:any)=>group.id===row.purpose.selection.provider&&group.models.some((model:any)=>model.id===row.purpose.selection.model))&&<button disabled={busy||!row.enabled} onClick={()=>save(null)}>清除选择</button>}</div>{renderModels?.({key,modalities:row.purpose.inputModalities??[],selection:row.purpose.selection,label:row.purpose.title,disabled:busy||!row.enabled,onSelect:save})}</>:<PluginModelConnections key={active} items={rows} groups={state.groups??[]} busy={busy} onSave={onSave} onConfigure={onConfigure} onCatalog={(item:any)=>setTarget(item.id+':'+item.purpose.id)}/>}</section>
}
const dash=(data:any)=>data?.message??'暂无官方数据'
const amount=(value:any)=>typeof value==='string'||typeof value==='number'?String(value):'—'
export function OfficialModelAccounts({state}:any){
 const [selected,setSelected]=useState('')
 if(!state)return <p role="status" className="beellix-console__empty">读取中…</p>
 if(!state.items.length)return <p className="beellix-console__empty">请先配置模型连接</p>
 const account=state.items.find((row:any)=>row.provider===selected)??state.items[0]
 const prices=account.prices?.status==='ready'?account.prices.value.items:[]
 const models=account.models?.status==='ready'?account.models.value:[]
 const names=new Map(models.map((model:any)=>[model.id,model.name??model.id]))
 const rows=prices.length?prices:models.map((model:any)=>({model:model.id}))
 const balances=account.balance?.status==='ready'?account.balance.value:[]
 const price=(row:any,key:string)=>row[key]!==undefined?`${row.currency} ${row[key]}`:'—'
 return <section className="beellix-model-accounts" aria-label="已配置模型用量与余额">
  <div className="beellix-account-toolbar"><div className="beellix-model-name"><Mark id={vendorIdentity(account.provider).id}/>{state.items.length>1?<select aria-label="模型服务" value={account.provider} onChange={event=>setSelected(event.target.value)}>{state.items.map((row:any)=><option key={row.provider} value={row.provider}>{row.name}</option>)}</select>:<strong>{account.name}</strong>}</div><span className="beellix-account-links">{account.prices?.source&&<a href={account.prices.source} target="_blank" rel="noreferrer" title={account.prices.value?.rule??dash(account.prices)}>官方价格 ↗</a>}{account.usage?.source&&<a href={account.usage.source} target="_blank" rel="noreferrer">官方账单 ↗</a>}</span></div>
  <dl className="beellix-account-summary"><div title={account.balance?.status==='ready'?'当前连接所属账户余额':dash(account.balance)}><dt><ConsoleIcon kind="balance"/>余额</dt><dd>{balances.length?balances.map((balance:any)=><span key={balance.currency}>{balance.currency} {balance.total_balance}</span>):'—'}</dd></div><div title={dash(account.usage)}><dt><ConsoleIcon kind="usage"/>用量</dt><dd>{account.usage?.status==='ready'?amount(account.usage.value?.totalTokens):'—'}</dd></div></dl>
  <div className="beellix-account-table-label"><span>模型与价格</span><small title={account.checkedAt?new Date(account.checkedAt).toLocaleString():undefined}>单价 / 百万 Token</small></div>
  <div className="beellix-model-table"><table aria-label="模型用量与价格"><thead><tr><th>模型</th><th>计费时段</th><th>输入价格</th><th>输出价格</th><th>缓存价格</th><th>用量</th></tr></thead><tbody>{rows.map((row:any,index:number)=><tr key={row.model+':'+(row.period??index)}><td title={row.model}>{names.get(row.model)??row.model}</td><td title={account.prices.value?.rule??dash(account.prices)}>{row.period??'—'}</td><td title={dash(account.prices)}>{price(row,'input')}</td><td title={dash(account.prices)}>{price(row,'output')}</td><td title={dash(account.prices)}>{price(row,'cacheRead')}</td><td title={dash(account.usage)}>—</td></tr>)}{!rows.length&&<tr><td colSpan={6} className="beellix-model-no-data" title={dash(account.models)}>暂无可用数据</td></tr>}</tbody></table></div>
 </section>
}
