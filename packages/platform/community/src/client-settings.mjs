/** 原生通用设置中的两个小项；跨窗口只同步偏好，不同步像素或会话选择。 */
import React,{useState,useSyncExternalStore} from 'react'
import {Menu,Button,IconChevronDownOutlineRegular} from '@deepseek-ai/dsh-client-ui-primitives'
import {DEFAULT_RATIOS,validRatios} from './layout-geometry.mjs'
const h=React.createElement,signalKey='beellix-client-preferences-changed'
export function createClientSettings({api,events=window,storage=localStorage}){
 let snapshot={ready:false,value:{startup:'workspace',ratios:DEFAULT_RATIOS},error:null},disposed=false,inflight
 const listeners=new Set(),emit=()=>{for(const fn of listeners)fn()},accept=value=>{
  if(disposed||!validRatios(value?.ratios)||!['workspace','scenes','last'].includes(value?.startup))throw Error('客户端设置无效，请重试')
  if(snapshot.ready&&value.revision<snapshot.value.revision)return
  snapshot={ready:true,value,error:null};emit()
 }
 const reload=()=>inflight??=(async()=>{try{accept(await api.read('client-preferences'))}catch(error){if(!disposed){snapshot={...snapshot,error:error.message};emit()}}finally{inflight=undefined}})()
 const onStorage=e=>{if(e.key===signalKey)void reload()},onFocus=()=>void reload()
 events.addEventListener('storage',onStorage);events.addEventListener('focus',onFocus)
 const service={getSnapshot:()=>snapshot,subscribe:fn=>{listeners.add(fn);return()=>listeners.delete(fn)},reload,
  save:async patch=>{
   if(disposed||!snapshot.ready)throw Error('客户端设置尚未就绪，请重试')
   try{const result=await api.mutate('client-preferences',{...patch,expectedRevision:snapshot.value.revision});accept(result);try{storage.setItem(signalKey,JSON.stringify({revision:result.revision,nonce:Math.random()}))}catch{}return result}
   catch(error){await reload();throw error}
  },dispose:()=>{disposed=true;events.removeEventListener('storage',onStorage);events.removeEventListener('focus',onFocus);listeners.clear()}}
 void reload();return service
}
export function ClientSettingsRows({preferences,english=false}){
 const snapshot=useSyncExternalStore(preferences.subscribe,preferences.getSnapshot),[busy,setBusy]=useState(false),[error,setError]=useState(''),[open,setOpen]=useState(false)
 const save=async patch=>{setBusy(true);setError('');try{await preferences.save(patch)}catch(e){setError(e.message)}finally{setBusy(false)}}
 const ratio=snapshot.value.ratios.map(x=>Number((x*100).toFixed(1))+'%').join(' : ')
 const items=[{id:'workspace',label:english?'Workspace':'工作区'},{id:'scenes',label:english?'Scenes':'场景'},{id:'last',label:english?'Last used':'上次使用'}]
 return h('div',{className:'beellix-client-settings'},
  h('div',{className:'beellix-client-setting-row'},h('div',null,h('div',null,english?'Open on startup':'启动时打开'),h('small',null,english?'Applies next time the client opens':'下次启动客户端时生效')),h(Menu,{open,onClose:()=>setOpen(false),portal:true,align:'end',items,selectedId:snapshot.value.startup,onSelect:id=>{setOpen(false);void save({startup:id})},anchor:h(Button,{'aria-label':english?'Open on startup':'启动时打开','aria-haspopup':'menu','aria-expanded':open,variant:'outline',disabled:busy||!snapshot.ready,onClick:()=>setOpen(value=>!value)},items.find(row=>row.id===snapshot.value.startup)?.label,h(IconChevronDownOutlineRegular,{size:14}))})),
  h('div',{className:'beellix-client-setting-row'},h('div',null,h('div',null,english?'Column proportions':'三栏比例'),h('small',null,(english?'Navigation · Conversation · Workbench':'导航 · 对话 · 工作台')+'　'+ratio)),h(Button,{variant:'outline',disabled:busy||!snapshot.ready,onClick:()=>void save({ratios:[...DEFAULT_RATIOS]})},english?'Reset proportions':'恢复默认比例')),
  error||snapshot.error?h('div',{role:'alert',className:'beellix-client-setting-error'},error||snapshot.error,h(Button,{variant:'outline',onClick:()=>{setError('');void preferences.reload()}},english?'Retry':'重试')):null)
}
