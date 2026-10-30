/** 场景只记录原生会话归属；应用代码、业务记录和会话日志各归原服务。 */
import {readFile,mkdir,lstat,readdir} from 'node:fs/promises'
import {join,dirname,resolve,relative,isAbsolute,sep} from 'node:path'
import {randomUUID,createHash} from 'node:crypto'
import {createRequire} from 'node:module'
import {withFileLock,writeFileAtomic} from "../../../../dev/shared/atomic-write/lib/index.js"
const idPattern=/^[a-z][a-z0-9-]{0,79}$/u
const sessionPattern=/^[A-Za-z0-9_-]{1,200}$/u
const exact=(packet,keys)=>{if(!packet||Array.isArray(packet)||typeof packet!=='object'||Object.keys(packet).some(k=>!keys.includes(k)))throw Error('INPUT_INVALID')}
async function safeDirectory(path){const parent=dirname(path);if(parent!==path)await safeDirectory(parent);try{const stat=await lstat(path);if(stat.isSymbolicLink()||!stat.isDirectory())throw Error('DIRECTORY_UNSAFE')}catch(error){if(error.code!=='ENOENT')throw error;try{await mkdir(path)}catch(created){if(created.code!=='EEXIST')throw created;const stat=await lstat(path);if(stat.isSymbolicLink()||!stat.isDirectory())throw Error('DIRECTORY_UNSAFE')}}}
async function existingDirectory(path){if(typeof path!=='string'||!isAbsolute(path))throw Error('DIRECTORY_UNSAFE');const parent=dirname(path);if(parent!==path)await existingDirectory(parent);const stat=await lstat(path);if(stat.isSymbolicLink()||!stat.isDirectory())throw Error('DIRECTORY_UNSAFE')}
const inside=(root,path)=>{const part=relative(resolve(root),resolve(path));return part===''||!isAbsolute(part)&&part!=='..'&&!part.startsWith('..'+sep)}
async function readPlainJson(path,maxBytes=2*1024*1024){const stat=await lstat(path);if(stat.isSymbolicLink()||!stat.isFile()||stat.size>maxBytes)throw Error('SCENE_RECORD_UNSAFE');return JSON.parse(await readFile(path,'utf8'))}

/** 从原生插件清单验证安装与启用状态，不把磁盘上任意文件夹当作场景。 */
export function installedSceneCatalog({pluginManager,profileContext},{manager=pluginManager,manifestFor}={}){
  const require=createRequire(join(profileContext.dir,'package.json'))
  return async()=>{
    const scenes=[]
    for(const bundle of await manager.listBundles()){
      if(!bundle.installed||bundle.availability==='missing')continue
      let manifest
      try{manifest=await manifestFor?.(bundle.name)??await readPlainJson(require.resolve(bundle.name+'/package.json'),128*1024)}catch{continue}
      const scene=manifest.beellixScenario
      if(!scene||!idPattern.test(scene.id)||typeof scene.title!=='string'||scene.title.length>80||typeof scene.tabKind!=='string'||!idPattern.test(scene.tabKind))continue
      if(scenes.some(x=>x.id===scene.id))throw Error('SCENE_ID_CONFLICT')
      scenes.push({id:scene.id,title:scene.title,tabKind:scene.tabKind,packageName:bundle.name,version:manifest.version,enabled:bundle.enabled&&!bundle.error})
    }
    return scenes
  }
}

