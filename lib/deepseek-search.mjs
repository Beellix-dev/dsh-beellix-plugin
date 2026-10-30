/** 只接原生 web 提供方选择与凭据引用，不复制密钥或另写搜索传输。 */
import {createHash} from 'node:crypto'
const at=(value,path)=>path.reduce((v,k)=>v?.[k],value)
const official=value=>{try{const u=new URL(value??'https://api.deepseek.com');return u.protocol==='https:'&&u.hostname==='api.deepseek.com'&&!u.port&&!u.username&&!u.password&&['/','/v1','/v1/','/anthropic','/anthropic/','/anthropic/v1','/anthropic/v1/'].includes(u.pathname)&&!u.search&&!u.hash}catch{return false}}
const apiBase='https://api.deepseek.com/v1/tools'
export class DeepSeekSearch{
 constructor(ctx){this.ctx=ctx;this.busy=false}
 state(){
  const settings=this.ctx.get('settings'),views=settings?.describe()??[],entry=this.ctx.get('llm')?.listConfigurableProviders().find(row=>row.provider==='deepseek-official'),primary=views.find(v=>v.ns===entry?.settingsNs),config=primary&&at(primary.value,entry?.settingsPath??[])
  const web=views.find(v=>v.ns==='web'),api=views.find(v=>v.ns==='web-deepseek-api'),legacy=views.find(v=>v.ns==='web-search-deepseek'),ref=config?.apiKeyEnv??'DEEPSEEK_API_KEY'
  const baseURL=config?.baseURL??this.ctx.get('launchEnvironment')?.get('DEEPSEEK_BASE_URL')?.value??process.env.DEEPSEEK_BASE_URL
  const revision=createHash('sha256').update(JSON.stringify([primary?.revision,web?.revision,api?.revision,legacy?.revision,ref,baseURL])).digest('hex')
  const available=Boolean(config&&web&&api&&official(baseURL)&&!config.apiKey&&typeof ref==='string'&&/^[A-Za-z_][A-Za-z0-9_]{0,199}$/.test(ref))
  const writable=available&&settings.writable!==false&&[web,api,legacy].filter(Boolean).every(v=>v.writable!==false)
  const shared=[api,legacy].filter(Boolean).every(v=>(v.value?.apiKeyEnv??'DEEPSEEK_API_KEY')===ref&&!v.value?.apiKey)&&(api?.value?.baseURL??apiBase)===apiBase&&(!legacy||official(legacy.value?.baseURL))
  return {settings,web,api,legacy,ref,revision,available,writable,shared}
 }
 async snapshot(){const s=this.state();return {enabled:s.available&&s.shared&&s.web.value?.searchProvider==='deepseek-search-api'&&s.web.value?.fetchProvider==='deepseek-fetch-api',writable:s.writable,revision:s.revision,...!s.available?{error:'请先配置直连 DeepSeek API Key。'}:!s.shared?{error:'启用搜索 API 后将同步使用 DeepSeek 主连接密钥。'}:{}}}
 async save(input){
  if(!input||Object.keys(input).some(k=>!['enabled','expectedRevision'].includes(k))||typeof input.enabled!=='boolean'||typeof input.expectedRevision!=='string')throw Error('MODEL_CONTROL_INVALID')
  if(this.busy)throw Error('MODEL_CONTROL_BUSY');this.busy=true
  try{
   const s=this.state();if(!s.writable)throw Error('SEARCH_UNAVAILABLE');if(s.revision!==input.expectedRevision)throw Error('MODEL_CONTROL_CHANGED')
   for(const view of [s.api,s.legacy].filter(Boolean)){
    const ops=[];if((view.value?.apiKeyEnv??'DEEPSEEK_API_KEY')!==s.ref)ops.push({op:'set',path:['apiKeyEnv'],value:s.ref});if(view.value?.apiKey)ops.push({op:'unset',path:['apiKey']})
    if(view===s.api&&(view.value?.baseURL??apiBase)!==apiBase)ops.push({op:'set',path:['baseURL'],value:apiBase})
    if(view===s.legacy&&!official(view.value?.baseURL))ops.push({op:'set',path:['baseURL'],value:'https://api.deepseek.com/anthropic/v1'})
    if(ops.length)await s.settings.mutate(view.ns,ops,view.revision)
   }
   // 不携带旧视图修订重试；提供方配置成功以后才启用真实 Search / Fetch。
   const current=this.state();if(current.ref!==s.ref||!current.shared)throw Error('MODEL_CONTROL_CHANGED')
   if(current.web.revision!==s.web.revision)throw Error('MODEL_CONTROL_CHANGED')
   await s.settings.mutate(s.web.ns,[{op:'set',path:['searchProvider'],value:input.enabled?'deepseek-search-api':'deepseek-official'},{op:'set',path:['fetchProvider'],value:input.enabled?'deepseek-fetch-api':'http'}],s.web.revision)
   return {application:'applied'}
  }finally{this.busy=false}
 }
}
