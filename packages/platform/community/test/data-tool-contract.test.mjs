import test from 'node:test'
import assert from 'node:assert/strict'
import {NativeDataTool} from '../../../../dev/shared/runtime/native-data-tool.mjs'

test('数据工具容忍未使用可选字段的null，错误返回明确用法，不透传未知字段',async()=>{
 let definition;const calls=[],api={catalog:async()=>({resources:[]}),describe:async id=>{calls.push(id);return{id}},resolve:async()=>({})},access={publicService:()=>({forAgent:()=>api}),callAgent:async(_agent,args)=>{calls.push(args);return{ok:true}}}
 const agent={id:'contract-test',ctx:{get:()=>({register:value=>{definition=value;return()=>{}}})}},tool=new NativeDataTool(access);tool.mount(agent)
 const run=args=>definition.execute(args,{agent,signal:new AbortController().signal})
 assert.deepEqual(await run({action:'describe',resource:'knowledge.content',accountId:null,input:null,reference:null}),{id:'knowledge.content'})
 await assert.rejects(run({action:'describe',resource:'knowledge.content',accountId:'unexpected'}),/describe.*resource/)
 await assert.rejects(run({action:'catalog',principal:'owner'}),/DATA_REQUEST.*catalog/)
 assert.equal(calls.length,1);tool.dispose()
})
