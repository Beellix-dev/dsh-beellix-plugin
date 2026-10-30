import test from 'node:test'
import assert from 'node:assert/strict'
import {installModeSeat} from '../src/mode-control.mjs'

test('工作区复用DSH原组件和预选控制器，只过滤内部场景预设；场景视图才固定场景标识',async()=>{
 const listeners=new Set(),slotListeners=new Set(),entries=[],calls=[];let view={mode:'workspace',ready:true,links:{}},snapshot={options:[{id:'standard'},{id:'ptc'},{id:'minimal'},{id:'cordis'},{id:'beellix-scene'}],current:'standard'}
 const nativeStore={getSnapshot:()=>snapshot,subscribe:()=>()=>{}}
 const native={options:{id:'native',name:'conversation.hero.agentPreset'},component:()=>null,locale:'settings.agentPreset',inject:(sessionId)=>({hooks:{agentPresetSeat:nativeStore},select:id=>calls.push({id,sessionId}),load:async()=>{}})}
 const slots={entries:()=>[native,...entries],subscribe:(_key,fn)=>{slotListeners.add(fn);return()=>slotListeners.delete(fn)},register:(options,component)=>{const row={options,component};entries.push(row);for(const fn of slotListeners)fn();return()=>{entries.splice(entries.indexOf(row),1);for(const fn of slotListeners)fn()}}}
 const source={getSnapshot:()=>view,subscribe:fn=>{listeners.add(fn);return()=>listeners.delete(fn)}}
 const dispose=installModeSeat({slots},source,()=>null)
 assert.equal(entries[0].component,native.component)
 const face=entries[0].options.inject(undefined)
 assert.deepEqual(face.hooks.agentPresetSeat.getSnapshot().options.map(x=>x.id),['standard','ptc','minimal','cordis'])
 assert.equal(face.hooks.agentPresetSeat.getSnapshot(),face.hooks.agentPresetSeat.getSnapshot())
 face.select('ptc');assert.deepEqual(calls,[{id:'ptc',sessionId:undefined}],'无会话时也沿DSH预选，不创建中台工作区')
 view={...view,mode:'scenes'};for(const fn of listeners)fn()
 assert.notEqual(entries[0].component,native.component)
 view={...view,mode:'workspace'};for(const fn of listeners)fn()
 assert.equal(entries[0].component,native.component)
 dispose();assert.equal(entries.length,0);assert.equal(slots.entries()[0],native)
})

test('宿主预设接口变化时保留原生对象并报告兼容缺口，不抛错或制造空菜单',()=>{
 const entries=[],issues=[],snapshot={items:['standard']},native={getSnapshot:()=>snapshot,subscribe:()=>()=>{}},source={options:{id:'native'},component:()=>null,inject:()=>({hooks:{agentPresetSeat:native}})}
 const ctx={slots:{entries:()=>[source],subscribe:()=>()=>{},register:(options,component)=>{entries.push({options,component});return()=>{}}}}
 const dispose=installModeSeat(ctx,{getSnapshot:()=>({mode:'workspace'}),subscribe:()=>()=>{}},()=>null,{report:issue=>issues.push(issue)})
 const face=entries[0].options.inject();assert.equal(face.hooks.agentPresetSeat.getSnapshot(),snapshot);assert.equal(issues[0].code,'NATIVE_PRESET_SHAPE_CHANGED');dispose()
})

test('顶部模式只包裹原生标签，保持排序、注入和智能体团队，停用恢复原登记',()=>{
 const header={options:{id:'agent-preset',order:-10},locale:'settings.agentPreset',inject:()=>({native:true}),component:()=>null},team={options:{id:'agent-team',order:-20},component:()=>null},original=header.component,teamComponent=team.component,added=[]
 const ctx={slots:{entries:name=>name==='conversation.session.header.actions'?[team,header,...added]:[],subscribe:()=>()=>{},register:(options,component)=>{const entry={options,component};added.push(entry);return()=>added.splice(added.indexOf(entry),1)}}}
 const source={subscribe:()=>()=>{},getSnapshot:()=>({ready:true,mode:'workspace',links:{quote:'smart-quotation'}})}
 const dispose=installModeSeat(ctx,source,()=>null)
 assert.notEqual(header.component,original,'对话开始后的顶部也必须适配场景标签')
 assert.equal(header.options.order,-10);assert.equal(header.locale,'settings.agentPreset');assert.equal(header.inject().native,true)
 assert.equal(team.component,teamComponent);assert.equal(team.options.order,-20)
 dispose();assert.equal(header.component,original);assert.equal(added.length,0)
})
