import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,readFile,writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'

test('归档只读取原生集合，清理沿旧版逻辑留痕，不删除或改写会话和业务文件',async()=>{
 const {ArchiveManager}=await import('../src/archives.mjs'),root=await mkdtemp(join(tmpdir(),'beellix-archive-'))
 const archived=['quote','plain'],rows=[{sessionId:'quote',updatedAt:2,projections:{values:{title:'报价'}}},{sessionId:'plain',updatedAt:1},{sessionId:'active',updatedAt:3}]
 const manager=new ArchiveManager(root,{archived:()=>archived,sessions:async()=>({items:rows}),workspaces:()=>[{title:'项目A',sessionIds:['plain']}],scenes:async()=>({scenes:[{id:'quote',title:'智能报价-建筑'}],links:{quote:'quote'}})})
 let state=await manager.snapshot();assert.deepEqual(state.items.map(row=>row.id),['quote','plain']);assert.equal(state.items[0].location,'智能报价-建筑')
 await assert.rejects(manager.clear({sessionIds:['active'],expectedRevision:state.revision}),/NOT_ARCHIVED/)
 await manager.clear({sessionIds:['quote'],expectedRevision:state.revision})
 state=await manager.snapshot();assert.deepEqual(state.items.map(row=>row.id),['plain']);assert.deepEqual(archived,['quote','plain'])
 assert.deepEqual((await manager.load()).cleared.map(row=>row.id),['quote'])
 assert.equal(JSON.parse(await readFile(join(root,'config/archive-cleanup.json'),'utf8')).revision,1)
 await assert.rejects(manager.clear({sessionIds:['plain'],expectedRevision:0}),/CHANGED/)
 const before=await readFile(manager.path,'utf8')
 await assert.rejects(manager.clear({sessionIds:['plain'],expectedRevision:1,unknown:true}),/REQUEST_INVALID/)
 assert.equal(await readFile(manager.path,'utf8'),before)
 await writeFile(manager.path,'invalid-json')
 await assert.rejects(manager.clear({sessionIds:['plain'],expectedRevision:1}))
 assert.equal(await readFile(manager.path,'utf8'),'invalid-json')
})

test('空白占位不计为归档记录，已发送待执行、已保存场景资料和未知旧会话仍保留',async()=>{
 const {ArchiveManager}=await import('../src/archives.mjs'),root=await mkdtemp(join(tmpdir(),'beellix-archive-empty-'))
 const items=[{sessionId:'empty',blank:true},{sessionId:'queued',blank:true,projections:{values:{sessionListMetadata:{lastPromptAt:10}}}},{sessionId:'business',blank:true},{sessionId:'unknown'},{sessionId:'started',blank:false}]
 const archived=items.map(row=>row.sessionId),before=structuredClone(items)
 const manager=new ArchiveManager(root,{archived:()=>archived,sessions:async()=>({items}),workspaces:()=>[],scenes:async()=>({links:{business:'quote'},scenes:[],retainedSessionIds:['business']})})
 assert.deepEqual((await manager.snapshot()).items.map(row=>row.id).sort(),['business','queued','started','unknown'])
 assert.deepEqual(items,before);assert.equal((await manager.load()).revision,0);assert.equal(archived.length,5)
})
