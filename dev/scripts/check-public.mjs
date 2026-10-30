import assert from 'node:assert/strict'
import {readFile,access,readdir} from 'node:fs/promises'
import {resolve,join,dirname,relative,isAbsolute} from 'node:path'

const root=resolve(import.meta.dirname,'../..')
const pkg=JSON.parse(await readFile(join(root,'package.json'),'utf8'))
assert.equal(pkg.name,'@beellix-ai/dsh-beellix-plugin')
assert.equal(pkg.version,'0.1.1')
assert.equal(pkg.license,'MIT')
assert.ok(pkg.engines.dsh)
assert.equal(pkg.dsh.engines,undefined)
for(const path of pkg.files)assert.ok(path.startsWith('./'),'发行路径必须限定根目录：'+path)
for(const file of ['LICENSE','README.md',pkg.main,pkg.exports['./client'],pkg.dsh.bundle.patch])await access(resolve(root,file))
for(const name of await readdir(join(root,'packages/platform')))assert.equal(name,'community')
assert.doesNotMatch(await readFile(join(root,'lib/client.js'),'utf8'),/^\/\/#region[^\r\n]*console-css:/m,'编译文件不能包含CSS构建绝对路径')

let documents=0,links=0
const anchorCache=new Map()
async function anchors(file){
 if(anchorCache.has(file))return anchorCache.get(file)
 const source=(await readFile(file,'utf8')).replace(/```[\s\S]*?```/g,''),known=new Set(),counts=new Map()
 for(const match of source.matchAll(/^#{1,6}\s+(.+)$/gm)){
  const key=match[1].replace(/<[^>]+>/g,'').replace(/[^\p{L}\p{N}\p{M}\s_-]/gu,'').trim().toLowerCase().replace(/\s/g,'-'),count=counts.get(key)??0
  known.add(key+(count?'-'+count:''));counts.set(key,count+1)
 }
 for(const match of source.matchAll(/\bid=["']([^"']+)["']/g))known.add(match[1])
 anchorCache.set(file,known);return known
}
async function walk(path){
 for(const entry of await readdir(path,{withFileTypes:true})){
  if(['.git','node_modules','.yarn','lib','artifacts'].includes(entry.name))continue
  const file=join(path,entry.name)
  if(entry.isDirectory()){await walk(file);continue}
  if(!entry.name.endsWith('.md'))continue
  documents++;const text=await readFile(file,'utf8')
  for(const match of text.matchAll(/\[[^\]\n]+\]\(([^\s)]+)\)/g)){
   let target=match[1];const own='https://github.com/Beellix-dev/dsh-beellix-plugin/blob/main/',repositoryLink=target.startsWith(own)
   if(repositoryLink)target=target.slice(own.length);else if(/^[a-z]+:/i.test(target))continue
   const [path,fragment]=target.split('#'),absolute=path?resolve(repositoryLink?root:dirname(file),decodeURIComponent(path)):file,part=relative(root,absolute)
   assert.ok(!part.startsWith('..')&&!isAbsolute(part),'文档链接越出仓库：'+relative(root,file))
   await access(absolute);links++
   if(fragment&&absolute.endsWith('.md'))assert.ok((await anchors(absolute)).has(decodeURIComponent(fragment)),'无效文档锚点：'+relative(root,file)+' -> '+target)
  }
 }
}
await walk(root)
await import('./audit-public.mjs')
console.log(JSON.stringify({manifest:'passed',documents,localLinks:links,scope:'community-source-and-documents'}))
