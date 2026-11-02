import {resolve,relative,isAbsolute} from 'node:path'
export function platformBoundary(root){
 const own=resolve(root),platform=resolve(root,'..')
 return {name:'platform-source-boundary',generateBundle(){
  for(let id of this.getModuleIds()){
   if(id.startsWith('\0console-css:'))id=id.slice(13,-4)
   if(id.startsWith('\0'))continue
   const target=resolve(id),part=relative(platform,target),local=relative(own,target)
   const inside=part!==''&&!part.startsWith('..')&&!isAbsolute(part)
   if(inside&&(local.startsWith('..')||isAbsolute(local)))throw Error('Build imported another platform entry: '+target)
  }
 }}
}
