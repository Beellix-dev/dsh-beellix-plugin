import { packageDirectory, packageEntry, packageEntries } from "../shared/workspace-packages.mjs";
/** 只构建自有插件；不启动客户端、不修改上游或已安装数据。 */
import {execFileSync} from 'node:child_process'
import {mkdir,writeFile} from 'node:fs/promises'
import {resolve,relative} from 'node:path'
import {build} from 'tsdown'
import {buildConsole} from "../../packages/platform/community/scripts/console-build.mjs"
const root=resolve(import.meta.dirname,"../..");await mkdir(resolve(root,"./dev/artifacts/tests"),{recursive:true})
await build({config:false,entry:{index:resolve(root,"dev/shared/atomic-write/src/index.ts")},outDir:resolve(root,"dev/shared/atomic-write/lib"),format:'esm',platform:'node',target:'node22',dts:false,clean:false,outExtensions:()=>({js:'.js'})})
const selected=process.argv.find(arg=>arg.startsWith('--only='))?.slice(7),only=selected?packageEntry(selected).id:null
const names=only?[only]:process.argv.includes('--all')?packageEntries().map(row=>row.id):['dsh-ui','database','knowledge','sales-crm']
for(const name of names)execFileSync(process.execPath,[resolve(root,`${packageDirectory(name)}/scripts/${name==='smart-quotation'?'build-native':'build'}.mjs`),...name==='smart-quotation'?['--out-dir='+resolve(root,"./dev/artifacts/build/smart-quotation")]:['projects','assets','helpdesk','hr','expenses','finance','manufacturing'].includes(name)?[name]:[]],{cwd:root,stdio:'inherit',windowsHide:true})
if(names.includes('dsh-ui')){const aliases={};await buildConsole(resolve(root,'packages/platform/community'),resolve(root,'packages/platform/community/lib'),{aliases,save:ids=>{const outside=ids.filter(id=>!id.startsWith('\0')&&!id.startsWith(root)&&!id.includes('node_modules')&&!['react','react-dom','react/jsx-runtime','@deepseek-ai/dsh-client-ui-primitives'].includes(id));if(outside.length)throw Error('构建越出自有源码根：'+outside.join(','));void writeFile(resolve(root,"./dev/artifacts/console-inputs.json"),JSON.stringify({aliases,files:ids.map(id=>id.startsWith(root)?relative(root,id):id)},null,2))}})}
console.log('自有插件候选已从本目录构建；默认排除冻结场景，未切换运行版本')
