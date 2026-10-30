import {cp,mkdir} from 'node:fs/promises'
import {resolve,basename} from 'node:path'
const root=resolve(import.meta.dirname,'../..');await mkdir(resolve(root,'dev/artifacts/test-results'),{recursive:true})
process.argv.push('--only=community');await import('./build.mjs')
await cp(resolve(root,'packages/platform/community/lib'),resolve(root,'lib'),{recursive:true,filter:file=>!['console-client.cjs','console.css'].includes(basename(file))})
