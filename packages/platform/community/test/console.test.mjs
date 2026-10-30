import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'
import { createHash } from 'node:crypto'
import { NativeAddons, restoreCompanionEnvironment } from "../../../../dev/shared/runtime/native-companion.mjs"

test('知识与数据按独立插件交付，未提供安装包时不能假安装或创建资源数据库', async () => {
  const root = await mkdtemp(join(tmpdir(), 'beellix-addons-'))
  try {
    await mkdir(join(root, 'config'))
    const calls = []
    const addons = new NativeAddons(root, { listBundles: async () => [], installBundle: async (...args) => calls.push(args) })
    const rows = await addons.snapshot()
    assert.deepEqual(rows.map(row => row.id), ['knowledge', 'data-platform', 'database'])
    assert.ok(rows.every(row => row.state === 'unavailable'))
    await assert.rejects(addons.install({ id: 'knowledge' }), /ADDON_PACKAGE_UNAVAILABLE/)
    assert.deepEqual(calls, [])
    await writeFile(join(root, 'config/install-catalog.json'), JSON.stringify({ schemaVersion: 1, packages: [{ id: 'knowledge', name: '@beellix-ai/knowledge', version: '1.0.0', archive: '../../foreign.tgz', sha256: 'a'.repeat(64) }] }))
    await assert.rejects(addons.install({ id: 'knowledge' }), /ADDON_PACKAGE_INVALID/)
  } finally { await rm(root, { recursive: true }) }
})

test('中台自有工具在自有环境升级，保留停用状态，失败恢复原环境和登记',async()=>{
  const root=await mkdtemp(join(tmpdir(),'beellix-owned-upgrade-'))
  try{
    for(const path of ['config','environment/packages'])await mkdir(join(root,path),{recursive:true})
    await writeFile(join(root,'environment/package.json'),JSON.stringify({name:'@beellix-ai/local-environment',private:true,dependencies:{}}))
    await writeFile(join(root,'registry.json'),JSON.stringify({schemaVersion:1,plugins:[]}))
    const manifests=new Map(),bundles=[],calls=[]
    async function offer(version){
      const manifest={name:'@beellix-ai/test-tool',version,dsh:{bundle:{patch:'cordis.patch.yml'}},beellixCapability:{id:'test-tool',category:'tools'}}
      const contents=Buffer.from(JSON.stringify(manifest)),header=Buffer.alloc(512);header.write('package/package.json');header.write(contents.length.toString(8).padStart(11,'0'),124);header[156]=48
      const bytes=gzipSync(Buffer.concat([header,contents,Buffer.alloc((512-contents.length%512)%512),Buffer.alloc(1024)])),sha256=createHash('sha256').update(bytes).digest('hex'),archive='environment/packages/tool-'+version+'.tgz'
      await writeFile(join(root,archive),bytes);manifests.set('file:packages/tool-'+version+'.tgz',manifest)
      await writeFile(join(root,'config/install-catalog.json'),JSON.stringify({schemaVersion:1,packages:[{id:'test-tool',name:manifest.name,title:'测试工具',category:'tools',version,archive,sha256}]}))
      return sha256
    }
    const manager={listBundles:async()=>bundles,removeBundle:async name=>{calls.push('remove:'+name);bundles.splice(0);return{application:'applied'}},installBundle:async(path,options)=>{const manifest=JSON.parse(await readFile(join(path,'package.json'),'utf8'));calls.push('register:'+manifest.version);bundles.push({name:manifest.name,version:manifest.version,enabled:options.enabled,installed:true,availability:'profile',source:'file:'+path,removable:true});return{application:'applied'}}}
    const addons=new NativeAddons(root,manager,{restoreEnvironment:async()=>{const manifest=JSON.parse(await readFile(join(root,'environment/package.json'),'utf8')),next=manifests.get(manifest.dependencies['@beellix-ai/test-tool']);if(next.version==='3.0.0')throw Error('isolated-install-failure');const target=join(root,'environment/node_modules/@beellix-ai/test-tool');await mkdir(target,{recursive:true});await writeFile(join(target,'package.json'),JSON.stringify(next))}})
    const first=await offer('1.0.0');await addons.install({id:'test-tool',digest:first});bundles[0].enabled=false
    const second=await offer('2.0.0')
    const row=(await addons.snapshot()).find(row=>row.id==='test-tool');assert.equal(row.category,'tools');assert.equal(row.version,'1.0.0');assert.equal(row.updateVersion,'2.0.0')
    await assert.rejects(addons.install({id:'test-tool',digest:second,expectedVersion:'0.9.0'}),/ADDON_PACKAGE_CHANGED/)
    await addons.install({id:'test-tool',digest:second,expectedVersion:'1.0.0'});assert.equal(bundles[0].enabled,false);assert.equal(bundles[0].version,'2.0.0')
    const before=await readFile(join(root,'environment/package.json')),registry=await readFile(join(root,'registry.json'))
    const third=await offer('3.0.0');await assert.rejects(addons.install({id:'test-tool',digest:third,expectedVersion:'2.0.0'}),/isolated-install-failure/)
    assert.deepEqual(await readFile(join(root,'environment/package.json')),before);assert.deepEqual(await readFile(join(root,'registry.json')),registry)
    assert.equal(bundles[0].version,'2.0.0');assert.equal(bundles[0].enabled,false)
    assert.deepEqual(calls,['register:1.0.0','remove:@beellix-ai/test-tool','register:2.0.0','remove:@beellix-ai/test-tool','register:2.0.0'])
  }finally{await rm(root,{recursive:true})}
})

