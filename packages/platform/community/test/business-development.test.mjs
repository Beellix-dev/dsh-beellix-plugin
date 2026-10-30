import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile,mkdtemp,mkdir,writeFile} from 'node:fs/promises'
import {resolve,join} from 'node:path'
import {validateProject} from '../src/development/validate.mjs'
import {checkProject} from '../src/development/check.mjs'
const sample=JSON.parse(await readFile(new URL('../../../../standards/examples/creation/inventory.project.json',import.meta.url),'utf8'))
const project={...sample,plugin:{...sample.plugin,id:'contracts',name:'@beellix-ai/contracts'}}
const profile=JSON.parse(await readFile(new URL('../../../../standards/examples/creation/contracts.business.json',import.meta.url),'utf8'))
const manifest={name:project.plugin.name,version:'0.1.1',type:'module',license:'MIT',main:'./lib/host.mjs',files:['lib','cordis.patch.yml','beellix.business.json'],dsh:{engines:{dsh:'>=0.2.1-rc.2 <0.3.0'},bundle:{patch:'./cordis.patch.yml'}},beellixScenario:{id:'contracts'},beellixRequirements:{schemaVersion:1,capabilities:[{id:'database',contractVersion:1,features:[]}]},beellixContract:{schemaVersion:1,bridge:{min:1,max:1},contributes:['ui','tools'],execution:{basePreset:'standard',context:'bound-scene',subagents:'read-only'},data:{schemaVersion:1,uninstall:'retain'}},beellixBusiness:{schemaVersion:1,profile:'beellix.business.json'}}
test('业务扩展保持标准1.1.0兼容，声明检查不宣称业务已通过',()=>{
 const result=validateProject(project,manifest,profile);assert.equal(result.ok,true,JSON.stringify(result));assert.equal(result.ready,false)
 const legacy={...manifest};delete legacy.beellixBusiness;assert.equal(validateProject(project,legacy).ok,true)
})
test('复用同一引擎程序但独立持有场景数据库，不要求虚假的共库业务引用',()=>{
 const isolated={...profile,engine:{kind:'existing-provider',provider:'@beellix-ai/inventory',storage:'scene'},references:[]}
 const result=validateProject(project,manifest,isolated);assert.equal(result.ok,true,JSON.stringify(result));assert.equal(result.ready,false)
 const missingDb={...project,ecosystem:[]};assert.equal(validateProject(missingDb,manifest,isolated).ok,false)
 assert.equal(validateProject(project,manifest,{...isolated,engine:{kind:'native',storage:'scene'}}).ok,false)
})
test('业务检查拒绝重复数据归属、无人审核写入、假多人支持和未锁定上游',()=>{
 const cases=[
  [{...profile,deployment:'multi-user'},'BUSINESS_DEPLOYMENT'],
  [{...profile,resources:[{...profile.resources[0],id:'inventory.business'}]},'BUSINESS_OWNERSHIP'],
  [{...profile,resources:[{...profile.resources[0],review:undefined}]},'BUSINESS_WRITE'],
  [{...profile,verification:profile.verification.filter(v=>v!=='backup-restore')},'BUSINESS_VERIFICATION'],
  [{...profile,dataFeatures:['validated-input']},'BUSINESS_FEATURE'],
  [{...profile,engine:{kind:'embedded-upstream'}},'BUSINESS_ENGINE'],
  [{...profile,engine:{kind:'existing-provider',provider:'@beellix-ai/inventory'}},'BUSINESS_ENGINE'],
  [{...profile,references:[{...profile.references[0],provider:'@beellix-ai/inventory'}]},'BUSINESS_REFERENCE']
 ]
 for(const [p,code]of cases){const r=validateProject(project,manifest,p);assert.equal(r.ok,false);assert.ok(r.errors.some(e=>e.code===code),JSON.stringify(r))}
 assert.equal(validateProject(project,manifest).ok,false)
 const embedded={...profile,engine:{kind:'embedded-upstream',upstream:{repository:'https://github.com/odoo/odoo',revision:'d8e815359fc252fcae0156e148dec89972a2c3c9',license:'LGPL-3.0',notice:'UPSTREAM_LICENSES.txt',modules:['project']}}}
 assert.ok(validateProject(project,manifest,embedded).errors.some(e=>e.code==='BUSINESS_LICENSE'))
 assert.equal(validateProject(project,{...manifest,files:[...manifest.files,'UPSTREAM_LICENSES.txt']},embedded).ok,true)
})
test('工程文件检查读取并哈希实际业务描述，不运行工程脚本或创建业务库',async()=>{
 const root=await mkdtemp(resolve("./dev/artifacts/business-project-"));await mkdir(join(root,'lib'));await mkdir(join(root,'migrations'))
 for(const [name,value]of Object.entries({'beellix.project.json':JSON.stringify(project),'package.json':JSON.stringify(manifest),'beellix.business.json':JSON.stringify(profile),'lib/host.mjs':'throw Error("never run")','cordis.patch.yml':'[]'}))await writeFile(join(root,name),value)
 const first=await checkProject(root);assert.equal(first.ok,true,JSON.stringify(first));assert.equal(first.ready,false)
 await writeFile(join(root,'beellix.business.json'),JSON.stringify({...profile,deployment:'multi-user'}));assert.equal((await checkProject(root)).ok,false)
 await writeFile(join(root,'beellix.business.json'),JSON.stringify({...profile,references:[]}));assert.notEqual((await checkProject(root)).inputSha256,first.inputSha256)
})
