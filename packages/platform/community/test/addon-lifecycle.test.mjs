import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {gzipSync} from 'node:zlib'
import {NativeAddons} from "../../../../dev/shared/runtime/native-companion.mjs"
const archive=manifest=>{const bytes=Buffer.from(JSON.stringify(manifest)),header=Buffer.alloc(512);header.write('package/package.json');header.write(bytes.length.toString(8).padStart(11,'0'),124);header[156]=48;return gzipSync(Buffer.concat([header,bytes,Buffer.alloc((512-bytes.length%512)%512),Buffer.alloc(1024)]))}

test('中台导入、自有安装与卸载闭环，失败回退，保留业务和本地安装包；旧包不冒充升级',async()=>{
 const root=await mkdtemp(join(tmpdir(),'beellix-lifecycle-'))
 try{
  for(const path of ['config','environment','data'])await mkdir(join(root,path),{recursive:true})
  const original='original-business-record';await writeFile(join(root,'data/old.json'),original)
  await writeFile(join(root,'environment/package.json'),JSON.stringify({name:'@beellix-ai/local-environment',private:true,dependencies:{}}));await writeFile(join(root,'registry.json'),JSON.stringify({schemaVersion:1,plugins:[]}))
  const manifest={name:'@beellix-ai/own-tool',version:'2.0.0',dsh:{bundle:{patch:'cordis.patch.yml'}},beellixCapability:{id:'own-tool',category:'tools'},beellix:{displayName:{zh:'自有工具'},catalog:{category:{id:'checking',label:'核对工具包'}}}}
  let bundles=[],fail=false
  const manager={listBundles:async()=>bundles,installBundle:async(path,options)=>{const pkg=JSON.parse(await readFile(join(path,'package.json')));bundles=[{name:pkg.name,version:pkg.version,installed:true,enabled:options.enabled,removable:true,availability:'profile',source:'file:'+path}];return{application:'applied'}},removeBundle:async()=>{bundles=[];return{application:'applied'}}}
  const addons=new NativeAddons(root,manager,{restoreEnvironment:async()=>{if(fail){fail=false;throw Error('fixture-uninstall-failed')}const pkg=JSON.parse(await readFile(join(root,'environment/package.json')));if(pkg.dependencies[manifest.name]){const path=join(root,'environment/node_modules',manifest.name);await mkdir(path,{recursive:true});await writeFile(join(path,'package.json'),JSON.stringify(manifest))}}})
  await assert.rejects(addons.importArchive(archive({...manifest,name:'third-party'})),/ADDON_PACKAGE_INVALID/)
  await assert.rejects(addons.importArchive(archive({...manifest,name:'@beellix-ai/knowledge'})),/ADDON_PACKAGE_INVALID/)
  await assert.rejects(addons.importArchive(archive(manifest),{expectedName:'@beellix-ai/knowledge'}),/ADDON_SOURCE_MISMATCH/)
  await assert.rejects(readFile(join(root,'config/install-catalog.json')),{code:'ENOENT'})
  const imported=await addons.importArchive(archive(manifest));assert.equal(imported.name,manifest.name)
  const offered=(await addons.snapshot()).find(row=>row.id==='own-tool');assert.equal(offered.state,'available')
  assert.deepEqual(offered.catalogCategory,{id:'checking',label:'核对工具包'})
  await addons.install({id:offered.id,digest:offered.digest});assert.equal((await addons.snapshot()).find(row=>row.id==='own-tool').state,'enabled')
  assert.deepEqual((await addons.owned())[0].catalogCategory,offered.catalogCategory)
  await addons.importArchive(archive({...manifest,version:'1.0.0'}));assert.equal((await addons.snapshot()).find(row=>row.id==='own-tool').updateVersion,undefined)
  await assert.rejects(addons.remove({id:'own-tool',expectedVersion:'1.0.0',expectedEnabled:true}),/ADDON_PACKAGE_CHANGED/)
  const before=await readFile(join(root,'registry.json'));fail=true
  await assert.rejects(addons.remove({id:'own-tool',expectedVersion:'2.0.0',expectedEnabled:true}),/fixture-uninstall-failed/)
  assert.deepEqual(await readFile(join(root,'registry.json')),before);assert.equal(bundles[0].version,'2.0.0')
  await addons.remove({id:'own-tool',expectedVersion:'2.0.0',expectedEnabled:true});assert.equal(bundles.length,0)
  assert.equal(JSON.parse(await readFile(join(root,'registry.json'))).plugins.length,0)
  assert.equal(await readFile(join(root,'data/old.json'),'utf8'),original)
  assert.equal((await addons.snapshot()).find(row=>row.id==='own-tool').state,'available')
  await assert.rejects(addons.remove({id:'foreign',expectedVersion:'1.0.0',expectedEnabled:false}),/ADDON_PACKAGE_UNAVAILABLE/)
 }finally{await rm(root,{recursive:true})}
})
