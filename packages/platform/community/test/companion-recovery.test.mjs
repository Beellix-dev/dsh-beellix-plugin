import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,mkdir,writeFile,readFile,rename} from 'node:fs/promises'
import {join,resolve} from 'node:path'
import {CompanionApplications,restoreCompanionEnvironment} from "../../../../dev/shared/runtime/native-companion.mjs"

async function fixture(){
  const root=await mkdtemp(resolve(import.meta.dirname,"../../../../dev/artifacts/test-results/app-recovery-")),directory=join(root,'environment/node_modules/@beellix-ai/quote')
  await mkdir(directory,{recursive:true});await mkdir(join(root,'data'))
  await writeFile(join(directory,'package.json'),JSON.stringify({name:'@beellix-ai/quote',version:'1.0.0',dsh:{bundle:{patch:'./cordis.patch.yml'}}}))
  await writeFile(join(root,'registry.json'),JSON.stringify({schemaVersion:1,plugins:[{name:'@beellix-ai/quote',version:'1.0.0',directory:'environment/node_modules/@beellix-ai/quote'}]}))
  await writeFile(join(root,'data/keep.json'),'unchanged')
  return{root,directory}
}
test('原生已在同一位置运行时不重复安装，保留用户停用状态',async()=>{
  const f=await fixture();let installs=0
  const manager={listBundles:async()=>[{name:'@beellix-ai/quote',installed:true,enabled:false,availability:'profile',version:'1.0.0',source:'link:'+f.directory}],installBundle:async()=>{installs++;throw Error('already-installed')}}
  const applications=new CompanionApplications(f.root,manager)
  const result=await applications.reconnect({});assert.equal(result.items[0].application,'disabled');assert.equal(installs,0)
})
test('旧原生登记指向旧路径时沿原生卸载与安装替换，失败保留业务并可重试',async()=>{
  const f=await fixture(),calls=[];let installed=true,fail=true
  const manager={listBundles:async()=>installed?[{name:'@beellix-ai/quote',installed:true,enabled:true,removable:true,availability:'missing',source:'link:'+join(f.root,'old')}]:[],removeBundle:async name=>{calls.push(['remove',name]);installed=false;return{application:'applied'}},installBundle:async path=>{calls.push(['install',path]);if(fail)return{application:'failed',error:{message:'fixture failure'}};installed=true;return{application:'restart-required',changed:true}}}
  const applications=new CompanionApplications(f.root,manager)
  assert.equal((await applications.reconnect({})).items[0].application,'failed')
  assert.equal(await readFile(join(f.root,'data/keep.json'),'utf8'),'unchanged')
  fail=false;assert.equal((await applications.reconnect({})).items[0].application,'restart-required')
  assert.equal(calls.filter(x=>x[0]==='remove').length,1)
})
test('同一次自动接回串行合并，不重复原生安装',async()=>{
  const f=await fixture();let installs=0
  const manager={listBundles:async()=>[],installBundle:async()=>{installs++;await new Promise(resolve=>setTimeout(resolve,20));return{application:'applied'}}}
  const app=new CompanionApplications(f.root,manager)
  await Promise.all([app.reconnect({}),app.reconnect({})]);assert.equal(installs,1)
})
test('缺包时先恢复自有环境，恢复失败不撤销原生登记',async()=>{
  const f=await fixture();await rename(f.directory,f.directory+'-saved');let restores=0,installs=0
  const manager={listBundles:async()=>[],installBundle:async()=>{installs++;return{application:'applied'}}}
  const app=new CompanionApplications(f.root,manager,{restoreEnvironment:async()=>{restores++;await rename(f.directory+'-saved',f.directory)}})
  assert.equal((await app.reconnect({})).items[0].application,'applied');assert.equal(restores,1);assert.equal(installs,1)
  await rename(f.directory,f.directory+'-saved')
  const failed=new CompanionApplications(f.root,manager,{restoreEnvironment:async()=>{throw Error('offline archive missing')}})
  await assert.rejects(failed.reconnect({}),/offline archive missing/);assert.equal(installs,1)
})
test('依赖恢复使用宿主包管理器和隔离目录，禁止脚本，拒绝远程或环境外安装包',async()=>{
  const f=await fixture(),environment=join(f.root,'environment');await mkdir(join(environment,'packages'));await writeFile(join(environment,'packages/quote.tgz'),'fixture')
  await mkdir(join(f.root,'backups'));await mkdir(join(f.root,'cache'))
  const manifest={name:'@beellix-ai/local-environment',private:true,dependencies:{'@beellix-ai/quote':'file:packages/quote.tgz'}}
  await writeFile(join(environment,'package.json'),JSON.stringify(manifest))
  const calls=[],options={invocation:{command:'native-node',args:['native-pnpm.cjs'],env:{}},subprocess:{spawn:async request=>{calls.push(request);return{done:Promise.resolve({exitCode:0})}}}}
  await restoreCompanionEnvironment(f.root,options)
  assert.equal(calls[0].cwd,environment);assert(calls[0].argv.includes('--offline'));assert(calls[0].argv.includes('--ignore-scripts'));assert(calls[0].argv.includes('--ignore-pnpmfile'))
  manifest.dependencies['@beellix-ai/quote']='https://unknown/package.tgz';await writeFile(join(environment,'package.json'),JSON.stringify(manifest))
  await assert.rejects(restoreCompanionEnvironment(f.root,options),/本地安装包/);assert.equal(calls.length,1)
})
