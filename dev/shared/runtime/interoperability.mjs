/** V1 local-owner, explicitly granted CRM/inventory calls. No database transport. */
import {mkdir,readFile,realpath,appendFile,open} from 'node:fs/promises'
import {resolve,join} from 'node:path'
import {randomUUID,randomBytes,createHash,createHmac,timingSafeEqual} from 'node:crypto'
import {withFileLock,writeFileAtomic} from '../atomic-write/lib/index.js'
import {integrationContracts,connectionManagementAuthority} from './integration-catalog.mjs'
import {registerContract,descriptor,writeCustom,authorizeCustom} from './integration-extensions.mjs'
const CRM='@beellix-ai/sales-crm',INV='@beellix-ai/inventory'
const permissions=['crm.customer','inventory.catalog','inventory.createDraft','inventory.orderStatus','inventory.paymentSummary']
const fields=['name','industry','region']
const canonical=value=>JSON.stringify(value,(_key,row)=>row&&typeof row==='object'&&!Array.isArray(row)?Object.fromEntries(Object.keys(row).sort().map(key=>[key,row[key]])):row)
const digest=value=>createHash('sha256').update(canonical(value)).digest('hex')
const pick=(row,allowed)=>Object.fromEntries(allowed.filter(k=>Object.hasOwn(row??{},k)).map(k=>[k,row[k]]))
const reject=(condition,code)=>{if(!condition)throw Error('INTEGRATION_'+code)}
const safeText=v=>typeof v==='string'&&v.length>0&&v.length<=200&&!/[\u0000-\u001f]/u.test(v)
const positive=v=>Number.isSafeInteger(v)&&v>0
const exact=(object,keys)=>reject(object&&typeof object==='object'&&!Array.isArray(object)&&Object.keys(object).every(k=>keys.includes(k)),'FIELDS')
export class Interoperability{
 constructor(root,{owned,ready=()=>true,secrets}){this.root=resolve(root);this.owned=owned;this.ready=ready;this.secrets=secrets;this.path=join(this.root,'config/integration/grants.json');this.providers=new Map();this.pending=new Set();this.inflight=new Map();this.contracts=new Map();this.closed=false;this.contractVersion=1}
 async load(){try{const value=JSON.parse(await readFile(this.path,'utf8'));reject(value.version===1&&Array.isArray(value.grants)&&value.installations,'STORE');return value}catch(e){if(e.code==='ENOENT')return{version:1,installations:{},grants:[]};throw e}}
 publicService(){return Object.freeze({contractVersion:1,register:input=>this.register(input)})}
 async managementSnapshot(){
  const providers=await this.providersState(),byName=new Map(providers.map(p=>[p.packageName,p])),connections=[]
  for(const grant of await this.list()){
   const contract=[...integrationContracts,...this.contracts.values()].find(c=>c.id===(grant.contractId??'beellix.crm-inventory.v1')),source=byName.get(contract?.source.packageName),target=byName.get(contract?.target.packageName),sourceAccount=source?.accounts.find(a=>a.instanceId===grant[contract.source.accountKey]),targetAccount=target?.accounts.find(a=>a.instanceId===grant[contract.target.accountKey])
   connections.push({...grant,contractId:contract?.id??grant.contractId,sourcePlugin:source?.title??grant.sourcePackage??'销售 CRM',targetPlugin:target?.title??grant.targetPackage??'进销存',sourceTitle:sourceAccount?.title??'原账套暂不可用',targetTitle:targetAccount?.title??'原账套暂不可用',available:Boolean(contract&&sourceAccount&&targetAccount),expired:Date.parse(grant.expiresAt)<=Date.now()})
  }
  return{authority:connectionManagementAuthority(),providers,contracts:[...structuredClone(integrationContracts),...[...this.contracts.values()].map(descriptor)],connections}
 }
 async validateProvider(provider){const owned=(await this.owned()).find(r=>r.name===provider.packageName&&r.enabled!==false);reject(owned&&await realpath(resolve(owned.directory))===await realpath(resolve(provider.packageDirectory)),'PROVIDER_UNAVAILABLE')}
 async choice(input){
  exact(input,['contractId','side','accountId','collection','q','offset','limit','ids']);const contract=integrationContracts.find(c=>c.id===input.contractId)??this.contracts.get(input.contractId);reject(contract&&['source','target'].includes(input.side),'CONTRACT')
  const allowed=contract.fields.some(f=>f.kind==='mapping'?(input.side==='source'?f.sourceCollection:f.targetCollection)===input.collection:f.side===input.side&&f.collection===input.collection);reject(allowed,'COLLECTION')
  const offset=input.offset??0,limit=input.limit??25,q=input.q??'',ids=input.ids??[];reject(Number.isSafeInteger(offset)&&offset>=0&&Number.isSafeInteger(limit)&&limit>=1&&limit<=100&&typeof q==='string'&&q.length<=200&&Array.isArray(ids)&&ids.length<=100&&ids.every(v=>safeText(v)||Number.isSafeInteger(v)&&v>0),'LOOKUP')
  const side=contract[input.side],provider=this.providers.get(side.packageName);reject(provider?.choices&&(await provider.accounts()).some(a=>a.instanceId===input.accountId),'ACCOUNT')
  const installed=(await this.owned()).find(r=>r.name===side.packageName&&r.enabled!==false);reject(installed&&await realpath(resolve(installed.directory))===await realpath(resolve(provider.packageDirectory)),'PROVIDER_UNAVAILABLE')
  const result=await provider.choices(input.accountId,{collection:input.collection,q,offset,limit,ids});reject(result&&Array.isArray(result.items)&&Number.isSafeInteger(result.total),'LOOKUP');return result
 }
 async mutate(run){await mkdir(join(this.root,'config/integration'),{recursive:true});return withFileLock(this.path,async()=>{const state=await this.load(),result=await run(state);await writeFileAtomic(this.path,JSON.stringify(state),{mode:0o600,dirMode:0o700});return result})}
 async key(){return this.keyPromise??=(async()=>{reject(this.secrets?.get&&this.secrets?.set,'CREDENTIALS_UNAVAILABLE');const ref='BEELLIX_INTEGRATION_'+digest(this.root).slice(0,24);let key=await this.secrets.get(ref);if(!key){key=randomBytes(32).toString('base64');await this.secrets.set(ref,key)}return key})().catch(error=>{this.keyPromise=undefined;throw error})}
 async register(input){
  reject(!this.closed&&this.ready(),'PROVIDER_UNAVAILABLE');reject(safeText(input.packageName)&&!this.pending.has(input.packageName)&&!this.providers.has(input.packageName),'PROVIDER_DUPLICATE');this.pending.add(input.packageName)
  try{
   const owned=(await this.owned()).find(r=>r.name===input.packageName&&r.enabled!==false);reject(owned,'PROVIDER_NOT_OWNED');reject(await realpath(resolve(owned.directory))===await realpath(resolve(input.packageDirectory)),'PROVIDER_SOURCE')
   for(const key of ['accounts','validateGrant','snapshotGrant','call'])reject(typeof input[key]==='function','PROVIDER_CONTRACT')
   reject(!input.contracts||Array.isArray(input.contracts)&&input.contracts.length<=20,'CONTRACT');const next=new Map(this.contracts);for(const contract of input.contracts??[]){reject(!integrationContracts.some(c=>c.id===contract.id),'CONTRACT_DUPLICATE');registerContract(contract,input.packageName,next)}
   const installationId=await this.mutate(state=>state.installations[input.packageName]??=randomUUID()),entry={...input,installationId},latest=new Map(this.contracts);for(const contract of input.contracts??[])registerContract(contract,input.packageName,latest);this.providers.set(input.packageName,entry);this.contracts=latest
   const current=()=>reject(!this.closed&&this.ready()&&this.providers.get(input.packageName)===entry,'PROVIDER_UNAVAILABLE')
   return Object.freeze({installationId,contractVersion:1,list:async accountId=>{current();reject((await entry.accounts()).some(a=>a.instanceId===accountId),'ACCOUNT');return(await this.list()).filter(g=>g.sourcePackage?(g.sourcePackage===entry.packageName&&g.sourceAccount===accountId||g.targetPackage===entry.packageName&&g.targetAccount===accountId):[CRM,INV].includes(entry.packageName)&&g[input.packageName===CRM?'crmAccount':'inventoryAccount']===accountId)},call:async(packet,context)=>{current();return this.call(entry,packet,context)},review:async(packet,context)=>{current();return this.review(entry,packet,context)},dispose:async()=>{if(this.providers.get(input.packageName)===entry){this.providers.delete(input.packageName);for(const contract of input.contracts??[])this.contracts.delete(contract.id);for(const control of this.inflight.values())control.abort(Error('INTEGRATION_PROVIDER_UNAVAILABLE'))}}})
  }finally{this.pending.delete(input.packageName)}
 }
 async providersState(){const rows=[];for(const row of this.providers.values()){try{await this.validateProvider(row);rows.push({packageName:row.packageName,title:row.title,available:true,accounts:await row.accounts()})}catch{rows.push({packageName:row.packageName,title:row.title,available:false,accounts:[]})}}return rows}
 async choices(accountId){const provider=this.providers.get(CRM);reject(provider?.choices&&(await provider.accounts()).some(r=>r.instanceId===accountId),'ACCOUNT');return provider.choices(accountId)}
 async list(){return structuredClone((await this.load()).grants)}
 async validateInput(input){
  exact(input,['contractId','crmAccount','inventoryAccount','customerMap','productIds','warehouseId','permissions','customerFields','expiresAt']);reject(!input.contractId||input.contractId==='beellix.crm-inventory.v1','CONTRACT')
  reject(safeText(input.crmAccount)&&safeText(input.inventoryAccount),'ACCOUNT');reject(Array.isArray(input.customerMap)&&input.customerMap.length>0&&input.customerMap.length<=100&&input.customerMap.every(r=>Object.keys(r).every(k=>['crmId','inventoryId'].includes(k))&&safeText(r.crmId)&&positive(r.inventoryId)),'MAPPING')
  reject(new Set(input.customerMap.map(r=>r.crmId)).size===input.customerMap.length,'MAPPING');reject(Array.isArray(input.productIds)&&input.productIds.length>0&&input.productIds.length<=500&&input.productIds.every(positive)&&new Set(input.productIds).size===input.productIds.length&&positive(input.warehouseId),'PRODUCT_SCOPE')
  reject(Array.isArray(input.permissions)&&input.permissions.length>0&&new Set(input.permissions).size===input.permissions.length&&input.permissions.every(k=>permissions.includes(k)),'PERMISSION');reject(Array.isArray(input.customerFields)&&new Set(input.customerFields).size===input.customerFields.length&&input.customerFields.every(k=>fields.includes(k)),'FIELD_SCOPE')
  const until=Date.parse(input.expiresAt);reject(Number.isFinite(until)&&until>Date.now()&&until<=Date.now()+366*86400000,'EXPIRY')
  const crm=this.providers.get(CRM),inventory=this.providers.get(INV);reject(crm&&inventory&&!this.closed&&this.ready(),'PROVIDER_UNAVAILABLE')
  for(const [provider,account]of [[crm,input.crmAccount],[inventory,input.inventoryAccount]])reject((await provider.accounts()).some(r=>r.instanceId===account),'ACCOUNT')
  for(const provider of [crm,inventory]){const owned=(await this.owned()).find(r=>r.name===provider.packageName&&r.enabled!==false);reject(owned&&await realpath(resolve(owned.directory))===await realpath(resolve(provider.packageDirectory)),'PROVIDER_UNAVAILABLE')}
  return{crm,inventory}
 }
 async create(input){
  if(input?.contractId&&input.contractId!=='beellix.crm-inventory.v1')return writeCustom(this,'create',input)
  const{crm,inventory}=await this.validateInput(input)
  const grant={...structuredClone(input),id:randomUUID(),revision:1,enabled:true,status:'pending',crmInstallation:crm.installationId,inventoryInstallation:inventory.installationId,actor:'local-owner',createdAt:new Date().toISOString()}
  await crm.validateGrant(grant);await inventory.validateGrant(grant)
  await this.mutate(state=>state.grants.push(grant))
  try{await crm.snapshotGrant(grant);await inventory.snapshotGrant(grant);grant.status='ready';await this.mutate(state=>{const i=state.grants.findIndex(r=>r.id===grant.id);reject(state.grants[i]?.revision===grant.revision,'GRANT_REVISION');state.grants[i]=grant})}catch(error){await this.setEnabled({id:grant.id,enabled:false,expectedRevision:1}).catch(()=>{});throw error}
  await this.audit(grant,'grant.create','complete');return structuredClone(grant)
 }
 async setEnabled({id,enabled,expectedRevision}){
  const previous=(await this.list()).find(r=>r.id===id);reject(previous&&previous.revision===expectedRevision,'GRANT_REVISION')
  if(previous.sourcePackage)return writeCustom(this,'enabled',{id,enabled,expectedRevision})
  if(enabled){const input=Object.fromEntries(['contractId','crmAccount','inventoryAccount','customerMap','productIds','warehouseId','permissions','customerFields','expiresAt'].filter(k=>Object.hasOwn(previous,k)).map(k=>[k,previous[k]])),{crm,inventory}=await this.validateInput(input);await crm.validateGrant(previous);await inventory.validateGrant(previous)}
  reject(typeof enabled==='boolean','GRANT');const grant=await this.mutate(state=>{const row=state.grants.find(r=>r.id===id);reject(row&&row.revision===expectedRevision,'GRANT_REVISION');row.enabled=false;if(enabled)row.status='pending';row.revision++;return structuredClone(row)})
  for(const [key,control]of this.inflight)if(key.startsWith(id+':'))control.abort(Error('INTEGRATION_GRANT_REVOKED'))
  if(enabled){try{for(const name of [CRM,INV])await this.providers.get(name).snapshotGrant({...grant,enabled:true,status:'ready'});await this.mutate(state=>{const row=state.grants.find(r=>r.id===id);reject(row?.revision===grant.revision,'GRANT_REVISION');row.enabled=true;row.status='ready'});grant.enabled=true;grant.status='ready'}catch(error){await this.audit(grant,'grant.change','rejected');throw error}}
  else for(const name of [CRM,INV]){try{await this.providers.get(name)?.snapshotGrant(grant)}catch{/* Central revocation is already effective; an offline provider cannot authorize calls. */}}
  await this.audit(grant,'grant.change','complete');return grant
 }
 async update(input){
  exact(input,['id','expectedRevision','input']);const previous=(await this.list()).find(r=>r.id===input.id);reject(previous&&previous.revision===input.expectedRevision,'GRANT_REVISION')
  if(previous.sourcePackage)return writeCustom(this,'update',input)
  reject(input.input?.crmAccount===previous.crmAccount&&input.input?.inventoryAccount===previous.inventoryAccount,'IDENTITY')
  const{crm,inventory}=await this.validateInput(input.input),grant={...previous,...structuredClone(input.input),revision:previous.revision+1,status:'pending',updatedAt:new Date().toISOString()}
  await crm.validateGrant(grant);await inventory.validateGrant(grant)
  await this.mutate(state=>{const i=state.grants.findIndex(r=>r.id===input.id);reject(state.grants[i]?.revision===input.expectedRevision,'GRANT_REVISION');state.grants[i]={...grant,enabled:false}})
  for(const[key,control]of this.inflight)if(key.startsWith(grant.id+':'))control.abort(Error('INTEGRATION_GRANT_REVOKED'))
  try{await crm.snapshotGrant(grant);await inventory.snapshotGrant(grant);grant.status='ready';await this.mutate(state=>{const i=state.grants.findIndex(r=>r.id===grant.id);reject(state.grants[i]?.revision===grant.revision,'GRANT_REVISION');state.grants[i]=grant});await this.audit(grant,'grant.update','complete');return structuredClone(grant)}
  catch(error){await this.audit(grant,'grant.update','rejected');throw error}
 }
 async auditSnapshot({offset=0,limit=40,grantId}={}){
  reject(Number.isSafeInteger(offset)&&offset>=0&&Number.isSafeInteger(limit)&&limit>0&&limit<=100&&(!grantId||safeText(grantId)),'LOOKUP')
  let file;try{file=await open(join(this.root,'data/integration/audit.jsonl'),'r')}catch(error){if(error.code==='ENOENT')return{items:[],total:0,nextOffset:null};throw error}
  try{let position=(await file.stat()).size,carry=Buffer.alloc(0),total=0;const items=[]
   const collect=line=>{if(!line.trim())return;let row;try{row=JSON.parse(line)}catch{return}if(grantId&&row.grantId!==grantId)return;if(total>=offset&&items.length<limit)items.push(row);total++}
   while(position>0){const length=Math.min(position,65536),buffer=Buffer.alloc(length);position-=length;await file.read(buffer,0,length,position);const bytes=Buffer.concat([buffer,carry]);let end=bytes.length;for(let i=bytes.length-1;i>=0;i--)if(bytes[i]===10){collect(bytes.subarray(i+1,end).toString('utf8'));end=i}carry=bytes.subarray(0,end);reject(carry.length<=1048576,'AUDIT_INVALID')}
   collect(carry.toString('utf8'));return{items,total,nextOffset:offset+items.length<total?offset+items.length:null}
  }finally{await file.close()}
 }
 async authorize(entry,packet,context={}){
  reject(packet?.version===1,'VERSION');exact(packet,['version','grantId','accountId','operation','input','requestId']);reject(!this.closed&&this.ready()&&this.providers.get(entry.packageName)===entry,'PROVIDER_UNAVAILABLE')
  const grant=(await this.load()).grants.find(r=>r.id===packet.grantId);reject(grant?.enabled&&grant.status==='ready'&&Date.parse(grant.expiresAt)>Date.now(),'GRANT_UNAVAILABLE')
  if(grant.sourcePackage)return authorizeCustom(this,entry,packet,context,grant)
  const source=entry.packageName===CRM?'crm':'inventory',target=this.providers.get(source==='crm'?INV:CRM);reject(entry.installationId===grant[source+'Installation']&&target?.installationId===grant[(source==='crm'?'inventory':'crm')+'Installation'],'PROVIDER_UNAVAILABLE')
  const owned=await this.owned();for(const provider of [entry,target]){const installed=owned.find(r=>r.name===provider.packageName&&r.enabled!==false);reject(installed&&await realpath(resolve(installed.directory))===await realpath(resolve(provider.packageDirectory)),'PROVIDER_UNAVAILABLE')}
  reject(packet.accountId===grant[source+'Account']&&(await entry.accounts()).some(r=>r.instanceId===packet.accountId)&&(await target.accounts()).some(r=>r.instanceId===grant[(source==='crm'?'inventory':'crm')+'Account']),'ACCOUNT')
  reject(grant.permissions.includes(packet.operation)&&(source==='crm'?packet.operation.startsWith('inventory.'):packet.operation==='crm.customer'),'PERMISSION')
  const input=packet.input??{}
  if(packet.operation==='inventory.catalog')exact(input,[])
  else if(packet.operation==='crm.customer'){exact(input,['customerId']);reject(grant.customerMap.some(r=>r.crmId===input.customerId),'OBJECT_SCOPE')}
  else if(packet.operation==='inventory.createDraft'){
   reject(!context.readOnly,'READ_ONLY');exact(input,['customerId','lines','reference','sourceRevision']);reject(grant.customerMap.some(r=>r.crmId===input.customerId)&&Array.isArray(input.lines)&&input.lines.length>0&&input.lines.length<=100,'OBJECT_SCOPE')
   for(const line of input.lines){exact(line,['productId','quantity','price']);reject(grant.productIds.includes(line.productId)&&/^(?:\d{1,12})(?:\.\d{1,6})?$/.test(line.quantity)&&Number(line.quantity)>0&&/^(?:\d{1,12})(?:\.\d{1,6})?$/.test(line.price),'PRODUCT_SCOPE')}
   reject(safeText(packet.requestId)&&/^[A-Za-z0-9_-]{8,100}$/.test(packet.requestId),'REQUEST');reject(input.reference===undefined||safeText(input.reference),'FIELDS')
  }else{exact(input,['orderId']);reject(positive(input.orderId),'OBJECT_SCOPE')}
  return{grant,target}
 }
 async review(entry,packet,context={}){
  reject(!context.readOnly,'READ_ONLY');const frozen=structuredClone(packet),{grant,target,contract,operation,targetAccount}=await this.authorize(entry,frozen,context),previewAction=target.preview??target.previewDraft;reject((contract?operation.effect==='write':frozen.operation==='inventory.createDraft')&&typeof previewAction==='function','REVIEW_OPERATION');reject(context.questions?.ask,'REVIEW_UNAVAILABLE')
  const preview=await previewAction({grant,accountId:targetAccount??grant.inventoryAccount,input:frozen.input,requestId:frozen.requestId,operation:frozen.operation,signal:context.signal}),questionIds=[]
  const rows=contract?contract.review(preview):[`客户：${preview.result.partner_id?.name??'已关联客户'}\n销售草稿（不会确认或出库）`,...(preview.result.lines??[]).map(r=>`${r.product_id?.name??'商品'}\n数量：${r.product_uom_qty}　未税单价：${r.price_unit}`)];reject(Array.isArray(rows)&&rows.length>0&&rows.length<=101&&rows.every(r=>typeof r==='string'&&r.length<=4000),'REVIEW_OPERATION')
  for(let i=0;i<rows.length;i++){
   context.signal?.throwIfAborted();const id='integration-'+randomUUID(),result=await context.questions.ask({agent:context.agent,signal:context.signal,questions:[{id,header:contract?'跨插件操作审核':'跨应用建单审核',question:`第 ${i+1}/${rows.length} 项`,detail:rows[i].replace(/[\\`*_{}[\]()#+.!|<>-]/g,'\\$&'),options:[{label:'暂不提交',description:contract?'不执行本次业务写入。':'不创建任何销售单。'},{label:'确认此项',description:i===rows.length-1?'提交已核对的业务请求。':'继续核对，尚未写入。'}]}]})
   const answer=result?.answers?.find(r=>r.id===id);if(!(answer&&!answer.custom&&answer.selected?.length===1&&answer.selected[0]==='确认此项')){await this.audit(grant,'review.reject','rejected',frozen.requestId);reject(false,'REVIEW_NOT_CONFIRMED')}questionIds.push(id)
  }
  const again=await this.authorize(entry,frozen,context);reject(again.grant.revision===grant.revision,'GRANT_REVISION')
  const value={version:1,grantId:grant.id,grantRevision:grant.revision,source:entry.installationId,requestId:frozen.requestId,digest:digest(frozen),stateRevision:preview.stateRevision,questionIds,expiresAt:Date.now()+15*60000}
  return{value,signature:createHmac('sha256',await this.key()).update(canonical(value)).digest('hex')}
 }
 async call(entry,packet,context={}){
  const frozen=structuredClone(packet);let authorized
  try{authorized=await this.authorize(entry,frozen,context)}catch(error){const grant=(await this.list()).find(r=>r.id===frozen?.grantId);if(grant)await this.audit(grant,frozen?.operation,'rejected',frozen?.requestId);throw error}
  const{grant,target,contract,operation,targetAccount}=authorized,accountId=targetAccount??(entry.packageName===CRM?grant.inventoryAccount:grant.crmAccount)
  if(contract?operation.effect==='write':frozen.operation==='inventory.createDraft'){
   const receipt=context.approval,value=receipt?.value;reject(value&&value.version===1&&value.expiresAt>Date.now()&&value.grantId===grant.id&&value.grantRevision===grant.revision&&value.source===entry.installationId&&value.requestId===frozen.requestId&&value.digest===digest(frozen),'REVIEW_REQUIRED')
   const expected=createHmac('sha256',await this.key()).update(canonical(value)).digest(),actual=Buffer.from(receipt.signature??'','hex');reject(expected.length===actual.length&&timingSafeEqual(expected,actual),'REVIEW_SIGNATURE')
  }
  const controller=new AbortController(),key=grant.id+':'+randomUUID();this.inflight.set(key,controller);const signal=context.signal?AbortSignal.any([context.signal,controller.signal,AbortSignal.timeout(60000)]):AbortSignal.any([controller.signal,AbortSignal.timeout(60000)])
  try{
   const result=await target.call({grant,accountId,operation:frozen.operation,input:frozen.input??{},requestId:frozen.requestId,source:{packageName:entry.packageName,installationId:entry.installationId,accountId:frozen.accountId,actor:'local-owner'},approval:context.approval?.value,signal})
   signal.throwIfAborted();const current=await this.authorize(entry,frozen,context);reject(current.grant.revision===grant.revision,'GRANT_REVISION')
   let data
   if(contract){data=await contract.project({grant,packet:frozen,result});reject(data&&typeof data==='object'&&!Array.isArray(data),'OUTPUT')}
   else if(frozen.operation==='inventory.catalog'){const items=(result.items??[]).filter(r=>grant.productIds.includes(r.id)).map(r=>pick(r,['id','name','sku','unit','price','available','warehouse','asOf','revision']));data={items,total:items.length}}
   else if(frozen.operation==='crm.customer')data=pick(result,['id','revision',...grant.customerFields])
   else {reject(grant.customerMap.some(r=>r.inventoryId===result.customerId),'OBJECT_SCOPE');data=pick(result,['id','name','state','customerId','amount','currency','delivered','invoiced','paid','remaining','revision','replayed'])}
   await this.audit(grant,frozen.operation,'complete',frozen.requestId);return{version:1,grantId:grant.id,grantRevision:grant.revision,sourceAccount:frozen.accountId,targetAccount:accountId,data}
  }catch(error){await this.audit(grant,frozen.operation,'rejected',frozen.requestId);throw error}finally{this.inflight.delete(key)}
 }
 async audit(grant,operation,result,requestId){const dir=join(this.root,'data/integration');await mkdir(dir,{recursive:true});await appendFile(join(dir,'audit.jsonl'),JSON.stringify({version:1,id:randomUUID(),at:new Date().toISOString(),actor:'local-owner',grantId:grant.id,revision:grant.revision,contractId:grant.contractId,sourcePackage:grant.sourcePackage,targetPackage:grant.targetPackage,sourceAccount:grant.sourceAccount,targetAccount:grant.targetAccount,sourceInstallation:grant.sourceInstallation,targetInstallation:grant.targetInstallation,crmInstallation:grant.crmInstallation,inventoryInstallation:grant.inventoryInstallation,crmAccount:grant.crmAccount,inventoryAccount:grant.inventoryAccount,operation:safeText(operation)?operation:'unknown',requestId:safeText(requestId)?requestId:undefined,result})+'\n',{mode:0o600})}
 async dispose(){this.closed=true;for(const control of this.inflight.values())control.abort(Error('INTEGRATION_PROVIDER_UNAVAILABLE'));this.inflight.clear();this.providers.clear()}
}
