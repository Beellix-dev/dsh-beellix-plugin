/** Read-only engineering check, invoked through DSH's native terminal permissions. */
import {readFile,lstat,readdir} from 'node:fs/promises'
import {resolve,join,dirname,relative} from 'node:path'
import {pathToFileURL} from 'node:url'
import {createHash} from 'node:crypto'
import {validateProject,packagePath} from './validate.mjs'
async function safePath(path){
 const parent=dirname(path);if(parent!==path)await safePath(parent)
 const info=await lstat(path);if(info.isSymbolicLink())throw Error('PROJECT_REPARSE_POINT');return info
}
export async function checkProject(directory,{signal}={}){
 const root=resolve(directory),hash=createHash('sha256');let count=0,bytes=0
 const load=async file=>{signal?.throwIfAborted();const path=join(root,file),info=await safePath(path);if(!info.isFile()||info.size>1024*1024)throw Error('PROJECT_FILE_LIMIT');const value=await readFile(path,{encoding:'utf8',signal});hash.update(file+'\0'+value+'\0');return value}
 const project=JSON.parse(await load('beellix.project.json')),manifest=JSON.parse(await load('package.json'))
 const business=manifest.beellixBusiness?.profile==='beellix.business.json'?JSON.parse(await load('beellix.business.json')):undefined
 const result=validateProject(project,manifest,business);if(!result.ok)return result
 const entries=[manifest.main,manifest.dsh.bundle.patch,project.storage.migrations].filter(Boolean)
 for(const file of entries){if(!packagePath(file))throw Error('PROJECT_PATH_UNSAFE');const info=await safePath(join(root,file));if(!info.isFile()&&!info.isDirectory())throw Error('PROJECT_FILE_TYPE')}
 // Audit only the explicit package whitelist; never crawl parent workspaces or node_modules.
 const walk=async path=>{
  signal?.throwIfAborted();if(++count>2000)throw Error('PROJECT_FILE_COUNT_LIMIT')
  const info=await safePath(path),name=relative(root,path).replaceAll('\\','/')
  if(info.isDirectory()){for(const child of (await readdir(path)).sort())await walk(join(path,child));return}
  if(!info.isFile()||info.size>8*1024*1024||(bytes+=info.size)>32*1024*1024)throw Error('PROJECT_FILE_LIMIT')
  if(/(^|\/)(?:\.env(?:\..*)?|\.git|node_modules|\.npmrc|credentials?|backups?|profiles?)(\/|$)|\.(?:pem|key|pfx|sqlite|db|bxbak)$/i.test(name))throw Error('PROJECT_PRIVATE_FILE')
  hash.update(name+'\0');hash.update(await readFile(path,{signal}));hash.update('\0')
 }
 for(const file of [...new Set(manifest.files)].sort())await walk(join(root,file))
 return {...result,scope:'project-static',filesChecked:count,inputSha256:hash.digest('hex'),ready:false}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 try{const result=await checkProject(process.argv[2]??'.');console.log(JSON.stringify(result,null,2));if(!result.ok)process.exitCode=1}
 catch(error){console.log(JSON.stringify({ok:false,ready:false,scope:'project-static',errors:[{code:error.code??error.message}]}));process.exitCode=1}
}
