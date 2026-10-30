import test from 'node:test'
import assert from 'node:assert/strict'
import {installWorkspaceNavigation} from '../src/workspace-scope.mjs'

test('场景服务失败不阻断原生工作区新增；加载中仍等待归属，恢复后仍按场景路由',async()=>{
 const calls=[],issues=[];let view={ready:false,mode:'scenes',links:{},error:'目录不兼容'}
 const ctx={uiWorkspace:{startSession:(...args)=>calls.push(args)},sessions:{list:{getSnapshot:()=>({byId:{plain:{id:'plain'}}})}},workspaces:{list:{getSnapshot:()=>({items:[{workspaceId:'project',sessionIds:['plain']}]})}},uiSession:{adapter:{current:{getSnapshot:()=>({key:'plain'})}}}}
 const nav=installWorkspaceNavigation(ctx,{getSnapshot:()=>view},{compatibility:{report:issue=>issues.push(issue),clear:()=>{}}})
 await ctx.uiWorkspace.startSession('project');assert.deepEqual(calls,[['project',undefined]])
 view={...view,error:''};await ctx.uiWorkspace.startSession('project');assert.equal(calls.length,1);assert.equal(issues.at(-1).code,'WORKSPACE_SCOPE_PENDING')
 view={...view,ready:true,startSceneSession:()=>calls.push('scene')};await ctx.uiWorkspace.startSession();assert.equal(calls.at(-1),'scene')
 nav.dispose()
})

test('DSH 原生目录入口在场景中建对应场景会话，传递原生草稿回调；工作区保持原行为',async()=>{
 const calls=[],before=()=>{},native=function(...args){calls.push({native:args,receiver:this})}
 let view={ready:true,mode:'scenes',links:{quote:'quotation'},changeSceneDirectory:async input=>calls.push(input)}
 const ctx={uiWorkspace:{startSession:()=>{},openWorkspace:native},uiSession:{adapter:{current:{getSnapshot:()=>({key:'quote'})}}}}
 const navigation=installWorkspaceNavigation(ctx,{getSnapshot:()=>view})
 await ctx.uiWorkspace.openWorkspace('chosen',before)
 assert.deepEqual(calls,[{sessionId:'quote',sceneId:'quotation',workspaceId:'chosen',beforeOpen:before}])
 view={...view,mode:'workspace'};const options={agentPreset:'ptc'};await ctx.uiWorkspace.openWorkspace('ordinary',before,options)
 assert.deepEqual(calls[1],{native:['ordinary',before,options],receiver:ctx.uiWorkspace})
 navigation.dispose();assert.equal(ctx.uiWorkspace.openWorkspace,native)
})

test('工作区新对话显式定位普通工作区，避免 DSH 默认回到最近场景；仍调用原生创建入口',async()=>{
 const calls=[],native=function(...args){calls.push({args,receiver:this})}
 let view={mode:'workspace',ready:true,links:{quote:'quote'}},current={key:'quote'}
 const ctx={uiWorkspace:{startSession:native,pickDirectory:()=>{throw Error('已有普通工作区，不应要求重选')}},sessions:{list:{getSnapshot:()=>({ids:['quote','plain'],byId:{quote:{id:'quote',updatedAt:9},plain:{id:'plain',updatedAt:1}}})}},workspaces:{list:{getSnapshot:()=>({items:[{workspaceId:'scene-workspace',sessionIds:['quote']},{workspaceId:'ordinary',sessionIds:['plain']}],archivedSessionIds:[]})}},uiSession:{adapter:{current:{getSnapshot:()=>current}}}}
 const navigation=installWorkspaceNavigation(ctx,{getSnapshot:()=>view}),dispose=navigation.dispose
 await ctx.uiWorkspace.startSession();assert.equal(calls[0].args[0],'ordinary');assert.equal(calls[0].receiver,ctx.uiWorkspace)
 const options={agentPreset:'ptc'};await ctx.uiWorkspace.startSession('ordinary',options);assert.equal(calls[1].args[1],options)
 let sceneCreates=0;view={...view,mode:'scenes',startSceneSession:()=>{sceneCreates++}}
 await ctx.uiWorkspace.startSession();assert.equal(sceneCreates,1);assert.equal(calls.length,2)
 await navigation.startWorkspaceSession();assert.equal(calls[2].args[0],'ordinary');assert.equal(sceneCreates,1,'切换到工作区必须显式创建普通对话，不能复用场景意图')
 dispose();assert.equal(ctx.uiWorkspace.startSession,native)
})

