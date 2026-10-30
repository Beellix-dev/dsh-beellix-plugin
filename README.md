# Beelli X 社区中台

基于 DSH 的社区中台插件，提供品牌、工作区与场景导航、自有插件管理、模型配置和会话知识开关。免费 [MIT](LICENSE)，版本 **0.1.1**。

English: A free, MIT-licensed community control center for DeepSeek Harness. It reuses native sessions, tools, skills and execution; business plugins are installed separately.

## 安装

DSH 桌面端打开「插件 → 添加插件」，填入本仓库地址并确认安装。仓库包含预构建 lib 和原生 Bundle，无需修改 DSH 安装文件。若宿主提示需要重启，再重启。

从「更多 → Beelli X 中台」进入并初始化独立资料目录。知识库、数据库和业务场景分别安装，不随本包附送。停用或卸载入口保留资料，DSH 原会话仍由 Profile 保存。

当前 **尚未发布 npm**；市场收录、npm发布与官网上线分别进行。请勿把包名存在当作npm已经可下载。社区版与企业版入口不要同时启用。

## 开发

需要 Node.js 24+ 与 Corepack。Windows 自动化使用 PowerShell 7。

```sh
corepack yarn install --immutable
corepack yarn build
corepack yarn test
corepack yarn check
corepack yarn pack --out plugin.tgz
```

源码在 packages/platform/community，必要公共实现在 dev/shared，开发标准在 [standards](standards/README.md)。这是从统一研发工程导出的独立社区版，不包含企业服务、业务插件、运行资料或凭据。

## 验证范围

DSH原生API基线 **0.2.1-rc.2 / Next 2.0.19-next**。本仓库测试覆盖可独立运行的社区单元测试，以及官方Cordis、Tools、Skills的作用域加载、调用和释放。完整Electron、跨业务包集成和真实模型验收不由这些测试代替。

官网、会员及公网更新尚未上线；未配置服务不会访问示例网站，不影响免费本地功能。

[开发标准](standards/README.md) · [文档](docs/README.md) · [贡献](CONTRIBUTING.md) · [第三方声明](THIRD_PARTY_NOTICES.md)
