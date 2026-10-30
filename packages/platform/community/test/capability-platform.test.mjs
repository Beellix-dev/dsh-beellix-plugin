import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,mkdir,writeFile,readFile,symlink,realpath} from 'node:fs/promises'
import {resolve,join} from 'node:path'
import {NativeCapabilities} from "../../../../dev/shared/runtime/native-capabilities.mjs"

async function fixture(){
 const root=await mkdtemp(resolve(import.meta.dirname,"../../../../dev/artifacts/test-results/capability-platform-")),owned=[]
 for(const id of ['knowledge','data-platform']){const directory=join(root,'environment/node_modules/@beellix',id);await mkdir(directory,{recursive:true});owned.push({id,name:'@beellix-ai/'+id,version:'1.0.0',category:'resources',directory,panel:'beellix-'+id,configPanel:'beellix-'+id+'-settings'})}
 return{root,owned,platform:new NativeCapabilities(root,{owned:async()=>owned,ready:()=>true})}
}

test('已归属公共插件可声明专用模型适配器，断开时配置入口随连接释放',async()=>{
 const f=await fixture(),adapter={read:async()=>({revision:0,purposes:[]}),write:async()=>({application:'applied'})}
 const link=await f.platform.register({packageName:'@beellix-ai/knowledge',packageDirectory:f.owned[0].directory,modelConfiguration:adapter})
 assert.equal(f.platform.connections.get('knowledge').modelConfiguration,adapter)
 link.dispose();assert.equal(f.platform.connections.has('knowledge'),false)
 await assert.rejects(f.platform.register({packageName:'@beellix-ai/knowledge',packageDirectory:f.owned[0].directory,modelConfiguration:{read:async()=>{}}}),/CAPABILITY_INPUT_INVALID/)
})
test('知识库与数据中台使用相同接入，目录隔离，可重连且不删除已有数据',async()=>{
 const f=await fixture(),knowledge=await f.platform.register({packageName:'@beellix-ai/knowledge',packageDirectory:f.owned[0].directory})
 assert.equal(knowledge.id,'knowledge');assert.equal(knowledge.contractVersion,1);assert.equal(knowledge.paths.data,join(f.root,'data/capabilities/knowledge'))
 const data=await f.platform.register({packageName:'@beellix-ai/data-platform',packageDirectory:f.owned[1].directory})
 assert.notEqual(knowledge.paths.data,data.paths.data);assert.equal(f.platform.snapshot(f.owned)[0].connection,'ready')
 const path=join(knowledge.paths.data,'keep.json');await writeFile(path,'keep-business')
 await knowledge.dispose();assert.equal(f.platform.snapshot(f.owned)[0].connection,'waiting')
 await f.platform.register({packageName:'@beellix-ai/knowledge',packageDirectory:f.owned[0].directory});assert.equal(await readFile(path,'utf8'),'keep-business')
 await f.platform.dispose();assert.equal(await readFile(path,'utf8'),'keep-business')
})
test('拒绝未归属包、错误位置、重复接入和指向其他目录的数据链接',async()=>{
 const f=await fixture()
 await assert.rejects(f.platform.register({packageName:'@beellix-ai/not-owned',packageDirectory:f.owned[0].directory}),/CAPABILITY_NOT_OWNED/)
 await assert.rejects(f.platform.register({packageName:'@beellix-ai/knowledge',packageDirectory:f.owned[1].directory}),/CAPABILITY_SOURCE_MISMATCH/)
 await f.platform.register({packageName:'@beellix-ai/knowledge',packageDirectory:f.owned[0].directory})
 await assert.rejects(f.platform.register({packageName:'@beellix-ai/knowledge',packageDirectory:f.owned[0].directory}),/CAPABILITY_ALREADY_CONNECTED/)
 const outside=await mkdtemp(resolve(import.meta.dirname,"../../../../dev/artifacts/test-results/capability-outside-"));await writeFile(join(outside,'keep'),'outside')
 await symlink(await realpath(outside),join(f.root,'data/capabilities/data-platform'),'junction')
 await assert.rejects(f.platform.register({packageName:'@beellix-ai/data-platform',packageDirectory:f.owned[1].directory}),/CAPABILITY_DIRECTORY_UNSAFE/)
 assert.equal(await readFile(join(outside,'keep'),'utf8'),'outside')
})
