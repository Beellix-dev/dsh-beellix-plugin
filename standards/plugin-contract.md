# 自有插件接入契约 v1

开发根为 `Beellix_Plugins`，源码位于 packages 分类目录。DSH 管执行、权限、Agent、压缩、子代理及原生资源装配；本工程管理品牌、导航、中台、自有包和场景业务归属。固定兼容验证基线为 DSH `0.2.1-rc.2`，Next 来源见 UI 包 README。不宣称整个 `<0.3.0` 范围均完成实机验证。

## 安装位置与归属

UI 引导包通过 DSH 的“添加插件”安装到当前 Profile。自有业务包通过 Beelli X 中台导入 `.tgz`，安装到初始化目录的 `environment/node_modules`；配置、业务、附件及本地归档分别保存在 `config`、`data`、`files`、`environment/packages`。业务包只登记在中台，不再写入 DSH 独立 Bundle 清单，由 DSH 原生 Loader 按其声明加载。停用 UI 也不重新显示业务包的市场管理入口。分类和旧登记迁移见[中台插件安装与分类](managed-package-loading.md)。不修改 DSH 安装文件，不另外实现执行引擎。

## 包清单

保留 DSH 的 `dsh.bundle`、`dsh.client` 和顶层 `engines.dsh` 原生声明。旧工程的 `dsh.engines.dsh` 仅兼容读取，不能作为宿主已执行兼容检查的证据；发行时使用顶层字段，不自动迁移既有清单。新增 `beellixContract`：

```json
{
  "schemaVersion": 1,
  "bridge": { "min": 1, "max": 1 },
  "contributes": ["ui", "tools", "skills"],
  "data": { "schemaVersion": 1, "uninstall": "retain" },
  "execution": {
    "basePreset": "standard",
    "context": "bound-scene",
    "subagents": "read-only"
  }
}
```

`execution` 是场景包必填项。场景包还声明稳定的 `beellixScenario.id`、显示名称 `title` 与右侧槽类型 `tabKind`；其他能力包声明 `beellixCapability.id/category`。版本取包自身 `version`，不从文件夹名称推断。

旧交付包没有契约字段时保留兼容，按既有数据版本 1 处理，不改写原清单。不兼容的新契约在导入时拒绝；已有业务包升级导致数据版本改变时，在撤销原生登记前停止。当前没有通用业务迁移器，不能用安装覆盖代替迁移；数据结构变更需另行实现、备份并验证迁移方案。

## 安装事务与恢复

安装、升级和卸载先保存环境与登记备份，再写 `data/control-plane/addon-operation.json`，通过 DSH 原生服务执行。成功标记完成；失败恢复依赖环境、中台登记、原生登记和原启停状态。首次安装失败也清除本次失败登记。

进程中断或回退失败保留 pending 日志；下次读取中台状态、接回或变更前继续恢复。发现外部同名登记或异常日志时停止，不擅自撤销。业务数据和本地安装包始终保留；恢复失败不会伪报成功。

## 场景与上下文

工作区沿 DSH 原四种模式；新场景为原生 `standard` 加当前可信绑定包。工具和技能只在匹配的原生 Agent 作用域注册，按需开放详细工具。子作用域继承父会话的业务引用，写入在服务端拒绝。普通工作区不得获得场景资源。上下文仅提供当前场景身份、版本及技能指引，不注入全部已安装包正文。

场景入口与原生会话是两种记录：移除入口只改变 added，不删除 links、绑定、对话或业务。归档和重命名使用原生状态、控制器及对话框；不另建一套会话日志。插件变化与联网恢复统一触发导航刷新，刷新不得切换旧会话预设。

## 验证边界

交付前按授权改动范围运行实际构建、测试、目录检查及最终包验证；例如仅UI维护使用 `node scripts/build.mjs --only=dsh-ui`、`corepack yarn test --only=dsh-ui`，不顺带构建冻结业务包。`corepack yarn check`包含对固定Next原生声明的编译探针和文档路由。测试用隔离目录及安全浏览器启动参数，按改动覆盖真实DSH ToolRuntime、SkillRegistry、作用域、保留资料和恢复；全局检查仅在实际执行且通过时声明。

这些检查不等同于真实模型自主委派或当前日常客户端已更新。候选版本、安装包摘要、实际采用和外部模型验收分别记录；不能以构建通过替代实机采用。

## 创造模式与后续标准

本文件描述当前已实现的运行包契约。用户确认的 Beelli X 创造模式、用户工程、生态依赖、开发校验及交付流程见创造模式标准 v1。其 beellix.project.json 已接入开发静态检查，不改变当前 beellixContract v1，也不代表通用依赖门禁或业务迁移协调器已经实现。可操作规范见[插件开发标准](plugin-development-standard.md)。
