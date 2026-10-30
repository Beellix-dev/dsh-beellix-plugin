import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,mkdir,writeFile} from 'node:fs/promises'
import {resolve,join} from 'node:path'
import {KnowledgeSessions} from '../src/knowledge-sessions.mjs'

async function fixture(){
 const root=await mkdtemp(resolve("./dev/artifacts/knowledge-sessions-")),directory=join(root,'environment/node_modules/@beellix-ai/knowledge')
 await mkdir(directory,{recursive:true});await writeFile(join(directory,'package.json'),JSON.stringify({name:'@beellix-ai/knowledge',version:'0.1.0',beellixCapability:{id:'knowledge'}}))
 const options={inspect:async id=>['a','b'].includes(id)?{id}:null,owned:async()=>[{name:'@beellix-ai/knowledge',id:'knowledge',version:'0.1.0',category:'resources',directory}]}
 const store=new KnowledgeSessions(root,options)
 const connection=await store.registerProvider({packageName:'@beellix-ai/knowledge',packageDirectory:directory,provider:{status:async()=>({status:'ready'}),listSpaces:async()=>[{id:'one',title:'项目甲'},{id:'two',title:'项目乙'}]}})
 return {store,connection,root,options,directory}
}
test('新会话关闭，选择只影响当前会话，重开保存且修订冲突拒绝',async()=>{
 const {store,connection,root,options}=await fixture()
 assert.equal((await store.read('a')).enabled,false)
 await store.select({sessionId:'a',enabled:true,spaceIds:['one'],expectedRevision:0})
 assert.deepEqual((await store.read('a')).spaceIds,['one']);assert.equal((await store.read('b')).enabled,false)
 await assert.rejects(()=>store.select({sessionId:'a',enabled:true,spaceIds:['two'],expectedRevision:0}),/REVISION/)
 await connection.dispose();await store.dispose()
 const reopened=new KnowledgeSessions(root,options);assert.equal((await reopened.read('a')).desiredEnabled,true);assert.equal((await reopened.read('a')).enabled,false)
 await reopened.dispose()
})
test('范围越界、陌生会话和冒名提供方拒绝，关闭使在途结果失效',async()=>{
 const {store,connection,directory}=await fixture()
 await assert.rejects(()=>store.select({sessionId:'other',enabled:true,spaceIds:['one'],expectedRevision:0}),/SESSION/)
 await assert.rejects(()=>store.select({sessionId:'a',enabled:true,spaceIds:['secret'],expectedRevision:0}),/SPACE/)
 await assert.rejects(()=>store.registerProvider({packageName:'@beellix-ai/knowledge',packageDirectory:resolve(directory,'..'),provider:{}}),/SOURCE|PROVIDER/)
 await store.select({sessionId:'a',enabled:true,spaceIds:['one'],expectedRevision:0})
 const lease=await store.scope('a');assert.equal(lease.signal.aborted,false);await lease.validate()
 await store.select({sessionId:'a',enabled:false,spaceIds:['one'],expectedRevision:1})
 assert.equal(lease.signal.aborted,true);await assert.rejects(()=>lease.validate(),/SCOPE/)
 lease.dispose();await connection.dispose();await store.dispose()
})
test('提供方卸载立即撤销有效范围，保留偏好并通知作用域',async()=>{
 const {store,connection}=await fixture();let changes=0;const off=store.subscribe(()=>changes++)
 await store.select({sessionId:'a',enabled:true,spaceIds:['one'],expectedRevision:0});const lease=await store.scope('a')
 await connection.dispose();assert.equal(lease.signal.aborted,true)
 const state=await store.read('a');assert.equal(state.enabled,false);assert.equal(state.desiredEnabled,true);assert.equal(state.status,'not-installed');assert.ok(changes>=2)
 off();lease.dispose();await store.dispose()
})
