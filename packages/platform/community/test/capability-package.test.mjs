import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,mkdir,writeFile} from 'node:fs/promises'
import {resolve,join} from 'node:path'
import {gzipSync} from 'node:zlib'
import {NativeAddons} from "../../../../dev/shared/runtime/native-companion.mjs"
const archive=value=>{const bytes=Buffer.from(JSON.stringify(value)),head=Buffer.alloc(512);head.write('package/package.json');head.write(bytes.length.toString(8).padStart(11,'0'),124);head[156]=48;return gzipSync(Buffer.concat([head,bytes,Buffer.alloc((512-bytes.length%512)%512),Buffer.alloc(1024)]))}
async function fixture(){
 const root=await mkdtemp(resolve(import.meta.dirname,"../../../../dev/artifacts/test-results/capability-package-")),directory=join(root,'environment/node_modules/@beellix-ai/knowledge')
 await mkdir(directory,{recursive:true});await mkdir(join(root,'config'))
 const manifest={name:'@beellix-ai/knowledge',version:'1.0.0',dsh:{bundle:{patch:'cordis.patch.yml'}},beellixCapability:{id:'knowledge',category:'resources',ui:{panel:'beellix-knowledge',configPanel:'beellix-knowledge-settings'}}}
 await writeFile(join(directory,'package.json'),JSON.stringify(manifest));await writeFile(join(root,'registry.json'),JSON.stringify({schemaVersion:1,plugins:[{name:manifest.name,version:manifest.version,directory:'environment/node_modules/@beellix-ai/knowledge'}]}))
 let bundle={name:manifest.name,version:'1.0.0',enabled:true,installed:true,removable:true,source:'file:'+directory},fail=false;const calls=[]
 const manager={listBundles:async()=>[bundle],setBundleEnabled:async(name,enabled)=>{calls.push({name,enabled});bundle={...bundle,enabled};if(fail){fail=false;return{application:'failed'}}return{application:'applied'}}}
 return{root,directory,manifest,calls,fail:()=>{fail=true},bundle:value=>{if(value)bundle=value;return bundle},addons:new NativeAddons(root,manager)}
}
test('能力清单带出打开与配置入口，禁止冒用中台或原生面板',async()=>{
 const f=await fixture(),row=(await f.addons.owned())[0]
 assert.equal(row.panel,'beellix-knowledge');assert.equal(row.configPanel,'beellix-knowledge-settings')
 await assert.rejects(f.addons.importArchive(archive({...f.manifest,beellixCapability:{...f.manifest.beellixCapability,ui:{panel:'beellix-platform'}}})),/ADDON_CONTRACT_INVALID/)
})
test('启停先检查归属和实际状态，失败恢复原选择，不修改其他登记',async()=>{
 const f=await fixture()
 await assert.rejects(f.addons.setEnabled({id:'knowledge',enabled:false,expectedVersion:'0.9.0',expectedEnabled:true}),/ADDON_PACKAGE_CHANGED/);assert.equal(f.calls.length,0)
 f.fail();await assert.rejects(f.addons.setEnabled({id:'knowledge',enabled:false,expectedVersion:'1.0.0',expectedEnabled:true}),/ADDON_ACTIVATION_FAILED/);assert.equal(f.bundle().enabled,true)
 await f.addons.setEnabled({id:'knowledge',enabled:false,expectedVersion:'1.0.0',expectedEnabled:true});assert.equal(f.bundle().enabled,false)
 f.bundle({...f.bundle(),source:'file:'+resolve(f.root,'foreign')})
 await assert.rejects(f.addons.setEnabled({id:'knowledge',enabled:true,expectedVersion:'1.0.0',expectedEnabled:false}),/ADDON_FOREIGN_REGISTRATION/)
})
test('原生管理器就地更新对象时，回退仍使用操作前启停值',async()=>{
 const f=await fixture();let fail=true
 f.addons.pluginManager.setBundleEnabled=async(_name,enabled)=>{f.bundle().enabled=enabled;if(fail){fail=false;return{application:'failed'}}return{application:'applied'}}
 await assert.rejects(f.addons.setEnabled({id:'knowledge',enabled:false,expectedVersion:'1.0.0',expectedEnabled:true}),/ADDON_ACTIVATION_FAILED/)
 assert.equal(f.bundle().enabled,true)
})
test('早期知识库包未写类别仍按原保留规则识别，不强制改写旧清单',async()=>{
 const f=await fixture();const legacy={...f.manifest,beellixCapability:{id:'knowledge'}}
 await writeFile(join(f.directory,'package.json'),JSON.stringify(legacy));assert.equal((await f.addons.owned())[0].category,'resources')
})
