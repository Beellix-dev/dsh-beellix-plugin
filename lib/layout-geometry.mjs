/** 展开态的比例策略；所有 owner、轨道及拖动边界共用同一几何结果。 */
export const DEFAULT_RATIOS=Object.freeze([.12,.38,.5])
export const validRatios=value=>Array.isArray(value)&&value.length===3&&value.every(x=>Number.isFinite(x)&&x>=.03&&x<=.8)&&Math.abs(value.reduce((a,b)=>a+b,0)-1)<.000001
const clamp=(n,min,max)=>Math.max(min,Math.min(n,max))
export function solveLayout(viewport,{ratios=DEFAULT_RATIOS,sidebar=true,rightbar=true,collapsedWidth=0}={}){
 const width=Math.max(0,viewport),left=sidebar?Math.min(Math.max(200,width*ratios[0]),Math.max(0,width-400)):Math.min(width,collapsedWidth)
 const available=width-left-400
 const right=rightbar&&available>=300?Math.min(available,Math.max(300,width*ratios[2])):0
 return{sidebar:left,center:width-left-right,rightbar:right}
}
export function dragLayout(viewport,ratios,side,pixels){
 if(viewport<1024||!validRatios(ratios))return ratios
 let left=ratios[0]*viewport,right=ratios[2]*viewport
 if(side==='sidebar')left=clamp(pixels,200,Math.max(200,viewport-400-Math.max(300,right)))
 else right=clamp(pixels,300,Math.max(300,viewport-400-Math.max(200,left)))
 const next=[left/viewport,(viewport-left-right)/viewport,right/viewport]
 return validRatios(next)?next:ratios
}
