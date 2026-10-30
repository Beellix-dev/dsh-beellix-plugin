import {OperationFeedback} from "../../../../dev/shared/console/operation-feedback.mjs"
/** 组件只消费页面数据与回调，宿主服务与路径识别留在插件装配层。 */
import React, { useEffect, useRef, useState } from 'react'
import {ConsoleGlyph} from './console-icons.mjs'
import {AccountControl} from './account-control.mjs'
const h = React.createElement

export const zh = {
  nav: 'Beelli X 中台', home: '中台', refresh: '刷新', plugins: '应用管理', market: '插件市场', remote: '远程控制',
  loading: '读取中…', unavailable: '暂不可用', ready: '已连接', incomplete: '待补齐', uninitialized: '未初始化', blocked: '需要处理', relocated: '待接回', 'choice-required': '请选择目录', choose: '选择已有目录', change: '更换目录',
  root: '数据目录', installation: 'DSH 安装位置', copy: '复制位置', copied: '已复制',
  initialize: '初始化目录', repair: '检查目录', reconnect: '重新接入应用', working: '处理中…', initialized: '目录已就绪', reconnectDone: '应用已核对', restore: '接回目录',
  maintenance: '维护与目录', exists: '已建立', missing: '待建立',
  applications: '应用', 'app.ready': '正常', 'app.working': '接入中…', 'app.pending': '待接入', 'app.needs-repair': '待修复', 'app.failed': '接入失败', retry: '重试', restart: '重启生效', pendingRoot: '重启后切换至', candidates: '选择一份目录，不合并数据。',
  fetchError: '中台连接暂不可用，请刷新重试。', copyError: '未能复制位置，请手动复制下方路径。',
  'dir.config': '中台配置', 'dir.environment': '自有插件环境', 'dir.data': '业务数据', 'dir.knowledge': '知识资料', 'dir.files': '文件与附件',
  'dir.templates': '模板资源', 'dir.assets': '应用资源', 'dir.cache': '可重建缓存', 'dir.logs': '中台日志', 'dir.backups': '恢复备份',
}
export const en = {
  nav: 'Beelli X', home: 'Home', refresh: 'Refresh', plugins: 'Plugins', market: 'Plugin Market', remote: 'Remote Control',
  loading: 'Loading…', unavailable: 'Unavailable', ready: 'Connected', incomplete: 'Incomplete', uninitialized: 'Not initialized', blocked: 'Needs attention', relocated: 'Reconnect required', 'choice-required': 'Choose a directory', choose: 'Choose existing directory', change: 'Change directory',
  root: 'Data directory', installation: 'DSH installation', copy: 'Copy location', copied: 'Copied',
  initialize: 'Initialize directory', repair: 'Check directory', reconnect: 'Reconnect apps', working: 'Working…', initialized: 'Directory ready', reconnectDone: 'Apps checked', restore: 'Reconnect directory',
  maintenance: 'Maintenance and directories', exists: 'Created', missing: 'Pending',
  applications: 'Apps', 'app.ready': 'Ready', 'app.working': 'Connecting…', 'app.pending': 'Pending', 'app.needs-repair': 'Needs repair', 'app.failed': 'Connection failed', retry: 'Retry', restart: 'Restart to apply', pendingRoot: 'Switch on restart to', candidates: 'Choose one directory. Data will not be merged.',
  fetchError: 'Unable to connect. Refresh and try again.', copyError: 'Unable to copy. Copy the path below manually.',
  'dir.config': 'Configuration', 'dir.environment': 'Plugin environment', 'dir.data': 'Business records', 'dir.knowledge': 'Knowledge', 'dir.files': 'Files and attachments',
  'dir.templates': 'Templates', 'dir.assets': 'App assets', 'dir.cache': 'Rebuildable cache', 'dir.logs': 'Logs', 'dir.backups': 'Recovery backups',
}

