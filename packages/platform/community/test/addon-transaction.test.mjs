import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,mkdir,writeFile,readFile} from 'node:fs/promises'
import {resolve,join} from 'node:path'
import {gzipSync} from 'node:zlib'
import {NativeAddons} from "../../../../dev/shared/runtime/native-companion.mjs"

const name='@beellix-ai/transaction-tool'
const manifest=version=>({name,version,dsh:{bundle:{patch:'cordis.patch.yml'}},beellixCapability:{id:'transaction-tool',category:'tools'}})
const archive=value=>{const bytes=Buffer.from(JSON.stringify(value)),head=Buffer.alloc(512);head.write('package/package.json');head.write(bytes.length.toString(8).padStart(11,'0'),124);head[156]=48;return gzipSync(Buffer.concat([head,bytes,Buffer.alloc((512-bytes.length%512)%512),Buffer.alloc(1024)]))}
async function fixture(previous,{registered=true}={}){
 const root=await mkdtemp(resolve(import.meta.dirname,"../../../../dev/artifacts/test-results/addon-transaction-")),target=join(root,'environment/node_modules',name)
 await mkdir(target,{recursive:true});await mkdir(join(root,'data/control-plane'),{recursive:true})
 const env=JSON.stringify({name:'@beellix-ai/local-environment',private:true,dependencies:previous?{[name]:'file:packages/old.tgz'}:{}}),registry=JSON.stringify({schemaVersion:1,plugins:previous?[{name,version:previous,directory:'environment/node_modules/'+name}]:[]})
 await writeFile(join(root,'environment/package.json'),env);await writeFile(join(root,'registry.json'),registry);await writeFile(join(root,'data/keep.json'),'business-unchanged')
 let bundles=previous&&registered?[{name,version:previous,installed:true,enabled:false,removable:true,availability:'profile',source:'file:'+target}]:[],restores=0,removes=0,failActivation=true,failRollback=false,installedVersion=previous
 const manager={listBundles:async()=>bundles,removeBundle:async()=>{removes++;if(failRollback)throw Error('rollback-offline');bundles=[];return{application:'applied'}},installBundle:async(path,options)=>{const pkg=JSON.parse(await readFile(join(path,'package.json')));const failed=failActivation&&pkg.version==='2.0.0';bundles=[{name,version:pkg.version,installed:true,enabled:options.enabled,removable:true,availability:'profile',source:'file:'+path,...failed?{error:{message:'activation-failed'}}:{}}];return{application:failed?'failed':'applied'}}}
 const restoreEnvironment=async()=>{restores++;const env=JSON.parse(await readFile(join(root,'environment/package.json')));installedVersion=env.dependencies[name]?(env.dependencies[name].endsWith('old.tgz')?previous:'2.0.0'):undefined;if(installedVersion)await writeFile(join(target,'package.json'),JSON.stringify(manifest(installedVersion)))}
 if(previous)await writeFile(join(target,'package.json'),JSON.stringify(manifest(previous)))
 return{root,target,env,registry,manager,restoreEnvironment,bundles:()=>bundles,restores:()=>restores,removes:()=>removes,installedVersion:()=>installedVersion,allowActivation:()=>{failActivation=false},blockRollback:()=>{failRollback=true},allowRollback:()=>{failRollback=false},setBundles:value=>{bundles=value}}
}
for(const previous of [undefined,'1.0.0'])test('激活失败完整回退环境与原生登记：'+(previous?'升级并保留停用状态':'首次安装'),async()=>{
 const f=await fixture(previous),addons=new NativeAddons(f.root,f.manager,{restoreEnvironment:f.restoreEnvironment})
 await addons.importArchive(archive(manifest('2.0.0')));const offered=(await addons.snapshot()).find(row=>row.id==='transaction-tool')
 await assert.rejects(addons.install({id:offered.id,digest:offered.digest,expectedVersion:previous}),/ADDON_ACTIVATION_FAILED/)
 assert.equal(await readFile(join(f.root,'environment/package.json'),'utf8'),f.env);assert.equal(await readFile(join(f.root,'registry.json'),'utf8'),f.registry)
 assert.equal(f.installedVersion(),previous);assert.equal(f.bundles().length,previous?1:0)
 if(previous){assert.equal(f.bundles()[0].version,previous);assert.equal(f.bundles()[0].enabled,false)}
 assert.equal(await readFile(join(f.root,'data/keep.json'),'utf8'),'business-unchanged')
 f.allowActivation();await addons.install({id:offered.id,digest:offered.digest,expectedVersion:previous});assert.equal(f.bundles()[0].version,'2.0.0')
})
test('升级前未登记的包，失败时也清除新登记，不擅自启用旧包',async()=>{
 const f=await fixture('1.0.0',{registered:false}),addons=new NativeAddons(f.root,f.manager,{restoreEnvironment:f.restoreEnvironment})
 await addons.importArchive(archive(manifest('2.0.0')));const offered=(await addons.snapshot()).find(row=>row.id==='transaction-tool')
 await assert.rejects(addons.install({id:offered.id,digest:offered.digest,expectedVersion:'1.0.0'}),/ADDON_ACTIVATION_FAILED/)
 assert.equal(f.bundles().length,0);assert.equal(f.installedVersion(),'1.0.0')
})
test('回退失败保留恢复日志，新实例接回后恢复三方一致；成功后不会重复回退',async()=>{
 const f=await fixture(),addons=new NativeAddons(f.root,f.manager,{restoreEnvironment:f.restoreEnvironment})
 await addons.importArchive(archive(manifest('2.0.0')));const offered=(await addons.snapshot()).find(row=>row.id==='transaction-tool');f.blockRollback()
 await assert.rejects(addons.install({id:offered.id,digest:offered.digest}),/ADDON_ROLLBACK_REQUIRED/)
 assert.equal(JSON.parse(await readFile(join(f.root,'data/control-plane/addon-operation.json'))).status,'pending')
 f.allowRollback();const restarted=new NativeAddons(f.root,f.manager,{restoreEnvironment:f.restoreEnvironment});await restarted.snapshot()
 assert.equal(f.bundles().length,0);assert.equal(f.installedVersion(),undefined);assert.equal(await readFile(join(f.root,'registry.json'),'utf8'),f.registry)
 assert.equal(JSON.parse(await readFile(join(f.root,'data/control-plane/addon-operation.json'))).status,'rolled-back')
 const count=f.restores();await restarted.snapshot();assert.equal(f.restores(),count)
})
test('进程中断留下的进行中日志在下一次操作前恢复；拒绝误撤销外部登记',async()=>{
 const f=await fixture(),before={manifest:f.env,registry:f.registry,bundle:null}
 const journal={schemaVersion:1,status:'pending',operation:'install',name,version:'2.0.0',before}
 await writeFile(join(f.root,'data/control-plane/addon-operation.json'),JSON.stringify(journal))
 await writeFile(join(f.root,'environment/package.json'),JSON.stringify({name:'@beellix-ai/local-environment',private:true,dependencies:{[name]:'file:packages/new.tgz'}}))
 f.setBundles([{name,version:'2.0.0',installed:true,enabled:true,removable:true,source:'file:'+join(f.root,'foreign')}])
 const restarted=new NativeAddons(f.root,f.manager,{restoreEnvironment:f.restoreEnvironment})
 await assert.rejects(restarted.snapshot(),/ADDON_FOREIGN_REGISTRATION/);assert.equal(f.removes(),0)
 f.setBundles([]);await restarted.snapshot();assert.equal(await readFile(join(f.root,'environment/package.json'),'utf8'),f.env)
 assert.equal(JSON.parse(await readFile(join(f.root,'data/control-plane/addon-operation.json'))).status,'rolled-back')
})
test('安装前拒绝不兼容桥接契约及未经迁移的数据版本，不碰原生登记和旧资料',async()=>{
 const f=await fixture('1.0.0'),addons=new NativeAddons(f.root,f.manager,{restoreEnvironment:f.restoreEnvironment})
 await assert.rejects(addons.importArchive(archive({...manifest('2.0.0'),beellixContract:{schemaVersion:99}})),/ADDON_CONTRACT_UNSUPPORTED/)
 const contract={schemaVersion:1,bridge:{min:1,max:1},contributes:['tools'],data:{schemaVersion:2,uninstall:'retain'}}
 await addons.importArchive(archive({...manifest('2.0.0'),beellixContract:contract}));const offered=(await addons.snapshot()).find(row=>row.id==='transaction-tool')
 await assert.rejects(addons.install({id:offered.id,digest:offered.digest,expectedVersion:'1.0.0'}),/ADDON_DATA_MIGRATION_REQUIRED/)
 assert.equal(f.removes(),0);assert.equal(await readFile(join(f.root,'registry.json'),'utf8'),f.registry)
})

