/** 独立目录属于 Beelli X；初始化仅补齐自有结构，不覆盖业务资料。 */
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, writeFileSync, renameSync, unlinkSync } from 'node:fs'
import { basename, dirname, isAbsolute, join, relative, resolve } from 'node:path'
import { createHash, randomUUID } from 'node:crypto'

export const DIRECTORY_LAYOUT = Object.freeze([
  { path: 'config', label: '中台配置' },
  { path: 'environment', label: '自有插件环境' },
  { path: 'data', label: '业务数据' },
  { path: 'knowledge', label: '知识资料' },
  { path: 'files', label: '文件与附件' },
  { path: 'templates', label: '模板资源' },
  { path: 'assets', label: '应用资源' },
  { path: 'cache', label: '可重建缓存' },
  { path: 'logs', label: '中台日志' },
  { path: 'backups', label: '恢复备份' },
])
const MARKER = 'beellix-layout.json'
const ROOT_PRODUCT = '@beellix-ai/dsh-ui'
// 已交付目录保持其原身份；包改名不是数据迁移。
const ROOT_PRODUCTS = new Set([ROOT_PRODUCT, '@beellix/dsh-ui'])
const ENVIRONMENT_NAMES = new Set(['@beellix-ai/local-environment', '@beellix/local-environment'])
const canonical = path => process.platform === 'win32' ? resolve(path).toLowerCase() : resolve(path)
const inside = (root, target) => { const part = relative(root, target); return part === '' || (!part.startsWith('..') && !isAbsolute(part)) }

export class LayoutError extends Error {
  constructor(message, code = 'LAYOUT_BLOCKED') { super(message); this.name = 'LayoutError'; this.code = code }
}

/** 拒绝目录链上的链接，避免初始化越过实际确认的安装边界。 */
function assertPlainPath(target) {
  let path = resolve(target)
  for (;;) {
    if (existsSync(path)) {
      const stat = lstatSync(path)
      if (stat.isSymbolicLink()) throw new LayoutError('目录包含链接或重解析点，请选择普通目录。')
      if (!stat.isDirectory() && !stat.isFile()) throw new LayoutError('目录包含不支持的文件类型。')
    }
    const parent = dirname(path)
    if (parent === path) return
    path = parent
  }
}

function readJson(path) {
  assertPlainPath(path)
  if (!existsSync(path)) return undefined
  const stat = lstatSync(path)
  if (!stat.isFile() || stat.size > 65536) throw new LayoutError('配套目录记录格式无效，已保留原文件。')
  try { return JSON.parse(readFileSync(path, 'utf8')) }
  catch { throw new LayoutError('配套目录记录无法读取，已保留原文件。') }
}

function writeNewJson(path, value) {
  assertPlainPath(path)
  writeFileSync(path, JSON.stringify(value, null, 2) + '\n', { flag: 'wx', mode: 0o600 })
}

function replaceJson(path,value){
  assertPlainPath(path)
  const temporary=join(dirname(path),`.beellix-${randomUUID()}.tmp`)
  writeNewJson(temporary,value)
  try{renameSync(temporary,path)}finally{if(existsSync(temporary))unlinkSync(temporary)}
}

function validateMarker(value){
  if(!value||!ROOT_PRODUCTS.has(value.product)||value.schemaVersion!==1||typeof value.instanceId!=='string'||!/^[0-9a-f-]{36}$/u.test(value.instanceId)||typeof value.createdAt!=='string'||typeof value.installationDirectory!=='string'||!isAbsolute(value.installationDirectory)||value.previousRoots!==undefined&&(!Array.isArray(value.previousRoots)||value.previousRoots.length>32||value.previousRoots.some(root=>typeof root!=='string'||!isAbsolute(root))))throw new LayoutError('配套目录归属或结构版本不匹配，已保留原内容。')
  return value
}

// Earlier knowledge-state reads created this empty skeleton before initialization.
// Accept only those exact empty directories; files, other paths and links still block.
function emptyBootstrapSkeleton(root) {
  if (!existsSync(root)) return true
  const allowed = new Set(['config', 'config/control-plane'])
  const visit = (path, prefix = '') => {
    assertPlainPath(path)
    if (!lstatSync(path).isDirectory()) return false
    return readdirSync(path).every(name => {
      const child = prefix ? `${prefix}/${name}` : name
      return allowed.has(child) && visit(join(path, name), child)
    })
  }
  return visit(root)
}

