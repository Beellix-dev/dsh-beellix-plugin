/** 原控制台外观，目录身份、凭据和操作全部指向原生 DSH。 */
import React, { useState } from 'react'
import { VendorCatalog, type CatalogLocation } from "../../../../dev/shared/console/packages/ui/admin/src/models/client/VendorCatalog.tsx"
import { ConnectionEditor } from "../../../../dev/shared/console/packages/ui/admin/src/models/client/VendorModelsPanel.tsx"
import {ProviderEditor} from "../../../../dev/shared/console/packages/ui/admin/src/models/client/ProviderEditor.tsx"
import type { ModelsSettingsState, ProviderRow } from "../../../../dev/shared/console/packages/ui/admin/src/models/client/store.ts"
import { deriveKeyRef } from "../../../../dev/shared/console/packages/ui/admin/src/models/client/store.ts"
import type { ModelsOperations } from "../../../../dev/shared/console/packages/ui/admin/src/models/client/operations.ts"
import type { en } from "../../../../dev/shared/console/packages/ui/admin/src/models/client/locales.ts"
import {Switch} from '@beellix-ai/ui-components'
import catalogStyles from "../../../../dev/shared/console/packages/ui/admin/src/models/client/VendorCatalog.module.css"

const vendorNames:Record<string,string>={deepseek:'DeepSeek',meta:'Meta',radius:'Radius',qwen:'Qwen','amazon-bedrock':'Amazon Bedrock','ant-ling':'Ant Ling',anthropic:'Anthropic',azure:'Azure AI',baseten:'Baseten',cerebras:'Cerebras',cloudflare:'Cloudflare',fireworks:'Fireworks AI','github-copilot':'GitHub Copilot',google:'Google',groq:'Groq',huggingface:'Hugging Face',moonshot:'Moonshot',minimax:'MiniMax',mistral:'Mistral',nvidia:'NVIDIA',openai:'OpenAI',opencode:'OpenCode',openrouter:'OpenRouter',together:'Together AI','vercel-ai-gateway':'Vercel AI Gateway',xai:'xAI',xiaomi:'Xiaomi',zai:'Z.ai'}
export function vendorIdentity(provider:string){
  const id=provider.startsWith('deepseek')?'deepseek':provider.startsWith('qwen')||provider.startsWith('alibaba')?'qwen':provider.startsWith('xiaomi')?'xiaomi':provider.startsWith('cloudflare')?'cloudflare':provider.startsWith('google')?'google':provider.startsWith('minimax')?'minimax':provider.startsWith('moonshot')||provider==='kimi-coding'?'moonshot':provider.startsWith('openai')?'openai':provider.startsWith('opencode')?'opencode':provider.startsWith('zai')||provider.startsWith('z-ai')?'zai':({'cloudflare-workers-ai':'cloudflare','fireworks-ai':'fireworks','together-ai':'together','azure-openai':'azure','x-ai':'xai'} as Record<string,string>)[provider]??provider
  return {id,name:vendorNames[id]??provider}
}
interface DirectoryRow {provider:string;displayName?:string;settingsNs?:string;settingsPath?:string[];entryId?:string;enabled:boolean;canToggle:boolean;canModelToggle?:boolean;modelsKnown:boolean;revision?:number;version?:string;vendor?:any;nativeAuth?:{env:string[];oauth:boolean};controlReason?:string;models:any[]}
export function NativeModelCatalog({state,catalog,operations,location,onRefresh,onEnabled,onModelEnabled,t,schema,webSearch,modelSelection}:{
 state:ModelsSettingsState;catalog:{items:DirectoryRow[]};operations:ModelsOperations;location:CatalogLocation;onRefresh:()=>Promise<void>;onEnabled:(input:any)=>Promise<{application:string}>;onModelEnabled?:(input:any)=>Promise<{application:string}>;t:(key:keyof typeof en)=>string;schema?:any;webSearch?:any;modelSelection?:any
}){
 const [busy,setBusy]=useState(false),[error,setError]=useState<string>(),[saved,setSaved]=useState(false)
 const rows=catalog.items.map(item=>{
  const original=state.rows.find(row=>row.entry.provider===item.provider)
  const nativeRef=item.nativeAuth?.env?.[0]
  const apiKeyEnv=original?.apiKeyEnv??nativeRef??(item.nativeAuth||item.provider==='deepseek-account'?undefined:deriveKeyRef(item.provider))
  const identity=original?.entry.vendor??item.vendor??vendorIdentity(item.provider)
  return {...original,apiKeyEnv,credential:original?.credential??original?.derivedCredential,configured:original?.configured??false,removable:false,entry:{...original?.entry,provider:item.provider,displayName:original?.entry.displayName??item.displayName??item.provider,settingsNs:original?.entry.settingsNs??item.settingsNs??'',settingsPath:original?.entry.settingsPath??item.settingsPath??[],active:item.enabled,vendor:{...identity,version:item.version??'',credentialRef:apiKeyEnv??'',models:item.models}}} as ProviderRow
 })
 const controls=Object.fromEntries(catalog.items.map(item=>[item.provider,{canToggle:item.canToggle,canModelToggle:item.canModelToggle===true,modelsKnown:item.modelsKnown,reason:item.controlReason}]))
 const run=async(action:()=>Promise<{application:string}>)=>{
  if(busy)return
  setBusy(true);setError(undefined);setSaved(false)
  try{const result=await action();await onRefresh();if(result.application==='restart-required')setError('更改已保存，请重启客户端生效。');else setSaved(true)}catch(e){setError(e instanceof Error?e.message:'更新失败，请刷新重试。');await onRefresh().catch(()=>{})}finally{setBusy(false)}
 }
 const toggle=(row:ProviderRow,enabled:boolean)=>{
  const item=catalog.items.find(x=>x.provider===row.entry.provider)
  if(!item?.canToggle)return
  void run(()=>onEnabled({provider:item.provider,entryId:item.entryId,enabled,expectedEnabled:item.enabled,expectedRevision:item.revision}))
 }
 const toggleVendor=(family:readonly ProviderRow[],enabled:boolean)=>{
  const targets=enabled?[family.find(row=>row.credential?.configured&&controls[row.entry.provider]?.canToggle)??family.find(row=>controls[row.entry.provider]?.canToggle)].filter(Boolean) as ProviderRow[]:family.filter(row=>row.entry.active)
  void run(async()=>{let result={application:'applied'};for(const row of targets){const item=catalog.items.find(x=>x.provider===row.entry.provider)!;result=await onEnabled({provider:item.provider,entryId:item.entryId,enabled,expectedEnabled:item.enabled})}return result})
 }
 return <VendorCatalog embedded rows={rows} location={location} nativeControls={controls} webSearch={webSearch} renderModelControls={modelSelection?(row,model)=>{const selected=modelSelection.selection?.provider===row.entry.provider&&modelSelection.selection?.model===model.id;return <div className={catalogStyles.modelSwitch}><span>{selected?'已选用':'未选用'}</span><Switch checked={selected} label={'将 '+model.name+' 用于'+modelSelection.label} disabled={busy||modelSelection.disabled||!selected&&(!row.entry.active||model.enabled===false||row.credential?.configured===false)} onChange={enabled=>modelSelection.onSelect(enabled?{provider:row.entry.provider,model:model.id}:null)}/></div>}:undefined} t={t} readOnly={!state.writable} saved={saved} modelBusy={busy} modelError={error} onVendorChange={toggleVendor} onModelChange={(row,model,enabled)=>{
  const item=catalog.items.find(x=>x.provider===row.entry.provider),selected=item?.models.find(x=>x.id===model)
  if(!item?.canModelToggle||!selected||!onModelEnabled)return
  void run(()=>onModelEnabled({provider:item.provider,model,enabled,expectedEnabled:selected.enabled!==false,expectedRevision:item.revision}))
 }} onConnectionChange={toggle} editor={(row,close)=>{
  const namespace=state.namespaces.get(row.entry.settingsNs)
  if(!namespace)return <p role="status">请先启用连接，再配置参数。</p>
  if(schema&&['llm-deepseek','llm-pi-ai'].includes(namespace.ns))return <ProviderEditor hideTitle provider={row.entry.provider} displayName={row.entry.displayName} declared={row.entry.declared===true} namespace={namespace} settingsPath={row.entry.settingsPath} operations={operations} schema={schema} t={t} readOnly={!state.writable} onClose={async(changed:boolean)=>{if(changed)await onRefresh();close?.()}}/>
  if(!row.apiKeyEnv)return <p role="status">此连接使用 DSH 原生认证，请在客户端模型设置中登录或配置。</p>
  return <ConnectionEditor key={row.entry.provider} row={row} namespace={namespace} operations={operations} t={t} readOnly={!state.writable} preserveNativeAuthentication={!state.rows.find(x=>x.entry.provider===row.entry.provider)?.apiKeyEnv} onCancel={close} onSaving={()=>setSaved(false)} onSaved={async()=>{await onRefresh();setSaved(true);close?.()}}/>
 }}/>
}
