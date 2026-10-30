/** Beelli X 包管理契约；执行与 DSH 引擎兼容仍由原生 Bundle 管理器负责。 */
export const BRIDGE_CONTRACT_VERSION=1
export function modelDefinition(manifest){
 const value=manifest.beellixModels;if(value===undefined)return undefined
 if(!value||value.schemaVersion!==1||!Array.isArray(value.purposes)||value.purposes.length>32||new Set(value.purposes.map(p=>p.id)).size!==value.purposes.length)throw Error('ADDON_MODEL_CONTRACT_INVALID')
 for(const row of value.purposes)if(!row||Object.keys(row).some(k=>!['id','title','kind','operation','required','default','inputModalities'].includes(k))||!/^[a-z][a-z0-9-]{0,79}$/.test(row.id??'')||typeof row.title!=='string'||!row.title.trim()||row.title.length>200||!['vision','document','audio','retrieval','other'].includes(row.kind)||!['chat','embedding','rerank','parse'].includes(row.operation)||typeof row.required!=='boolean'||row.default!==undefined&&row.default!=='host-main'||row.inputModalities!==undefined&&(!Array.isArray(row.inputModalities)||row.inputModalities.some(v=>!['text','image','audio','video'].includes(v))))throw Error('ADDON_MODEL_CONTRACT_INVALID')
 return structuredClone(value)
}
export function capabilityDefinition(manifest){
 const value=manifest.beellixCapability;if(value===undefined)return undefined
 if(!value||typeof value!=='object'||Array.isArray(value)||!/^[a-z][a-z0-9-]{0,79}$/u.test(value.id??''))throw Error('ADDON_CONTRACT_INVALID')
 const category=value.category??(['knowledge','data-platform'].includes(value.id)?'resources':undefined)
 if(!['models','tools','mcp','skills','resources'].includes(category))throw Error('ADDON_CONTRACT_INVALID')
 if(['knowledge','data-platform'].includes(value.id)&&(!['@beellix-ai/'+value.id,'@beellix/'+value.id].includes(manifest.name)||category!=='resources'))throw Error('ADDON_CONTRACT_INVALID')
 const ui=value.ui??{};if(!ui||typeof ui!=='object'||Array.isArray(ui)||Object.keys(ui).some(key=>!['panel','configPanel'].includes(key)))throw Error('ADDON_CONTRACT_INVALID')
 const prefix='beellix-'+value.id
 for(const panel of Object.values(ui))if(typeof panel!=='string'||panel.length>120||!/^beellix-[a-z0-9-]+$/u.test(panel)||panel!==prefix&&!panel.startsWith(prefix+'-'))throw Error('ADDON_CONTRACT_INVALID')
 return{id:value.id,category,...ui.panel?{panel:ui.panel}:{},...ui.configPanel?{configPanel:ui.configPanel}:{}}
}
const contributions=new Set(['ui','services','tools','skills','models','mcp','resources'])
export function packageContract(manifest){
 capabilityDefinition(manifest)
 modelDefinition(manifest)
 const requirements=manifest.beellixRequirements
 if(requirements!==undefined&&(!requirements||requirements.schemaVersion!==1||!Array.isArray(requirements.capabilities)||requirements.capabilities.length>32||requirements.capabilities.some(r=>!r||!/^[a-z][a-z0-9-]{0,79}$/.test(r.id??'')||!Number.isSafeInteger(r.contractVersion)||r.contractVersion<1||!Array.isArray(r.features)||r.features.length>32||r.features.some(f=>typeof f!=='string'||!/^[-a-z0-9]{1,80}$/.test(f)))))throw Error('ADDON_REQUIREMENTS_INVALID')
 const value=manifest.beellixContract
 // 已交付的旧包保持可接回；升级时仍按数据版本 1 校验，不改写旧清单。
 if(value===undefined)return{legacy:true,schemaVersion:1,data:{schemaVersion:1,uninstall:'retain'}}
 if(!value||typeof value!=='object'||Array.isArray(value))throw Error('ADDON_CONTRACT_INVALID')
 if(value.schemaVersion!==1||!Number.isSafeInteger(value.bridge?.min)||!Number.isSafeInteger(value.bridge?.max)||value.bridge.min<1||value.bridge.max<value.bridge.min||value.bridge.min>BRIDGE_CONTRACT_VERSION||value.bridge.max<BRIDGE_CONTRACT_VERSION)throw Error('ADDON_CONTRACT_UNSUPPORTED')
 if(!Array.isArray(value.contributes)||!value.contributes.length||value.contributes.some(item=>!contributions.has(item))||!Number.isSafeInteger(value.data?.schemaVersion)||value.data.schemaVersion<1||value.data.uninstall!=='retain')throw Error('ADDON_CONTRACT_INVALID')
 if(manifest.beellixScenario&&(value.execution?.basePreset!=='standard'||value.execution?.context!=='bound-scene'||value.execution?.subagents!=='read-only'))throw Error('ADDON_CONTRACT_INVALID')
 return{...value,legacy:false}
}
