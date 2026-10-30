/** 本版工作区的能力说明；不是安装登记或运行状态。README 维护详细约束。 */
import { capabilityAuditGroups, type CapabilityCategory, type CapabilityTopic } from './capability-audit.ts'

/** 分类顺序由职责审计清单统一维护。 */
export { capabilityCategories } from './capability-audit.ts'

import { definitions } from './package-identities.generated.ts'

/** 界面与完整说明采用相同的能力分类顺序。 */
export const capabilityGroups = ['core', 'models', 'execution', 'files', 'web', 'orchestration', 'context', 'sessions', 'security', 'extensions', 'interfaces', 'ui', 'platform', 'engineering'] as const

const audits = new Map<string, (typeof capabilityAuditGroups)[number]>(capabilityAuditGroups.flatMap(group => group.names.map(name => [`@beellix-ai/${name}`, group] as const)))

/** 能力目录的包身份。 */
export type CapabilityName = keyof typeof definitions
/** 能力说明的本地化键。 */
export type CapabilityKey = `capability.${CapabilityName}`
/** 目录所用的分类标识。 */
export type CapabilityGroup = (typeof definitions)[CapabilityName]['group']
/** 目录所用的实际包类型。 */
export type CapabilityKind = (typeof definitions)[CapabilityName]['kind']
/** 目录条目的说明、管理归属与审计结果。 */
export interface CapabilityEntry {
  name: CapabilityName
  path: string
  group: CapabilityGroup
  kind: CapabilityKind
  ownership: 'foundation' | 'business'
  contributes: readonly string[]
  configuration: { readonly href: string } | null
  management: 'builtin' | 'extension' | 'technical'
  displayZh?: string | undefined
  displayEn?: string | undefined
  zh: string
  en: string
  category: CapabilityCategory
  topic: CapabilityTopic
  auditReason: string
}

/** 只读能力目录；不推导是否启用或可卸载。 */
export const capabilityCatalog: readonly CapabilityEntry[] = Object.entries(definitions).map(([name, data]) => {
  // 工作区与审计名单的一一对应由能力目录检查拒绝遗漏和重复。
  const audit = audits.get(name)!
  return { name: name as CapabilityName, ...data, category: audit.category, topic: audit.id, auditReason: audit.reason }
})
/** 管理页面消费的中文能力词典。 */
export const capabilityZh = Object.fromEntries(capabilityCatalog.map(item => [`capability.${item.name}`, item.zh])) as Record<CapabilityKey, string>
/** 管理页面消费的英文能力词典。 */
export const capabilityEn = Object.fromEntries(capabilityCatalog.map(item => [`capability.${item.name}`, item.en])) as Record<CapabilityKey, string>

/** 卡片名称属于展示词典；包标识及运行管理身份保持原值。 */
export const capabilityTitleZh = Object.fromEntries(capabilityCatalog.map(item => [`capabilityTitle.${item.name}`, item.displayZh ?? item.name.replace(/^@beellix-ai\//, '')])) as Record<`capabilityTitle.${CapabilityName}`, string>
/** 英文卡片名称使用同一包标识索引。 */
export const capabilityTitleEn = Object.fromEntries(capabilityCatalog.map(item => [`capabilityTitle.${item.name}`, item.displayEn ?? item.name.replace(/^@beellix-ai\//, '')])) as Record<`capabilityTitle.${CapabilityName}`, string>
