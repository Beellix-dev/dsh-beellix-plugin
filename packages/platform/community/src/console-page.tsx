import {OperationFeedback} from "../../../../dev/shared/console/operation-feedback.mjs"
/** 原控制台页面与原生宿主的薄适配；不安装旧客户端装配或重复设置入口。 */
import React, { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { ModelsSection } from "../../../../dev/shared/console/packages/ui/admin/src/models/client/ModelsSection.tsx"
import { ModelsSettingsStore } from "../../../../dev/shared/console/packages/ui/admin/src/models/client/store.ts"
import { createModelsOperations } from "../../../../dev/shared/console/packages/ui/admin/src/models/client/operations.ts"
import { createSettingsSchemaOperations } from "../../../../dev/shared/console/packages/ui/admin/src/models/client/schema-operations.ts"
import { zh as modelsZh } from "../../../../dev/shared/console/packages/ui/admin/src/models/client/locales.ts"
import { SkillDirectory } from "../../../../dev/shared/console/packages/ui/admin/src/pages/client/SkillDirectory.tsx"
import { zh as adminZh } from "../../../../dev/shared/console/packages/ui/admin/src/pages/client/locales.ts"
import {SectionTabs,ScenarioDirectory,ResourceDirectory,resourceSections} from './console-structure.tsx'
export {SectionTabs,DetailHeading,DetailSection,ObjectFacts} from './console-structure.tsx'
import { NativeModelCatalog } from './model-catalog.tsx'
import { ApplicationManager } from './package-manager.tsx'
import {ResourceInstaller} from './resource-installer.tsx'
import {CustomProviderCard} from "../../../../dev/shared/console/packages/ui/admin/src/models/client/CustomProviderCard.tsx"
import {ProviderEditor} from "../../../../dev/shared/console/packages/ui/admin/src/models/client/ProviderEditor.tsx"
import {protocolChoices} from "../../../../dev/shared/console/packages/ui/admin/src/models/client/store.ts"
import {Modal} from '@deepseek-ai/dsh-client-ui-primitives'
import {PluginModelConfiguration,OfficialModelAccounts} from './model-center.tsx'
import {ArchivedConversations} from './archived-sessions.tsx'
import {IntegrationPage} from './integration-page.tsx'
export { ApplicationManager } from './package-manager.tsx'

export function createConsoleFace(ctx: any) {
  const mirror = ctx.configForms.describe()
  const scope = { describe: () => mirror, refresh: async () => { const response = await ctx.remote.settings.describe(); if (!response.ok) throw Error(response.error.message); for (const view of response.value.namespaces) mirror.acceptView(view) } }
  const schema = createSettingsSchemaOperations(ctx.settingsSchema)
  const modelCtx = { remote: ctx.remote, settingsScope: scope }
  const models = new ModelsSettingsStore(modelCtx as any, schema, mirror)
  const operations = createModelsOperations(modelCtx as any)
  const refresh = () => { if (models.store.getSnapshot().status !== 'idle') void models.load() }
  ctx.effect(() => { const off = [ctx.remote.$on('settings/document-updated', refresh), ctx.remote.$on('credentials/reference-updated', refresh), ctx.remote.$on('llm/adapters-updated', refresh), ctx.on('connection/reset', refresh)]; return () => off.forEach(fn => fn()) }, 'Beelli X：原模型页状态同步')
  return { models, operations, schema }
}

function AddModelForm({face,state,onClose,onRefresh}:any){
 const choices=state.rows.filter((row:any)=>['llm-deepseek','llm-pi-ai'].includes(row.entry.settingsNs)&&state.namespaces.has(row.entry.settingsNs))
 const [kind,setKind]=useState(choices.length?'provider':'custom'),[selected,setSelected]=useState(choices[0]?.entry.provider??'')
 const row=choices.find((item:any)=>item.entry.provider===selected)??choices[0]
 const protocols=protocolChoices(state.namespaces.get('llm-pi-ai'),face.schema),t=(key:string)=>key==='enableWebSearch'?'使用 Search API':(modelsZh as any)[key]??key
 const close=async(changed:boolean)=>{if(changed){await face.models.load();await onRefresh?.()}onClose()}
 if(state.status!=='ready')return <p role={state.error?'alert':'status'}>{state.error??'读取配置中…'}</p>
 return <><SectionTabs label="模型接入方式" buttons items={[["provider","模型提供商"],["custom","自定义 API"]]} active={kind} onChange={setKind}/>{kind==='provider'?row?<><label className="beellix-model-provider-select">提供商<select aria-label="模型提供商" value={row.entry.provider} onChange={e=>setSelected(e.target.value)}>{choices.map((item:any)=><option key={item.entry.provider} value={item.entry.provider}>{item.entry.displayName}</option>)}</select></label><ProviderEditor key={row.entry.provider} hideTitle provider={row.entry.provider} displayName={row.entry.displayName} declared={row.entry.declared===true} namespace={state.namespaces.get(row.entry.settingsNs)} settingsPath={row.entry.settingsPath} schema={face.schema} operations={face.operations} t={t} readOnly={!state.writable} onClose={close}/></>:<p role="status">DSH 模型适配器尚未就绪</p>:protocols.length?<CustomProviderCard taken={state.rows.map((item:any)=>item.entry.provider)} protocols={protocols} revision={state.namespaces.get('llm-pi-ai').revision} operations={face.operations} t={t} readOnly={!state.writable} onClose={close}/>:<p role="status">DSH 通用模型适配器尚未就绪</p>}</>
}

export function ModelsPage({ face, catalog, onEnabled, onModelEnabled, onRefresh, adding, onCloseAdd, webSearch, modelSelection }: any) {
  const state = useSyncExternalStore(face.models.store.subscribe, face.models.store.getSnapshot)
  useEffect(()=>{if(face.models.store.getSnapshot().status==='idle')void face.models.load()},[face])
  const [location, setLocation] = useState({})
  return <><Modal open={Boolean(adding)} title="添加模型" closeLabel="关闭" onClose={onCloseAdd}><AddModelForm face={face} state={state} onClose={onCloseAdd} onRefresh={onRefresh}/></Modal><div className="beellix-console__original-models" onClickCapture={event => { const anchor = (event.target as HTMLElement).closest('a[href]'); if (!anchor) return; const url = new URL(anchor.getAttribute('href')!, document.baseURI); if (url.pathname !== '/admin/models') return; event.preventDefault(); setLocation(Object.fromEntries(url.searchParams)) }}>{catalog ? <NativeModelCatalog modelSelection={modelSelection} webSearch={webSearch} state={state} catalog={catalog} operations={face.operations} location={location} onEnabled={onEnabled} onModelEnabled={onModelEnabled} schema={face.schema} onRefresh={async()=>{await face.models.load();await onRefresh?.()}} t={(key:string)=>key==='enableWebSearch'?'使用 Search API':(modelsZh as any)[key]??key}/> : <ModelsSection webSearch={webSearch} providerCards catalogLocation={location} controller={face.models} operations={face.operations} schema={face.schema} t={(key: string) => (modelsZh as any)[key] ?? key} useSnapshot={selector => selector(state)} renderSlot={() => null} />}</div></>
}

export function SkillsPage({ items, read }: any) {
  return <SkillDirectory state={{ skills: items, skillsIncomplete: false } as any} t={(key: string) => (adminZh as any)[key] ?? key} read={read} />
}

const includes=(row:any,query:string)=>Object.values(row).filter(value=>typeof value==='string').join(' ').toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())
const resourceTargets=[{id:'knowledge',name:'@beellix-ai/knowledge',title:'知识库'},{id:'data-platform',name:'@beellix-ai/data-platform',title:'数据中台'},{id:'database',name:'@beellix-ai/database',title:'数据库'}]
const installedResource=(row:any)=>row&&['enabled','disabled','pending','failed'].includes(row.state)

