/** 官方只读账户查询。凭据不离开宿主，不对自定义网关猜测账单接口。 */
const ds={origin:'https://api.deepseek.com',prices:'https://api-docs.deepseek.com/zh-cn/quick_start/pricing/',billing:'https://platform.deepseek.com/usage'}
const links={openai:{origin:'https://api.openai.com',prices:'https://openai.com/api/pricing/',billing:'https://platform.openai.com/usage'},alibaba:{prices:'https://help.aliyun.com/zh/model-studio/model-pricing',billing:'https://bailian.console.aliyun.com/'},google:{prices:'https://ai.google.dev/gemini-api/docs/pricing',billing:'https://aistudio.google.com/usage'},anthropic:{prices:'https://platform.claude.com/docs/en/about-claude/pricing',billing:'https://platform.claude.com/usage'}}
const at=(value,path)=>path.reduce((v,key)=>v?.[key],value)
const text=html=>html.replace(/<sup\b[^>]*>[\s\S]*?<\/sup>/gi,'').replace(/<[^>]*>/g,' ').replace(/&(?:nbsp|#160);/g,' ').replace(/\s+/g,' ').trim()
const unavailable=(status,message,source)=>({status,message,...source?{source}:{}})
const money=value=>typeof value==='string'&&value.length<80&&/^-?\d+(?:\.\d+)?$/u.test(value)

/** 展开官方定价表的行列合并；表头或价格结构变化时停止解析，不保留旧数值。 */
export function deepseekPrices(html){
 const table=[...html.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/gi)].map(m=>m[1]).find(t=>t.includes('缓存未命中')&&t.includes('百万tokens输出'));if(!table)throw Error('PRICING_SCHEMA_CHANGED')
 const grid=[]
 for(const [y,match]of [...table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].entries()){
  grid[y]??=[];let x=0
  for(const cell of match[1].matchAll(/<t[dh]\b([^>]*)>([\s\S]*?)<\/t[dh]>/gi)){
   while(grid[y][x]!==undefined)x++
   const rows=Number(cell[1].match(/rowspan=["']?(\d+)/i)?.[1]??1),cols=Number(cell[1].match(/colspan=["']?(\d+)/i)?.[1]??1)
   if(rows>30||cols>20)throw Error('PRICING_SCHEMA_CHANGED')
   for(let dy=0;dy<rows;dy++){grid[y+dy]??=[];for(let dx=0;dx<cols;dx++)grid[y+dy][x+dx]=text(cell[2])}x+=cols
  }
 }
 const header=grid.find(row=>row[0]==='模型');if(!header)throw Error('PRICING_SCHEMA_CHANGED')
 const items=[]
 for(let col=3;col<header.length;col++){
  const model=header[col];if(!/^deepseek-[a-z\d-]+$/u.test(model))throw Error('PRICING_SCHEMA_CHANGED')
  for(const period of ['空闲时段','高峰时段']){
   const value={model,period,currency:'CNY',unit:'百万 Token'}
   for(const [key,label]of [['cacheRead','缓存命中'],['input','缓存未命中'],['output','百万tokens输出']]){
    const row=grid.find(r=>r[0]?.startsWith('价格')&&r[1]?.includes(label)&&r[2]===period),raw=row?.[col]?.match(/^(\d+(?:\.\d+)?)元$/u)?.[1]
    if(!raw)throw Error('PRICING_SCHEMA_CHANGED');value[key]=raw
   }
   items.push(value)
  }
 }
 if(!items.length)throw Error('PRICING_SCHEMA_CHANGED')
 const rule=text(html).match(/\(2\)\s*空闲时段价格[^]*?(?=\(3\))/u)?.[0]?.slice(3).trim()??''
 return{items,rule}
}

export class OfficialModels{
 constructor(ctx,{fetch:fetcher=globalThis.fetch,now=Date.now}={}){this.ctx=ctx;this.fetch=fetcher;this.now=now;this.cache=new Map()}
 async request(url,key,format='json'){
  // 这里只接受内部确定的 URL，禁止跟随重定向携带账户凭据。
  const response=await this.fetch(url,{redirect:'error',signal:AbortSignal.timeout(12000),headers:key?{Authorization:'Bearer '+key}:{accept:'text/html'}})
  if(response.status===401||response.status===403)throw Error('UNAUTHORIZED')
  if(!response.ok)throw Error(response.status===429?'RATE_LIMITED':'UNAVAILABLE')
  if(response.headers?.has('content-length')&&Number(response.headers.get('content-length'))>2*1024*1024)throw Error('UNAVAILABLE')
  let size=0;const chunks=[];for await(const chunk of response.body??[]){size+=chunk.length;if(size>2*1024*1024)throw Error('UNAVAILABLE');chunks.push(chunk)}
  const raw=Buffer.concat(chunks).toString('utf8');return format==='json'?JSON.parse(raw):raw
 }
 async part(fn,source){try{return{status:'ready',value:await fn(),source,checkedAt:this.now()}}catch(error){return unavailable(error.message==='UNAUTHORIZED'?'unauthorized':'unavailable',error.message==='UNAUTHORIZED'?'密钥无效或没有查询权限':error.message==='RATE_LIMITED'?'查询频繁，请稍后重试':'官方数据暂未获取，请重试或查看官网',source)}}
 async credentials(ref){if(!ref)return undefined;const service=this.ctx.get('credentials');if(service)return(await service.resolve(ref))?.value;return this.ctx.get('launchEnvironment')?.get(ref)?.value??process.env[ref]}
 async snapshot({refresh=false}={}){
  const llm=this.ctx.get('llm'),views=this.ctx.get('settings')?.describe()??[],items=[]
  if(!llm?.listConfigurableProviders)throw Error('MODEL_DIRECTORY_UNAVAILABLE')
  for(const entry of llm?.listConfigurableProviders()??[]){
   const profile=at(views.find(row=>row.ns===entry.settingsNs)?.value,entry.settingsPath??[])
   if(!profile||typeof profile!=='object'||(!Object.keys(profile).length&&!entry.provider.startsWith('deepseek')))continue
   const provider=entry.provider,kind=provider.startsWith('deepseek')?'deepseek':provider.startsWith('alibaba')||provider.startsWith('qwen')?'alibaba':provider==='openai'?'openai':provider==='google'?'google':provider==='anthropic'?'anthropic':null
   const official=kind==='deepseek'?ds:links[kind],baseURL=profile.baseURL??profile.baseUrl
   // 空白默认地址沿原生声明；显式中转、非标准端口和路径均不能冒充原厂账户。
   let direct=true
   if(baseURL){try{const u=new URL(baseURL);direct=!!official?.origin&&u.origin===official.origin&&['','/','/v1','/v1/','/anthropic','/anthropic/'].includes(u.pathname)&&!u.username&&!u.password&&!u.search&&!u.hash}catch{direct=false}}
   const eligible=direct&&['deepseek','openai'].includes(kind)&&provider!=='deepseek-account'
   const key=eligible?await this.credentials(profile.apiKeyEnv??entry.nativeAuth?.env?.[0]??(provider==='deepseek-official'?'DEEPSEEK_API_KEY':undefined)).catch(()=>undefined):undefined
   // 缓存仅驻留内存；凭据不作为缓存键，也不写入磁盘或响应。
   const previous=this.cache.get(provider),fingerprint=JSON.stringify([profile,key])
   if(!refresh&&previous&&previous.fingerprint===fingerprint&&this.now()-previous.at<60000){items.push(previous.value);continue}
   let value={provider,name:entry.displayName??provider,models:unavailable('unsupported','此连接暂未接入官方模型查询'),prices:unavailable('unsupported','此连接暂未接入官方价格查询',direct?official?.prices:undefined),balance:unavailable('unsupported',direct?'尚未接入此服务的官方余额接口':'自定义服务不适用原厂账户接口',direct?official?.billing:undefined),usage:unavailable('unsupported',direct?'历史用量接口尚未接入，请查看官方账单':'请在服务提供方查询用量',direct?official?.billing:undefined)}
   if(eligible){
    value.models=key?await this.part(async()=>{const result=await this.request(official.origin+(kind==='openai'?'/v1':'')+'/models',key);if(!Array.isArray(result.data)||result.data.length>2000||!result.data.every(row=>typeof row.id==='string'))throw Error('SCHEMA');return result.data.map(row=>({id:row.id,name:typeof row.name==='string'?row.name:row.id}))},official.origin+'/models'):unavailable('unauthorized','请先配置 API Key')
    if(kind==='deepseek'){
     const [prices,balance]=await Promise.all([this.part(async()=>deepseekPrices(await this.request(ds.prices,undefined,'text')),ds.prices),key?this.part(async()=>{const result=await this.request(ds.origin+'/user/balance',key);if(typeof result.is_available!=='boolean'||!Array.isArray(result.balance_infos)||!result.balance_infos.every(row=>['CNY','USD'].includes(row.currency)&&money(row.total_balance)&&money(row.granted_balance)&&money(row.topped_up_balance)))throw Error('SCHEMA');return result.balance_infos.map(({currency,total_balance,granted_balance,topped_up_balance})=>({currency,total_balance,granted_balance,topped_up_balance}))},ds.origin+'/user/balance'):unavailable('unauthorized','请先配置 API Key')])
     value={...value,prices,balance}
    }
   }
   value.checkedAt=this.now();this.cache.set(provider,{at:this.now(),value,fingerprint});items.push(value)
  }
  return{items,checkedAt:this.now()}
 }
}
