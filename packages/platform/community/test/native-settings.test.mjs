import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import vm from 'node:vm'
import React from 'react'
import * as ReactDom from 'react-dom'
import * as ReactJSX from 'react/jsx-runtime'

test('原生装配只在DSH维护，中台不复制组件或声明重复配置槽，原登记不变',()=>{
 let plugin
 const original={options:{id:'shell',label:()=> '终端'},component:()=>null,inject:()=>({save:'native-save'}),locale:'settings.shell'},declared=new Set(['plugins.item']),entries=[],listeners=new Map(),effects=[]
 const storage=new Map(),localStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,String(value)),removeItem:key=>storage.delete(key)}
 const sandbox={URL,console,localStorage,window:Object.assign(new EventTarget(),{__ModuleLoader__:{load:entry=>plugin=entry}}),document:{defaultView:{MutationObserver:class{observe(){}disconnect(){}},cancelAnimationFrame(){}},body:{},querySelector:()=>null,createElement:()=>({dataset:{},remove(){}}),head:{append(){}}}}
 vm.runInNewContext(readFileSync(new URL('../lib/client.js',import.meta.url),'utf8'),sandbox)
 const slots={inject:(_name,fn)=>fn(),entries:name=>name==='plugins.item'?[original]:entries.filter(row=>row.options.name===name).map(row=>({options:row.options})),getVersion:()=>1,subscribe:(name,fn)=>{listeners.set(name,fn);return()=>listeners.delete(name)},register:(options,component)=>{for(const name of Object.keys(options.children??{})){if(declared.has(name))throw Error('slot "'+name+'" is already declared');declared.add(name)}const entry={options,component};entries.push(entry);return()=>{const at=entries.indexOf(entry);if(at>=0)entries.splice(at,1)}}}
 plugin.factory(name=>name==='react'?React:name==='react/jsx-runtime'?ReactJSX:ReactDom).apply({slots,locale:{register:()=>()=>{},bind:()=>key=>key},effect:fn=>effects.push(fn()),remote:{$on:()=>()=>{}}})
 assert.equal(entries.some(row=>row.options.name==='beellix.native.settings'),false)
 assert.equal(declared.has('beellix.native.settings'),false);assert.ok([...declared].every(name=>['plugins.item','beellix.scene.session.action','beellix.platform.capability'].includes(name)))
 for(const off of effects.reverse())off?.()
 assert.equal(slots.entries('plugins.item')[0],original)
})
