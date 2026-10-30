import React from 'react'
const h=React.createElement
// 构建时内联产品既有图标，不依赖另一个客户端或外部图片服务。
const symbol=__BEELLIX_BRAND_SYMBOL__
export function SceneBrand({scene}){
  return h('span',{className:'beellix-scene-brand'},
    h('span',{className:'beellix-scene-brand-name'},h('img',{src:symbol,alt:'',width:32,height:32,draggable:false}),h('span',{},'Beelli X')),
    h('span',{className:'beellix-scene-brand-context',title:scene.title},scene.title),
    scene.version?h('span',{className:'beellix-scene-brand-version','aria-label':'场景版本 '+scene.version},'v'+scene.version):null)
}
