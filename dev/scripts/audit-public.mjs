/** Checks tracked/public files, never reads a DSH Profile or dependency tree. */
import {readFile,lstat} from 'node:fs/promises'
import {execFileSync} from 'node:child_process'
import {resolve,join,relative} from 'node:path'
const root=resolve(import.meta.dirname,'../..')
const repository=execFileSync('git',['rev-parse','--show-toplevel'],{cwd:root,encoding:'utf8'}).trim()
if(resolve(repository)!==root)throw Error('请在独立社区 Git 仓库中运行文件检查')
const entries=[...new Set(execFileSync('git',['ls-files','--cached','--others','--exclude-standard','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean))]
const prohibited=/(^|\/)(?:node_modules|\.yarn|\.env(?:\.[^/]*)?|\.npmrc|profiles?|backups?|recovery|artifacts)(\/|$)|\.(?:sqlite(?:3)?|db|pem|key|pfx|tgz|log)$/i
const sensitive=/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\b(?:ghp_[a-zA-Z0-9]{30,}|github_pat_[a-zA-Z0-9_]{40,}|sk-(?:proj-)?[a-zA-Z0-9_-]{32,})\b/i
const problems=[],categories={};let count=0
for(const file of entries){
 const absolute=join(root,file);let stat;try{stat=await lstat(absolute)}catch(error){if(error.code==='ENOENT')continue;throw error}
 if(stat.isSymbolicLink()||!stat.isFile()||prohibited.test(file)||/^packages\/(?:foundation|scenes)\/|^packages\/platform\/enterprise\//.test(file))problems.push(file+': unexpected public file')
 const text=await readFile(absolute,'utf8');if(sensitive.test(text))problems.push(file+': sensitive pattern; inspect without publishing its value')
 if(/(^|\/)LICENSE$/i.test(file)&&/private and proprietary/i.test(text))problems.push(file+': license conflicts with community MIT release')
 if(file.endsWith('.json'))try{JSON.parse(text)}catch{problems.push(file+': invalid JSON')}
 const category=file.startsWith('lib/')?'prebuilt':file.endsWith('.md')?'documentation':/LICENSE|NOTICE/.test(file)?'license':file.startsWith('standards/')?'contract':/\/test\/|^test\//.test(file)?'test':file.startsWith('packages/')||file.startsWith('dev/shared/')?'source':file.endsWith('.svg')?'branding':'build-and-config'
 categories[category]=(categories[category]??0)+1;count++
}
if(problems.length)throw Error(problems.join('\n'))
let historyBlobs=0
if(process.argv.includes('--history')){
 const objects=execFileSync('git',['rev-list','--objects','--all'],{cwd:root,encoding:'utf8'}).split('\n').filter(Boolean).map(row=>row.split(' ')[0])
 const descriptions=execFileSync('git',['cat-file','--batch-check=%(objectname) %(objecttype)'],{cwd:root,input:objects.join('\n')+'\n',encoding:'utf8'}).split('\n')
 const blobs=descriptions.filter(row=>row.endsWith(' blob')).map(row=>row.split(' ')[0])
 const bytes=execFileSync('git',['cat-file','--batch'],{cwd:root,input:blobs.join('\n')+'\n',maxBuffer:64*1024*1024})
 let offset=0;while(offset<bytes.length){const end=bytes.indexOf(10,offset),header=bytes.subarray(offset,end).toString().split(' '),size=Number(header[2]);if(!Number.isSafeInteger(size))throw Error('Invalid Git blob response');const content=bytes.subarray(end+1,end+1+size).toString('utf8');if(sensitive.test(content))throw Error('Published history contains a sensitive pattern in blob '+header[0]);historyBlobs++;offset=end+size+2}
}
console.log(JSON.stringify({publicFiles:count,categories,sensitiveFindings:0,unexpectedFiles:0,...historyBlobs?{historyBlobsScanned:historyBlobs}:{},scope:relative(root,root)||'repository'}))
