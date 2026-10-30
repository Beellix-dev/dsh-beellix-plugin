/** 模型目录的三级页面；链接携带稳定身份，刷新和浏览器返回均可恢复页面。 */
import { useState, type ReactNode } from 'react'
import { Modal, Switch } from '@beellix-ai/ui-components'
import navigationStyles from '../../client/NavigationLink.module.css'
import type { ProviderRow } from './store.ts'
import type { en } from './locales.ts'
import css from './VendorCatalog.module.css'
import formStyles from './ModelsSection.module.css'
import { CatalogModelCard, Mark, Modalities, capacity } from './CatalogModelCard.tsx'
import { qwenSpeechModels, findSpeechModel } from './speech-models.ts'
import type { PropsRuntime } from '@beellix-ai/ui-platform/slots'

export interface CatalogLocation { vendor?: string; connection?: string; model?: string; tab?: string }
type Translate = (key: keyof typeof en) => string
type Vendor = NonNullable<ProviderRow['entry']['vendor']>
type Model = Vendor['models'][number]
interface Props {
  embedded?: boolean
  /** 原生宿主只暴露实际支持的连接管理；不为只读模型定义伪造启停。 */
  nativeControls?: Readonly<Record<string, {canToggle: boolean; canModelToggle?: boolean; modelsKnown: boolean; reason?: string}>>
  onVendorChange?: (rows: readonly ProviderRow[],enabled: boolean) => void
  rows: readonly ProviderRow[]
  location: CatalogLocation
  t: Translate
  readOnly: boolean
  saved: boolean
  modelBusy: boolean
  modelError?: string | undefined
  onModelChange: (row: ProviderRow, model: string, enabled: boolean) => void
  editor: (row: ProviderRow, close?: () => void) => ReactNode
  onConnectionChange?: (row: ProviderRow, enabled: boolean) => void
  renderSpeechControls?: ((model: { id: string; name: string }, credentialRef: string) => ReactNode) | undefined
  webSearch?: PropsRuntime<'settings.models.page'>['webSearch']
  renderModelControls?: (row:ProviderRow,model:Model)=>ReactNode
}

function href(location: CatalogLocation = {}): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(location)) if (value) params.set(key, value)
  return '/admin/models' + (params.size ? `?${params}` : '')
}
function Badge({ active, t }: { active: boolean; t: Translate }) {
  return <span className={css['status']} data-active={active}><i aria-hidden="true" />{t(active ? 'enabledConnections' : 'disabledConnections')}</span>
}
/** 主模型和插件专用连接共用卡片骨架、间距及动作位置。 */
export function CatalogVendorCard({title,identity,actions,summary,status,version,details,label}:{title:string;identity:ReactNode;actions:ReactNode;summary:ReactNode;status:ReactNode;version?:string|undefined;details:ReactNode;label?:string|undefined}){
 return <article className={css['vendorCard']} data-model-card="vendor-summary" aria-label={label}>
  <div className={css['cardTop']}>{identity}<h3>{title}</h3>{actions}</div>
  <p className={css['cardStats']}>{summary}</p>
  <footer>{status}{version&&<span className={css['version']}>v{version}</span>}{details}</footer>
 </article>
}
function connectionLabel(row: ProviderRow, t: Translate): string {
  return row.entry.provider === 'qwen-token-plan' ? t('qwenSubscription') : row.entry.provider === 'qwen-token-plan-cn' ? t('qwenSubscriptionCn') : row.entry.provider === 'qwen-token-plan-individual' ? t('qwenSubscriptionIndividual') : row.entry.displayName
}
function credential(row: ProviderRow, t: Translate): string {
  return t(!row.entry.vendor!.credentialRef ? 'nativeAuthentication' : row.credential === undefined ? 'credentialUnknown' : row.credential.configured ? 'credentialConfigured' : 'credentialMissing')
}
function Pagination({ page, total, onChange, t }: { page: number; total: number; onChange: (page: number) => void; t: Translate }) {
  if (total <= 1) return null
  return <nav className={css['pagination']} aria-label={t('catalogPagination')}><button disabled={page === 0} onClick={() => onChange(page - 1)}>{t('catalogPrevious')}</button><span>{page + 1} / {total}</span><button disabled={page + 1 >= total} onClick={() => onChange(page + 1)}>{t('catalogNext')}</button></nav>
}

