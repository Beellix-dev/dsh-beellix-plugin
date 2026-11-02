/** 场景入口固定显示场景身份；旧会话的真实执行组成仅在顶部提示中说明。 */
import React from 'react'
import {IconAgentPresetOutlineRegular} from '@deepseek-ai/dsh-client-ui-primitives'
const h=React.createElement,names={standard:'标准模式',ptc:'PTC 模式',minimal:'极简模式',cordis:'创造模式'}
export function ModeSeat({sessionId,useSessions,useSceneView,variant}){
 const view=useSceneView(x=>x),session=useSessions(x=>x.byId[sessionId]),actual=variant==='header'?session?.projectionValues?.agentPreset:undefined
 const legacy=actual&&!['standard','beellix-scene'].includes(actual),label='场景模式'
 const title=legacy?'历史场景会话的执行组成：'+(names[actual]??actual)+'；原会话保留，新场景对话使用标准模式＋当前场景包':view.ready?'标准模式＋当前场景包':'场景正在准备'
 return h('span',{className:'beellix-mode-control'+(variant==='header'?' beellix-mode-control--header':'')},h('span',{className:'beellix-mode-seat','aria-label':'执行模式：'+label,title},h(IconAgentPresetOutlineRegular,{size:variant==='header'?14:16}),h('span',{className:'beellix-mode-label'},label)))
}
