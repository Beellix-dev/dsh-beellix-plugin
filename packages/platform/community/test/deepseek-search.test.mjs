import {pathToFileURL} from 'node:url'
import {join as packageJoin} from 'node:path'
const moduleUrl=name=>process.env.BEELLIX_UI_PACKAGE_DIR?pathToFileURL(packageJoin(process.env.BEELLIX_UI_PACKAGE_DIR,'lib',name)):new URL('../src/'+name,import.meta.url)
import test from 'node:test'
import assert from 'node:assert/strict'

test('DeepSeek 新版搜索和抓取复用主模型凭据引用，先配置提供方再切换，不创建第二份密钥',async()=>{
 const {DeepSeekSearch}=await import(moduleUrl('deepseek-search.mjs'))
 const views=[{ns:'llm-deepseek',revision:1,value:{apiKeyEnv:'MY_DEEPSEEK_KEY',baseURL:'https://api.deepseek.com/anthropic'}},{ns:'web',revision:2,value:{searchProvider:'deepseek-official',fetchProvider:'http'}},{ns:'web-deepseek-api',revision:3,value:{apiKeyEnv:'OLD_SEARCH_KEY',apiKey:'old-literal'}},{ns:'web-search-deepseek',revision:4,value:{apiKeyEnv:'OLD_LEGACY_KEY'}}],writes=[]
 const ctx={get:name=>name==='llm'?{listConfigurableProviders:()=>[{provider:'deepseek-official',settingsNs:'llm-deepseek',settingsPath:[]}]}:name==='settings'?{writable:true,describe:()=>structuredClone(views),mutate:async(ns,ops,expected)=>{const view=views.find(v=>v.ns===ns);assert.equal(expected,view.revision);writes.push({ns,ops});for(const op of ops)if(op.op==='set')view.value[op.path[0]]=op.value;else delete view.value[op.path[0]];view.revision++;return structuredClone(view)}}:undefined}
 const search=new DeepSeekSearch(ctx),before=await search.snapshot();assert.equal(before.enabled,false)
 await search.save({enabled:true,expectedRevision:before.revision})
 assert.equal(views[2].value.apiKeyEnv,'MY_DEEPSEEK_KEY');assert.equal(views[3].value.apiKeyEnv,'MY_DEEPSEEK_KEY');assert.equal(views[2].value.apiKey,undefined)
 assert.equal(writes.at(-1).ns,'web');assert.equal(views[1].value.searchProvider,'deepseek-search-api');assert.equal(views[1].value.fetchProvider,'deepseek-fetch-api')
 assert.equal((await search.snapshot()).enabled,true);assert.ok(!JSON.stringify(await search.snapshot()).includes('old-literal'))
 await assert.rejects(search.save({enabled:false,expectedRevision:before.revision}),/CHANGED/)
})

test('搜索不能把代理站或其他模型的密钥借给 DeepSeek 官方接口',async()=>{
 const {DeepSeekSearch}=await import(moduleUrl('deepseek-search.mjs'));let writes=0
 const ctx={get:name=>name==='llm'?{listConfigurableProviders:()=>[{provider:'deepseek-official',settingsNs:'chat',settingsPath:[]}]}:name==='settings'?{writable:true,describe:()=>[{ns:'chat',revision:1,value:{baseURL:'https://other.invalid/v1',apiKeyEnv:'PRIVATE'}},{ns:'web',revision:1,value:{}},{ns:'web-deepseek-api',revision:1,value:{}}],mutate:()=>{writes++}}:undefined}
 const service=new DeepSeekSearch(ctx);assert.equal((await service.snapshot()).writable,false);await assert.rejects(service.save({enabled:true,expectedRevision:'x'}),/SEARCH_UNAVAILABLE/);assert.equal(writes,0)
})
