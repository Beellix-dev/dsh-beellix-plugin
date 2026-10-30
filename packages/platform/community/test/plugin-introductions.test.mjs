import test from 'node:test'
import assert from 'node:assert/strict'
test('插件介绍面向用途，列表、详情和搜索使用同一文案，不把待交付能力写成已完成',async()=>{
 const {pluginIntroduction,pluginDirectory}=await import('../src/plugin-classification.mjs')
 const db={id:'database',name:'@beellix-ai/database',title:'数据库',category:'resources',state:'enabled',description:'PostgreSQL 场景隔离与备份恢复'}
 const quote={id:'smart-quotation',name:'@beellix-ai/smart-quotation',category:'scenarios',state:'enabled',description:'原生 DSH 工作台、工具和技能'}
 assert.match(pluginIntroduction(db).summary,/备份/);assert.equal(pluginIntroduction(db).features.length,3)
 assert.match(pluginIntroduction(quote).summary,/报价/);assert.ok(!pluginIntroduction(quote).summary.includes('DSH'))
 assert.equal(pluginDirectory([db,quote],{query:'第二份备份'}).rows[0].id,'database')
 assert.deepEqual(pluginIntroduction({name:'@other/tool',description:'其他开发者介绍'}),{summary:'其他开发者介绍',features:[]})
 assert.deepEqual(pluginIntroduction({name:'@beellix-ai/not-delivered'}),{summary:'',features:[]})
 assert.ok(!pluginIntroduction(db).features.some(text=>text.includes('云端')))
})
