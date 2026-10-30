import test from 'node:test'
import assert from 'node:assert/strict'
import {createSceneChanges} from '../src/scene-changes.mjs'
test('场景变化统一订阅原生插件变化、重新联网和主动刷新，合并同轮通知并释放监听',async()=>{
 const handlers=new Map(),events=new EventTarget(),calls=[]
 const remote={$on:(name,fn)=>{handlers.set(name,fn);return()=>handlers.delete(name)}}
 const changes=createSceneChanges({remote,events}),off=changes.subscribe(()=>calls.push('refresh'))
 handlers.get('plugin-manager/changed')();changes.invalidate();events.dispatchEvent(new Event('online'));await Promise.resolve()
 assert.deepEqual(calls,['refresh']);off();changes.invalidate();await Promise.resolve();assert.equal(calls.length,1)
 changes.dispose();assert.equal(handlers.size,0);events.dispatchEvent(new Event('online'));await Promise.resolve();assert.equal(calls.length,1)
})
