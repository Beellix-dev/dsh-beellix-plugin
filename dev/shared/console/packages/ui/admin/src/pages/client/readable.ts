/** 后台名称投影：内部标识只用于关联和技术详情。 */
import type { AdminAuditEvent, AdminSession, AdminState } from './controller.ts'
import type { AdminKey } from './locales.ts'
type Translate = (key: AdminKey) => string

export function sessionName(row: AdminSession, t: Translate): string {
  if (row.title) return row.title
  const time = new Intl.DateTimeFormat(undefined, { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(row.updatedAt)
  return `${t(row.parentId ? 'console.child' : 'console.untitled')} · ${time}`
}

export function auditAction(action: string, t: Translate): string {
  const names: Record<string, AdminKey> = {
    'ai.session.read':'console.sessionRead','ai.session.export':'console.sessionExport',
    'organization.department.deleted': 'enterprise.departmentDeleted', 'organization.group.deleted': 'enterprise.groupDeleted',
    'organization.group.updated': 'enterprise.groupChanged', 'authorization.business_role.deleted': 'enterprise.roleDeleted',
    'organization.department.created': 'enterprise.createDepartment', 'organization.department.updated': 'enterprise.departmentChanged',
    'organization.memberships.replaced': 'enterprise.membershipChanged', 'authorization.business_role.created': 'enterprise.createRole',
    'authorization.business_role.updated': 'enterprise.roleChanged', 'authorization.business_rules.replaced': 'enterprise.rulesChanged',
    'authorization.role.assigned': 'enterprise.roleAssigned', 'authorization.role.revoked': 'enterprise.roleRevoked',
    'identity.user.created': 'console.userCreated', 'identity.admin.bootstrapped': 'console.userCreated',
    'identity.user.status_changed': 'console.userStatus', 'identity.user.password_reset': 'console.passwordReset',
    'authorization.user_roles.replaced': 'console.userRoles', 'authorization.group_members.replaced': 'console.groupMembers',
    'authorization.group_roles.replaced': 'console.groupRoles', 'authorization.group.created': 'console.groupCreated', 'authorization.role.created': 'console.roleCreated',
    'skill.content.read': 'inventory.skillsAudit',
    'plugin.control.updated': 'console.configChanged', 'plugin.settings.updated': 'console.configChanged',
  }
  return t(names[action] ?? (/login|sign.?in/iu.test(action) ? 'console.signIn' : /logout|sign.?out/iu.test(action) ? 'console.signOut' : /config|setting|publish/iu.test(action) ? 'console.configChanged' : 'console.otherEvent'))
}

export function auditActor(row: AdminAuditEvent, state: AdminState, t: Translate): string {
  if (!row.actorUserId) return t('console.systemActor')
  return state.users.find(user => user.id === row.actorUserId)?.displayName
    ?? (row.actorUserId === state.principal?.user.id ? state.principal.user.displayName : t('console.unavailableUser'))
}

export function auditTarget(row: AdminAuditEvent, state: AdminState, t: Translate): string {
  if(row.action.startsWith('ai.session.')){const subject=state.users.find(user=>user.id===row.details.subjectUserId);return (subject?.displayName??t('console.unavailableUser'))+' · '+t('console.aiSessions')}
  if (row.action === 'skill.content.read' && typeof row.details.skill === 'string') return row.details.skill
  const user = state.users.find(user => user.id === row.targetId)
  if (user) return user.displayName
  const role = state.roles.find(role => role.id === row.targetId)
  if (role) return role.system && role.name === 'Administrator' ? t('accounts.administrator') : role.name
  const group = state.groups.find(group => group.id === row.targetId)
  if (group) return group.name
  if (typeof row.details.displayName === 'string') return row.details.displayName
  if (typeof row.details.email === 'string') return row.details.email
  if (typeof row.details.name === 'string') return row.details.name
  const names: Record<string, AdminKey> = { user: 'nav.users', role: 'nav.roles', group: 'nav.groups', plugin: 'nav.packages', settings: 'nav.pluginSettings', configuration: 'nav.pluginSettings', model: 'nav.models', connection: 'nav.connections' }
  return t(names[row.targetType ?? ''] ?? 'console.otherEvent')
}
