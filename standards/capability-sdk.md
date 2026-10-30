# 知识库与数据中台接入 API v1

最低 UI 版本为 `@beellix-ai/dsh-beellix-plugin 0.1.1`。本 API 提供归属登记、独立目录、中台页面接入与可选的插件专用模型适配；不实现知识检索、数据连接、登录收费，也不另装配 Harness。工具、技能、模型和连接包也可按已归属包身份登记，不能借此更改安装分类。专用模型契约、用途分类与验证边界见[模型接入](model-center.md)，类型出口为 `@beellix-ai/dsh-beellix-plugin/platform`。

当前候选的专用模型读接口支持无密钥的 `connection` 元信息、`enabled` 和 `canToggle`；写接口在原 selection 写入之外可单独提交 enabled。未声明启停能力的旧适配器保持只读开关，不能因绘制了开关就声称可用。完整字段、互斥写入、修订规则与兼容边界统一见上述模型接入文档和类型出口，不另建业务模型执行器。

## 声明

知识库示例，数据中台将标识改为 `data-platform`：

```json
{
  "name": "@beellix-ai/knowledge",
  "version": "0.1.1",
  "beellixCapability": {
    "id": "knowledge",
    "category": "resources",
    "ui": {
      "panel": "beellix-knowledge",
      "configPanel": "beellix-knowledge-settings"
    }
  },
  "beellixContract": {
    "schemaVersion": 1,
    "bridge": {"min": 1, "max": 1},
    "contributes": ["resources", "ui", "tools", "skills"],
    "data": {"schemaVersion": 1, "uninstall": "retain"}
  }
}
```

继续声明有效的 DSH `dsh.bundle`、`dsh.client` 和引擎范围。面板 ID 必须为 `beellix-<能力ID>` 或其短横线后缀，不能冒用中台或原生设置面板。包名、版本、类别取已归属环境中的清单，不接受注册调用临时覆盖。

## 宿主接入

以下假设入口位于 `native/host.mjs`：

```js
import {fileURLToPath} from 'node:url'
export const inject=['beellixPlatform','tools','skills']
export async function apply(ctx){
  const connection=await ctx.beellixPlatform.register({
    packageName:'@beellix-ai/knowledge',
    packageDirectory:fileURLToPath(new URL('../',import.meta.url))
  })
  ctx.effect(()=>connection.dispose,'知识库中台接入')
  // 业务存储使用 connection.paths；工具与技能通过 ctx.tools / ctx.skills
  // 的原生接口登记，并在同一原生作用域释放。
}
```

开发期可用 `import type {} from '@beellix-ai/dsh-beellix-plugin/platform'` 获得 Context 类型。类型依赖放在开发依赖，不给业务运行环境再安装一份 UI 引导包。免费和付费包共用本地接入；平台注册不作为购买凭证，不要求在线商业授权服务。

路径由中台计算：`config/capabilities/<id>`、`data/capabilities/<id>`、`files/capabilities/<id>`、`cache/capabilities/<id>`、`knowledge/<id>`。首次接入补目录，不覆盖已有文件；链接、非目录、错误来源、重复连接都拒绝。卸载或释放连接不删除资料。业务包不得把这些路径写成某台电脑的绝对常量。

## 页面接入

客户端通过 DSH 模块加载器正常装配，向 `beellix.platform.capability` 列表槽贡献组件：

```js
export const inject=['slots']
export function apply(ctx){
  ctx.slots.inject('beellix.platform.capability',function*(){
    yield ctx.slots.register({
      name:'beellix.platform.capability',id:'beellix-knowledge'
    },KnowledgePage)
    yield ctx.slots.register({
      name:'beellix.platform.capability',id:'beellix-knowledge-settings'
    },KnowledgeSettings)
  })
}
```

组件owner参数是 `{capabilityId, view, close}`，`view`为`main`或`settings`。当前0.1.1源码中的知识与数据页对已安装、启用、服务就绪的包自动渲染其main贡献，直接展示插件完整功能；不再先显示安装说明卡并要求点击“打开”。主界面close返回中台首页；独立配置仍通过原子槽打开，close返回先前页面。中台保持左侧导航，贡献尚未加载时显示实际缺口，不跳空白页。业务页面沿宿主主题，不内嵌另一套工作区或登录外壳。固定包版本不证明这些源码已被当前客户端采用，须核对摘要与STATUS.md。

当前候选另提供两个可选的客户端参数：`embedded: true` 表示已由中台提供配置入口，业务页不重复显示齿轮；`registerActions(capabilityId, {configure})` 返回清理函数。main 组件可在 React effect 中登记打开当前组件设置的回调，并在卸载时清理。中台顶栏优先调用该回调，保持当前知识空间与阅读状态；未登记时继续沿清单的 `configPanel` 打开，兼容原有贡献。回调只在同一个客户端组件树中使用，不持久化、不跨 HTTP、不代替业务权限。独立知识设置面板渲染自己的原生 Modal，关闭调用 owner.close 返回原页面。

## 数据与执行

业务包自己的本地 HTTP 接口仍沿 DSH WebServer、连接授权和操作令牌；不要由浏览器提交任意系统路径。这里的连接授权是宿主接口访问保护，与商业收费授权不同。模型调用使用原生工具注册与权限管道，详细检索结果按需、有界返回；不把整库、全量表或全部技能正文注入上下文。中台不做代理工具执行器。用户资料在客户环境中保存，模型 API 或本地模型沿 DSH 原配置运行。

本次接入夹具已用真实 DSH ToolRuntime、SkillRegistry 和 Cordis 生命周期验证工具可调用、卸载释放贡献、目录隔离和资料保留。夹具不代表知识库或数据中台的实际业务包已经制作、发布或验收。

知识库业务见知识库插件设计与实施状态。当前源码候选已实现能力依赖声明、业务就绪状态、数据库能力登记、工作进程连接和跨进程备份；旧的已采用包不因此自动获得这些扩展。接入须核验所装服务的 contractVersion、features 与真实状态，不能只比较固定包版本0.1.1。

对话知识开关归 dsh-ui，knowledge 提供空间与查询业务；实际服务、范围撤销及升级验收见[会话知识接入契约](conversation-knowledge-contract.md)。该候选服务为 beellixKnowledgeSessions；不是把知识开关并入通用平台注册 API，也不是业务包再注册一个输入区开关。

## 数据库与备份插件

用户已确定业务存储使用独立 PostgreSQL 插件；此前本地 SQLite 业务库方案取消。DSH 自身的 SQLite / KV、会话、日志保持原职责。

当前 `@beellix-ai/database 0.1.1` 从 UI 0.1.1 的“知识与数据 → 数据库”安装。每个场景＋业务账套独立 PostgreSQL 数据库、受限角色和附件目录；同一账套多个会话共享业务数据。业务包通过原生 Cordis `beellixDatabase` 服务登记，工具与技能仍沿 DSH 原生服务，不把整库加载进上下文。

首版本地官方组件部署、已有本地服务连接、事务迁移、加密备份、另一磁盘或 NAS 副本、恢复到新库和真实恢复验证。云服务尚未选定，状态为“未配置”，没有上传资料；不把逻辑导出称为物理备份或 PITR。

完整使用方法、目录、SDK、限制与验证入口见数据库插件，新应用接入见[公共数据库 SDK](database-plugin-sdk.md)。实际采用与初始化状态见交付状态，不能从 SDK 存在推断任一用户实例已初始化；现有报价场景未迁移。知识候选所需扩展详见 SDK 的能力包与工作进程章节。
