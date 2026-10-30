/** Beelli X guidance in the native cordis scope; no preset or execution-loop replacement. */
import {readFile,lstat,mkdir} from 'node:fs/promises'
import {dirname,join,resolve} from 'node:path'
import {createHash} from 'node:crypto'
import {fileURLToPath} from 'node:url'
import {withFileLock,writeFileAtomic} from "../../../../dev/shared/atomic-write/lib/index.js"
import {STANDARD_VERSION,SUPPORTED_STANDARD_VERSIONS,validateProject} from './development/validate.mjs'
const idPattern=/^[A-Za-z0-9][A-Za-z0-9_-]{0,199}$/
const skill='beellix-plugin-development'
async function safeDirectory(path){const parent=dirname(path);if(parent!==path)await safeDirectory(parent);try{const s=await lstat(path);if(s.isSymbolicLink()||!s.isDirectory())throw Error('CREATION_DIRECTORY_UNSAFE')}catch(error){if(error.code!=='ENOENT')throw error;await mkdir(path,{mode:0o700}).catch(e=>{if(e.code!=='EEXIST')throw e});const s=await lstat(path);if(s.isSymbolicLink()||!s.isDirectory())throw Error('CREATION_DIRECTORY_UNSAFE')}}
const mode=agent=>agent.ctx.get('agentPresets').composedPreset(agent.ctx)
export class CreationRuntime {
 constructor(root,{sceneBinding=async()=>undefined,library,capabilities=async()=>[]}={}){this.root=resolve(root);this.sceneBinding=sceneBinding;this.library=library;this.capabilities=capabilities;this.active=new Map();this.pending=new Map();this.closed=false}
 async standard(){
  if(!this.library){const data=JSON.parse(await readFile(new URL('./development/standard.json',import.meta.url),'utf8'));for(const item of Object.values(data.references)){if(createHash('sha256').update(item.text).digest('hex')!==item.sha256)throw Error('CREATION_STANDARD_HASH_MISMATCH')}this.library=data}
  if(this.library.version!==STANDARD_VERSION)throw Error('CREATION_STANDARD_UNSUPPORTED');return this.library
 }
 async activation(){
  if(this.activationPromise)return this.activationPromise
  this.activationPromise=(async()=>{const path=join(this.root,'data/control-plane/creation/activation.json');await safeDirectory(dirname(path));return withFileLock(path,async()=>{
   try{const stat=await lstat(path);if(stat.isSymbolicLink()||!stat.isFile()||stat.size>2048)throw Error('CREATION_ACTIVATION_UNSAFE');const value=JSON.parse(await readFile(path,'utf8'));if(value.schemaVersion!==1||!SUPPORTED_STANDARD_VERSIONS.includes(value.standardVersion)||!Number.isSafeInteger(value.enabledAt))throw Error('CREATION_ACTIVATION_INVALID');return value}
   catch(error){if(error.code!=='ENOENT')throw error;const value={schemaVersion:1,standardVersion:STANDARD_VERSION,enabledAt:Date.now()};await writeFileAtomic(path,JSON.stringify(value,null,2)+'\n',{mode:0o600});return value}
  })})().catch(error=>{this.activationPromise=undefined;throw error});return this.activationPromise
 }
 async eligible(agent){
  if(this.closed||!agent||!idPattern.test(agent.id??'')||mode(agent)!=='cordis')return false
  const header=agent.session.header
  if(!Number.isSafeInteger(header.createdAt))return false
  if(header.parentSession||header.origin==='subagent'){
   const parent=this.active.get(header.parentSession)?.agent
   if(header.origin!=='subagent'||!parent||!await this.eligible(parent))return false
  }
  const activation=await this.activation();if(header.createdAt<activation.enabledAt)return false
  return !await this.sceneBinding(agent.id)
 }
 async require(agent,owner){if(agent!==owner||!await this.eligible(agent))throw Error('CREATION_SCOPE_REQUIRED')}
 async sync(agent){
  if(this.pending.has(agent.id))return this.pending.get(agent.id)
  const job=this.mount(agent).finally(()=>this.pending.delete(agent.id));this.pending.set(agent.id,job);return job
 }
 async mount(agent){
  if(!await this.eligible(agent)){this.remove(agent.id);return false}
  const existing=this.active.get(agent.id);if(existing?.agent===agent&&existing.ctx===agent.ctx)return true
  this.remove(agent.id);const library=await this.standard(),disposers=[]
  const content=library.skill+'\n\n配套根：'+this.root+'\n工程默认位置：'+join(this.root,'development/projects/<projectId>')+'\n静态检查器绝对路径：'+fileURLToPath(new URL('./development/check.mjs',import.meta.url))+'\n使用 DSH 原生终端执行 node "<检查器绝对路径>" "<工程目录>"；Windows 使用 PowerShell 7。'
  const registry=agent.ctx.get('skills')??agent.ctx.skills,tools=agent.ctx.get('tools')??agent.ctx.tools
  // Context-scoped precedence replaces only the native plugin-development advice in this new cordis session.
  try{
   for(const name of [skill,'cordis-plugin-development'])disposers.push(registry.register({name,description:'开发、修改、检查 Beelli X 场景包、工具包、技能包及能力包时使用；沿 DSH 原生工具开发，由 Beelli X 中台管理业务包。',content,source:'runtime',provider:'@beellix-ai/dsh-beellix-plugin',resourceBase:{kind:'opaque',description:'beellix_develop action index/read 按需读取标准'},invocation:{modelInvocable:true,userInvocable:true}}))
   disposers.push(tools.register({name:'beellix_develop',description:'查询 Beelli X 开发标准与真实能力目录，或静态校验工程描述和包清单；不执行代码、不安装插件、不授予业务权限。',parameters:{type:'object',additionalProperties:false,required:['action'],properties:{action:{enum:['index','read','check']},reference:{type:'string'},offset:{type:'integer',minimum:0},project:{type:'object'},manifest:{type:'object'},business:{type:'object'}}},output:{schema:{type:'object'},render:(_args,value)=>[{type:'text',text:JSON.stringify(value)}]},isConcurrencySafe:()=>true,execute:async(args,exec)=>{
    exec.signal?.throwIfAborted();await this.require(exec.agent,agent)
    const keys=args?.action==='index'?['action']:args?.action==='read'?['action','reference','offset']:args?.action==='check'?['action','project','manifest','business']:[]
    if(!args||Array.isArray(args)||typeof args!=='object'||!keys.length||Object.keys(args).some(key=>!keys.includes(key)))throw Error('CREATION_ARGUMENT_INVALID')
    if(args.action==='index'){const installed=await this.capabilities();exec.signal?.throwIfAborted();await this.require(exec.agent,agent);return {standardVersion:STANDARD_VERSION,defaultType:'scene',projectRoot:join(this.root,'development/projects'),references:Object.entries(library.references).map(([id,row])=>({id,title:row.title,sha256:row.sha256,characters:row.text.length})),capabilities:library.capabilities,installed,checkScope:'check 只验证传入的描述与清单；工程文件用原生工具读取，构建和运行必须另验收'}}
    if(args.action==='read'){const row=Object.hasOwn(library.references,args.reference??'')?library.references[args.reference]:undefined;if(!row)throw Error('CREATION_REFERENCE_NOT_FOUND');const offset=args.offset??0;if(!Number.isSafeInteger(offset)||offset<0||offset>row.text.length)throw Error('CREATION_REFERENCE_OFFSET');const end=Math.min(offset+8000,row.text.length);return {standardVersion:STANDARD_VERSION,reference:args.reference,sha256:row.sha256,text:row.text.slice(offset,end),nextOffset:end<row.text.length?end:null}}
    if(args.action==='check'){if(!args.project||!args.manifest)throw Error('CREATION_CHECK_INPUT_REQUIRED');return validateProject(args.project,args.manifest,args.business)}
    throw Error('CREATION_ACTION_INVALID')
   }}))
   const prompt=agent.ctx.get('systemPrompt')??agent.ctx.systemPrompt
   disposers.push(prompt.context({name:'beellix:development',order:251,interpolate:false,text:'当前是 DSH 原生创造模式。开发 Beelli X 插件前加载 '+skill+' 技能，按 beellix_develop 的版本化标准开发；详细规范按需读取，不注入全部场景。业务包通过 Beelli X 中台安装管理，不直接写 DSH Profile。工程声明和静态检查不代表权限、测试或运行就绪。'}))
   if(this.closed||!await this.eligible(agent)){for(const dispose of disposers.reverse())dispose();return false}
   this.active.set(agent.id,{agent,ctx:agent.ctx,disposers});return true
  }catch(error){for(const dispose of disposers.reverse())dispose();throw error}
 }
 remove(id,{contextDisposed=false}={}){const record=this.active.get(id);this.active.delete(id);if(record&&!contextDisposed)for(const dispose of record.disposers.reverse())dispose()}
 async dispose(){this.closed=true;await Promise.allSettled(this.pending.values());for(const id of this.active.keys())this.remove(id)}
}
