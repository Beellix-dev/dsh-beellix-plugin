/** 产品品牌占用 DSH 公开品牌槽；释放插件后由宿主恢复原品牌。 */
import React from 'react'
const h=React.createElement
export const productSymbol=__BEELLIX_BRAND_SYMBOL__
const version=__BEELLIX_UI_VERSION__
export function ProductMark({size=24}){return h('img',{className:'beellix-product-mark',src:productSymbol,alt:'',width:size,height:size,draggable:false})}
export function ProductName(){return h('span',{className:'beellix-product-name'},'Beelli X')}
export function WorkspaceBrand(){return h('span',{className:'beellix-workspace-brand'},h('span',{className:'beellix-workspace-brand__identity'},h(ProductMark,{size:32}),h('strong',{},'Beelli X')),h('span',{className:'beellix-workspace-brand__version','aria-label':'UI 插件版本 '+version},'v'+version),h('span',{className:'beellix-workspace-brand__tagline'},'基于 DSH 构建的智能助手'))}
export function installProductBrand(ctx){
  for(const [name,Component,priority]of[['sidebar.brand.mark',ProductMark,-100],['sidebar.brand.name',ProductName,-100],['conversation.hero.brand.mark',WorkspaceBrand,200]])ctx.effect(()=>ctx.slots.inject(name,()=>ctx.slots.register({name,id:'beellix-'+name,priority},Component)),'Beelli X：'+name)
}
