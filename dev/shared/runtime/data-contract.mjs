/** Optional v1 features for the existing owner data service; no database or identity store. */
import Ajv from 'ajv/dist/2020.js'
const ajv=new Ajv({strict:false,allErrors:true,validateFormats:false,addUsedSchema:false,coerceTypes:false,useDefaults:false,removeAdditional:false})
export const DATA_FEATURES=Object.freeze(['validated-input','record-references'])
const fail=(ok,code)=>{if(!ok)throw Error('DATA_'+code)}
const text=value=>typeof value==='string'&&value.length>0&&value.length<=200&&!/[\x00-\x1f]/.test(value)
export function dataJson(value,limit=120000){
 const seen=new Set();let nodes=0
 const walk=(v,depth)=>{fail(++nodes<=50000&&depth<=40,'JSON_LIMIT');if(v===null||typeof v==='string'||typeof v==='boolean')return;if(typeof v==='number'){fail(Number.isFinite(v),'JSON_INVALID');return}fail(typeof v==='object'&&!seen.has(v)&&(Array.isArray(v)||Object.getPrototypeOf(v)===Object.prototype||Object.getPrototypeOf(v)===null),'JSON_INVALID');seen.add(v);for(const x of Object.values(v))walk(x,depth+1);seen.delete(v)}
 walk(value,0);fail(Buffer.byteLength(JSON.stringify(value))<=limit,'JSON_LIMIT');return value
}
export function compileDataSchemas(inputSchema,actions){
 if(inputSchema==null)return null
 try{
  dataJson(inputSchema);fail(inputSchema&&typeof inputSchema==='object'&&!Array.isArray(inputSchema)&&Object.keys(inputSchema).every(k=>actions.includes(k)),'SCHEMA_INVALID')
  const validators=new Map()
  for(const action of actions){fail(Object.hasOwn(inputSchema,action),'SCHEMA_INVALID');const schema=inputSchema[action];fail(schema&&typeof schema==='object'&&!Array.isArray(schema),'SCHEMA_INVALID');const validate=ajv.compile(schema);fail(!validate.$async,'SCHEMA_INVALID');validators.set(action,validate)}
  return validators
 }catch{throw Error('DATA_SCHEMA_INVALID')}
}
export function validateDataInput(validators,action,input){if(validators&&!validators.get(action)?.(input))throw Error('DATA_INPUT_INVALID')}
export function dataReference(value){
 fail(value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).every(k=>['version','resource','accountId','entity','id'].includes(k))&&value.version===1&&text(value.resource)&&text(value.accountId)&&typeof value.entity==='string'&&/^[a-z][a-z0-9_.-]{0,79}$/.test(value.entity)&&(text(value.id)||Number.isSafeInteger(value.id)&&value.id>0),'REFERENCE_INVALID')
 return Object.freeze({version:1,resource:value.resource,accountId:value.accountId,entity:value.entity,id:value.id})
}
export function dataReferenceKey(value){const r=dataReference(value);return JSON.stringify([r.resource,r.accountId,r.entity,typeof r.id,r.id])}
export function requireDataFeatures(service,features){fail(service?.contractVersion===1&&features.every(f=>service.features?.includes(f)),'FEATURE_UNAVAILABLE');return service}