export function ConsoleContent(props:any){return props.tab==='integrations'?<IntegrationPage api={props.api}/>:['archives','operations'].includes(props.tab)?<ArchivedConversations api={props.api} restore={props.restoreArchive}/>:<ConsoleModules {...props}/>}
function ConsoleModules({tab,api,modelFace,openPanel,initialPrice,openManager,renderCapability}:any){
  const [state,setState]=useState<any>(),[inventory,setInventory]=useState<any>(),[modelCatalog,setModelCatalog]=useState<any>()
  const [error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(true),[section,setSection]=useState(initialPrice?.section??(initialPrice?'account':'models'))
  const [installing,setInstalling]=useState<string>(),[query,setQuery]=useState(''),[status,setStatus]=useState('all')
  const [pluginUsesCatalog,setPluginUsesCatalog]=useState(false)
  const [addingModel,setAddingModel]=useState(false),[pluginModels,setPluginModels]=useState<any>(),[officialModels,setOfficialModels]=useState<any>(),[search,setSearch]=useState<any>()
  const [resourceInstalling,setResourceInstalling]=useState<any>(),[resourceSection,setResourceSection]=useState('knowledge')
  const [resourceActions,setResourceActions]=useState<Record<string,any>>({})
  const registerActions=useCallback((id:string,actions:any)=>{setResourceActions(current=>({...current,[id]:actions}));return()=>setResourceActions(current=>current[id]===actions?{...current,[id]:undefined}:current)},[])
  const reading=busy
  const generation=useRef(0)
  const load=async()=>{
    const ticket=++generation.current;setBusy(true);setError('')
    try{
      const next=await api.read('state');if(ticket!==generation.current)return;setState(next)
      const tasks:any[]=[]
      if(tab==='scenarios')tasks.push(api.read('inventory').then((value:any)=>{if(ticket===generation.current)setInventory(value)}))
      if(tab==='models'&&section==='models')tasks.push(api.read('models/catalog').then((value:any)=>{if(ticket===generation.current)setModelCatalog(value)}),api.read('models/search').then((value:any)=>{if(ticket===generation.current)setSearch(value)}))
      if(tab==='models'&&section==='plugin-models')tasks.push(api.read('models/plugins').then((value:any)=>{if(ticket===generation.current)setPluginModels(value)}),api.read('models/catalog').then((value:any)=>{if(ticket===generation.current)setModelCatalog(value)}))
      if(tab==='models'&&section==='account')tasks.push(api.read('models/official').then((value:any)=>{if(ticket===generation.current)setOfficialModels(value)}))
      const settled=await Promise.allSettled(tasks);const failures=settled.filter(row=>row.status==='rejected');if(ticket===generation.current&&failures.length)setError(failures.map((row:any)=>row.reason.message).join('；'))
    }catch(e:any){if(ticket===generation.current)setError(e.message)}finally{if(ticket===generation.current)setBusy(false)}
  }
  useEffect(()=>{void load();return()=>{generation.current++}},[tab,section])
  const refresh=async()=>{try{if(tab==='models'&&section==='account'){const ticket=++generation.current;setBusy(true);setError('');try{const value=await api.read('models/official?refresh=true');if(ticket===generation.current)setOfficialModels(value)}catch(e:any){if(ticket===generation.current)setError(e.message)}finally{if(ticket===generation.current)setBusy(false)}return}if(tab==='models'&&modelFace){const face=modelFace();await face.operations.refreshSettings?.();if(['models','plugin-models'].includes(section))await face.models.load()}await load()}catch(e:any){setError(e.message);setBusy(false)}}
  const manage=(category:string)=>openManager?openManager(category):setInstalling(category)
  const run=async(fn:()=>Promise<any>)=>{if(busy)return;setBusy(true);setError('');setNotice('');try{const value=await fn();await load();setNotice(value.application==='restart-required'?'更改已保存，重启客户端后生效。':'已保存')}catch(e:any){setError(e.message)}finally{setBusy(false)}}
  const title=({models:'模型',scenarios:'场景应用',resources:'知识与数据'}as any)[tab]
  const tabs=tab==='models'?[['models','主模型配置'],['plugin-models','插件模型配置'],['account','用量与余额']]:tab==='resources'?resourceSections(state?.capabilities??[]):tab==='scenarios'?[['all','全部场景'],['true','已启用'],['false','已停用']]:[]
  const scenes=(inventory?.scenes??[]).filter((row:any)=>includes(row,query)&&(status==='all'||String(row.enabled)===status))
  const resourceTarget=resourceTargets.find(target=>target.id===(resourceSection==='data'?'data-platform':resourceSection))
  const resourceRow=state?.capabilities?.find((row:any)=>row.id===resourceTarget?.id)
  const needsResourceInstall=tab==='resources'&&resourceTarget!==undefined&&!installedResource(resourceRow)&&!error&&!state?.addonError
  const resourceSettings=tab==='resources'&&resourceRow?.state==='enabled'&&resourceRow.connection!=='waiting'&&resourceRow.configPanel&&openPanel
  const sceneFilters=<div className="beellix-console__filters beellix-console__filters--search"><input type="search" aria-label="搜索场景" placeholder="搜索场景" value={query} onChange={event=>setQuery(event.target.value)}/></div>
  return <div className={'beellix-bootstrap'+(tab==='resources'&&resourceTarget?.id==='knowledge'?' beellix-bootstrap--knowledge':'')}><div className="beellix-bootstrap__page beellix-console" data-resource={tab==='resources'?resourceTarget?.id:undefined} aria-busy={reading} role="region" aria-label={title}>
    <header className="beellix-page-toolbar">{tabs.length>0&&<SectionTabs label={title+'分类'} items={tabs} active={tab==='resources'?resourceSection:tab==='scenarios'?status:section} onChange={id=>{if(tab==='scenarios'){setStatus(id);return}if(tab==='resources')setResourceSection(id);else setSection(id);setAddingModel(false);setNotice('');setQuery('');setStatus('all')}}/>}<div className="beellix-bootstrap__actions">{tab==='models'&&(section==='models'||section==='plugin-models'&&pluginUsesCatalog)&&<button onClick={()=>setAddingModel(true)}>添加模型</button>}{tab==='scenarios'&&<button onClick={()=>manage('scenarios')}>安装 / 升级场景</button>}{resourceSettings&&<button disabled={reading} onClick={()=>resourceActions[resourceRow.id]?.configure?resourceActions[resourceRow.id].configure():openPanel(resourceRow.configPanel,{capabilityId:resourceRow.id,title:resourceRow.title,view:"settings"})}>配置</button>}{needsResourceInstall?<button aria-label={'安装'+resourceTarget?.title} disabled={reading||!state||resourceRow?.state==='installing'} onClick={()=>setResourceInstalling({...resourceTarget,offered:resourceRow})}>安装</button>:<button disabled={reading} onClick={()=>void refresh()}>刷新</button>}</div></header>
    <OperationFeedback error={error} notice={notice} onErrorDone={()=>setError('')} onNoticeDone={()=>setNotice('')}/>
    {!state?<p role="status" className="beellix-console__empty">{busy?'读取中…':'请刷新重试'}</p>:<>
      {tab==='models'&&section==='models'&&(modelCatalog&&modelFace?<ModelsPage webSearch={search?{...search,busy,onChange:(enabled:boolean)=>void run(()=>api.mutate('models/search',{enabled,expectedRevision:search.revision}))}:undefined} face={modelFace()} catalog={modelCatalog} adding={addingModel} onCloseAdd={()=>setAddingModel(false)} onEnabled={(input:any)=>api.mutate('models/enabled',input)} onModelEnabled={(input:any)=>api.mutate('models/selection',input)} onRefresh={load}/>:<p role="status" className="beellix-console__empty">{busy?'读取中…':'模型目录暂不可用，请刷新。'}</p>)}
      {tab==='models'&&section==='plugin-models'&&<PluginModelConfiguration onCatalogChange={setPluginUsesCatalog} onConfigure={openPanel} state={pluginModels} busy={busy} onSave={(input:any)=>void run(()=>api.mutate('models/plugins',input))} renderModels={(purpose:any)=>modelCatalog&&modelFace?<ModelsPage key={purpose.key} face={modelFace()} modelSelection={purpose} catalog={{...modelCatalog,items:modelCatalog.items.map((item:any)=>({...item,models:item.models.filter((model:any)=>!model.inputModalities||purpose.modalities.every((kind:string)=>model.inputModalities.includes(kind)))})).filter((item:any)=>item.models.length||!item.modelsKnown)}} adding={addingModel} onCloseAdd={()=>setAddingModel(false)} onEnabled={(input:any)=>api.mutate('models/enabled',input)} onModelEnabled={(input:any)=>api.mutate('models/selection',input)} onRefresh={load}/>:<p role="status" className="beellix-console__empty">{busy?'读取中…':'模型目录暂不可用，请刷新。'}</p>}/>}
      {tab==='models'&&section==='account'&&<OfficialModelAccounts state={officialModels}/>}
      {tab==='scenarios'&&<ScenarioDirectory items={scenes} allItems={inventory?.scenes??[]} allCount={inventory?.scenes?.length??0} busy={busy} filters={sceneFilters} onManage={manage} onToggle={(row:any,enabled:boolean)=>void run(()=>api.mutate('scene/enabled',{packageName:row.packageName,enabled,expectedVersion:row.version,expectedEnabled:row.enabled}))}/>}
      {tab==='resources'&&<>{state.addonError&&<p role="alert">{state.addonError}</p>}<ResourceDirectory items={state.capabilities??[]} busy={busy} selected={resourceSection} renderCapability={renderCapability} registerActions={registerActions} onEnable={(row:any)=>void run(()=>api.mutate('addons/enabled',{id:row.id,enabled:true,expectedVersion:row.version,expectedEnabled:false}))} openPanel={openPanel}/></>}
    </>}
    {installing&&<ApplicationManager api={api} openPanel={openPanel} close={()=>{setInstalling(undefined);void load()}}/>}
    {tab==='resources'&&resourceInstalling&&<ResourceInstaller key={resourceInstalling.id} api={api} target={resourceInstalling} offered={resourceInstalling.offered} onClose={()=>setResourceInstalling(undefined)} onInstalled={async(result:any,id:string)=>{await load();setResourceSection(id==='data-platform'?'data':id);setResourceInstalling(undefined);setNotice(result.application==='restart-required'?'安装已保存，请重启客户端生效。':'')}}/>}
  </div></div>
}
