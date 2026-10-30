import test from 'node:test'
import assert from 'node:assert/strict'
import {installSceneSessionActions}from'../src/scene-actions.mjs'
test('场景归档复用DSH原组件、状态、确认及恢复回调，不改原登记',()=>{
 const calls=[],native={options:{id:'archive'},component:()=>null,locale:'workspace',inject:()=>({archiveSession:id=>calls.push(['archive',id]),unarchiveSession:id=>calls.push(['restore',id]),hooks:{archived:{}}})},rows=[]
 const ctx={slots:{inject:(_name,fn)=>fn(),entries:()=>[native],subscribe:()=>()=>{},register:(options,component)=>{const row={options,component};rows.push(row);return()=>rows.splice(rows.indexOf(row),1)}}}
 const dispose=installSceneSessionActions(ctx);assert.equal(rows.length,1);assert.equal(rows[0].component,native.component);assert.equal(rows[0].options.inject,native.inject);assert.equal(rows[0].options.name,'beellix.scene.session.action')
 const face=rows[0].options.inject();face.archiveSession('scene-session');face.unarchiveSession('scene-session');assert.deepEqual(calls,[['archive','scene-session'],['restore','scene-session']]);dispose();assert.equal(rows.length,0);assert.equal(ctx.slots.entries()[0],native)
})

test('场景归档提示直接打开中台归档页；工作区释放扩展且原通知仍在',()=>{
 const listeners=new Set(),rows=[],calls=[];let view={mode:'scenes'}
 const source={getSnapshot:()=>view,subscribe:fn=>{listeners.add(fn);return()=>listeners.delete(fn)}}
 const original={options:{key:'archived'},component:()=>null,locale:'workspace',store:{native:true},inject:()=>({display:()=> 'native',filterAction:()=>({label:'筛选已归档',onClick:()=>calls.push('native-filter')})})}
 const ctx={slots:{inject:(_name,fn)=>fn(),entries:name=>name==='workspace.toast'?[original,...rows.filter(x=>x.options.name===name).map(x=>({...x,inject:x.options.inject}))]:[],subscribe:()=>()=>{},register:(options,component)=>{const row={options,component};rows.push(row);return()=>rows.splice(rows.indexOf(row),1)}}}
 const dispose=installSceneSessionActions(ctx,{viewSource:source,showArchived:()=>calls.push('scene-filter')})
 const row=rows.find(x=>x.options.key==='archived');assert.ok(row);assert.equal(row.component,original.component);assert.equal(row.options.store,original.store)
 row.options.inject().filterAction().onClick();assert.deepEqual(calls,['scene-filter'])
 view={mode:'workspace'};for(const fn of listeners)fn();assert.equal(rows.length,0);assert.equal(ctx.slots.entries('workspace.toast')[0],original);dispose()
})

test('场景重命名调用原生重命名请求，由原生对话框和存储处理',()=>{
 const calls=[],rows=[],rename={options:{id:'rename'},component:()=>null,inject:()=>({requestSessionRename:(id,title)=>calls.push({id,title})})}
 const ctx={slots:{inject:(_name,fn)=>fn(),entries:name=>name==='sidebar.workspaces.session.menu.item'?[rename]:[],subscribe:()=>()=>{},register:(options,component)=>{rows.push({options,component});return()=>{}}}}
 const dispose=installSceneSessionActions(ctx,{menuComponent:()=>null});const action=rows.find(row=>row.options.id==='rename');assert.ok(action)
 action.options.inject().requestSessionRename('old-scene','保留原标题');assert.deepEqual(calls,[{id:'old-scene',title:'保留原标题'}]);dispose()
})
