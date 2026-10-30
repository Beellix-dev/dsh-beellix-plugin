import {randomBytes,timingSafeEqual} from 'node:crypto'
export function knowledgeSessionsApi({store,authorize}){
 const token=randomBytes(32).toString('hex')
 return async(req,res)=>{
  const send=(status,value)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});res.end(JSON.stringify(value))}
  try{
   if(typeof authorize!=='function')return send(503,{message:'知识设置授权尚未就绪'})
   const denied=authorize(req);if(denied!==undefined)return send(typeof denied==='number'?denied:403,{message:'知识设置访问未授权'})
   const url=new URL(req.url,'http://localhost'),path=url.pathname.replace(/^\/beellix\/knowledge-sessions\/?/,'')
   if(req.method==='GET'&&path==='state')return send(200,{...await store.read(url.searchParams.get('sessionId')),csrfToken:token})
   if(req.method==='POST'&&path==='selection'){
    const received=req.headers['x-beellix-knowledge-token'];if(typeof received!=='string'||Buffer.byteLength(received)!==Buffer.byteLength(token)||!timingSafeEqual(Buffer.from(received),Buffer.from(token)))return send(403,{message:'知识设置令牌无效，请刷新重试'})
    let bytes=0,chunks=[];for await(const chunk of req){bytes+=chunk.length;if(bytes>16384)return send(413,{message:'知识设置过大'});chunks.push(chunk)}
    let input;try{input=JSON.parse(Buffer.concat(chunks).toString('utf8'))}catch{return send(400,{message:'知识设置格式无效'})}
    return send(200,{...await store.select(input),csrfToken:token})
   }
   return send(404,{message:'知识设置接口不存在'})
  }catch(error){const code=String(error.message??'');const status=code.includes('REVISION')?409:code.includes('SESSION')?404:code.includes('FORBIDDEN')?403:code.includes('UNAVAILABLE')?503:code.startsWith('KNOWLEDGE_')?400:500;send(status,{code:code.startsWith('KNOWLEDGE_')?code:'KNOWLEDGE_STATE_UNAVAILABLE',message:status===409?'知识设置已变化，请重试':status===503?'知识服务尚未就绪':status===500?'知识设置暂不可用':status===403?'所选知识空间不可用':'知识设置无效或会话不存在'})}
 }
}
