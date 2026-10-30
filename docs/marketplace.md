# DSH 市场适配

社区入口为 `@beellix-ai/dsh-beellix-plugin`，版本0.1.1、MIT。只发布社区中台；知识库、数据库和场景另由 Beelli X 中台管理。

## 已实现

根包声明 `dsh.bundle.patch`、`dsh.client`、顶层 `engines.dsh`，提交对应补丁与预构建 `lib`。源码、必要公共实现、锁文件及开发标准完整公开，可独立构建。运行不需要相邻研发工程，不替换 DSH 执行底座。

验收基线为原生 API 0.2.1-rc.2 / Next 2.0.19-next。Windows 已通过182项独立测试，含官方 Cordis、Tools、Skills 的加载、调用和释放；完整桌面和真实模型另行验收。

Windows / Linux 自动检查模板在 `dev/config/community-checks.yml`。当前上传凭据没有 GitHub workflow 权限，模板尚未启用，Linux CI 尚未验证。维护者可将模板放入 `.github/workflows/check.yml` 启用；未执行的检查不计为通过。

## 收录条件

| 目录 | 必需步骤 | 当前限制 |
| --- | --- | --- |
| 1024Store | 公共源码、真实 Bundle、`dsh-plugin` topic、中英文客观说明，提交一份 catalog/plugins JSON | 尚未提交；npm 发布前可浏览，不提供 npm 安装 |
| Awesome DSH | 工作代码、Bundle、topic、合理分类，提交一份 data/plugins YAML | 新仓库须创建满一天；需维护者审核 |
| dshfind | 公共仓库添加 `dsh-plugin` topic | 每日同步，不能把添加 topic 当作已收录 |

本插件选择 `ui` 分类：自身提供导航、配置与运行协调，不是只有依赖清单的聚合包。分类与客观功能说明可随实际能力维护。

条目说明：

- 中文：为 DeepSeek Harness 提供模型配置、自有插件管理和工作区／场景导航的社区中台。
- English: A community control center for DeepSeek Harness with model configuration, managed plugin lifecycle, and workspace and scene navigation.

**npm 尚未发布，市场尚未批准收录。** 不将本地测试或 GitHub 上传视为上述步骤完成；同名同版本不能覆盖发布。

规则核验日期：2026-10-30。

- [DSH 官方打包协议](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/develop/basic/publish.md)
- [1024Store 投稿规则](https://github.com/imsai-sh/awesome-deepseek-harness-plugins/blob/main/CONTRIBUTING.md)
- [Awesome DSH 投稿规则](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/blob/main/contributing.md)
- [dshfind 同步规则](https://github.com/hikariming/dshfind#submit-your-plugin)
