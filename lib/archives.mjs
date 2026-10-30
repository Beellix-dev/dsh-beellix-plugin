/** 复用旧版归档区的逻辑清理语义：登记移除，不删除原生会话文件或场景资料。 */
import {readFile,lstat,mkdir} from 'node:fs/promises'
import {join} from 'node:path'
import {withFileLock,writeFileAtomic} from "./atomic.mjs"
import {isSessionRecord} from './session-records.mjs'
const valid=id=>typeof id==='string'&&/^[A-Za-z0-9_-]{1,200}$/u.test(id)
export class ArchiveManager{
 constructor(root,{archived,sessions,workspaces,scenes,now=Date.now}){this.root=root;this.path=join(root,'config/archive-cleanup.json');this.archived=archived;this.sessions=sessions;this.workspaces=workspaces;this.scenes=scenes;this.now=now}
 async load(){try{const stat=await lstat(this.path);if(stat.isSymbolicLink()||!stat.isFile()||stat.size>4*1024*1024)throw Error('ARCHIVE_STATE_INVALID');const state=JSON.parse(await readFile(this.path,'utf8'));if(state.version!==1||!Number.isSafeInteger(state.revision)||!Array.isArray(state.cleared)||!state.cleared.every(row=>valid(row.id)&&Number.isSafeInteger(row.at)))throw Error('ARCHIVE_STATE_INVALID');return state}catch(error){if(error.code==='ENOENT')return{version:1,revision:0,cleared:[]};throw error}}
 async snapshot(){
  const [state,list,workspaces,scene]=await Promise.all([this.load(),this.sessions(),this.workspaces(),this.scenes()])
  const cleared=new Set(state.cleared.map(row=>row.id)),rows=new Map(list.items.map(row=>[row.sessionId,row]))
  const retained=new Set(scene.retainedSessionIds??[])
  const items=[...this.archived()].filter(id=>!cleared.has(id)&&isSessionRecord(rows.get(id),retained)).map(id=>{
   const row=rows.get(id),sceneId=scene.links[id],binding=scene.scenes.find(item=>item.id===sceneId)??scene.installed?.find(item=>item.id===sceneId)
   const workspace=workspaces.find(item=>item.sessionIds.includes(id))
   return{id,title:typeof row?.projections?.values?.title==='string'&&row.projections.values.title.trim()?row.projections.values.title:'未命名对话',location:binding?.title??(sceneId?'已移除场景':workspace?.title??'工作区'),sceneId:sceneId??null,updatedAt:row?.updatedAt??null,recoverable:!!row||scene.retainedSessionIds?.includes(id)===true}
  }).sort((a,b)=>(b.updatedAt??0)-(a.updatedAt??0))
  return{revision:state.revision,items}
 }
 async clear(input){
  if(!input||Object.keys(input).some(key=>!['sessionIds','expectedRevision'].includes(key))||!Array.isArray(input.sessionIds)||!input.sessionIds.length||input.sessionIds.length>1000||!input.sessionIds.every(valid)||!Number.isSafeInteger(input.expectedRevision))throw Error('ARCHIVE_REQUEST_INVALID')
  const directory=join(this.root,'config');await mkdir(directory,{recursive:true});if((await lstat(directory)).isSymbolicLink())throw Error('ARCHIVE_STATE_INVALID')
  return withFileLock(this.path,async()=>{const state=await this.load();if(state.revision!==input.expectedRevision)throw Error('ARCHIVE_CHANGED');const current=new Set(this.archived());if(input.sessionIds.some(id=>!current.has(id)))throw Error('ARCHIVE_NOT_ARCHIVED');const cleared=new Map(state.cleared.map(row=>[row.id,row]));for(const id of input.sessionIds)cleared.set(id,{id,at:this.now()});state.cleared=[...cleared.values()];state.revision++;const text=JSON.stringify(state,null,2);if(Buffer.byteLength(text)>4*1024*1024)throw Error('ARCHIVE_STATE_FULL');await writeFileAtomic(this.path,text,{mode:0o600,dirMode:0o700});return{application:'applied'}})
 }
}
