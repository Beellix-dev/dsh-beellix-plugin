import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { consoleApi } from '../src/console-api.mjs'

test('更新源不向用户开放写接口；检查和安装受原生授权及CSRF保护',async()=>{
 const calls=[],updates={snapshot:async()=>({status:'not-launched',packages:[{name:'@beellix-ai/knowledge',state:'not-launched'}]}),configure:async()=>{throw Error('不能开放更新源配置')},check:async input=>{calls.push(['check',input]);return{status:'checked'}},install:async input=>{calls.push(['install',input]);return{application:'restart-required'}}}
 const server=createServer(consoleApi({addons:{snapshot:async()=>[{id:'knowledge',name:'@beellix-ai/knowledge',state:'enabled'}]},updates,ready:()=>true,authorize:()=>undefined,authorizeUpdates:req=>req.headers['x-owner']==='yes'?undefined:403,ctx:{}}));await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
 try{const base=`http://127.0.0.1:${server.address().port}/beellix/console`,owner={'x-owner':'yes','content-type':'application/json'};assert.equal((await fetch(base+'/updates')).status,403);const state=await(await fetch(base+'/state',{headers:owner})).json();assert.equal(state.updates.status,'not-launched');assert.equal(state.applications[0].onlineUpdate.state,'not-launched');assert.equal(calls.length,0)
  assert.equal((await fetch(base+'/updates/config',{method:'POST',headers:{...owner,'x-beellix-console-token':state.csrfToken},body:'{}'})).status,404)
  for(const route of ['check','install']){assert.equal((await fetch(base+'/updates/'+route,{method:'POST',headers:owner,body:'{}'})).status,403);assert.equal((await fetch(base+'/updates/'+route,{method:'POST',headers:{'content-type':'application/json','x-beellix-console-token':state.csrfToken},body:'{}'})).status,403,'有效连接及令牌不能代替owner身份');assert.equal((await fetch(base+'/updates/'+route,{method:'POST',headers:{...owner,'x-beellix-console-token':state.csrfToken},body:'{}'})).status,200)}
  assert.deepEqual(calls.map(x=>x[0]),['check','install'])
 }finally{await new Promise(resolve=>server.close(resolve))}
})

test('npm 包源预览及安装仍要求宿主授权和令牌，不跳转原生插件市场',async()=>{
 const calls=[],registry={preview:async input=>{calls.push(['preview',input]);return{name:'@beellix-ai/knowledge',version:'1.0.0',digest:'a'.repeat(64)}},install:async input=>{calls.push(['install',input]);return{application:'applied'}}}
 const server=createServer(consoleApi({addons:{snapshot:async()=>[]},registry,ready:()=>true,authorize:req=>req.headers['x-owner']==='yes'?undefined:403,ctx:{}}))
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
 try{
  const base=`http://127.0.0.1:${server.address().port}/beellix/console`,auth={'x-owner':'yes','content-type':'application/json'},body=JSON.stringify({source:'@beellix-ai/knowledge'})
  assert.equal((await fetch(base+'/addons/source/preview',{method:'POST',headers:auth,body})).status,403)
  const {csrfToken}=await(await fetch(base+'/state',{headers:auth})).json(),headers={...auth,'x-beellix-console-token':csrfToken}
  const response=await fetch(base+'/addons/source/preview',{method:'POST',headers,body});assert.equal(response.status,200)
  assert.equal((await response.json()).version,'1.0.0')
  const confirmation={name:'@beellix-ai/knowledge',version:'1.0.0',digest:'a'.repeat(64)}
  assert.equal((await fetch(base+'/addons/source/install',{method:'POST',headers,body:JSON.stringify(confirmation)})).status,200)
  assert.deepEqual(calls,[['preview',{source:'@beellix-ai/knowledge'}],['install',confirmation]])
 }finally{await new Promise(resolve=>server.close(resolve))}
})

test('能力连接状态来自中台登记，启停只进入已核验的自有管理器且仍需授权和令牌',async()=>{
 const calls=[],server=createServer(consoleApi({addons:{snapshot:async()=>[{id:'knowledge',category:'resources',state:'enabled'}],setEnabled:async input=>{calls.push(input);return{application:'applied'}}},platform:{snapshot:rows=>rows.map(row=>({...row,connection:'waiting'}))},ctx:{pluginManager:{setBundleEnabled:()=>{throw Error('不能跳过中台归属核验')}}},ready:()=>true,authorize:req=>req.headers['x-owner']==='yes'?undefined:403}))
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
 try{const base=`http://127.0.0.1:${server.address().port}/beellix/console`,headers={'x-owner':'yes','content-type':'application/json'},state=await(await fetch(base+'/state',{headers})).json();assert.equal(state.capabilities[0].connection,'waiting');const body=JSON.stringify({id:'knowledge',enabled:false,expectedVersion:'1.0.0',expectedEnabled:true});assert.equal((await fetch(base+'/addons/enabled',{method:'POST',headers,body})).status,403);assert.equal(calls.length,0);assert.equal((await fetch(base+'/addons/enabled',{method:'POST',headers:{...headers,'x-beellix-console-token':state.csrfToken},body})).status,200);assert.equal(calls.length,1)}finally{await new Promise(resolve=>server.close(resolve))}
})

