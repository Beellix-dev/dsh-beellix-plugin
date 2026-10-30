/** 中台适配器：原生连接授权和独立操作令牌；知识及数据服务由可选插件提供。 */
import { randomBytes, timingSafeEqual } from 'node:crypto'
import { ModelDirectory } from './model-directory.mjs'
import {OfficialModels} from './official-models.mjs'
import {isSessionRecord} from './session-records.mjs'
import {DeepSeekSearch} from './deepseek-search.mjs'
const send = (res, status, value) => { const bytes = Buffer.from(JSON.stringify(value)); res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'content-length': bytes.length, 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' }); res.end(bytes) }
async function body(req, max = 65536) { let size = 0; const chunks = []; for await (const chunk of req) { size += chunk.length; if (size > max) throw Error('REQUEST_TOO_LARGE'); chunks.push(chunk) } return JSON.parse(Buffer.concat(chunks).toString('utf8')) }
async function archiveBody(req){let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>64*1024*1024)throw Error('REQUEST_TOO_LARGE');chunks.push(chunk)}return Buffer.concat(chunks)}
const errors={ADDON_CATALOG_CATEGORY_INVALID:'插件分类声明无效，请使用完整安装包。',ARCHIVE_STATE_FULL:'归档清理记录已达当前容量，原有记录已保留。',ARCHIVE_CHANGED:'归档列表已变化，请刷新后重试。',ARCHIVE_NOT_ARCHIVED:'只能清理仍处于归档状态的对话，请刷新。',ARCHIVE_REQUEST_INVALID:'请选择有效的归档对话。',ARCHIVE_STATE_INVALID:'归档清理记录需要检查，已保留原数据。',ARCHIVE_UNAVAILABLE:'归档服务尚未就绪，请重试。',SCENE_MODEL_UNAVAILABLE:'场景或模型暂不可用，请刷新后重新选择。',ADDON_OPERATION_CANCELLED:'操作已取消，原环境已保留。',ADDON_CONTRACT_UNSUPPORTED:'插件需要其他版本的 Beelli X UI，请核对兼容版本后重试。',ADDON_CONTRACT_INVALID:'插件接入声明不完整，请使用有效的 Beelli X 安装包。',ADDON_DATA_MIGRATION_REQUIRED:'插件数据版本有变化，需要完成备份和迁移后再升级；原数据未修改。',ADDON_RECOVERY_INVALID:'安装恢复记录需要检查，已停止修改原环境。',ADDON_PACKAGE_INVALID:'安装包无效，请选择完整的 Beelli X .tgz 安装包。',ADDON_PACKAGE_CHANGED:'插件版本已变化，请刷新后重试。',ADDON_PACKAGE_UNAVAILABLE:'安装包尚未提供，请先导入安装包。',ADDON_INSTALLING:'另一个插件操作正在进行，请稍后重试。',ADDON_ROLLBACK_REQUIRED:'原环境尚未恢复，请保留目录并在维护与目录中检查。',ADDON_FOREIGN_REGISTRATION:'此插件未归属当前中台环境，已停止修改。',ADDON_ACTIVATION_FAILED:'插件接入失败，原配置已保留，请查看运行状态后重试。',SCENE_CHANGED:'场景状态已变化，请刷新后重试。',SCENE_ACTIVATION_FAILED:'场景启停未成功，请刷新检查运行状态。',MODEL_CONTROL_CHANGED:'连接状态已变化，请刷新后重试。',MODEL_CONTROL_FORBIDDEN:'此项由启动配置或 DSH 原生认证维护，请在原生设置中修改。',MODEL_CONTROL_BUSY:'正在保存模型设置，请稍后重试。',MODEL_CONTROL_INVALID:'模型操作参数无效，请刷新后重试。',MODEL_STATE_INVALID:'模型恢复配置需要检查，请保留目录并重试。',SKILLS_UNAVAILABLE:'当前宿主未提供技能目录。',REQUEST_TOO_LARGE:'安装包过大，请使用不超过64 MiB的安装包。'}
Object.assign(errors,{ADDON_SOURCE_INVALID:'请输入 Beelli X npm 包名、npm 页面链接或 registry 安装包链接。',ADDON_SOURCE_MISMATCH:'安装包与所选插件不一致，请核对包名。',ADDON_SOURCE_NOT_FOUND:'此包或版本尚未发布到 npm，请使用已交付的本地安装包。',ADDON_SOURCE_INTEGRITY:'下载包校验失败，未修改安装环境，请重新检查。',ADDON_SOURCE_UNAVAILABLE:'暂时无法获取 npm 安装包，请检查网络或导入本地安装包。'})
Object.assign(errors,{KNOWLEDGE_MODEL_NOT_CONFIGURED:'请先配置模型，再启用。',KNOWLEDGE_MODEL_INVALID:'模型设置无效，请刷新后重试。',PLUGIN_MODEL_UNAVAILABLE:'插件或模型当前不可用，请刷新后重新选择。',MODEL_CAPABILITY_REQUIRED:'所选模型不支持此用途需要的输入，请选择具备对应能力的模型。',SEARCH_UNAVAILABLE:'请先配置直连 DeepSeek API Key，并启用 DSH 原生搜索组件。'})
export function consoleApi({ addons, registry, updates, authorizeUpdates, interoperability, authorizeIntegration, clientPreferences, authorizePreferences, platform, ctx, sceneManager=ctx?.pluginManager, ready, catalog, authorize, onError, modelStatePath, sceneModels, pluginModels, officialModels, archives, sceneDirectory }) {
  const token = randomBytes(32).toString('base64url')
  const models = new ModelDirectory(ctx,{statePath:modelStatePath})
  const official=officialModels??new OfficialModels(ctx)
  const search=new DeepSeekSearch(ctx)
  return (req, res) => { void (async () => {
    if (typeof authorize !== 'function') return send(res, 503, { message: '授权服务尚未就绪' })
    const denial = authorize(req); if (denial !== undefined) return send(res, typeof denial === 'number' ? denial : 403, { message: '连接未获授权' })
    if (!ready()) return send(res, 409, { message: '请先连接中台目录' })
    const url = new URL(req.url, 'http://beellix.local'), tail = url.pathname.slice('/beellix/console'.length)
    if(tail==='/client-preferences'){if(!clientPreferences||typeof authorizePreferences!=='function')return send(res,503,{message:'客户端设置尚未就绪'});const rejected=authorizePreferences(req);if(rejected!==undefined)return send(res,typeof rejected==='number'?rejected:403,{message:'仅本机用户可修改客户端设置'})}
    if(tail==='/integrations'||tail.startsWith('/integrations/')){if(!interoperability||typeof authorizeIntegration!=='function')return send(res,503,{message:'互通管理尚未就绪'});const rejected=authorizeIntegration(req);if(rejected!==undefined)return send(res,typeof rejected==='number'?rejected:403,{message:'仅本机管理者可管理插件连接'})}
    if(updates&&(tail==='/updates'||tail.startsWith('/updates/'))){if(typeof authorizeUpdates!=='function')return send(res,503,{message:'更新授权服务尚未就绪'});const rejection=authorizeUpdates(req);if(rejection!==undefined)return send(res,typeof rejection==='number'?rejection:403,{message:'仅本机管理者可更改插件更新'})}
    if (req.method !== 'GET') {
      const value = req.headers['x-beellix-console-token']
      if (typeof value !== 'string' || Buffer.byteLength(value) !== Buffer.byteLength(token) || !timingSafeEqual(Buffer.from(value), Buffer.from(token))) return send(res, 403, { message: '操作校验失效，请刷新' })
      if (!String(req.headers['content-type']).startsWith(tail==='/addons/import'?'application/octet-stream':'application/json')) return send(res, 415, { message: '请求格式不支持' })
    }
    if (tail === '/state' && req.method === 'GET') { let applications, addonError,managedPackages=[],updateState; try { const snapshot=await addons.snapshot();applications=platform?platform.snapshot(snapshot):snapshot;managedPackages=(await addons.owned?.()??[]).map(row=>row.name) } catch { addonError = '安装目录需要检查，请刷新或查看目录状态' };if(updates){try{updateState=await updates.snapshot();applications=(applications??[]).map(row=>({...row,onlineUpdate:updateState.packages.find(item=>item.name===row.name)}))}catch{updateState={status:'invalid',packages:[]}}}return send(res, 200, { csrfToken: token, applications:applications??[],managedPackages,capabilities:(applications??[]).filter(row=>!row.category||row.category==='resources'), addonError,...updateState?{updates:updateState}:{} }) }
    if(tail==='/client-preferences'&&req.method==='GET')return send(res,200,await clientPreferences.snapshot())
    if(tail==='/client-preferences'&&req.method==='POST')return send(res,200,await clientPreferences.save(await body(req)))
    if(tail==='/integrations'&&req.method==='GET')return send(res,200,await interoperability.managementSnapshot())
    if(tail==='/integrations/choices'&&req.method==='GET')return send(res,200,await interoperability.choice({contractId:url.searchParams.get('contractId'),side:url.searchParams.get('side'),accountId:url.searchParams.get('accountId'),collection:url.searchParams.get('collection'),q:url.searchParams.get('q')??'',offset:Number(url.searchParams.get('offset')??0),limit:Number(url.searchParams.get('limit')??25),ids:JSON.parse(url.searchParams.get('ids')??'[]')}))
    if(tail==='/integrations/audit'&&req.method==='GET')return send(res,200,await interoperability.auditSnapshot({offset:Number(url.searchParams.get('offset')??0),limit:Number(url.searchParams.get('limit')??40),grantId:url.searchParams.get('grantId')??undefined}))
    if(tail==='/integrations/create'&&req.method==='POST')return send(res,200,await interoperability.create(await body(req)))
    if(tail==='/integrations/update'&&req.method==='POST')return send(res,200,await interoperability.update(await body(req)))
    if(tail==='/integrations/enabled'&&req.method==='POST'){const input=await body(req);if(!input||Object.keys(input).some(k=>!['id','enabled','expectedRevision'].includes(k)))throw Error('INTEGRATION_FIELDS');return send(res,200,await interoperability.setEnabled(input))}
    if(tail==='/updates'&&req.method==='GET'&&updates)return send(res,200,await updates.snapshot())
    if(tail==='/updates/check'&&req.method==='POST'&&updates)return send(res,200,await updates.check(await body(req)))
    if(tail==='/updates/install'&&req.method==='POST'&&updates)return send(res,200,await updates.install(await body(req)))
    if (tail === '/addons/install' && req.method === 'POST') return send(res, 200, await addons.install(await body(req)))
    if (tail === '/addons/source/preview' && req.method === 'POST') return send(res,200,await registry.preview(await body(req)))
    if (tail === '/addons/source/install' && req.method === 'POST') return send(res,200,await registry.install(await body(req)))
    if (tail === '/addons/import' && req.method === 'POST') return send(res,200,await addons.importArchive(await archiveBody(req),{expectedName:req.headers['x-beellix-expected-package']}))
    if (tail === '/addons/remove' && req.method === 'POST') return send(res,200,await addons.remove(await body(req)))
    if (tail === '/addons/reconnect' && req.method === 'POST') {if(Object.keys(await body(req)).length)throw Error('ADDON_PACKAGE_INVALID');return send(res,200,await addons.reconnect())}
    if (tail === '/models/catalog' && req.method === 'GET') return send(res, 200, await models.snapshot())
    if(tail==='/archives'&&req.method==='GET'&&archives)return send(res,200,await archives.snapshot())
    if(tail==='/archives/clear'&&req.method==='POST'&&archives)return send(res,200,await archives.clear(await body(req)))
    if (tail === '/models/scenes' && req.method === 'GET' && sceneModels) return send(res,200,await sceneModels.snapshot())
    if (tail === '/models/scenes' && req.method === 'POST' && sceneModels) return send(res,200,await sceneModels.save(await body(req)))
    if (tail === '/models/plugins' && req.method === 'GET' && pluginModels) return send(res,200,await pluginModels.snapshot())
    if (tail === '/models/plugins' && req.method === 'POST' && pluginModels) return send(res,200,await pluginModels.save(await body(req)))
    if (tail === '/models/search' && req.method === 'GET') return send(res,200,await search.snapshot())
    if (tail === '/models/search' && req.method === 'POST') return send(res,200,await search.save(await body(req)))
    if (tail === '/models/official' && req.method === 'GET') return send(res,200,await official.snapshot({refresh:url.searchParams.get('refresh')==='true'}))
    if (tail === '/models/enabled' && req.method === 'POST') return send(res, 200, await models.setEnabled(await body(req)))
    if (tail === '/models/selection' && req.method === 'POST') return send(res, 200, await models.setModelEnabled(await body(req)))
    if (tail === '/addons/enabled' && req.method === 'POST') {
      return send(res,200,await addons.setEnabled(await body(req)))
    }
    if (tail === '/inventory' && req.method === 'GET') {
      const [scenes, plugins, inventory] = await Promise.all([catalog(), ctx.pluginManager.listPlugins(), ctx.get('pluginInventory')?.list()])
      const rows = [...plugins, ...(inventory?.agentPresets ?? []).flatMap(preset => preset.rows.map(row => ({ ...row, entryId: preset.id + ':' + row.entryId })))]
      return send(res, 200, { scenes, plugins: rows.map(row => ({ entryId: row.entryId, name: row.name ?? row.moduleName ?? row.entryId, bundle: row.bundle, enabled: row.enabled, phase: row.fiberPhase, readOnlyReason: row.readOnlyReason })) })
    }
    if (tail === '/scene/enabled' && req.method === 'POST') {
      const input = await body(req), scene = (await catalog()).find(row => row.packageName === input.packageName)
      if (!scene || typeof input.enabled !== 'boolean' || Object.keys(input).some(k => !['packageName', 'enabled', 'expectedVersion', 'expectedEnabled'].includes(k))) throw Error('SCENE_INVALID')
      if (scene.version !== input.expectedVersion || scene.enabled !== input.expectedEnabled) throw Error('SCENE_CHANGED')
      const result = await sceneManager.setBundleEnabled(scene.packageName, input.enabled)
      if (result.application === 'failed') throw Error('SCENE_ACTIVATION_FAILED')
      return send(res, 200, result)
    }
    if (tail === '/skills' && req.method === 'GET') {
      const id = url.searchParams.get('sessionId'); if (!id || id.length > 200) throw Error('REQUEST_INVALID')
      const skills = ctx.get('sessionSkillCatalog'); if (!skills) throw Error('SKILLS_UNAVAILABLE')
      return send(res, 200, await skills.list({ sessionId: id }, new AbortController().signal))
    }
    if (tail === '/sessions' && req.method === 'GET') {
      const offset = Number(url.searchParams.get('offset') ?? 0)
      const query=(url.searchParams.get('query')??'').trim().toLocaleLowerCase(),status=url.searchParams.get('status')??'all'
      if (!Number.isSafeInteger(offset) || offset < 0||query.length>200||!['all','running','saved'].includes(status)) throw Error('REQUEST_INVALID')
      const controller = new AbortController(), abort = () => { if (!res.writableEnded) controller.abort() }; res.on('close', abort)
      try {
        const result = await ctx.sessionController.list({}, controller.signal),scene=await sceneDirectory?.(),retained=new Set(scene?.retainedSessionIds??[]), rows = [...result.items].filter(row=>isSessionRecord(row,retained)&&[row.sessionId,row.projections?.values?.title].filter(value=>typeof value==='string').join(' ').toLocaleLowerCase().includes(query)&&(status==='all'||(status==='running'?row.running:!row.running))).sort((a,b) => b.updatedAt - a.updatedAt)
        return send(res, 200, { total: rows.length, items: rows.slice(offset, offset + 30).map(row => ({ id: row.sessionId, title: typeof row.projections?.values?.title === 'string' && row.projections.values.title.trim() ? row.projections.values.title : '未命名会话', updatedAt: row.updatedAt, origin: row.origin, parentSession: row.parentSessionId, running: row.running })), nextOffset: offset + 30 < rows.length ? offset + 30 : null })
      } finally { res.off('close', abort) }
    }
    return send(res, 404, { message: '接口不存在' })
  })().catch(error => {
    onError?.(error);if(res.headersSent){res.end();return}
    const reason=/^[A-Z][A-Z_]+$/u.test(error.message)?error.message:'CONSOLE_REQUEST_FAILED'
    const updateErrors={UPDATE_SERVICE_NOT_READY:'更新服务尚未上线，请稍后重试。',UPDATE_SOURCE_INVALID:'更新服务设置异常，请更新 Beelli X 入口插件。',UPDATE_CATALOG_INVALID:'发布清单无效，请联系发布方检查。',UPDATE_CATALOG_EXPIRED:'发布清单已过期，请发布方更新后重试。',UPDATE_CATALOG_CONFLICT:'发布清单与已检查记录不一致，已停止更新。',UPDATE_INTEGRITY:'更新包校验失败，原安装未修改。',UPDATE_CHANGED:'插件或发布版本已变化，请重新检查更新。',UPDATE_BUSY:'正在检查或安装更新，请稍后重试。',UPDATE_STATE_INVALID:'更新记录需要检查，原安装未修改。',UPDATE_TOO_LARGE:'更新清单或安装包超过大小限制。',UPDATE_UNAVAILABLE:'暂时无法连接更新服务，请稍后重试。',ADDON_DSH_VERSION_UNSUPPORTED:'此包不支持当前 DSH 版本，原安装未修改。'}
    const integrationErrors={INTEGRATION_ACCOUNT:'账套不可用，请重新选择。',INTEGRATION_IDENTITY:'已有连接不能更换账套，请新建连接。',INTEGRATION_GRANT_REVISION:'连接已变化，请刷新后再操作。',INTEGRATION_MAPPING:'请完整选择客户对应关系，不能重复。',INTEGRATION_PRODUCT_SCOPE:'请选择共享商品和仓库。',INTEGRATION_PERMISSION:'请至少选择一项允许的操作。',INTEGRATION_FIELD_SCOPE:'共享字段无效，请重新选择。',INTEGRATION_EXPIRY:'有效期须在未来一年内，请重新选择。',INTEGRATION_PROVIDER_UNAVAILABLE:'相关插件未启用或尚未就绪。',INTEGRATION_CONTRACT:'连接类型不可用。',INTEGRATION_COLLECTION:'此类资料不允许通过连接配置读取。',INTEGRATION_LOOKUP:'查询条件无效，请重新搜索。',INTEGRATION_FIELDS:'配置内容无效，请重新检查。',INTEGRATION_CUSTOMER_INVALID:'关联客户已变化，请重新选择。'}
    send(res,/FORBIDDEN/.test(reason)?403:/NOT_FOUND/.test(reason)?404:/CONFLICT|BUSY|CHANGED|GRANT_REVISION/.test(reason)?409:reason==='UPDATE_SERVICE_NOT_READY'?503:400,{message:errors[reason]??updateErrors[reason]??integrationErrors[reason]??(reason==='CLIENT_PREFERENCES_CHANGED'?'设置已在其他窗口更改，请重试。':reason==='CLIENT_PREFERENCES_INVALID'?'客户端设置需要检查，原设置已保留。':'操作未完成，请刷新后重试；原有数据已保留。'),error:{reason}})
  }) }
}
