/** 直接编译原管理页及共享组件；React 仍由原生 DSH 提供。 */
import { build } from 'tsdown'
import { transform } from 'lightningcss'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { createRequire } from 'node:module'
import {platformBoundary} from '../../../../dev/shared/platform-boundary.mjs'
export async function buildConsole(root, lib, audit) {
  const repository = resolve(root, '../../../dev/shared/console')
  const imports = JSON.parse(readFileSync(join(repository, 'imports.json'), 'utf8'))
  const shared = ['react', 'react-dom', 'react/jsx-runtime', '@deepseek-ai/dsh-client-ui-primitives']
  const sheets = new Map()
  await build({ config: false, entry: { 'console-client': join(root, 'src/console-page.tsx') }, outDir: lib, format: 'cjs', platform: 'browser', target: 'es2022', dts: false, clean: false,
    deps: { neverBundle: shared, alwaysBundle: source => !shared.includes(source) },
    define: { 'process.env.NODE_ENV': '"production"', 'import.meta.env': '{"MODE":"production"}' },
    plugins: [platformBoundary(root),{name:'console-input-evidence',async resolveId(source,importer){if(source==='./admin.module.css'&&importer?.replaceAll('\\','/').endsWith('/pages/client/SkillDirectory.tsx'))return '\0console-css:'+join(root,'src/skill-directory.module.css')+'.mjs';if(imports[source])return join(repository,imports[source]);if(!audit||!source.startsWith('@beellix-ai/')||source==='@beellix-ai/ui-components')return;const resolved=await this.resolve(source,importer,{skipSelf:true});if(resolved)audit.aliases[source]=resolved.id;return resolved},generateBundle(){audit?.save([...this.getModuleIds()])}}, { name: 'console-native-primitives', resolveId(source, importer) { if (source === '@beellix-ai/ui-components') return '\0beellix-native-primitives'; if (source === './useModalLayer.ts' && importer?.replaceAll('\\','/').endsWith('/primitives/Modal.tsx')) return '\0beellix-modal-layer' }, load(id) {
      if (id === '\0beellix-modal-layer') return `export {useModalLayer} from '@deepseek-ai/dsh-client-ui-primitives'`
      if (id !== '\0beellix-native-primitives') return null
      const primitive = name => JSON.stringify(join(repository,'packages/ui/components/src/primitives',name+'.tsx').replaceAll('\\','/'))
      return ['Button','Input','Modal','Switch'].map(name=>`export {${name}} from ${primitive(name)};`).join('\n') + `export {${['Plus','Refresh','ChevronLeft','ChevronRight','FolderOpen','Database','Settings','ChevronDown','Data','Trash'].map(name=>`Icon${name}Outline${name.startsWith('Chevron')?'14':'16'}`).join(',')}} from ${primitive('icons/index')}; export {ScenarioIcon,scenarioIconKind} from ${primitive('ScenarioIcon')};`
    } }, { name: 'console-original-css', resolveId(source, importer) { if (!source.endsWith('.css')) return null; const path = source.startsWith('.') ? resolve(dirname(importer), source) : createRequire(importer).resolve(source); return '\0console-css:' + path + '.mjs' }, load(id) { if (!id.startsWith('\0console-css:')) return null; const path = id.slice(13, -4), result = transform({ filename: path, code: readFileSync(path), cssModules: path.endsWith('.module.css') ? { pattern: 'bxc_[hash]_[local]' } : false, minify: true }); sheets.set(path, result.code.toString()); const map = Object.fromEntries(Object.entries(result.exports ?? {}).map(([key, value]) => [key, value.name])); return `export default ${JSON.stringify(map)};` } }],
    outputOptions: { entryFileNames: 'console-client.cjs', inlineDynamicImports: true },
    })
  const client = join(lib, 'console-client.cjs')
  // Virtual CSS module banners contain the builder's absolute path; never publish it.
  writeFileSync(client, readFileSync(client, 'utf8').replace(/^\/\/#region[^\r\n]*console-css:[^\r\n]*$/gm, '//#region stylesheet'))
  writeFileSync(join(lib, 'console.css'), [...sheets.values()].join('\n'))
}
