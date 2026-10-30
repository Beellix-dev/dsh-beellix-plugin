import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile,mkdir,mkdtemp,writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {evaluatePluginCompatibility,bundlePatchPaths} from '@deepseek-ai/dsh-app-boot'
import {Context} from '@deepseek-ai/cordis'
import Prompt from '@deepseek-ai/dsh-system-prompt'
import Tools from '@deepseek-ai/dsh-tools'
import Skills from '@deepseek-ai/dsh-skill'
import {createScope} from '@deepseek-ai/dsh-scope'
import {CreationRuntime} from '../lib/creation-runtime.mjs'
const root=new URL('..',import.meta.url),pkg=JSON.parse(await readFile(new URL('package.json',root),'utf8'))
test('official DSH accepts the bundle and enforces its version range',()=>{assert.equal(evaluatePluginCompatibility(pkg,{},'0.2.1-rc.2'),undefined);assert.equal(evaluatePluginCompatibility(pkg,{},'999.0.0').requirements['engines.dsh'],pkg.engines.dsh);assert.equal(bundlePatchPaths(process.cwd(),pkg.dsh.bundle).length,1)})
test('official scoped tools and skills load, execute and dispose without user data',async()=>{const ctx=new Context();await ctx.plugin(Prompt);await ctx.plugin(Tools);await ctx.plugin(Skills);ctx.provide('agentPresets',{composedPreset:()=> 'cordis'});const data=await mkdtemp(join(tmpdir(),'beellix-public-')),runtime=new CreationRuntime(data),agent={id:'public-native',session:{header:{createdAt:Date.now()+1000}}},scope=createScope(ctx,agent);agent.ctx=scope.ctx;try{assert.equal(await runtime.sync(agent),true);const result=await agent.ctx.get('tools').execute({agent,signal:new AbortController().signal,callId:'public-native',name:'beellix_develop',arguments:{action:'index'}});assert.equal(result.isError,false);assert.equal(JSON.parse(result.content[0].text).standardVersion,'1.1.0')}finally{await runtime.dispose();await scope.dispose();await ctx.fiber.dispose()}})
