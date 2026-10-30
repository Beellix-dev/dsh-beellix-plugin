/** 沿用原生 root 登记、Store、子槽和占位服务，仅装入带比例策略的原版 Frame。 */
import React from 'react'
import {AppFrame} from './native-frame.tsx'
const OWN='beellix-proportional-frame'
export function installProportionalFrame(ctx,preferences,compatibility){
 let current,release,disposed=false,updating=false
 const sync=()=>{
  if(disposed||updating)return;updating=true
  try{
   const source=(ctx.slots.entries?.('root')??[]).find(row=>row.options.id!==OWN&&row.children?.sidebar&&row.children?.rightbar&&typeof row.component==='function')
   if(source===current)return
   release?.();release=undefined;current=source
   if(!source||Object.getOwnPropertyDescriptor(source,'component')?.writable!==true){compatibility?.report({code:'NATIVE_PROPORTIONS_UNAVAILABLE',message:'当前 DSH 布局接口有变化，已保留原生布局。'});return}
   const NativeFrame=source.component
   function ProportionalFrame(props){
    const safe=typeof props.useStore==='function'&&typeof props.usePanelInfo==='function'&&typeof props.useSessions==='function'&&typeof props.renderSlot==='function'&&['setViewportWidth','setSidebar','setRightbar'].every(k=>typeof props.actions?.[k]==='function')
    return React.createElement(safe?AppFrame:NativeFrame,safe?{...props,preferences,compatibility}:props)
   }
   source.component=ProportionalFrame;let notify
   release=()=>{if(source.component===ProportionalFrame)source.component=NativeFrame;notify?.()}
   notify=ctx.slots.register({name:'root',id:OWN,priority:(source.options.priority??0)+1},()=>null)
   compatibility?.clear('NATIVE_PROPORTIONS_UNAVAILABLE')
  }finally{updating=false}
 }
 const off=ctx.slots.subscribe?.('root',sync);sync()
 return()=>{disposed=true;off?.();release?.()}
}
