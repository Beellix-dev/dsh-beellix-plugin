/** 专用模型接入：用途由插件声明，凭据与推理仍交给 DSH。 */
export const modelKinds=Object.freeze({vision:'视觉',document:'文档',audio:'语音',retrieval:'检索',other:'其他'})
const valid=value=>typeof value==='string'&&value.length>0&&value.length<=200&&!/[\u0000-\u001f]/u.test(value)
const selectionValid=value=>value===null||value&&Object.keys(value).every(key=>['provider','model'].includes(key))&&valid(value.provider)&&valid(value.model)
function modelConnection(value){
 if(value===undefined)return
 if(!value||Object.keys(value).some(key=>!['kind','model','endpoint'].includes(key))||!['local','api'].includes(value.kind)||!valid(value.model))throw Error('MODEL_STATE_INVALID')
 if(value.endpoint!==undefined){let url;try{url=new URL(value.endpoint)}catch{throw Error('MODEL_STATE_INVALID')}if(!['http:','https:'].includes(url.protocol)||url.username||url.password||url.search||url.hash||value.endpoint.length>2048)throw Error('MODEL_STATE_INVALID')}
 return{kind:value.kind,model:value.model,...value.endpoint?{endpoint:value.endpoint}:{}}
}
export class PluginModels{
 constructor(_root,{catalog,models,configuration=()=>undefined,resolveModel}={}){this.catalog=catalog;this.models=models;this.configuration=configuration;this.resolveModel=resolveModel}
 async describe(plugin){
  const adapter=this.configuration(plugin.id)
  const state=adapter&&typeof adapter.read==='function'&&typeof adapter.write==='function'?await adapter.read():{revision:0,purposes:(plugin.models?.purposes??[]).map(p=>({...p,selection:null,...p.operation!=='chat'?{configurationPanel:plugin.panel}:{} }))}
  if(!Number.isSafeInteger(state?.revision)||state.revision<0||!Array.isArray(state.purposes)||state.purposes.length>32||new Set(state.purposes.map(p=>p.id)).size!==state.purposes.length)throw Error('MODEL_STATE_INVALID')
  const purposes=state.purposes.map(row=>{
   if(!valid(row.id)||!valid(row.title)||!selectionValid(row.selection??null)||row.kind!==undefined&&!Object.hasOwn(modelKinds,row.kind)||row.inputModalities!==undefined&&(!Array.isArray(row.inputModalities)||row.inputModalities.some(v=>!['text','image','audio','video'].includes(v))))throw Error('MODEL_STATE_INVALID')
   if(row.operation!==undefined&&!['chat','embedding','rerank','parse'].includes(row.operation)||row.configurationPanel!==undefined&&!/^beellix-[a-z0-9-]+$/.test(row.configurationPanel))throw Error('MODEL_STATE_INVALID')
   if(row.enabled!==undefined&&typeof row.enabled!=='boolean'||row.canToggle!==undefined&&typeof row.canToggle!=='boolean')throw Error('MODEL_STATE_INVALID')
   return {id:row.id,title:row.title,kind:row.kind??'other',inputModalities:row.inputModalities??[],operation:row.operation??'chat',configured:row.configured===true,enabled:row.enabled!==false,canToggle:row.canToggle===true,connection:modelConnection(row.connection),configurationPanel:row.configurationPanel,selection:row.selection??null}
  })
  return {...plugin,revision:state.revision,purposes}
 }
 async snapshot(){const [plugins,catalog]=await Promise.all([this.catalog(),this.models()]);return {plugins:await Promise.all(plugins.map(row=>this.describe(row))),groups:catalog.groups,kinds:modelKinds}}
 async validateSelection(selection,modalities=[],operation='chat'){
  if(operation!=='chat')throw Error('PLUGIN_MODEL_PURPOSE_REQUIRED')
  if(!selectionValid(selection))throw Error('MODEL_CONTROL_INVALID')
  if(selection===null)return
  const catalog=await this.models(),model=catalog.groups.find(group=>group.id===selection.provider)?.models.find(row=>row.id===selection.model)
  if(!model)throw Error('PLUGIN_MODEL_UNAVAILABLE')
  const info=modalities.length&&this.resolveModel?await this.resolveModel(selection.provider,selection.model):model
  if(modalities.some(kind=>!info?.inputModalities?.includes(kind)))throw Error('MODEL_CAPABILITY_REQUIRED')
 }
 async save(input){
  const keys=['pluginId','purposeId','selection','enabled','expectedRevision']
  if(!input||Object.keys(input).some(key=>!keys.includes(key))||!Number.isSafeInteger(input.expectedRevision)||input.expectedRevision<0||!valid(input.pluginId)||!valid(input.purposeId)||Object.hasOwn(input,'selection')===Object.hasOwn(input,'enabled'))throw Error('MODEL_CONTROL_INVALID')
  const plugin=(await this.catalog()).find(row=>row.id===input.pluginId)
  if(!plugin?.enabled)throw Error('PLUGIN_MODEL_UNAVAILABLE')
  const state=await this.describe(plugin),purpose=state.purposes.find(row=>row.id===input.purposeId)
  if(!purpose)throw Error('PLUGIN_MODEL_UNAVAILABLE')
  if(state.revision!==input.expectedRevision)throw Error('MODEL_CONTROL_CHANGED')
  if(Object.hasOwn(input,'enabled')){
   if(typeof input.enabled!=='boolean')throw Error('MODEL_CONTROL_INVALID')
   if(purpose.operation==='chat'||!purpose.canToggle||input.enabled&&!purpose.configured||typeof this.configuration(plugin.id)?.write!=='function')throw Error('PLUGIN_MODEL_UNAVAILABLE')
   return this.configuration(plugin.id).write({purposeId:input.purposeId,enabled:input.enabled,expectedRevision:input.expectedRevision})
  }
  await this.validateSelection(input.selection,purpose.inputModalities,purpose.operation)
  return this.configuration(plugin.id).write({purposeId:input.purposeId,selection:input.selection,expectedRevision:input.expectedRevision})
 }
}
