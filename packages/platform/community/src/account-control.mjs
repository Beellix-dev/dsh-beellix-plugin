import {OperationFeedback} from "../../../../dev/shared/console/operation-feedback.mjs"
/** Compact home-only account control; the website owns passwords and verification. */
import React,{useEffect,useRef,useState} from 'react'
import {ConsoleIcon} from './console-icons.mjs'
const h=React.createElement
const labels={loading:'读取账号…',unconfigured:'官网账号服务尚未上线',pending:'请在官网完成验证',starting:'正在打开官网',offline:'待联网验证',expired:'登录已过期','signed-out':'未登录'}
export function AccountControl({api,openWebsite}){
 const[state,S]=useState({status:'loading'}),[busy,B]=useState(false),[error,E]=useState(''),url=useRef(null),revision=useRef(0),alive=useRef(true)
 useEffect(()=>{alive.current=true;const controller=new AbortController();void api.read(controller.signal).then(value=>{if(!controller.signal.aborted)S(value)}).catch(()=>{if(!controller.signal.aborted){S({status:'unavailable'});E('账号状态读取失败')}});return()=>{alive.current=false;revision.current++;controller.abort()}},[api])
 useEffect(()=>{if(state.status!=='pending'||!state.attemptId)return;const controller=new AbortController();let timer,waiting=false;const poll=async()=>{if(waiting||controller.signal.aborted)return;waiting=true;try{const value=await api.mutate('poll',{attemptId:state.attemptId},controller.signal);if(!controller.signal.aborted){S(value);E('')}}catch(e){if(!controller.signal.aborted)E(e.message)}finally{waiting=false;if(!controller.signal.aborted)timer=setTimeout(poll,2000)}};timer=setTimeout(poll,1500);return()=>{controller.abort();clearTimeout(timer)}},[api,state.status,state.attemptId])
 const run=async action=>{if(busy)return;const ticket=++revision.current;B(true);E('');try{
  if(action==='login'){const result=await api.mutate('login',{});if(!alive.current||revision.current!==ticket)return;url.current=result.authorizationUrl;const value=await api.read();if(!alive.current||revision.current!==ticket)return;S(value);openWebsite(result.authorizationUrl)}
  else {const value=await api.mutate(action,{});if(!alive.current||revision.current!==ticket)return;S(value);if(action==='logout'||action==='cancel')url.current=null;if(value.remoteLogout==='unconfirmed')E('已退出本机，官网会话撤销待联网确认')}
 }catch(e){if(alive.current&&revision.current===ticket)E(e.message)}finally{if(alive.current&&revision.current===ticket)B(false)}}
 const signed=state.status==='signed-in',pending=state.status==='pending',name=state.account?.displayName
 return h('div',{className:'beellix-account','aria-label':'Beelli X 账号','aria-busy':busy},
  h('div',{className:'beellix-account__controls'},
   signed?h('span',{className:'beellix-account__identity',title:name},h(ConsoleIcon,{kind:'account',size:16}),h('span',null,name),state.membership&&h('small',{className:'beellix-account__membership',title:state.membership.label+(state.membership.expiresAt?' · 有效期至 '+new Date(state.membership.expiresAt).toLocaleDateString():'')},state.membership.label)):pending?h('span',{role:'status',className:'beellix-account__hint'},'等待官网验证'):null,
   !signed&&!pending&&h('button',{type:'button',disabled:busy||!state.canLogin,title:labels[state.status]??'账号状态暂不可用','aria-label':state.status==='unconfigured'?'官网登录，账号服务尚未上线':'官网登录',onClick:()=>void run(state.status==='offline'?'refresh':'login')},h(ConsoleIcon,{kind:'account',size:16}),busy?'处理中…':state.status==='unconfigured'?'登录 · 待上线':state.status==='offline'?'重新验证':'官网登录'),
   pending&&url.current&&h('button',{type:'button',disabled:busy,onClick:()=>openWebsite(url.current)},'打开官网'),
   pending&&h('button',{type:'button',disabled:busy,onClick:()=>void run('cancel')},'取消验证'),
   signed&&h('button',{type:'button',disabled:busy,onClick:()=>void run('logout'),'aria-label':'退出 Beelli X 账号'},'退出'),
   state.status==='offline'&&h('small',{role:'status',className:'beellix-account__hint'},'待联网验证'),
   state.status==='unavailable'&&h('button',{type:'button',disabled:busy,onClick:()=>{B(true);void api.read().then(S).catch(e=>E(e.message)).finally(()=>B(false))}},'重试')),
  h(OperationFeedback,{error,onErrorDone:()=>E('')}))
}
