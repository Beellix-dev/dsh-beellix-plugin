/** 场景入口不提供预设切换；旧会话显示其实际继承组成。 */
import React from 'react'
import {IconAgentPresetOutlineRegular} from '@deepseek-ai/dsh-client-ui-primitives'
const h=React.createElement,names={standard:'标准模式',ptc:'PTC 模式',minimal:'极简模式',cordis:'创造模式'}
export function ModeSeat({sessionId,useSessions,useSceneView,variant}){
 const view=useSceneView(x=>x),session=useSessions(x=>x.byId[sessionId]),actual=session?.projectionValues?.agentPreset
 const legacy=actual&&!['standard','beellix-scene'].includes(actual),label=legacy?(names[actual]??actual)+' · 场景':'场景模式'
 const title=legacy?'原会话执行组成保留；新场景对话使用标准模式＋当前场景包':view.ready?'标准模式＋当前场景包':'场景正在准备'
 return h('span',{className:'beellix-mode-control'+(variant==='header'?' beellix-mode-control--header':'')},h('span',{className:'beellix-mode-seat','aria-label':'执行模式：'+label,title},h(IconAgentPresetOutlineRegular,{size:variant==='header'?14:16}),h('span',null,label)))
}
