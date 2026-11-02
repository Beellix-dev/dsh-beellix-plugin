import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdir,readFile,writeFile} from 'node:fs/promises'
import {join,resolve} from 'node:path'
import {randomUUID,createHash} from 'node:crypto'
import {gzipSync} from 'node:zlib'
import {LayoutStore} from '../src/layout.mjs'
import {KnowledgeSessions} from '../src/knowledge-sessions.mjs'
import {NativeAddons} from '../../../../dev/shared/runtime/native-companion.mjs'
import {capabilityDefinition} from '../../../../dev/shared/runtime/package-contract.mjs'

const archive=manifest=>{const bytes=Buffer.from(JSON.stringify(manifest)),header=Buffer.alloc(512);header.write('package/package.json');header.write(bytes.length.toString(8).padStart(11,'0'),124);header[156]=48;return gzipSync(Buffer.concat([header,bytes,Buffer.alloc((512-bytes.length%512)%512),Buffer.alloc(1024)]))}
async function fixture({adoptLegacy=false}={}){
 const base=resolve(import.meta.dirname,'../../../../dev/artifacts/test-results/legacy-installation',randomUUID()),installationDirectory=join(base,'DSH NEXT')
 await mkdir(join(installationDirectory,'resources'),{recursive:true})
 const options={installationDirectory,locatorDirectory:join(base,'locator'),dshHome:join(base,'profile')},store=new LayoutStore(options)
 const {root}=await store.initialize(),markerPath=join(root,'beellix-layout.json'),marker=JSON.parse(await readFile(markerPath))
 await writeFile(markerPath,JSON.stringify({...marker,product:'@beellix/dsh-ui'},null,2)+'\n')
 await writeFile(join(root,'environment/package.json'),JSON.stringify({name:'@beellix/local-environment',private:true,type:'module',dependencies:{}},null,2)+'\n')
 await writeFile(join(root,'data/retained.json'),'{"original":"keep"}')
 if(adoptLegacy)await store.selectRoot(root)
 return{root,options,markerPath}
}
const tracked=['beellix-layout.json','environment/package.json','registry.json','data/retained.json']
const bytes=async root=>Object.fromEntries(await Promise.all(tracked.map(async file=>[file,(await readFile(join(root,file))).toString('base64')])))

test('用户明确选择后旧产品标记与环境名称可接回，prepare 不改名、不改写资料或登记',async()=>{
 const f=await fixture({adoptLegacy:true}),before=await bytes(f.root),reopened=new LayoutStore(f.options)
 assert.equal(reopened.state().status,'ready')
 await reopened.prepare()
 assert.equal(reopened.state().status,'ready');assert.deepEqual(await bytes(f.root),before)
})

test('未知归属和环境名称仍拒绝认领，原件逐字保留',async()=>{
 const f=await fixture({adoptLegacy:true}),marker=JSON.parse(await readFile(f.markerPath))
 await writeFile(f.markerPath,JSON.stringify({...marker,product:'@other/dsh-ui'}));let before=await bytes(f.root)
 assert.equal(new LayoutStore(f.options).state().status,'blocked');assert.deepEqual(await bytes(f.root),before)
 await writeFile(f.markerPath,JSON.stringify(marker));await writeFile(join(f.root,'environment/package.json'),JSON.stringify({name:'@other/local-environment',private:true,dependencies:{}}));before=await bytes(f.root)
 assert.equal(new LayoutStore(f.options).state().status,'blocked');assert.deepEqual(await bytes(f.root),before)
})

