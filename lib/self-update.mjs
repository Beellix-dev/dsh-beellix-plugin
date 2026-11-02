/** 中台入口自更新：固定官方仓库，经桌面公开 CLI 原位安装，重启后采用。 */
import {createHash} from 'node:crypto'
import {lstat,readFile} from 'node:fs/promises'
import {join} from 'node:path'

const NAME='@beellix-ai/dsh-beellix-plugin',REPO='Beellix-dev/dsh-beellix-plugin'
const exact=(value,keys)=>value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).length===keys.length&&keys.every(key=>Object.hasOwn(value,key))
const rootFiles=new Set(['package.json','cordis.patch.yml','README.md','CHANGELOG.md','LICENSE','THIRD_PARTY_NOTICES.md'])
const versionParts=value=>typeof value==='string'&&/^(0|[1-9]\d{0,6})\.(0|[1-9]\d{0,6})\.(0|[1-9]\d{0,6})$/u.test(value)?value.split('.').map(Number):null
const blob=bytes=>createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
const allowedSource=source=>typeof source==='string'&&new RegExp('^(?:'+NAME.replace('/','\\/')+'@)?github:'+REPO+'(?:#[a-zA-Z0-9._/-]+)?$','u').test(source)

/** Exact public repository endpoints, through fetch's DSH-owned outbound proxy policy. */
export async function githubBytes(value,{maxBytes,signal,fetcher=globalThis.fetch}={}){
 let url;try{url=new URL(value)}catch{throw Error('SELF_UPDATE_RELEASE')}
 const api=url.hostname==='api.github.com'&&new RegExp('^/repos/'+REPO+'/(?:commits/main|git/trees/[a-f0-9]{40})$','u').test(url.pathname)&&(!url.search||url.search==='?recursive=1'&&url.pathname.includes('/git/trees/'))
 const raw=url.hostname==='raw.githubusercontent.com'&&new RegExp('^/'+REPO+'/[a-f0-9]{40}/package.json$','u').test(url.pathname)&&!url.search
 if(url.protocol!=='https:'||url.port||url.username||url.password||url.hash||!api&&!raw||!Number.isSafeInteger(maxBytes)||maxBytes<1||maxBytes>2*1024*1024)throw Error('SELF_UPDATE_RELEASE')
 const response=await fetcher(url.href,{redirect:'error',credentials:'omit',cache:'no-store',signal:signal?AbortSignal.any([signal,AbortSignal.timeout(30000)]):AbortSignal.timeout(30000),headers:{accept:'application/json','user-agent':'BeelliX-Updates/0.1.1'}})
 if(!response.ok||response.redirected||Number(response.headers.get('content-length'))>maxBytes)throw Error('SELF_UPDATE_NETWORK')
 const reader=response.body.getReader(),chunks=[];let size=0
 try{for(;;){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>maxBytes)throw Error('SELF_UPDATE_RELEASE');chunks.push(Buffer.from(value))}}finally{await reader.cancel().catch(()=>{});reader.releaseLock()}
 return Buffer.concat(chunks)
}

