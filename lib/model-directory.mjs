/** 展示与编辑 DSH 原生目录；所有执行选择仍由原生配置和注册表承载。 */
import { existsSync, readFileSync, lstatSync } from 'node:fs'
import { dirname } from 'node:path'
import { ensurePrivateDirectorySync, writeFileAtomic } from "./atomic.mjs"
const at=(value,path)=>path.reduce((node,key)=>node?.[key],value)
const copy=value=>structuredClone(value)
const piModule='@deepseek-ai/dsh-llm-pi-ai'
const modelView=m=>Object.fromEntries(['id','name','contextWindow','maxTokens','inputModalities'].filter(key=>m[key]!==undefined).map(key=>[key,m[key]]))
const piRecipe=model=>{const value=copy(model);if(value.inputModalities){value.input??=value.inputModalities;delete value.inputModalities}return value}

export class ModelDirectory {
  constructor(ctx,{statePath}={}) {this.ctx=ctx;this.known=new Map();this.statePath=statePath;this.saved={};this.loaded=false;this.busy=false;this.discovery=new Map()}
  async load(){
    if(this.loaded)return
    const file=typeof this.statePath==='function'?this.statePath():this.statePath
    if(file&&existsSync(file)){
      if(lstatSync(file).isSymbolicLink())throw Error('MODEL_STATE_INVALID')
      const parsed=JSON.parse(readFileSync(file,'utf8'))
      if(parsed.version!==1||!parsed.rows||typeof parsed.rows!=='object'||Array.isArray(parsed.rows))throw Error('MODEL_STATE_INVALID')
      this.saved=parsed.rows
    }
    this.loaded=true
  }
  async save(){
    const file=typeof this.statePath==='function'?this.statePath():this.statePath
    if(!file)return
    ensurePrivateDirectorySync(dirname(file))
    await writeFileAtomic(file,JSON.stringify({version:1,rows:this.saved},null,2),{mode:0o600,dirMode:0o700})
  }
  key(row){return JSON.stringify([row.settingsNs,row.provider,row.moduleName])}
  settings(){return this.ctx.get('settings')}
  async snapshot(){
    await this.load()
    const llm=this.ctx.get('llm');if(!llm)throw Error('MODEL_DIRECTORY_UNAVAILABLE')
    const [plugins,bundles,catalog]=await Promise.all([this.ctx.pluginManager.listPlugins(),this.ctx.pluginManager.listBundles(),this.ctx.sessionController.modelCatalog()])
    const declarations=llm.listConfigurableProviders(),registered=llm.listProviders?.(),views=this.settings()?.describe()??[]
    for(const entry of declarations)this.known.set(entry.provider,{...this.known.get(entry.provider),...entry})
    for(const plugin of plugins){
      if(plugin.enabled||!/^@deepseek-ai\/dsh-llm-(deepseek-api-key|deepseek-account|pi-ai)$/u.test(plugin.moduleName)||[...this.known.values()].some(row=>row.settingsNs===(plugin.patchId??plugin.entryId)))continue
      const provider='plugin-entry:'+plugin.entryId
      this.known.set(provider,{provider,displayName:typeof plugin.meta?.name==='string'?plugin.meta.name:plugin.meta?.name?.zh??plugin.moduleName.replace('@deepseek-ai/dsh-',''),settingsNs:plugin.patchId??plugin.entryId,settingsPath:[]})
    }
    for(const [id,row] of this.known)if(id.startsWith('plugin-entry:')&&declarations.some(x=>x.settingsNs===row.settingsNs))this.known.delete(id)
    const items=await Promise.all([...this.known].map(async([id,previous])=>{
      const plugin=plugins.find(row=>(row.patchId??row.entryId)===previous.settingsNs),view=views.find(row=>row.ns===previous.settingsNs),group=catalog.groups.find(row=>row.id===id)
      if(!plugin&&!group){this.known.delete(id);return null}
      const moduleName=plugin?.moduleName,route=moduleName===piModule&&previous.settingsPath?.length===2&&previous.settingsPath[0]==='providers'&&previous.settingsPath[1]===id
      const enabled=plugin?.enabled===false?false:registered?registered.some(row=>row.id===id):plugin?.enabled??Boolean(group)
      const saved=this.saved[this.key({...previous,moduleName})]
      let discovered=[]
      // 仅向原生适配器读取本地内置目录；账户目录由原生会话目录提供，不额外请求账户接口。
      if(plugin?.enabled&&llm.discoverModels&&(route||moduleName==='@deepseek-ai/dsh-llm-deepseek-api-key')){
        const cache=this.discovery.get(id)
        if(cache&&Date.now()-cache.at<30000)discovered=cache.models
        else try{discovered=await llm.discoverModels(previous.settingsNs,{provider:id},AbortSignal.timeout(3000));this.discovery.set(id,{at:Date.now(),models:discovered})}catch{/* 原目录或已知模型仍可查看；不虚构远程模型。 */}
      }
      const profile=view&&at(view.value,previous.settingsPath??[]),configured=profile?.models
      const inventory=new Map()
      for(const model of [...(saved?.inventory??[]),...(previous.models??[]),...discovered,...(group?.models??[])]) inventory.set(model.id,{...inventory.get(model.id),...modelView(model)})
      // 新发现的模型继承目录，仅原生显式 models 清单才限制选择。
      const selected=Array.isArray(configured)&&(configured.length||!route)?new Set(configured.map(m=>m.id)):route&&!enabled&&saved?.selected?new Set(saved.selected):undefined
      const models=[...inventory.values()].map(m=>({...m,enabled:selected?selected.has(m.id):true}))
      const writable=Boolean(view&&this.settings()?.writable!==false&&plugin?.enabled&&!plugin?.readOnlyReason)
      const inherited=route&&at(view?.base,previous.settingsPath)!==undefined
      const control=route?(writable&&!inherited?'route':undefined):plugin&&!plugin.readOnlyReason&&[...this.known.values()].filter(row=>row.settingsNs===previous.settingsNs).length===1?'plugin':undefined
      return {...previous,moduleName,entryId:plugin?.entryId,enabled,control,canToggle:Boolean(control),revision:view?.revision,canModelToggle:Boolean(writable&&(route&&!inherited||moduleName==='@deepseek-ai/dsh-llm-deepseek-api-key')),controlReason:inherited?'连接由启动配置固定，请在 DSH 配置中修改。':undefined,modelsKnown:inventory.size>0,models,version:bundles.find(b=>b.rows?.some(row=>row.moduleName===moduleName))?.version}
    }))
    for(const row of items)if(row)this.known.set(row.provider,row)
    return {items:items.filter(Boolean)}
  }
  async change(operation){if(this.busy)throw Error('MODEL_CONTROL_BUSY');this.busy=true;try{return await operation()}finally{this.busy=false}}
  async setEnabled(input){return this.change(async()=>{
    if(!input||Object.keys(input).some(k=>!['provider','entryId','enabled','expectedEnabled','expectedRevision'].includes(k))||typeof(input.provider??input.entryId)!=='string'||typeof input.enabled!=='boolean'||typeof input.expectedEnabled!=='boolean')throw Error('MODEL_CONTROL_INVALID')
    await this.snapshot()
    const row=[...this.known.values()].find(row=>input.provider?row.provider===input.provider:row.entryId===input.entryId&&row.canToggle)
    if(!row?.canToggle)throw Error('MODEL_CONTROL_FORBIDDEN')
    if(row.enabled!==input.expectedEnabled||input.expectedRevision!==undefined&&row.revision!==input.expectedRevision)throw Error('MODEL_CONTROL_CHANGED')
    if(row.control==='plugin'){
      const result=await this.ctx.pluginManager.setPluginEnabled(row.entryId,input.enabled)
      if(['failed','overridden'].includes(result.application))throw Error('MODEL_CONTROL_FAILED')
      return result
    }
    const settings=this.settings(),view=settings.describe().find(x=>x.ns===row.settingsNs),key=this.key(row),old=this.saved[key]??{}
    const profile=at(view.value,row.settingsPath)
    this.saved[key]={...old,...profile?{profile:copy(profile)}:{},inventory:row.models.map(modelView),selected:old.selected??row.models.filter(m=>m.enabled).map(m=>m.id)}
    await this.save() // 先留存恢复资料，再调用原生修订受控写入。
    const nextProfile=copy(this.saved[key].profile??{})
    if(input.enabled&&old.recipes){
      const selected=old.selected?.length?old.selected:row.models.map(m=>m.id)
      const recipes=new Map(old.recipes.map(m=>[m.id,m]))
      nextProfile.models=selected.map(id=>piRecipe(recipes.get(id)??{id}))
      delete nextProfile.modelOverrides
    }
    await settings.mutate(row.settingsNs,[input.enabled?{op:'set',path:row.settingsPath,value:nextProfile}:{op:'unset',path:row.settingsPath}],view.revision)
    return {application:'applied'}
  })}
  async setModelEnabled(input){return this.change(async()=>{
    if(!input||Object.keys(input).some(k=>!['provider','model','enabled','expectedEnabled','expectedRevision'].includes(k))||typeof input.provider!=='string'||typeof input.model!=='string'||typeof input.enabled!=='boolean'||typeof input.expectedEnabled!=='boolean')throw Error('MODEL_CONTROL_INVALID')
    await this.snapshot()
    const row=this.known.get(input.provider),model=row?.models.find(m=>m.id===input.model)
    if(!row?.canModelToggle||!model)throw Error('MODEL_CONTROL_FORBIDDEN')
    if(model.enabled!==input.expectedEnabled||input.expectedRevision!==undefined&&row.revision!==input.expectedRevision)throw Error('MODEL_CONTROL_CHANGED')
    const settings=this.settings(),view=settings.describe().find(x=>x.ns===row.settingsNs),key=this.key(row),saved=this.saved[key]??{}
    const profile=at(view.value,row.settingsPath)??saved.profile??{}
    const selected=row.models.filter(m=>m.id===input.model?input.enabled:m.enabled).map(m=>m.id)
    const recipes=new Map([...(saved.recipes??[]),...row.models.map(m=>({...modelView(m),...profile.modelOverrides?.[m.id]})),...(profile.models??[])].map(m=>[m.id,m]))
    // pi-ai 的空 models 表示恢复全目录，因此最后一项关闭时停用这一条路由。
    const pi=row.moduleName===piModule
    const models=selected.map(id=>pi?piRecipe(recipes.get(id)):copy(recipes.get(id)))
    this.saved[key]={profile:copy(profile),inventory:row.models.map(modelView),recipes:[...recipes.values()],selected}
    await this.save()
    if(!row.enabled&&pi)return {application:'applied'}
    const ops=pi&&!selected.length?[{op:'unset',path:row.settingsPath}]:[
      ...!row.enabled&&pi?[{op:'set',path:row.settingsPath,value:copy(profile)}]:[],
      {op:'set',path:[...row.settingsPath,'models'],value:models},
      ...pi&&profile.modelOverrides?[{op:'unset',path:[...row.settingsPath,'modelOverrides']}]:[],
    ]
    await settings.mutate(row.settingsNs,ops,view.revision)
    return {application:'applied'}
  })}
}
