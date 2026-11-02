/** Consume the website's public catalog over its HTTP contract, without account credentials. */
import {createHash} from 'node:crypto'
import {publicHttpsBytes,publicHttpsUrl} from '../../../../dev/shared/runtime/public-https.mjs'
import {inspectAddonArchive} from '../../../../dev/shared/runtime/native-companion.mjs'
import {WEBSITE_CATALOG_ORIGIN as ORIGIN} from './discovery.mjs'
const MAX_ARCHIVE=64*1024*1024
// Catalog identities are untrusted; the installed runtime still validates the full package contract.
const validPackageName=value=>typeof value==='string'&&value.length<=180&&/^@[a-z][a-z0-9-]{0,79}\/[a-z][a-z0-9-]{0,79}$/u.test(value)
const validPackageVersion=value=>typeof value==='string'&&value.length<=100&&/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[a-zA-Z0-9.-]+)?$/u.test(value)
const record=value=>value&&typeof value==='object'&&!Array.isArray(value)
const identity=value=>typeof value==='string'&&/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,99}$/u.test(value)
const text=(value,max=500)=>typeof value==='string'?value.slice(0,max):''
const fail=code=>{throw Error(code)}
function normalize(row){
 if(!record(row)||!identity(row.id)||typeof row.name!=='string'||!row.name.trim()||!validPackageName(row.packageName)||row.status!=='published')fail('DISCOVERY_RESPONSE')
 const category=['scene','scenario'].includes(row.primaryType)||['scenarios','scene'].includes(row.category)?'scenarios':['tool','skill','mcp'].includes(row.primaryType)||['tools','skills','mcp'].includes(row.category)?'tools':'foundation'
 return {id:row.id,name:text(row.name,200),packageName:row.packageName,summary:text(row.summary,2000),category,websiteCategory:text(row.category,100),version:row.version??null,releaseId:row.releaseId??null,sha256:row.sha256??null,bytes:row.bytes??0,status:row.status,resourceKind:row.resourceKind??(row.primaryType==='reference'?'reference':'plugin'),license:text(row.license,100),author:text(row.author?.name,200),input:text(row.input,3000),output:text(row.output,3000),compatibility:text(row.compatibility,500),maintenance:text(row.maintenance,500),publishedAt:text(row.publishedAt,100),permissions:Array.isArray(row.permissions)?row.permissions.slice(0,30).map(value=>text(value,500)):[],releases:Array.isArray(row.releases)?row.releases.slice(0,100).map(row=>({version:text(row.version,100),status:text(row.status,50),note:text(row.note,2000)})):[]}
}
function confirmation(row,owned){
 if(row.resourceKind!=='plugin'||!identity(row.releaseId)||!validPackageVersion(row.version)||!/^[a-f0-9]{64}$/u.test(row.sha256??'')||!Number.isSafeInteger(row.bytes)||row.bytes<1||row.bytes>MAX_ARCHIVE)fail('DISCOVERY_NOT_INSTALLABLE')
 return{id:row.id,name:row.packageName,version:row.version,releaseId:row.releaseId,sha256:row.sha256,bytes:row.bytes,...owned?{expectedVersion:owned.version}:{}}
}
export class WebsiteDiscovery{
 constructor({addons,request=publicHttpsBytes,now=Date.now}={}){this.addons=addons;this.request=request;this.now=now;this.controller=new AbortController();this.busy=false;this.closed=false}
 async bytes(path,maxBytes,accept='application/json'){
  if(this.closed)fail('DISCOVERY_UNAVAILABLE')
  const url=publicHttpsUrl(new URL(path,ORIGIN).href)
  if(url.origin!==ORIGIN||!url.pathname.startsWith('/api/v1/'))fail('DISCOVERY_RESPONSE')
  try{const value=await this.request(url.href,{maxBytes,accept,signal:this.controller.signal});if(!Buffer.isBuffer(value)||value.length>maxBytes)fail('DISCOVERY_TOO_LARGE');return value}catch(error){if(/^DISCOVERY_/u.test(error.message))throw error;fail('DISCOVERY_UNAVAILABLE')}
 }
 async json(path){let value;try{value=JSON.parse((await this.bytes(path,2*1024*1024)).toString('utf8'))}catch(error){if(/^DISCOVERY_/u.test(error.message))throw error;fail('DISCOVERY_RESPONSE')}if(!record(value)||!Object.hasOwn(value,'data')||value.error)fail('DISCOVERY_RESPONSE');return value.data}
 async list({q='',category='all',offset=0,limit=20,refresh=false}={}){
  if(typeof q!=='string'||q.length>100||typeof category!=='string'||!['all','foundation','scenarios','tools'].includes(category)||!Number.isSafeInteger(offset)||offset<0||!Number.isSafeInteger(limit)||limit<1||limit>50||typeof refresh!=='boolean')fail('DISCOVERY_INPUT')
  if(refresh||!this.cache||this.now()-this.cache.at>30000){
   if(!this.loading)this.loading=(async()=>{const rows=await this.json('/api/v1/plugins');if(!Array.isArray(rows)||rows.length>5000)fail('DISCOVERY_RESPONSE');this.cache={at:this.now(),items:rows.map(normalize)}})().finally(()=>{this.loading=null})
   await this.loading
  }
  const needle=q.trim().toLocaleLowerCase(),matches=this.cache.items.filter(row=>(category==='all'||row.category===category)&&(!needle||[row.name,row.packageName,row.summary,row.author].some(value=>value.toLocaleLowerCase().includes(needle))))
  return{status:'ready',source:'官网插件目录',items:matches.slice(offset,offset+limit),total:matches.length,offset,nextOffset:offset+limit<matches.length?offset+limit:null,fetchedAt:this.cache.at}
 }
 async detail(id){if(!identity(id))fail('DISCOVERY_INPUT');return normalize(await this.json('/api/v1/plugins/'+encodeURIComponent(id)))}
 async preview(input){if(!record(input)||Object.keys(input).some(key=>key!=='id'))fail('DISCOVERY_INPUT');const row=await this.detail(input.id),owned=(await this.addons.owned()).find(item=>item.name===row.packageName);return{plugin:row,confirmation:confirmation(row,owned)}}
 async install(input){
  if(!record(input)||Object.keys(input).some(key=>!['id','name','version','releaseId','sha256','bytes','expectedVersion'].includes(key)))fail('DISCOVERY_INPUT')
  if(this.busy)fail('DISCOVERY_BUSY');this.busy=true
  try{
   const row=await this.detail(input.id),owned=(await this.addons.owned()).find(item=>item.name===row.packageName),current=confirmation(row,owned)
   if(Object.keys(current).some(key=>current[key]!==input[key])||input.expectedVersion!==current.expectedVersion)fail('DISCOVERY_CHANGED')
   const grant=await this.json('/api/v1/releases/'+encodeURIComponent(row.releaseId)+'/public-download')
   if(!record(grant)||typeof grant.url!=='string'||!grant.url.startsWith('/api/v1/deliver/')||!/^\/api\/v1\/deliver\/[A-Za-z0-9_-]{1,200}$/u.test(grant.url)||!Number.isFinite(Date.parse(grant.expiresAt))||Date.parse(grant.expiresAt)<=this.now())fail('DISCOVERY_RESPONSE')
   const bytes=await this.bytes(grant.url,MAX_ARCHIVE,'application/gzip')
   if(bytes.length!==row.bytes||createHash('sha256').update(bytes).digest('hex')!==row.sha256)fail('DISCOVERY_INTEGRITY')
   const {manifest,id}=inspectAddonArchive(bytes)
   if(manifest.name!==row.packageName||manifest.version!==row.version)fail('DISCOVERY_INTEGRITY')
   if((await this.addons.owned()).find(item=>item.name===row.packageName)?.version!==current.expectedVersion)fail('DISCOVERY_CHANGED')
   await this.addons.importArchive(bytes,{expectedName:row.packageName})
   const result=await this.addons.install({id,digest:row.sha256,...current.expectedVersion?{expectedVersion:current.expectedVersion}:{}},{allowNetwork:true})
   if(['failed','cancelled'].includes(result.application))fail('ADDON_ACTIVATION_FAILED')
   this.cache=null;return result
  }finally{this.busy=false}
 }
 dispose(){this.closed=true;this.controller.abort();this.cache=null}
}
