/** 中台拥有安装清单，DSH Loader 拥有运行生命周期；不登记为 Profile 的独立 Bundle。 */
import {readFile,lstat,realpath} from 'node:fs/promises'
import {join,resolve,relative,isAbsolute} from 'node:path'
import {pathToFileURL} from 'node:url'
import {createHash} from 'node:crypto'
import {writeFileAtomic} from '../atomic-write/lib/index.js'
const inside=(root,path)=>{const part=relative(root,path);return part!==''&&!isAbsolute(part)&&part!=='..'&&!part.startsWith('../')&&!part.startsWith('..\\')}
async function json(path){const stat=await lstat(path);if(stat.isSymbolicLink()||!stat.isFile()||stat.size>1024*1024)throw Error('ADDON_REGISTRY_INVALID');return JSON.parse(await readFile(path,'utf8'))}

export class ManagedBundles{
 constructor(root,ctx,{nativeManager=ctx.pluginManager,owned}){
  this.root=resolve(root);this.ctx=ctx;this.native=nativeManager;this.owned=owned
  this.mounted=new Map();this.loadedRoots=new Map();this.restartRequired=new Set();this.errors=new Map();this.suspended=new Set();this.queue=Promise.resolve();this.closed=false
  this.reportKey=undefined
 }
 run(action){const task=this.queue.then(()=>{if(this.closed)throw Error('ADDON_RUNTIME_CLOSED');return action()});this.queue=task.catch(()=>{});return task}
 async records(){
  const owned=await this.owned(),registry=await json(join(this.root,'registry.json'))
  if(registry.schemaVersion!==1||!Array.isArray(registry.plugins))throw Error('ADDON_REGISTRY_INVALID')
  return owned.map(row=>{const entry=registry.plugins.find(item=>item.name===row.name);if(!entry||entry.version!==row.version||entry.enabled!==undefined&&typeof entry.enabled!=='boolean')throw Error('ADDON_REGISTRY_INVALID');return{...row,enabled:entry.enabled!==false}})
 }
 async readManifest(name){const row=(await this.records()).find(row=>row.name===name);return row?json(join(row.directory,'package.json')):undefined}
 async writeEnabled(row,enabled){
  const path=join(this.root,'registry.json'),registry=await json(path),current=registry.plugins.find(item=>item.name===row.name)
  if(!current||current.version!==row.version)throw Error('ADDON_PACKAGE_CHANGED')
  if(current.enabled===enabled)return
  await writeFileAtomic(path,JSON.stringify({...registry,plugins:registry.plugins.map(item=>item.name===row.name?{...item,enabled}:item)},null,2)+'\n',{mode:0o600})
 }
 async unmount(name){
  const id=this.mounted.get(name)?.id;if(!id)return
  this.mounted.delete(name)
  const entry=this.ctx.loader.store[id];if(!entry)return
  const disposal=entry.fiber?.dispose();this.ctx.loader.remove(id);await disposal
 }
 async mount(row){
  const canonical=await realpath(row.directory),signature=row.version+'\0'+canonical
  if(this.mounted.get(row.name)?.signature===signature)return true
  // Native imports are cached for the Host lifetime. Never mount a prior physical
  // module against a replacement package's registration after pnpm changes its target.
  if(this.loadedRoots.has(row.name)&&this.loadedRoots.get(row.name)!==canonical){await this.unmount(row.name);this.restartRequired.add(row.name);return false}
  this.restartRequired.delete(row.name)
  await this.unmount(row.name)
  const manifest=await json(join(row.directory,'package.json')),boot=await this.ctx.loader.import('@deepseek-ai/dsh-app-boot')
  const compatibility=boot.evaluatePluginCompatibility(manifest,this.ctx.profileContext?boot.readProfileVersionExemptions(this.ctx.profileContext.dir):{})
  if(compatibility&&!compatibility.exempted)throw Error('ADDON_DSH_VERSION_UNSUPPORTED')
  const patches=[]
  for(const path of boot.bundlePatchPaths(row.directory,manifest.dsh.bundle)){
   const stat=await lstat(path)
   if(stat.isSymbolicLink()||!stat.isFile()||stat.size>2*1024*1024||!inside(await realpath(row.directory),await realpath(path)))throw Error('ADDON_PACKAGE_INVALID')
   patches.push(...boot.loadOverlayPatches('beellix',path))
  }
  // 每个包有自己的原生 Include，覆盖只能作用于本包的组成，不能改写宿主底座。
  boot.composeEntries([patches],message=>{throw Error('ADDON_COMPOSITION_INVALID: '+message)})
  const path=join(this.root,'environment','.beellix-runtime.json')
  try{const value=await json(path);if(!Array.isArray(value)||value.length)throw Error('ADDON_RUNTIME_FILE_INVALID')}
  catch(error){if(error.code!=='ENOENT')throw error;await writeFileAtomic(path,'[]\n',{mode:0o600})}
  const id='beellix-owned-'+createHash('sha256').update(row.name).digest('hex').slice(0,20)
  if(this.ctx.loader.store[id])throw Error('ADDON_RUNTIME_CONFLICT')
  try{
   this.loadedRoots.set(row.name,canonical)
   await this.ctx.loader.create({id,name:'cordis:include',config:{path:pathToFileURL(path).href,patches}})
   this.mounted.set(row.name,{id,signature})
   const entry=this.ctx.loader.resolve(id);if(!entry.fiber)throw Error('ADDON_ACTIVATION_FAILED')
   await entry.fiber.await();await entry.subtree?.await()
   for(const child of entry.subtree?.entries()??[])if(!child.disabled&&!child.options.group&&child.fiber?.state!==2)throw Error('ADDON_ACTIVATION_FAILED: '+child.options.name)
   this.errors.delete(row.name);return true
  }catch(error){await this.unmount(row.name);throw error}
 }
 async sync(rows,native){
  const names=new Set(rows.map(row=>row.name))
  for(const name of this.mounted.keys())if(!names.has(name))await this.unmount(name)
  for(const row of rows){
   if(this.suspended.has(row.name))continue
   const legacy=native.find(bundle=>bundle.name===row.name&&(bundle.installed||bundle.enabled))
   if(legacy){this.errors.set(row.name,'ADDON_PROFILE_MIGRATION_REQUIRED');continue}
   if(!row.enabled){await this.unmount(row.name);this.errors.delete(row.name);continue}
   if(this.errors.has(row.name))continue
   try{await this.mount(row)}catch(error){this.errors.set(row.name,error.message)}
  }
 }
 async report(rows,native,active=true){
  const state={schemaVersion:1,pid:process.pid,active,nativeInstalled:native.filter(row=>row.installed).map(row=>row.name).sort(),packages:rows.map(row=>({name:row.name,version:row.version,enabled:row.enabled,loaded:this.mounted.has(row.name),...row.enabled&&this.restartRequired.has(row.name)?{restartRequired:true}:{},error:this.errors.get(row.name)??null,entries:[...(this.ctx.loader.store[this.mounted.get(row.name)?.id]?.subtree?.entries()??[])].map(entry=>({id:entry.id,module:entry.options.name,phase:entry.fiber?.state??null}))}))}
  const key=JSON.stringify(state);if(key===this.reportKey)return
  try{await writeFileAtomic(join(this.root,'data/control-plane/managed-runtime.json'),JSON.stringify({...state,updatedAt:new Date().toISOString()},null,2)+'\n',{mode:0o600});this.reportKey=key}catch(error){this.ctx.logger?.warn('Beelli X 加载状态记录失败：'+error.message)}
 }
 listBundles(){return this.run(async()=>{
  const [rows,native]=await Promise.all([this.records(),this.native.listBundles()]);await this.sync(rows,native)
  await this.report(rows,native)
  const names=new Set(rows.map(row=>row.name))
  return[...native.filter(row=>!names.has(row.name)),...rows.filter(row=>!this.suspended.has(row.name)).map(row=>({name:row.name,version:row.version,installed:true,enabled:row.enabled,availability:'profile',source:'link:'+row.directory,removable:true,managedBy:'beellix',...row.enabled&&this.restartRequired.has(row.name)?{restartRequired:true}:{},...this.errors.has(row.name)?{error:{message:this.errors.get(row.name)}}:{}}))]
 })}
 async setBundleEnabled(name,enabled){return this.run(async()=>{
  if(typeof enabled!=='boolean')throw Error('ADDON_PACKAGE_INVALID')
  const row=(await this.records()).find(row=>row.name===name);if(!row)throw Error('ADDON_PACKAGE_UNAVAILABLE')
  if((await this.native.listBundles()).some(row=>row.name===name&&(row.installed||row.enabled)))return{application:'failed',error:{message:'ADDON_PROFILE_MIGRATION_REQUIRED'}}
  try{let mounted=true;if(enabled){this.suspended.delete(name);mounted=await this.mount(row)}else await this.unmount(name);await this.writeEnabled(row,enabled);this.errors.delete(name);return{application:mounted?'applied':'restart-required',changed:row.enabled!==enabled}}
  catch(error){if(!row.enabled)await this.unmount(name);this.errors.set(name,error.message);return{application:'failed',error:{message:error.message}}}
 })}
 installBundle(directory,{enabled=true}={}){return this.run(async()=>{
  const target=await realpath(directory),row=(await this.records()).find(row=>resolve(row.directory)===resolve(directory))
  if(!row||relative(target,await realpath(row.directory))!=='')throw Error('ADDON_FOREIGN_REGISTRATION')
  if((await this.native.listBundles()).some(item=>item.name===row.name&&(item.installed||item.enabled)))return{application:'failed',error:{message:'ADDON_PROFILE_MIGRATION_REQUIRED'}}
  this.suspended.delete(row.name);this.errors.delete(row.name)
  try{let mounted=true;if(enabled)mounted=await this.mount(row);else await this.unmount(row.name);await this.writeEnabled(row,enabled);return{application:mounted?'applied':'restart-required',changed:true}}
  catch(error){this.errors.set(row.name,error.message);return{application:'failed',error:{message:error.message}}}
 })}
 removeBundle(name){return this.run(async()=>{
  if(!(await this.records()).some(row=>row.name===name))throw Error('ADDON_PACKAGE_UNAVAILABLE')
  await this.unmount(name);this.suspended.add(name);this.errors.delete(name);return{application:'applied',changed:true}
 })}
 async dispose(){if(this.closed)return;this.closed=true;await this.queue;for(const name of [...this.mounted.keys()].reverse())await this.unmount(name);try{await this.report(await this.records(),await this.native.listBundles(),false)}catch{/* 释放仍须完成，不让诊断写入阻挡退出。 */}}
}
