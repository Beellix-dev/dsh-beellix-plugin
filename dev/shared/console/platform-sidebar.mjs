import React from 'react';
const h=React.createElement;
/** Stateless shell shared by community and enterprise; all permissions and data stay in their edition. */
export function PlatformNavigation({entries,selected,onSelect,brand,icon,close,toggle,width=240,collapsed=false}){
 return h('aside',{className:'beellix-platform-sidebar','data-collapsed':collapsed,style:{width},'aria-label':'Beelli X 中台'},
  h('header',{className:'beellix-platform-sidebar__header'},!collapsed&&h('div',{className:'beellix-platform-sidebar__brand'},brand),
   h('button',{type:'button',className:'beellix-platform-sidebar__toggle',onClick:toggle,'aria-label':collapsed?'展开中台导航':'收起中台导航',title:collapsed?'展开中台导航':'收起中台导航'},icon('panel'))),
  h('nav',{className:'beellix-platform__nav','aria-label':'中台页面'},...entries.map(([id,label])=>h('button',{type:'button',key:id,'aria-current':selected===id?'page':undefined,'aria-label':label,title:collapsed?label:undefined,onClick:()=>onSelect(id)},icon(id),h('span',{hidden:collapsed},label)))),
  h('button',{type:'button',className:'beellix-platform-sidebar__back',onClick:close,'aria-label':'返回工作区',title:collapsed?'返回工作区':undefined},icon('back'),h('span',{hidden:collapsed},'返回工作区')));
}
