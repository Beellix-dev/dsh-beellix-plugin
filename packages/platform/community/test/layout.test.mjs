import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync, symlinkSync, renameSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { randomUUID } from 'node:crypto'
import { LayoutStore, resolveInstallationDirectory, DIRECTORY_LAYOUT } from '../src/layout.mjs'

const evidence = resolve(import.meta.dirname, "../../../../dev/artifacts/test-results/dsh-ui-layout")
function fixture() {
  const base = join(evidence, randomUUID())
  const installationDirectory = join(base, 'DSH NEXT')
  mkdirSync(join(installationDirectory, 'resources'), { recursive: true })
  writeFileSync(join(installationDirectory, 'DSH NEXT.exe'), '')
  const options = { installationDirectory, locatorDirectory: join(base, 'BeelliX-user-config'), dshHome: join(base, 'dsh-home') }
  return { base, ...options, store: new LayoutStore(options) }
}

test('从真实桌面安装信息定位目录，不使用工作区或 DSH 数据目录', () => {
  const f = fixture()
  assert.equal(resolveInstallationDirectory({ executable: join(f.installationDirectory, 'DSH NEXT.exe') }), f.installationDirectory)
  assert.equal(resolveInstallationDirectory({ installAnchor: join(f.installationDirectory, 'resources/app.asar/package.json') }), f.installationDirectory)
  assert.throws(() => resolveInstallationDirectory({ executable: join(f.base, 'node.exe') }), /安装目录/)
})

test('首次初始化在安装目录下创建完整配套结构，重复初始化保留资料', async () => {
  const f = fixture()
  assert.equal(f.store.state().status, 'uninitialized')
  const first = await f.store.initialize()
  assert.equal(first.status, 'ready')
  assert.equal(first.root, join(f.installationDirectory, 'Beellix'))
  for (const item of DIRECTORY_LAYOUT) assert.ok(existsSync(join(first.root, item.path)), item.path)
  const data = join(first.root, 'data/原有资料.txt')
  writeFileSync(data, '不得覆盖')
  const marker = readFileSync(join(first.root, 'beellix-layout.json'), 'utf8')
  await Promise.all([f.store.initialize(), f.store.initialize()])
  assert.equal(readFileSync(data, 'utf8'), '不得覆盖')
  assert.equal(readFileSync(join(first.root, 'beellix-layout.json'), 'utf8'), marker)
  const environment = JSON.parse(readFileSync(join(first.root, 'environment/package.json'), 'utf8'))
  assert.equal(environment.private, true)
  assert.deepEqual(environment.dependencies, {})
})

test('拒绝占用已有非空目录，不认领或覆盖用户文件', async () => {
  const f = fixture(), root = join(f.installationDirectory, 'Beellix')
  mkdirSync(root); writeFileSync(join(root, '已有文件.txt'), 'keep')
  assert.equal(f.store.state().status, 'blocked')
  await assert.rejects(f.store.initialize(), /已有内容/)
  assert.deepEqual(readdirSync(root), ['已有文件.txt'])
})

test('知识状态读取不会抢先创建无归属目录，首次初始化仍可完成', async () => {
  const f = fixture()
  const { KnowledgeSessions } = await import('../src/knowledge-sessions.mjs')
  const knowledge = new KnowledgeSessions(f.store.root, { inspect: async () => ({ id: 'one' }), owned: async () => [] })
  try {
    assert.equal((await knowledge.read('one')).enabled, false)
    assert.equal(existsSync(f.store.root), false)
    assert.equal((await f.store.initialize()).status, 'ready')
  } finally { await knowledge.dispose() }
})

test('可接续旧读取逻辑留下的空配置骨架，但拒绝其中的文件或其他目录', async () => {
  const f = fixture(), root = f.store.root
  mkdirSync(join(root, 'config/control-plane'), { recursive: true })
  assert.equal(f.store.state().status, 'uninitialized')
  assert.equal((await f.store.initialize()).status, 'ready')
  for (const unexpected of ['config/control-plane/retained.json', 'config/unknown']) {
    const other = fixture(), target = join(other.store.root, unexpected)
    mkdirSync(join(other.store.root, 'config/control-plane'), { recursive: true })
    if (unexpected.endsWith('.json')) writeFileSync(target, 'keep')
    else mkdirSync(target)
    assert.equal(other.store.state().status, 'blocked')
    await assert.rejects(other.store.initialize(), /已有内容/)
    assert.ok(existsSync(target))
  }
})

