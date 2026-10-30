import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile, symlink } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { randomUUID } from 'node:crypto'
import { UsageStore, projectUsage, NativeUsage } from "../../../../dev/shared/runtime/native-usage.mjs"

const at = Date.UTC(2026, 9, 25, 1)
const event = (seq, type, data, time = at + seq) => ({ seq, type, data, time })
const route = (provider = 'direct', model = 'model-a') => ({ header: { config: { provider, model } } })
const settlement = (usage, turn = 1, step = 1) => ({ turn, step, stream: usage ? [{ type: 'chunk', time: at, chunk: { type: 'usage', usage } }] : [] })
const inspection = (events, extra = {}) => ({ meta: { id: 'session-a', createdAt: at, ...extra }, inheritedEventCount: 0, events })
const sample = (provider = 'direct', model = 'model-a') => inspection([event(0, 'request/header', route(provider, model)), event(1, 'step/start', { turn: 1, step: 1 }), event(2, 'assistant/message', settlement({ inputTokens: 1000000, outputTokens: 500000, cacheReadTokens: 200000, reasoningTokens: 100000 }))])
const price = { provider: 'direct', model: 'model-a', currency: 'CNY', input: '2', output: '4', cacheRead: '0.5', cacheWrite: '' }
async function fixture() { const root = resolve(import.meta.dirname, "../../../../dev/artifacts/test-results/native-usage", randomUUID()); await mkdir(root, { recursive: true }); return new UsageStore(root, { now: () => at + 1000 }) }

test('调用以尝试去重，缓存独立计数，模型切换和真实重试分别保留', () => {
  const first = sample().events
  const calls = projectUsage(inspection([...first, event(3, 'assistant/message', settlement({ inputTokens: 1000000, outputTokens: 500000, cacheReadTokens: 200000 })), event(4, 'llm/retry-started', { turn: 1, step: 1 }), event(5, 'request/header', route('gateway', 'model-b')), event(6, 'assistant/attempt', settlement({ inputTokens: 10, outputTokens: 2 }))]))
  assert.equal(calls.length, 2); assert.equal(calls[0].usage.inputTokens, 1000000); assert.equal(calls[1].provider, 'gateway')
  assert.equal(calls[1].model, 'model-b'); assert.notEqual(calls[0].id, calls[1].id)
})

test('分支只核算自身调用，子代理保留父关系，缺用量不是零', () => {
  const data = sample(); data.meta = { ...data.meta, id: 'child-a', origin: 'subagent', parentSession: 'session-a', isSeeded: true }; data.inheritedEventCount = data.events.length
  data.events.push(event(3, 'step/start', { turn: 2, step: 1 }), event(4, 'assistant/attempt', settlement(undefined, 2)))
  const calls = projectUsage(data); assert.equal(calls.length, 1); assert.equal(calls[0].parentSessionId, 'session-a'); assert.equal(calls[0].usage, null)
})

test('精确按模型计价，历史补算显式选择，重启和重扫不改价格快照', async () => {
  const store = await fixture(); await store.ingest(sample())
  assert.equal((await store.snapshot()).summary.unpriced, 1)
  await store.savePrice({ ...price, expectedRevision: 0, applyUnpriced: false })
  assert.equal((await store.snapshot()).summary.unpriced, 1)
  await store.savePrice({ ...price, expectedRevision: 1, applyUnpriced: true })
  let state = await store.snapshot(); assert.equal(state.summary.currencies.CNY, '4.100000000000'); assert.equal(state.calls[0].pricing.basis, 'backfill')
  const saved = state.calls[0].pricing
  await store.savePrice({ ...price, input: '100', expectedRevision: 2, applyUnpriced: true }); await store.ingest(sample())
  state = await new UsageStore(store.root).snapshot(); assert.deepEqual(state.calls[0].pricing, saved); assert.equal(state.summary.totalCalls, 1)
  assert.ok(!(await readFile(store.path, 'utf8')).includes('stream'))
})

test('不同渠道、不同币种分别汇总；缺缓存价格和缺用量继续未计价', async () => {
  const store = await fixture(); await store.ingest(sample()); await store.savePrice({ ...price, cacheRead: '', expectedRevision: 0, applyUnpriced: true })
  assert.equal((await store.snapshot()).summary.unpriced, 1)
  await store.ingest({ ...sample('gateway'), meta: { id: 'session-b' } }); await store.savePrice({ ...price, provider: 'gateway', currency: 'USD', expectedRevision: 1, applyUnpriced: true })
  const state = await store.snapshot(); assert.deepEqual(state.summary.currencies, { USD: '4.100000000000' }); assert.equal(state.summary.unpriced, 1)
})