export function BrandIcon({ size = 24 } = {}) {
  return h('svg', { width: size, height: size, viewBox: '0 0 32 32', fill: 'none', 'aria-hidden': true },
    h('path', { d: 'M5 4 16 10v12L5 16V4Z', fill: '#4624bd' }),
    h('path', { d: 'm16 16 11-6v12l-16 9V19l5-3Z', fill: '#ff7b26' }))
}

export function BootstrapView({ snapshot, busy = false, error, notice, onNoticeDone,onErrorDone,onInitialize, onRefresh, onCopy, onPlugins, onReconnect,onChoose, accountApi,openAccountWebsite,t, children }) {
  const status = snapshot?.status ?? (error ? 'unavailable' : 'loading'), ready = status === 'ready'
  const applications = snapshot?.applications
  const appNeedsAction = ['pending', 'needs-repair', 'failed'].includes(applications?.status) && !applications?.restartRequired
  const appNotice = applications && applications.status !== 'ready' || applications?.restartRequired
  const cannotInitialize = busy || !snapshot || ['blocked', 'choice-required', 'unavailable', 'loading'].includes(status)
  const badge = (value, label) => h('span', { className: 'beellix-bootstrap__badge', 'data-status': value, role: 'status' }, h('span', { className: 'beellix-bootstrap__dot', 'aria-hidden': true }), label)
  const button = (label, action, disabled = busy, primary = false) => h('button', { type: 'button', onClick: action, disabled, className: primary ? 'beellix-bootstrap__primary' : undefined }, label)
  return h('div', { className: 'beellix-bootstrap', 'data-beellix-panel': '' },
    h('div', { className: 'beellix-bootstrap__page' },
      h('header', { className: 'beellix-bootstrap__header' },
        h('div', { className: 'beellix-bootstrap__brand' }, h(BrandIcon, { size: 30 }), h('h1', null, 'Beelli ', h('span', null, 'X'), ' ', t('home')), snapshot?.version && h('small', { className: 'beellix-bootstrap__version' }, 'v', snapshot.version)),
        h('div',{className:'beellix-home-actions'},accountApi&&h(AccountControl,{api:accountApi,openWebsite:openAccountWebsite}),button(t('refresh'), onRefresh))),
      h(OperationFeedback,{error,notice,onNoticeDone,onErrorDone}),
      appNotice && h('div', { className: 'beellix-bootstrap__notice beellix-home-app-notice', role: appNeedsAction ? 'alert' : 'status' },
        h('span', null, applications.message || t(applications.restartRequired ? 'restart' : `app.${applications.status}`)),
        appNeedsAction && onReconnect && button(t('retry'), onReconnect, busy || !ready)),
      h('div',{className:'beellix-home-cards'},h('section', { className: 'beellix-bootstrap__section', 'aria-busy': busy, 'aria-label': t('root') },
        h('div', { className: 'beellix-bootstrap__row' }, h('div',{className:'beellix-card-title'},h(ConsoleGlyph,{kind:'folder'}),h('h2', null, t('root'))), badge(status, t(status))),
        h('code', { className: 'beellix-bootstrap__path' }, snapshot?.root ?? t('unavailable')),
        snapshot?.pendingRoot && h('p', { role: 'status', className: 'beellix-bootstrap__warning' }, t('pendingRoot'), ' ', h('code', null, snapshot.pendingRoot)),
        snapshot?.message && h('p', { className: 'beellix-bootstrap__warning' }, snapshot.message),
        h('div', { className: 'beellix-bootstrap__actions' }, !ready && button(busy ? t('working') : t(status === 'relocated' ? 'restore' : status === 'incomplete' ? 'repair' : 'initialize'), onInitialize, cannotInitialize, true), onChoose && button(t(ready ? 'change' : 'choose'), onChoose), snapshot?.root && button(t('copy'), onCopy)),
        snapshot?.candidates?.length > 1 && h('div', { className: 'beellix-bootstrap__warning' }, t('candidates'), h('ul', null, ...snapshot.candidates.map(item => h('li', { key: item.root }, h('code', null, item.root))))))),
      ready && children,
      h('details', { className: 'beellix-bootstrap__directories' }, h('summary', null, t('maintenance')),
        h('div', { className: 'beellix-bootstrap__actions' }, ready && button(busy ? t('working') : t('repair'), onInitialize, cannotInitialize), onReconnect && !appNeedsAction && button(t('reconnect'), onReconnect, busy || !ready)),
        h('div', { className: 'beellix-bootstrap__installation' }, h('span', null, t('installation')), h('code', null, snapshot?.installationDirectory ?? t('unavailable'))),
        h('div', { className: 'beellix-bootstrap__grid' }, ...(snapshot?.directories ?? []).map(item => h('div', { className: 'beellix-bootstrap__directory', key: item.path }, h('div', null, h('strong', null, t(`dir.${item.path}`)), h('code', null, item.path + '/')), h('span', { 'data-ready': item.exists }, t(item.exists ? 'exists' : 'missing'))))))))
}