test('任务搜索在分页之前进行，未命名会话只改展示，非法范围拒绝',async()=>{
 const items=Array.from({length:35},(_,index)=>({sessionId:'native-'+index,updatedAt:1000-index,running:index===34,projections:{values:index===34?{title:'查找旧任务'}:{}}}))
 const server=createServer(consoleApi({addons:{snapshot:async()=>[]},ready:()=>true,authorize:()=>undefined,ctx:{sessionController:{list:async()=>({items})}}}));await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
 try{const base=`http://127.0.0.1:${server.address().port}/beellix/console/sessions`;const found=await(await fetch(base+'?query='+encodeURIComponent('查找旧任务')+'&status=running')).json();assert.equal(found.total,1);assert.equal(found.items[0].id,'native-34');const list=await(await fetch(base)).json();assert.equal(list.items[0].title,'未命名会话');assert.equal(list.nextOffset,30);assert.equal((await fetch(base+'?status=invalid')).status,400)}finally{await new Promise(resolve=>server.close(resolve))}
})

test('记录查询与总数排除空白新会话，保留排队输入、运行中和场景业务资料',async()=>{
 const items=[{sessionId:'empty',blank:true,updatedAt:10},{sessionId:'queued',blank:true,updatedAt:9,projections:{values:{sessionListMetadata:{lastPromptAt:9}}}},{sessionId:'business',blank:true,updatedAt:8},{sessionId:'running',blank:true,running:true,updatedAt:7},{sessionId:'unknown',updatedAt:6},{sessionId:'pending-native',blank:true,updatedAt:5,projections:{values:{inbox:{'next-turn':[{source:{kind:'user'},content:[{type:'file',attachment:{id:'file-only'}}]}]}}}},{sessionId:'permission-only',blank:true,updatedAt:4,projections:{values:{inbox:{'next-step':[{source:{kind:'user-approval'},content:[{type:'text',text:'权限更新通知'}]}]}}}}]
 const before=structuredClone(items),server=createServer(consoleApi({addons:{snapshot:async()=>[]},ready:()=>true,authorize:()=>undefined,sceneDirectory:async()=>({retainedSessionIds:['business']}),ctx:{sessionController:{list:async()=>({items})}}}))
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
 try{const result=await(await fetch(`http://127.0.0.1:${server.address().port}/beellix/console/sessions`)).json();assert.equal(result.total,5);assert.deepEqual(result.items.map(row=>row.id),['queued','business','running','unknown','pending-native']);assert.deepEqual(items,before)}finally{await new Promise(resolve=>server.close(resolve))}
})

test('本地安装包导入与卸载仍要求原生授权及令牌，上传只接受有界二进制',async()=>{
 const calls=[],targets=[]
 const server=createServer(consoleApi({addons:{snapshot:async()=>[],owned:async()=>[{name:'@beellix-ai/verified'}],importArchive:async(bytes,options)=>{calls.push(bytes.toString());targets.push(options.expectedName);return{name:'@beellix-ai/verified'}},remove:async input=>{calls.push(input);return{application:'applied'}}},ready:()=>true,authorize:req=>req.headers['x-owner']==='yes'?undefined:403,ctx:{}}))
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
 try{
  const base=`http://127.0.0.1:${server.address().port}/beellix/console`,auth={'x-owner':'yes'}
  assert.equal((await fetch(base+'/addons/import',{method:'POST',body:'bad'})).status,403)
  const state=await(await fetch(base+'/state',{headers:auth})).json();assert.deepEqual(state.managedPackages,['@beellix-ai/verified'])
  assert.equal((await fetch(base+'/addons/import',{method:'POST',headers:{...auth,'content-type':'application/octet-stream'},body:'bad'})).status,403)
  const headers={...auth,'x-beellix-console-token':state.csrfToken}
  assert.equal((await fetch(base+'/addons/import',{method:'POST',headers:{...headers,'content-type':'application/json'},body:'{}'})).status,415)
  assert.equal((await fetch(base+'/models/selection',{method:'POST',headers:{...auth,'content-type':'application/json'},body:'{}'})).status,403)
  assert.equal((await fetch(base+'/models/selection',{method:'POST',headers:{...headers,'content-type':'application/json'},body:'{}'})).status,400)
  assert.equal((await fetch(base+'/addons/import',{method:'POST',headers:{...headers,'content-type':'application/octet-stream','x-beellix-expected-package':'@beellix-ai/verified'},body:'fixture-archive'})).status,200)
  assert.deepEqual(targets,['@beellix-ai/verified'])
  assert.equal((await fetch(base+'/addons/remove',{method:'POST',headers:{...headers,'content-type':'application/json'},body:JSON.stringify({id:'verified'})})).status,200)
  assert.deepEqual(calls,['fixture-archive',{id:'verified'}])
 }finally{await new Promise(resolve=>server.close(resolve))}
})

