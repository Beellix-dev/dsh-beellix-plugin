/** 外置应用重新接入：只登记已归属环境内的应用，安装仍交给 DSH 原生管理器。 */
import {readFile,lstat,realpath,mkdir,copyFile} from 'node:fs/promises'
import {resolve,join,relative,isAbsolute} from 'node:path'
import {createHash} from 'node:crypto'
import {gunzipSync} from 'node:zlib'
import {withFileLock,writeFileAtomic} from '../atomic-write/lib/index.js'
import {packageContract,capabilityDefinition,modelDefinition} from './package-contract.mjs'
import {packageCatalogCategory} from './plugin-categories.mjs'
const inside=(root,path)=>{const rel=relative(root,path);return rel!==''&&rel!=='..'&&!rel.startsWith('..\\')&&!rel.startsWith('../')&&!isAbsolute(rel)}
async function plainJson(path,maxBytes=1024*1024){const stat=await lstat(path);if(stat.isSymbolicLink()||!stat.isFile()||stat.size>maxBytes)throw Error('应用登记文件不安全');return JSON.parse(await readFile(path,'utf8'))}
async function directory(path){const parent=resolve(path,'..');if(parent!==path)await directory(parent);try{const stat=await lstat(path);if(stat.isSymbolicLink()||!stat.isDirectory())throw Error('恢复路径包含链接或非目录')}catch(error){if(error.code!=='ENOENT')throw error;await mkdir(path,{mode:0o700}).catch(error=>{if(error.code!=='EEXIST')throw error});const stat=await lstat(path);if(stat.isSymbolicLink()||!stat.isDirectory())throw Error('恢复路径不安全')}}
export class CompanionApplications{
  constructor(root,pluginManager,{restoreEnvironment}={}){this.root=resolve(root);this.pluginManager=pluginManager;this.restoreEnvironment=restoreEnvironment;this.pending=undefined;this.result=undefined}
  async entries(){
    const registry=await plainJson(join(this.root,'registry.json'))
    if(registry.schemaVersion!==1||!Array.isArray(registry.plugins)||registry.plugins.length>500)throw Error('应用登记格式无效')
    const environmentPath=join(this.root,'environment');if((await lstat(environmentPath)).isSymbolicLink())throw Error('应用环境不能是链接')
    const environment=await realpath(environmentPath),entries=[],names=new Set()
    for(const item of registry.plugins){
      if(typeof item.name!=='string'||typeof item.directory!=='string'||names.has(item.name))throw Error('应用登记重复或无效')
      const directory=resolve(this.root,item.directory)
      if(!inside(resolve(this.root,'environment'),directory))throw Error('应用目录超出已初始化的安装环境')
      if(!inside(environment,await realpath(directory)))throw Object.assign(Error('应用链接仍指向旧环境，需要从本地安装包恢复'),{code:'ENVIRONMENT_REPAIR_REQUIRED'})
      const manifest=await plainJson(join(directory,'package.json'))
      if(manifest.name!==item.name||!manifest.dsh?.bundle||typeof manifest.version!=='string')throw Error('应用包与登记不匹配，原文件已保留')
      names.add(item.name);entries.push({name:item.name,version:manifest.version,directory})
    }
    return entries
  }
  async snapshot(){
    try{
      const entries=await this.entries(),bundles=await this.pluginManager.listBundles?.()??[],items=[]
      for(const item of entries){const bundle=bundles.find(bundle=>bundle.name===item.name),matched=await this.matches(bundle,item);items.push({name:item.name,version:item.version,application:matched?(bundle.error?'failed':bundle.restartRequired?'restart-required':bundle.enabled?'ready':'disabled'):'pending'})}
      return{status:this.pending?'working':items.some(item=>item.application==='failed')?'failed':items.some(item=>['pending','restart-required'].includes(item.application))?'pending':'ready',items,...items.some(item=>item.application==='restart-required')||this.result?.items.some(item=>item.application==='restart-required')?{restartRequired:true}:{}}
    }catch(error){return{status:this.pending?'working':'needs-repair',items:[],message:error.message}}
  }
  async matches(bundle,item){
    if(!bundle?.installed||bundle.availability==='missing'||bundle.version!==item.version||typeof bundle.source!=='string')return false
    const target=bundle.source.replace(/^(?:link:|file:)/u,'')
    if(!isAbsolute(target))return false
    try{return relative(await realpath(target),await realpath(item.directory))===''}catch{return false}
  }
  async reconnect(packet){
    if(!packet||typeof packet!=='object'||Array.isArray(packet)||Object.keys(packet).length)throw Error('INPUT_INVALID')
    if(this.pending)return this.pending
    const task=this.reconnectOnce();this.pending=task
    void task.finally(()=>{if(this.pending===task)this.pending=undefined}).catch(()=>{})
    return task
  }
  async reconnectOnce(){
    const recoveryDirectory=join(this.root,'data/control-plane');await directory(recoveryDirectory)
    return withFileLock(join(recoveryDirectory,'application-recovery.json'),async()=>{
      let entries
      try{entries=await this.entries()}catch(error){if(!['ENOENT','ENVIRONMENT_REPAIR_REQUIRED'].includes(error.code)||!this.restoreEnvironment)throw error;await this.restoreEnvironment();entries=await this.entries()}
      const items=[]
      const save=async()=>{this.result={items};await writeFileAtomic(join(recoveryDirectory,'application-recovery.json'),JSON.stringify({schemaVersion:1,updatedAt:new Date().toISOString(),items},null,2)+'\n',{mode:0o600})}
      for(const item of entries){
        const bundles=await this.pluginManager.listBundles?.()??[],bundle=bundles.find(bundle=>bundle.name===item.name)
        const matched=await this.matches(bundle,item)
        if(matched&&!bundle.error){items.push({name:item.name,version:item.version,application:bundle.restartRequired?'restart-required':bundle.enabled?'ready':'disabled',changed:false});continue}
        const enabled=bundle?.installed?bundle.enabled:true
        // 只替换自有登记中的目标；卸载仅撤销原生登记，不删除外置程序或业务资料。
        if(bundle?.installed){
          if(!bundle.removable||typeof this.pluginManager.removeBundle!=='function'){items.push({name:item.name,application:'failed',error:{message:'原生登记当前不能替换，请在插件管理中处理后重试'}});break}
          items.push({name:item.name,version:item.version,application:'reconnecting',previousSource:bundle.source});await save()
          const removed=await this.pluginManager.removeBundle(item.name)
          if(removed.application==='failed'){items[items.length-1]={name:item.name,application:'failed',error:removed.error};break}
          items.pop()
        }
        try{const result=await this.pluginManager.installBundle(item.directory,{enabled});items.push({name:item.name,version:item.version,application:result.application,changed:result.changed,error:result.error})}
        catch(error){items.push({name:item.name,version:item.version,application:'failed',error:{message:error.message}})}
        await save();if(items.at(-1).application==='failed')break
      }
      await save();return this.result
    })
  }
}

