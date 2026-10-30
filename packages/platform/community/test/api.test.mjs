import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { mkdirSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { randomUUID } from 'node:crypto'
import { LayoutStore } from '../src/layout.mjs'
import { createApiHandler } from '../src/api.mjs'

async function serverFor(run) {
  const base = resolve(import.meta.dirname, "../../../../dev/artifacts/test-results/dsh-ui-api", randomUUID())
  const installationDirectory = join(base, 'DSH NEXT')
  mkdirSync(installationDirectory, { recursive: true })
  const store = new LayoutStore({ installationDirectory, locatorDirectory: join(base, 'locator'), dshHome: join(base, 'dsh') })
  const server = createServer(createApiHandler({ store, version: '0.1.0', authorize: request => request.headers['x-test-access'] === 'yes' ? undefined : 403 }))
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  try { await run({ store, base: `http://127.0.0.1:${server.address().port}/beellix/bootstrap`, directory: installationDirectory }) }
  finally { await new Promise(resolve => server.close(resolve)) }
}
const headers = { 'x-test-access': 'yes' }

test('接口沿用宿主授权，未授权请求不能查询或初始化目录', () => serverFor(async ({ base, directory }) => {
  assert.equal((await fetch(base + '/state')).status, 403)
  assert.equal((await fetch(base + '/initialize', { method: 'POST', body: '{}' })).status, 403)
  assert.equal(existsSync(join(directory, 'Beellix')), false)
}))

test('初始化要求同一宿主颁发的令牌，拒绝伪造请求与任意目录参数', () => serverFor(async ({ base, directory }) => {
  const state = await (await fetch(base + '/state', { headers })).json()
  assert.equal(state.status, 'uninitialized')
  assert.ok(state.csrfToken.length >= 32)
  assert.equal((await fetch(base + '/initialize', { method: 'POST', headers: { ...headers, 'content-type': 'application/json' }, body: '{}' })).status, 403)
  const mutationHeaders = { ...headers, 'content-type': 'application/json', 'x-beellix-bootstrap-token': state.csrfToken }
  assert.equal((await fetch(base + '/initialize', { method: 'POST', headers: mutationHeaders, body: '{"root":"C:/"}' })).status, 400)
  assert.equal(existsSync(join(directory, 'Beellix')), false)
  const initialized = await fetch(base + '/initialize', { method: 'POST', headers: mutationHeaders, body: '{}' })
  assert.equal(initialized.status, 200)
  assert.equal((await initialized.json()).status, 'ready')
}))

test('接口限定动作、方法和请求体大小', () => serverFor(async ({ base }) => {
  const state = await (await fetch(base + '/state', { headers })).json()
  assert.equal((await fetch(base + '/initialize', { headers })).status, 405)
  assert.equal((await fetch(base + '/unknown', { headers })).status, 404)
  const reply = await fetch(base + '/initialize', { method: 'POST', headers: { ...headers, 'content-type': 'application/json', 'x-beellix-bootstrap-token': state.csrfToken }, body: JSON.stringify({ padding: 'x'.repeat(5000) }) })
  assert.equal(reply.status, 413)
}))

test('自动接回与目录选择都需要授权令牌，拒绝多余路径字段',()=>serverFor(async({base,store})=>{
  let reconnects=0,picks=0
  store.reconnectApplications=async()=>{reconnects++;return{items:[]}}
  store.selectRoot=async directory=>{assert.equal(directory,'D:/fixture/Beellix');picks++;return{restartRequired:true}}
  const state=await(await fetch(base+'/state',{headers})).json()
  for(const path of ['reconnect','choose-directory']){
    assert.equal((await fetch(base+'/'+path,{method:'POST',headers:{...headers,'content-type':'application/json'},body:'{}'})).status,403)
    const mutationHeaders={...headers,'content-type':'application/json','x-beellix-bootstrap-token':state.csrfToken}
    assert.equal((await fetch(base+'/'+path,{method:'POST',headers:mutationHeaders,body:'{"root":"C:/"}'})).status,400)
    const body=path==='choose-directory'?JSON.stringify({directory:'D:/fixture/Beellix'}):'{}'
    assert.equal((await fetch(base+'/'+path,{method:'POST',headers:mutationHeaders,body})).status,200)
  }
  assert.equal(reconnects,1);assert.equal(picks,1)
}))

test('目录选择请求不能接管没有自有归属标记的目录',()=>serverFor(async({base,directory})=>{
  const state=await(await fetch(base+'/state',{headers})).json()
  const result=await fetch(base+'/choose-directory',{method:'POST',headers:{...headers,'content-type':'application/json','x-beellix-bootstrap-token':state.csrfToken},body:JSON.stringify({directory})})
  assert.equal(result.status,409);assert.equal(existsSync(join(directory,'Beellix')),false)
}))