test('拒绝重解析目录，不向链接目标初始化', async () => {
  const f = fixture(), outside = join(f.base, 'outside')
  mkdirSync(outside)
  symlinkSync(outside, join(f.installationDirectory, 'Beellix'), process.platform === 'win32' ? 'junction' : 'dir')
  await assert.rejects(f.store.initialize(), /链接|重解析/)
  assert.deepEqual(readdirSync(outside), [])
})

test('空配置骨架中的重解析点仍拒绝接续', async () => {
  const f = fixture(), outside = join(f.base, 'outside')
  mkdirSync(outside)
  mkdirSync(f.store.root)
  symlinkSync(outside, join(f.store.root, 'config'), process.platform === 'win32' ? 'junction' : 'dir')
  assert.equal(f.store.state().status, 'blocked')
  await assert.rejects(f.store.initialize(), /链接|重解析/)
  assert.deepEqual(readdirSync(outside), [])
})

test('检查及修复缺少的配套目录，不删除已有业务资料', async () => {
  const f = fixture(), initial = await f.store.initialize()
  renameSync(join(initial.root, 'cache'), join(initial.root, 'cache-backup'))
  assert.equal(f.store.state().status, 'incomplete')
  const repaired = await f.store.initialize()
  assert.equal(repaired.status, 'ready')
  assert.ok(existsSync(join(initial.root, 'cache-backup')))
})

test('应用登记文件缺失时报告待补齐，避免把半完成初始化当成就绪', async () => {
  const f = fixture(), initial = await f.store.initialize()
  renameSync(join(initial.root, 'registry.json'), join(initial.root, 'registry.saved.json'))
  assert.equal(f.store.state().status, 'incomplete')
  assert.equal((await f.store.initialize()).status, 'ready')
  assert.ok(existsSync(join(initial.root, 'registry.saved.json')))
})

test('插件环境文件缺失可补齐；未知登记格式受阻且保留原文件', async () => {
  const f = fixture(), initial = await f.store.initialize()
  renameSync(join(initial.root, 'environment/package.json'), join(initial.root, 'environment/package.saved.json'))
  assert.equal(f.store.state().status, 'incomplete')
  assert.equal((await f.store.initialize()).status, 'ready')
  const registry = join(initial.root, 'registry.json'), invalid = '{"schemaVersion":1,"plugins":{}}'
  writeFileSync(registry, invalid)
  assert.equal(f.store.state().status, 'blocked')
  await assert.rejects(f.store.initialize(), /登记/)
  assert.equal(readFileSync(registry, 'utf8'), invalid)
})

test('模拟 DSH 数据目录重置后，新引导实例仍接回同一外置目录', async () => {
  const f = fixture(), before = await f.store.initialize()
  mkdirSync(f.dshHome, { recursive: true }); writeFileSync(join(f.dshHome, 'old-profile.json'), '{}')
  writeFileSync(join(before.root, 'data/业务记录.json'), '{"saved":true}')
  renameSync(f.dshHome, join(f.base, 'dsh-recovery-backup'))
  mkdirSync(f.dshHome)
  const restored = new LayoutStore(f).state()
  assert.equal(restored.status, 'ready')
  assert.equal(restored.instanceId, before.instanceId)
  assert.equal(readFileSync(join(restored.root, 'data/业务记录.json'), 'utf8'), '{"saved":true}')
  assert.ok(existsSync(join(f.locatorDirectory, 'locations.json')))
})

test('未知目录结构版本拒绝降级写入', async () => {
  const f = fixture(), initialized = await f.store.initialize()
  const path = join(initialized.root, 'beellix-layout.json')
  const next = JSON.parse(readFileSync(path, 'utf8')); next.schemaVersion = 999
  writeFileSync(path, JSON.stringify(next))
  await assert.rejects(f.store.initialize(), /版本/)
  assert.equal(JSON.parse(readFileSync(path, 'utf8')).schemaVersion, 999)
})