/** 缺包时只从随目录保留的本地压缩包恢复；运行器与包管理器沿 DSH 公开服务。 */
export async function restoreCompanionEnvironment(root,{invocation,subprocess,signal,offline=true}){
  if(!invocation?.command||!Array.isArray(invocation.args)||!subprocess?.spawn)throw Error('DSH 配套依赖恢复服务未就绪')
  const environment=join(root,'environment'),manifest=await plainJson(join(environment,'package.json'))
  await directory(environment)
  if(manifest.name!=='@beellix-ai/local-environment'||manifest.private!==true||!manifest.dependencies||typeof manifest.dependencies!=='object')throw Error('应用环境格式不支持自动恢复')
  const registry=await plainJson(join(root,'registry.json')),registered=new Map((registry.plugins??[]).map(item=>[item.name,item]))
  for(const [name,spec]of Object.entries(manifest.dependencies)){
    if(!registered.has(name)||typeof spec!=='string'||!spec.startsWith('file:'))throw Error('应用依赖缺少可核验的本地安装包，请保留 environment/packages 后重试')
    const archive=resolve(environment,spec.slice(5)),packages=join(environment,'packages'),stat=await lstat(archive)
    if(!inside(packages,archive)||!inside(await realpath(packages),await realpath(archive))||stat.isSymbolicLink()||!stat.isFile()||stat.size>256*1024*1024||!archive.endsWith('.tgz'))throw Error('本地安装包位置不安全')
    const expected=registered.get(name).archiveSha256
    if(expected&&createHash('sha256').update(await readFile(archive)).digest('hex')!==expected)throw Error('本地安装包摘要不匹配，原内容已保留')
  }
  const backup=join(root,'backups/environment');await directory(backup);await directory(join(root,'cache/pnpm-store'))
  for(const name of ['package.json','package-lock.json','pnpm-lock.yaml']){try{const path=join(environment,name),stat=await lstat(path);if(stat.isSymbolicLink()||!stat.isFile())throw Error('环境记录不安全');const bytes=await readFile(path),target=join(backup,createHash('sha256').update(bytes).digest('hex')+'-'+name);try{const existing=await lstat(target);if(existing.isSymbolicLink()||!existing.isFile()||!(await readFile(target)).equals(bytes))throw Error('环境备份记录不匹配')}catch(error){if(error.code!=='ENOENT')throw error;await copyFile(path,target)}}catch(error){if(error.code!=='ENOENT')throw error}}
  const handle=await subprocess.spawn({argv:[invocation.command,...invocation.args,'install',...offline?['--offline']:['--registry','https://registry.npmjs.org/'],'--ignore-scripts','--ignore-pnpmfile','--ignore-workspace','--no-frozen-lockfile','--node-linker=isolated','--store-dir',join(root,'cache/pnpm-store')],cwd:environment,env:{...invocation.env,CI:'1'},stdio:{stdin:'ignore',stdout:{maxBytes:16384},stderr:{maxBytes:16384}},graceMs:1000,signal:AbortSignal.any([signal??new AbortController().signal,AbortSignal.timeout(120000)])})
  const result=await handle.done
  if(result.exitCode!==0)throw Error('本地应用依赖恢复失败，请保留目录并查看 DSH 运行记录；未删除业务资料')
}

