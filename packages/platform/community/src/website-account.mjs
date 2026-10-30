/** Website-account lifecycle. DSH owns credential persistence; the UI sees only a safe view. */
import {randomUUID} from 'node:crypto'

const KEY='beellix-ui-bootstrap/website-account'
const fail=(ok,reason)=>{if(!ok)throw Error('ACCOUNT_'+reason)}
const text=(v,max=200)=>typeof v==='string'&&v.length>0&&v.length<=max&&!/[\x00-\x1f]/.test(v)
const expiry=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(v)&&Number.isFinite(Date.parse(v))
const actions=['download','update','run']

function sessionValue(value,now){
 fail(value&&text(value.subject)&&text(value.displayName,120)&&text(value.accessToken,16384)&&text(value.refreshToken,16384)&&expiry(value.expiresAt)&&Date.parse(value.expiresAt)>now,'PROVIDER_INVALID')
 fail(!value.membership||text(value.membership.label,80)&&(value.membership.expiresAt===null||expiry(value.membership.expiresAt)),'PROVIDER_INVALID')
 fail(Array.isArray(value.entitlements)&&value.entitlements.length<=1000,'PROVIDER_INVALID')
 const ids=new Set(),entitlements=value.entitlements.map(row=>{
  fail(text(row.pluginId)&&!ids.has(row.pluginId)&&Array.isArray(row.actions)&&row.actions.length<=3&&new Set(row.actions).size===row.actions.length&&row.actions.every(a=>actions.includes(a))&&(row.expiresAt===null||expiry(row.expiresAt)),'PROVIDER_INVALID')
  ids.add(row.pluginId);return{pluginId:row.pluginId,actions:[...row.actions],expiresAt:row.expiresAt}
 })
 return{subject:value.subject,displayName:value.displayName,accessToken:value.accessToken,refreshToken:value.refreshToken,expiresAt:value.expiresAt,membership:value.membership?{label:value.membership.label,expiresAt:value.membership.expiresAt}:null,entitlements}
}

