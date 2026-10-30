/** 场景模型只接专用能力的原生配置，不干预 DSH 主聊天模型。 */
const valid=value=>typeof value==='string'&&value.length>0&&value.length<=200&&!/[\u0000-\u001f]/u.test(value)
export class SceneModels{
 constructor(_root,{catalog,models,configuration=()=>undefined}){this.catalog=catalog;this.models=models;this.configuration=configuration}
 async describe(scene){
  const adapter=this.configuration(scene.id)
  if(!adapter||typeof adapter.read!=='function'||typeof adapter.write!=='function')return{...scene,revision:0,purposes:[]}
  const state=await adapter.read()
  if(!Number.isSafeInteger(state?.revision)||!Array.isArray(state.purposes)||state.purposes.length>32||state.purposes.some(row=>!valid(row.id)||!valid(row.title))||new Set(state.purposes.map(row=>row.id)).size!==state.purposes.length)throw Error('MODEL_STATE_INVALID')
  return{...scene,revision:state.revision,purposes:state.purposes.map(row=>({id:row.id,title:row.title,selection:row.selection??null}))}
 }
 async snapshot(){const [scenes,catalog]=await Promise.all([this.catalog(),this.models()]);return{scenes:await Promise.all(scenes.map(scene=>this.describe(scene))),groups:catalog.groups}}
 async save(input){
  if(!input||Object.keys(input).some(key=>!['sceneId','purposeId','selection','expectedRevision'].includes(key))||!valid(input.sceneId)||!valid(input.purposeId)||!Number.isSafeInteger(input.expectedRevision))throw Error('MODEL_CONTROL_INVALID')
  const scene=(await this.catalog()).find(row=>row.id===input.sceneId)
  if(!scene||!scene.enabled)throw Error('SCENE_MODEL_UNAVAILABLE')
  const state=await this.describe(scene)
  if(!state.purposes.some(row=>row.id===input.purposeId))throw Error('SCENE_MODEL_UNAVAILABLE')
  if(state.revision!==input.expectedRevision)throw Error('MODEL_CONTROL_CHANGED')
  const selection=input.selection
  if(selection!==null){
   if(!selection||Object.keys(selection).some(key=>!['provider','model'].includes(key))||!valid(selection.provider)||!valid(selection.model))throw Error('MODEL_CONTROL_INVALID')
   const catalog=await this.models()
   if(!catalog.groups.some(group=>group.id===selection.provider&&group.models.some(model=>model.id===selection.model)))throw Error('SCENE_MODEL_UNAVAILABLE')
  }
  return this.configuration(scene.id).write({purposeId:input.purposeId,selection,expectedRevision:input.expectedRevision})
 }
}
