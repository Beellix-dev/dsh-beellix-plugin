import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { usageApi } from '../src/usage-api.mjs'

test('费用查询与价格保存要求宿主授权和令牌，不接受伪造用量；查询有界', async () => {
  let mutations = 0
  const server = createServer(usageApi({ store: { snapshot: async query => ({ revision: 0, query }), savePrice: async () => { mutations++; return { revision: 1 } } }, native: { sync: async () => ({ total: 1 }) }, ready: () => true, authorize: req => req.headers['x-test-owner'] === 'yes' ? undefined : 403 }))
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  try {
    const base = `http://127.0.0.1:${server.address().port}/beellix/usage`, headers = { 'x-test-owner': 'yes' }
    assert.equal((await fetch(base + '/state')).status, 403)
    const state = await (await fetch(base + '/state', { headers })).json(); assert.ok(state.csrfToken.length >= 32)
    assert.equal((await fetch(base + '/state?root=C:/', { headers })).status, 400)
    assert.equal((await fetch(base + '/state?from=-1', { headers })).status, 400)
    assert.equal((await fetch(base + '/prices', { method: 'POST', headers: { ...headers, 'content-type': 'application/json' }, body: '{}' })).status, 403)
    const write = { ...headers, 'content-type': 'application/json', 'x-beellix-usage-token': state.csrfToken }
    assert.equal((await fetch(base + '/sync', { method: 'POST', headers: write, body: '{"tokens":100}' })).status, 400)
    assert.equal((await fetch(base + '/prices', { method: 'POST', headers: write, body: '{}' })).status, 200)
    assert.equal(mutations, 1)
    assert.equal((await fetch(base + '/prices', { method: 'POST', headers: write, body: JSON.stringify({ text: 'a'.repeat(5000) }) })).status, 413)
  } finally { await new Promise(resolve => server.close(resolve)) }
})
