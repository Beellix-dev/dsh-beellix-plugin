import test from 'node:test'
import assert from 'node:assert/strict'
import {projectDirectoryChoices} from '../src/directory-choices.mjs'
import {projectWorkspaceDirectory} from '../src/workspace-scope.mjs'

const scene={ready:true,mode:'scenes',links:{one:'quote',two:'quote',legacy:'quote'},managedWorkspaceIds:['auto-one','auto-two','old-auto','empty-auto']}
const sessions={byId:{one:{id:'one'},two:{id:'two'},legacy:{id:'legacy'},plain:{id:'plain'}}}
const workspaces={phase:'ready',items:[{workspaceId:'auto-one',title:'session-one',path:'D:/managed/session-one',sessionIds:['one']},{workspaceId:'auto-two',title:'session-two',path:'D:/managed/session-two',sessionIds:['two']},{workspaceId:'old-auto',title:'smart-quotation',sessionIds:['legacy']},{workspaceId:'empty-auto',title:'session-orphan',sessionIds:[]},{workspaceId:'plain',title:'V0.5',sessionIds:['plain']},{workspaceId:'empty-user',title:'session-user-project',sessionIds:[]}],archivedSessionIds:[],pinnedSessionIds:[]}

test('场景目录菜单只有当前会话文件及普通项目，不展示其他场景内部 UUID 或旧共享目录',()=>{
 const before=structuredClone({scene,sessions,workspaces})
 const result=projectDirectoryChoices({scene,sessions,workspaces,sessionId:'two'})
 assert.deepEqual(result.items.map(row=>[row.workspaceId,row.title]),[['auto-two','会话文件'],['plain','V0.5'],['empty-user','session-user-project']])
 assert.equal(result.items[0].path,workspaces.items[1].path);assert.deepEqual({scene,sessions,workspaces},before)
})
test('工作区目录菜单和左侧列表排除空的内部目录，保留用户项目与原始快照',()=>{
 const view={...scene,mode:'workspace'}
 assert.deepEqual(projectDirectoryChoices({scene:view,sessions,workspaces,sessionId:'plain'}).items.map(row=>row.workspaceId),['plain','empty-user'])
 assert.deepEqual(projectWorkspaceDirectory({scene:view,sessions,workspaces}).workspaces.items.map(row=>row.workspaceId),['plain','empty-user'])
})
test('自选目录显示真实项目名，混合旧项目保留，不从名称猜测归属',()=>{
 const custom={...workspaces,items:[...workspaces.items,{workspaceId:'chosen',title:'我的工程',sessionIds:['two','plain']}]}
 assert.equal(projectDirectoryChoices({scene,sessions,workspaces:custom,sessionId:'plain'}).items.find(row=>row.workspaceId==='chosen').title,'我的工程')
 const sceneCustom={...scene,managedWorkspaceIds:scene.managedWorkspaceIds.filter(id=>id!=='auto-two')}
 assert.equal(projectDirectoryChoices({scene:sceneCustom,sessions,workspaces,sessionId:'two'}).items[0].title,'session-two')
})
test('归属尚未读取时不闪出内部目录，也不改写原生状态',()=>{
 const result=projectDirectoryChoices({scene:{ready:false},sessions,workspaces,sessionId:'two'})
 assert.deepEqual(result.items,[]);assert.equal(result.phase,'ready');assert.equal(workspaces.items.length,6)
})
