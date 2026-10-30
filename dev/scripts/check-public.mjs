import assert from 'node:assert/strict'
import {readFile,access,readdir} from 'node:fs/promises'
import {resolve,join} from 'node:path'
const root=resolve(import.meta.dirname,'../..'),pkg=JSON.parse(await readFile(join(root,'package.json'),'utf8'))
assert.equal(pkg.name,'@beellix-ai/dsh-beellix-plugin');assert.equal(pkg.version,'0.1.1');assert.equal(pkg.license,'MIT');assert.ok(pkg.engines.dsh);assert.equal(pkg.dsh.engines,undefined)
for(const file of ['LICENSE','README.md',pkg.main,pkg.exports['./client'],pkg.dsh.bundle.patch])await access(resolve(root,file))
for(const name of await readdir(join(root,'packages/platform')))assert.equal(name,'community')
console.log('Community source, native manifest and built entries verified')
