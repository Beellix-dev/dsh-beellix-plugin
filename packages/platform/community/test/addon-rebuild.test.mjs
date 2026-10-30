import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,mkdir,writeFile,readFile} from 'node:fs/promises'
import {resolve,join} from 'node:path'
import {gzipSync} from 'node:zlib'
import {NativeAddons} from "../../../../dev/shared/runtime/native-companion.mjs"
const archive=manifest=>{const b=Buffer.from(JSON.stringify(manifest)),h=Buffer.alloc(512);h.write('package/package.json');h.write(b.length.toString(8).padStart(11,'0'),124);h[156]=48;return gzipSync(Buffer.concat([h,b,Buffer.alloc((512-b.length%512)%512),Buffer.alloc(1024)]))}

test('固定版本的新安装包按摘要显示更新；重复导入不提示更新，重装保留业务资料',async()=>{
 const root=await mkdtemp(resolve("./dev/artifacts/addon-rebuild-")),target=join(root,'environment/node_modules/@beellix-ai/rebuild-test')
 for(const part of ['config','environment','data'])await mkdir(join(root,part),{recursive:true})
 await writeFile(join(root,'environment/package.json'),JSON.stringify({name:'@beellix-ai/local-environment',private:true,dependencies:{}}))
 await writeFile(join(root,'registry.json'),JSON.stringify({schemaVersion:1,plugins:[]}));await writeFile(join(root,'data/business.json'),'preserve this record')
 let manifest={name:'@beellix-ai/rebuild-test',version:'0.1.1',description:'previous implementation',dsh:{bundle:{patch:'cordis.patch.yml'}},beellixCapability:{id:'rebuild-test',category:'tools'}},bundles=[]
 const manager={listBundles:async()=>bundles,installBundle:async(path,options)=>{bundles=[{name:manifest.name,version:manifest.version,installed:true,enabled:options.enabled,removable:true,availability:'profile',source:'file:'+path}];return{application:'applied'}},removeBundle:async()=>{bundles=[];return{application:'applied'}}}
 const addons=new NativeAddons(root,manager,{restoreEnvironment:async()=>{await mkdir(target,{recursive:true});await writeFile(join(target,'package.json'),JSON.stringify(manifest))}})
 const first=await addons.importArchive(archive(manifest));await addons.install({id:'rebuild-test',digest:first.digest})
 await addons.importArchive(archive(manifest));assert.equal((await addons.snapshot()).find(r=>r.id==='rebuild-test').updateVersion,undefined)
 manifest={...manifest,description:'corrected implementation'};const next=await addons.importArchive(archive(manifest));const row=(await addons.snapshot()).find(r=>r.id==='rebuild-test')
 assert.equal(row.updateVersion,'0.1.1');assert.equal(row.updateKind,'rebuild');assert.equal(row.digest,next.digest)
 await addons.install({id:'rebuild-test',digest:next.digest,expectedVersion:'0.1.1'})
 assert.equal((await addons.snapshot()).find(r=>r.id==='rebuild-test').updateVersion,undefined)
 assert.equal(JSON.parse(await readFile(join(root,'registry.json'),'utf8')).plugins[0].archiveSha256,next.digest)
 assert.equal(await readFile(join(root,'data/business.json'),'utf8'),'preserve this record')
})