/** 只接受桌面程序提供的安装事实，普通 node.exe 不作为产品安装位置。 */
export function resolveInstallationDirectory({ executable = '', installAnchor = '' } = {}) {
  const candidates = []
  if (/^(?:DSH(?: NEXT| Desktop[^\\/]*)?|DeepSeek[^\\/]*Harness[^\\/]*)\.exe$/iu.test(basename(executable))) candidates.push(dirname(executable))
  const match = /^(.*?)[\\/]resources[\\/]/iu.exec(installAnchor)
  if (match?.[1]) candidates.push(match[1])
  for (const candidate of candidates) {
    const dir = resolve(candidate)
    assertPlainPath(dir)
    if (existsSync(join(dir, 'resources')) && lstatSync(join(dir, 'resources')).isDirectory()) return dir
  }
  throw new LayoutError('尚未识别到 DSH 桌面安装目录，请从 DSH 桌面客户端打开中台。', 'UNSUPPORTED_HOST')
}

export class LayoutStore {
  #queue = Promise.resolve()
  constructor({ installationDirectory, locatorDirectory, dshHome } = {}) {
    if (!installationDirectory || !locatorDirectory || !isAbsolute(installationDirectory) || !isAbsolute(locatorDirectory)) throw new LayoutError('安装目录和位置记录目录必须是绝对路径。')
    this.installationDirectory = resolve(installationDirectory)
    this.root = join(this.installationDirectory, 'Beellix')
    this.locatorDirectory = resolve(locatorDirectory)
    this.dshHome=dshHome&&resolve(dshHome)
    if (dshHome && (inside(resolve(dshHome), this.root) || inside(resolve(dshHome), this.locatorDirectory))) throw new LayoutError('配套目录及位置记录必须独立于 DSH 数据目录。')
    this.installationKey = createHash('sha256').update(canonical(this.installationDirectory)).digest('hex')
    this.candidates=[]
    try{this.#discover()}catch(error){this.discoveryError=error}
  }

  #locations(){
    const value=readJson(join(this.locatorDirectory,'locations.json'))??{schemaVersion:1,installations:{},roots:[]}
    if(value.schemaVersion!==1||!value.installations||typeof value.installations!=='object'||Array.isArray(value.installations)||Object.keys(value.installations).length>500||value.roots!==undefined&&(!Array.isArray(value.roots)||value.roots.length>500))throw new LayoutError('独立位置记录版本不支持，已保留原文件。')
    return value
  }

