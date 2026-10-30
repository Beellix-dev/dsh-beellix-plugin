# Beelli X 社区中台

`@beellix-ai/dsh-beellix-plugin` · **0.1.1** · [MIT](LICENSE)

在 DSH 桌面客户端中提供 Beelli X 品牌、工作区与场景导航、中台、自有插件管理、模型配置和会话知识开关。执行、对话、工具、技能与子代理继续使用 DSH 原生服务。

## 安装与使用

1. 在 DSH「插件 → 添加插件」中填写本地 `.tgz` 安装包路径，确认安装；宿主提示需要重启时再重启。
2. 从「更多 → Beelli X 中台」进入，首次使用选择并初始化资料目录。
3. 在中台管理需要的插件，在工作区使用原生模式，或切到场景区使用已安装场景。

当前为本地发行候选，尚未发布到公网 npm。正式发布后，同一添加入口可填写 `@beellix-ai/dsh-beellix-plugin@0.1.1`。请勿同时启用社区版与企业版入口。

知识库、数据库及业务场景需分别安装，不包含在本包内；安装、启用和初始化状态以中台实际显示为准。普通聊天与图片沿 DSH 主模型链路，插件专用模型在中台配置。

## 数据与恢复

DSH 原生对话仍由当前 Profile 保存；Beelli X 插件环境、业务数据、知识资料、文件、配置与备份保存在初始化时选定的资料目录。两者独立，不自动迁移旧会话或旧业务数据。

停用或卸载入口保留资料。重新安装后接回原资料目录，沿宿主加载已登记的业务插件；不要删除或覆盖原资料目录。场景归属由显式会话绑定维护，不根据文件执行目录推断。

## 兼容与边界

原生接口验证基线为 Next **2.0.19-next / DSH 0.2.1-rc.2**，Node.js 22+。兼容声明由 `package.json` 的 `engines.dsh` 提供；声明范围不代替逐版验证，未宣称最新版客户端完整桌面验收通过。

官网账号、会员和公网更新服务尚未上线；免费本地功能不要求官网账号。未配置的服务如实显示不可用，不访问示例网站或代用户创建账号。

## 开发

本工程使用 Node.js 24+、Yarn 4.18.0 和 PowerShell 7。在完整插件源码工程根执行：

```powershell
corepack yarn install --immutable
corepack yarn workspace @beellix-ai/dsh-beellix-plugin build
corepack yarn test --only=community
corepack yarn pack:plugins --only=community
corepack yarn check:packages --only=community
```

源码位于 `packages/platform/community`；安装包位于 `dist/platform`，具体文件与摘要查 `dist/packages.json`。开发标准 **1.1.0** 随包提供给创造模式；业务数据不会因标准升级而自动转换。

第三方声明见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
