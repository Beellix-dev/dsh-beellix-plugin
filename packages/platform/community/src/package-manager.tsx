import {OperationFeedback} from "../../../../dev/shared/console/operation-feedback.mjs"
/** 自有插件目录、详情与安装操作；所有写入沿既有中台契约。 */
import React,{useEffect,useRef,useState} from 'react'
import {Modal,Switch,IconDataOutline16,IconRefreshOutline16,ScenarioIcon,scenarioIconKind} from '@beellix-ai/ui-components'
import {PLUGIN_DISCOVERY_URL} from './discovery.mjs'
import {SourceInstaller} from './source-installer.tsx'
import form from "../../../../dev/shared/console/packages/ui/admin/src/models/client/ModelsSection.module.css"
import {SectionTabs,DetailHeading,DetailSection,ObjectFacts,applicationStates,EmptyState} from './console-structure.tsx'
import {IconSearchOutlineRegular} from '@deepseek-ai/dsh-client-ui-primitives'
import {pluginDirectory,pluginCategory,pluginIntroduction} from './plugin-classification.mjs'
const tabs:Record<string,string>={discover:'发现',available:'可安装',installed:'已安装',sources:'来源'}
const isInstalled=(row:any)=>['enabled','disabled','pending','failed'].includes(row.state)
export function ApplicationManager({api,close,openPanel,embedded=false}:any){
 const [state,setState]=useState<any>(),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[query,setQuery]=useState(''),[tab,setTab]=useState('installed'),[removing,setRemoving]=useState<any>(),[selected,setSelected]=useState('')
 const generation=useRef(0),upload=useRef<HTMLInputElement>(null)
 const [sourceOpen,setSourceOpen]=useState(false)
 const [category,setCategory]=useState('all')
 const load=async()=>{const ticket=++generation.current;const next=await api.read('state');if(ticket===generation.current)setState(next);return next}
 useEffect(()=>{void load().catch(e=>setError(e.message));return()=>{generation.current++}},[])
 const refresh=async()=>{if(busy)return;setBusy(true);setError('');try{await load()}catch(e:any){setError(e.message)}finally{setBusy(false)}}
 const run=async(path:string,input:any)=>{if(busy)return;setBusy(true);setError('');setNotice('');try{const result=await api.mutate(path,input);if(result.application==='failed')throw Error('操作未完成，请刷新后重试。');await load();setRemoving(undefined);if(path==='addons/remove')setSelected('');if(result.application==='restart-required')setNotice('更改已保存，请重启客户端生效。');else setNotice(path==='addons/remove'?'插件已卸载，业务数据和安装包已保留。':'已完成');if(result.items?.some((item:any)=>item.application==='failed'))setError('部分应用接入失败，请刷新后重试。')}catch(e:any){setError(e.message)}finally{setBusy(false)}}
 const importFile=async(file?:File)=>{if(!file||busy)return;setError('');setNotice('');if(!file.name.endsWith('.tgz')||file.size>64*1024*1024){setError('请选择不超过64 MiB的 .tgz 安装包。');return}setBusy(true);try{const value=await api.importArchive(file);await load();setQuery(value.name);setCategory('all');setTab('available');setSelected('');setNotice('安装包已导入，确认版本后安装。')}catch(e:any){setError(e.message)}finally{setBusy(false);if(upload.current)upload.current.value=''}}
 const checkUpdates=async()=>{
  if(busy)return
  setBusy(true);setError('');setNotice('')
  try{const current=await load();if(current.updates?.status==='not-launched'){setNotice('更新服务尚未上线');return}await api.mutate('updates/check',{});const next=await load(),count=(next.applications??[]).filter((row:any)=>row.onlineUpdate?.state==='available'||row.onlineUpdate?.state==='manual').length;setNotice(count?`发现 ${count} 个可更新插件`:'检查完成，未发现可安装的新版')}
  catch(e:any){setError(e.message);try{await load()}catch{}}
  finally{setBusy(false)}
 }
 const all=state?.applications??state?.capabilities??[],item=all.find((row:any)=>row.id===selected)
 const directory=pluginDirectory(all,{query,tab,category}),rows=directory.rows
 const updateLabels:Record<string,string>={current:'已是最新',manual:'导入更新包',stale:'重新检查','not-launched':'检查更新','not-published':'未提供更新',conflict:'同版包不一致',incompatible:'中台版本不兼容','migration-required':'需要数据迁移',unverified:'需核对安装包'}
 const onlineAction=(row:any,detail:boolean)=>{
  const update=row.onlineUpdate;if(!update||!isInstalled(row))return null
  if(update.state==='available')return <button className={form.secondaryButton} disabled={busy||row.state==='pending'} aria-label={detail?undefined:'更新 '+row.title} onClick={()=>detail?void run('updates/install',update.confirmation):setSelected(row.id)}>{detail?'确认更新至 v'+update.version:'更新'}</button>
  if(update.state==='manual')return <button className={form.secondaryButton} disabled={busy||!api.importArchive} onClick={()=>upload.current?.click()}>导入更新包</button>
  const canCheck=['stale','not-launched'].includes(update.state)
  return <button className={form.secondaryButton} disabled={busy||!canCheck} aria-label={canCheck?'检查 '+row.title+' 更新':undefined} onClick={()=>void checkUpdates()}>{updateLabels[update.state]??'检查更新'}</button>
 }
 const actions=(row:any,detail=false)=><>
  {detail&&['enabled','disabled'].includes(row.state)&&<span className="beellix-object-status">启用插件</span>}
  {['enabled','disabled'].includes(row.state)&&<Switch label={'启用 '+row.title} checked={row.enabled??row.state==='enabled'} disabled={busy} onChange={enabled=>{void run('addons/enabled',{id:row.id,enabled,expectedVersion:row.version,expectedEnabled:row.enabled??row.state==='enabled'})}}/>}
  {(row.configPanel||row.panel)&&row.state==='enabled'&&openPanel&&<button className={form.secondaryButton} disabled={busy||row.connection==='waiting'} onClick={()=>openPanel(row.configPanel??row.panel,{capabilityId:row.id,title:row.title,view:row.configPanel?'settings':'main'})}>配置</button>}
  {row.onlineUpdate?.state==='available'?onlineAction(row,detail):row.updateVersion?<button className={form.secondaryButton} disabled={busy} onClick={()=>void run('addons/install',{id:row.id,digest:row.digest,expectedVersion:row.version})}>{row.updateKind==='rebuild'?'更新安装包':'升级至 '+row.updateVersion}</button>:row.state==='available'?<button className={form.primaryButton} disabled={busy} onClick={()=>void run('addons/install',{id:row.id,digest:row.digest})}>安装</button>:row.state==='pending'?<button className={form.secondaryButton} disabled={busy} onClick={()=>void run('addons/reconnect',{})}>重新接入</button>:onlineAction(row,detail)}
 </>
 const goBack=()=>{setSelected('');setRemoving(undefined)}
 const content=<div className="beellix-market">
  <header className="beellix-page-toolbar"><SectionTabs buttons links={{discover:PLUGIN_DISCOVERY_URL}} label="插件市场页面" items={Object.entries(tabs)} active={tab} onChange={id=>{setTab(id);setCategory('all');goBack()}}/><div className="beellix-bootstrap__actions beellix-market__actions">{!sourceOpen&&<button className={form.secondaryButton} disabled={busy} onClick={()=>setSourceOpen(true)}>npm / pnpm 安装</button>}{api.importArchive&&<><input ref={upload} type="file" accept=".tgz" hidden aria-label="选择 Beelli X 安装包" onChange={event=>void importFile(event.target.files?.[0])}/><button className={form.secondaryButton} disabled={busy} onClick={()=>upload.current?.click()}>导入安装包</button></>}<button className={form.secondaryButton} disabled={busy} onClick={()=>void(state?.updates?checkUpdates():refresh())}><IconRefreshOutline16/>{busy&&state?.updates?'处理中…':state?.updates?'检查更新':'刷新'}</button></div></header>
  {sourceOpen&&<SourceInstaller api={api} close={()=>setSourceOpen(false)} onInstalled={async(result:any)=>{await load();setSourceOpen(false);setTab('installed');setQuery('');goBack();setNotice(result.application==='restart-required'?'安装已保存，请重启客户端生效。':'已安装')}}/>}
  <OperationFeedback error={error||state?.addonError} notice={notice} onErrorDone={()=>setError('')} onNoticeDone={()=>setNotice('')}/>
  {tab==='sources'?<><DetailSection title="Beelli X 本地交付"><p className="beellix-market__description">导入已交付的 .tgz 安装包。</p><details className="beellix-package-technical"><summary>目录位置</summary><ObjectFacts items={[[ '清单','config/install-catalog.json'],['安装包','environment/packages']]}/></details></DetailSection><DetailSection title="npm / pnpm"><ObjectFacts items={[[ '包源','registry.npmjs.org'],['安装目录','Beellix/environment']]}/></DetailSection></>:selected?item?<>
   <DetailHeading parent={tabs[tab]} title={item.title??item.name} onBack={goBack} status={applicationStates[item.state]}/>
   <DetailSection kind="plugins" title="插件信息"><ObjectFacts items={[[ '安装包',item.name],['版本',item.version?'v'+item.version:'未提供']]}/>{pluginIntroduction(item).summary&&<p className="beellix-market__description">{pluginIntroduction(item).summary}</p>}{pluginIntroduction(item).features.length>0&&<ul className="beellix-plugin-features">{pluginIntroduction(item).features.map(text=><li key={text}>{text}</li>)}</ul>}</DetailSection>
   <DetailSection kind="settings" title="安装与版本" actions={actions(item,true)}>{item.onlineUpdate?.version&&item.onlineUpdate.version!==item.version&&<p className="beellix-market__description">{item.version} → {item.onlineUpdate.version}</p>}{item.onlineUpdate?.notes&&<p className="beellix-market__description">{item.onlineUpdate.notes}</p>}{item.updateVersion&&!item.onlineUpdate?.version&&<p className="beellix-market__description">{item.updateKind==='rebuild'?'已导入新的安装包':'可升级至 v'+item.updateVersion}</p>}{item.packageError&&<p role="alert">{item.packageError}</p>}{item.state==='unavailable'&&<p className="beellix-market__description">安装包待提供，可从上方导入。</p>}</DetailSection>
   {isInstalled(item)&&<DetailSection title="卸载插件" actions={!removing&&<button className={form.secondaryButton} disabled={busy} onClick={()=>setRemoving(item)}>卸载</button>}><p className="beellix-market__description">保留业务数据和安装包。</p>{removing?.id===item.id&&<div className="beellix-market__confirmation" role="group" aria-label={'卸载 '+item.title}><p>卸载 {item.title}？</p><div className="beellix-market__actions"><button className={form.secondaryButton} disabled={busy} onClick={()=>setRemoving(undefined)}>取消</button><button className={form.primaryButton} disabled={busy} onClick={()=>void run('addons/remove',{id:item.id,expectedVersion:item.version,expectedEnabled:item.enabled??item.state==='enabled'})}>确认卸载</button></div></div>}</DetailSection>}
  </>:<><DetailHeading parent={tabs[tab]} title="插件已不可用" onBack={goBack}/><EmptyState title="请返回列表刷新。"/></>:<>
   <div className="beellix-market__search"><label><IconSearchOutlineRegular size={20}/><span className="beellix-market__sr">搜索插件</span><input className="beellix-market__search-input" type="search" aria-label="搜索插件" placeholder="按插件、作者或能力搜索" value={query} onChange={event=>{setQuery(event.target.value);setCategory('all')}}/></label><span aria-live="polite">{state?`${rows.length.toLocaleString()} 个插件`:'读取中…'}</span></div>
   {state&&<nav className="beellix-market__categories" aria-label="插件分类">{[{id:'all',label:'全部',count:directory.total},...directory.categories].map(item=><button className="beellix-market__category-filter" type="button" key={item.id} aria-label={`${item.label} ${item.count}`} aria-pressed={category===item.id} onClick={()=>setCategory(item.id)}><span>{item.label}</span><span className="beellix-market__count" aria-hidden="true">{item.count.toLocaleString()}</span></button>)}</nav>}
   {!state?<p role="status">读取中…</p>:<div className="beellix-market__grid beellix-card-grid" data-view={tab}>{rows.map((row:any)=><article key={row.id} className="beellix-market__card">
    <div className="beellix-market__identity"><span className="beellix-market__icon">{row.category==='scenarios'?<ScenarioIcon kind={scenarioIconKind(row.name)} size={22}/>:<IconDataOutline16/>}</span><div><h3>{row.title??row.name}</h3><p>{row.name}</p></div><span className="beellix-market__version">{row.version?'v'+row.version:''}</span></div>
    {pluginIntroduction(row).summary&&<p className="beellix-market__description">{pluginIntroduction(row).summary}</p>}{row.packageError&&<p role="status" className="beellix-market__description">{row.packageError}</p>}
    <footer><div className="beellix-market__meta"><span className="beellix-market__category">{pluginCategory(row)[1]}</span><span data-state={row.state}>{applicationStates[row.state]??'状态未提供'}</span></div><div className="beellix-market__actions">{actions(row)}<button className={form.secondaryButton} aria-label={'查看插件 '+(row.title??row.name)} onClick={()=>setSelected(row.id)}>详情</button></div></footer>
   </article>)}</div>}
   {state&&!rows.length&&!state.addonError&&<p role="status" className="beellix-market__empty">{tab==='installed'?'暂无已安装插件':tab==='available'?'暂无可安装插件':'暂无匹配插件'}</p>}
  </>}
 </div>
 return embedded?<div className="beellix-bootstrap"><div className="beellix-bootstrap__page beellix-console" role="region" aria-label="插件管理">{content}</div></div>:<Modal open title="Beelli X 插件市场" closeLabel="关闭" className="beellix-console__manager" contentClassName="beellix-market-content" onClose={()=>{if(!busy)close()}}>{content}</Modal>
}
