/** 场景分组投影原生会话目录；创建、选择、任务状态均使用 DSH。 */
import React,{useState,useRef,useEffect,useSyncExternalStore} from 'react'
import {createPortal} from 'react-dom'
import {installSceneSidebar} from './scene-sidebar.mjs'
import {SceneBrand} from './scene-brand.mjs'
import {Modal,Menu,Tooltip,StateDot,IconEllipsisOutlineRegular,IconNewChatOutlineRegular,IconTriangleRightFillRegular,IconTrashOutlineRegular} from '@deepseek-ai/dsh-client-ui-primitives'
import {ConsoleIcon} from './console-icons.mjs'
import {isSessionRecord,sceneSessionRows} from './session-records.mjs'
import {startupTarget} from './startup-policy.mjs'
import {PLUGIN_DISCOVERY_URL} from './discovery.mjs'
const EMPTY_WORKSPACES=Object.freeze({archivedSessionIds:[]})
const EMPTY_COMPATIBILITY=Object.freeze({issues:[]})
const EMPTY_PREFERENCES=Object.freeze({ready:true,value:{startup:'last'}})
export const STARTUP_PANEL='beellix-startup-navigation'
/** 无匹配历史时只显示导航提示；不创建空会话，不修改原生恢复的会话。 */
export function StartupLanding({viewSource,startWorkspaceSession}){
 const view=useSyncExternalStore(viewSource.subscribe,viewSource.getSnapshot)
 return React.createElement('div',{className:'beellix-startup-landing'},React.createElement('p',null,view.mode==='scenes'?'从左侧选择场景，开始对话':'选择工作区，开始对话'),view.mode==='workspace'?React.createElement('button',{type:'button',onClick:()=>void startWorkspaceSession()},'新会话'):null)
}
const h=React.createElement
const viewKey='beellix-scene-navigation-view'
/** 使用工作区相同的原生菜单、图标和悬浮操作；场景入口只移除导航，不删除记录。 */
function SceneGroupRow({scene,selected,expanded,busy,onToggle,onExpand,onCreate,onRemove}){
  const [menuOpen,setMenuOpen]=useState(false)
  return h('div',{className:'beellix-scene-folder','data-selected':selected,'data-menu-open':menuOpen},
    h('button',{type:'button',role:'treeitem','aria-expanded':expanded,'aria-selected':selected,onClick:onToggle,onKeyDown:event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();onExpand(event.key==='ArrowRight')}}},
      h('span',{'data-expanded':expanded,className:'beellix-scene-chevron'},h(IconTriangleRightFillRegular,{size:16})),h('span',{},scene.title),!scene.enabled?h('small',{},scene.missing?'未安装':'未启用'):null),
    h('span',{className:'beellix-scene-row-actions'},
      h(Menu,{open:menuOpen,onClose:()=>setMenuOpen(false),portal:true,closeOnPointerLeave:true,items:[{id:'remove',label:'移除入口',icon:h(IconTrashOutlineRegular),danger:true}],onSelect:id=>{setMenuOpen(false);if(id==='remove'&&!busy)onRemove()},anchor:h('button',{type:'button',className:'beellix-scene-row-icon','aria-label':'场景操作：'+scene.title,disabled:busy,onClick:()=>setMenuOpen(value=>!value)},h(IconEllipsisOutlineRegular))}),
      h(Tooltip,{label:'新建会话',side:'bottom',align:'end',delayMs:500,portal:true},h('button',{type:'button',className:'beellix-scene-row-icon','aria-label':'在'+scene.title+'中新建会话',disabled:busy||!scene.enabled,onClick:onCreate},h(IconNewChatOutlineRegular)))))
}
function Icon({kind,size=16}){const paths={plus:'M12 5v14M5 12h14',folder:'M3 7V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z',chevron:'m9 5 7 7-7 7',chat:'M5 3h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H9l-6 4V5a2 2 0 0 1 2-2z',refresh:'M20 7V3l-4 4a8 8 0 1 0 3 8M20 3h-5',close:'m6 6 12 12M6 18 18 6'};return h('svg',{width:size,height:size,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.6,strokeLinecap:'round',strokeLinejoin:'round','aria-hidden':true},h('path',{d:paths[kind]??paths.chat}))}
async function api(path,{token,input}={}){
  const response=await fetch(new URL('/beellix/scenes/'+path,document.baseURI),{credentials:'same-origin',cache:'no-store',...input?{method:'POST',headers:{'content-type':'application/json','x-beellix-scenes-token':token},body:JSON.stringify(input)}:{}})
  if(!response.headers.get('content-type')?.includes('application/json'))throw Error('场景导航接口未就绪，请检查 Beelli X 插件')
  const value=await response.json();if(!response.ok)throw Error(value.message??'场景操作未完成');return value
}
export function SceneNavigation({ctx,prepare,setSceneView,useSidebarMounted,useSidebarTypes,renderSlot,openSceneManager,sceneChanges,compatibility,startWorkspaceSession,preferences}){
  const [targets,setTargets]=useState(null),[mode,setMode]=useState(()=>localStorage.getItem(viewKey)==='scenes'?'scenes':'workspace'),[state,setState]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[picker,setPicker]=useState(false),[selected,setSelected]=useState(null),[collapsed,setCollapsed]=useState({})
  const loadGeneration=useRef(0),modeRef=useRef(mode),newRef=useRef(()=>{}),directoryRef=useRef(()=>{}),directoryRequest=useRef(null),creation=useRef(null),recovery=useRef(null),lastWorkspace=useRef(null),observed=useRef(null),navigating=useRef(false)
  const [openRevision,setOpenRevision]=useState(0),[pickerQuery,setPickerQuery]=useState(''),[pickerLoading,setPickerLoading]=useState(false)
  const preference=useSyncExternalStore(fn=>preferences?.subscribe(fn)??(()=>{}),()=>preferences?.getSnapshot()??EMPTY_PREFERENCES)
  const startupApplied=useRef(false),startupLanding=useRef(null),startupNavigation=useRef(null),initialMode=useRef(mode)
  const compatibilityState=useSyncExternalStore(fn=>compatibility?.subscribe(fn)??(()=>{}),()=>compatibility?.getSnapshot()??EMPTY_COMPATIBILITY)
  const workspaceState=useSyncExternalStore(listener=>ctx.workspaces?.list.subscribe(listener)??(()=>{}),()=>ctx.workspaces?.list.getSnapshot()??EMPTY_WORKSPACES)
  const archived=new Set(workspaceState.archivedSessionIds??[])
  // 未取得可信场景状态时临时保留原生工作区；不改写用户原显示偏好。
  const effectiveMode=!state&&error?'workspace':mode
  modeRef.current=effectiveMode
  const sessions=useSyncExternalStore(listener=>ctx.sessions.list.subscribe(listener),()=>ctx.sessions.list.getSnapshot())
  const selection=useSyncExternalStore(listener=>ctx.uiSession.adapter.current.subscribe(listener),()=>ctx.uiSession.adapter.current.getSnapshot())
  const current=selection?.key
  const mounted=useSidebarMounted(value=>value)
  const sidebarTypes=useSidebarTypes(value=>value)
  async function reload(){const ticket=++loadGeneration.current,snapshot=await api('state');if(ticket===loadGeneration.current){setState(snapshot);setError('')}return snapshot}
  useEffect(()=>installSceneSidebar({document,onTargets:setTargets,getMode:()=>modeRef.current,onNewSession:()=>newRef.current(),compatibility}),[])
  useEffect(()=>{void Promise.resolve(prepare?.()).then(()=>reload()).catch(e=>setError(e.message))},[])
  useEffect(()=>{let active=true;const off=sceneChanges?.subscribe(()=>{void reload().catch(e=>{if(active)setError(e.message)})});return()=>{active=false;loadGeneration.current++;off?.()}},[sceneChanges])
  useEffect(()=>{if(startupApplied.current)try{localStorage.setItem(viewKey,mode)}catch{}targets?.refresh()},[mode,effectiveMode,targets])
  const scenes=state?.scenes??[]
  const retainedRecords=new Set(state?.retainedSessionIds??[])
  useEffect(()=>{setSceneView({mode:effectiveMode,links:state?.links??{},installed:state?.installed??[],sceneSessionIds:state?.sceneSessionIds??[],managedWorkspaceIds:state?.managedWorkspaceIds??[],clearedSessionIds:state?.clearedSessionIds??[],startSceneSession:()=>newRef.current(),changeSceneDirectory:input=>directoryRef.current(input),ready:Boolean(state),error})},[mode,state,error])
  useEffect(()=>{
    if(!startupApplied.current){
      if(!state||!preference.ready&&!preference.error||sessions.phase&&sessions.phase!=='ready'||workspaceState.phase&&workspaceState.phase!=='ready')return
      startupApplied.current=true
      const target=startupTarget({startup:preference.ready?preference.value.startup:'last',last:initialMode.current,current,sessions,scene:state,archived:[...archived]})
      setMode(target.mode)
      if(target.sessionId){if(target.sessionId!==current){startupNavigation.current={target:target.sessionId,previous:current};ctx.uiWorkspace.openSession(target.sessionId);return}}
      else{startupLanding.current=current??'';observed.current=null;ctx.layout.selectPanel(STARTUP_PANEL);return}
    }
    if(startupNavigation.current){if(current===startupNavigation.current.previous)return;startupNavigation.current=null}
    // 保留原会话但不让后台恢复的场景再次覆盖显式启动选择。
    if(startupLanding.current!==null){if((current??'')===startupLanding.current)return;startupLanding.current=null}
    const summary=sessions.byId[current]
    if(!state||!current||!summary||navigating.current||(busy&&(creation.current||recovery.current)))return
    const scene=state.links[current]??(summary.projectionValues?.agentPreset==='beellix-scene'?'legacy-scene':'')
    const identity=current+':'+scene
    if(observed.current===identity)return
    observed.current=identity
    // 新场景也使用standard；晚到的可信绑定必须重新核对，不能按首次广播永久归入工作区。
    if(scene)setMode('scenes')
    else{lastWorkspace.current=current;setMode('workspace')}
  },[current,state,mode,sessions,busy,preference.ready,preference.error,workspaceState.phase])
  const activeScene=mode==='scenes'?scenes.find(scene=>scene.id===(state?.links[current]??selected??scenes[0]?.id)):undefined
  useEffect(()=>{
    if(!activeScene)return
    return ctx.slots.inject('conversation.hero.brand.mark',()=>ctx.slots.register({name:'conversation.hero.brand.mark',priority:100,id:'beellix-scene-brand',inject:()=>({scene:activeScene})},SceneBrand))
  },[activeScene?.id,activeScene?.title,activeScene?.version])
  const chosen=(current&&state?.links[current])??selected??scenes[0]?.id
  const open=(sessionId,scene)=>{if(scene)setSelected(scene.id);setOpenRevision(value=>value+1);ctx.uiWorkspace.openSession(sessionId)}
  useEffect(()=>{
    const scene=scenes.find(row=>row.id===state?.links[current])
    if(mounted!==current||!current)return
    try{
      if(mode==='scenes'&&scene?.enabled&&sidebarTypes.some(type=>type.kind===scene.tabKind))ctx.sidebarRight.openTab(scene.tabKind)
      else if(mode==='workspace'&&!scene){const kinds=new Set((state?.installed??[]).map(row=>row.tabKind));for(const tab of ctx.sidebarRight.openTabs?.getSnapshot()??[])if(tab.sessionId===current&&kinds.has(tab.kind))ctx.sidebarRight.close(tab.tabId)}
    }catch(e){setError('工作台尚未就绪：'+e.message)}
  },[mode,current,mounted,state?.links[current],scenes,sidebarTypes,openRevision])
  async function switchView(value){
    if(busy||navigating.current)return
    if(value===mode)return
    navigating.current=true;setBusy(true)
    try{
      const rows=Object.values(sessions.byId).filter(row=>row.origin!=='subagent'&&!archived.has(row.id)).sort((a,b)=>b.updatedAt-a.updatedAt)
      if(value==='workspace'){
        const row=rows.find(row=>row.id===lastWorkspace.current&&!state?.links[row.id]&&row.projectionValues?.agentPreset!=='beellix-scene')??rows.find(row=>!state?.links[row.id]&&row.projectionValues?.agentPreset!=='beellix-scene')
        if(row)open(row.id)
        else await startWorkspaceSession()
      }else{
        const scene=scenes.find(row=>row.id===(selected??state?.links[current]))??scenes[0]
        if(!scene){setMode('scenes');setPicker(false);setError('');return}
        if(!scene.enabled)throw Error('请先在 Beelli X 中台启用该场景')
        const row=rows.find(row=>state?.links[row.id]===scene.id&&!state.recoveries?.[row.id])
        if(row){if(!await reconnect(scene,row.id))return}else if(!await create(scene.id))return
      }
      setMode(value);setError('')
    }catch(error){setError(error.message)}finally{navigating.current=false;setBusy(false)}
  }
  async function showPicker(){setPickerQuery('');setPickerLoading(true);try{const snapshot=await reload();if(!snapshot.installed?.length){setPicker(false);window.open(PLUGIN_DISCOVERY_URL,'_blank','noopener,noreferrer');return}setPicker(true)}catch(e){setError(e.message)}finally{setPickerLoading(false)}}
  async function removeScene(scene){if(busy)return;setBusy(true);try{const value=await api('remove',{token:state.csrfToken,input:{sceneId:scene.id,expectedRevision:state.revision}});setState({...value,csrfToken:state.csrfToken});if(selected===scene.id)setSelected(null);setError('')}catch(e){setError(e.message)}finally{setBusy(false)}}
  async function chooseScene(scene){
    if(busy||pickerLoading||!scene.enabled)return
    setBusy(true)
    try{
      let snapshot=state??await reload()
      if(!snapshot.scenes.some(row=>row.id===scene.id)){snapshot={...await api('add',{token:snapshot.csrfToken,input:{sceneId:scene.id,expectedRevision:snapshot.revision}}),csrfToken:snapshot.csrfToken};setState(snapshot)}
      setSelected(scene.id)
      const row=Object.values(sessions.byId).filter(row=>row.origin!=='subagent'&&!archived.has(row.id)&&snapshot.links[row.id]===scene.id&&!snapshot.recoveries?.[row.id]).sort((a,b)=>b.updatedAt-a.updatedAt)[0]
      const opened=row?await reconnect(scene,row.id):await create(scene.id,snapshot)
      if(opened){setMode('scenes');setCollapsed(previous=>({...previous,[scene.id]:false}));setPicker(false);setError('')}
    }catch(e){setError(e.message)}finally{setBusy(false)}
  }
  async function create(sceneId,snapshot=state){const scene=snapshot?.scenes.find(x=>x.id===sceneId);if(!scene){void showPicker();return}if(!scene.enabled){setError('请先在 Beelli X 中台启用该场景');return}setBusy(true);try{
    creation.current=creation.current?.sceneId===scene.id?creation.current:{sceneId:scene.id,requestId:crypto.randomUUID()}
    const value=await api('create-session',{token:snapshot.csrfToken,input:creation.current});await reload();creation.current=null;setCollapsed(previous=>({...previous,[scene.id]:false}));open(value.sessionId,scene);return true
  }catch(e){setError('创建未完成，请重试当前场景核对：'+e.message);return false}finally{setBusy(false)}}
  newRef.current=()=>{if(!busy)void create(chosen)}
  directoryRef.current=async({sessionId,sceneId,workspaceId,beforeOpen})=>{
    if(busy||navigating.current)throw Error('正在切换会话，请稍后重试')
    if(modeRef.current!=='scenes'||state?.links[sessionId]!==sceneId||ctx.uiSession.adapter.current.getSnapshot()?.key!==sessionId)throw Error('当前会话已变化，请重新选择目录')
    if(sessions.byId[sessionId]?.running)throw Error('请等待当前任务完成后再选择目录')
    const signal=ctx.layout.beginNavigation(),isCurrent=()=>!signal.aborted&&modeRef.current==='scenes'&&ctx.uiSession.adapter.current.getSnapshot()?.key===sessionId
    setBusy(true);navigating.current=true
    try{
      const previous=directoryRequest.current
      const request=previous?.sessionId===sessionId&&previous.workspaceId===workspaceId?previous:{sessionId,sceneId,workspaceId,requestId:crypto.randomUUID()}
      directoryRequest.current=request
      const value=await api('create-session',{token:state.csrfToken,input:{sceneId,workspaceId,requestId:request.requestId}})
      await reload()
      if(!isCurrent())return
      // 与原生目录切换相同：绑定就绪后转交原生草稿/附件回调，不迁移已保存记录。
      await ctx.sessions.using(value.sessionId,{source:'workspaceOperation'},()=>{
        if(!isCurrent())return
        beforeOpen?.(value.sessionId);directoryRequest.current=null;open(value.sessionId,scenes.find(row=>row.id===sceneId))
      })
      setError('')
    }catch(e){setError('目录切换未完成，原会话已保留：'+e.message);throw e}finally{navigating.current=false;setBusy(false)}
  }
  async function reconnect(scene,sessionId){setBusy(true);try{
    recovery.current=recovery.current?.sessionId===sessionId?recovery.current:{sceneId:scene.id,sessionId,requestId:crypto.randomUUID()}
    const value=await api('reconnect-session',{token:state.csrfToken,input:recovery.current});recovery.current=null;await reload();open(value.sessionId,scene);return true
  }catch(e){setError('记录尚未接回：'+e.message);return false}finally{setBusy(false)}}
  const installed=(state?.installed??[]).filter(scene=>(scene.title+' '+scene.id).toLocaleLowerCase().includes(pickerQuery.trim().toLocaleLowerCase()))
  const head=h('div',{className:'beellix-scene-heading'},h('div',{className:'beellix-scene-switch',role:'group','aria-label':'左侧目录类型'},...['workspace','scenes'].map(value=>h('button',{key:value,type:'button',disabled:busy||value==='scenes'&&!state,'aria-pressed':effectiveMode===value,onClick:()=>void switchView(value)},value==='workspace'?'工作区':'场景'))),effectiveMode==='scenes'&&state?.installed?.length?h('button',{type:'button',className:'beellix-scene-icon','aria-label':'添加已安装场景',title:'添加已安装场景',onClick:()=>void showPicker()},h(Icon,{kind:'plus'})):null)
  const body=h('div',{className:'beellix-scenes'},error?h('div',{role:'alert',className:'beellix-scene-error'},h('p',{},error),h('button',{onClick:()=>void reload().catch(e=>setError(e.message))},'重试')):null,
    !state&&!error?h('p',{className:'beellix-scene-hint'},'正在读取场景…'):null,
    state&&!scenes.length?h('div',{className:'beellix-scene-empty'},h(Icon,{kind:'folder',size:24}),h('strong',{},state.installed?.length?'添加你的第一个场景':'还没有场景'),h('p',{},state.installed?.length?'选择已安装的场景，开始专属对话。':'安装场景后，在这里开始专属对话。'),state.installed?.length?h('button',{type:'button',onClick:()=>void showPicker()},'添加已安装场景'):h('a',{href:PLUGIN_DISCOVERY_URL,target:'_blank',rel:'noopener noreferrer'},'安装场景')):null,
    h('div',{role:'tree','aria-label':'场景及会话',className:'beellix-scene-tree',onKeyDown:event=>{if(!['ArrowDown','ArrowUp'].includes(event.key))return;const rows=[...event.currentTarget.querySelectorAll('button[role="treeitem"]')],index=rows.indexOf(document.activeElement);if(index<0)return;event.preventDefault();rows[(index+(event.key==='ArrowDown'?1:-1)+rows.length)%rows.length]?.focus()}},...scenes.map(scene=>{
      const rows=sceneSessionRows(sessions,state,scene.id,{current,archived})
      const retained=(state.retainedSessionIds??[]).filter(id=>state.links[id]===scene.id&&!sessions.byId[id]&&!state.recoveries?.[id]&&!archived.has(id))
      return h('div',{key:scene.id,className:'beellix-scene-group'},h(SceneGroupRow,{scene,selected:chosen===scene.id,expanded:!collapsed[scene.id],busy,onToggle:()=>{setSelected(scene.id);setCollapsed(previous=>({...previous,[scene.id]:!previous[scene.id]}))},onExpand:value=>setCollapsed(previous=>({...previous,[scene.id]:!value})),onCreate:()=>void create(scene.id),onRemove:()=>void removeScene(scene)}),
        !collapsed[scene.id]?h('div',{role:'group',className:'beellix-scene-conversations'},...rows.map(row=>h('div',{key:row.id,className:'beellix-scene-session-row','data-selected':current===row.id},h('button',{role:'treeitem','aria-selected':current===row.id,disabled:busy||!scene.enabled||archived.has(row.id),onClick:()=>void reconnect(scene,row.id),title:row.displayTitle},h('span',{className:'beellix-scene-session-leading'},!archived.has(row.id)&&row.running?h(StateDot,{state:'ongoing'}):null),h('span',{className:'beellix-scene-session-title'},isSessionRecord(row,retainedRecords)?row.displayTitle:'新会话')),isSessionRecord(row,retainedRecords)&&renderSlot&&h('span',{className:'beellix-scene-session-actions'},renderSlot('beellix.scene.session.action',{sessionId:row.id,displayTitle:row.displayTitle})))),...retained.map(id=>h('div',{key:'retained-'+id,className:'beellix-scene-session-row'},h('button',{role:'treeitem',disabled:busy||!scene.enabled||archived.has(id),onClick:()=>void reconnect(scene,id),title:'打开已保存记录，原对话和业务资料保留。'},h('span',{className:'beellix-scene-session-leading'}),h('span',{className:'beellix-scene-session-title'},'打开已保存记录')),renderSlot&&h('span',{className:'beellix-scene-session-actions'},renderSlot('beellix.scene.session.action',{sessionId:id,displayTitle:'已保存记录'})))),!rows.length&&!retained.length?h('button',{className:'beellix-scene-new',disabled:busy||!scene.enabled,onClick:()=>void create(scene.id)},'新建场景会话'):null):null)
    })))
  const chooser=h(Modal,{open:picker,title:'添加场景',closeLabel:'关闭',onClose:()=>{if(!busy)setPicker(false)},className:'beellix-scene-selector',contentClassName:'beellix-scene-selector-content'},
    h('input',{type:'search','aria-label':'搜索已安装场景',placeholder:'搜索场景',value:pickerQuery,onChange:event=>setPickerQuery(event.target.value)}),
    error?h('p',{role:'alert',className:'beellix-scene-error'},error):null,
    pickerLoading?h('p',{role:'status'},'正在读取已安装场景…'):h('div',{className:'beellix-scene-selector-list'},...installed.map(scene=>{const added=scenes.some(row=>row.id===scene.id);return h('article',{key:scene.id},h(ConsoleIcon,{kind:'scenarios',size:24}),h('div',{},h('strong',{},scene.title),h('small',{},'v'+scene.version,' · ',!scene.enabled?'未启用':added?'已添加':'已安装')),h('button',{'aria-label':(added?'打开 ':'添加 ')+scene.title,disabled:busy||pickerLoading||!scene.enabled,onClick:()=>void chooseScene(scene)},!scene.enabled?'未启用':added?'打开':'添加并打开'))})),
    !pickerLoading&&!installed.length?h('p',{role:'status'},pickerQuery?'没有匹配的场景':state?.installed?.length?'没有匹配的场景':'暂无已安装场景'):null,
    h('footer',{},h('button',{disabled:busy,onClick:()=>{setPicker(false);openSceneManager?.()}},'场景管理'),h('button',{disabled:busy,onClick:()=>void showPicker()},'刷新')))
  const notice=compatibilityState.issues.length||!state&&error?h('div',{role:'status',className:'beellix-compatibility-notice'},compatibilityState.issues.map(row=>h('p',{key:row.code},row.message)),!state&&error?h(React.Fragment,{},h('p',{},'场景暂不可用：'+error),h('button',{type:'button',onClick:()=>void reload().catch(e=>setError(e.message))},'重试')):null):null
  return h(React.Fragment,{},notice,targets?h(React.Fragment,{},createPortal(head,targets.head),createPortal(body,targets.body),chooser):null)
}
