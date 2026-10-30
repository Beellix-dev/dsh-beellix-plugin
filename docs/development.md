# 开发指南

[文档中心](README.md) / 开发

## 环境与命令

需要 Node.js **24+**、Corepack 和 Git；运行插件的宿主要求与开发环境要求分别声明。Windows 构建和测试使用 PowerShell 7。

```sh
git clone https://github.com/Beellix-dev/dsh-beellix-plugin.git
cd dsh-beellix-plugin
corepack yarn install --immutable
corepack yarn build
corepack yarn test
corepack yarn check
corepack yarn pack --out plugin.tgz
```

依赖和锁文件属于本仓库，不依赖相邻私有工程或 DSH 安装目录中的 `node_modules`。不要在 `packages/platform/community` 内另建一套依赖。

## 目录导航

| 目录 | 用途 |
| --- | --- |
| `packages/platform/community/src` | 入口、页面、API 适配、会话及创造模式源码 |
| `packages/platform/community/scripts` | 客户端、运行文件与随包标准的构建 |
| `packages/platform/community/test` | 可在本仓库独立运行的社区测试 |
| `dev/shared` | 实际被社区中台引用的公共代码与组件 |
| `dev/scripts` | 独立构建、检查与测试入口 |
| `test` | 通过已发布官方 DSH 包执行的原生接口测试 |
| `standards` | 开发契约、Schema、示例和持续维护规范 |
| `lib` | 已构建的安装入口；GitHub 安装需要，不能当作无用缓存删除 |

公共 store 的现有可读 JavaScript 输入保存在 `dev/shared/console/packages/client/store/lib/index.js`；这是当前实际构建输入，不宣称另有未提交的 TypeScript 源码。

## 常见修改

| 任务 | 先看 |
| --- | --- |
| 修改中台页面 | `console-page.tsx`、`model-center.tsx`、`package-manager.tsx` |
| 修改场景导航或会话绑定 | `scene-sidebar.mjs`、`scenes.mjs`、`scene-api.mjs` |
| 修改资料目录 | `layout.mjs`；保留旧标记和既有目录 |
| 接入插件模型用途 | `plugin-models.mjs` 与[模型契约](../standards/model-center.md) |
| 开发新的业务包 | [统一开发标准](../standards/plugin-development-standard.md)，不要塞入入口包 |
| 调整随包开发规则 | 同步规范、Skill、检查器、示例及快照构建 |

## 提交与验收

先复现问题并保留有效回归，再做范围明确的修改。静态检查、原生接口、完整桌面、真实模型和业务质量是不同验证层次，不互相冒充。

只在独立测试目录和配置中验收。不要覆盖个人 Profile、旧会话、业务资料或密钥，不修改原版 DSH 源码证明兼容。插件版本保持0.1.1；维护者批准新版本前不自行递增，也不覆盖已经发布的同名同版本 npm 包。

自动检查模板为 `dev/config/community-checks.yml`。维护者启用时，将其保存为 `.github/workflows/check.yml` 并提交；仓库需具备 Actions 运行条件。当前模板尚未启用，测试范围见[验证说明](verification.md)。贡献流程见 [CONTRIBUTING](../CONTRIBUTING.md)。

公开发行前可执行 `node dev/scripts/audit-public.mjs --history`，检查完整公开文件集合及已有 Git 历史中的高可信敏感模式；工具只报告文件或对象位置，不回显疑似密钥。
