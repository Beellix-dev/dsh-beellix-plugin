/** Optional descriptor checks, never a claim of business or multi-user readiness. */
import Ajv from 'ajv/dist/2020.js'
import schema from '../../../../../standards/schemas/beellix-business-v1.schema.json' with {type:'json'}
const validate=new Ajv({strict:false,allErrors:true}).compile(schema)
export function validateBusiness(project,manifest,profile,add){
 const declaration=manifest?.beellixBusiness
 if(!declaration&&profile===undefined)return
 const error=(code,message)=>add('BUSINESS_'+code,'/beellixBusiness',message)
 if(!declaration||Object.keys(declaration).some(k=>!['schemaVersion','profile'].includes(k))||declaration.schemaVersion!==1||declaration.profile!=='beellix.business.json'){error('DECLARATION','业务扩展v1必须显式声明 beellix.business.json');return}
 if(!manifest.files?.includes(declaration.profile))error('PACKAGE','业务描述必须进入打包白名单')
 if(!validate(profile)){error('SCHEMA','业务描述缺失或不符合v1 Schema');return}
 if(profile.moduleId!==project.plugin.id)error('IDENTITY','业务模块ID与工程不一致')
 if(profile.deployment!=='local-owner')error('DEPLOYMENT','当前只有本机主用户；多人企业身份与权限尚未交付，不能声明支持')
 const ids=new Set(),checks=new Set(['input-validation','backup-restore','cancel-disable','native-load','package-acceptance'])
 for(const r of profile.resources){
  if(ids.has(r.id)||!r.id.startsWith(profile.moduleId+'.'))error('OWNERSHIP','只能登记本模块唯一资源，不能重新拥有其他模块的数据')
  ids.add(r.id)
  if(new Set(r.entities.map(e=>e.entity)).size!==r.entities.length)error('ENTITY','资源内对象类型不能重复')
  if(r.entities.length&&!r.actions.includes('read'))error('ENTITY','对象解析需要read动作')
  if(r.actions.includes('write')){if(r.review!=='native'||r.idempotency!==true)error('WRITE','业务写入必须声明原生审核和幂等');checks.add('reviewed-write');checks.add('idempotency')}
 }
 if(profile.references.length||profile.resources.some(r=>r.entities.length)){
  if(!profile.dataFeatures.includes('record-references'))error('FEATURE','对象关联需要record-references feature，运行时仍须协商')
  checks.add('record-reference')
 }
 const refs=new Set()
 for(const ref of profile.references){const key=ref.resource+'/'+ref.entity;if(refs.has(key)||!ref.resource.startsWith(ref.provider.slice('@beellix-ai/'.length)+'.'))error('REFERENCE','引用需唯一且明确原提供方');refs.add(key)}
 const engine=profile.engine
 if(engine.kind==='existing-provider'){
  if(!engine.provider||engine.provider===manifest.name||engine.upstream)error('ENGINE','复用引擎须指向其他已存在提供方，不能冒充本包嵌入上游')
  if(engine.storage==='scene'){
   if(project.plugin.type!=='scene'||project.storage?.kind!=='postgres'||!project.ecosystem?.some(r=>r.id==='database'&&r.provider==='@beellix-ai/database'&&r.required))error('ENGINE','独立存储必须登记本场景PostgreSQL与必需数据库SDK，不能隐式连接提供方业务库')
  }else if(!profile.references.some(r=>r.provider===engine.provider&&r.required))error('ENGINE','共用提供方存储必须声明必需业务引用，安装后核验真实提供方')
 }else if(engine.kind==='embedded-upstream'){
  if(!engine.upstream||engine.provider)error('ENGINE','嵌入上游需要锁定来源、提交、模块及授权文件')
  else if(!manifest.files?.includes(engine.upstream.notice))error('LICENSE','上游授权说明必须进入打包白名单')
 }else if(engine.provider||engine.upstream)error('ENGINE','自有实现不能声明虚假上游引擎')
 if(engine.storage&&engine.kind!=='existing-provider')error('ENGINE','存储归属只用于既有引擎提供方，不能冒充自有或嵌入引擎')
 for(const check of checks)if(!profile.verification.includes(check))error('VERIFICATION','缺少验收项目：'+check)
}
