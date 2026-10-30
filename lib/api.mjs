/** 使用现有 DSH 授权通道，仅暴露当前安装目录的查询与初始化。 */
import { randomBytes, timingSafeEqual } from 'node:crypto'
import { LayoutError } from './layout.mjs'

function failure(message, status) { return Object.assign(new Error(message), { status }) }
function send(response, status, value) {
  const body = Buffer.from(JSON.stringify(value))
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'content-length': body.length, 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' })
  response.end(body)
}
function readBody(request) {
  return new Promise((resolve, reject) => {
    let bytes = 0, exceeded = false
    const chunks = []
    request.on('data', chunk => {
      if (exceeded) return
      const buffer = Buffer.from(chunk); bytes += buffer.length
      if (bytes > 4096) { exceeded = true; reject(failure('请求内容过大。', 413)); return }
      chunks.push(buffer)
    })
    request.on('end', () => { if (!exceeded) resolve(Buffer.concat(chunks).toString('utf8')) })
    request.on('error', () => reject(failure('请求读取失败。', 400)))
    request.on('aborted', () => reject(failure('请求已取消。', 400)))
  })
}

export function createApiHandler({ store, version, authorize,onError }) {
  const token = randomBytes(32).toString('base64url')
  const snapshot = async() => ({ ...await(store.readState?.()??store.state()), version, csrfToken: token })
  return (request, response) => {
    void (async () => {
      if (typeof authorize !== 'function') { send(response, 503, { message: 'DSH 授权服务尚未就绪。' }); return }
      const refusal = authorize(request)
      if (refusal !== undefined) { send(response, typeof refusal === 'number' ? refusal : 403, { message: '当前连接无权访问中台。' }); return }
      const path = new URL(request.url ?? '/', 'http://beellix.local').pathname
      if (path === '/beellix/bootstrap/state') {
        if (request.method !== 'GET') { send(response, 405, { message: '请求方法不支持。' }); return }
        send(response, 200, await snapshot()); return
      }
      if (!['/beellix/bootstrap/initialize','/beellix/bootstrap/reconnect','/beellix/bootstrap/choose-directory'].includes(path)) { send(response, 404, { message: '接口不存在。' }); return }
      if (request.method !== 'POST') { send(response, 405, { message: '请求方法不支持。' }); return }
      const supplied = request.headers['x-beellix-bootstrap-token']
      if (typeof supplied !== 'string' || Buffer.byteLength(supplied) !== Buffer.byteLength(token) || !timingSafeEqual(Buffer.from(supplied), Buffer.from(token))) { send(response, 403, { message: '操作校验已失效，请刷新页面后重试。' }); return }
      if (!String(request.headers['content-type'] ?? '').startsWith('application/json')) { send(response, 415, { message: '请求格式不支持。' }); return }
      const raw = await readBody(request)
      let input
      try { input = JSON.parse(raw) } catch { throw failure('请求内容无效。', 400) }
      if(path.endsWith('/choose-directory')){
        if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).length!==1||typeof input.directory!=='string')throw failure('请选择已有的 Beelli X 目录，不接受额外参数。',400)
        if(typeof store.selectRoot!=='function')throw failure('目录接回服务未就绪',503)
        const result=await store.selectRoot(input.directory);send(response,200,{...await snapshot(),selection:result});return
      }
      if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).length !== 0) throw failure('初始化位置由宿主确定，不接受额外路径或命令参数。', 400)
      if(path.endsWith('/reconnect')){if(typeof store.reconnectApplications!=='function')throw failure('应用接入服务未就绪',503);const result=await store.reconnectApplications();send(response,200,{...await snapshot(),reconnection:result});return}
      await store.initialize()
      send(response, 200, await snapshot())
    })().catch(error => {
      onError?.(error)
      if (response.headersSent || response.destroyed) return
      const status = error instanceof LayoutError ? 409 : error.status ?? 500
      send(response, status, { message: status < 500 || error instanceof LayoutError ? error.message : request.url?.includes('/choose-directory')?'目录选择未完成，请重试。':'目录操作未完成，请重试。', code: error.code ?? 'BOOTSTRAP_ERROR' })
    })
  }
}