async function installed(){
 const f=await fixture(),manifest={name:'@beellix/knowledge',version:'0.1.1',dsh:{bundle:{patch:'cordis.patch.yml'}},beellixCapability:{id:'knowledge',category:'resources',ui:{panel:'beellix-knowledge'}}},target=join(f.root,'environment/node_modules',manifest.name)
 await mkdir(target,{recursive:true});await writeFile(join(target,'package.json'),JSON.stringify(manifest))
 const content=archive(manifest),sha256=createHash('sha256').update(content).digest('hex'),file='knowledge-0.1.1.tgz'
 await mkdir(join(f.root,'environment/packages'),{recursive:true})
 await writeFile(join(f.root,'environment/packages',file),content)
 await writeFile(join(f.root,'environment/package.json'),JSON.stringify({name:'@beellix/local-environment',private:true,dependencies:{[manifest.name]:'file:packages/'+file}}))
 await writeFile(join(f.root,'registry.json'),JSON.stringify({schemaVersion:1,plugins:[{name:manifest.name,version:manifest.version,directory:'environment/node_modules/'+manifest.name,archiveSha256:sha256}]}))
 await writeFile(join(f.root,'config/install-catalog.json'),JSON.stringify({schemaVersion:1,packages:[{id:'knowledge',name:manifest.name,version:manifest.version,category:'resources',archive:'environment/packages/'+file,sha256}]}))
 let bundles=[{name:manifest.name,version:manifest.version,installed:true,enabled:true,availability:'profile',removable:true,source:'file:'+target}],calls=[]
 const manager={listBundles:async()=>bundles,setBundleEnabled:async(name,enabled)=>{calls.push(['enabled',name,enabled]);bundles[0]={...bundles[0],enabled};return{application:'applied'}},installBundle:async()=>{calls.push(['install']);throw Error('must-not-install')},removeBundle:async()=>{calls.push(['remove']);throw Error('must-not-remove')}}
 return{...f,target,manifest,calls,addons:new NativeAddons(f.root,manager,{restoreEnvironment:async()=>{calls.push(['restore']);throw Error('must-not-restore')}})}
}
test('既有旧名称基础插件、目录和归属可识别；启停仍针对原名称，不改登记和资料',async()=>{
 const f=await installed(),before=await bytes(f.root),rows=await f.addons.owned()
 assert.equal(rows.length,1);assert.equal(rows[0].name,f.manifest.name)
 assert.equal((await f.addons.package('knowledge')).name,f.manifest.name)
 const row=(await f.addons.snapshot()).find(p=>p.id==='knowledge')
 assert.equal(row.state,'enabled');assert.equal(row.packageError,undefined)
 await f.addons.setEnabled({id:'knowledge',enabled:false,expectedEnabled:true,expectedVersion:'0.1.1'})
 assert.deepEqual(f.calls,[['enabled',f.manifest.name,false]]);assert.deepEqual(await bytes(f.root),before)
})
test('旧提供包知识开关保留真实来源校验，不接受外部冒名包或错误目录',async()=>{
 const f=await installed(),store=new KnowledgeSessions(f.root,{owned:()=>f.addons.owned(),inspect:async()=>({id:'test-session'})})
 const provider={status:async()=>({status:'ready'}),listSpaces:async()=>[{id:'one',title:'隔离资料'}]}
 try{
  await assert.rejects(store.registerProvider({packageName:'@other/knowledge',packageDirectory:f.target,provider}),/PROVIDER/)
  await assert.rejects(store.registerProvider({packageName:f.manifest.name,packageDirectory:resolve(f.target,'..'),provider}),/SOURCE/)
  const connection=await store.registerProvider({packageName:f.manifest.name,packageDirectory:f.target,provider})
  await store.select({sessionId:'test-session',enabled:true,spaceIds:['one'],expectedRevision:0})
  assert.equal((await store.read('test-session')).enabled,true)
  await connection.dispose()
  assert.equal((await store.read('test-session')).enabled,false)
 }finally{await store.dispose()}
 assert.throws(()=>capabilityDefinition({...f.manifest,name:'@other/knowledge'}),/CONTRACT/)
})
test('更名包不能作为同一业务 ID 的隐式升级或并列安装',async()=>{
 const f=await installed(),before=await bytes(f.root)
 const current={...f.manifest,name:'@beellix-ai/knowledge'}
 await assert.rejects(f.addons.importArchive(archive(current)),/ADDON_IDENTITY_MIGRATION_REQUIRED/)
 const content=archive(current),sha256=createHash('sha256').update(content).digest('hex')
 await writeFile(join(f.root,'environment/packages/current.tgz'),content)
 await writeFile(join(f.root,'config/install-catalog.json'),JSON.stringify({schemaVersion:1,packages:[{id:'knowledge',name:current.name,version:'0.1.1',category:'resources',archive:'environment/packages/current.tgz',sha256}]}))
 const row=(await f.addons.snapshot()).find(p=>p.id==='knowledge');assert.equal(row.name,f.manifest.name);assert.equal(row.updateVersion,undefined)
 await assert.rejects(f.addons.install({id:'knowledge',digest:sha256}),/ADDON_IDENTITY_MIGRATION_REQUIRED/)
 assert.deepEqual(f.calls,[]);assert.deepEqual(await bytes(f.root),before)
})
