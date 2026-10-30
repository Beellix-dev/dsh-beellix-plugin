/** 只暴露导航状态、添加入口及创建原生会话，不接受执行命令或任意工作路径。 */
import {randomBytes,timingSafeEqual} from 'node:crypto'
export function sceneApi({store,authorize,authorizeDirectory}){
  const token=randomBytes(32).toString('base64url')
  const send=(res,status,value)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});res.end(JSON.stringify(value))}
  return(req,res)=>{void(async()=>{
    if(typeof authorize!=='function')return send(res,503,{message:'DSH 连接服务未就绪'})
    const refusal=authorize(req);if(refusal!==undefined)return send(res,typeof refusal==='number'?refusal:403,{message:'当前连接未授权'})
    const path=new URL(req.url,'http://beellix.local').pathname
    if(path==='/beellix/scenes/state'&&req.method==='GET')return send(res,200,{...await store.snapshot(),csrfToken:token})
    if(!['/beellix/scenes/add','/beellix/scenes/remove','/beellix/scenes/create-session','/beellix/scenes/create-workspace-session','/beellix/scenes/reconnect-session','/beellix/scenes/reconnect-plugins'].includes(path))return send(res,404,{message:'接口不存在'})
    if(req.method!=='POST')return send(res,405,{message:'请求方法不支持'})
    const supplied=req.headers['x-beellix-scenes-token'];if(typeof supplied!=='string'||Buffer.byteLength(supplied)!==Buffer.byteLength(token)||!timingSafeEqual(Buffer.from(supplied),Buffer.from(token)))return send(res,403,{message:'操作校验失效，请刷新场景列表'})
    if(!String(req.headers['content-type']).startsWith('application/json'))return send(res,415,{message:'请求格式无效'})
    let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>4096)return send(res,413,{message:'请求过大'});chunks.push(chunk)}
    const packet=JSON.parse(Buffer.concat(chunks).toString('utf8'))
    if(packet?.workspaceId!==undefined&&(typeof authorizeDirectory!=='function'||authorizeDirectory(req)!==undefined))return send(res,403,{message:'当前连接不能选择本机执行目录'})
    send(res,200,path.endsWith('/add')?await store.add(packet):path.endsWith('/remove')?await store.remove(packet):path.endsWith('/create-workspace-session')?await store.createWorkspaceSession(packet):path.endsWith('/reconnect-session')?await store.reconnectSession(packet):path.endsWith('/reconnect-plugins')?await store.reconnectPlugins(packet):await store.createSession(packet))
  })().catch(error=>{if(!res.headersSent&&!res.destroyed)send(res,400,{message:error.message})})}
}
