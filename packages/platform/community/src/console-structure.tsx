/** 中台共用层级与对象详情组件；只组织已有能力。 */
import React, {type ReactNode} from 'react'
import {Switch,ScenarioIcon,scenarioIconKind} from '@beellix-ai/ui-components'
import {ConsoleGlyph} from './console-icons.mjs'

export const applicationStates:Record<string,string>={unavailable:'安装包待提供',available:'未安装',enabled:'已启用',disabled:'已停用',pending:'待接入',invalid:'安装包校验失败',failed:'加载失败',installing:'安装中…'}
export {SectionTabs} from "../../../../dev/shared/console/section-tabs.tsx"
export function DetailHeading({parent,title,onBack,actions,status}:{parent:string;title:string;onBack:()=>void;actions?:ReactNode;status?:string;kind?:string}){
 return <><nav className="beellix-breadcrumbs" aria-label="当前位置"><button type="button" onClick={onBack}>{parent}</button><span aria-hidden="true">/</span><span aria-current="page">{title}</span></nav>{(status||actions)&&<header className="beellix-page-toolbar">{status&&<span className="beellix-object-status">{status}</span>}{actions&&<div className="beellix-bootstrap__actions">{actions}</div>}</header>}</>
}
export function DetailSection({title,children,actions,kind='settings'}:{title:string;children?:ReactNode;actions?:ReactNode;kind?:string}){
 return <section className="beellix-detail-section" aria-label={title}><header><div className="beellix-card-title"><ConsoleGlyph kind={kind}/><h3>{title}</h3></div>{actions&&<div className="beellix-bootstrap__actions">{actions}</div>}</header>{children}</section>
}
export function ObjectFacts({items}:{items:[string,ReactNode][]}){
 return <dl className="beellix-object-facts">{items.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value??'未提供'}</dd></div>)}</dl>
}
export function EmptyState({title,action}:{title:string;action?:ReactNode}){return <div className="beellix-collection-empty" role="status"><p>{title}</p>{action}</div>}
export function OwnedExtensionsPage({kind,applications,onManage,openPanel}:any){
 return <section aria-label={kind==='mcp'?'MCP 扩展':'工具扩展'} className="beellix-card-grid">{applications.map((row:any)=><article className="beellix-extension-card" key={row.id}><div className="beellix-card-title"><ConsoleGlyph kind={kind==='mcp'?'data':'plugins'}/><div><h3>{row.title}</h3><small>{row.version?'v'+row.version:''}</small></div></div><footer><span className="beellix-object-status">{applicationStates[row.state]}</span><div className="beellix-bootstrap__actions">{row.panel&&row.state==='enabled'&&openPanel&&<button aria-label={'配置 '+row.title} onClick={()=>openPanel(row.panel)}>配置</button>}<button onClick={()=>onManage(kind)}>管理插件</button></div></footer></article>)}</section>
}
export function ScenarioDirectory({items,allItems=items,allCount,busy,filters,onToggle,onManage}:any){
 const [selected,setSelected]=React.useState('')
 const scene=allItems.find((row:any)=>row.packageName===selected)
 if(selected&&!scene)return <><DetailHeading kind="scenarios" parent="已安装场景" title="场景暂不可用" onBack={()=>setSelected('')}/><EmptyState title="请返回列表刷新。"/></>
 // 筛选结果由父层保持；选中对象来自完整目录，详情返回不清空搜索。
 const control=(row:any)=><Switch label={'启用 '+row.title} checked={row.enabled} disabled={busy} onChange={enabled=>onToggle(row,enabled)}/>
 if(scene)return <><DetailHeading kind="scenarios" parent="已安装场景" title={scene.title} onBack={()=>setSelected('')} status={scene.enabled?'已启用':'已停用'} actions={control(scene)}/><DetailSection kind="scenarios" title="场景信息"><ObjectFacts items={[[ '安装包',scene.packageName],['版本','v'+scene.version],['运行模式','场景模式'],['执行组成','标准模式＋当前场景包']]}/></DetailSection><DetailSection kind="plugins" title="安装与版本" actions={<button onClick={()=>onManage('scenarios')}>管理安装包</button>}/></>
 return <>{filters}<section className="beellix-card-grid" aria-label="已安装场景">{items.map((row:any)=><article className="beellix-scenario-card" key={row.packageName}><div className="beellix-card-title"><ConsoleGlyph kind="scenarios"><ScenarioIcon kind={scenarioIconKind(row.packageName)} size={24}/></ConsoleGlyph><div><h2>{row.title}</h2><small>v{row.version}</small></div><div className="beellix-card-switch">{control(row)}</div></div><footer><span className="beellix-state" data-state={row.enabled?'enabled':'disabled'}>{row.enabled?'已启用':'已停用'}</span><button aria-label={'查看场景 '+row.title} onClick={()=>setSelected(row.packageName)}>详情</button></footer></article>)}</section>{!busy&&!items.length&&<EmptyState title={allCount?'没有匹配的场景':'暂无已安装场景'}/>}</>
}
export const resourceSections=(items:any[])=>[['knowledge','知识库'],['data','数据中台'],['database','数据库'],...items.some(row=>!['knowledge','data-platform','database'].includes(row.id))?[['other','其他扩展']]:[]]
export function ResourceDirectory({items,busy,selected,onEnable,renderCapability,registerActions}:any){
 const matches=(row:any,id:string)=>id==='knowledge'?row.id==='knowledge':id==='data'?row.id==='data-platform':id==='database'?row.id==='database':!['knowledge','data-platform','database'].includes(row.id)
 const rows=items.filter((row:any)=>matches(row,selected))
 const content=(row:any)=>{
  if(['unavailable','available','invalid'].includes(row.state))return <EmptyState title="未安装"/>
  if(row.state==='disabled')return <EmptyState title="已停用" action={<button disabled={busy} onClick={()=>onEnable(row)}>启用</button>}/>
  if(row.state==='failed')return <EmptyState title="加载失败"/>
  if(row.state==='pending'||row.connection==='waiting')return <EmptyState title="连接中…"/>
  if(row.state==='installing')return <EmptyState title="安装中…"/>
  if(row.state!=='enabled')return <EmptyState title="状态暂不可用"/>
  if(!row.panel)return <EmptyState title="插件未提供功能界面"/>
  return renderCapability?.(row,{embedded:true,registerActions})??<EmptyState title="功能界面加载中…"/>
 }
 return <>{!rows.length?<EmptyState title="未安装"/>:rows.map((row:any)=><section className="beellix-resource-surface" key={row.id} aria-label={row.title}>{content(row)}</section>)}</>
}
const date=(value:number)=>Number.isFinite(value)?new Date(value).toLocaleString():'未提供'
export function TaskDirectory({items,filters,busy,filtered,onOpen,more,nextOffset}:any){
 const [selected,setSelected]=React.useState('')
 const row=items.find((item:any)=>item.id===selected)
 if(row)return <><DetailHeading kind="tasks" parent="任务记录" title={row.title} onBack={()=>setSelected('')} status={row.running?'运行中':'已保存'} actions={<button className="beellix-bootstrap__primary" onClick={()=>onOpen(row.id)}>打开记录</button>}/><DetailSection kind="tasks" title="任务信息"><ObjectFacts items={[[ '状态',row.running?'运行中':'已保存'],['来源',row.origin==='subagent'?'子代理':'主任务'],['最近活动',date(row.updatedAt)],...row.parentSession?[[ '上级任务',<button onClick={()=>onOpen(row.parentSession)}>打开上级任务</button>]] as [string,ReactNode][]:[]]}/></DetailSection></>
 const byId=new Map(items.map((item:any)=>[item.id,item])),children=new Map<string,any[]>()
 for(const item of items)if(item.parentSession&&item.parentSession!==item.id&&byId.has(item.parentSession))children.set(item.parentSession,[...children.get(item.parentSession)??[],item])
 const seen=new Set<string>()
 const render=(item:any,depth=0):ReactNode=>{if(seen.has(item.id))return null;seen.add(item.id);return <div className="beellix-task-branch" key={item.id}><article className="beellix-task-row"><ConsoleGlyph kind={item.origin==='subagent'?'branch':'tasks'}/><div className="beellix-task-identity"><button className="beellix-object-name" aria-label={'查看任务 '+item.title} onClick={()=>setSelected(item.id)}>{item.title}</button><small>{item.running?'运行中':item.origin==='subagent'?'子代理':'已保存'} · {date(item.updatedAt)}</small></div><button onClick={()=>onOpen(item.id)}>打开记录</button></article>{depth<8&&children.has(item.id)&&<div role="group" aria-label={item.title+'的子任务'} className="beellix-task-children">{children.get(item.id)!.map(child=>render(child,depth+1))}</div>}</div>}
 return <>{filters}<section aria-label="任务列表" className="beellix-task-list">{items.filter((item:any)=>!item.parentSession||!byId.has(item.parentSession)||item.parentSession===item.id).map((item:any)=>render(item))}{items.filter((item:any)=>!seen.has(item.id)).map((item:any)=>render(item))}{!busy&&!items.length&&<EmptyState title={filtered?'没有匹配的任务':'暂无任务记录'}/>}</section>{nextOffset!=null&&<button disabled={busy} onClick={more}>加载更多</button>}</>
}