export function BootstrapPanel({ readState, initializeDirectories, reconnectApplications,chooseDirectory, openPlugins, copyPath, accountApi,openAccountWebsite,t, children }) {
  const [snapshot, setSnapshot] = useState(null), [busy, setBusy] = useState(true), [error, setError] = useState(''), [notice, setNotice] = useState('')
  const active = useRef(null)
  useEffect(() => {
    const controller = new AbortController(); active.current = controller
    void readState(controller.signal).then(value => { if (!controller.signal.aborted) setSnapshot(value) }).catch(failure => { if (!controller.signal.aborted) setError(failure.message || t('fetchError')) }).finally(()=>{if(!controller.signal.aborted)setBusy(false)})
    return () => { active.current?.abort() }
  }, [readState])
  const refresh = async () => {
    active.current?.abort(); const controller = new AbortController(); active.current = controller
    setBusy(true); setError(''); setNotice('')
    try { const value = await readState(controller.signal); if (!controller.signal.aborted) setSnapshot(value) }
    catch (failure) { if (!controller.signal.aborted) setError(failure.message || t('fetchError')) }
    finally { if (!controller.signal.aborted) setBusy(false) }
  }
  const initialize = async () => {
    if (busy || !snapshot) return
    active.current?.abort(); const controller = new AbortController(); active.current = controller
    setBusy(true); setError(''); setNotice('')
    try { const value = await initializeDirectories(snapshot.csrfToken, controller.signal); if (!controller.signal.aborted) { setSnapshot(value); setNotice(t('initialized')) } }
    catch (failure) { if (!controller.signal.aborted) setError(failure.message || t('fetchError')) }
    finally { if (!controller.signal.aborted) setBusy(false) }
  }
  const copy = async () => { try { await copyPath(snapshot?.root ?? ''); setNotice(t('copied')) } catch { setError(t('copyError')) } }
  const reconnect=async()=>{
    if(busy)return;setBusy(true);setError('');setNotice('')
    active.current?.abort();const controller=new AbortController();active.current=controller
    try{const value=await reconnectApplications(controller.signal);if(!controller.signal.aborted){setSnapshot(await readState(controller.signal));setNotice(value.items.some(item=>item.application==='restart-required')?t('restart'):t('reconnectDone'))}}
    catch(failure){if(!controller.signal.aborted)setError(failure.message)}finally{if(!controller.signal.aborted)setBusy(false)}
  }
  const choose=async()=>{if(busy)return;const controller=new AbortController();active.current=controller;setBusy(true);setError('');try{const value=await chooseDirectory(controller.signal);if(!controller.signal.aborted)setSnapshot(value)}catch(failure){if(!controller.signal.aborted)setError(failure.message)}finally{if(!controller.signal.aborted)setBusy(false)}}
  return h(BootstrapView, { snapshot, busy, error, notice,onNoticeDone:()=>setNotice(''),onErrorDone:()=>setError(''), onInitialize: initialize, onRefresh: refresh, onCopy: copy, onPlugins: openPlugins, onReconnect:reconnectApplications?reconnect:undefined,onChoose:chooseDirectory?choose:undefined, accountApi,openAccountWebsite,t }, children)
}