test('任务标题及时间来自 DSH 会话投影，管理写入要求原生授权和操作令牌', async () => {
  let lists = 0
  const server = createServer(consoleApi({ addons: { snapshot: async () => [] }, ready: () => true, catalog: async () => [], authorize: req => req.headers['x-owner'] === 'yes' ? undefined : 403, ctx: { sessionController: { list: async () => { lists++; return { items: [{ sessionId: 'native-session', updatedAt: 123456789, origin: 'subagent', parentSessionId: 'parent', projections: { values: { title: '原生任务名称' } } }] } } } } }))
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  try {
    const base = `http://127.0.0.1:${server.address().port}/beellix/console`, headers = { 'x-owner': 'yes' }
    assert.equal((await fetch(base + '/sessions')).status,403)
    const result = await (await fetch(base + '/sessions', {headers})).json()
    assert.equal(result.items[0].title,'原生任务名称')
    assert.equal(result.items[0].updatedAt,123456789)
    assert.equal(result.items[0].parentSession,'parent')
    assert.equal(lists,1)
    assert.equal((await fetch(base + '/addons/install',{method:'POST',headers:{...headers,'content-type':'application/json'},body:'{}'})).status,403)
  } finally { await new Promise(resolve => server.close(resolve)) }
})

test('模型目录使用原生元数据和管理器，停用行保留可接回且拒绝跨插件和过期启停', async () => {
  let enabled = true, fail = false
  const changes = []
  const provider = {provider:'deepseek-official',displayName:'DeepSeek',settingsNs:'adapter',settingsPath:[]}
  const plugins = () => [{entryId:'native:adapter',patchId:'adapter',moduleName:'@deepseek-ai/dsh-llm-deepseek-api-key',enabled},{entryId:'terminal',moduleName:'@deepseek-ai/dsh-tool-shell',enabled:true}]
  const manager = {listPlugins:async()=>plugins(),listBundles:async()=>[{version:'0.2.1-rc.2',rows:[{moduleName:'@deepseek-ai/dsh-llm-deepseek-api-key'}]}],setPluginEnabled:async(id,value)=>{changes.push({id,value});if(fail)return{application:'failed'};enabled=value;return{application:'applied'}}}
  const ctx = {get:name=>name==='llm'?{listConfigurableProviders:()=>enabled?[provider]:[]}:undefined,pluginManager:manager,sessionController:{modelCatalog:async()=>({groups:enabled?[{id:'deepseek-official',models:[{id:'flash',name:'Flash'}]}]:[],failures:[]})}}
  const server = createServer(consoleApi({addons:{snapshot:async()=>[]},ready:()=>true,catalog:async()=>[],authorize:req=>req.headers['x-owner']==='yes'?undefined:403,ctx}))
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
  try {
    const base=`http://127.0.0.1:${server.address().port}/beellix/console`, headers={'x-owner':'yes'}
    assert.equal((await fetch(base+'/models/catalog')).status,403)
    const token=(await(await fetch(base+'/state',{headers})).json()).csrfToken
    const request=packet=>fetch(base+'/models/enabled',{method:'POST',headers:{...headers,'content-type':'application/json','x-beellix-console-token':token},body:JSON.stringify(packet)})
    const first=await(await fetch(base+'/models/catalog',{headers})).json()
    assert.equal(first.items[0].provider,'deepseek-official')
    assert.equal(first.items[0].entryId,'native:adapter')
    assert.equal(first.items[0].models[0].id,'flash')
    assert.equal(first.items[0].version,'0.2.1-rc.2')
    assert.equal((await request({entryId:'terminal',enabled:false,expectedEnabled:true})).status,403)
    assert.equal((await request({entryId:'native:adapter',enabled:false,expectedEnabled:false})).status,409)
    assert.equal(changes.length,0)
    assert.equal((await request({entryId:'native:adapter',enabled:false,expectedEnabled:true})).status,200)
    const disabled=await(await fetch(base+'/models/catalog',{headers})).json()
    assert.equal(disabled.items[0].provider,'deepseek-official')
    assert.equal(disabled.items[0].enabled,false)
    fail=true
    assert.equal((await request({entryId:'native:adapter',enabled:true,expectedEnabled:false})).status,400)
    assert.equal(enabled,false)
    assert.equal((await request({entryId:'native:adapter',enabled:true,expectedEnabled:false,command:'anything'})).status,400)
  } finally {await new Promise(resolve=>server.close(resolve))}
})
