import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,readFile,writeFile} from 'node:fs/promises'
import {resolve,join} from 'node:path'
import {WebsiteAccount} from '../src/website-account.mjs'

const issuer='https://accounts.example.test',distribution={issuer,authorizationOrigins:[issuer]},session=(n=1)=>({subject:'synthetic-owner',displayName:'验收账号',accessToken:'access-'+n,refreshToken:'refresh-'+n,expiresAt:new Date(Date.now()+3600000).toISOString(),membership:{label:'验收会员',expiresAt:new Date(Date.now()+86400000).toISOString()},entitlements:[{pluginId:'@beellix-ai/test-paid',actions:['download','update'],expiresAt:new Date(Date.now()+86400000).toISOString()}]})
async function fixture(){const root=await mkdtemp(resolve("./dev/artifacts/account-session-")),path=join(root,'credentials.json');let queue=Promise.resolve(),writes=0
 const read=async()=>{try{return JSON.parse(await readFile(path,'utf8'))}catch(e){if(e.code==='ENOENT')return;throw e}}
 const credentials={readRecord:read,modifyRecord:(_key,fn)=>{const result=queue.then(async()=>{const value=await fn(await read());if(value!==undefined){await writeFile(path,JSON.stringify(value));writes++}return value});queue=result.catch(()=>{});return result},deleteRecord:()=>{const result=queue.then(async()=>{await writeFile(path,'null');writes++});queue=result.catch(()=>{});return result}}
 const provider={begin:async()=>({id:'attempt-1',url:issuer+'/authorize?state=synthetic',expiresAt:new Date(Date.now()+60000).toISOString()}),poll:async()=>({status:'complete',session:session()}),refresh:async current=>({...session(2),subject:current.subject}),revoke:async()=>{}}
 const create=(options={})=>new WebsiteAccount({distribution,credentials:()=>credentials,provider,automatic:false,...options})
 return{root,path,credentials,provider,create,writes:()=>writes}
}

test('官网未上线时不伪造登录、不读写凭据或联网，会员接口不可据展示值放行',async()=>{
 const f=await fixture(),account=f.create({distribution:{issuer:null},provider:null});try{
  assert.equal((await account.snapshot()).status,'unconfigured');await account.restore();assert.equal(f.writes(),0)
  await assert.rejects(account.begin(),/ACCOUNT_NOT_CONFIGURED/)
  await assert.rejects(account.logout(),/ACCOUNT_NOT_CONFIGURED/);assert.equal(f.writes(),0)
  assert.deepEqual(await account.eligibility({pluginId:'@beellix-ai/test-paid',action:'download'}),{allowed:false,status:'unconfigured'})
  assert.equal(account.publicService().begin,undefined)
 }finally{account.dispose()}
})

test('授权完成后持久保存，重建服务通过宿主刷新恢复；前端不含凭据、授权URL或资格全集',async()=>{
 const f=await fixture(),first=f.create();try{
  const start=await first.begin();assert.equal(start.authorizationUrl.startsWith(issuer),true);assert.equal((await first.snapshot()).status,'pending')
  await first.poll({attemptId:start.attemptId});const publicState=await first.snapshot();assert.equal(publicState.status,'signed-in');assert.equal(publicState.account.displayName,'验收账号');assert.equal(publicState.membership.label,'验收会员')
  const text=JSON.stringify(publicState);for(const secret of ['access-','refresh-','authorize','entitlements'])assert.equal(text.includes(secret),false)
  assert.equal((await first.eligibility({pluginId:'@beellix-ai/test-paid',action:'download'})).allowed,true)
  assert.equal((await first.eligibility({pluginId:'@beellix-ai/other',action:'download'})).allowed,false)
  first.dispose();const next=f.create();try{assert.equal((await next.snapshot()).status,'signed-out');await next.restore();assert.equal((await next.snapshot()).status,'signed-in');assert.equal((await f.credentials.readRecord()).payload.session.accessToken,'access-2')}finally{next.dispose()}
 }finally{first.dispose()}
})

test('断网保留凭据且不以旧会员缓存批准新获取；明确失效要求重新登录，其他账号不被覆盖',async()=>{
 const f=await fixture(),a=f.create();try{const start=await a.begin();await a.poll({attemptId:start.attemptId});f.provider.refresh=async()=>{throw Error('network access-secret')};await a.restore();assert.equal((await a.snapshot()).status,'offline');assert.equal(JSON.stringify(await a.snapshot()).includes('access-secret'),false);assert.equal((await a.eligibility({pluginId:'@beellix-ai/test-paid',action:'download'})).allowed,false);assert.ok((await f.credentials.readRecord()).payload.session.refreshToken)
 f.provider.refresh=async()=>{throw Error('ACCOUNT_REAUTH_REQUIRED')};await a.restore();assert.equal((await a.snapshot()).status,'signed-out');assert.equal((await f.credentials.readRecord()).payload.session,null)
 await f.credentials.modifyRecord('',async()=>({kind:'grant',payload:{schemaVersion:1,issuer:'https://other.example.test',session:session()}}));const before=await readFile(f.path);await a.restore();assert.equal((await a.snapshot()).status,'signed-out');assert.deepEqual(await readFile(f.path),before)
 }finally{a.dispose()}
})

