/** 包的目录分类与运行资源类型分开；未预设的新包类可由清单声明。 */
const labels={scenarios:'场景包',tools:'工具包',capabilities:'能力包',models:'模型包',skills:'技能包',ui:'界面扩展',integrations:'连接包',other:'其他插件'}
export function normalizeCatalogCategory(value){
 if(typeof value==='string'&&Object.hasOwn(labels,value))return{id:value,label:labels[value]}
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(key=>!['id','label'].includes(key)))return undefined
 if(!/^[a-z][a-z0-9-]{0,47}$/u.test(value.id??'')||value.id==='all'||typeof value.label!=='string'||!value.label.trim()||value.label.trim().length>24||/[\p{C}<>]/u.test(value.label))return undefined
 return{id:value.id,label:Object.hasOwn(labels,value.id)?labels[value.id]:value.label.trim()}
}
export function rowCatalogCategory(row){
 const explicit=normalizeCatalogCategory(row.catalogCategory);if(explicit)return explicit
 const id=row.category==='resources'?'capabilities':row.category==='mcp'?'integrations':row.category
 return normalizeCatalogCategory(id)??normalizeCatalogCategory('other')
}
export function packageCatalogCategory(manifest){
 const declared=manifest.beellix?.catalog?.category
 if(declared!==undefined){const value=normalizeCatalogCategory(declared);if(!value)throw Error('ADDON_CATALOG_CATEGORY_INVALID');return value}
 return rowCatalogCategory({category:manifest.beellixScenario?'scenarios':manifest.beellixCapability?.category})
}
