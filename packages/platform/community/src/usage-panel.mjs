import {PlatformNavigation} from "../../../../dev/shared/console/platform-sidebar.mjs"
import {OperationFeedback} from "../../../../dev/shared/console/operation-feedback.mjs"
/** 中台导航与历史本机计价的兼容组件；日常用量入口归模型页。 */
import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { BootstrapPanel } from './panel.mjs'
import { ConsoleContent, ApplicationManager, DetailHeading, DetailSection } from './console-page.mjs'
import { ProductMark, ProductName } from './brand.mjs'
import {ConsoleIcon as NavigationIcon} from './console-icons.mjs'
const h = React.createElement
const number = value => new Intl.NumberFormat().format(value)
const rateKeys = ['input', 'output', 'cacheRead', 'cacheWrite']
const rateLabels = ['普通输入', '输出', '缓存读取', '缓存写入']
const tokenKeys = ['inputTokens', 'outputTokens', 'cacheReadTokens', 'cacheWriteTokens']
const monthNow = () => { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` }
function range(month) { const [year, value] = month.split('-').map(Number); return { from: new Date(year, value - 1).getTime(), to: new Date(year, value).getTime() } }
const money = value => {
  const raw = BigInt(value.replace('.', '')); if (raw > 0n && raw < 1000000n) return '<0.000001'
  const micros = (raw + 500000n) / 1000000n, fraction = (micros % 1000000n).toString().padStart(6, '0').replace(/0+$/u, '').padEnd(2, '0')
  return `${number(micros / 1000000n)}.${fraction}`
}
const pair = row => JSON.stringify([row.provider, row.model])
const pages = [['home', '首页'], ['models', '模型'], ['scenarios', '场景应用'], ['resources', '知识与数据'], ['archives', '已归档对话'],['plugins','插件管理']]

function navigationStore() {
  let state = { tab: 'home', targetModel: null }; const listeners = new Set()
  return { getSnapshot: () => state, subscribe: listener => { listeners.add(listener); return () => listeners.delete(listener) }, select: (tab, targetModel = null) => { state = { tab:tab==='operations'?'archives':tab, targetModel }; for (const listener of listeners) listener() } }
}

/** 临时占用原生 sidebar 槽；卸载登记后由 DSH 恢复原侧栏，不移除原节点或配置。 */
export function PlatformSidebar({ navigation, close, toggle, width = 240, collapsed = false }) {
  const { tab } = useSyncExternalStore(navigation.subscribe, navigation.getSnapshot)
  return h(PlatformNavigation,{entries:pages,selected:tab,onSelect:id=>navigation.select(id),brand:h(React.Fragment,null,h(ProductMark,{size:24}),h(ProductName)),icon:kind=>h(NavigationIcon,{kind:kind==='plugins'?'scenarios':kind}),close,toggle,width,collapsed})
}

export function PlatformPanel(props) {
  const [navigation] = useState(navigationStore)
  const [capability,setCapability]=useState(null)
  const { tab, targetModel } = useSyncExternalStore(navigation.subscribe, navigation.getSnapshot)
  const entries=(props.useCapabilitySlots??(()=>[]))(rows=>rows)
  useEffect(() => props.mountNavigation?.(navigation), [props.mountNavigation, navigation])
  useEffect(()=>setCapability(null),[tab,targetModel])
  const configurePrice = row => navigation.select('models', row)
  const openPanel=(panel,detail)=>{if(detail?.capabilityId){setCapability({panel,...detail});return}props.openPanel?.(panel)}
  const available=capability&&entries.some(row=>row.options.id===capability.panel)
  const renderCapability=(row,owner={})=>entries.some(entry=>entry.options.id===row.panel)&&props.renderSlot?props.renderSlot('beellix.platform.capability',{...owner,capabilityId:row.id,view:'main',embedded:true,close:()=>navigation.select('home')},{only:row.panel}):null
  return h('div', { className: 'beellix-platform' },
    h('div',{hidden:Boolean(capability&&capability.view!=='settings'),className:'beellix-platform-page'},tab === 'home' ? h(BootstrapPanel, {...props,openPlugins:()=>navigation.select('plugins')}) : tab==='plugins'?h(ApplicationManager,{api:props.consoleApi,embedded:true,openPanel}) : h(ConsoleContent, { ...props,openPanel,renderCapability,api: props.consoleApi, key: tab + (targetModel ? JSON.stringify(targetModel) : ''), tab, initialPrice: targetModel,openManager:()=>navigation.select('plugins'), renderPrices: (kind,refreshVersion) => h(UsagePanel, { ...props, tab: kind ?? 'prices', targetModel, configurePrice, refreshVersion }) })),
    capability&&h('section',{className:'beellix-bootstrap beellix-capability-surface'+(capability.view==='settings'?' beellix-capability-settings':''),'aria-label':capability.title??'插件页面'},h('div',{className:'beellix-bootstrap__page beellix-console'},capability.view!=='settings'&&h(DetailHeading,{kind:'resources',parent:'知识与数据',title:capability.title??capability.capabilityId,onBack:()=>setCapability(null)}),available&&props.renderSlot?props.renderSlot('beellix.platform.capability',{capabilityId:capability.capabilityId,view:capability.view??'main',close:()=>setCapability(null)},{only:capability.panel}):h('p',{role:'status'},'插件界面尚未加载，请检查启用状态。'))))
}

function priceChoices(state) {
  const rows = new Map()
  for (const group of state.catalog ?? []) for (const model of group.models) rows.set(JSON.stringify([group.id, model.id]), { provider: group.id, model: model.id, name: `${group.name} · ${model.name}` })
  for (const row of [...state.models, ...state.prices]) if (row.provider && row.model && !rows.has(pair(row))) rows.set(pair(row), { ...row, name: `${row.provider} · ${row.model}` })
  return [...rows.values()]
}

function PriceEditor({ state, initial, busy, close, save }) {
  const [selected, setSelected] = useState(initial ? pair(initial) : ''), [revision] = useState(state.revision)
  const choices = priceChoices(state), current = state.prices.find(row => pair(row) === selected)
  return h('form', { className: 'beellix-usage__editor', onSubmit: event => {
    event.preventDefault(); const data = new FormData(event.currentTarget), [provider, model] = JSON.parse(selected)
    void save({ provider, model, currency: data.get('currency'), ...Object.fromEntries(rateKeys.map(key => [key, String(data.get(key)).trim()])), expectedRevision: revision, applyUnpriced: data.get('backfill') === 'on' })
  } },
    h('fieldset', {className:'beellix-price-group',disabled:busy}, h('legend',null,'接入模型'),
      h('label', null, '模型与接入连接', h('select', { 'aria-label': '模型与接入连接', value: selected, required: true, onChange: event => setSelected(event.target.value) }, h('option', { value: '' }, '选择模型'), ...choices.map(row => h('option', { value: pair(row), key: pair(row) }, row.name))))),
    selected && h(React.Fragment,{key:selected},
      h('fieldset',{className:'beellix-price-group',disabled:busy},h('legend',null,'Token 单价'),
        h('div',{className:'beellix-usage__fields'},
          h('label', null, '币种', h('select', { name: 'currency', defaultValue: current?.currency ?? 'CNY' }, ...['CNY', 'USD', 'EUR', 'JPY', 'GBP', 'HKD'].map(value => h('option', { key: value }, value)))),
          h('span', { className: 'beellix-usage__unit' }, '单价 / 百万 Token'),
          ...rateKeys.map((key, index) => h('label', { key }, rateLabels[index], h('input', { name: key, type: 'number', inputMode: 'decimal', min: '0', max: '999999999', step: '0.000001', required: index < 2, defaultValue: current?.[key] ?? '' })))),
        h('p', { className: 'beellix-usage__hint' }, '缓存留空时，涉及该项的调用保持未计价。')),
      h('fieldset',{className:'beellix-price-group',disabled:busy},h('legend',null,'历史处理'),
        h('label', { className: 'beellix-usage__check' }, h('input', { type: 'checkbox', name: 'backfill' }), '按此价格补算未计价记录'))),
    h('div', { className: 'beellix-bootstrap__actions' }, h('button', { type: 'submit', className: 'beellix-bootstrap__primary', disabled: busy || !selected }, busy ? '保存中…' : '保存价格'), h('button', { type: 'button', onClick: close, disabled: busy }, '取消')))
}

function Prices({ state, busy, save, targetModel }) {
  const [editing, setEditing] = useState(targetModel ?? undefined)
  if(editing !== undefined)return h('section',{'aria-label':'价格配置'},
    h(DetailHeading,{kind:'prices',parent:'模型价格',title:editing?.model??'新增价格',onBack:()=>setEditing(undefined)}),
    h(PriceEditor,{state,initial:editing,busy,close:()=>setEditing(undefined),save:async input=>{if(await save(input))setEditing(undefined)}}))
  return h('section', { 'aria-label': '模型价格' },
    state.catalogUnavailable && h('p', { role: 'alert', className: 'beellix-usage__hint' }, '模型目录暂不可用，请刷新。'),
    editing === undefined && h('div', { className: 'beellix-bootstrap__actions' }, h('button', { type: 'button', onClick: () => setEditing(null), disabled: busy }, '添加模型价格')),
    !state.prices.length && editing === undefined && h('p', { className: 'beellix-usage__empty' }, '未配置模型价格'),
    state.prices.length > 0 && h('div', { className: 'beellix-usage__table-wrap' }, h('table', null, h('caption', { className: 'beellix-usage__hint' }, '单价 / 百万 Token'), h('thead', null, h('tr', null, ...['模型 / 连接', '输入 / 输出', '缓存读 / 写', ''].map((label, index) => h('th', { key: index, scope: 'col' }, label || h('span', { className: 'beellix-usage__sr' }, '操作'))))), h('tbody', null, ...state.prices.map(row => h('tr', { key: row.id }, h('td', null, h('strong', null, row.model), h('small', null, row.provider)), h('td', null, row.currency, ' ', row.input, ' / ', row.output), h('td', null, row.cacheRead || '未配置', ' / ', row.cacheWrite || '未配置'), h('td', null, h('button', { type: 'button', disabled: busy, onClick: () => setEditing(row) }, '配置'))))))))
}

function UsageRows({ state, configurePrice }) {
  return h('div', { className: 'beellix-usage__table-wrap' }, h('table', null,
    h('thead', null, h('tr', null, ...['时间', '模型 / 连接', 'Token 用量', '预估费用'].map(label => h('th', { key: label, scope: 'col' }, label)))),
    h('tbody', null, ...state.calls.map(row => h('tr', { key: row.id },
      h('td', { 'data-label': '时间' }, h('time', { dateTime: new Date(row.time).toISOString() }, new Date(row.time).toLocaleString(undefined, { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })), h('small', null, row.kind === 'compaction' ? '上下文压缩' : row.kind === 'subagent' ? '子代理' : '主任务', row.attempt > 0 ? ' · 重试' : '')),
      h('td', { 'data-label': '模型 / 连接' }, h('strong', null, row.model ?? '模型未知'), h('small', null, row.provider ?? '连接未知')),
      h('td', { 'data-label': 'Token 用量' }, row.usage ? h('details', null, h('summary', null, number(tokenKeys.reduce((sum, key) => sum + BigInt(row.usage[key]), 0n))), h('dl', null, ...tokenKeys.flatMap((key, index) => [h('dt', { key: `${key}-label` }, rateLabels[index]), h('dd', { key }, number(row.usage[key]))]))) : '未上报'),
      h('td', { 'data-label': '预估费用' }, row.pricing ? h('details', null, h('summary', { title: row.pricing.amount }, row.pricing.currency, ' ', money(row.pricing.amount)), h('div', { className: 'beellix-usage__hint' }, '价格版本 ', row.pricing.version, row.pricing.basis === 'backfill' ? ' · 历史补算' : '', h('dl', null, ...rateKeys.flatMap((key, index) => [h('dt', { key: key + '-label' }, rateLabels[index]), h('dd', { key }, row.pricing.rates[key] || '未配置')])))) : row.usage ? row.provider && row.model ? h('button', { type: 'button', className: 'beellix-usage__price-link', onClick: () => configurePrice(row), title: '配置此模型价格' }, '未计价') : '模型未知' : '缺少用量'))))))
}

function Costs({ state, month, setMonth, offset, load, busy, sync, configurePrice }) {
  return h('section', { 'aria-label': '用量与费用' },
    h('div', { className: 'beellix-usage__toolbar' }, h('label', null, '月份', h('input', { type: 'month', value: month, disabled: busy, onChange: event => { if (event.target.value) setMonth(event.target.value) } })), h('button', { type: 'button', disabled: busy, onClick: sync }, busy ? '同步中…' : '同步原生记录')),
    h(DetailSection,{title:'本月用量',kind:'usage'},h('div', { className: 'beellix-usage__totals', role: 'status' }, h('span', null, number(state.summary.totalCalls), ' 次调用'), ...Object.entries(state.summary.currencies).map(([currency, value]) => h('strong', { key: currency, title: value }, currency, ' ', money(value))), state.summary.unpriced > 0 && h('span', null, state.summary.unpriced, ' 次未计价'))),
    !state.summary.totalCalls ? h('p', { className: 'beellix-usage__empty' }, '本月暂无记录，可同步原生调用。') : h(DetailSection,{title:'调用明细',kind:'tasks'},h(UsageRows, { state, configurePrice })),
    state.summary.totalCalls > 0 && h('div', { className: 'beellix-usage__pagination' }, h('button', { type: 'button', disabled: busy || offset === 0, onClick: () => load(Math.max(0, offset - 50)) }, '上一页'), h('span', null, offset + 1, '–', offset + state.calls.length), h('button', { type: 'button', disabled: busy || state.nextOffset === null, onClick: () => load(state.nextOffset) }, '下一页')),
    h('p', { className: 'beellix-usage__hint' }, '按已上报 Token 和配置价格估算；缺价格或用量不计为零。'))
}

export function UsagePanel({ tab, readUsage, syncUsage, saveUsagePrice, targetModel, configurePrice, refreshVersion = 0 }) {
  const [state, setState] = useState(null), [month, setMonth] = useState(monthNow), [offset, setOffset] = useState(0), [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('')
  const active = useRef(null)
  const load = async (next = 0) => {
    active.current?.abort(); const controller = new AbortController(); active.current = controller; setBusy(true); setError('')
    try { const value = await readUsage({ ...range(month), offset: next, limit: 50 }, controller.signal); if (!controller.signal.aborted) { setState(value); setOffset(next) } }
    catch (error) { if (!controller.signal.aborted) setError(error.message) }
    finally { if (!controller.signal.aborted) setBusy(false) }
  }
  useEffect(() => { void load(); return () => active.current?.abort() }, [month,refreshVersion])
  const save = async input => {
    setBusy(true); setError(''); setNotice('')
    try { const result = await saveUsagePrice(input, state.csrfToken); await load(offset); setNotice(result.repriced ? `已保存，补算 ${result.repriced} 次调用` : '已保存'); return true }
    catch (error) { setError(error.message); return false } finally { setBusy(false) }
  }
  const sync = async () => {
    setBusy(true); setError(''); setNotice('')
    try { const result = await syncUsage(state.csrfToken); await load(0); if (result.failed) setError(`${result.failed} 份原生记录未同步，请重试。`); else setNotice('已同步') }
    catch (error) { setError(error.message) } finally { setBusy(false) }
  }
  return h('div', { className: 'beellix-bootstrap' }, h('div', { className: 'beellix-bootstrap__page' },
    h('header', { className: 'beellix-page-toolbar', 'aria-label':tab === 'prices' ? '模型价格操作' : '用量操作' }, h('button', { type: 'button', disabled: busy, onClick: () => load(offset) }, '刷新')),
    h(OperationFeedback,{error,notice,onErrorDone:()=>setError(''),onNoticeDone:()=>setNotice('')}),
    !state ? h('p', { role: 'status' }, busy ? '读取中…' : '请刷新重试') : tab === 'prices' ? h(Prices, { state, busy, save, targetModel }) : h(Costs, { state, month, setMonth, offset, load, busy, sync, configurePrice })))
}
