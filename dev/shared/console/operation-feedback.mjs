/** Beelli X operation feedback: DSH theme roles and body-portal pattern, centered. */
import React,{useEffect,useRef,useState} from 'react'
import {createPortal} from 'react-dom'
const h=React.createElement
function surface(){
 let root=document.querySelector('[data-beellix-feedback-root]')
 if(!root){root=document.createElement('div');root.dataset.beellixFeedbackRoot='';Object.assign(root.style,{position:'fixed',top:'50%',left:'50%',transform:'translate(-50%, -50%)',zIndex:'1200',display:'flex',flexDirection:'column',gap:'8px',width:'max-content',maxWidth:'calc(100vw - 40px)',pointerEvents:'none'});document.body.append(root)}
 return root
}
const style={display:'flex',alignItems:'center',gap:10,maxWidth:'min(600px, calc(100vw - 40px))',maxHeight:'60vh',overflow:'auto',padding:'12px 16px',borderRadius:'var(--dsw-radius-lg, 12px)',background:'var(--dsw-alias-toast-bg, #242832)',color:'var(--dsw-alias-toast-label, #fff)',boxShadow:'var(--dsw-shadow-lv3, 0 8px 24px rgb(0 0 0 / 18%))',font:'14px/1.6 system-ui, sans-serif',boxSizing:'border-box'}
/** Success disappears; an error remains until dismissed or resolved. No modal or focus theft. */
export function OperationFeedback({notice,error,onNoticeDone,onErrorDone,duration=3000}){
 const message=error||notice,tone=error?'error':'success',[visible,V]=useState(true),latest=useRef({onNoticeDone,onErrorDone})
 latest.current={onNoticeDone,onErrorDone}
 const dismiss=()=>{V(false);if(error){latest.current.onErrorDone?.();latest.current.onNoticeDone?.()}else latest.current.onNoticeDone?.()}
 useEffect(()=>{V(true);if(!message||tone==='error')return;const timer=setTimeout(()=>{V(false);latest.current.onNoticeDone?.()},duration);return()=>clearTimeout(timer)},[message,tone,duration])
 useEffect(()=>()=>{queueMicrotask(()=>{const root=document.querySelector('[data-beellix-feedback-root]');if(root&&!root.childElementCount)root.remove()})},[message,visible])
 if(!message||!visible||typeof document==='undefined')return null
 return createPortal(h('div',{'data-beellix-feedback':tone,role:error?'alert':'status','aria-atomic':true,style:{...style,pointerEvents:error?'auto':'none'}},
  h('svg',{width:20,height:20,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.7,style:{flexShrink:0,color:error?'var(--dsw-alias-state-warn-label, #ffcd6b)':'var(--dsw-alias-state-success-primary, #63cf96)'},'aria-hidden':true},h('circle',{cx:12,cy:12,r:9}),h('path',{d:error?'M12 7v6m0 3v1':'m7.5 12 3 3 6-6'})),
  h('span',{tabIndex:error?0:undefined,style:{minWidth:0,maxHeight:'calc(60vh - 24px)',overflowY:'auto',overflowWrap:'anywhere',whiteSpace:'pre-wrap'}},message),
  error&&h('button',{type:'button','aria-label':'关闭错误提示',onClick:dismiss,style:{display:'grid',placeItems:'center',flexShrink:0,width:30,height:30,padding:0,border:0,borderRadius:6,background:'transparent',color:'inherit',font:'inherit',cursor:'pointer',pointerEvents:'auto'}},h('svg',{width:16,height:16,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.7,'aria-hidden':true},h('path',{d:'m6 6 12 12M18 6 6 18'})))),surface())
}