test('退出和取消使晚到授权失效；敏感凭据删除后不会由在途刷新重新写回',async()=>{
 const f=await fixture(),a=f.create();try{let finish,entered;const waiting=new Promise(r=>entered=r);f.provider.poll=async()=>{entered();return new Promise(r=>finish=r)};const start=await a.begin(),pending=a.poll({attemptId:start.attemptId}),rejected=assert.rejects(pending,/ACCOUNT_CANCELLED/);await waiting;await a.logout();finish({status:'complete',session:session()});await rejected;assert.equal(await f.credentials.readRecord(),undefined);assert.equal((await a.snapshot()).status,'signed-out')
 f.provider.poll=async()=>({status:'complete',session:session()});const second=await a.begin();await a.cancel();await assert.rejects(a.poll({attemptId:second.attemptId}),/ACCOUNT_ATTEMPT/)
 }finally{a.dispose()}
})

test('授权源、超时、主体和返回记录验证，错误响应不污染已存状态',async()=>{
 const f=await fixture(),a=f.create();try{for(const url of ['http://accounts.example.test/auth','https://evil.example.test/auth','file:///C:/secret','https://user:password@accounts.example.test/auth']){f.provider.begin=async()=>({id:'x',url,expiresAt:new Date(Date.now()+10000).toISOString()});await assert.rejects(a.begin(),/ACCOUNT_PROVIDER_INVALID/)}
 f.provider.begin=async()=>({id:'x',url:issuer+'/auth',expiresAt:new Date(Date.now()+10000).toISOString()});f.provider.poll=async()=>({status:'complete',session:{...session(),subject:''}});const start=await a.begin();await assert.rejects(a.poll({attemptId:start.attemptId}),/ACCOUNT_PROVIDER_INVALID/);assert.equal(f.writes(),0)
 }finally{a.dispose()}
})

test('不同服务实例使用原生原子凭据修改，刷新读取最新轮换值',async()=>{
 const f=await fixture(),a=f.create(),b=f.create(),seen=[];try{const start=await a.begin();await a.poll({attemptId:start.attemptId});f.provider.refresh=async current=>{seen.push(current.refreshToken);await new Promise(r=>setTimeout(r,5));return{...session(seen.length+1),subject:current.subject}};await Promise.all([a.restore(),b.restore()]);assert.deepEqual(seen,['refresh-1','refresh-2']);assert.equal((await f.credentials.readRecord()).payload.session.refreshToken,'refresh-3')
 }finally{a.dispose();b.dispose()}
})

test('退出断网账号仍撤销原凭据；不删除其他发行者记录，存储失败不伪报退出成功',async()=>{
 const f=await fixture(),a=f.create();try{
  const start=await a.begin();await a.poll({attemptId:start.attemptId});f.provider.refresh=async()=>{throw Error('offline')};await a.restore();let revoked
  f.provider.revoke=async old=>{revoked=old.refreshToken;throw Error('offline')}
  assert.equal((await a.logout()).remoteLogout,'unconfirmed');assert.equal(revoked,'refresh-1');assert.equal(await f.credentials.readRecord(),null)
  await f.credentials.modifyRecord('',async()=>({kind:'grant',payload:{schemaVersion:1,issuer:'https://other.example.test',session:session()}}));const before=await readFile(f.path);await a.logout();assert.deepEqual(await readFile(f.path),before)
  await f.credentials.modifyRecord('',async()=>({kind:'grant',payload:{schemaVersion:1,issuer,session:session()}}));f.credentials.deleteRecord=async()=>{throw Error('private disk error')};await assert.rejects(a.logout(),/ACCOUNT_STORAGE/);assert.notEqual((await a.snapshot()).status,'signed-in');assert.ok((await f.credentials.readRecord()).payload.session)
 }finally{a.dispose()}
})

test('凭据提交失败不能显示登录成功，过期授权与晚到刷新不能恢复已退出账号',async()=>{
 const f=await fixture(),a=f.create();try{
  const modify=f.credentials.modifyRecord;f.credentials.modifyRecord=async()=>{throw Error('write failed')};const start=await a.begin();await assert.rejects(a.poll({attemptId:start.attemptId}),/write failed/);assert.notEqual((await a.snapshot()).status,'signed-in');assert.equal(await f.credentials.readRecord(),undefined)
  f.credentials.modifyRecord=modify;await a.cancel();const next=await a.begin();await a.poll({attemptId:next.attemptId});let entered;const waiting=new Promise(r=>entered=r);f.provider.refresh=async()=>{entered();return new Promise(()=>{})};const inflight=a.restore(),rejected=assert.rejects(inflight,/ACCOUNT_CANCELLED/);await waiting;await a.logout();await rejected;assert.equal(await f.credentials.readRecord(),null);assert.equal((await a.snapshot()).status,'signed-out')
 }finally{a.dispose()}
})
