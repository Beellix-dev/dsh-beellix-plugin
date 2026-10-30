<p align="center"><img src="https://raw.githubusercontent.com/Beellix-dev/dsh-beellix-plugin/main/dev/assets/icon.svg" width="72" height="72" alt="Beelli X" /></p>

<h1 align="center">Beelli X 社区中台</h1>

<p align="center">把模型、插件与场景工作，接入你的 DSH 工作台。</p>

<p align="center"><strong>社区版 0.1.1</strong> · <a href="LICENSE">MIT 开源</a> · DSH 原生扩展</p>

<p align="center"><a href="docs/getting-started.md">开始使用</a> · <a href="docs/features.md">功能说明</a> · <a href="docs/development.md">参与开发</a> · <a href="docs/README.md">文档中心</a></p>

---

Beelli X 是安装在 **DeepSeek Harness（DSH）客户端中的社区中台插件**。它提供统一的配置与应用入口，让用户管理模型、安装扩展，并在工作区与场景之间切换；对话、工具执行、技能和子代理继续由 DSH 原生底座负责。

适合使用 DSH 的个人用户，以及为 DSH 开发工具、能力包和场景应用的开发者。本仓库是本机主用户使用的社区版，**不包含企业服务器、组织账号或多人权限系统**。

## 可以做什么

| 能力 | 使用方式 |
| --- | --- |
| 工作区与场景 | 保留 DSH 原生工作区；已安装场景使用独立导航和会话归属，按当前场景接入工具与工作台 |
| 模型配置 | 管理主模型与自定义连接；按插件声明集中配置专用模型，不为每个用途重复建立入口 |
| 插件管理 | 从本地安装包或已发布的 npm 包安装自有扩展，查看状态、启停和详情 |
| 知识与数据 | 为知识库、数据库等能力提供安装和页面接入位置；实际业务由对应插件提供 |
| 已归档对话 | 查看、恢复及按需清理已归档的 DSH 对话 |
| 创造模式 | 在符合启用条件的新创造会话中，按需提供 Beelli X 开发标准、技能和静态检查工具 |

知识库、数据库、报价及其他场景**不随本包附送**。它们能否安装和使用，以对应安装包、依赖及实际初始化状态为准。账户余额与价格也以提供方支持为准，详见[配置说明](https://github.com/Beellix-dev/dsh-beellix-plugin/blob/main/docs/configuration.md)。

## 开始使用

1. 在 DSH 中打开 **插件 → 添加插件**，填写仓库地址：

   ```text
   https://github.com/Beellix-dev/dsh-beellix-plugin
   ```

2. 确认来源并安装；若 DSH 提示需要重启，重启后从 **更多 → Beelli X 中台** 进入。
3. 在首页初始化资料目录，或选择原有的 Beelli X 资料目录，再按需配置模型和安装扩展。

仓库已包含供 DSH 加载的预构建 `lib` 和 Bundle 补丁，普通用户无需先编译源码。**当前尚未发布 npm，不能直接把包名当作已上线安装源。**

完整步骤及版本要求见[安装与首次使用](https://github.com/Beellix-dev/dsh-beellix-plugin/blob/main/docs/getting-started.md)。社区版与企业版入口不要同时启用。

## 数据由谁管理

**DSH 保存原生对话，Beelli X 管理独立的插件资料目录。** 初始化不会把旧会话改造成另一套消息记录，也不会自动合并业务资料。停用或卸载入口默认保留资料；换路径、恢复和备份需要分别核验。

本地存储不意味着所有操作离线：调用模型 API、下载 npm 包或访问提供方账单页面时会联网。具体的数据边界见[数据与隐私](https://github.com/Beellix-dev/dsh-beellix-plugin/blob/main/docs/data-and-privacy.md)。

## 兼容与验证

| 项目 | 当前范围 |
| --- | --- |
| 原生接口基线 | DSH `0.2.1-rc.2` / Next `2.0.19-next` |
| 包兼容声明 | `>=0.2.1-rc.2 <0.3.0`；声明范围不代表每一版均已实测 |
| 独立源码验证 | Windows 安装、构建及182项测试；含官方工具、技能的作用域加载、调用与释放 |
| 安装包验证 | npm、pnpm 隔离安装与宿主入口加载 |
| 尚未完成 | Linux CI、完整桌面逐版验收、真实模型任务、公网 npm 与市场收录 |

官网账号验证和公网更新服务尚未接通，不以模拟结果表示已上线。验证方式与限制见[验证说明](https://github.com/Beellix-dev/dsh-beellix-plugin/blob/main/docs/verification.md)。

## 文档与贡献

| 我想…… | 从这里开始 |
| --- | --- |
| 安装和初始化 | [开始使用](https://github.com/Beellix-dev/dsh-beellix-plugin/blob/main/docs/getting-started.md) |
| 了解每个页面的用途 | [功能说明](https://github.com/Beellix-dev/dsh-beellix-plugin/blob/main/docs/features.md) |
| 配置主模型、插件模型和费用查询 | [配置说明](https://github.com/Beellix-dev/dsh-beellix-plugin/blob/main/docs/configuration.md) |
| 了解目录、备份和卸载影响 | [数据与隐私](https://github.com/Beellix-dev/dsh-beellix-plugin/blob/main/docs/data-and-privacy.md) |
| 排查安装或连接问题 | [常见问题](https://github.com/Beellix-dev/dsh-beellix-plugin/blob/main/docs/troubleshooting.md) |
| 理解架构或修改源码 | [架构](https://github.com/Beellix-dev/dsh-beellix-plugin/blob/main/docs/architecture.md) · [开发指南](https://github.com/Beellix-dev/dsh-beellix-plugin/blob/main/docs/development.md) |
| 开发自己的插件 | [开发标准](https://github.com/Beellix-dev/dsh-beellix-plugin/blob/main/standards/README.md) · [贡献规则](https://github.com/Beellix-dev/dsh-beellix-plugin/blob/main/CONTRIBUTING.md) |

发现问题请提交 [Issue](https://github.com/Beellix-dev/dsh-beellix-plugin/issues)，提供版本、复现步骤和脱敏错误信息。涉及密钥或隐私的问题按[安全说明](https://github.com/Beellix-dev/dsh-beellix-plugin/blob/main/SECURITY.md)处理。

## 开源许可

社区中台及本仓库自有代码采用 [MIT](LICENSE)。第三方代码、图标和品牌保留原有署名与许可，见[第三方声明](THIRD_PARTY_NOTICES.md)。Beelli X 是独立社区项目，不是 DeepSeek 官方客户端发行版。
