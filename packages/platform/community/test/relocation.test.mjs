import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,mkdir,writeFile,readFile,cp,readdir} from 'node:fs/promises'
import {join,resolve} from 'node:path'
import {LayoutStore} from '../src/layout.mjs'

async function fixture(){
  const base=await mkdtemp(resolve(import.meta.dirname,"../../../../dev/artifacts/test-results/portable-root-"))
  const installationDirectory=join(base,'old','DSH NEXT'),newInstallation=join(base,'new','DSH NEXT'),locatorDirectory=join(base,'locator')
  await mkdir(installationDirectory,{recursive:true});await mkdir(newInstallation,{recursive:true})
  const store=new LayoutStore({installationDirectory,locatorDirectory});await store.initialize()
  await writeFile(join(store.root,'data/业务.json'),'{"revision":7,"total":"123.45"}')
  return{base,store,installationDirectory,newInstallation,locatorDirectory}
}

test('复制到新安装位置自动接回，实例和业务字节不变，旧位置不改写，重复启动不重复备份',async()=>{
  const f=await fixture(),before=await readFile(join(f.store.root,'beellix-layout.json'),'utf8')
  const root=join(f.newInstallation,'Beellix');await cp(f.store.root,root,{recursive:true})
  const moved=new LayoutStore({installationDirectory:f.newInstallation,locatorDirectory:f.locatorDirectory})
  await moved.prepare()
  const state=moved.state();assert.equal(state.status,'ready');assert.equal(state.instanceId,f.store.state().instanceId)
  assert.equal(state.root,root);assert.equal(state.portable,true)
  assert.equal(await readFile(join(root,'data/业务.json'),'utf8'),'{"revision":7,"total":"123.45"}')
  assert.equal(await readFile(join(f.store.root,'beellix-layout.json'),'utf8'),before)
  const marker=JSON.parse(await readFile(join(root,'beellix-layout.json'),'utf8'));assert(marker.previousRoots.includes(f.store.root))
  const backups=await readdir(join(root,'backups/layout'))
  const resumed=new LayoutStore({installationDirectory:f.newInstallation,locatorDirectory:f.locatorDirectory});await resumed.prepare()
  assert.equal(resumed.state().status,'ready');assert.deepEqual(await readdir(join(root,'backups/layout')),backups)
})

test('独立目录经宿主选择后记录为待采用，下一次启动接回；不会把网页路径当作选择',async()=>{
  const f=await fixture(),independent=join(f.base,'independent','BeelliX');await cp(f.store.root,independent,{recursive:true})
  const before=f.store.root
  const selected=await f.store.selectRoot(independent)
  assert.equal(selected.restartRequired,true);assert.equal(f.store.root,before)
  const resumed=new LayoutStore({installationDirectory:f.installationDirectory,locatorDirectory:f.locatorDirectory});await resumed.prepare()
  assert.equal(resumed.root,independent);assert.equal(resumed.state().status,'ready')
  await assert.rejects(resumed.selectRoot(join(f.base,'unknown')),/目录|归属/)
})

test('新位置没有邻接目录且有多个历史副本时不静默选择或创建空目录',async()=>{
  const f=await fixture(),copy=join(f.base,'copy','Beellix');await cp(f.store.root,copy,{recursive:true})
  await f.store.selectRoot(copy)
  const third=join(f.base,'third','DSH NEXT');await mkdir(third,{recursive:true})
  const store=new LayoutStore({installationDirectory:third,locatorDirectory:f.locatorDirectory})
  assert.equal(store.state().status,'choice-required');assert.equal(store.state().candidates.length,2)
  await assert.rejects(store.prepare(),/选择/)
  assert.equal((await store.selectRoot(copy)).restartRequired,true)
  const resumed=new LayoutStore({installationDirectory:third,locatorDirectory:f.locatorDirectory});await resumed.prepare();assert.equal(resumed.root,copy)
})

test('启动识别不补造复制时丢失的应用登记',async()=>{
  const f=await fixture(),root=join(f.newInstallation,'Beellix');await cp(f.store.root,root,{recursive:true})
  const {rename}=await import('node:fs/promises');await rename(join(root,'registry.json'),join(root,'registry.saved.json'))
  const store=new LayoutStore({installationDirectory:f.newInstallation,locatorDirectory:f.locatorDirectory})
  await assert.rejects(store.prepare(),/复制不完整/)
  await assert.rejects(readFile(join(root,'registry.json')),error=>error.code==='ENOENT')
})

test('损坏或未来版本归属、未知登记和 DSH 用户目录内根不能被自动采用',async()=>{
  const f=await fixture(),root=join(f.newInstallation,'Beellix');await cp(f.store.root,root,{recursive:true})
  const file=join(root,'beellix-layout.json'),marker=JSON.parse(await readFile(file,'utf8'));marker.schemaVersion=999
  const bytes=JSON.stringify(marker);await writeFile(file,bytes)
  const store=new LayoutStore({installationDirectory:f.newInstallation,locatorDirectory:f.locatorDirectory})
  await assert.rejects(store.prepare(),/版本|归属/);assert.equal(await readFile(file,'utf8'),bytes)
  await assert.rejects(f.store.selectRoot(f.store.root,{dshHome:f.base}),/参数|目录/)
})

test('位置记录损坏时不先更新迁入目录的归属标记',async()=>{
  const f=await fixture(),root=join(f.newInstallation,'Beellix');await cp(f.store.root,root,{recursive:true})
  const marker=join(root,'beellix-layout.json'),before=await readFile(marker,'utf8')
  await writeFile(join(f.locatorDirectory,'locations.json'),'{bad')
  const store=new LayoutStore({installationDirectory:f.newInstallation,locatorDirectory:f.locatorDirectory})
  await assert.rejects(store.prepare(),/位置|记录|目录/);assert.equal(await readFile(marker,'utf8'),before)
})
