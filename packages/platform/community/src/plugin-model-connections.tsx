import React from 'react'
import {Switch} from '@beellix-ai/ui-components'
import {CatalogVendorCard} from "../../../../dev/shared/console/packages/ui/admin/src/models/client/VendorCatalog.tsx"
import {Mark} from "../../../../dev/shared/console/packages/ui/admin/src/models/client/CatalogModelCard.tsx"
import css from "../../../../dev/shared/console/packages/ui/admin/src/models/client/VendorCatalog.module.css"
import {ConsoleIcon} from './console-icons.mjs'

const chat=(row:any)=>!row.purpose.operation||row.purpose.operation==='chat'
const title=(row:any)=>row.title+' · '+row.purpose.title
const declaration=(row:any)=>row.models?.purposes?.find((purpose:any)=>purpose.id===row.purpose.id)
export function PluginModelConnections({items,groups=[],defaultSelection,busy,onSave,onConfigure,onCatalog}:any){
 return <div className={css.catalog} data-model-page="plugin-connections"><div className={css.grid}>{items.map((row:any)=>{
  const purpose=row.purpose,declared=declaration(row),inherits=purpose.default==='host-main'||declared?.default==='host-main',required=purpose.required??declared?.required??false
  const selection=purpose.selection??(inherits?defaultSelection:null),provider=groups.find((item:any)=>item.id===selection?.provider),native=provider?.models.find((item:any)=>item.id===selection?.model)
  const configured=chat(row)?!!native:purpose.configured,active=row.enabled&&configured&&purpose.enabled!==false
  const name=chat(row)?native?.name??selection?.model??'未选择模型':purpose.connection?.model??'—'
  const configure=()=>chat(row)?onCatalog(row):onConfigure(purpose.configurationPanel,{capabilityId:row.id.split('/').at(-1),title:row.title,view:'model:'+purpose.id})
  const configAvailable=chat(row)?!!onCatalog:!!onConfigure&&!!purpose.configurationPanel
  const save=(change:any)=>onSave({pluginId:row.id,purposeId:purpose.id,...change,expectedRevision:row.revision})
  const toggleAvailable=purpose.canToggle||!configured&&configAvailable
  return <CatalogVendorCard key={row.id+':'+purpose.id} label={title(row)} title={purpose.title}
   identity={provider?<Mark id={provider.id}/>:<span className={css.mark}><ConsoleIcon kind="resources"/></span>}
   actions={<div className={css.headerActions}><button type="button" aria-label={(chat(row)?'选择模型 ':'配置 ')+title(row)} disabled={busy||!row.enabled||!configAvailable} onClick={configure}>{chat(row)?'选择模型':'配置'}</button>{!chat(row)&&<Switch label={'启用 '+title(row)} checked={!!active} disabled={busy||!row.enabled||!toggleAvailable} title={!toggleAvailable?'此插件未提供模型启停':undefined} onChange={enabled=>purpose.canToggle?save({enabled}):onConfigure(purpose.configurationPanel,{capabilityId:row.id.split('/').at(-1),title:row.title,view:'model:'+purpose.id+':enable'})}/>}</div>}
   summary={<><span className="beellix-model-requirement" data-required={required}>{required?'必配':'选配'}</span>{chat(row)&&inherits&&!purpose.selection&&<span>沿用主模型</span>}</>}
   status={<span className={css.status} data-active={!!active}><i aria-hidden="true"/>{!row.enabled?'插件已停用':!configured?'待配置':active?'已启用':'已关闭'}</span>}
   details={chat(row)&&inherits&&purpose.selection?<button type="button" className="beellix-model-reset" aria-label="恢复DSH主模型" disabled={busy||!row.enabled} onClick={()=>save({selection:null})}>恢复主模型</button>:null}>
   <div className="beellix-model-purpose-value">{purpose.modelOptions?.length?<select aria-label={title(row)+'模型'} value={purpose.connection?.model??purpose.modelOptions[0]} disabled={busy||!row.enabled||!purpose.canToggle} title={!purpose.canToggle?'请先配置服务连接':undefined} onChange={event=>save({modelId:event.target.value})}>{purpose.connection?.model&&!purpose.modelOptions.includes(purpose.connection.model)&&<option value={purpose.connection.model}>{purpose.connection.model}</option>}{purpose.modelOptions.map((id:string)=><option key={id} value={id}>{id}</option>)}</select>:<span>{name}</span>}</div>
  </CatalogVendorCard>
 })}</div></div>
}
