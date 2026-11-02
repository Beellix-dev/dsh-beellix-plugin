import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile,readdir,access} from 'node:fs/promises'
import {resolve,join} from 'node:path'
import {platformBoundary} from '../dev/shared/platform-boundary.mjs'
const root=resolve(import.meta.dirname,'..')
async function walk(path){const files=[];for(const row of await readdir(path,{withFileTypes:true})){const file=join(path,row.name);if(row.isDirectory())files.push(...await walk(file));else files.push(file)}return files}
test('installable community output contains no enterprise code, text, styles or paths',async()=>{
 for(const file of ['host.mjs','client.js','layout.mjs','knowledge-sessions.mjs','development/standard.json'])await access(join(root,'lib',file))
 for(const file of await walk(join(root,'lib')))assert.doesNotMatch(await readFile(file,'utf8'),/enterprise|企业/i,file)
 assert.deepEqual(await readdir(join(root,'packages/platform')),['community'])
})
test('community build rejects inputs from a different platform',()=>{
 const guard=platformBoundary(join(root,'packages/platform/community'))
 assert.doesNotThrow(()=>guard.generateBundle.call({getModuleIds:()=>[join(root,'packages/platform/community/src/host.mjs')]}))
 assert.throws(()=>guard.generateBundle.call({getModuleIds:()=>[join(root,'packages/platform/enterprise/src/host.mjs')]}),/another platform/)
})
