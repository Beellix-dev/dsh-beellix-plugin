/** 用量接口复用宿主连接授权与同源操作令牌；不允许提交用量或任意文件路径。 */
import { randomBytes, timingSafeEqual } from 'node:crypto'

function send(response, status, value) {
  const body = Buffer.from(JSON.stringify(value))
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'content-length': body.length, 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' }); response.end(body)
}
async function body(request) {
  let size = 0; const chunks = []
  for await (const chunk of request) { size += chunk.length; if (size > 4096) throw Object.assign(Error('请求过大。'), { status: 413 }); chunks.push(chunk) }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')) } catch { throw Object.assign(Error('请求格式无效。'), { status: 400 }) }
}
export function usageApi({ store, native, authorize, ready, catalog = async () => ({ groups: [] }), onError }) {
  const token = randomBytes(32).toString('base64url')
  return (request, response) => { void (async () => {
    if (typeof authorize !== 'function') return send(response, 503, { message: 'DSH 授权服务尚未就绪。' })
    const refusal = authorize(request); if (refusal !== undefined) return send(response, typeof refusal === 'number' ? refusal : 403, { message: '当前连接无权访问用量。' })
    if (!ready()) return send(response, 409, { message: '请先连接中台数据目录。' })
    const url = new URL(request.url, 'http://beellix.local'), path = url.pathname
    if (path === '/beellix/usage/state' && request.method === 'GET') {
      const allowed = ['from', 'to', 'provider', 'model', 'offset', 'limit']
      if ([...url.searchParams.keys()].some(key => !allowed.includes(key) || url.searchParams.getAll(key).length !== 1)) throw Object.assign(Error('筛选字段无效。'), { status: 400 })
      const query = Object.fromEntries(url.searchParams)
      for (const key of ['from', 'to', 'offset', 'limit']) if (query[key] !== undefined) { if (!/^\d+$/u.test(query[key])) throw Object.assign(Error('筛选格式无效。'), { status: 400 }); query[key] = Number(query[key]) }
      const models = await catalog().catch(() => ({ groups: [], unavailable: true }))
      return send(response, 200, { ...await store.snapshot(query), catalog: models.groups, catalogUnavailable: models.unavailable === true, sync: native.lastSync, csrfToken: token })
    }
    if (!['/beellix/usage/prices', '/beellix/usage/sync'].includes(path)) return send(response, 404, { message: '接口不存在。' })
    if (request.method !== 'POST') return send(response, 405, { message: '请求方法不支持。' })
    const supplied = request.headers['x-beellix-usage-token']
    if (typeof supplied !== 'string' || Buffer.byteLength(supplied) !== Buffer.byteLength(token) || !timingSafeEqual(Buffer.from(supplied), Buffer.from(token))) return send(response, 403, { message: '操作校验已失效，请刷新后重试。' })
    if (!String(request.headers['content-type'] ?? '').startsWith('application/json')) return send(response, 415, { message: '请求格式不支持。' })
    const input = await body(request)
    if (path.endsWith('/sync')) {
      if (!input || Array.isArray(input) || typeof input !== 'object' || Object.keys(input).length) throw Object.assign(Error('同步不接受外部用量或路径。'), { status: 400 })
      return send(response, 200, await native.sync())
    }
    try { return send(response, 200, await store.savePrice(input)) } catch (error) { if (error.status) throw error; throw Object.assign(Error(error.message), { status: /价格|字段|输入|模型/.test(error.message) ? 400 : 500 }) }
  })().catch(error => { onError?.(error); if (!response.headersSent && !response.destroyed) send(response, error.status ?? 500, { message: error.status < 500 ? error.message : '用量操作未完成，请重试。' }) }) }
}
