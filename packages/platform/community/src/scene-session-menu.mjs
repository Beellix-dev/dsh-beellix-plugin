import React,{useState} from 'react'
import {Menu,IconEllipsisOutlineRegular,IconEditOutlineRegular,IconArchiveOutlineRegular} from '@deepseek-ai/dsh-client-ui-primitives'
export function SessionMenuAction({sessionId,displayTitle,requestSessionRename,archiveSession}){
 const [open,setOpen]=useState(false),h=React.createElement
 const items=[...requestSessionRename?[{id:'rename',label:'重命名',icon:h(IconEditOutlineRegular)}]:[],...archiveSession?[{id:'archive',label:'归档',icon:h(IconArchiveOutlineRegular)}]:[]]
 return h('span',{className:'beellix-scene-session-menu','data-menu-open':open},h(Menu,{open,onClose:()=>setOpen(false),portal:true,closeOnPointerLeave:true,items,onSelect:id=>{setOpen(false);if(id==='rename')requestSessionRename?.(sessionId,displayTitle);else if(id==='archive')archiveSession?.(sessionId)},anchor:h('button',{type:'button',className:'beellix-scene-row-icon','aria-label':'会话操作：'+displayTitle,onClick:()=>setOpen(value=>!value)},h(IconEllipsisOutlineRegular))}))
}
