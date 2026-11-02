import React,{useEffect,useRef,useState} from 'react'
import {OperationFeedback} from '../../../../dev/shared/console/operation-feedback.mjs'
const h=React.createElement

/** 首页唯一更新入口；只有用户点击才联网检查或安装。 */
export function SelfUpdateControl({api,english=false}){
 const[state,setState]=useState({status:'loading'}),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('')
 const alive=useRef(true),locked=useRef(false)
 useEffect(()=>{alive.current=true;const controller=new AbortController();void api.read(controller.signal).then(value=>{if(alive.current)setState(value)}).catch(()=>{if(alive.current)setState({status:'failed'})});return()=>{alive.current=false;controller.abort()}},[api])
 const text=(zh,en)=>english?en:zh
 const run=async action=>{
  if(locked.current)return;locked.current=true;setBusy(true);setError('');setNotice('')
  try{const value=await api.mutate(action,action==='install'?{commit:state.commit}:{});if(alive.current){setState(value);if(value.status==='current')setNotice(text('中台已是最新内容','Beelli X is up to date'))}}
  catch(e){if(alive.current){setError(e.message);if(action!=='restart')setState({status:'failed'})}}
  finally{locked.current=false;if(alive.current)setBusy(false)}
 }
 const status=state.status,action=status==='available'?'install':status==='restart-required'?'restart':'check'
 const label=busy?text(action==='install'?'正在更新…':action==='restart'?'正在重启…':'正在检查…',action==='install'?'Updating…':action==='restart'?'Restarting…':'Checking…'):text(action==='install'?'立即更新':action==='restart'?'重启生效':'检查更新',action==='install'?'Update now':action==='restart'?'Restart to apply':'Check for updates')
 return h(React.Fragment,null,h('div',{className:'beellix-self-update','aria-busy':busy},
  status==='available'&&h('span',{role:'status'},text('中台有新内容，更新后需重启','An update is available; restart required')),
  status==='unsupported'&&h('span',{role:'status'},text('当前客户端暂不支持原位更新','This client does not support updates in place')),
  status==='restart-required'&&h('span',{role:'status'},text('更新已安装，请保存工作后重启','Update installed. Save your work before restarting')),
  h('button',{type:'button',disabled:busy||status==='loading'||status==='unsupported'||action==='restart'&&!state.canRestart,onClick:()=>void run(action)},label)),
  h(OperationFeedback,{error,notice,onNoticeDone:()=>setNotice(''),onErrorDone:()=>setError('')}))
}