export class WebsiteAccount{
 constructor({distribution,provider,credentials,now=()=>Date.now(),automatic=true}){
  this.distribution=distribution;this.provider=provider;this.credentials=credentials;this.now=now;this.automatic=automatic
  this.generation=0;this.closed=false;this.session=null;this.status='signed-out';this.attempt=null;this.controller=new AbortController()
  if(distribution.issuer){const url=new URL(distribution.issuer);fail(url.protocol==='https:'&&!url.username&&!url.password&&!url.search&&!url.hash,'CONFIG_INVALID')}
 }
 configured(){return Boolean(this.distribution.issuer&&this.provider)}
 available(){fail(!this.closed,'CANCELLED');fail(this.configured(),'NOT_CONFIGURED')}
 store(){const value=this.credentials?.();fail(value&&typeof value.readRecord==='function'&&typeof value.modifyRecord==='function'&&typeof value.deleteRecord==='function','STORAGE');return value}
 publicService(){return Object.freeze({contractVersion:1,snapshot:()=>this.snapshot(),eligibility:input=>this.eligibility(input)})}
 invalidate(){this.generation++;this.controller.abort();this.controller=new AbortController();clearTimeout(this.timer)}
 check(ticket){fail(!this.closed&&this.generation===ticket,'CANCELLED')}
 async request(run){
  const signal=AbortSignal.any([this.controller.signal,AbortSignal.timeout(30000)])
  let abort;try{return await Promise.race([run(signal),new Promise((_,reject)=>{abort=()=>reject(Error('ACCOUNT_CANCELLED'));if(signal.aborted)abort();else signal.addEventListener('abort',abort,{once:true})})])}finally{signal.removeEventListener('abort',abort)}
 }
 authorizationUrl(value){
  let url;try{url=new URL(value)}catch{throw Error('ACCOUNT_PROVIDER_INVALID')}
  const allowed=this.distribution.authorizationOrigins?.length?this.distribution.authorizationOrigins:[new URL(this.distribution.issuer).origin]
  fail(url.protocol==='https:'&&allowed.includes(url.origin)&&!url.username&&!url.password&&!url.hash&&url.href.length<=8000&&!['access_token','refresh_token','id_token','client_secret'].some(k=>url.searchParams.has(k)),'PROVIDER_INVALID');return url.href
 }
 record(value){return value?.kind==='grant'&&value.payload?.schemaVersion===1&&value.payload.issuer===this.distribution.issuer?value.payload.session:null}
 schedule(){if(!this.automatic||this.closed||!this.configured()||this.attempt||this.starting)return;clearTimeout(this.timer);const delay=this.status==='signed-in'?Math.max(1000,Math.min(3600000,Date.parse(this.session.expiresAt)-this.now()-60000)):60000;this.timer=setTimeout(()=>{void this.restore().catch(()=>{})},delay);this.timer.unref?.()}
 async snapshot(){
  if(!this.configured())return{status:'unconfigured',canLogin:false,account:null,membership:null}
  if(this.attempt&&Date.parse(this.attempt.expiresAt)<=this.now()){this.invalidate();this.attempt=null;this.status='signed-out'}
  const status=this.status==='signed-in'&&Date.parse(this.session.expiresAt)<=this.now()?'expired':this.status
  return{status,canLogin:true,account:this.session?{displayName:this.session.displayName}:null,membership:status==='signed-in'&&this.session.membership?{...this.session.membership}:null,...this.attempt?{attemptId:this.attempt.id,expiresAt:this.attempt.expiresAt}:{}}
 }
 async begin(){
  this.available();await this.snapshot();if(this.attempt)return{attemptId:this.attempt.id,authorizationUrl:this.attempt.url,expiresAt:this.attempt.expiresAt}
  if(this.starting)return this.starting
  this.invalidate();const ticket=this.generation;this.status='starting'
  const work=(async()=>{try{
   const value=await this.request(signal=>this.provider.begin({signal}));this.check(ticket)
   fail(text(value.id)&&expiry(value.expiresAt)&&Date.parse(value.expiresAt)>this.now()&&Date.parse(value.expiresAt)<=this.now()+600000,'PROVIDER_INVALID')
   this.attempt={id:randomUUID(),providerId:value.id,url:this.authorizationUrl(value.url),expiresAt:value.expiresAt};this.status='pending'
   return{attemptId:this.attempt.id,authorizationUrl:this.attempt.url,expiresAt:this.attempt.expiresAt}
  }catch(e){if(this.generation===ticket)this.status='signed-out';throw e}finally{if(this.starting===work)this.starting=null}})();this.starting=work;return work
 }
 async poll(input){
  this.available();fail(input&&Object.keys(input).length===1&&input.attemptId===this.attempt?.id,'ATTEMPT');await this.snapshot();fail(this.attempt&&input.attemptId===this.attempt.id,'ATTEMPT')
  if(this.polling)return this.polling
  const ticket=this.generation,attempt=this.attempt
  const work=(async()=>{try{
   const result=await this.request(signal=>this.provider.poll({id:attempt.providerId,signal}));this.check(ticket)
   if(result?.status==='pending')return this.snapshot()
   fail(result?.status==='complete','PROVIDER_INVALID');const value=sessionValue(result.session,this.now())
   await this.store().modifyRecord(KEY,async()=>{this.check(ticket);return{kind:'grant',payload:{schemaVersion:1,issuer:this.distribution.issuer,session:value}}});this.check(ticket)
   this.session=value;this.attempt=null;this.status='signed-in';this.schedule();return this.snapshot()
  }finally{if(this.polling===work)this.polling=null}})();this.polling=work;return work
 }
 async restore(){
  if(!this.configured()||this.closed||this.attempt||this.starting)return this.snapshot();if(this.restoring)return this.restoring
  const ticket=this.generation
  const work=(async()=>{try{
   // Refresh inside the native atomic mutation: a second Host must see the rotated grant.
   let verified=null
   await this.store().modifyRecord(KEY,async record=>{
    this.check(ticket);const old=this.record(record);if(!old)return
    fail(text(old.subject)&&text(old.refreshToken,16384),'STATE');this.session={subject:old.subject,displayName:text(old.displayName,120)?old.displayName:'Beelli X 账号'}
    const value=sessionValue(await this.request(signal=>this.provider.refresh(structuredClone(old),{signal})),this.now());this.check(ticket);fail(value.subject===old.subject,'PROVIDER_INVALID');verified=value
    return{kind:'grant',payload:{schemaVersion:1,issuer:this.distribution.issuer,session:value}}
   });this.check(ticket);this.session=verified;this.status=verified?'signed-in':'signed-out'
  }catch(e){if(this.generation!==ticket||this.closed)throw Error('ACCOUNT_CANCELLED')
   if(e.message==='ACCOUNT_REAUTH_REQUIRED'){await this.store().modifyRecord(KEY,async record=>{this.check(ticket);if(this.record(record))return{kind:'grant',payload:{schemaVersion:1,issuer:this.distribution.issuer,session:null}}});this.session=null;this.status='signed-out'}
   else this.status='offline'
  }finally{if(this.restoring===work)this.restoring=null;this.schedule()}
  return this.snapshot()})();this.restoring=work;return work
 }
 async cancel(){this.invalidate();this.attempt=null;this.starting=null;this.polling=null;this.status=this.session?.expiresAt?'signed-in':'signed-out';return this.snapshot()}
 async logout(){
  this.available()
  this.invalidate();let previous=this.session;this.session=null;this.attempt=null;this.starting=null;this.polling=null;this.status='signed-out'
  try{
   const stored=await this.store().readRecord(KEY)
   previous=this.record(stored)??previous
   // Preserve another issuer's record, including after a future maintainer reconfiguration.
   if(stored?.kind==='grant'&&stored.payload?.schemaVersion===1&&stored.payload.issuer===this.distribution.issuer)await this.store().deleteRecord(KEY)
  }catch{
   this.session=previous?{displayName:previous.displayName}:null;this.status='offline'
   throw Error('ACCOUNT_STORAGE')
  }
  // Local deletion completes before attempting optional remote revocation.
  if(previous?.refreshToken&&this.provider?.revoke){try{await this.request(signal=>this.provider.revoke(previous,{signal}))}catch{return{...await this.snapshot(),remoteLogout:'unconfirmed'}}}
  return this.snapshot()
 }
 async eligibility(input){
  fail(input&&Object.keys(input).every(k=>['pluginId','action'].includes(k))&&text(input.pluginId)&&actions.includes(input.action),'REQUEST')
  const state=await this.snapshot();if(state.status!=='signed-in')return{allowed:false,status:state.status}
  const grant=this.session.entitlements.find(row=>row.pluginId===input.pluginId&&row.actions.includes(input.action)&&(row.expiresAt===null||Date.parse(row.expiresAt)>this.now()))
  return{allowed:Boolean(grant),status:grant?'eligible':'not-entitled',...grant?{expiresAt:grant.expiresAt}:{}}
 }
 dispose(){this.closed=true;this.invalidate();this.session=null;this.attempt=null}
}
