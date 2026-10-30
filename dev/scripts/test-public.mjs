import {readFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import {execFileSync} from 'node:child_process'
const root=resolve(import.meta.dirname,'../..'),files=JSON.parse(await readFile(resolve(root,'dev/config/public-tests.json'),'utf8'))
execFileSync(process.execPath,['--test','--test-concurrency=1','--test-timeout=60000',...files.map(file=>resolve(root,'packages/platform/community/test',file)),resolve(root,'test/native.test.mjs')],{cwd:root,stdio:'inherit',windowsHide:true})