test('只有场景目录时沿 DSH 选目录和工作区创建服务，不生成中台会话；取消不回退场景',async()=>{
 const calls=[];let picked=null
 const ctx={uiWorkspace:{startSession:(...args)=>calls.push(args),pickDirectory:async()=>picked},sessions:{list:{getSnapshot:()=>({byId:{quote:{id:'quote'}}})}},workspaces:{list:{getSnapshot:()=>({items:[{workspaceId:'scene',sessionIds:['quote']}]} )},create:async input=>{calls.push(input);return{workspaceId:'chosen'}}},uiSession:{adapter:{current:{getSnapshot:()=>({key:'quote'})}}}}
 const {dispose}=installWorkspaceNavigation(ctx,{getSnapshot:()=>({mode:'workspace',ready:true,links:{quote:'quotation'}})})
 await ctx.uiWorkspace.startSession();assert.deepEqual(calls,[])
 picked='D:/selected';await ctx.uiWorkspace.startSession();assert.deepEqual(calls,[{path:'D:/selected'},['chosen',undefined]])
 dispose()
})

test('项目内新增携带原生 clearPreviousDraft=false 时，不复用同项目中的旧场景空会话',async()=>{
 const calls=[],opened=[]
 const ctx={uiWorkspace:{startSession:(_id,options)=>opened.push(options?'old-scene-blank':'native-fresh'),openSession:id=>opened.push(id)},sessions:{list:{getSnapshot:()=>({byId:{quote:{id:'quote',blank:true},plain:{id:'plain'}}})},create:async request=>{calls.push(request);return'native-fresh'}},workspaces:{list:{getSnapshot:()=>({items:[{workspaceId:'project',sessionIds:['quote','plain']}]})}},uiSession:{adapter:{current:{getSnapshot:()=>({key:'plain'})}}}}
 const navigation=installWorkspaceNavigation(ctx,{getSnapshot:()=>({mode:'workspace',ready:true,links:{quote:'quotation'}})})
 await ctx.uiWorkspace.startSession('project',{clearPreviousDraft:false})
 assert.deepEqual(opened,['native-fresh']);assert.deepEqual(calls,[{workspaceId:'project'}]);navigation.dispose()
})

test('工作区新增遇到旧场景默认预设时显式使用 standard，保留原生其他默认和既有会话',async()=>{
 const calls=[];let defaultId='beellix-scene'
 const ctx={remote:{agentPresets:{list:async()=>({ok:true,value:{presets:[{id:defaultId,isDefault:true}]}})}},uiWorkspace:{startSession:(...args)=>calls.push(args)},sessions:{list:{getSnapshot:()=>({byId:{plain:{id:'plain'}}})}},workspaces:{list:{getSnapshot:()=>({items:[{workspaceId:'project',sessionIds:['plain']}]})}},uiSession:{adapter:{current:{getSnapshot:()=>({key:'plain'})}}}}
 const nav=installWorkspaceNavigation(ctx,{getSnapshot:()=>({mode:'workspace',ready:true,links:{}})})
 await ctx.uiWorkspace.startSession('project',{clearPreviousDraft:false})
 assert.deepEqual(calls[0],['project',{clearPreviousDraft:false,agentPreset:'standard'}])
 defaultId='ptc';await ctx.uiWorkspace.startSession('project');assert.deepEqual(calls[1],['project',undefined])
 const opts={agentPreset:'cordis'};await ctx.uiWorkspace.startSession('project',opts);assert.equal(calls[2][1],opts)
 nav.dispose()
})