const addonDefinitions = [
  { id: 'knowledge', title: '知识库', name: '@beellix-ai/knowledge', category: 'resources' },
  { id: 'data-platform', title: '数据中台', name: '@beellix-ai/data-platform', category: 'resources' },
  { id: 'database', title: '数据库', name: '@beellix-ai/database', category: 'resources' },
]
const addonCategories = new Set(['models','tools','mcp','skills','resources','scenarios'])
const ownPackage = name => typeof name === 'string' && /^@beellix-ai\/[a-z0-9][a-z0-9-]{0,80}$/u.test(name)
const packageVersion=value=>typeof value==='string'&&/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[a-zA-Z0-9.-]+)?$/u.test(value)
function newer(next,current){
 if(!packageVersion(next)||!packageVersion(current))return false
 const split=value=>{const at=value.indexOf('-');return at<0?[value,undefined]:[value.slice(0,at),value.slice(at+1)]},[a,ap]=split(next),[b,bp]=split(current),aa=a.split('.').map(BigInt),bb=b.split('.').map(BigInt)
 for(let i=0;i<3;i++)if(aa[i]!==bb[i])return aa[i]>bb[i]
 if(ap===undefined||bp===undefined)return ap===undefined&&bp!==undefined
 const ax=ap.split('.'),bx=bp.split('.');for(let i=0;i<Math.max(ax.length,bx.length);i++){if(ax[i]===bx[i])continue;if(ax[i]===undefined)return false;if(bx[i]===undefined)return true;const an=/^\d+$/u.test(ax[i]),bn=/^\d+$/u.test(bx[i]);if(an&&bn)return BigInt(ax[i])>BigInt(bx[i]);if(an!==bn)return !an;return ax[i]>bx[i]}return false
}
function archiveManifest(bytes){
 if(!Buffer.isBuffer(bytes)||bytes.length>64*1024*1024)throw Error('ADDON_PACKAGE_INVALID')
 let tar;try{tar=gunzipSync(bytes,{maxOutputLength:128*1024*1024})}catch{throw Error('ADDON_PACKAGE_INVALID')}
 let manifest
 for(let offset=0;offset+512<=tar.length;){const name=tar.subarray(offset,offset+100).toString().replace(/\0.*$/su,''),sizeText=tar.subarray(offset+124,offset+136).toString().replace(/[\0 ]/gu,'');if(!name)break;if(!/^[0-7]+$/u.test(sizeText))throw Error('ADDON_PACKAGE_INVALID');const size=parseInt(sizeText,8),next=offset+512+Math.ceil(size/512)*512;if(next>tar.length)throw Error('ADDON_PACKAGE_INVALID');if(name==='package/package.json'){if(manifest||size>128*1024||![0,48].includes(tar[offset+156]))throw Error('ADDON_PACKAGE_INVALID');try{manifest=JSON.parse(tar.subarray(offset+512,offset+512+size).toString())}catch{throw Error('ADDON_PACKAGE_INVALID')}}offset=next}
 if(!manifest)throw Error('ADDON_PACKAGE_INVALID');return manifest
}
export function inspectAddonArchive(bytes){
 const manifest=archiveManifest(bytes),id=manifest.beellixScenario?.id??manifest.beellixCapability?.id,category=manifest.beellixScenario?'scenarios':manifest.beellixCapability?.category??addonDefinitions.find(row=>row.id===id)?.category
 if(!ownPackage(manifest.name)||!packageVersion(manifest.version)||!manifest.dsh?.bundle||typeof id!=='string'||!/^[a-z0-9][a-z0-9-]{0,80}$/u.test(id)||!addonCategories.has(category))throw Error('ADDON_PACKAGE_INVALID')
 packageContract(manifest)
 packageCatalogCategory(manifest)
 const fixed=addonDefinitions.find(row=>row.id===id||row.name===manifest.name);if(fixed&&(fixed.name!==manifest.name||fixed.id!==id))throw Error('ADDON_PACKAGE_INVALID')
 return{manifest,id,category}
}
async function backupFile(root,path,bytes){const folder=join(root,'backups/environment');await directory(folder);const target=join(folder,createHash('sha256').update(bytes).digest('hex')+'-'+path.split(/[\\/]/u).at(-1));try{await copyFile(path,target,1)}catch(error){if(error.code!=='EEXIST')throw error;const stat=await lstat(target);if(stat.isSymbolicLink()||!stat.isFile()||!(await readFile(target)).equals(bytes))throw Error('ADDON_BACKUP_INVALID')}}
/** 自有插件的安装管理归中台，DSH 仅执行目录登记和加载；程序与数据分别保留。 */
export class NativeAddons {
  constructor(root, pluginManager, { restoreEnvironment } = {}) { this.root = resolve(root); this.pluginManager = pluginManager; this.restoreEnvironment = restoreEnvironment; this.pending = undefined }
  get operationPath(){return join(this.root,'data/control-plane/addon-operation.json')}
  async operation(){try{const value=await plainJson(this.operationPath,4*1024*1024);if(value?.schemaVersion!==1||!['pending','completed','rolled-back'].includes(value.status))throw Error('ADDON_RECOVERY_INVALID');return value}catch(error){if(error.code==='ENOENT')return undefined;throw error}}
  async saveOperation(value){await writeFileAtomic(this.operationPath,JSON.stringify(value,null,2)+'\n',{mode:0o600})}
  async beginOperation(operation,name,version,manifest,registry,bundle){
    const value={schemaVersion:1,status:'pending',operation,name,version,before:{manifest:manifest.toString('utf8'),registry:registry.toString('utf8'),bundle:bundle?{version:bundle.version,enabled:bundle.enabled}:null}}
    await this.saveOperation(value);return value
  }
  async rollback(value){
    if(value?.schemaVersion!==1||value.status!=='pending'||!['install','remove'].includes(value.operation)||!ownPackage(value.name)||!packageVersion(value.version)||typeof value.before?.manifest!=='string'||typeof value.before?.registry!=='string')throw Error('ADDON_RECOVERY_INVALID')
    const before=value.before,manifest=JSON.parse(before.manifest),registry=JSON.parse(before.registry),previous=registry.plugins?.find(row=>row.name===value.name)
    if(manifest.name!=='@beellix-ai/local-environment'||manifest.private!==true||registry.schemaVersion!==1||!Array.isArray(registry.plugins)||Boolean(previous)!==Boolean(manifest.dependencies?.[value.name])||previous&&(previous.directory!=='environment/node_modules/'+value.name||!packageVersion(previous.version))||before.bundle&&(!previous||before.bundle.version!==previous.version||typeof before.bundle.enabled!=='boolean'))throw Error('ADDON_RECOVERY_INVALID')
    if(!this.restoreEnvironment)throw Error('ADDON_ROLLBACK_REQUIRED')
    const target=resolve(this.root,'environment/node_modules',value.name),current=(await this.pluginManager.listBundles()).find(row=>row.name===value.name&&row.installed)
    if(current){
      const source=current.source?.replace(/^(?:link:|file:)/u,'')
      if(!source||!isAbsolute(source)||relative(resolve(source),target)!==''||![value.version,previous?.version].includes(current.version)||!current.removable)throw Error('ADDON_FOREIGN_REGISTRATION')
      const result=await this.pluginManager.removeBundle(value.name);if(['failed','cancelled'].includes(result.application))throw Error('ADDON_ROLLBACK_REQUIRED')
    }
    await writeFileAtomic(join(this.root,'environment/package.json'),before.manifest,{mode:0o600})
    await writeFileAtomic(join(this.root,'registry.json'),before.registry,{mode:0o600})
    await this.restoreEnvironment()
    if(before.bundle){
      const installed=await plainJson(join(target,'package.json'))
      if(!inside(await realpath(join(this.root,'environment')),await realpath(target))||installed.name!==value.name||installed.version!==before.bundle.version)throw Error('ADDON_ROLLBACK_REQUIRED')
      const result=await this.pluginManager.installBundle(target,{enabled:before.bundle.enabled});if(['failed','cancelled'].includes(result.application))throw Error('ADDON_ROLLBACK_REQUIRED')
    }
    await this.saveOperation({...value,status:'rolled-back'})
  }
  async recoverLocked(){const operation=await this.operation();if(operation?.status==='pending')await this.rollback(operation)}
  async recover(){
    const operation=await this.operation();if(!operation||operation.status!=='pending')return
    await directory(join(this.root,'data/control-plane'))
    return withFileLock(join(this.root,'data/control-plane/application-recovery.json'),()=>this.recoverLocked())
  }
  async catalog() {
    try { const value = await plainJson(join(this.root, 'config/install-catalog.json')); if (value.schemaVersion !== 1 || !Array.isArray(value.packages) || value.packages.length > 200 || new Set(value.packages.map(row => row.id)).size !== value.packages.length || new Set(value.packages.map(row => row.name)).size !== value.packages.length || value.packages.some(row=>!ownPackage(row.name)||typeof row.id!=='string'||!/^[a-z0-9][a-z0-9-]{0,80}$/u.test(row.id)||!addonCategories.has(row.category??addonDefinitions.find(item=>item.id===row.id)?.category))) throw Error('ADDON_PACKAGE_INVALID'); return value.packages }
    catch (error) { if (error.code === 'ENOENT') return []; throw error }
  }
  async package(id) {
    const item = (await this.catalog()).find(row => row.id === id), definition = addonDefinitions.find(row => row.id === id) ?? item
    if (!definition || !item) throw Error('ADDON_PACKAGE_UNAVAILABLE')
    if (item.name !== definition.name || !/^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/u.test(item.version) || typeof item.archive !== 'string' || !/^environment\/packages\/[a-zA-Z0-9._-]+\.tgz$/u.test(item.archive) || !/^[a-f0-9]{64}$/u.test(item.sha256)) throw Error('ADDON_PACKAGE_INVALID')
    const path = resolve(this.root, item.archive)
    await directory(join(this.root, 'environment/packages'))
    const stat = await lstat(path)
    if (stat.isSymbolicLink() || !stat.isFile() || stat.size > 64 * 1024 * 1024 || !inside(join(this.root, 'environment/packages'), path)) throw Error('ADDON_PACKAGE_INVALID')
    const bytes = await readFile(path)
    if (createHash('sha256').update(bytes).digest('hex') !== item.sha256) throw Error('ADDON_PACKAGE_INVALID')
    const tar = gunzipSync(bytes, { maxOutputLength: 128 * 1024 * 1024 }); let manifest
    for (let offset = 0; offset + 512 <= tar.length;) {
      const name = tar.subarray(offset, offset + 100).toString().replace(/\0.*$/su, ''), sizeText = tar.subarray(offset + 124, offset + 136).toString().replace(/[\0 ]/gu, '')
      if (!name) break
      if (!/^[0-7]+$/u.test(sizeText)) throw Error('ADDON_PACKAGE_INVALID')
      const size = parseInt(sizeText, 8), next = offset + 512 + Math.ceil(size / 512) * 512
      if (next > tar.length) throw Error('ADDON_PACKAGE_INVALID')
      if (name === 'package/package.json') { if (manifest || size > 128 * 1024 || ![0, 48].includes(tar[offset + 156])) throw Error('ADDON_PACKAGE_INVALID'); manifest = JSON.parse(tar.subarray(offset + 512, offset + 512 + size).toString()) }
      offset = next
    }
    const category=item.category??definition.category
    if (manifest?.name !== item.name || manifest?.version !== item.version || !manifest?.dsh?.bundle || (category==='scenarios'?manifest?.beellixScenario?.id:manifest?.beellixCapability?.id) !== id || (manifest?.beellixCapability?.category && manifest.beellixCapability.category!==category)) throw Error('ADDON_PACKAGE_INVALID')
    const contract=packageContract(manifest)
    return { ...item, category, catalogCategory:packageCatalogCategory(manifest), contract, title:item.title??definition.title??manifest.beellix?.displayName?.zh??item.name.slice('@beellix-ai/'.length), path }
  }
  async owned() {
    let registry
    try {registry=await plainJson(join(this.root,'registry.json'))} catch(error){if(error.code==='ENOENT')return[];throw error}
    if(registry.schemaVersion!==1||!Array.isArray(registry.plugins))throw Error('ADDON_REGISTRY_INVALID')
    const rows=[]
    for(const row of registry.plugins){
      if(!ownPackage(row.name))continue
      if(row.directory!=='environment/node_modules/'+row.name)throw Error('ADDON_REGISTRY_INVALID')
      const target=resolve(this.root,row.directory)
      if(!inside(await realpath(join(this.root,'environment')),await realpath(target)))throw Error('ADDON_PACKAGE_INVALID')
      const manifest=await plainJson(join(target,'package.json'))
      if(manifest.name!==row.name||!manifest.dsh?.bundle)throw Error('ADDON_PACKAGE_INVALID')
      const id=manifest.beellixScenario?.id??manifest.beellixCapability?.id, category=manifest.beellixScenario?'scenarios':manifest.beellixCapability?.category??addonDefinitions.find(item=>item.id===id)?.category
      if(!id||!addonCategories.has(category))continue
      const capability=capabilityDefinition(manifest),contract=packageContract(manifest)
      rows.push({id,name:row.name,title:manifest.beellix?.displayName?.zh??addonDefinitions.find(item=>item.id===id)?.title??row.name.slice('@beellix-ai/'.length),category,catalogCategory:packageCatalogCategory(manifest),version:manifest.version,directory:target,archiveSha256:row.archiveSha256,contract,...capability?.panel?{panel:capability.panel}:{},...capability?.configPanel?{configPanel:capability.configPanel}:{},...manifest.beellixModels?{models:modelDefinition(manifest)}:{}})
    }
    return rows
  }
  async snapshot() {
    await this.recover()
    const [bundles,catalog,owned] = await Promise.all([this.pluginManager.listBundles(),this.catalog(),this.owned()])
    const definitions=new Map(addonDefinitions.map(row=>[row.id,row]))
    for(const row of [...catalog,...owned])definitions.set(row.id,{...definitions.get(row.id),...row,title:row.title??definitions.get(row.id)?.title??row.name.slice('@beellix-ai/'.length)})
    return Promise.all([...definitions.values()].map(async definition => {
      const local=owned.find(row=>row.name===definition.name), installed = bundles.find(row => row.name === definition.name && row.installed && row.availability !== 'missing')
      let offered,packageError
      if(catalog.some(row=>row.id===definition.id)){try{offered=await this.package(definition.id)}catch{packageError='安装包校验失败，请重新导入'}}
      if(local){const matched=await new CompanionApplications(this.root,this.pluginManager).matches(installed,local);return{...definition,version:local.version,enabled:Boolean(installed?.enabled),state:matched?(installed.error?'failed':installed.restartRequired?'pending':installed.enabled?'enabled':'disabled'):'pending',packageError,...offered&&(newer(offered.version,local.version)||offered.version===local.version&&/^[a-f0-9]{64}$/u.test(local.archiveSha256??'')&&offered.sha256!==local.archiveSha256)?{updateVersion:offered.version,updateKind:offered.version===local.version?'rebuild':'version',digest:offered.sha256}:{}}}
      if (this.pending?.id === definition.id) return { ...definition, state: 'installing' }
      if(packageError)return{...definition,state:'invalid',packageError}
      return offered ? { ...definition, category:offered.category,version:offered.version,digest:offered.sha256,state:'available'} : {...definition,state:'unavailable'}
    }))
  }
  async install(input,{allowNetwork=false}={}) {
    if (!input || Object.keys(input).some(key => !['id', 'digest','expectedVersion','expectedArchiveSha256'].includes(key))||input.expectedArchiveSha256!==undefined&&!/^[a-f0-9]{64}$/u.test(input.expectedArchiveSha256)) throw Error('ADDON_PACKAGE_INVALID')
    const item = await this.package(input.id)
    if (input.digest !== item.sha256) throw Error('ADDON_PACKAGE_CHANGED')
    if (!this.restoreEnvironment) throw Error('ADDON_INSTALLER_UNAVAILABLE')
    if (this.pending) throw Error('ADDON_INSTALLING')
    const task = this.installOnce(item,input.expectedVersion,allowNetwork,input.expectedArchiveSha256); this.pending = { id: input.id, task }
    try { return await task } finally { this.pending = undefined }
  }
  async setEnabled(input){
    if(!input||Object.keys(input).some(key=>!['id','enabled','expectedVersion','expectedEnabled'].includes(key))||typeof input.id!=='string'||typeof input.enabled!=='boolean'||typeof input.expectedEnabled!=='boolean'||!packageVersion(input.expectedVersion))throw Error('ADDON_PACKAGE_INVALID')
    if(this.pending)throw Error('ADDON_INSTALLING')
    const task=this.setEnabledOnce(input);this.pending={id:input.id,task};try{return await task}finally{this.pending=undefined}
  }
  async setEnabledOnce(input){
    await directory(join(this.root,'data/control-plane'))
    return withFileLock(join(this.root,'data/control-plane/application-recovery.json'),async()=>{
      await this.recoverLocked()
      const owned=(await this.owned()).find(row=>row.id===input.id);if(!owned)throw Error('ADDON_PACKAGE_UNAVAILABLE')
      const bundle=(await this.pluginManager.listBundles()).find(row=>row.name===owned.name&&row.installed)
      if(owned.version!==input.expectedVersion||Boolean(bundle?.enabled)!==input.expectedEnabled)throw Error('ADDON_PACKAGE_CHANGED')
      if(!await new CompanionApplications(this.root,this.pluginManager).matches(bundle,owned))throw Error('ADDON_FOREIGN_REGISTRATION')
      const result=await this.pluginManager.setBundleEnabled(owned.name,input.enabled)
      if(['failed','cancelled'].includes(result.application)){
        const current=(await this.pluginManager.listBundles()).find(row=>row.name===owned.name&&row.installed)
        if(Boolean(current?.enabled)!==input.expectedEnabled){const rollback=await this.pluginManager.setBundleEnabled(owned.name,input.expectedEnabled);if(['failed','cancelled'].includes(rollback.application))throw Error('ADDON_ROLLBACK_REQUIRED')}
        throw Error(result.application==='cancelled'?'ADDON_OPERATION_CANCELLED':'ADDON_ACTIVATION_FAILED')
      }
      return result
    })
  }
  async importArchive(bytes,{expectedName}={}){
    const {manifest,id,category}=inspectAddonArchive(bytes),fixed=addonDefinitions.find(row=>row.id===id)
    if(expectedName!==undefined&&(!ownPackage(expectedName)||manifest.name!==expectedName))throw Error('ADDON_SOURCE_MISMATCH')
    await directory(join(this.root,'data/control-plane'))
    return withFileLock(join(this.root,'data/control-plane/application-recovery.json'),async()=>{
      await this.recoverLocked()
      const catalog=await this.catalog(),existing=catalog.find(row=>row.id===id||row.name===manifest.name)
      if(existing&&(existing.id!==id||existing.name!==manifest.name)||!existing&&catalog.length>=200)throw Error('ADDON_PACKAGE_INVALID')
      const sha256=createHash('sha256').update(bytes).digest('hex'),archive='environment/packages/'+manifest.name.slice('@beellix-ai/'.length)+'-'+manifest.version+'-'+sha256+'.tgz',path=join(this.root,archive)
      await directory(join(this.root,'environment/packages'));await directory(join(this.root,'config'))
      try{const stat=await lstat(path);if(stat.isSymbolicLink()||!stat.isFile()||!(await readFile(path)).equals(bytes))throw Error('ADDON_PACKAGE_INVALID')}catch(error){if(error.code!=='ENOENT')throw error;await writeFileAtomic(path,bytes,{mode:0o600})}
      const entry={id,name:manifest.name,title:manifest.beellix?.displayName?.zh??fixed?.title??manifest.name.slice('@beellix-ai/'.length),category,catalogCategory:packageCatalogCategory(manifest),version:manifest.version,archive,sha256,...typeof manifest.description==='string'?{description:manifest.description.slice(0,500)}:{}}
      const catalogPath=join(this.root,'config/install-catalog.json');try{const previous=await readFile(catalogPath);await plainJson(catalogPath);await backupFile(this.root,catalogPath,previous)}catch(error){if(error.code!=='ENOENT')throw error}
      await writeFileAtomic(catalogPath,JSON.stringify({schemaVersion:1,packages:[...catalog.filter(row=>row.id!==id),entry]},null,2)+'\n',{mode:0o600})
      return{id,name:manifest.name,version:manifest.version,digest:sha256}
    })
  }
  async remove(input){
    if(!input||Object.keys(input).some(key=>!['id','expectedVersion','expectedEnabled'].includes(key))||typeof input.id!=='string'||typeof input.expectedEnabled!=='boolean'||!packageVersion(input.expectedVersion))throw Error('ADDON_PACKAGE_INVALID')
    if(!this.restoreEnvironment)throw Error('ADDON_INSTALLER_UNAVAILABLE');if(this.pending)throw Error('ADDON_INSTALLING')
    const task=this.removeOnce(input);this.pending={id:input.id,task};try{return await task}finally{this.pending=undefined}
  }
  async removeOnce(input){
    await directory(join(this.root,'data/control-plane'))
    return withFileLock(join(this.root,'data/control-plane/application-recovery.json'),async()=>{
      await this.recoverLocked()
      const owned=(await this.owned()).find(row=>row.id===input.id);if(!owned)throw Error('ADDON_PACKAGE_UNAVAILABLE')
      const bundle=(await this.pluginManager.listBundles()).find(row=>row.name===owned.name&&row.installed)
      if(owned.version!==input.expectedVersion||Boolean(bundle?.enabled)!==input.expectedEnabled)throw Error('ADDON_PACKAGE_CHANGED')
      if(bundle&&(!bundle.removable||!await new CompanionApplications(this.root,this.pluginManager).matches(bundle,owned)))throw Error('ADDON_FOREIGN_REGISTRATION')
      const path=join(this.root,'environment/package.json'),registryPath=join(this.root,'registry.json'),manifest=await plainJson(path),registry=await plainJson(registryPath)
      if(manifest.private!==true||manifest.name!=='@beellix-ai/local-environment'||registry.schemaVersion!==1||!Array.isArray(registry.plugins)||!manifest.dependencies?.[owned.name])throw Error('ADDON_ENVIRONMENT_CHANGED')
      const bytes=await readFile(path),registryBytes=await readFile(registryPath);await backupFile(this.root,path,bytes);await backupFile(this.root,registryPath,registryBytes)
      const dependencies={...manifest.dependencies};delete dependencies[owned.name]
      const operation=await this.beginOperation('remove',owned.name,owned.version,bytes,registryBytes,bundle)
      let result={application:'applied'}
      try{
        if(bundle){result=await this.pluginManager.removeBundle(owned.name);if(result.application==='cancelled')throw Error('ADDON_OPERATION_CANCELLED');if(result.application==='failed')throw Error('ADDON_ACTIVATION_FAILED')}
        await writeFileAtomic(path,JSON.stringify({...manifest,dependencies},null,2)+'\n',{mode:0o600});await writeFileAtomic(registryPath,JSON.stringify({...registry,plugins:registry.plugins.filter(row=>row.name!==owned.name)},null,2)+'\n',{mode:0o600})
        await this.restoreEnvironment();await this.saveOperation({...operation,status:'completed',application:result.application});return result
      }catch(error){
        try{await this.rollback(operation)}catch{throw Error('ADDON_ROLLBACK_REQUIRED')}
        throw error
      }
    })
  }
  async installOnce(item,expectedVersion,allowNetwork=false,expectedArchiveSha256) {
    const environment = join(this.root, 'environment'), path = join(environment, 'package.json')
    await directory(join(this.root, 'data/control-plane'))
    return withFileLock(join(this.root, 'data/control-plane/application-recovery.json'), async () => {
      await this.recoverLocked()
      const manifest = await plainJson(path)
      if (manifest.private !== true || manifest.name !== '@beellix-ai/local-environment') throw Error('ADDON_ENVIRONMENT_CHANGED')
      const backup = join(this.root, 'backups/environment'); await directory(backup)
      const bytes = await readFile(path); const backupPath = join(backup, createHash('sha256').update(bytes).digest('hex') + '-package.json')
      try { await copyFile(path, backupPath, 1) } catch (error) { if (error.code !== 'EEXIST') throw error; const stat = await lstat(backupPath); if (stat.isSymbolicLink() || !stat.isFile() || !(await readFile(backupPath)).equals(bytes)) throw Error('ADDON_BACKUP_INVALID') }
      const updated = { ...manifest, dependencies: { ...manifest.dependencies, [item.name]: 'file:packages/' + item.archive.split('/').at(-1) } }
      const registryPath = join(this.root, 'registry.json'), registry = await plainJson(registryPath), previousRegistry = await readFile(registryPath)
      if (registry.schemaVersion !== 1 || !Array.isArray(registry.plugins)) throw Error('ADDON_REGISTRY_INVALID')
      const directoryName = 'environment/node_modules/' + item.name, target = resolve(this.root, directoryName)
      const previous=registry.plugins.find(row=>row.name===item.name), bundle=(await this.pluginManager.listBundles()).find(row=>row.name===item.name&&row.installed)
      if(previous?.version!==expectedVersion||Boolean(manifest.dependencies?.[item.name])!==Boolean(previous))throw Error('ADDON_PACKAGE_CHANGED')
      if(expectedArchiveSha256!==undefined&&previous?.archiveSha256!==expectedArchiveSha256)throw Error('ADDON_PACKAGE_CHANGED')
      if(bundle&&(!previous||!await new CompanionApplications(this.root,this.pluginManager).matches(bundle,{directory:target,version:previous.version})))throw Error('ADDON_FOREIGN_REGISTRATION')
      if(previous){const prior=packageContract(await plainJson(join(target,'package.json')));if(prior.data.schemaVersion!==(item.contract??{data:{schemaVersion:1}}).data.schemaVersion)throw Error('ADDON_DATA_MIGRATION_REQUIRED')}
      const operation=await this.beginOperation('install',item.name,item.version,bytes,previousRegistry,bundle)
      try {
      if(bundle){const result=await this.pluginManager.removeBundle(item.name);if(result.application==='cancelled')throw Error('ADDON_OPERATION_CANCELLED');if(result.application==='failed')throw Error('ADDON_ACTIVATION_FAILED')}
      await writeFileAtomic(registryPath, JSON.stringify({ ...registry, plugins: [...registry.plugins.filter(row => row.name !== item.name), { name: item.name, version: item.version, directory: directoryName, archiveSha256: item.sha256 }] }, null, 2) + '\n', { mode: 0o600 })
      await writeFileAtomic(path, JSON.stringify(updated, null, 2) + '\n', { mode: 0o600 })
      await this.restoreEnvironment({offline:!allowNetwork})
      if (!inside(await realpath(environment), await realpath(target))) throw Error('ADDON_PACKAGE_INVALID')
      const installed = await plainJson(join(target, 'package.json'))
      if (installed.name !== item.name || installed.version !== item.version) throw Error('ADDON_PACKAGE_INVALID')
      const result = await this.pluginManager.installBundle(target, { enabled: bundle?.enabled??true })
      if(result.application==='cancelled')throw Error('ADDON_OPERATION_CANCELLED')
      if (result.application === 'failed') throw Error('ADDON_ACTIVATION_FAILED')
      await this.saveOperation({...operation,status:'completed',application:result.application})
      return result
      } catch(error) {
        try{await this.rollback(operation)}catch{throw Error('ADDON_ROLLBACK_REQUIRED')}
        throw error
      }
    })
  }
  async reconnect(){if(!this.restoreEnvironment)throw Error('ADDON_INSTALLER_UNAVAILABLE');await this.recover();return new CompanionApplications(this.root,this.pluginManager,{restoreEnvironment:this.restoreEnvironment}).reconnect({})}
}
