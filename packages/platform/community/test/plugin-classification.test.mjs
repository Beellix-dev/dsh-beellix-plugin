import test from 'node:test'
import assert from 'node:assert/strict'
import {packageCatalogCategory,normalizeCatalogCategory} from "../../../../dev/shared/runtime/plugin-categories.mjs"
import {pluginDirectory} from '../src/plugin-classification.mjs'
test('按包声明扩展分类，不照搬市场固定目录；分类不改变安装状态',()=>{
 const declared=packageCatalogCategory({beellix:{catalog:{category:{id:'reports',label:'报表包'}}}})
 assert.deepEqual(declared,{id:'reports',label:'报表包'})
 const rows=[{title:'报价',category:'scenarios',state:'enabled'},{title:'工具',category:'tools',state:'disabled'},{title:'数据库',category:'resources',state:'enabled'},{title:'报表',category:'tools',catalogCategory:declared,state:'available'}]
 const all=pluginDirectory(rows)
 assert.deepEqual(all.categories.map(row=>[row.label,row.count]),[['场景包',1],['工具包',1],['能力包',1],['报表包',1]])
 assert.equal(pluginDirectory(rows,{category:'reports'}).rows[0].title,'报表')
 assert.equal(pluginDirectory(rows,{tab:'installed',category:'reports'}).rows.length,0)
 assert.equal(pluginDirectory(rows,{query:'报表包'}).total,1)
 assert.equal(pluginDirectory(rows,{query:'不存在'}).categories.length,0)
 assert.equal(normalizeCatalogCategory({id:'all',label:'冒用全部'}),undefined)
 assert.throws(()=>packageCatalogCategory({beellix:{catalog:{category:{id:'reports',label:'<script>'}}}}),/ADDON_CATALOG_CATEGORY_INVALID/u)
})
