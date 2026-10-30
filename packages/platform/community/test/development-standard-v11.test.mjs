import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile,mkdir,mkdtemp,writeFile} from 'node:fs/promises'
import {resolve,join} from 'node:path'
import {createHash} from 'node:crypto'
import {validateProject,STANDARD_VERSION} from '../src/development/validate.mjs'
import {CreationRuntime} from '../src/creation-runtime.mjs'
import {buildDevelopment} from '../scripts/development-build.mjs'

const base=resolve("./dev/artifacts/creation-standard-1.1.0"),readExample=async name=>JSON.parse(await readFile(new URL('../../../../standards/examples/creation/'+name+'.project.json',import.meta.url),'utf8'))
const manifest=project=>({name:project.plugin.name,version:'0.1.1',type:'module',license:'MIT',main:'lib/host.mjs',files:['lib','cordis.patch.yml','README.md','LICENSE'],dsh:{engines:{dsh:'>=0.2.1-rc.2 <0.3.0'},bundle:{patch:'cordis.patch.yml'}},...project.plugin.type==='scene'?{beellixScenario:{id:project.plugin.id}}:{beellixCapability:{id:project.plugin.id,category:'tools'}},beellixContract:{schemaVersion:1,bridge:{min:1,max:1},contributes:['tools'],data:{schemaVersion:1,uninstall:'retain'},...project.plugin.type==='scene'?{execution:{basePreset:'standard',context:'bound-scene',subagents:'read-only'}}:{}}})

test('标准1.1.0接受新工程并兼容1.0.0描述，不改工程或插件版本',async()=>{
 assert.equal(STANDARD_VERSION,'1.1.0');const example=await readExample('unit-converter')
 for(const value of ['1.0.0','1.1.0']){const project={...example,standardVersion:value},pkg=manifest(project),before=JSON.stringify([project,pkg]),result=validateProject(project,pkg);assert.equal(result.ok,true,JSON.stringify(result));assert.equal(result.ready,false);assert.equal(result.standardVersion,'1.1.0');assert.equal(JSON.stringify([project,pkg]),before);assert.equal(pkg.version,'0.1.1')}
 assert.equal(validateProject({...example,standardVersion:'2.0.0'},manifest(example)).ok,false)
})

test('新标准要求必需能力落入运行声明并核对契约和features，旧描述兼容',async()=>{
 const project={...await readExample('inventory'),standardVersion:'1.1.0'},pkg=manifest(project);project.ecosystem[0].features=['backup-barrier']
 let result=validateProject(project,pkg);assert.equal(result.ok,false);assert.ok(result.errors.some(row=>row.code==='RUNTIME_DEPENDENCY'))
 pkg.beellixRequirements={schemaVersion:1,capabilities:[{id:'database',contractVersion:1,features:['backup-barrier']}]};assert.equal(validateProject(project,pkg).ok,true)
 pkg.beellixRequirements.capabilities[0].features=[];assert.ok(validateProject(project,pkg).errors.some(row=>row.code==='RUNTIME_DEPENDENCY'))
 pkg.beellixRequirements.capabilities[0].features=['backup-barrier'];pkg.beellixRequirements.capabilities[0].contractVersion=2;assert.ok(validateProject(project,pkg).errors.some(row=>row.code==='RUNTIME_DEPENDENCY'))
 delete pkg.beellixRequirements;assert.equal(validateProject({...project,standardVersion:'1.0.0'},pkg).ok,true,'不把新增规则强加给旧描述')
})

test('parse等专用操作不能假用主聊天模型，聊天整理仍可沿用主模型',async()=>{
 const project={...await readExample('unit-converter'),standardVersion:'1.1.0'},pkg=manifest(project)
 pkg.beellixModels={schemaVersion:1,purposes:[{id:'parser',title:'文档解析',kind:'document',operation:'parse',required:false,default:'host-main'}]}
 assert.ok(validateProject(project,pkg).errors.some(row=>row.code==='MODEL_DEFAULT'))
 delete pkg.beellixModels.purposes[0].default;assert.equal(validateProject(project,pkg).ok,true)
 pkg.beellixModels.purposes[0]={id:'organize',title:'整理',kind:'other',operation:'chat',required:true,default:'host-main'};assert.equal(validateProject(project,pkg).ok,true)
 pkg.beellixModels.purposes[0]={...pkg.beellixModels.purposes[0],id:'x'.repeat(50000),operation:'parse'};assert.ok(JSON.stringify(validateProject(project,pkg)).length<5000,'错误信息不能原样回显超长用途ID')
})

test('升级标准保留旧启用记录与时间边界，不重写旧会话或资料',async()=>{
 await mkdir(base,{recursive:true});const root=await mkdtemp(join(base,'activation-')),file=join(root,'data/control-plane/creation/activation.json');await mkdir(join(root,'data/control-plane/creation'),{recursive:true})
 const previous=JSON.stringify({schemaVersion:1,standardVersion:'1.0.0',enabledAt:1000});await writeFile(file,previous);const runtime=new CreationRuntime(root)
 assert.equal((await runtime.activation()).enabledAt,1000);assert.equal(await readFile(file,'utf8'),previous)
 for(const createdAt of [999,1001]){const agent={id:'fixture-'+createdAt,session:{header:{createdAt}},ctx:{get:()=>({composedPreset:()=> 'cordis'})}},before=JSON.stringify(agent.session.header);assert.equal(await runtime.eligible(agent),createdAt>1000);assert.equal(JSON.stringify(agent.session.header),before)}
 await runtime.dispose();await writeFile(file,JSON.stringify({schemaVersion:1,standardVersion:'2.0.0',enabledAt:1000}));await assert.rejects(new CreationRuntime(root).activation(),/CREATION_ACTIVATION_INVALID/)
})

test('随包标准快照、Skill、检查器和按需参考同步到1.1.0，知识能力不误写成未实现',async()=>{
 await mkdir(base,{recursive:true});const out=await mkdtemp(join(base,'snapshot-'));await buildDevelopment(out);const library=JSON.parse(await readFile(join(out,'development/standard.json'),'utf8'))
 assert.equal(library.version,'1.1.0');assert.match(library.skill,/标准版本1\.1\.0/)
 for(const key of ['core','models','knowledge','updates','design','evolution','ecosystem','coCreation','coCreationContract','task','interop','business','businessSchema','businessExample'])assert.ok(library.references[key],key)
 for(const row of Object.values(library.references))assert.equal(createHash('sha256').update(row.text).digest('hex'),row.sha256)
 for(const [key,file] of [['ecosystem','ecosystem-conformance.md'],['coCreation','ecosystem-model.md'],['coCreationContract','ecosystem-model.json'],['task','plugin-development-task.md'],['interop','cross-plugin-integration.md'],['business','business-modules.md']])assert.equal(library.references[key].text,await readFile(new URL('../../../../'+(key.startsWith('coCreation')?'docs/':'standards/')+file,import.meta.url),'utf8'),'Codex文档与DSH随包参考必须同源')
 assert.match(library.skill,/ecosystem\/task/);assert.match(library.references.task.text,/没有自动调度服务|不是自动调度服务/)
 assert.match(library.skill,/coCreation/);assert.equal(JSON.parse(library.references.coCreationContract.text).operatingModel,'co-creation-first')
 assert.equal(library.capabilities.find(row=>row.id==='knowledge').status.startsWith('planned'),false);assert.match(library.capabilities.find(row=>row.id==='data-platform').status,/planned/)
 assert.equal(JSON.parse(library.references.exampleTool.text).standardVersion,'1.1.0')
})