  #validateRoot(root){
    if(typeof root!=='string'||!isAbsolute(root)||this.dshHome&&inside(this.dshHome,resolve(root)))throw new LayoutError('配套目录必须是 DSH 用户目录以外的绝对目录。')
    assertPlainPath(root)
    return validateMarker(readJson(join(root,MARKER)))
  }

  #discover(){
    const saved=this.#locations(),selected=saved.installations[this.installationKey]
    if(selected?.preferred===true&&typeof selected.root==='string'&&existsSync(selected.root)){this.#validateRoot(selected.root);this.root=resolve(selected.root);return}
    if(existsSync(this.root)){
      const marker=readJson(join(this.root,MARKER))
      if(marker?.product!=='@beellix/dsh-ui')return
      // 旧产品的数据兼容不等于新中台安装时的接管授权。
      // 只有上方 preferred=true 的明确选择可以继续使用旧环境。
      validateMarker(marker)
      this.root=join(this.installationDirectory,'Beellix-Community')
      if(existsSync(this.root)){
        const current=readJson(join(this.root,MARKER))
        if(current?.product==='@beellix/dsh-ui')throw new LayoutError('社区中台目录已有旧环境，请明确选择要接回的目录。','ROOT_CHOICE_REQUIRED')
        return
      }
    }
    const roots=[selected,...Object.values(saved.installations),...saved.roots??[]].filter(Boolean)
    const unique=new Map()
    for(const item of roots){if(typeof item.root!=='string'||!isAbsolute(item.root)||!existsSync(item.root))continue;try{const marker=this.#validateRoot(item.root);if(marker.product!==ROOT_PRODUCT||item.instanceId&&item.instanceId!==marker.instanceId)continue;unique.set(canonical(item.root),{root:resolve(item.root),instanceId:marker.instanceId})}catch{}}
    this.candidates=[...unique.values()]
    // 其他安装的位置记录只提供用户选择，不因仅剩一份记录而自动接管。
  }

  #marker() {
    if(this.discoveryError)throw this.discoveryError
    if(this.candidates.length>1)throw new LayoutError('发现多个已保留目录，请选择要接回的目录。','ROOT_CHOICE_REQUIRED')
    assertPlainPath(this.installationDirectory); assertPlainPath(this.root)
    if (!existsSync(this.installationDirectory) || !lstatSync(this.installationDirectory).isDirectory()) throw new LayoutError('DSH 安装目录不可用。')
    const value = readJson(join(this.root, MARKER))
    if (value === undefined) {
      if (!emptyBootstrapSkeleton(this.root)) throw new LayoutError('Beellix 目录已有内容且没有归属记录，已保留原内容。')
      return undefined
    }
    return this.#validateRoot(this.root)
  }

  #structureRecords() {
    const environment = readJson(join(this.root, 'environment/package.json'))
    if (environment !== undefined && (!ENVIRONMENT_NAMES.has(environment?.name) || environment.private !== true || !environment.dependencies || typeof environment.dependencies !== 'object' || Array.isArray(environment.dependencies))) throw new LayoutError('插件环境已有其他配置，已保留原内容。')
    const registry = readJson(join(this.root, 'registry.json'))
    if (registry !== undefined && (registry?.schemaVersion !== 1 || !Array.isArray(registry.plugins))) throw new LayoutError('应用登记版本或格式不支持，已保留原内容。')
    return { environment, registry }
  }

  state() {
    const common = { installationDirectory: this.installationDirectory, root: this.root, schemaVersion: 1 }
    try {
      const marker = this.#marker()
      const directories = DIRECTORY_LAYOUT.map(item => {
        const path = join(this.root, item.path); assertPlainPath(path)
        return { ...item, exists: existsSync(path) && lstatSync(path).isDirectory() }
      })
      const records = marker ? this.#structureRecords() : {}
      const complete = directories.every(item => item.exists) && records.environment !== undefined && records.registry !== undefined
      const moved=marker&&(marker.portable!==true||canonical(marker.rootDirectory??join(marker.installationDirectory,'Beellix'))!==canonical(this.root)||canonical(marker.installationDirectory)!==canonical(this.installationDirectory))
      if(moved&&(!records.environment||!records.registry))throw new LayoutError('配套目录复制不完整，请保留原环境和应用登记后重试。')
      return { ...common, status: marker ? (moved?'relocated':complete ? 'ready' : 'incomplete') : 'uninitialized', instanceId: marker?.instanceId, portable:marker?.portable===true, previousRoots:marker?.previousRoots??[], createdAt: marker?.createdAt, directories, pendingRoot:this.pendingRoot }
    } catch (error) {
      return { ...common, status: error.code==='ROOT_CHOICE_REQUIRED'?'choice-required':'blocked', message: this.#message(error), directories: [],candidates:this.candidates }
    }
  }

  initialize() {
    const run = this.#queue.then(() => this.#initialize())
    this.#queue = run.catch(() => {})
    return run
  }

  prepare(){const run=this.#queue.then(()=>{
    const marker=this.#marker();if(!marker)return this.#initialize()
    const state=this.state()
    if(state.status==='blocked')throw new LayoutError(state.message)
    if(state.status==='incomplete')return state
    if(state.status==='relocated'){const records=this.#structureRecords();if(!records.environment||!records.registry)throw new LayoutError('配套目录复制不完整，请保留原环境和应用登记后重试。')}
    return this.#initialize()
  });this.#queue=run.catch(()=>{});return run}

  async selectRoot(root){
    if(arguments.length!==1)throw new LayoutError('目录选择不接受额外参数。')
    const marker=this.#validateRoot(root)
    this.#remember(marker,{root:resolve(root),preferred:true})
    this.pendingRoot=resolve(root)
    return{root:this.pendingRoot,restartRequired:canonical(this.pendingRoot)!==canonical(this.root)||this.candidates.length>1}
  }

  #initialize() {
    try {
      let marker = this.#marker()
      // 先验证已有登记，再补齐目录，避免遇到未知格式时仍产生新结构。
      if (marker) this.#structureRecords()
      if (!marker) {
        if (!existsSync(this.root)) mkdirSync(this.root, { mode: 0o700 })
        marker = { product: ROOT_PRODUCT, schemaVersion: 1, instanceId: randomUUID(), installationDirectory: this.installationDirectory, rootDirectory:this.root,portable:true, createdAt: new Date().toISOString() }
        writeNewJson(join(this.root, MARKER), marker)
      }
      for (const { path } of DIRECTORY_LAYOUT) {
        const destination = join(this.root, path); assertPlainPath(destination)
        if (!existsSync(destination)) mkdirSync(destination, { mode: 0o700 })
        else if (!lstatSync(destination).isDirectory()) throw new LayoutError(`配套目录 ${path} 被文件占用，已保留原内容。`)
      }
      const environmentPath = join(this.root, 'environment/package.json')
      if (!existsSync(environmentPath)) writeNewJson(environmentPath, { name: '@beellix-ai/local-environment', private: true, type: 'module', dependencies: {} })
      const registryPath = join(this.root, 'registry.json')
      if (!existsSync(registryPath)) writeNewJson(registryPath, { schemaVersion: 1, plugins: [] })
      // 先验证外部位置记录，再备份和更新兼容位置字段；业务数据始终不改写。
      this.#locations()
      const oldRoot=marker.rootDirectory??join(marker.installationDirectory,'Beellix')
      if(marker.portable!==true||canonical(oldRoot)!==canonical(this.root)||canonical(marker.installationDirectory)!==canonical(this.installationDirectory)){
        const file=join(this.root,MARKER),bytes=readFileSync(file,'utf8'),backupDirectory=join(this.root,'backups/layout')
        assertPlainPath(backupDirectory);mkdirSync(backupDirectory,{recursive:true,mode:0o700})
        const backup=join(backupDirectory,createHash('sha256').update(bytes).digest('hex')+'.json');assertPlainPath(backup)
        if(!existsSync(backup))writeFileSync(backup,bytes,{flag:'wx',mode:0o600})
        else if(readFileSync(backup,'utf8')!==bytes)throw new LayoutError('位置记录备份不匹配，已保留原内容。')
        marker={...marker,portable:true,rootDirectory:this.root,installationDirectory:this.installationDirectory,previousRoots:[...new Set([...(marker.previousRoots??[]),...canonical(oldRoot)!==canonical(this.root)?[oldRoot]:[]])].slice(-32)}
        replaceJson(file,marker)
      }
      this.#remember(marker)
      return this.state()
    } catch (error) { throw error instanceof LayoutError ? error : new LayoutError(this.#message(error)) }
  }

  #remember(marker,{root=this.root,preferred}={}) {
    assertPlainPath(this.locatorDirectory)
    mkdirSync(this.locatorDirectory, { recursive: true, mode: 0o700 })
    const file = join(this.locatorDirectory, 'locations.json')
    const saved=this.#locations(),previous=saved.installations[this.installationKey]
    const current=existsSync(join(this.root,MARKER))?[{root:this.root,instanceId:this.#validateRoot(this.root).instanceId}]:[]
    const roots=new Map([...(saved.roots??[]),...Object.values(saved.installations),...current,{root,instanceId:marker.instanceId}].filter(item=>typeof item.root==='string').map(item=>[canonical(item.root),{root:item.root,instanceId:item.instanceId}]))
    const value={schemaVersion:1,roots:[...roots.values()].slice(-500),installations:{...saved.installations,[this.installationKey]:{installationDirectory:this.installationDirectory,root,instanceId:marker.instanceId,preferred:preferred??previous?.preferred===true}}}
    replaceJson(file,value)
  }

  #message(error) {
    if (error?.code === 'EACCES' || error?.code === 'EPERM') return '当前用户无法写入 DSH 安装目录，原资料未被覆盖。请调整安装位置或目录权限后重试。'
    return error instanceof LayoutError ? error.message : '配套目录暂不可用，原资料已保留。'
  }
}
