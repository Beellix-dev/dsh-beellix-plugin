/** BEELLIX 场景业务图形；选择卡片和管理列表共用稳定映射及本地矢量。 */
import type { ReactNode } from 'react'

const icons = {
  general: <path d="m12 2 2.8 7.2L22 12l-7.2 2.8L12 22l-2.8-7.2L2 12l7.2-2.8Z" />,
  quotation: <><rect x="4" y="2.5" width="16" height="19" rx="3" /><path d="M8 6h8M8 10h1m6 0h1M8 14h1m6 0h1M8 18h1m6-4v4" /></>,
  meeting: <><rect x="8" y="2" width="8" height="12" rx="4" /><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8" /></>,
  opportunity: <><path d="M3 3h18l-7 8v8l-4 2V11Z" /><path d="M7 7h10" /></>,
  tender: <><path d="M10 21H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8l5 5v3M13 2v5h5M7 11h4m-4 4h2" /><circle cx="17" cy="16" r="4" /><path d="m15 16 1.5 1.5L19 15m-4 5-1 2m5-2 1 2" /></>,
  order: <><rect x="4" y="4" width="16" height="18" rx="2" /><rect x="8" y="2" width="8" height="4" rx="1.5" /><path d="M8 10h8m-8 4h3m-2 4 2 2 5-5" /></>,
  comparison: <><path d="M12 3v18m-5 0h10M3 6h18M6 6l-4 8h8Zm12 0-4 8h8Z" /><path d="M2 14a4 4 0 0 0 8 0m4 0a4 4 0 0 0 8 0" /></>,
  delivery: <><path d="M2 5h12v12H2Zm12 4h4l4 5v3h-8M18 9v5h4" /><circle cx="6" cy="18" r="2.5" /><circle cx="18" cy="18" r="2.5" /></>,
  matching: <><path d="M2 3h6v7H2Zm14 0h6v7h-6ZM9 15h6v7H9ZM5 10v3h14v-3m-7 3v2" /><path d="M4 6h2m12 0h2m-9 13 1 1 2-2" /></>,
  inventory: <><path d="M2 9h14v13H2ZM2 9l7-4 7 4M9 12v6m-7-9 7 4 7-4M20 15V3m-3 3 3-3 3 3" /></>,
  contract: <><path d="M11 21H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5M7 7h6m-6 4h5m-5 6h2" /><path d="m12 20 1-4 6-6 3 3-6 6Zm5-8 3 3" /></>,
  acceptance: <><path d="M4 22V3m0 0h11l-2 5 2 5H4" /><circle cx="17" cy="17" r="5" /><path d="m14.5 17 1.5 1.5 3.5-3.5" /></>,
  change: <><path d="M3 3h15v15H3Zm4 0v4m4-4v2m-8 6h4m-4 4h2" /><path d="M11 11h10l-3-3m3 3-3 3M21 20H11l3-3m-3 3 3 3" /></>,
  maintenance: <path d="M14 3a6 6 0 0 0-7 8L2.5 17.5a2.8 2.8 0 0 0 4 4L13 17a6 6 0 0 0 8-7l-4 4-4-1-1-4 4-4Z" />,
  quality: <><path d="m12 2 8 3v6c0 5-4 8-8 11-4-3-8-6-8-11V5Z" /><path d="m8 11 3 3 5-6" /></>,
  receivables: <><path d="M9 6h11a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-8M22 12h-5a3 3 0 0 0 0 6h5" /><path d="M2 5h10m-3-3 3 3-3 3" /><circle cx="17" cy="15" r=".6" fill="currentColor" /></>,
  expense: <><path d="M5 2h14v20l-3-2-4 2-4-2-3 2ZM9 6h6m-6 4h6" /><path d="m8 15 2 2 5-4" /></>,
  cost: <><path d="M3 3v16h8M7 14V9m4 3V6m4 3V3" /><circle cx="16" cy="16" r="4" /><path d="m19 19 3 3" /></>,
  service: <><path d="M3 13v-2a9 9 0 0 1 18 0v2M3 12h3v7H3Zm15 0h3v7h-3Zm0 7v2h-5" /><rect x="10" y="19" width="4" height="3" rx="1" /></>,
  recruitment: <><circle cx="9" cy="6" r="4" /><path d="M2 21v-3a7 7 0 0 1 11-5" /><circle cx="17" cy="16" r="4" /><path d="m20 19 2 3" /></>,
  onboarding: <><path d="m2 6 10-4 10 4-10 4Zm4 2v4c4 2 8 2 12 0V8m4-2v6M3 16c3-1 6-1 9 1 3-2 6-2 9-1v6c-3-1-6-1-9 1-3-2-6-2-9-1Zm9 1v6" /></>,
  document: <><path d="M14 2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9ZM14 2v7h7M7 13h10m-10 4h7" /></>,
} satisfies Record<string, ReactNode>

export type ScenarioIconKind = keyof typeof icons
const scenarioKinds: Readonly<Record<string, ScenarioIconKind>> = {
  'meeting-minutes': 'meeting', 'smart-quotation': 'quotation', 'sales-opportunity': 'opportunity',
  'tender-response': 'tender', 'sales-order-review': 'order', 'purchase-comparison': 'comparison',
  'purchase-followup': 'delivery', 'three-way-match': 'matching', 'inventory-replenishment': 'inventory',
  'contract-management': 'contract', 'project-acceptance': 'acceptance', 'engineering-change': 'change',
  'equipment-maintenance': 'maintenance', 'quality-correction': 'quality', 'receivables-collection': 'receivables',
  'expense-review': 'expense', 'project-cost-review': 'cost', 'after-sales-service': 'service',
  'recruitment-assessment': 'recruitment', 'employee-onboarding': 'onboarding',
}

/** 已知场景使用独立业务图形，未登记插件沿原有报价／语音识别保留兼容回退。 */
export function scenarioIconKind(id: string, capabilities: readonly string[] = []): ScenarioIconKind {
  if (!id) return 'general'
  if (Object.hasOwn(scenarioKinds, id)) return scenarioKinds[id]!
  if (/quotation|quote/u.test(id)) return 'quotation'
  if (capabilities.includes('speech') || /meeting/u.test(id)) return 'meeting'
  return 'document'
}

/** 使用系统已有颜色令牌，业务形状是首要识别线索。 */
export function scenarioIconPalette(kind: ScenarioIconKind): 'blue' | 'amber' | 'green' | 'red' {
  if (['quotation', 'receivables', 'expense', 'cost', 'comparison'].includes(kind)) return 'amber'
  if (['meeting', 'maintenance', 'change', 'service'].includes(kind)) return 'red'
  if (['delivery', 'matching', 'inventory', 'acceptance', 'quality', 'onboarding'].includes(kind)) return 'green'
  return 'blue'
}

/** 图标为装饰，场景名称保留为可读和无障碍标签，不重复朗读。 */
export function ScenarioIcon({ kind, size = 20, className, x, y }: { kind: ScenarioIconKind; size?: number; className?: string | undefined; x?: number; y?: number }) {
  return <svg width={size} height={size} x={x} y={y} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" data-scenario-icon={kind} data-palette={scenarioIconPalette(kind)}>{icons[kind]}</svg>
}