export class SceneNavigationStore{
  constructor(root,{catalog,create,workspace,resolveWorkspace,listWorkspaces=()=>[],bindings,inspect,previousRoots=()=>[],ensurePreset=async()=>{},ready=()=>true}){this.root=resolve(root);this.path=join(this.root,'config/scene-navigation.json');this.catalog=catalog;this.create=create;this.workspace=workspace;this.resolveWorkspace=resolveWorkspace;this.listWorkspaces=listWorkspaces;this.bindings=bindings;this.inspect=inspect;this.ensurePreset=ensurePreset;this.ready=ready;this.previousRoots=previousRoots}
  async load(){if(!this.ready())throw Error('请先在 Beelli X 中台初始化配套目录');try{const state=await readPlainJson(this.path);if(state.schemaVersion!==1||!Number.isSafeInteger(state.revision)||!Array.isArray(state.added)||!state.links||!Array.isArray(state.requests))throw Error('SCENE_STATE_INVALID');return state}catch(error){if(error.code!=='ENOENT')throw error;return{schemaVersion:1,revision:0,added:[],links:{},requests:[]}}}
  async snapshot(){
    const state=await this.load(),installed=await this.catalog(),bindings=await this.bindings?.load(),retainedSessionIds=[]
    for(const [sessionId,sceneId]of Object.entries(state.links)){
      if(!sessionPattern.test(sessionId)||!idPattern.test(sceneId)||state.recoveries?.[sessionId])continue
      const businessId=bindings?.bindings?.[sessionId]?.businessSessionId??sessionId
      if(!sessionPattern.test(businessId))throw Error('SCENE_BINDING_INVALID')
      try{const stat=await lstat(join(this.root,'data',sceneId,'sessions',createHash('sha256').update(businessId).digest('hex')+'.json'));if(stat.isSymbolicLink()||!stat.isFile()||stat.size>64*1024*1024)throw Error('SCENE_RECORD_UNSAFE');retainedSessionIds.push(sessionId)}catch(error){if(error.code!=='ENOENT')throw error}
    }
    const sceneSessionIds=[...new Set([...Object.keys(state.links),...Object.keys(bindings?.bindings??{}),...state.requests.map(row=>row.sessionId)])]
    // 只识别自有配套根中的已绑定执行目录，用于界面投影，不按路径认定会话归属。
    const paths=new Set(),key=path=>process.platform==='win32'?resolve(path).toLowerCase():resolve(path)
    for(const [sessionId,sceneId]of Object.entries(state.links))if(sessionPattern.test(sessionId)&&idPattern.test(sceneId))for(const root of [this.root,...this.previousRoots()]){
      paths.add(key(join(root,'files/scenes',sceneId)));paths.add(key(join(root,'files/scenes',sceneId,sessionId)))
    }
    const managedWorkspaceIds=(await this.listWorkspaces()).filter(row=>typeof row.path==='string'&&paths.has(key(row.path))).map(row=>row.id??row.workspaceId)
    return{revision:state.revision,installed,scenes:state.added.map(id=>installed.find(x=>x.id===id)??{id,title:id,enabled:false,missing:true}),links:state.links,sceneSessionIds,managedWorkspaceIds,recoveries:state.recoveries??{},retainedSessionIds,previousRoots:this.previousRoots()}
  }
  async transaction(run){if(!this.ready())throw Error('请先在 Beelli X 中台初始化配套目录');await safeDirectory(dirname(this.path));return withFileLock(this.path,run)}
  async save(state){await writeFileAtomic(this.path,JSON.stringify(state,null,2)+'\n',{mode:0o600})}
  async add(packet){exact(packet,['sceneId','expectedRevision']);return this.transaction(async()=>{
    const state=await this.load();if(state.revision!==packet.expectedRevision)throw Error('REVISION_CONFLICT')
    const scene=(await this.catalog()).find(x=>x.id===packet.sceneId);if(!scene)throw Error('SCENE_NOT_INSTALLED');if(!scene.enabled)throw Error('SCENE_DISABLED')
    if(!state.added.includes(scene.id)){
      // 初次添加时仅投影应用已保存的会话标识；原报价文件不改、不复制。
      const directory=join(this.root,'data',scene.id,'sessions')
      try{
        const stat=await lstat(directory);if(stat.isSymbolicLink()||!stat.isDirectory())throw Error('SCENE_RECORD_UNSAFE')
        const files=(await readdir(directory)).filter(x=>x.endsWith('.json'));if(files.length>2000)throw Error('场景会话过多，请先整理后重试')
        for(const file of files){const value=await readPlainJson(join(directory,file),64*1024*1024);if(value.schemaVersion===1&&sessionPattern.test(value.sessionId??'')&&value.record&&!state.links[value.sessionId])state.links[value.sessionId]=scene.id}
      }catch(error){if(error.code!=='ENOENT')throw error}
      state.added.push(scene.id);state.revision++;await this.save(state)
    }
    return this.snapshot()
  })}
  async remove(packet){exact(packet,['sceneId','expectedRevision']);return this.transaction(async()=>{
    const state=await this.load();if(state.revision!==packet.expectedRevision)throw Error('REVISION_CONFLICT')
    if(!idPattern.test(packet.sceneId??'')||!state.added.includes(packet.sceneId))throw Error('SCENE_NOT_ADDED')
    state.added=state.added.filter(id=>id!==packet.sceneId);state.revision++;await this.save(state)
    return this.snapshot()
  })}
  async reconnectSession(packet){
    exact(packet,['sceneId','sessionId','requestId'])
    if(!sessionPattern.test(packet.sessionId??'')||(await this.load()).links[packet.sessionId]!==packet.sceneId)throw Error('SCENE_SESSION_UNKNOWN')
    if(!this.inspect)throw Error('DSH 会话检查服务未就绪')
    const snapshot=await this.inspect(packet.sessionId)
    const cwd=snapshot?.meta?.cwd
    if(snapshot&&typeof cwd!=='string')throw Error('SCENE_WORKSPACE_UNKNOWN')
    if(snapshot){
      // 归属只认绑定。旧共享目录和用户自选的有效目录都直接打开，不重新分配 cwd。
      try{await existingDirectory(cwd);return{sessionId:packet.sessionId,sceneId:packet.sceneId,restored:false}}catch(error){
        if(error.code!=='ENOENT')throw error
        // 只恢复已知的配套目录搬迁；丢失的自选目录不得被悄悄换成默认目录。
        if(!this.previousRoots().some(root=>inside(join(root,'files/scenes',packet.sceneId),cwd)))throw Error('SCENE_DIRECTORY_UNAVAILABLE：原执行目录不可用，请恢复目录或从目录入口新建会话')
      }
    }
    return this.createSession({sceneId:packet.sceneId,requestId:packet.requestId},packet.sessionId)
  }
  async createWorkspaceSession(packet){
    exact(packet,['agentPreset','requestId'])
    if(!['standard','ptc','minimal','cordis'].includes(packet.agentPreset))throw Error('MODE_INVALID')
    if(typeof packet.requestId!=='string'||!/^[A-Za-z0-9_-]{1,100}$/u.test(packet.requestId))throw Error('REQUEST_ID_REQUIRED')
    if(!this.ready())throw Error('请先在 Beelli X 中台初始化配套目录')
    const cwd=join(this.root,'files/workspace');await safeDirectory(cwd)
    const {workspace}=await this.workspace({path:cwd});if(!workspace?.workspaceId)throw Error('WORKSPACE_NOT_READY')
    return this.create({workspaceId:workspace.workspaceId,sessionId:'beellix-workspace-'+packet.requestId,agentPreset:packet.agentPreset})
  }
  async createSession(packet,sourceSessionId){exact(packet,['sceneId','requestId','workspaceId']);if(typeof packet.requestId!=='string'||!/^[A-Za-z0-9_-]{1,100}$/u.test(packet.requestId))throw Error('REQUEST_ID_REQUIRED')
    if(packet.workspaceId!==undefined&&(typeof packet.workspaceId!=='string'||!packet.workspaceId||packet.workspaceId.length>200))throw Error('WORKSPACE_NOT_READY')
    return this.transaction(async()=>{
      const state=await this.load();if(!state.added.includes(packet.sceneId))throw Error('SCENE_NOT_ADDED')
      const scene=(await this.catalog()).find(x=>x.id===packet.sceneId);if(!scene?.enabled)throw Error('SCENE_DISABLED')
      let previous=state.requests.find(x=>x.id===packet.requestId)
      if(previous&&(previous.sceneId!==scene.id||previous.sourceSessionId!==sourceSessionId||previous.workspaceId!==packet.workspaceId))throw Error('REQUEST_ID_CONFLICT')
      if(previous?.status==='saved')return{sessionId:previous.sessionId,sceneId:scene.id}
      let selected
      if(packet.workspaceId!==undefined){
        selected=await this.resolveWorkspace?.(packet.workspaceId)
        if(!selected||selected.workspaceId!==packet.workspaceId)throw Error('WORKSPACE_NOT_READY')
        await existingDirectory(selected.path)
        if(previous?.directory&&relative(previous.directory,resolve(selected.path))!=='')throw Error('WORKSPACE_CHANGED：所选目录已变化，请重新选择')
      }
      let businessSessionId,attachmentSessionId
      if(sourceSessionId){
        if(state.links[sourceSessionId]!==scene.id)throw Error('SCENE_SESSION_UNKNOWN')
        if(state.recoveries?.[sourceSessionId])return{sessionId:state.recoveries[sourceSessionId],sceneId:scene.id}
        const bindings=await this.bindings?.load(),source=bindings?.bindings?.[sourceSessionId]
        businessSessionId=source?.businessSessionId??sourceSessionId
        attachmentSessionId=source?.attachmentSessionId??sourceSessionId
        const record=await readPlainJson(join(this.root,'data',scene.id,'sessions',createHash('sha256').update(businessSessionId).digest('hex')+'.json'),64*1024*1024)
        if(record.schemaVersion!==1||record.sessionId!==businessSessionId||!record.record)throw Error('SCENE_RECORD_UNAVAILABLE')
      }
      if(!previous){previous={id:packet.requestId,sceneId:scene.id,sessionId:'session-'+randomUUID(),status:'pending',...packet.workspaceId?{workspaceId:packet.workspaceId,directory:resolve(selected.path)}:{},...sourceSessionId?{sourceSessionId}:{}};state.requests=[...state.requests,previous].slice(-200);await this.save(state)}
      const cwd=selected?.path??join(this.root,'files/scenes',scene.id,previous.sessionId)
      if(!selected)await safeDirectory(cwd)
      // Next 的空白会话输入区要求原生工作区归属，不能只传 cwd。
      const workspace=selected??(await this.workspace({path:cwd})).workspace
      if(typeof workspace?.workspaceId!=='string')throw Error('WORKSPACE_NOT_READY')
      await this.ensurePreset()
      await this.bindings?.bind({sessionId:previous.sessionId,sceneId:scene.id,packageName:scene.packageName,packageVersion:scene.version,executionPreset:'standard',...businessSessionId?{businessSessionId,attachmentSessionId}:{}})
      const created=await this.create({workspaceId:workspace.workspaceId,sessionId:previous.sessionId,agentPreset:'standard'})
      if(created.sessionId!==previous.sessionId)throw Error('SESSION_ID_MISMATCH')
      state.links[created.sessionId]=scene.id;if(sourceSessionId)state.recoveries={...state.recoveries,[sourceSessionId]:created.sessionId};previous.status='saved';state.revision++;await this.save(state)
      return{sessionId:created.sessionId,sceneId:scene.id}
    })
  }
}