test('版本冲突、负价、超精度和未知字段拒绝；显式零价可计费', async () => {
  const store = await fixture()
  await assert.rejects(store.savePrice({ ...price, input: '-1', expectedRevision: 0 }), /价格/)
  await assert.rejects(store.savePrice({ ...price, output: '0.0000001', expectedRevision: 0 }), /价格/)
  await assert.rejects(store.savePrice({ ...price, root: 'C:/', expectedRevision: 0 }), /字段/)
  await store.savePrice({ ...price, input: '0', output: '0', cacheRead: '0', expectedRevision: 0 })
  await assert.rejects(store.savePrice({ ...price, expectedRevision: 0 }), /刷新/)
  await store.ingest({ ...sample(), events: sample().events.map(e => ({ ...e, time: at + 2000 })) })
  assert.equal((await store.snapshot()).summary.currencies.CNY, '0.000000000000')
})

test('同步沿原生读取接口，重复同步无重计，读取失败保留原记录并报告', async () => {
  const store = await fixture(); let fail = false
  const native = new NativeUsage(store, { list: async () => [{ header: { id: 'session-a' } }], inspect: async () => { if (fail) throw Error('private content'); return sample() } })
  await native.sync(); await native.sync(); assert.equal((await store.snapshot()).summary.totalCalls, 1)
  fail = true; const result = await native.sync(); assert.equal(result.failed, 1); assert.doesNotMatch(JSON.stringify(result), /private content/); assert.equal((await store.snapshot()).summary.totalCalls, 1)
})

test('原生压缩调用有独立用量，普通模板压缩不虚构调用；原文不入计量索引', () => {
  const calls = projectUsage(inspection([event(0, 'compaction/summary', { compactionId: 'compact-a', llmStreamCall: true, provider: 'direct', model: 'model-a', usage: { inputTokens: 20, outputTokens: 5 }, rawOutput: 'private text' }), event(1, 'compaction/summary', { summary: 'template-only' })]))
  assert.equal(calls.length, 1); assert.equal(calls[0].kind, 'compaction'); assert.equal(calls[0].usage.inputTokens, 20); assert.doesNotMatch(JSON.stringify(calls), /private text|rawOutput/)
})

test('并发价格保存只接受同一修订一次，损坏记录不会被空状态覆盖', async () => {
  const store = await fixture()
  const result = await Promise.allSettled([store.savePrice({ ...price, expectedRevision: 0 }), store.savePrice({ ...price, expectedRevision: 0 })])
  assert.equal(result.filter(row => row.status === 'fulfilled').length, 1)
  assert.equal((await store.snapshot()).prices.length, 1)
  await writeFile(store.path, '{bad-json', 'utf8')
  await assert.rejects(store.savePrice({ ...price, expectedRevision: 1 })); assert.equal(await readFile(store.path, 'utf8'), '{bad-json')
})

test('已有用量目录含链接时拒绝写入目标', async () => {
  const store = await fixture(), outside = join(store.root, 'outside')
  await mkdir(outside); await symlink(outside, join(store.root, 'data'), process.platform === 'win32' ? 'junction' : 'dir')
  await assert.rejects(store.savePrice({ ...price, expectedRevision: 0 }), /链接|安全/)
})

test('同步进行中又有新调用时补读，不遗漏最后一次提交', async () => {
  const store = await fixture(); let reads = 0, release
  const gate = new Promise(resolve => { release = resolve })
  const native = new NativeUsage(store, { list: async () => [], inspect: async () => { reads++; if (reads === 1) { await gate; return sample() } return inspection([...sample().events, event(3, 'step/start', { turn: 1, step: 2 }), event(4, 'assistant/message', settlement({ inputTokens: 5, outputTokens: 1 }, 1, 2))]) } })
  const first = native.capture('session-a'), second = native.capture('session-a'); release(); await Promise.all([first, second])
  assert.equal((await store.snapshot()).summary.totalCalls, 2); assert.equal(reads, 2)
})
