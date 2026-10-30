import {readFile,mkdir,writeFile} from 'node:fs/promises'
import {join,resolve} from 'node:path'
import {createHash} from 'node:crypto'
import {build} from 'tsdown'
import {STANDARD_VERSION} from '../src/development/validate.mjs'
const workspace=resolve(import.meta.dirname,'../../../..'),source=join(workspace,'packages/platform/community/src')
const references={
 core:['开发标准','standards/plugin-development-standard.md'],
 package:['运行包契约','standards/plugin-contract.md'],
 project:['工程描述协议','standards/creation-project-contract.md'],
 schema:['工程 JSON Schema','standards/schemas/beellix-project-v1.schema.json'],
 database:['数据库 SDK 与保护边界','standards/database-plugin-sdk.md'],
 ui:['公共能力与页面接入','standards/capability-sdk.md'],
 installation:['中台加载与分类','standards/managed-package-loading.md'],
 acceptance:['验收门禁','docs/creation-mode-acceptance.md'],
 models:['模型声明与配置','standards/model-center.md'],
 knowledge:['会话知识与业务边界','standards/conversation-knowledge-contract.md'],
 updates:['发布与更新服务','standards/public-plugin-distribution.md'],
 design:['界面规范',"docs/design.md"],
 evolution:['标准演进与兼容','standards/plugin-standard-evolution.md'],
 ecosystem:['公众生态适配与准入','standards/ecosystem-conformance.md'],
 coCreation:['共创生态与交付规则','docs/ecosystem-model.md'],
 coCreationContract:['共创对象与阶段验收清单（设计）','docs/ecosystem-model.json'],
 task:['统一开发任务与验收','standards/plugin-development-task.md'],
 interop:['跨插件互通与授权','standards/cross-plugin-integration.md'],
 permissions:['本机主用户与数据访问','docs/personal-data-permissions.md'],
 business:['企业业务模块与复用边界','standards/business-modules.md'],
 businessSchema:['业务模块扩展 JSON Schema','standards/schemas/beellix-business-v1.schema.json'],
 businessExample:['合同模块描述示例（未实现）','standards/examples/creation/contracts.business.json'],
 exampleTool:['无数据库工具描述','standards/examples/creation/unit-converter.project.json'],
 exampleScene:['数据库场景描述','standards/examples/creation/inventory.project.json'],
}
export async function buildDevelopment(outDir){
 await mkdir(join(outDir,'development'),{recursive:true})
 const library={version:STANDARD_VERSION,references:{},skill:await readFile(join(source,'development/SKILL.md'),'utf8'),capabilities:[{id:'database',provider:'@beellix-ai/database',contract:1,status:'implemented separately; inspect installed/enabled/initialized state',features:['capability-registration','worker-connections','backup-barrier','vector-extension']},{id:'knowledge',provider:'@beellix-ai/knowledge',contract:1,status:'implemented separately; inspect installed/enabled/initialized state',features:['source-citations','scoped-query','wiki','graph']},{id:'data-platform',provider:'@beellix-ai/data-platform',status:'planned; not delivered by this standard'}]}
 for(const [id,[title,path]] of Object.entries(references)){const text=await readFile(join(workspace,path),'utf8');library.references[id]={title,text,sha256:createHash('sha256').update(text).digest('hex')}}
 await writeFile(join(outDir,'development/standard.json'),JSON.stringify(library,null,2)+'\n')
 await build({config:false,entry:{'creation-runtime':join(source,'creation-runtime.mjs'),'development/check':join(source,'development/check.mjs')},outDir,format:'esm',platform:'node',target:'node22',dts:false,clean:false,deps:{alwaysBundle:['ajv','fast-uri','fast-deep-equal','json-schema-traverse'],onlyBundle:false}})
 const ajv=JSON.parse(await readFile(join(workspace,'node_modules/ajv/package.json'),'utf8'))
 const notices=[]
 for(const name of ['ajv','fast-uri','fast-deep-equal','json-schema-traverse','clsx','zustand','immer']){const pkg=JSON.parse(await readFile(join(workspace,'node_modules',name,'package.json'),'utf8'));const license=await readFile(join(workspace,'node_modules',name,name==='clsx'?'license':'LICENSE'),'utf8');notices.push(name+' '+pkg.version+' ('+pkg.license+')\n\n'+license)}
 await writeFile(join(outDir,'development/THIRD_PARTY_LICENSES.txt'),notices.join('\n\n---\n\n'))
 return {standardVersion:library.version,ajv:ajv.version,references:Object.fromEntries(Object.entries(library.references).map(([id,row])=>[id,row.sha256]))}
}