export class SelfUpdate{
 constructor({manager,runner,installedDirectory,invokingDirectory,request=githubBytes,validateManifest,restart,now=Date.now}={}){
  Object.assign(this,{manager,runner,installedDirectory,invokingDirectory,request,validateManifest,restartAction:restart,now});this.state={status:runner?.runPlugin?'unchecked':'unsupported'};this.busy=false;this.closed=false;this.abort=new AbortController()
 }
 async snapshot(){return{...this.state,canRestart:typeof this.restartAction==='function'}}
 async exclusive(task){if(this.busy)throw Error('SELF_UPDATE_BUSY');if(this.closed)throw Error('SELF_UPDATE_UNAVAILABLE');this.busy=true;try{return await task()}finally{this.busy=false}}
 async installed(){
  const row=(await this.manager.listBundles()).find(row=>row.name===NAME)
  if(!row?.installed||!allowedSource(row.source))throw Error('SELF_UPDATE_SOURCE')
  if(row.enabled===false)throw Error('SELF_UPDATE_DISABLED')
  return row
 }
 async json(url,maxBytes=2*1024*1024){
  let bytes;try{bytes=await this.request(url,{maxBytes,signal:this.abort.signal,userAgent:'BeelliX-Updates/0.1.1',allowQuery:true})}catch{throw Error('SELF_UPDATE_NETWORK')}
  if(bytes.length>maxBytes)throw Error('SELF_UPDATE_RELEASE')
  try{return JSON.parse(bytes.toString('utf8'))}catch{throw Error('SELF_UPDATE_RELEASE')}
 }
 async compare(files){
  const directory=await this.installedDirectory(),hash=createHash('sha256');let same=true
  for(const file of files){
   let digest='missing'
   try{const path=join(directory,...file.path.split('/')),stat=await lstat(path);if(stat.isSymbolicLink()||!stat.isFile()||stat.size>32*1024*1024)throw Error('SELF_UPDATE_VERIFY');digest=blob(await readFile(path))}catch(e){if(e.code!=='ENOENT')throw e}
   hash.update(file.path+'\0'+digest+'\0');if(digest!==file.sha)same=false
  }
  return{same,digest:hash.digest('hex')}
 }
 async check(input){
  if(!exact(input,[]))throw Error('SELF_UPDATE_REQUEST')
  return this.exclusive(async()=>{
   if(this.state.status==='restart-required')return this.snapshot()
   if(!this.runner?.runPlugin)throw Error('SELF_UPDATE_UNSUPPORTED')
   this.candidate=undefined;this.state={status:'checking'}
   try{
    const installed=await this.installed(),release=await this.json('https://api.github.com/repos/'+REPO+'/commits/main')
    if(!/^[a-f0-9]{40}$/u.test(release.sha))throw Error('SELF_UPDATE_RELEASE')
    const tree=await this.json('https://api.github.com/repos/'+REPO+'/git/trees/'+release.sha+'?recursive=1')
    if(tree.truncated!==false||!Array.isArray(tree.tree))throw Error('SELF_UPDATE_RELEASE')
    const files=tree.tree.filter(row=>row.type==='blob'&&(rootFiles.has(row.path)||row.path?.startsWith('lib/'))).sort((a,b)=>a.path.localeCompare(b.path))
    if(files.length<4||files.length>1000||!['package.json','cordis.patch.yml','lib/host.mjs','lib/client.js'].every(path=>files.some(file=>file.path===path))||files.some(row=>!/^[-a-zA-Z0-9_./]+$/u.test(row.path)||row.path.split('/').some(part=>!part||part==='.'||part==='..')||!(/^[a-f0-9]{40}$/u.test(row.sha))))throw Error('SELF_UPDATE_RELEASE')
    const manifest=await this.json('https://raw.githubusercontent.com/'+REPO+'/'+release.sha+'/package.json',1024*1024)
    const next=versionParts(manifest.version),previous=versionParts(installed.version)
    if(manifest.name!==NAME||!next||!previous||manifest.dsh?.bundle?.patch!=='./cordis.patch.yml')throw Error('SELF_UPDATE_RELEASE')
    const difference=next.map((part,index)=>part-previous[index]).find(part=>part!==0)??0
    if(difference<0)throw Error('SELF_UPDATE_RELEASE')
    await this.validateManifest?.(manifest)
    const current=await this.compare(files)
    this.candidate={commit:release.sha,files,baseline:current.digest,source:installed.source,expires:this.now()+10*60*1000}
    this.state={status:current.same?'current':'available',currentVersion:installed.version,version:manifest.version,commit:release.sha}
    return this.snapshot()
   }catch(error){this.state={status:'failed'};throw error}
  })
 }
 async install(input){
  if(!exact(input,['commit']))throw Error('SELF_UPDATE_REQUEST')
  return this.exclusive(async()=>{
   const candidate=this.candidate
   if(!candidate||this.state.status!=='available'||input.commit!==candidate.commit||this.now()>candidate.expires)throw Error('SELF_UPDATE_CHANGED')
   const installed=await this.installed(),current=await this.compare(candidate.files)
   if(installed.source!==candidate.source||current.digest!==candidate.baseline)throw Error('SELF_UPDATE_CHANGED')
   this.state={...this.state,status:'installing'}
   try{
    // The desktop-owned runner and native profile lock outlive this plugin. No remove,
    // profile writes or forced live reload; loaded code remains until a normal restart.
    const run=this.runner.runPlugin(['add',NAME+'@github:'+REPO+'#'+candidate.commit],this.invokingDirectory??await this.installedDirectory())
    run.stdout?.resume();run.stderr?.resume()
    const result=await run.done
    if(result.exitCode!==0)throw Error('SELF_UPDATE_INSTALL')
    if(!(await this.compare(candidate.files)).same)throw Error('SELF_UPDATE_VERIFY')
    this.candidate=undefined;this.state={...this.state,status:'restart-required'}
    return this.snapshot()
   }catch(error){this.candidate=undefined;this.state={status:'failed'};throw Error(/^SELF_UPDATE_/u.test(error.message)?error.message:'SELF_UPDATE_INSTALL')}
  })
 }
 async restart(input){if(!exact(input,[])||this.state.status!=='restart-required'||typeof this.restartAction!=='function')throw Error('SELF_UPDATE_REQUEST');await this.restartAction();return this.snapshot()}
 dispose(){this.closed=true;this.abort.abort()}
}