test('一键安装使用真实环境恢复契约，保留依赖和登记，再交 DSH 管理器加载', async () => {
  const root = await mkdtemp(join(tmpdir(), 'beellix-addon-install-'))
  try {
    for (const directory of ['config', 'environment/packages']) await mkdir(join(root, directory), { recursive: true })
    const manifest = { name: '@beellix-ai/knowledge', version: '1.2.3', dsh: { bundle: { patch: 'cordis.patch.yml' } }, beellixCapability: { id: 'knowledge' } }
    const contents = Buffer.from(JSON.stringify(manifest)), header = Buffer.alloc(512)
    header.write('package/package.json'); header.write(contents.length.toString(8).padStart(11, '0'), 124); header[156] = 48
    const bytes = gzipSync(Buffer.concat([header, contents, Buffer.alloc((512 - contents.length % 512) % 512), Buffer.alloc(1024)]))
    const sha256 = createHash('sha256').update(bytes).digest('hex')
    await writeFile(join(root, 'environment/packages/knowledge.tgz'), bytes)
    await writeFile(join(root, 'environment/packages/quotation.tgz'), bytes)
    await writeFile(join(root, 'config/install-catalog.json'), JSON.stringify({ schemaVersion: 1, packages: [{ id: 'knowledge', name: manifest.name, version: manifest.version, archive: 'environment/packages/knowledge.tgz', sha256 }] }))
    await writeFile(join(root, 'environment/package.json'), JSON.stringify({ name: '@beellix-ai/local-environment', private: true, dependencies: { '@beellix-ai/smart-quotation': 'file:packages/quotation.tgz' } }))
    await writeFile(join(root, 'registry.json'), JSON.stringify({ schemaVersion: 1, plugins: [{ name: '@beellix-ai/smart-quotation', directory: 'environment/node_modules/@beellix-ai/smart-quotation' }] }))
    await mkdir(join(root,'environment/node_modules/@beellix-ai/smart-quotation'),{recursive:true})
    await writeFile(join(root,'environment/node_modules/@beellix-ai/smart-quotation/package.json'),JSON.stringify({name:'@beellix-ai/smart-quotation',version:'0.15.2',dsh:{bundle:{patch:'cordis.patch.yml'}},beellixScenario:{id:'smart-quotation'}}))
    const calls = [], bundles = []
    const addons = new NativeAddons(root, { listBundles: async () => bundles, installBundle: async path => { calls.push(path); bundles.push({ name: manifest.name, installed: true, enabled: true, version: manifest.version, availability: 'profile',source:'file:'+path }); return { application: 'applied' } } }, { restoreEnvironment: () => restoreCompanionEnvironment(root, { invocation: { command: 'fixture-pnpm', args: [] }, subprocess: { spawn: async request => { assert.equal(request.cwd, join(root,'environment')); assert.ok(request.argv.includes('--ignore-scripts')); const target = join(root, 'environment/node_modules/@beellix-ai/knowledge'); await mkdir(target, { recursive: true }); await writeFile(join(target, 'package.json'), JSON.stringify(manifest)); return { done: Promise.resolve({ exitCode: 0 }) } } } }) })
    assert.equal((await addons.snapshot())[0].state, 'available')
    await assert.rejects(addons.install({ id: 'knowledge', digest: '0'.repeat(64) }), /ADDON_PACKAGE_CHANGED/)
    await addons.install({ id: 'knowledge', digest: sha256 })
    assert.equal(calls.length, 1)
    assert.equal(calls[0], join(root, 'environment/node_modules/@beellix-ai/knowledge'))
    const { readFile } = await import('node:fs/promises')
    assert.equal(JSON.parse(await readFile(join(root, 'environment/package.json'), 'utf8')).dependencies['@beellix-ai/smart-quotation'], 'file:packages/quotation.tgz')
    assert.equal(JSON.parse(await readFile(join(root, 'registry.json'), 'utf8')).plugins.length, 2)
    assert.equal((await addons.snapshot())[0].state, 'enabled')
  } finally { await rm(root, { recursive: true }) }
})
