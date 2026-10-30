/** 应用目录分类是展示维度，不改变 DSH 资源类型、安装归属或执行权限。 */
import {rowCatalogCategory} from "../../../../dev/shared/runtime/plugin-categories.mjs"
/** 已交付版本的使用说明集中维护，不修改业务包或旧安装登记。 */
const introductions={
 '@beellix-ai/database':{summary:'为各场景独立保存业务数据，支持自动备份与恢复。',features:['场景与数据库独立存储','本机及第二份备份','恢复到新副本，保留原数据']},
 '@beellix-ai/smart-quotation':{summary:'整理工程清单、套用报价模板、核算费用并导出报价单。',features:['工程清单与项目分组','报价模板与费用参数','报价预览与文件导出']},
 '@beellix-ai/dsh-beellix-plugin':{summary:'连接 Beelli X 中台，统一管理插件、模型与场景工作区。',features:['工作区与场景切换','插件安装与管理','模型配置与归档对话']}
}
export function pluginIntroduction(row){const value=introductions[row.name];return value?{summary:value.summary,features:[...value.features]}:{summary:typeof row.description==='string'?row.description.trim().slice(0,500):'',features:[]}}
export function pluginCategory(row){
 const {id,label}=rowCatalogCategory(row);return[id,label]
}
export function pluginDirectory(rows,{query='',tab='discover',category='all'}={}){
 const installed=row=>['enabled','disabled','pending','failed'].includes(row.state)
 const scope=rows.filter(row=>tab==='installed'?installed(row):tab==='available'?row.state==='available'||Boolean(row.updateVersion):true)
 const needle=query.trim().toLocaleLowerCase()
 const matched=scope.filter(row=>[row.title,row.name,pluginIntroduction(row).summary,...pluginIntroduction(row).features,typeof row.author==='string'?row.author:row.author?.name,pluginCategory(row)[1]].filter(Boolean).join(' ').toLocaleLowerCase().includes(needle))
 const counts=new Map()
 for(const row of matched){const [id,label]=pluginCategory(row),old=counts.get(id);counts.set(id,{id,label,count:(old?.count??0)+1})}
 return{total:matched.length,categories:[...counts.values()],rows:matched.filter(row=>category==='all'||pluginCategory(row)[0]===category)}
}
