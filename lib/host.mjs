/** 中台宿主入口：复用 DSH Web 服务，不装配或启动执行底座。 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { LayoutStore, resolveInstallationDirectory } from './layout.mjs'
import { createApiHandler } from './api.mjs'
import {SceneNavigationStore,installedSceneCatalog} from './scenes.mjs'
import {sceneApi} from './scene-api.mjs'
import {SceneRuntime,registerScenePreset} from "./native-scenes.mjs"
import {CompanionApplications,restoreCompanionEnvironment,NativeAddons} from "./native-companion.mjs"
import {RegistryPackages} from "./registry-packages.mjs"
import {PluginUpdates} from "./plugin-updates.mjs"
import {updateDistribution} from './update-distribution.mjs'
import {NativeCapabilities} from "./native-capabilities.mjs"
import {LocalDataAccess} from "./local-data-access.mjs"
import {personalAgentIdentity} from "./personal-agent-identity.mjs"
import {NativeDataTool} from "./native-data-tool.mjs"
import {Interoperability} from "./interoperability.mjs"
import { UsageStore, NativeUsage } from "./native-usage.mjs"
import { usageApi } from './usage-api.mjs'
import { consoleApi } from './console-api.mjs'
import {SceneModels} from './scene-models.mjs'
import {ArchiveManager} from './archives.mjs'
import {ManagedBundles} from "./managed-bundles.mjs"
import {KnowledgeSessions} from './knowledge-sessions.mjs'
import {knowledgeSessionsApi} from './knowledge-sessions-api.mjs'
import {CreationRuntime} from './creation-runtime.mjs'
import {PluginModels} from './plugin-models.mjs'
import {WebsiteAccount} from './website-account.mjs'
import {accountDistribution,createWebsiteAccountProvider} from './account-distribution.mjs'
import {accountApi} from './account-api.mjs'
import {ClientPreferences} from './client-preferences.mjs'

export const name = 'beellix-ui-bootstrap'
export const inject = ['webServer', 'connection', 'profileContext', 'pluginManager','sessionController','workspaceController','agents','agentPresets','loader','sessionPersistence','sessions']

export async function apply(ctx) {
  if(ctx.get('beellixEdition')||ctx.get('beellixEnterprise'))throw Error('社区版与企业版入口不能同时启用，请选择其中一个。')
  ctx.provide('beellixEdition',Object.freeze({kind:'community'}))
  // Account access must also work before companion-directory initialization.
  const account=new WebsiteAccount({distribution:accountDistribution,provider:createWebsiteAccountProvider(ctx),credentials:()=>ctx.get('credentials')})
  ctx.provide('beellixAccount',account.publicService())
  ctx.effect(()=>()=>account.dispose(),'Beelli X：官网账号生命周期')
  ctx.effect(()=>ctx.webServer.register({kind:'prefix',path:'/beellix/account',handler:accountApi({account,authorize:request=>{
    const denied=ctx.connection.requestRejection(request)
    if(denied!==undefined)return denied
    return ctx.connection.admit(request).peer?.principal?.kind==='owner'?undefined:403
  }})}),'Beelli X：官网账号接口')
  void account.restore().catch(()=>ctx.logger?.warn('Beelli X 登录状态暂不可恢复'))
  let store
  try {
    const installationDirectory = resolveInstallationDirectory({ executable: process.execPath, installAnchor: ctx.profileContext.installAnchor })
    const appData = process.env.LOCALAPPDATA ?? join(homedir(), 'AppData', 'Local')
    store = new LayoutStore({ installationDirectory, locatorDirectory: join(appData, 'BeelliX', 'bootstrap'), dshHome: ctx.profileContext.home })
    try{await store.prepare()}catch(error){ctx.logger?.warn('Beelli X 配套目录待处理：'+error.message)}
  } catch (error) {
    store = { state: () => ({ status: 'blocked', message: error.message, directories: [] }), initialize: async () => { throw error } }
  }
  const version = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version
  const handler = createApiHandler({ store, version, authorize: typeof ctx.connection.requestRejection === 'function' ? request => ctx.connection.requestRejection(request) : undefined,onError:error=>ctx.logger?.warn('Beelli X 中台操作：'+(error.stack??error.message)) })
  ctx.effect(() => ctx.webServer.register({ kind: 'prefix', path: '/beellix/bootstrap', handler }), 'Beelli X 中台：配套目录接口')
  if(store.root){
    const clientPreferences=new ClientPreferences(store.root)
    let scenes,readSceneDirectory,addons
    const managedBundles=new ManagedBundles(store.root,ctx,{owned:()=>addons.owned()})
    ctx.effect(()=>()=>managedBundles.dispose(),'Beelli X：中台包原生加载生命周期')
    const catalog=installedSceneCatalog(ctx,{manager:managedBundles,manifestFor:name=>managedBundles.readManifest(name)})
    const archives=new ArchiveManager(store.root,{archived:()=>ctx.get('workspaceRegistry').archivedSessionIds,sessions:()=>ctx.sessionController.list({},new AbortController().signal),workspaces:()=>ctx.get('workspaceRegistry').list(),scenes:()=>{if(!readSceneDirectory)throw Error('ARCHIVE_UNAVAILABLE');return readSceneDirectory()}})
    addons = new NativeAddons(store.root, managedBundles, { restoreEnvironment: (options) => restoreCompanionEnvironment(store.root, { invocation: ctx.profileContext.packageManager, subprocess: ctx.get('subprocess'),...options }) })
    const registry=new RegistryPackages(addons)
    const updates=new PluginUpdates(store.root,{addons,distribution:updateDistribution,ready:()=>store.state().status==='ready',validateManifest:async manifest=>{const boot=await ctx.loader.import('@deepseek-ai/dsh-app-boot'),compatibility=boot.evaluatePluginCompatibility(manifest,ctx.profileContext?boot.readProfileVersionExemptions(ctx.profileContext.dir):{});if(compatibility&&!compatibility.exempted)throw Error('ADDON_DSH_VERSION_UNSUPPORTED')}})
    ctx.effect(()=>{updates.start();return()=>updates.dispose()},'Beelli X：内置发布服务的版本检查')
    const platform=new NativeCapabilities(store.root,{owned:()=>addons.owned(),ready:()=>store.state().status==='ready'})
    const sceneModels=new SceneModels(store.root,{catalog,models:()=>ctx.sessionController.modelCatalog(),configuration:id=>ctx.get('beellixScenes')?.providers.get(id)?.provider.modelConfiguration})
    const pluginModels=new PluginModels(store.root,{catalog:async()=>[...(await catalog()).map(row=>({...row,id:row.packageName,kind:'scene'})),...(await addons.snapshot()).filter(row=>row.category!=='scenarios'&&['enabled','disabled','pending','failed'].includes(row.state)).map(row=>({id:row.name,title:row.title??row.name,version:row.version,enabled:row.state==='enabled',kind:'capability',models:row.models,panel:row.panel}))],models:()=>ctx.sessionController.modelCatalog(),configuration:id=>[...(ctx.get('beellixScenes')?.providers.values()??[])].find(row=>row.provider.packageName===id)?.provider.modelConfiguration??[...platform.connections.values()].find(row=>row.name===id)?.modelConfiguration,resolveModel:(provider,model)=>ctx.get('llm').resolveModelInfo(provider,model)})
    ctx.provide('beellixPlatform',platform)
    let knowledgeSessions
    const permissions=new LocalDataAccess(store.root,{owned:async()=>{const rows=await addons.owned(),labels=await addons.snapshot();return rows.map(row=>({...row,title:labels.find(p=>p.name===row.name)?.title??row.name}))},ready:()=>store.state().status==='ready',resolveAgent:(agent,resource)=>personalAgentIdentity(ctx,knowledgeSessions,agent,resource)})
    ctx.provide('beellixData',permissions.publicService())
    const dataTools=new NativeDataTool(permissions)
    ctx.effect(()=>()=>{dataTools.dispose();return permissions.dispose()},'Beelli X：本机主用户数据入口及原生工具生命周期')
    const interoperability=new Interoperability(store.root,{owned:()=>addons.owned(),ready:()=>store.state().status==='ready',secrets:{get:async ref=>(await ctx.get('credentials')?.resolve(ref))?.value,set:(ref,value)=>{const service=ctx.get('credentials');if(!service)throw Error('INTEGRATION_CREDENTIALS_UNAVAILABLE');return service.set(ref,value)}}})
    ctx.provide('beellixInteroperability',interoperability.publicService())
    ctx.effect(()=>()=>interoperability.dispose(),'Beelli X：跨应用授权生命周期')
    knowledgeSessions=new KnowledgeSessions(store.root,{owned:()=>addons.owned(),inspect:async id=>{try{return await ctx.sessionController.inspect(id)}catch(error){if(error.code==='session/not-found'||error.constructor?.name==='ApiSessionNotFound')return null;throw error}}})
    ctx.provide('beellixKnowledgeSessions',knowledgeSessions)
    ctx.effect(()=>()=>knowledgeSessions.dispose(),'Beelli X：会话知识范围生命周期')
    ctx.effect(()=>ctx.webServer.register({kind:'prefix',path:'/beellix/knowledge-sessions',handler:knowledgeSessionsApi({store:knowledgeSessions,authorize:request=>{const denied=ctx.connection.requestRejection(request);if(denied!==undefined)return denied;return ctx.connection.admit(request).peer?.principal?.kind==='owner'?undefined:403}})}),'Beelli X：会话知识选择接口')

    ctx.effect(()=>()=>platform.dispose(),'Beelli X：自有能力接入生命周期')
    ctx.effect(() => ctx.webServer.register({ kind: 'prefix', path: '/beellix/console', handler: consoleApi({ clientPreferences, authorizePreferences:request=>ctx.connection.admit(request).peer?.principal?.kind==='owner'?undefined:403, addons, registry, updates, interoperability, authorizeIntegration:request=>ctx.connection.admit(request).peer?.principal?.kind==='owner'?undefined:403, authorizeUpdates:request=>ctx.connection.admit(request).peer?.principal?.kind==='owner'?undefined:403, platform, ctx, sceneManager:managedBundles, sceneModels, pluginModels, archives, sceneDirectory:()=>{if(!readSceneDirectory)throw Error('ARCHIVE_UNAVAILABLE');return readSceneDirectory()}, modelStatePath:()=>join(store.root,'config/model-controls/state.json'), ready: () => store.state().status === 'ready', catalog, authorize: request => ctx.connection.requestRejection(request), onError: error => ctx.logger?.warn('Beelli X 中台：' + error.message) }) }), 'Beelli X：中台管理接口')
    const usage = new UsageStore(store.root)
    const nativeUsage = new NativeUsage(usage, { list: async () => [...await ctx.sessionPersistence.list(), ...ctx.sessions.list().map(session => ({ header: session.header }))], inspect: id => ctx.sessionController.inspect(id) })
    const recordUsage = session => { if (store.state().status === 'ready') void nativeUsage.capture(session.id).catch(error => ctx.logger?.warn('Beelli X 用量记录：' + error.message)) }
    ctx.on('session/event', (session, event) => { if (['assistant/message', 'assistant/attempt', 'compaction/summary'].includes(event.type)) recordUsage(session) })
    const flushUsage = () => nativeUsage.flush().catch(error => ctx.logger?.warn('Beelli X 用量待重新同步：' + error.message))
    ctx.on('session/flush', flushUsage)
    ctx.effect(() => flushUsage, 'Beelli X：用量记录完成')
    ctx.effect(() => ctx.webServer.register({ kind: 'prefix', path: '/beellix/usage', handler: usageApi({ store: usage, native: nativeUsage, authorize: request => ctx.connection.requestRejection(request), ready: () => store.state().status === 'ready', catalog: () => ctx.sessionController.modelCatalog(), onError: error => ctx.logger?.warn('Beelli X 用量接口：' + error.message) }) }), 'Beelli X：模型价格与用量接口')
    const runtime=new SceneRuntime(store.root,{getAgent:id=>ctx.agents.get(id),inspectSession:id=>ctx.sessionController.inspect(id)})
    ctx.provide('beellixScenes',runtime)
    const creation=new CreationRuntime(store.root,{sceneBinding:async id=>(await runtime.bindingState()).bindings[id],capabilities:async()=>{const rows=await managedBundles.records();return rows.filter(row=>['@beellix-ai/database','@beellix-ai/knowledge','@beellix-ai/data-platform'].includes(row.name)).map(row=>({name:row.name,version:row.version,installed:true,enabled:row.enabled===true,loaded:managedBundles.mounted.has(row.name)&&platform.connections.has(row.id),error:managedBundles.errors.get(row.name)??null,initialization:'not-probed'}))}})
    if(store.state().status==='ready')await creation.activation()
    ctx.effect(()=>()=>creation.dispose(),'Beelli X：原生创造标准作用域')
    const mount=async agent=>{if(store.state().status!=='ready')return;await runtime.mountAgent(agent);await creation.sync(agent);dataTools.mount(agent)}
    ctx.on('agent/created',async({agent})=>{await mount(agent)})
    ctx.on('agent/disposed',({agent})=>{dataTools.remove(agent.id,{disposed:true});creation.remove(agent.id,{contextDisposed:true});void runtime.removeAgent(agent).catch(error=>ctx.logger.warn('Beelli X 场景释放：'+error.message))})
    ctx.on('agent/pre-step',async({agent},next)=>{await mount(agent);return next()})
    ctx.on('agent-preset/selected',id=>{const agent=ctx.agents.get(id);if(agent)void mount(agent).catch(error=>ctx.logger.warn(error.message))})
    ctx.effect(()=>()=>runtime.dispose(),'Beelli X：原生场景资源生命周期')
    for(const agent of ctx.agents.list())await mount(agent)
    let presetPromise
    const ensurePreset=()=>presetPromise??=registerScenePreset(ctx).then(dispose=>{ctx.effect(()=>dispose,'Beelli X：原生场景模式');return true}).catch(error=>{presetPromise=undefined;throw error})
    const inspect=async id=>{try{return await ctx.sessionController.inspect(id)}catch(error){if(error.code==='session/not-found'||error.constructor?.name==='ApiSessionNotFound')return null;throw error}}
    scenes=new SceneNavigationStore(store.root,{catalog,create:request=>ctx.sessionController.create(request),workspace:request=>ctx.workspaceController.create(request),resolveWorkspace:id=>{const row=ctx.get('workspaceRegistry').get(id);return row?{workspaceId:row.id,path:row.path}:undefined},listWorkspaces:()=>ctx.get('workspaceRegistry').list(),bindings:runtime,ensurePreset,inspect,previousRoots:()=>store.state().previousRoots??[],ready:()=>store.state().status==='ready'})
    readSceneDirectory=scenes.snapshot.bind(scenes);let cleanupWarning=false
    const clearedSessions=async()=>{try{const value=(await archives.load()).cleared.map(row=>row.id);cleanupWarning=false;return value}catch{if(!cleanupWarning){cleanupWarning=true;ctx.logger?.warn('归档清理记录暂不可用，场景归属仍沿原绑定读取。')}return[]}}
    scenes.snapshot=async()=>({...await readSceneDirectory(),clearedSessionIds:await clearedSessions()})
    const applications=new CompanionApplications(store.root,managedBundles,{restoreEnvironment:()=>restoreCompanionEnvironment(store.root,{invocation:ctx.profileContext.packageManager,subprocess:ctx.get('subprocess')})})
    scenes.reconnectPlugins=async packet=>{if(store.state().status!=='ready')throw Error('请先初始化配套目录');await addons.recover();return applications.reconnect(packet)}
    store.reconnectApplications=()=>scenes.reconnectPlugins({})
    store.readState=async()=>{if(store.state().status==='ready')await addons.recover();return {...store.state(),...store.state().status==='ready'?{applications:await applications.snapshot()}:{}}}
    ctx.effect(()=>ctx.webServer.register({kind:'prefix',path:'/beellix/scenes',handler:sceneApi({store:scenes,authorize:request=>ctx.connection.requestRejection(request),authorizeDirectory:request=>ctx.connection.admit(request).peer?.principal?.kind==='owner'?undefined:403})}),'Beelli X：场景导航接口')
    await ensurePreset()
  }
}
