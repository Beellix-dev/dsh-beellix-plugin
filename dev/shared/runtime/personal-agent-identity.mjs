/** 身份只取当前原生Agent及可信场景绑定，禁止以消息或工具参数自报。 */
export async function personalAgentIdentity(ctx,knowledgeSessions,agent,resource){
 if(!agent||ctx.agents.get(agent.id)!==agent)throw Error('DATA_IDENTITY')
 let root=agent;const seen=new Set()
 while(root.session.header.parentSession){if(root.session.header.origin!=='subagent'||seen.has(root.id)||seen.size>=12)throw Error('DATA_IDENTITY');seen.add(root.id);root=ctx.agents.get(root.session.header.parentSession);if(!root)throw Error('DATA_IDENTITY')}
 const runtime=ctx.get('beellixScenes'),saved=runtime&&(await runtime.bindingState()).bindings[root.id],binding=runtime&&await runtime.bindingFor(root)
 if(saved&&!binding||!binding&&root.session.header.agentPreset==='beellix-scene')throw Error('DATA_SCENE_UNAVAILABLE')
 const preset=root.ctx.get?.('agentPresets')?.composedPreset(root.ctx)??root.session.header.agentPreset
 const actor={principal:'owner',subject:binding?.packageName??'workspace',sessionId:agent.id,identity:JSON.stringify([root.id,binding?.businessSessionId??null,binding?.sceneId??null,preset]),readOnly:root!==agent||binding?.readOnly===true}
 if(resource?.consent==='knowledge'){const selected=await knowledgeSessions.read(root.id);actor.knowledgeSpaceIds=selected.enabled?selected.spaceIds:[]}
 return actor
}
