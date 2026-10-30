<p align="center"><img src="https://raw.githubusercontent.com/Beellix-dev/dsh-beellix-plugin/main/dev/assets/icon.svg" width="72" height="72" alt="Beelli X" /></p>

<h1 align="center">Beelli X 社区中台</h1>

<p align="center">Harness-Based Agentic Data Engineering</p>

<p align="center"><strong>社区版 0.1.1</strong> · <a href="LICENSE">MIT 开源</a> · DSH 原生扩展</p>

<p align="center"><a href="docs/getting-started.md">开始使用</a> · <a href="docs/features.md">功能说明</a> · <a href="docs/development.md">参与开发</a> · <a href="docs/README.md">文档中心</a></p>

---

以数据中台为核心，基于 Harness 执行底座，通过插件化能力驱动个人、团队与企业的 AI 场景应用，构建数据互通的智能执行闭环，实现能力持续复用与生态演进。

**插件化扩展 · 场景能力复用 · 社区共创 · 数据能力互通**

本仓库提供 Beelli X 的 **DSH 社区中台入口**。安装后，可在 DSH 中统一管理模型、扩展插件与场景工作；对话、工具执行、技能和子代理沿用 DSH 原生服务。产品体系及各部分职责见[产品概览](https://github.com/Beellix-dev/dsh-beellix-plugin/blob/main/docs/product-overview.md)。

## 可以做什么

| 能力 | 使用方式 |
| --- | --- |
| 工作区与场景 | 在 DSH 工作区与场景之间切换，使用对应会话、工具与业务工作台 |
| 模型配置 | 集中管理主模型、自定义 API 连接与插件专用模型 |
| 插件管理 | 从本地安装包或已发布的 npm 包安装自有扩展，查看状态、启停和详情 |
| 知识与数据 | 通过扩展包接入知识库、数据库等数据能力，在中台统一管理 |
| 已归档对话 | 查看、恢复及按需清理已归档的 DSH 对话 |
| 创造模式 | 提供 Beelli X 插件开发标准、开发技能与工程检查工具 |

## 快速开始

1. 在 DSH 中打开 **插件 → 添加插件**，填写仓库地址：

   ```text
   https://github.com/Beellix-dev/dsh-beellix-plugin
   ```

2. 确认来源并安装；若 DSH 提示需要重启，重启后从 **更多 → Beelli X 中台** 进入。
3. 在首页初始化资料目录，或选择原有的 Beelli X 资料目录，再按需配置模型和安装扩展。

完整步骤、安装渠道与版本要求见[安装与首次使用](https://github.com/Beellix-dev/dsh-beellix-plugin/blob/main/docs/getting-started.md)。

## 文档与贡献

| 我想…… | 从这里开始 |
| --- | --- |
| 了解 Beelli X 产品体系 | [产品概览](https://github.com/Beellix-dev/dsh-beellix-plugin/blob/main/docs/product-overview.md) |
| 安装和初始化 | [开始使用](https://github.com/Beellix-dev/dsh-beellix-plugin/blob/main/docs/getting-started.md) |
| 了解每个页面的用途 | [功能说明](https://github.com/Beellix-dev/dsh-beellix-plugin/blob/main/docs/features.md) |
| 配置主模型、插件模型和费用查询 | [配置说明](https://github.com/Beellix-dev/dsh-beellix-plugin/blob/main/docs/configuration.md) |
| 了解目录、备份和卸载影响 | [数据与隐私](https://github.com/Beellix-dev/dsh-beellix-plugin/blob/main/docs/data-and-privacy.md) |
| 排查安装或连接问题 | [常见问题](https://github.com/Beellix-dev/dsh-beellix-plugin/blob/main/docs/troubleshooting.md) |
| 理解架构或修改源码 | [架构](https://github.com/Beellix-dev/dsh-beellix-plugin/blob/main/docs/architecture.md) · [开发指南](https://github.com/Beellix-dev/dsh-beellix-plugin/blob/main/docs/development.md) |
| 开发自己的插件 | [开发标准](https://github.com/Beellix-dev/dsh-beellix-plugin/blob/main/standards/README.md) · [贡献规则](https://github.com/Beellix-dev/dsh-beellix-plugin/blob/main/CONTRIBUTING.md) |

发现问题请提交 [Issue](https://github.com/Beellix-dev/dsh-beellix-plugin/issues)，提供版本、复现步骤和脱敏错误信息。涉及密钥或隐私的问题按[安全说明](https://github.com/Beellix-dev/dsh-beellix-plugin/blob/main/SECURITY.md)处理。

## 开源许可

社区中台及本仓库自有代码采用 [MIT](LICENSE)。第三方代码、图标和品牌保留原有署名与许可，见[第三方声明](THIRD_PARTY_NOTICES.md)。Beelli X 由社区独立维护。
