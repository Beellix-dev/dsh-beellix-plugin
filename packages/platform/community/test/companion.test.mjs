import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,mkdir,writeFile,readFile} from 'node:fs/promises'
import {resolve,join} from 'node:path'
import {CompanionApplications} from "../../../../dev/shared/runtime/native-companion.mjs"

test('恢复后的应用登记走 DSH 安装器，不复制业务资料，拒绝环境外路径和伪造包名',async()=>{
  const root=await mkdtemp(resolve(import.meta.dirname,"../../../../dev/artifacts/test-results/companion-")),pkg=join(root,'environment/node_modules/@beellix-ai/quote')
  await mkdir(pkg,{recursive:true});await writeFile(join(pkg,'package.json'),JSON.stringify({name:'@beellix-ai/quote',version:'1.0.0',dsh:{bundle:{patch:'./cordis.patch.yml'}}}))
  const registry=join(root,'registry.json'),record={schemaVersion:1,plugins:[{name:'@beellix-ai/quote',directory:'environment/node_modules/@beellix-ai/quote'}]},before=JSON.stringify(record)
  await writeFile(registry,before)
  const calls=[],store=new CompanionApplications(root,{installBundle:async(...args)=>{calls.push(args);return{application:'applied',changed:true}}},root)
  const result=await store.reconnect({});assert.equal(result.items[0].application,'applied');assert.deepEqual(calls,[[pkg,{enabled:true}]])
  assert.equal(await readFile(registry,'utf8'),before)
  await assert.rejects(store.reconnect({directory:'C:/'}),/INPUT_INVALID/)
  record.plugins[0].directory='../outside';await writeFile(registry,JSON.stringify(record));await assert.rejects(store.reconnect({}),/超出/)
  record.plugins[0].directory='environment/node_modules/@beellix-ai/quote';record.plugins[0].name='wrong';await writeFile(registry,JSON.stringify(record));await assert.rejects(store.reconnect({}),/不匹配/)
  assert.equal(calls.length,1)
})
