# 开发标准

[文档中心](../docs/README.md) · [开发指南](../docs/development.md)

标准版本 **1.1.0**。协议、Schema、包版本与业务数据版本分别管理；文档存在不等于对应服务或业务插件已经交付。

## 从需求到运行

| 阶段 | 规范 |
| --- | --- |
| 确定范围 | [统一开发标准](plugin-development-standard.md)、[任务与验收格式](plugin-development-task.md) |
| 定义工程 | [工程协议](creation-project-contract.md)、[工程Schema](schemas/beellix-project-v1.schema.json) |
| 定义运行包 | [包契约](plugin-contract.md)、[中台加载](managed-package-loading.md) |
| 接入功能 | [公共能力SDK](capability-sdk.md)、[模型](model-center.md)、[会话知识](conversation-knowledge-contract.md) |
| 处理业务数据 | [数据库SDK](database-plugin-sdk.md)、[跨插件约定](cross-plugin-integration.md)、[业务模块](business-modules.md) |
| 公开发行 | [生态准入](ecosystem-conformance.md)、[分发与更新](public-plugin-distribution.md)、[标准演进](plugin-standard-evolution.md) |

## 示例与边界

- [无数据库工具描述](examples/creation/unit-converter.project.json)
- [数据库场景描述](examples/creation/inventory.project.json)
- [业务模块Schema](schemas/beellix-business-v1.schema.json)与[合同模块描述示例](examples/creation/contracts.business.json)

描述示例是检查器输入，不是已经实现的业务应用。静态检查通过仍为 `ready:false`，需要继续构建、安装和运行验收。

社区版沿本机主用户默认授权；多人、组织与远程部署不能从通用契约推定为已支持。主用户全权也不代表自动批准业务写入或向所有会话注入全部知识。
