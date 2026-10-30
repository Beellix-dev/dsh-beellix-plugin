import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readFile,mkdtemp,writeFile,mkdir} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {validateProject,STANDARD_VERSION} from '../src/development/validate.mjs'
import {CreationRuntime} from '../src/creation-runtime.mjs'
const sample=JSON.parse(await readFile(new URL('../../../../standards/examples/creation/unit-converter.project.json',import.meta.url),'utf8'))
const manifest=()=>({name:sample.plugin.name,version:'0.1.1',type:'module',license:'MIT',files:['lib','cordis.patch.yml','README.md','LICENSE'],main:'./lib/host.mjs',dsh:{engines:{dsh:'>=0.2.1-rc.2 <0.3.0'},bundle:{patch:'./cordis.patch.yml'}},beellixCapability:{id:sample.plugin.id,category:'tools'},beellixContract:{schemaVersion:1,bridge:{min:1,max:1},contributes:['tools'],data:{schemaVersion:1,uninstall:'retain'}}})
const library={version:STANDARD_VERSION,skill:'开发前先查标准',references:{core:{title:'开发标准',sha256:'test-reference',text:'复用 DSH 原生执行；中台管理业务包。'}},capabilities:[]}

test('工程接受原生 engines.dsh，兼容读取旧字段且不改写旧清单',()=>{
 const old=manifest(),before=JSON.stringify(old)
 assert.equal(validateProject(sample,old).ok,true)
 assert.equal(JSON.stringify(old),before)
 const current=manifest();current.engines={dsh:current.dsh.engines.dsh};delete current.dsh.engines
 assert.equal(validateProject(sample,current).ok,true)
 for(const range of ['',null,42]){const invalid=manifest();invalid.engines={dsh:range};assert.ok(validateProject(sample,invalid).errors.some(row=>row.code==='DSH_CONTRACT'))}
})
test('standard accepts a valid tool; distinguishes static conformance from tested or installed',()=>{
 const result=validateProject(sample,manifest());assert.equal(result.ok,true);assert.equal(result.scope,'descriptor-and-manifest');assert.equal(result.ready,false)
})
test('schema and cross-field errors reject incomplete or mismatched packages',()=>{
 for(const [project,pkg,code] of [
  [{...sample,unknown:true},manifest(),'PROJECT_SCHEMA'],
  [sample,{...manifest(),name:'@beellix-ai/other'},'PACKAGE_IDENTITY'],
  [{...sample,ecosystem:[{id:'database',provider:'@beellix-ai/database',required:true,contract:{min:2,max:1},features:[]}]},manifest(),'DEPENDENCY_RANGE'],
  [{...sample,access:[{resource:'service:knowledge',mode:'read',purpose:'查询'}]},manifest(),'SERVICE_UNDECLARED'],
  [sample,{...manifest(),main:'../escape.mjs'},'PACKAGE_PATH'],
  [sample,{...manifest(),files:['lib','.env']},'PACKAGE_PRIVATE_FILES'],
  [sample,{...manifest(),beellixContract:undefined},'CONTRACT_REQUIRED'],
  [{...sample,plugin:{...sample.plugin,type:'ui'}},manifest(),'UI_IDENTITY_UNSUPPORTED'],
 ]){const result=validateProject(project,pkg);assert.equal(result.ok,false);assert.ok(result.errors.some(e=>e.code===code),code)}
})
function agent(preset='cordis',createdAt=Date.now()+10000){
 const calls={skills:new Map(),tools:new Map(),contexts:new Map(),disposed:0};const register=map=>v=>{map.set(v.name,v);return()=>{map.delete(v.name);calls.disposed++}}
 const ctx={get:name=>name==='agentPresets'?{composedPreset:()=>preset}:undefined,skills:{register:register(calls.skills)},tools:{register:register(calls.tools)},systemPrompt:{context:register(calls.contexts)}}
 return {id:'new-creation',session:{header:{createdAt}},ctx,calls,setPreset:v=>{preset=v}}
}
test('native cordis receives scoped standard, skill and tool; switching mode removes them',async()=>{
 const root=await mkdtemp(join(tmpdir(),'beellix-creation-'));const runtime=new CreationRuntime(root,{sceneBinding:async()=>undefined,library});const a=agent();
 assert.equal(await runtime.sync(a),true);assert.ok(a.calls.skills.has('beellix-plugin-development'));assert.ok(a.calls.skills.has('cordis-plugin-development'));assert.ok(a.calls.tools.has('beellix_develop'));assert.equal(a.calls.contexts.size,1)
 await runtime.sync(a);assert.equal(a.calls.skills.size,2)
 const tool=a.calls.tools.get('beellix_develop');const result=await tool.execute({action:'check',project:sample,manifest:manifest()},{agent:a,signal:new AbortController().signal});assert.equal(result.ok,true)
 const reference=await tool.execute({action:'read',reference:'core'},{agent:a,signal:new AbortController().signal});assert.ok(reference.sha256);assert.ok(reference.text.length<18000)
 const outsider=agent();await assert.rejects(tool.execute({action:'index'},{agent:outsider}),/CREATION_SCOPE_REQUIRED/)
 a.setPreset('standard');await assert.rejects(tool.execute({action:'index'},{agent:a}),/CREATION_SCOPE_REQUIRED/);assert.equal(await runtime.sync(a),false);assert.equal(a.calls.tools.size,0);assert.equal(a.calls.skills.size,0)
 await runtime.dispose()
})
test('ordinary, scene, old and parented sessions remain unchanged; restart retains cutoff',async()=>{
 const root=await mkdtemp(join(tmpdir(),'beellix-creation-'));let runtime=new CreationRuntime(root,{sceneBinding:async id=>id==='scene'?{}:undefined,library});
 const normal=agent('standard'),old=agent('cordis',1),scene=agent(),child=agent();scene.id='scene';child.session.header.parentSession='other';
 for(const a of [normal,old,scene,child]){const before=JSON.stringify(a.session.header);assert.equal(await runtime.sync(a),false);assert.equal(a.calls.tools.size,0);assert.equal(JSON.stringify(a.session.header),before)}
 const a=agent();assert.equal(await runtime.sync(a),true);await runtime.dispose();assert.equal(a.calls.tools.size,0)
 runtime=new CreationRuntime(root,{sceneBinding:async()=>undefined,library});assert.equal(await runtime.sync(a),true);await runtime.dispose()
})
test('database scene schema checks requirements without falsely claiming dependency or business readiness',async()=>{
 const project=JSON.parse(await readFile(new URL('../../../../standards/examples/creation/inventory.project.json',import.meta.url),'utf8'))
 const pkg={...manifest(),name:project.plugin.name,beellixCapability:undefined,beellixScenario:{id:project.plugin.id,title:project.plugin.title,tabKind:'inventory'},beellixRequirements:{schemaVersion:1,capabilities:[{id:'database',contractVersion:1,features:[]}]},beellixContract:{...manifest().beellixContract,execution:{basePreset:'standard',context:'bound-scene',subagents:'read-only'}}}
 const result=validateProject(project,pkg);assert.equal(result.ok,true,JSON.stringify(result));assert.equal(result.ready,false);assert.ok(result.remaining.includes('dependency-readiness'))
 project.ecosystem=project.ecosystem.filter(row=>row.id!=='database');assert.equal(validateProject(project,pkg).ok,false)
})
test('in-flight reads recheck mode and cancellation, activation rejects corruption and preserves existing data',async()=>{
 const root=await mkdtemp(join(tmpdir(),'beellix-creation-'));await mkdir(join(root,'files'));await writeFile(join(root,'files','original.txt'),'original-business-data')
 let release;const runtime=new CreationRuntime(root,{library,capabilities:()=>new Promise(r=>{release=r})}),a=agent();await runtime.sync(a)
 const tool=a.calls.tools.get('beellix_develop'),signal=new AbortController().signal,call=tool.execute({action:'index'},{agent:a,signal});while(!release)await new Promise(r=>setImmediate(r));a.setPreset('standard');release([]);await assert.rejects(call,/CREATION_SCOPE_REQUIRED/)
 const abort=new AbortController();abort.abort();await assert.rejects(tool.execute({action:'index'},{agent:a,signal:abort.signal}),/abort/i)
 await runtime.dispose();await writeFile(join(root,'data/control-plane/creation/activation.json'),'{}');const retry=new CreationRuntime(root,{library});await assert.rejects(retry.sync(agent()),/CREATION_ACTIVATION_INVALID/);await retry.dispose()
 assert.equal(await readFile(join(root,'files/original.txt'),'utf8'),'original-business-data')
})
