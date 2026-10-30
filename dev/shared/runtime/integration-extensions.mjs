/** Registration contract for future managed providers. The owner is the target data provider. */
import {randomUUID} from 'node:crypto'
const reject=(condition,code)=>{if(!condition)throw Error('INTEGRATION_'+code)}
const text=v=>typeof v==='string'&&v.length>0&&v.length<=200&&!/[\u0000-\u001f]/u.test(v)
const reserved=['id','revision','enabled','status','actor','createdAt','updatedAt','contractId','sourceAccount','targetAccount','sourceInstallation','targetInstallation','sourcePackage','targetPackage','permissions','expiresAt','__proto__','constructor','prototype']
const freeze=value=>{if(value&&typeof value==='object'){for(const child of Object.values(value))freeze(child);Object.freeze(value)}return value}
export function registerContract(definition,owner,contracts){
 reject(definition&&text(definition.id)&&/^[a-zA-Z0-9._-]+$/.test(definition.id)&&!contracts.has(definition.id)&&text(definition.title),'CONTRACT')
 reject(definition.source&&text(definition.source.packageName)&&definition.source.packageName!==owner&&definition.source.accountKey==='sourceAccount'&&definition.target?.packageName===owner&&definition.target.accountKey==='targetAccount','CONTRACT')
 reject(Array.isArray(definition.operations)&&definition.operations.length>0&&definition.operations.length<=50&&new Set(definition.operations.map(r=>r.id)).size===definition.operations.length&&definition.operations.every(r=>text(r.id)&&text(r.title)&&['read','write'].includes(r.effect)),'CONTRACT')
 reject(Array.isArray(definition.fields)&&definition.fields.length<=30&&new Set(definition.fields.map(f=>f.key)).size===definition.fields.length,'CONTRACT')
 for(const field of definition.fields){reject(text(field.key)&&/^[A-Za-z][A-Za-z0-9]*$/.test(field.key)&&!reserved.includes(field.key)&&text(field.title)&&['mapping','single','multiple','checks'].includes(field.kind),'CONTRACT');if(field.kind==='mapping')reject(text(field.sourceCollection)&&text(field.targetCollection)&&text(field.sourceKey)&&text(field.targetKey)&&!reserved.includes(field.sourceKey)&&!reserved.includes(field.targetKey),'CONTRACT');else if(field.kind!=='checks')reject(['source','target'].includes(field.side)&&text(field.collection),'CONTRACT');else reject(Array.isArray(field.options)&&field.options.length<=50&&field.options.every(o=>text(o.id)&&text(o.title)),'CONTRACT')}
 for(const key of ['validate','authorize','project'])reject(typeof definition[key]==='function','CONTRACT')
 if(definition.operations.some(r=>r.effect==='write'))reject(typeof definition.review==='function','CONTRACT')
 const metadata=descriptor(definition)
 contracts.set(definition.id,freeze({...metadata,validate:definition.validate,authorize:definition.authorize,project:definition.project,review:definition.review}))
}
export function descriptor(definition){return structuredClone({id:definition.id,title:definition.title,source:definition.source,target:definition.target,operations:definition.operations.map(op=>({...op,write:op.effect==='write'})),fields:definition.fields})}
export async function validateCustom(broker,input){
 const contract=broker.contracts.get(input?.contractId);reject(contract,'CONTRACT_UNAVAILABLE')
 const keys=['contractId','sourceAccount','targetAccount','permissions','expiresAt',...contract.fields.map(f=>f.key)];reject(input&&typeof input==='object'&&!Array.isArray(input)&&Object.keys(input).every(k=>keys.includes(k)),'FIELDS')
 reject(text(input.sourceAccount)&&text(input.targetAccount),'ACCOUNT');reject(Array.isArray(input.permissions)&&input.permissions.length>0&&new Set(input.permissions).size===input.permissions.length&&input.permissions.every(id=>contract.operations.some(o=>o.id===id)),'PERMISSION')
 const expiry=Date.parse(input.expiresAt);reject(Number.isFinite(expiry)&&expiry>Date.now()&&expiry<=Date.now()+366*86400000,'EXPIRY')
 reject(!broker.closed&&broker.ready(),'PROVIDER_UNAVAILABLE')
 const source=broker.providers.get(contract.source.packageName),target=broker.providers.get(contract.target.packageName);reject(source&&target,'PROVIDER_UNAVAILABLE')
 for(const[provider,account]of [[source,input.sourceAccount],[target,input.targetAccount]]){await broker.validateProvider(provider);reject((await provider.accounts()).some(a=>a.instanceId===account),'ACCOUNT')}
 reject(await contract.validate(input)!==false,'FIELDS');return{contract,source,target}
}
export async function writeCustom(broker,mode,input){
 let previous,data,enabled
 if(mode==='create'){data=input;enabled=true}
 else{previous=(await broker.list()).find(g=>g.id===input.id);reject(previous&&previous.revision===input.expectedRevision,'GRANT_REVISION');enabled=mode==='enabled'?input.enabled:previous.enabled;reject(typeof enabled==='boolean','GRANT');data=mode==='update'?input.input:Object.fromEntries(['contractId','sourceAccount','targetAccount','permissions','expiresAt',...(broker.contracts.get(previous.contractId)?.fields??[]).map(f=>f.key)].filter(k=>Object.hasOwn(previous,k)).map(k=>[k,previous[k]]))
  if(mode==='update')reject(data.contractId===previous.contractId&&data.sourceAccount===previous.sourceAccount&&data.targetAccount===previous.targetAccount,'IDENTITY')
 }
 if(mode==='enabled'&&!enabled){const grant=await broker.mutate(state=>{const row=state.grants.find(g=>g.id===input.id);reject(row?.revision===input.expectedRevision,'GRANT_REVISION');row.enabled=false;row.revision++;return structuredClone(row)});for(const[key,control]of broker.inflight)if(key.startsWith(grant.id+':'))control.abort(Error('INTEGRATION_GRANT_REVOKED'));for(const name of [grant.sourcePackage,grant.targetPackage]){try{await broker.providers.get(name)?.snapshotGrant(grant)}catch{}}await broker.audit(grant,'grant.change','complete');return grant}
 const{contract,source,target}=await validateCustom(broker,data),grant={...previous,...structuredClone(data),id:previous?.id??randomUUID(),revision:(previous?.revision??0)+1,enabled,status:'pending',actor:'local-owner',createdAt:previous?.createdAt??new Date().toISOString(),sourceInstallation:source.installationId,targetInstallation:target.installationId,sourcePackage:source.packageName,targetPackage:target.packageName}
 if(previous)reject(previous.sourceInstallation===source.installationId&&previous.targetInstallation===target.installationId,'IDENTITY')
 await source.validateGrant(grant);await target.validateGrant(grant)
 await broker.mutate(state=>{if(previous){const i=state.grants.findIndex(g=>g.id===previous.id);reject(state.grants[i]?.revision===previous.revision,'GRANT_REVISION');state.grants[i]={...grant,enabled:false}}else state.grants.push({...grant,enabled:false})})
 for(const[key,control]of broker.inflight)if(key.startsWith(grant.id+':'))control.abort(Error('INTEGRATION_GRANT_REVOKED'))
 try{await source.snapshotGrant(grant);await target.snapshotGrant(grant);grant.status='ready';await broker.mutate(state=>{const i=state.grants.findIndex(g=>g.id===grant.id);reject(state.grants[i]?.revision===grant.revision,'GRANT_REVISION');state.grants[i]=grant});await broker.audit(grant,mode==='update'?'grant.update':mode==='create'?'grant.create':'grant.change','complete');return grant}catch(error){await broker.audit(grant,'grant.update','rejected');throw error}
}
export async function authorizeCustom(broker,entry,packet,context,grant){
 const contract=broker.contracts.get(grant.contractId);reject(contract,'CONTRACT_UNAVAILABLE');const target=broker.providers.get(grant.targetPackage)
 reject(entry.packageName===grant.sourcePackage&&entry.installationId===grant.sourceInstallation&&target?.installationId===grant.targetInstallation,'PROVIDER_UNAVAILABLE');await broker.validateProvider(entry);await broker.validateProvider(target)
 reject(packet.accountId===grant.sourceAccount&&(await entry.accounts()).some(a=>a.instanceId===grant.sourceAccount)&&(await target.accounts()).some(a=>a.instanceId===grant.targetAccount),'ACCOUNT')
 const operation=contract.operations.find(o=>o.id===packet.operation);reject(operation&&grant.permissions.includes(operation.id),'PERMISSION');if(operation.effect==='write'){reject(!context.readOnly,'READ_ONLY');reject(text(packet.requestId)&&/^[A-Za-z0-9_-]{8,100}$/.test(packet.requestId),'REQUEST')}
 reject(await contract.authorize({grant,packet,context})!==false,'OBJECT_SCOPE');return{grant,target,contract,operation,targetAccount:grant.targetAccount}
}
