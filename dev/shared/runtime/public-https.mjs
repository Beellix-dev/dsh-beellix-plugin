/** Configured public update sources: HTTPS, bounded bodies, no redirects or private-network access. */
import {request as httpsRequest} from 'node:https'
import {lookup} from 'node:dns'
import {isIP} from 'node:net'

export function isPublicAddress(address){
 const family=isIP(address)
 if(family===4){
  const [a,b,c]=address.split('.').map(Number)
  return !(a===0||a===10||a===127||a>=224||a===100&&b>=64&&b<=127||a===169&&b===254||a===172&&b>=16&&b<=31||a===192&&(b===168||b===0||b===88&&c===99)||a===198&&(b===18||b===19||b===51&&c===100)||a===203&&b===0&&c===113)
 }
 if(family!==6||address.includes('.'))return false
 const [left,right]=address.toLowerCase().split('::'),parts=left?left.split(':'):[],tail=right?right.split(':'):[]
 const groups=right===undefined?parts:[...parts,...Array(8-parts.length-tail.length).fill('0'),...tail],values=groups.map(v=>parseInt(v,16))
 return values[0]>=0x2000&&values[0]<=0x3fff&&values[0]!==0x2002&&!(values[0]===0x2001&&(values[1]<0x200||values[1]===0xdb8))&&!(values[0]===0x3fff&&values[1]<0x1000)
}
export function publicHttpsUrl(value){
 let url;try{url=new URL(value)}catch{throw Error('UPDATE_SOURCE_INVALID')}
 const host=url.hostname.replace(/^\[|\]$/gu,'')
 if(url.protocol!=='https:'||url.port||url.username||url.password||url.search||url.hash||url.href.length>2000||host.endsWith('.')||isIP(host)&&!isPublicAddress(host))throw Error('UPDATE_SOURCE_INVALID')
 if(!isIP(host)&&(!host.includes('.')||/(?:^|\.)(?:localhost|local|internal|test|invalid)$/iu.test(host)))throw Error('UPDATE_SOURCE_INVALID')
 return url
}
// Validate inside the lookup used by the actual TLS connection; a separate preflight lookup is insufficient.
export function publicLookup(host,options,callback){
 lookup(host,{all:true,verbatim:true},(error,addresses)=>{
  if(error)return callback(error)
  if(!addresses.length||addresses.some(row=>!isPublicAddress(row.address)))return callback(Error('UPDATE_SOURCE_INVALID'))
  if(options?.all)return callback(null,addresses)
  callback(null,addresses[0].address,addresses[0].family)
 })
}
export async function publicHttpsBytes(value,{maxBytes,signal,accept='application/json'}={}){
 const url=publicHttpsUrl(value)
 if(!Number.isSafeInteger(maxBytes)||maxBytes<1||maxBytes>64*1024*1024)throw Error('UPDATE_SOURCE_INVALID')
 return new Promise((resolve,reject)=>{
  const req=httpsRequest(url,{method:'GET',agent:false,lookup:publicLookup,signal:signal?AbortSignal.any([signal,AbortSignal.timeout(45000)]):AbortSignal.timeout(45000),headers:{accept,'accept-encoding':'identity'}},response=>{
   if(response.statusCode!==200||response.headers['content-encoding']&&response.headers['content-encoding']!=='identity'){response.resume();req.destroy(Error('UPDATE_UNAVAILABLE'));return}
   if(Number(response.headers['content-length'])>maxBytes){req.destroy(Error('UPDATE_TOO_LARGE'));return}
   const chunks=[];let size=0
   response.on('data',chunk=>{size+=chunk.length;if(size>maxBytes)req.destroy(Error('UPDATE_TOO_LARGE'));else chunks.push(chunk)})
   response.on('error',reject);response.on('end',()=>resolve(Buffer.concat(chunks)))
  })
  req.on('error',reject);req.end()
 })
}
