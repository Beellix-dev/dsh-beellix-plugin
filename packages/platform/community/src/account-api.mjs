/** Owner-only website-account seam. No renderer-supplied identity or tokens. */
import {randomBytes,timingSafeEqual} from 'node:crypto'
const messages={ACCOUNT_NOT_CONFIGURED:'官网账号服务尚未上线。',ACCOUNT_ATTEMPT:'验证已结束，请重新登录。',ACCOUNT_CANCELLED:'验证已取消。',ACCOUNT_PROVIDER_INVALID:'官网验证结果无效，请重试。',ACCOUNT_STORAGE:'登录状态未能保存，请重试。',ACCOUNT_STATE:'登录记录需要检查，请重新登录。',ACCOUNT_REQUEST:'操作无效，请刷新后重试。',ACCOUNT_UNAVAILABLE:'官网暂时无法连接，请稍后重试。'}
const send=(res,status,value)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'});res.end(JSON.stringify(value))}
async function body(req){let size=0;const chunks=[];for await(const b of req){size+=b.length;if(size>4096)throw Error('ACCOUNT_REQUEST');chunks.push(b)}let value;try{value=JSON.parse(Buffer.concat(chunks).toString())}catch{throw Error('ACCOUNT_REQUEST')}if(!value||typeof value!=='object'||Array.isArray(value))throw Error('ACCOUNT_REQUEST');return value}
export function accountApi({account,authorize}){
 const csrfToken=randomBytes(32).toString('base64url')
 return(req,res)=>{void(async()=>{try{
  if(typeof authorize!=='function')return send(res,503,{message:'账号服务尚未就绪。'})
  const denied=authorize(req);if(denied!==undefined)return send(res,typeof denied==='number'?denied:403,{message:'当前连接无权管理中台账号。'})
  const tail=new URL(req.url,'http://beellix.local').pathname.slice('/beellix/account'.length)
  if(tail==='/state'&&req.method==='GET')return send(res,200,{...await account.snapshot(),csrfToken})
  if(!['/login','/poll','/cancel','/logout','/refresh'].includes(tail))return send(res,404,{message:'接口不存在。'})
  if(req.method!=='POST')return send(res,405,{message:'请求方法不支持。'})
  const supplied=req.headers['x-beellix-account-token'];if(typeof supplied!=='string'||Buffer.byteLength(supplied)!==Buffer.byteLength(csrfToken)||!timingSafeEqual(Buffer.from(supplied),Buffer.from(csrfToken)))return send(res,403,{message:'操作校验失效，请刷新。'})
  if(!String(req.headers['content-type']).startsWith('application/json'))return send(res,415,{message:'请求格式不支持。'})
  const input=await body(req);if(tail!=='/poll'&&Object.keys(input).length)throw Error('ACCOUNT_REQUEST')
  const value=tail==='/login'?await account.begin():tail==='/poll'?await account.poll(input):tail==='/logout'?await account.logout():tail==='/cancel'?await account.cancel():await account.restore()
  send(res,200,value)
 }catch(e){const reason=Object.hasOwn(messages,e.message)?e.message:'ACCOUNT_UNAVAILABLE';send(res,reason==='ACCOUNT_NOT_CONFIGURED'?503:reason==='ACCOUNT_ATTEMPT'?409:reason==='ACCOUNT_UNAVAILABLE'||reason==='ACCOUNT_STORAGE'?503:400,{message:messages[reason],error:{reason}})}})()}
}