test('网站更新的旧包摘要在安装事务锁内核对，同版本重装竞争也不能覆盖',async()=>{
 const f=await fixture('1.0.0'),addons=new NativeAddons(f.root,f.manager,{restoreEnvironment:f.restoreEnvironment})
 await addons.importArchive(archive(manifest('2.0.0')));const offered=(await addons.snapshot()).find(row=>row.id==='transaction-tool')
 await assert.rejects(addons.install({id:offered.id,digest:offered.digest,expectedVersion:'1.0.0',expectedArchiveSha256:'a'.repeat(64)}),/ADDON_PACKAGE_CHANGED/)
 assert.equal(f.removes(),0);assert.equal(await readFile(join(f.root,'registry.json'),'utf8'),f.registry);assert.equal(await readFile(join(f.root,'data/keep.json'),'utf8'),'business-unchanged')
})
test('原生取消安装不能记为完成或自动重新接入；异常恢复日志停止变更',async()=>{
 const f=await fixture();f.manager.installBundle=async()=>({application:'cancelled'})
 const addons=new NativeAddons(f.root,f.manager,{restoreEnvironment:f.restoreEnvironment})
 await addons.importArchive(archive(manifest('2.0.0')));const offered=(await addons.snapshot()).find(row=>row.id==='transaction-tool')
 await assert.rejects(addons.install({id:offered.id,digest:offered.digest}),/ADDON_OPERATION_CANCELLED/)
 assert.equal(await readFile(join(f.root,'registry.json'),'utf8'),f.registry);assert.equal(f.installedVersion(),undefined)
 await writeFile(join(f.root,'data/control-plane/addon-operation.json'),JSON.stringify({schemaVersion:1,status:'unknown'}))
 await assert.rejects(addons.snapshot(),/ADDON_RECOVERY_INVALID/)
})
