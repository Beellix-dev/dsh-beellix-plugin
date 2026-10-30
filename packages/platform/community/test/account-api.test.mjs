import test from 'node:test'
import assert from 'node:assert/strict'
import {createServer} from 'node:http'
import {accountApi} from '../src/account-api.mjs'
import {WebsiteAccount} from '../src/website-account.mjs'

test('账号预留接口要求原生主用户与CSRF；不接受自报账号、会员或令牌，也不泄露错误详情',async()=>{
 const account=new WebsiteAccount({distribution:{issuer:null},provider:null,credentials:()=>{throw Error('must not read credentials')}}),server=createServer(accountApi({account,authorize:req=>req.headers['x-test-owner']==='yes'?undefined:403}));await new Promise(r=>server.listen(0,'127.0.0.1',r))
 try{
  const base=`http://127.0.0.1:${server.address().port}/beellix/account`,owner={'x-test-owner':'yes'}
  assert.equal((await fetch(base+'/state')).status,403)
  const state=await(await fetch(base+'/state',{headers:owner})).json();assert.equal(state.status,'unconfigured');assert.equal(state.canLogin,false)
  const headers={...owner,'content-type':'application/json','x-beellix-account-token':state.csrfToken},post=(path,body={},extra=headers)=>fetch(base+path,{method:'POST',headers:extra,body:JSON.stringify(body)})
  assert.equal((await post('/login',{},owner)).status,403)
  assert.equal((await post('/login',{subject:'owner',membership:'all',refreshToken:'self-issued'})).status,400)
  const unavailable=await post('/login');assert.equal(unavailable.status,503);assert.equal((await unavailable.json()).error.reason,'ACCOUNT_NOT_CONFIGURED')
  assert.equal((await post('/callback',{session:{subject:'owner'}})).status,404)
  account.begin=async()=>{throw Error('provider error with refresh-secret')};const error=await post('/login');assert.equal(error.status,503);assert.equal((await error.text()).includes('refresh-secret'),false)
 }finally{await new Promise(r=>server.close(r));account.dispose()}
})
