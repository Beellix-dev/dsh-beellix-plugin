import test from 'node:test'
import assert from 'node:assert/strict'
import {gzipSync} from 'node:zlib'
import {createHash} from 'node:crypto'

const name='@beellix-ai/knowledge',version='1.2.3'
const manifest={name,version,dsh:{bundle:{patch:'cordis.patch.yml'}},beellixCapability:{id:'knowledge'},beellix:{displayName:{zh:'知识库'}}}
function archive(value){const bytes=Buffer.from(JSON.stringify(value)),header=Buffer.alloc(512);header.write('package/package.json');header.write(bytes.length.toString(8).padStart(11,'0'),124);header[156]=48;return gzipSync(Buffer.concat([header,bytes,Buffer.alloc((512-bytes.length%512)%512),Buffer.alloc(1024)]))}
async function fixture(options={}){
 const {RegistryPackages}=await import("../../../../dev/shared/runtime/registry-packages.mjs"),bytes=archive(manifest),calls=[]
 const addons={owned:async()=>[],importArchive:async value=>{calls.push(['import',createHash('sha256').update(value).digest('hex')]);return{id:'knowledge',name,version}},install:async(...input)=>{calls.push(['install',...input]);return{application:'applied'}}}
 const dist={tarball:'https://registry.npmjs.org/@beellix-ai/knowledge/-/knowledge-1.2.3.tgz',integrity:'sha512-'+createHash('sha512').update(bytes).digest('base64')}
 const fetch=async(url,config)=>{calls.push(['fetch',String(url)]);assert.equal(config.redirect,'error');return String(url).endsWith('.tgz')?new Response(options.corrupt?Buffer.from('corrupt'):bytes):new Response(JSON.stringify({...manifest,dist:{...dist,...options.dist}}),{status:options.status??200})}
 return{registry:new RegistryPackages(addons,{fetch}),calls,bytes}
}

test('npm/pnpm 包名或链接解析具体版本；确认前不修改目录，确认后仍走自有安装器',async()=>{
 const {registry,calls,bytes}=await fixture(),digest=createHash('sha256').update(bytes).digest('hex')
 for(const source of [name,'npm:'+name+'@'+version,'npm install '+name+'@'+version,'pnpm add '+name,'https://www.npmjs.com/package/@beellix-ai/knowledge/v/1.2.3']){
  const preview=await registry.preview({source,expectedName:name});assert.equal(preview.version,version);assert.equal(preview.digest,digest);assert.equal(preview.name,name)
 }
 assert.equal(calls.some(row=>['import','install'].includes(row[0])),false)
 const result=await registry.install({name,version,digest});assert.equal(result.application,'applied')
 assert.deepEqual(calls.filter(row=>row[0]==='install'),[['install',{id:'knowledge',digest},{allowNetwork:true}]])
})
test('拒绝任意命令、跨包替换、非官方下载、摘要变化，保留原安装环境',async()=>{
 const {registry,calls}=await fixture()
 for(const source of ['pnpm add @beellix-ai/knowledge && whoami','npm install --global @beellix-ai/knowledge','https://127.0.0.1/package/@beellix-ai/knowledge','other-package','@beellix-ai/knowledge@*'])await assert.rejects(registry.preview({source}),/ADDON_SOURCE_INVALID/)
 await assert.rejects(registry.preview({source:name,expectedName:'@beellix-ai/data-platform'}),/ADDON_SOURCE_MISMATCH/)
 await assert.rejects(registry.install({name,version,digest:'0'.repeat(64)}),/ADDON_PACKAGE_CHANGED/)
 const unsafe=await fixture({dist:{tarball:'http://127.0.0.1/private'}});await assert.rejects(unsafe.registry.preview({source:name}),/ADDON_SOURCE_INVALID/)
 const changed=await fixture({corrupt:true});await assert.rejects(changed.registry.preview({source:name}),/ADDON_SOURCE_INTEGRITY/)
 assert.equal(calls.some(row=>['import','install'].includes(row[0])),false)
})
test('未发布、下载中断和超限如实失败，已安装版本进入确认信息',async()=>{
 const missing=await fixture({status:404});await assert.rejects(missing.registry.preview({source:name}),/ADDON_SOURCE_NOT_FOUND/)
 const {RegistryPackages}=await import("../../../../dev/shared/runtime/registry-packages.mjs")
 const oversized=new RegistryPackages({},{fetch:async()=>new Response('x',{headers:{'content-length':String(65*1024*1024)}})});await assert.rejects(oversized.preview({source:name}),/REQUEST_TOO_LARGE/)
 const broken=new RegistryPackages({},{fetch:async()=>{throw Error('network unavailable')}});await assert.rejects(broken.preview({source:name}),/ADDON_SOURCE_UNAVAILABLE/)
 const fixtureValue=await fixture();fixtureValue.registry.addons.owned=async()=>[{name,version:'1.0.0'}];assert.equal((await fixtureValue.registry.preview({source:name})).expectedVersion,'1.0.0')
 const before=fixtureValue.calls.length;await assert.rejects(fixtureValue.registry.install({name,version,digest:'a'.repeat(64)}),/ADDON_PACKAGE_CHANGED/);assert.equal(fixtureValue.calls.length,before)
})
