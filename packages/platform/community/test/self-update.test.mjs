import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,writeFile,mkdir,rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {createHash} from 'node:crypto'
import {PassThrough} from 'node:stream'
import {SelfUpdate,githubBytes} from '../src/self-update.mjs'
const name='@beellix-ai/dsh-beellix-plugin',commit='a'.repeat(40),blob=data=>createHash('sha1').update(`blob ${Buffer.byteLength(data)}\0`).update(data).digest('hex')
async function fixture(t){
 const dir=await mkdtemp(join(tmpdir(),'beellix-self-update-'));t.after(()=>rm(dir,{recursive:true}))
 const manifest=JSON.stringify({name,version:'0.1.1',engines:{dsh:'>=0.2.1-rc.2 <0.3.0'},dsh:{bundle:{patch:'./cordis.patch.yml'}}})
 const files={'package.json':manifest,'cordis.patch.yml':'[]','lib/host.mjs':'export const newer=true','lib/client.js':'new client'}
 await mkdir(join(dir,'lib'));for(const [path,data]of Object.entries(files))await writeFile(join(dir,path),path==='lib/client.js'?'old client':data)
 const calls=[],runner={runPlugin(args,cwd){calls.push({args,cwd});return{stdout:new PassThrough(),stderr:new PassThrough(),done:Promise.resolve().then(async()=>{await writeFile(join(dir,'lib/client.js'),files['lib/client.js']);return{exitCode:0}})}}}
 const manager={listBundles:async()=>[{name,version:'0.1.1',installed:true,enabled:true,source:'github:Beellix-dev/dsh-beellix-plugin'}]},request=async url=>Buffer.from(url.endsWith('/commits/main')?JSON.stringify({sha:commit}):url.includes('/git/trees/')?JSON.stringify({truncated:false,tree:Object.entries(files).map(([path,data])=>({path,type:'blob',sha:blob(data)}))}):files[url.split('/'+commit+'/')[1]])
 const service=new SelfUpdate({manager,runner,installedDirectory:()=>dir,request,validateManifest:()=>{},restart:async()=>{calls.push('restart')}})
 return{service,calls,runner,manager,dir,files,request}
}
test('同版本内容更新通过原生 CLI 原位更新，不卸载，不接受客户端自报来源；更新后需重启',async t=>{
 const {service,calls}=await fixture(t)
 assert.equal((await service.snapshot()).status,'unchecked')
 assert.equal((await service.check({})).status,'available')
 await assert.rejects(service.install({commit,source:'evil'}),/SELF_UPDATE_REQUEST/)
 const result=await service.install({commit});assert.equal(result.status,'restart-required')
 assert.deepEqual(calls[0].args,['add',name+'@github:Beellix-dev/dsh-beellix-plugin#'+commit]);assert.equal(calls.length,1)
 await service.restart({});assert.equal(calls[1],'restart')
})
test('最新内容不重复安装；网络失败保留重试；外部安装来源拒绝改写',async t=>{
 const f=await fixture(t);await writeFile(join(f.dir,'lib/client.js'),f.files['lib/client.js']);assert.equal((await f.service.check({})).status,'current');assert.equal(f.calls.length,0)
 f.manager.listBundles=async()=>[{name,installed:true,source:'github:someone/else'}];await assert.rejects(f.service.check({}),/SELF_UPDATE_SOURCE/)
 const broken=new SelfUpdate({manager:{listBundles:async()=>[{name,installed:true,source:'github:Beellix-dev/dsh-beellix-plugin'}]},runner:f.runner,installedDirectory:()=>f.dir,request:async()=>{throw Error('secret-network-details')}})
 await assert.rejects(broken.check({}),/SELF_UPDATE_NETWORK/);assert.equal((await broken.snapshot()).status,'failed');assert.equal(f.calls.length,0)
})
test('检查与安装之间来源变化、过期确认、并发点击、失败后不重启',async t=>{
 const f=await fixture(t);await f.service.check({});await assert.rejects(f.service.install({commit:'b'.repeat(40)}),/SELF_UPDATE_CHANGED/)
 const saved=f.manager.listBundles;f.manager.listBundles=async()=>[{name,installed:true,source:'github:other/repo'}];await assert.rejects(f.service.install({commit}),/SELF_UPDATE_SOURCE/);f.manager.listBundles=saved
 let end;f.runner.runPlugin=()=>({stdout:new PassThrough(),stderr:new PassThrough(),done:new Promise(r=>{end=r})})
 const pending=f.service.install({commit});while(!end)await new Promise(r=>setImmediate(r))
 await assert.rejects(f.service.install({commit}),/SELF_UPDATE_BUSY/);await assert.rejects(f.service.restart({}),/SELF_UPDATE_REQUEST/)
 end({exitCode:1});await assert.rejects(pending,/SELF_UPDATE_INSTALL/);assert.equal((await f.service.snapshot()).status,'failed');assert.equal(f.calls.length,0)
})
test('文件树、包身份与内容校验失败时不执行安装，安装后字节不匹配不报成功',async t=>{
 const f=await fixture(t)
 const invalid=new SelfUpdate({manager:f.manager,runner:f.runner,installedDirectory:()=>f.dir,request:async url=>url.includes('/git/trees/')?Buffer.from(JSON.stringify({truncated:true,tree:[]})):f.request(url)})
 await assert.rejects(invalid.check({}),/SELF_UPDATE_RELEASE/);assert.equal(f.calls.length,0)
 await f.service.check({});f.runner.runPlugin=()=>({stdout:new PassThrough(),stderr:new PassThrough(),done:Promise.resolve({exitCode:0})})
 await assert.rejects(f.service.install({commit}),/SELF_UPDATE_VERIFY/);await assert.rejects(f.service.restart({}),/SELF_UPDATE_REQUEST/)
})
test('仅联网固定官方仓库，拒绝跳转、额外地址与超限响应',async()=>{
 let calls=0;const fetcher=async(url,options)=>{calls++;assert.equal(options.redirect,'error');assert.equal(options.credentials,'omit');return new Response('12345')}
 await assert.rejects(githubBytes('https://127.0.0.1/internal',{maxBytes:10,fetcher}),/SELF_UPDATE_RELEASE/)
 await assert.rejects(githubBytes('https://api.github.com/repos/other/repo/commits/main',{maxBytes:10,fetcher}),/SELF_UPDATE_RELEASE/)
 assert.equal(calls,0)
 await assert.rejects(githubBytes('https://api.github.com/repos/Beellix-dev/dsh-beellix-plugin/commits/main',{maxBytes:4,fetcher}),/SELF_UPDATE_RELEASE/)
 assert.equal(calls,1)
})
test('阻止降级、过期确认及已停用中台的更新；正常较新版本可检查',async t=>{
 const f=await fixture(t)
 f.manager.listBundles=async()=>[{name,version:'0.1.2',installed:true,enabled:true,source:'github:Beellix-dev/dsh-beellix-plugin'}]
 await assert.rejects(f.service.check({}),/SELF_UPDATE_RELEASE/)
 f.manager.listBundles=async()=>[{name,version:'0.1.0',installed:true,enabled:true,source:'github:Beellix-dev/dsh-beellix-plugin'}]
 assert.equal((await f.service.check({})).status,'available')
 f.service.now=()=>Date.now()+11*60*1000;await assert.rejects(f.service.install({commit}),/SELF_UPDATE_CHANGED/)
 f.manager.listBundles=async()=>[{name,version:'0.1.1',installed:true,enabled:false,source:'github:Beellix-dev/dsh-beellix-plugin'}]
 await assert.rejects(f.service.check({}),/SELF_UPDATE_DISABLED/);assert.equal(f.calls.length,0)
})
