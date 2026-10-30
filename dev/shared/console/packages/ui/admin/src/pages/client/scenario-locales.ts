export const sceneZh = {
  'scene.unavailableUser': '已移除的用户',
  'scene.search': '搜索场景', 'scene.status': '状态', 'scene.allStatuses': '全部状态', 'scene.enabled': '已启用', 'scene.disabled': '已停用',
  'scene.name': '场景', 'scene.version': '版本', 'scene.scope': '使用范围', 'scene.permissions': '使用权限', 'scene.allUsers': '全体用户可用',
  'scene.selectedUsers': '指定用户可用', 'scene.noUsers': '暂不开放', 'scene.searchUsers': '搜索用户', 'scene.chooseUsers': '请至少选择一名用户',
  'scene.noUsersMatch': '没有匹配的用户', 'scene.usersUnavailable': '没有读取用户列表的权限', 'scene.noMatch': '没有匹配的场景',
  'scene.empty': '当前运行环境尚未加载场景包', 'scene.loadFailed': '场景列表加载失败，请刷新重试', 'scene.loading': '正在读取场景列表…',
} as const
export const sceneEn: Record<keyof typeof sceneZh, string> = {
  'scene.unavailableUser': 'Removed user',
  'scene.search': 'Search scenarios', 'scene.status': 'Status', 'scene.allStatuses': 'All statuses', 'scene.enabled': 'Enabled', 'scene.disabled': 'Disabled',
  'scene.name': 'Scenario', 'scene.version': 'Version', 'scene.scope': 'Who can use', 'scene.permissions': 'Usage permissions', 'scene.allUsers': 'All users',
  'scene.selectedUsers': 'Selected users', 'scene.noUsers': 'Not open to users', 'scene.searchUsers': 'Search users', 'scene.chooseUsers': 'Select at least one user',
  'scene.noUsersMatch': 'No matching users', 'scene.usersUnavailable': 'You cannot read the user directory', 'scene.noMatch': 'No matching scenarios',
  'scene.empty': 'No scenario packages are loaded in this environment', 'scene.loadFailed': 'Unable to load scenarios. Refresh to retry.', 'scene.loading': 'Loading scenarios…',
}
