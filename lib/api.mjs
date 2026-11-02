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

export function createApiHandler({ store, version, authorize,onError,selfUpdate,authorizeUpdate }) {
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
      const updateAction=path.startsWith('/beellix/bootstrap/update/')?path.slice('/beellix/bootstrap/update/'.length):undefined
      if(updateAction){
        if(!selfUpdate||typeof authorizeUpdate!=='function'){send(response,503,{message:'此客户端暂不支持中台更新。'});return}
        const denied=authorizeUpdate(request);if(denied!==undefined){send(response,typeof denied==='number'?denied:403,{message:'仅本机用户可更新中台。'});return}
        if(updateAction==='state'&&request.method==='GET'){send(response,200,{...await selfUpdate.snapshot(),csrfToken:token});return}
      }
      if (!['/beellix/bootstrap/initialize','/beellix/bootstrap/reconnect','/beellix/bootstrap/choose-directory'].includes(path)&&!['check','install','restart'].includes(updateAction)) { send(response, 404, { message: '接口不存在。' }); return }
      if (request.method !== 'POST') { send(response, 405, { message: '请求方法不支持。' }); return }
      const supplied = request.headers['x-beellix-bootstrap-token']
      if (typeof supplied !== 'string' || Buffer.byteLength(supplied) !== Buffer.byteLength(token) || !timingSafeEqual(Buffer.from(supplied), Buffer.from(token))) { send(response, 403, { message: '操作校验已失效，请刷新页面后重试。' }); return }
      if (!String(request.headers['content-type'] ?? '').startsWith('application/json')) { send(response, 415, { message: '请求格式不支持。' }); return }
      const raw = await readBody(request)
      let input
      try { input = JSON.parse(raw) } catch { throw failure('请求内容无效。', 400) }
      if(updateAction){send(response,200,await selfUpdate[updateAction](input));return}
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
      const updateMessages={SELF_UPDATE_REQUEST:'更新请求无效，请重新检查。',SELF_UPDATE_BUSY:'正在更新，请稍候。',SELF_UPDATE_CHANGED:'安装或发布内容已变化，请重新检查。',SELF_UPDATE_SOURCE:'当前安装来源不支持此更新，请保留原来源处理。',SELF_UPDATE_DISABLED:'中台已在 DSH 中停用，请先重新启用后更新。',SELF_UPDATE_UNSUPPORTED:'此客户端暂不支持中台原位更新。',SELF_UPDATE_RELEASE:'发布内容未通过检查，原安装未修改。',SELF_UPDATE_NETWORK:'暂时无法连接 GitHub，请检查网络后重试。',SELF_UPDATE_INSTALL:'更新未完成，请重新检查后重试。',SELF_UPDATE_VERIFY:'更新后的文件未通过校验，请检查安装状态。',SELF_UPDATE_UNAVAILABLE:'更新服务已关闭，请刷新重试。'}
      if(Object.hasOwn(updateMessages,error.message)){send(response,/BUSY|CHANGED/.test(error.message)?409:400,{message:updateMessages[error.message],code:error.message});return}
      const status = error instanceof LayoutError ? 409 : error.status ?? 500
      send(response, status, { message: status < 500 || error instanceof LayoutError ? error.message : request.url?.includes('/choose-directory')?'目录选择未完成，请重试。':'目录操作未完成，请重试。', code: error.code ?? 'BOOTSTRAP_ERROR' })
    })
  }
}
