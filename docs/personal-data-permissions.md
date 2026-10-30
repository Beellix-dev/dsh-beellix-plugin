# 本机主用户与数据访问

当前产品仅有本机主用户，默认全部授权。沿用 DSH 的 owner 身份和连接校验，不增加人员、角色或插件授权配置。包名和 workspace 只记录调用来源，不能代替人的身份。本约定是社区版当前执行边界。

## 使用与职责

主用户可使用全部已启用插件的业务数据，不需要先建立插件结对或逐账套授权。每个业务库仍独立存储，数据责任仍归业务插件；客户映射、业务审核、事务、幂等和账套选择保留。全权不等于自动批准业务写入，也不等于把所有知识自动塞入每个对话。

中台没有额外“数据权限”页面。知识库开关及所选空间仍是本次任务的输入范围；数据库实例列表仍只提供状态，不因此暴露SQL、凭据或文件路径。后续若引入其他实际使用者，必须先接真实身份，再按人的权限扩展；当前不实现或宣称多人权限。

## 运行契约 v1

入口是 `ctx.beellixData`，类型见 [platform-api.d.ts](../packages/platform/community/src/platform-api.d.ts)。实现为 [local-data-access.mjs](../dev/shared/runtime/local-data-access.mjs)。

- `register({packageName, packageDirectory, accounts, resources})`：核对安装归属、目录、启用状态和资源命名空间。业务包只登记自己的资源及真实账套。
- `forAgent(agent).catalog()`：主用户默认可用所有已启用提供方资源及其支持的动作；新增或恢复的账套同样可用。目录只给摘要，不自动加载所有输入契约。
- `describe(resource)`：按需读一个资源的输入契约。
- `call({resource, action, accountId, input}, {signal})`：通过业务函数执行，不接受自报用户、权限、直接SQL或路径；不存在的账套或不支持的动作仍拒绝。
- `guard(agent, packet, run, {signal})`：原有工具也经过同一真实Agent、会话及提供方检查。写入前及结果交付前调用 `scope.validate()`，传递 `scope.signal`；卸载释放句柄。

`beellix_data` 复用 DSH ToolRuntime，不另建Agent循环或消息日志。此本机入口只运行在已鉴权的DSH主用户环境，actor.principal为owner；来自宿主的真实Agent对象及可信场景绑定，不能从模型参数指定。子代理仍继承原执行只读约束及根会话知识选择；场景丢失不能冒充普通工作区。该入口不是另一个多人身份系统，也不是防恶意本地代码的操作系统隔离。

## 资源声明示例（业务包分别安装）

| 资源 | 动作 | 业务约束 |
| --- | --- | --- |
| inventory.business | 读取、写入、导出 | 包含财务；写入沿现有原生逐项审核 |
| sales-crm.business | 读取、写入 | 沿原生审核、事务与幂等 |
| knowledge.content | 读取 | 沿会话开关及空间选择；明确的整理任务另有原任务范围 |
| database.instances | 读取 | 实例状态和最近备份时间；不含数据库管理指令 |

## 旧资料与验收

不读取、迁移或删除上一轮 `config/permissions/policies.json`。旧CRM／进销存窄接口仅做兼容，其原文件和业务映射保留；新统一入口不依赖这些连接。访问元数据继续写入原 `data/permissions/audit.jsonl`，不写业务正文或密钥。
