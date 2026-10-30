/** 客户端偏好保存在配套目录；不写会话、工作区或原生布局存储。 */
import {readFile,lstat,mkdir} from 'node:fs/promises'
import {join} from 'node:path'
import {withFileLock,writeFileAtomic} from "../../../../dev/shared/atomic-write/lib/index.js"
import {DEFAULT_RATIOS,validRatios} from './layout-geometry.mjs'
const modes=new Set(['workspace','scenes','last'])
export class ClientPreferences{
 constructor(root){this.directory=join(root,'config');this.path=join(this.directory,'client-preferences.json')}
 async snapshot(){
  try{
   if((await lstat(this.directory)).isSymbolicLink())throw Error('CLIENT_PREFERENCES_INVALID')
   const stat=await lstat(this.path);if(!stat.isFile()||stat.isSymbolicLink()||stat.size>4096)throw Error('CLIENT_PREFERENCES_INVALID')
   const value=JSON.parse(await readFile(this.path,'utf8'))
   if(value.version!==1||!Number.isSafeInteger(value.revision)||value.revision<0||!modes.has(value.startup)||!validRatios(value.ratios))throw Error('CLIENT_PREFERENCES_INVALID')
   return value
  }catch(error){if(error.code==='ENOENT')return{version:1,revision:0,startup:'workspace',ratios:[...DEFAULT_RATIOS]};throw error}
 }
 async save(input){
  if(!input||Object.keys(input).some(k=>!['startup','ratios','expectedRevision'].includes(k))||!Number.isSafeInteger(input.expectedRevision)||input.expectedRevision<0||input.startup===undefined&&input.ratios===undefined||input.startup!==undefined&&!modes.has(input.startup)||input.ratios!==undefined&&!validRatios(input.ratios))throw Error('CLIENT_PREFERENCES_INVALID')
  await mkdir(this.directory,{recursive:true});if((await lstat(this.directory)).isSymbolicLink())throw Error('CLIENT_PREFERENCES_INVALID')
  return withFileLock(this.path,async()=>{const current=await this.snapshot();if(current.revision!==input.expectedRevision)throw Error('CLIENT_PREFERENCES_CHANGED');const next={...current,...input.startup!==undefined?{startup:input.startup}:{},...input.ratios!==undefined?{ratios:input.ratios}:{},revision:current.revision+1};await writeFileAtomic(this.path,JSON.stringify(next,null,2),{mode:0o600,dirMode:0o700});return next})
 }
}
