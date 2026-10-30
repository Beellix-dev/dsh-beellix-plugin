/** Next 尚无工作区标题前置槽；只在公开槽位锚点放置自有 Portal，不接管原列表。 */
import {locateSceneSidebar} from './host-compatibility.mjs'
export function installSceneSidebar({document,onTargets,getMode,onNewSession,compatibility}){
  const window=document.defaultView,saved=new Map();let current=null,frame=0,disposed=false
  const hide=node=>{if(!saved.has(node))saved.set(node,{display:node.style.getPropertyValue('display'),priority:node.style.getPropertyPriority('display'),inert:node.inert});node.style.setProperty('display','none','important');node.inert=true}
  const restore=node=>{const old=saved.get(node);if(!old)return;if(old.display)node.style.setProperty('display',old.display,old.priority);else node.style.removeProperty('display');node.inert=old.inert;saved.delete(node)}
  const release=()=>{for(const node of [...saved.keys()])restore(node);if(current){current.head.remove();current.body.remove();current=null;onTargets(null)}}
  const sync=()=>{
    frame=0;if(disposed)return
    const target=locateSceneSidebar(document)
    if(!target){release();if(document.querySelector('[data-slot="sidebar.workspaces"]'))compatibility?.report({code:'NATIVE_SIDEBAR_SHAPE_CHANGED',message:'当前 DSH 导航结构有变化，场景入口暂不可用；工作区已保留。'});return}
    compatibility?.clear?.('NATIVE_SIDEBAR_SHAPE_CHANGED')
    const {header,root,label}=target
    if(current?.root!==root||!current.head.isConnected||!current.body.isConnected){
      release()
      const head=document.createElement('div'),body=document.createElement('div');head.dataset.beellixSceneHead='';body.dataset.beellixSceneBody='';body.className='beellix-scenes-body'
      header.prepend(head);root.append(body);current={head,body,root,header,label,refresh:sync};onTargets(current)
    }
    const scenes=getMode()==='scenes'
    for(const child of [...current.header.children])if(child!==current.head){if(scenes||child===current.label)hide(child);else restore(child)}
    for(const child of [...current.root.children])if(child!==current.header&&child!==current.body){if(scenes)hide(child);else restore(child)}
    current.head.style.flex=scenes?'1':'0 0 auto';current.head.style.marginRight='auto';current.body.hidden=!scenes
  }
  const schedule=()=>{if(!disposed&&!frame)frame=window.requestAnimationFrame(sync)}
  const observer=new window.MutationObserver(schedule);observer.observe(document.querySelector('[data-slot="sidebar"]')??document.body,{childList:true,subtree:true})
  const click=event=>{const button=event.target.closest?.('button');if(getMode()==='scenes'&&button?.closest('[data-slot="sidebar"]')&&['新建会话','New session','New Session'].includes(button.getAttribute('aria-label'))){event.preventDefault();event.stopImmediatePropagation();onNewSession()}}
  document.addEventListener('click',click,true);sync()
  return()=>{disposed=true;observer.disconnect();window.cancelAnimationFrame(frame);document.removeEventListener('click',click,true);release()}
}