export function VendorCatalog({ rows, location, t, readOnly, saved, editor, modelBusy, modelError, onModelChange, onConnectionChange, onVendorChange, renderSpeechControls, webSearch, nativeControls, embedded, renderModelControls }: Props) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(0)
  const [editing, setEditing] = useState<string>()
  const [dismissed, setDismissed] = useState(false)
  const groups = new Map<string, ProviderRow[]>()
  for (const row of rows) if (row.entry.vendor) groups.set(row.entry.vendor.id, [...groups.get(row.entry.vendor.id) ?? [], row])
  const allGroups = [...groups.values()].sort((a, b) => (nativeControls ? Number(b.some(row=>row.credential?.configured))-Number(a.some(row=>row.credential?.configured)) : 0) || Number(b.some(row => row.entry.active)) - Number(a.some(row => row.entry.active)) || a[0]!.entry.vendor!.name.localeCompare(b[0]!.entry.vendor!.name))
  const group = location.vendor ? groups.get(location.vendor) : undefined
  const selectedRow = group && (location.connection ? group.find(row => row.entry.provider === location.connection) : group.find(row => row.entry.active) ?? group[0])
  const vendor = selectedRow?.entry.vendor
  const selectedModel = location.model ? vendor?.models.find(model => model.id === location.model) : undefined
  const selectedSpeechModel = vendor?.id === 'qwen' ? findSpeechModel(location.model) : undefined
  const detailModel = selectedSpeechModel ?? selectedModel
  const needle = query.trim().toLocaleLowerCase()
  const base: CatalogLocation = vendor && selectedRow ? { vendor: vendor.id, connection: selectedRow.entry.provider } : {}
  const isConfiguration = location.tab === 'connection' && !location.model
  const isSpeech = vendor?.id === 'qwen' && location.tab === 'speech'
  const speechConnection=(isSpeech||selectedSpeechModel)?rows.find(row=>row.entry.vendor?.id==='qwen'&&row.entry.vendor.credentialRef==='QWEN_API_KEY'&&!row.entry.provider.startsWith('qwen-token-plan')):undefined
  const editingRow=rows.find(row=>row.entry.provider===editing)??(!dismissed&&isConfiguration?selectedRow:undefined)
  const closeEditor=()=>{setEditing(undefined);setDismissed(true)}
  const connectionActions=(row:ProviderRow,showToggle=true,family?:ProviderRow[])=><div className={css['headerActions']} title={nativeControls?.[row.entry.provider]?.reason}><button type="button" aria-label={`${t('configureConnection')} ${row.entry.vendor!.name}`} onClick={()=>setEditing(row.entry.provider)}>{t('configureConnection')}</button>{showToggle&&<Switch checked={family?family.some(item=>item.entry.active):row.entry.active} label={`${t('enableConnection')} ${family?row.entry.vendor!.name:connectionLabel(row,t)}`} disabled={readOnly||modelBusy||!onConnectionChange||(family?family.some(item=>item.entry.active&&nativeControls?.[item.entry.provider]?.canToggle===false)||!family.some(item=>nativeControls?.[item.entry.provider]?.canToggle!==false):nativeControls?.[row.entry.provider]?.canToggle===false)} onChange={enabled=>family&&onVendorChange?onVendorChange(family,enabled):onConnectionChange?.(row,enabled)}/>}</div>
  const modelCount = (items: ProviderRow[]) => new Set(items.flatMap(row => [...row.entry.vendor!.models, ...!nativeControls && row.entry.vendor!.id === 'qwen' ? qwenSpeechModels : []].map(model => model.id))).size
  const filteredGroups = allGroups.filter(items => {
    const active = items.some(row => row.entry.active)
    return (filter === 'all' || (filter === 'enabled') === active) && items.some(row => [row.entry.vendor!.name, row.entry.displayName, ...(row.entry.vendor!.id === 'deepseek' && webSearch ? [t('webSearch')] : []), ...(row.entry.vendor!.id === 'qwen' ? [t('catalogSpeech'), ...qwenSpeechModels.flatMap(model => [model.name, model.id])] : []), ...row.entry.vendor!.models.flatMap(model => [model.name, model.id])].some(label => label.toLocaleLowerCase().includes(needle)))
  })
  const models = isSpeech ? qwenSpeechModels : [...vendor?.models ?? [], ...!nativeControls && vendor?.id === 'qwen' ? qwenSpeechModels : []]
  const filteredModels = models.filter(model => `${model.name} ${model.id}`.toLocaleLowerCase().includes(needle))
  const showSearch = vendor?.id === 'deepseek' && webSearch && `${t('webSearch')} DeepSeek`.toLocaleLowerCase().includes(needle)
  const shownPage = Math.min(page, Math.max(0, Math.ceil(filteredModels.length / 24) - 1))
  const modelSwitch = (model: Model) => renderModelControls?renderModelControls(selectedRow!,model):<div className={css['modelSwitch']} title={nativeControls&&nativeControls[selectedRow!.entry.provider]?.canModelToggle!==true?'此连接的模型清单由 DSH 原生认证维护。':undefined}><span>{t(model.enabled === false ? 'modelBlocked' : !selectedRow!.entry.active ? 'connectionDisabled' : selectedRow!.credential?.configured === false ? 'credentialMissing' : 'modelAllowed')}</span><Switch checked={model.enabled!==false} label={`${t('enableModel')} ${model.name}`} disabled={readOnly||modelBusy||Boolean(nativeControls&&nativeControls[selectedRow!.entry.provider]?.canModelToggle!==true)} onChange={enabled=>onModelChange(selectedRow!,model.id,enabled)}/></div>

  if (location.vendor && !vendor || location.model && !detailModel || location.connection && !location.vendor) return <div className={css['catalog']}><a className={[css['back'], navigationStyles.link].join(" ")} href={href()}>{t('catalogAllVendors')}</a><div role="alert" className={css['empty']}><h2>{t('catalogNotFound')}</h2><p>{t('catalogNotFoundHelp')}</p></div></div>

  return <div className={css['catalog']} data-model-page={detailModel ? 'model' : vendor ? 'vendor' : 'catalog'}>
    {vendor && <nav className={css['breadcrumbs']} aria-label={t('catalogBreadcrumbs')}><a href={href()}>{t('catalogAllVendors')}</a><span aria-hidden="true">/</span>{detailModel ? <><a href={href(base)}>{vendor.name}</a><span aria-hidden="true">/</span><span aria-current="page">{detailModel.name}</span></> : <span aria-current="page">{vendor.name}</span>}</nav>}
    <header aria-hidden={embedded&&!vendor?true:undefined} className={vendor ? css['heading'] : css['visuallyHidden']}>
      <div className={css['headingIdentity']}>{vendor && <Mark id={vendor.id} />}<h1>{detailModel?.name ?? vendor?.name ?? t('title')}</h1></div>
      {selectedRow && <div className={css['headerActions']}>{selectedModel?modelSwitch(selectedModel):null}{selectedSpeechModel?renderSpeechControls?.(selectedSpeechModel,'QWEN_API_KEY'):null}{connectionActions(speechConnection??selectedRow,!(isSpeech||selectedSpeechModel))}</div>}
    </header>
    {readOnly && <p className={css['notice']}>{t('readOnly')}</p>}
    {saved && <p role="status" className={css['success']}>{t('vendorSaved')}</p>}
    {modelError && <p role="alert" className={css['notice']}>{modelError}</p>}
    {!vendor && <>
      <div className={css['toolbar']}><label><span>{t('vendorSearch')}</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} /></label><label className={css['statusFilter']}><span>{t('vendorFilter')}</span><select aria-label={t('vendorFilter')} className={formStyles['selectInput']} value={filter} onChange={event => setFilter(event.target.value)}>{(['all', 'enabled', 'disabled'] as const).map(value => <option key={value} value={value}>{t(value === 'all' ? 'catalogAll' : value === 'enabled' ? 'enabledConnections' : 'disabledConnections')}</option>)}</select></label></div>
      <p className={css['resultCount']}>{filteredGroups.length} / {groups.size}</p>
      <div className={css['grid']}>{filteredGroups.map(items => {
        const item = items[0]!.entry.vendor!
        const active = items.some(row => row.entry.active)
        return <CatalogVendorCard key={item.id} title={item.name} identity={<Mark id={item.id}/>} actions={connectionActions(items.find(row=>row.credential?.configured)??items.find(row=>row.entry.active)??items[0]!,true,items)}
          summary={<>{nativeControls && !items.some(row=>nativeControls[row.entry.provider]?.modelsKnown) ? t('catalogNoModels') : t('modelCount').replace('{count}',String(modelCount(items)))}<span aria-hidden="true">·</span>{items.length} {t('catalogConnections')}</>}
          status={<Badge active={active} t={t}/>} version={item.version} details={<a className={navigationStyles.link} href={href({vendor:item.id})} aria-label={`${t('catalogViewVendor')} ${item.name}`}>{t('catalogDetails')}</a>}/>
      })}</div>
      {filteredGroups.length === 0 && <div className={css['empty']}><h2>{t('vendorNoResults')}</h2><p>{t('catalogSearchHelp')}</p><button onClick={() => {setQuery('');setFilter('all')}}>{t('catalogReset')}</button></div>}
    </>}
    {vendor && selectedRow && <>
      {selectedRow.entry.error && <p role="alert" className={css['notice']}>{t('vendorUpdateRejected')}</p>}
      {!detailModel && <>
        {!isSpeech && group!.length > 1 && <div className={css['connectionPicker']}><span>{t('catalogConnectionRoute')}</span>{group!.map(row => <a key={row.entry.provider} href={href({vendor:vendor.id,connection:row.entry.provider})} aria-current={row === selectedRow ? 'page' : undefined}>{connectionLabel(row, t)}</a>)}</div>}
        <>
          <div className={css['toolbar']}><input type="search" aria-label={t('modelSearch')} placeholder={t('modelSearch')} value={query} onChange={event => {setQuery(event.target.value);setPage(0)}} /><span className={css['muted']}>{t('modelCount').replace('{count}', String(filteredModels.length))}</span></div>
          <div className={css['grid']}>{filteredModels.slice(shownPage * 24, (shownPage + 1) * 24).map(model => {
            const speech = findSpeechModel(model.id) !== undefined && vendor.id === 'qwen'
            return <CatalogModelCard key={model.id} model={model} vendor={vendor.id} speech={speech} t={t} href={href({...base,model:model.id})}>{speech ? renderSpeechControls?.(model, 'QWEN_API_KEY') : modelSwitch(model as Model)}</CatalogModelCard>
          })}{showSearch && <article className={css['modelCard']} aria-label={t('webSearch')}>
            <div className={css['cardTop']}><Mark id="deepseek" /><h3>{t('webSearch')}</h3><div className={css['headerActions']}><Switch checked={webSearch.enabled} label={t('enableWebSearch')} disabled={readOnly || modelBusy || !webSearch.writable || webSearch.busy} onChange={webSearch.onChange} /></div></div>
            <div className={css['modelCapacity']}><span>{t('webSearchCredential')}</span></div>
            <footer><span className={css['muted']}>{credential(selectedRow,t)}</span><Badge active={webSearch.enabled && selectedRow.entry.active && selectedRow.credential?.configured === true} t={t}/></footer>
            {webSearch.error && <p role="alert" className={css['notice']}>{webSearch.error}</p>}
          </article>}</div>
          {filteredModels.length === 0 && !showSearch && <div className={css['empty']}><h2>{t('vendorNoResults')}</h2><p>{t('catalogSearchHelp')}</p></div>}
          <Pagination page={shownPage} total={Math.ceil(filteredModels.length / 24)} onChange={setPage} t={t} />
        </>
      </>}
      {selectedModel && <>
        <div className={css['metrics']}><div><span>{t('contextWindow')}</span><strong>{capacity(selectedModel.contextWindow,t)}</strong><small>tokens</small></div><div><span>{t('maxTokens')}</span><strong>{capacity(selectedModel.maxTokens,t)}</strong><small>tokens</small></div><div><span>{t('catalogInput')}</span><Modalities model={selectedModel} t={t} /></div></div>
        <div className={css['detailGrid']}><section className={css['panel']}><h2>{t('catalogModelInformation')}</h2><dl className={css['facts']}><div><dt>{t('modelName')}</dt><dd>{selectedModel.name}</dd></div><div><dt>{t('modelId')}</dt><dd><code>{selectedModel.id}</code></dd></div><div><dt>{t('catalogVendor')}</dt><dd>{vendor.name}</dd></div><div><dt>{t('catalogConnectionRoute')}</dt><dd>{selectedRow.entry.displayName}</dd></div><div><dt>{t('packageVersion')}</dt><dd>{vendor.version}</dd></div></dl></section><aside className={css['sidePanel']}><h2>{t('catalogAccess')}</h2><Badge active={selectedRow.entry.active} t={t} /><p>{credential(selectedRow,t)}</p><a className={navigationStyles.link} href={href({...base,tab:'connection'})}>{t('catalogConnectionSettings')}</a></aside></div>
      </>}
      {selectedSpeechModel && <>
        <div className={css['metrics']}><div><span>{t('catalogInput')}</span><Modalities model={selectedSpeechModel} t={t} /></div><div><span>{t('catalogOutput')}</span><strong>{t('catalogText')}</strong></div><div><span>{t('catalogMode')}</span><strong>{t('catalogSpeech')}</strong></div></div>
        <section className={css['panel']}><h2>{t('catalogModelInformation')}</h2><dl className={css['facts']}><div><dt>{t('modelName')}</dt><dd>{selectedSpeechModel.name}</dd></div><div><dt>{t('modelId')}</dt><dd><code>{selectedSpeechModel.id}</code></dd></div><div><dt>{t('catalogVendor')}</dt><dd>{vendor.name}</dd></div></dl></section>
      </>}
    </>}
    <Modal className={formStyles['vendorDialog']!} open={editingRow!==undefined} title={`${editingRow?.entry.vendor?.name??''} · ${t('catalogConnectionSettings')}`} closeLabel={t('close')} onClose={closeEditor}>{editingRow&&<><p className={css['muted']}>{credential(editingRow,t)}</p>{editor(editingRow,closeEditor)}</>}</Modal>
  </div>
}
