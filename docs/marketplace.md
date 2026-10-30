# DSH 市场适配

社区入口为 `@beellix-ai/dsh-beellix-plugin`，版本0.1.1、MIT。DSH 市场分发社区入口，Beelli X 中台管理业务与能力插件，两者分别维护发行清单和生命周期。

## 已实现

根包声明 `dsh.bundle.patch`、`dsh.client`、顶层 `engines.dsh`，提交对应补丁与预构建 `lib`。源码、必要公共实现、锁文件及开发标准完整公开，可独立构建。运行不需要相邻研发工程，不替换 DSH 执行底座。

验收基线为原生 API 0.2.1-rc.2 / Next 2.0.19-next。Windows 已通过182项独立测试，含官方 Cordis、Tools、Skills 的加载、调用和释放；完整桌面和真实模型另行验收。

Windows / Linux 自动检查模板在 `dev/config/community-checks.yml`，启用方法见[开发指南](development.md)。当前验证记录见[验证说明](verification.md)。

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

当前发行渠道为本 GitHub 仓库；npm 发布和市场收录分别办理并记录结果。npm 正式发行固定版本与制品摘要，已发布版本不覆盖。

规则核验日期：2026-10-30。

- [DSH 官方打包协议](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/develop/basic/publish.md)
- [1024Store 投稿规则](https://github.com/imsai-sh/awesome-deepseek-harness-plugins/blob/main/CONTRIBUTING.md)
- [Awesome DSH 投稿规则](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/blob/main/contributing.md)
- [dshfind 同步规则](https://github.com/hikariming/dshfind#submit-your-plugin)
