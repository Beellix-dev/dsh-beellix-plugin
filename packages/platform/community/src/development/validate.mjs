/** Pure, bounded static checks. Never imports or executes project code. */
import Ajv from 'ajv/dist/2020.js'
import schema from '../../../../../standards/schemas/beellix-project-v1.schema.json' with {type:'json'}
import {packageContract} from "../../../../../dev/shared/runtime/package-contract.mjs"
import {validateBusiness} from './business.mjs'
const ajv=new Ajv({strict:false,allErrors:true})
ajv.addFormat('uuid',/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
const checkSchema=ajv.compile(schema)
export const STANDARD_VERSION='1.1.0'
export const SUPPORTED_STANDARD_VERSIONS=Object.freeze([...schema.properties.standardVersion.enum])
const privatePath=/(^|\/)(?:\.env(?:\..*)?|\.git|node_modules|\.npmrc|\.pnpmfile\.cjs|credentials?|backups?|profiles?)(\/|$)|\.(?:pem|key|pfx|sqlite|db|bxbak)$/i
export function packagePath(value){
 if(typeof value!=='string'||value.length>200)return false
 const clean=value.replace(/^\.\//,'')
 return /^[A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)*$/.test(clean)&&clean.split('/').every(part=>part!=='.'&&part!=='..'&&!part.endsWith('.'))
}
export function validateProject(project,manifest,business){
 const errors=[];const add=(code,path,message)=>{if(errors.length<40)errors.push({code,path,message})}
 if(JSON.stringify([project,manifest,business]).length>131072)return {ok:false,ready:false,scope:'descriptor-and-manifest',standardVersion:STANDARD_VERSION,errors:[{code:'INPUT_LIMIT',path:'/',message:'检查输入超过128 KiB'}]}
 if(!checkSchema(project))for(const error of checkSchema.errors??[])add('PROJECT_SCHEMA',error.instancePath||'/',error.keyword+': '+error.message)
 if(errors.length)return {ok:false,ready:false,scope:'descriptor-and-manifest',standardVersion:STANDARD_VERSION,errors}
 if(!manifest||typeof manifest!=='object'||Array.isArray(manifest))add('PACKAGE_REQUIRED','/package.json','缺少包清单')
 else{
  if(manifest.name!==project.plugin.name)add('PACKAGE_IDENTITY','/name','包名与工程不一致')
  if(!/^\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?$/.test(manifest.version??''))add('PACKAGE_VERSION','/version','需要明确包版本')
  if(manifest.type!=='module')add('PACKAGE_MODULE','/type','本标准使用 ESM 宿主入口')
  if(!manifest.license)add('PACKAGE_LICENSE','/license','明确 MIT 或授权文件，不默认给收费包使用 MIT')
  if(!manifest.beellixContract)add('CONTRACT_REQUIRED','/beellixContract','新包必须声明桥接和保留数据契约')
  else try{packageContract(manifest)}catch{add('CONTRACT_INVALID','/beellixContract','桥接、贡献或数据契约无效')}
  // Existing descriptors remain readable; current DSH consumes only top-level engines.dsh.
  const engineRange=Object.hasOwn(manifest.engines??{},'dsh')?manifest.engines.dsh:manifest.dsh?.engines?.dsh
  if(typeof engineRange!=='string'||!engineRange.trim()||!manifest.dsh?.bundle?.patch)add('DSH_CONTRACT','/dsh','声明 engines.dsh 和 dsh.bundle.patch；旧字段仅兼容读取')
  const kind=project.plugin.type,scene=manifest.beellixScenario,cap=manifest.beellixCapability
  if(kind==='ui')add('UI_IDENTITY_UNSUPPORTED','/plugin/type','独立 UI 商品的中台运行身份尚未定义；不能冒用入口包')
  else if(kind==='scene'){
   if(scene?.id!==project.plugin.id||cap)add('RUNTIME_IDENTITY','/beellixScenario','场景 ID 必须匹配且不混入能力身份')
  }else if(cap?.id!==project.plugin.id||scene||kind==='tool'&&cap?.category!=='tools'||kind==='skill'&&cap?.category!=='skills')add('RUNTIME_IDENTITY','/beellixCapability','能力 ID 与主要资源类型必须匹配')
  if(project.storage.kind!=='none'&&manifest.beellixContract?.data?.schemaVersion!==project.storage.schemaVersion)add('DATA_VERSION','/beellixContract/data/schemaVersion','工程与运行数据代次不一致')
  if(!Array.isArray(manifest.files)||!manifest.files.length)add('PACKAGE_FILES','/files','必须使用打包文件白名单')
  const files=Array.isArray(manifest.files)?manifest.files:[]
  const paths=[manifest.main,manifest.dsh?.bundle?.patch,...files].filter(v=>v!==undefined)
  const seen=new Map()
  for(const value of paths){
   if(!packagePath(value))add('PACKAGE_PATH','/package.json','包路径必须为工程内相对路径：'+String(value).slice(0,100))
   else{const normalized=value.replace(/^\.\//,'');if(privatePath.test(normalized))add('PACKAGE_PRIVATE_FILES','/files','禁止打包凭据、缓存或业务资料');const key=normalized.toLowerCase();if(seen.has(key)&&seen.get(key)!==normalized)add('PATH_CASE_COLLISION','/files','拒绝大小写路径别名');seen.set(key,normalized)}
  }
  if(!manifest.main)add('PACKAGE_ENTRY','/main','声明宿主入口')
  for(const entry of [manifest.main,manifest.dsh?.bundle?.patch].filter(value=>typeof value==='string'))if(!files.some(file=>typeof file==='string'&&(entry.replace(/^\.\//,'')===file.replace(/^\.\//,'')||entry.replace(/^\.\//,'').startsWith(file.replace(/^\.\//,'')+'/'))))add('ENTRY_NOT_PACKAGED','/files','入口必须包含在打包白名单中')
  const category=manifest.beellix?.catalog?.category
  if(category&&(!/^[a-z][a-z0-9-]{0,47}$/.test(category.id??'')||category.id==='all'||typeof category.label!=='string'||!category.label.trim()||category.label.length>24))add('CATALOG_CATEGORY','/beellix/catalog/category','包分类 ID 或名称不合法')
  if(project.standardVersion==='1.1.0'){
   const requirements=manifest.beellixRequirements?.capabilities
   for(const dependency of project.ecosystem.filter(row=>row.required)){
    const runtime=Array.isArray(requirements)?requirements.find(row=>row?.id===dependency.id):undefined
    if(!runtime||runtime.contractVersion<dependency.contract.min||runtime.contractVersion>dependency.contract.max||!Array.isArray(runtime.features)||dependency.features.some(feature=>!runtime.features.includes(feature)))add('RUNTIME_DEPENDENCY','/beellixRequirements','必需能力须在运行清单声明兼容契约及所需features：'+dependency.id)
   }
   for(const purpose of Array.isArray(manifest.beellixModels?.purposes)?manifest.beellixModels.purposes:[])if(purpose?.operation!=='chat'&&purpose?.default==='host-main')add('MODEL_DEFAULT','/beellixModels/purposes','非聊天用途不能沿用主聊天模型')
  }
 }
 const dependencies=new Map()
 for(const row of project.ecosystem){
  if(dependencies.has(row.id))add('DEPENDENCY_DUPLICATE','/ecosystem','生态能力 ID 重复')
  dependencies.set(row.id,row)
  if(row.contract.min>row.contract.max)add('DEPENDENCY_RANGE','/ecosystem','契约区间 min 必须小于或等于 max')
  if(['database','knowledge'].includes(row.id)&&row.provider!=='@beellix-ai/'+row.id)add('DEPENDENCY_PROVIDER','/ecosystem','公共能力提供包不匹配')
 }
 const resources=new Set()
 for(const access of project.access){
  if(resources.has(access.resource))add('ACCESS_DUPLICATE','/access','同一资源应合并访问声明')
  resources.add(access.resource)
  if(access.resource.startsWith('service:')&&!dependencies.has(access.resource.slice(8)))add('SERVICE_UNDECLARED','/access','服务访问必须声明对应生态依赖')
 }
 validateBusiness(project,manifest,business,add)
 return {ok:errors.length===0,ready:false,scope:'descriptor-and-manifest',standardVersion:STANDARD_VERSION,errors,remaining:['files-and-artifact','dependency-readiness','build-and-behavior','isolated-native-load','actual-adoption']}
}
