/** 从各工作区 package.json 的 beellix 声明生成；运行状态与授权仍由服务端负责。勿手改。 */
export const definitions = {
  "@beellix-ai/acp": {
    "path": "packages/harness/acp/builtin/acp",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "interfaces",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "面向程序化客户端与维护者的仅自动化 Agent Client Protocol 服务器，用于通过 JSON-RPC stdio 驱动 DeepSeek Harness agent。",
    "en": "Automation-only Agent Client Protocol server for driving BEELLIX Harness agents over JSON-RPC stdio"
  },
  "@beellix-ai/acp-app": {
    "path": "packages/harness/bundle/acp-app",
    "ownership": "foundation",
    "kind": "bundle",
    "group": "platform",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "面向启动持久 harness agent 的用户与维护者，说明纯自动化 ACP stdio 应用 profile。",
    "en": "The dsh ACP profile bundle: automation-only JSON-RPC stdio and process lifecycle over dsh-base"
  },
  "@beellix-ai/admin-setting-contract": {
    "path": "packages/harness/settings/builtin/admin-setting-contract",
    "ownership": "foundation",
    "kind": "library",
    "group": "sessions",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "定义管理员配置贡献、修订和生效结果的公开协议，不保存配置。",
    "en": "Public protocol for administration setting contributions, revisions and applied results; stores no configuration."
  },
  "@beellix-ai/admin-settings": {
    "path": "packages/harness/settings/builtin/admin-settings",
    "ownership": "foundation",
    "kind": "library",
    "group": "sessions",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "组合已批准的配置贡献，协调配置修订、存储和实际生效读回。",
    "en": "Compose approved setting contributions and coordinate revisions, persistence and applied-value observations."
  },
  "@beellix-ai/after-sales-service": {
    "path": "packages/scenarios/after-sales-service",
    "ownership": "business",
    "kind": "plugin",
    "group": "extensions",
    "management": "extension",
    "contributes": [
      "tools",
      "skills",
      "ui"
    ],
    "configuration": null,
    "zh": "售后服务的资料、专业核对、人员复核、产物与后续记录。",
    "en": "After-sales service workbench.",
    "displayZh": "售后服务",
    "displayEn": "After-sales service"
  },
  "@beellix-ai/agent": {
    "path": "packages/harness/core/agent",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "core",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "提供 Agent 句柄、实时实例注册与运行事件，供界面和编排器控制任务。",
    "en": "Agent interface, registry, initiator scope, and event vocabulary for the BEELLIX Harness"
  },
  "@beellix-ai/agent-default-model": {
    "path": "packages/harness/core/agent-default-model",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "core",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": {
      "href": "/admin/models"
    },
    "zh": "为新建 Agent 选择部署默认模型。",
    "en": "Default model selection shared by Agent entry points"
  },
  "@beellix-ai/agent-instructions": {
    "path": "packages/harness/context/builtin/agent-instructions",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "context",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "发现、加载和刷新工作区 AGENTS.md 与 CLAUDE.md 指令。",
    "en": "Workspace context loader for AGENTS.md/CLAUDE.md instruction files"
  },
  "@beellix-ai/agent-loop": {
    "path": "packages/harness/core/agent-loop",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "core",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": {
      "href": "/admin/plugin-settings/agent-loop"
    },
    "zh": "驱动 Agent 轮次与步骤，串联模型请求和工具执行。",
    "en": "The concrete agent loop plugin for the BEELLIX Harness"
  },
  "@beellix-ai/agent-loop-testkit": {
    "path": "packages/testing/harness/agent-loop-testkit",
    "ownership": "foundation",
    "kind": "library",
    "group": "engineering",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "为运行具体 AgentLoop 的测试挂载共享服务先决依赖，面向接线真实循环前置依赖的测试作者。",
    "en": "Shared prerequisite mounting for tests that exercise the concrete agent loop"
  },
  "@beellix-ai/agent-package-contract": {
    "path": "packages/agent-package/contract",
    "ownership": "foundation",
    "kind": "library",
    "group": "extensions",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "校验能力包清单、连接、策略、运行配置与发布数据，拒绝未知字段和危险资源路径。",
    "en": "Validate package manifests, connections, policies, profiles and publications; reject unknown fields and unsafe resource paths."
  },
  "@beellix-ai/agent-package-runtime-loader": {
    "path": "packages/agent-package/runtime-loader",
    "ownership": "foundation",
    "kind": "library",
    "group": "extensions",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "校验制品并提供隔离 Worker 加载，保留原工具结果、Skills 和提示注册；可信代码不等同安全沙箱。",
    "en": "Validate artifacts and isolate trusted business execution in workers while retaining native tool, skill and prompt contracts."
  },
  "@beellix-ai/agent-package-sdk": {
    "path": "packages/agent-package/sdk",
    "ownership": "foundation",
    "kind": "sdk",
    "group": "extensions",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "提供能力包与工具的编写辅助函数，复用现有 Harness，不启动独立 Agent Loop。",
    "en": "Package and tool authoring helpers using the existing Harness without starting another Agent Loop."
  },
  "@beellix-ai/agent-package-validator": {
    "path": "packages/agent-package/validator",
    "ownership": "foundation",
    "kind": "library",
    "group": "extensions",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "导入前检查能力包文件、资源、兼容版本和摘要，并暂存受信任制品；摘要不是签名。",
    "en": "Validate package files, resources, engine versions and digests, then stage trusted artifacts; a digest is not a signature."
  },
  "@beellix-ai/agent-presets": {
    "path": "packages/harness/preset/builtin/agent-presets",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "core",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "按预设配置组合每个会话的 Agent，提供预设发现与管理。",
    "en": "Per-session agent composition from preset cordis.yml files for the BEELLIX Harness"
  },
  "@beellix-ai/agent-tool-presentation": {
    "path": "packages/harness/core/agent-tool-presentation",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "core",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "选择工具在模型侧的调用与编排呈现方式。",
    "en": "Agent-plane presentation selector: composes one agent's tools as PTC mode, native, or both"
  },
  "@beellix-ai/anonymous-user-id": {
    "path": "packages/harness/identity/anonymous-user-id",
    "ownership": "foundation",
    "kind": "library",
    "group": "security",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "面向用户与维护者的匿名按 harness home 身份说明，用于追踪遥测、反馈确认与 DeepSeek 提供方请求如何关联记录。",
    "en": "Shared anonymous user identity for BEELLIX Harness telemetry and feedback correlation"
  },
  "@beellix-ai/api-gateway": {
    "path": "packages/harness/api/builtin/gateway",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "interfaces",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "带类型的 Client 到 Host 调用与 stream：分派、校验、取消、重连与转发的 Host 事件。",
    "en": "Typert Remote Host dispatcher and Client API endpoint"
  },
  "@beellix-ai/api-remotes": {
    "path": "packages/harness/api/builtin/remotes",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "interfaces",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "应用 Remote 装配：为 Client 消费方选择带类型的 Host 能力与转发事件。",
    "en": "Remote BFF assembly for application-selected Host capabilities"
  },
  "@beellix-ai/api-session-controller": {
    "path": "packages/harness/api/builtin/session-controller",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "interfaces",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "Host 与 Client 会话控制：创建、恢复、提示、跟随历史并投影实时会话状态。",
    "en": "Session Remote commands, cold reads, and live control transport"
  },
  "@beellix-ai/api-settings-controller": {
    "path": "packages/harness/api/builtin/settings-controller",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "interfaces",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "settings 与凭据配置界面的 Host Remote owner，涵盖脱敏读取、写入、凭据引用与原生文档打开。",
    "en": "Remote owner for the configuration surfaces over the settings-domain seams"
  },
  "@beellix-ai/api-workspace-controller": {
    "path": "packages/harness/api/builtin/workspace-controller",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "interfaces",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "Host 与 Client 工作区控制：修改工作区导航并跟随其完整投影。",
    "en": "Workspace Remote commands and reconnect-safe state transport"
  },
  "@beellix-ai/api-workspace-files": {
    "path": "packages/harness/api/builtin/workspace-files",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "files",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "工作区文件列表、读取与交付接口。",
    "en": "Workspace listing, read and delivery API."
  },
  "@beellix-ai/app-boot": {
    "path": "packages/harness/boot/app-boot",
    "ownership": "foundation",
    "kind": "library",
    "group": "platform",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "dsh profile 与临时 Python SDK 运行时的共享 Loader 启动支持：环境层、patch、诊断与配置预览。",
    "en": "Shared boot glue for the app bins: .env loading, fail-loud Loader guards, snapshot-aware config resolution, and the Loader boot sequence"
  },
  "@beellix-ai/atomic-write": {
    "path": "packages/shared/node/atomic-write",
    "ownership": "foundation",
    "kind": "library",
    "group": "platform",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "原子文件替换与跨进程写锁，供绝不允许在磁盘上留下不完整、被符号链接劫持或权限过宽内容的包使用。",
    "en": "Zero-dependency atomic file replacement: exclusive-create random-suffix temp + rename carrying the caller-stated permissions (writeFileAtomic)"
  },
  "@beellix-ai/attachment": {
    "path": "packages/harness/attachment/builtin/attachment",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "context",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "持久图片附件，供用户与维护者在提示词与命令中附加、复用或排查图片。",
    "en": "Durable immutable attachment storage seam for the BEELLIX Harness"
  },
  "@beellix-ai/attachment-local": {
    "path": "packages/harness/attachment/builtin/attachment-local",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "context",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "DSH_HOME 下附加图片的本地存储，供用户与维护者选择或排查图片附件的存放位置。",
    "en": "Private content-addressed DSH_HOME attachment storage"
  },
  "@beellix-ai/authorization": {
    "path": "packages/harness/credentials/builtin/authorization",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "security",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "面向用户与维护者的授权 flow 注册表：获取配置无法提供的凭据，因为拿到它需要与人对话。",
    "en": "Authorization seam (ctx.authorization): plugin-owned flows that obtain a credential through a conversation with the human"
  },
  "@beellix-ai/base": {
    "path": "packages/harness/bundle/base",
    "ownership": "foundation",
    "kind": "bundle",
    "group": "platform",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "共享的 dsh 核心：为每个 dsh --profile 表层提供模型访问、工具、持久会话与安全默认值，供用户组合或定制 profile。",
    "en": "The shared dsh core as a profile bundle: the first patch layer of base-backed profiles, inserting core rows over the empty profile root"
  },
  "@beellix-ai/bash-local": {
    "path": "packages/harness/shell/builtin/bash-local",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "execution",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "在宿主运行普通 Bash 命令，本身不提供进程隔离。",
    "en": "Local-subprocess implementation of the BEELLIX Harness bash executor seam"
  },
  "@beellix-ai/bash-sandbox": {
    "path": "packages/harness/shell/builtin/bash-sandbox",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "execution",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "按共享沙箱策略执行受限 Bash 命令，保留拒绝与升权信息。",
    "en": "Sandbox-consuming implementation of the BEELLIX Harness bash executor seam (confines every command via ctx.sandbox, reports denial/enforcement result facts)"
  },
  "@beellix-ai/brand": {
    "path": "packages/shared/common/brand",
    "ownership": "foundation",
    "kind": "library",
    "group": "platform",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "供拥有易混淆领域值的包使用的名义字符串与数字类型及无状态构造函数。",
    "en": "Stateless branded primitive types for the BEELLIX Harness"
  },
  "@beellix-ai/browser": {
    "path": "packages/harness/web/builtin/browser",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "web",
    "management": "builtin",
    "contributes": [
      "tools",
      "services"
    ],
    "configuration": null,
    "zh": "在当前DSH原生网页按身份与版本受控读取、点击、滚动及发送，不启动独立浏览器。",
    "en": "Read the current DSH native browser without launching another engine.",
    "displayZh": "DSH浏览器",
    "displayEn": "DSH browser access"
  },
  "@beellix-ai/chunked-list": {
    "path": "packages/shared/common/chunked-list",
    "ownership": "foundation",
    "kind": "library",
    "group": "platform",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "维护分块列表数据结构。",
    "en": "Chunked list data structure."
  },
  "@beellix-ai/cli": {
    "path": "apps/harness/original-cli",
    "ownership": "foundation",
    "kind": "application",
    "group": "interfaces",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "通过 dsh 命令启动指定 profile，管理配置层与插件组合包。",
    "en": "Launch selected profiles and manage profile layers and bundles through dsh."
  },
  "@beellix-ai/client-connection": {
    "path": "packages/client/connection",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "ui",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "连接浏览器与宿主 RPC、事件流和 HTTP 路由，处理断线重连。",
    "en": "Authenticated RPC transport, generation lifecycle, and browser fixture"
  },
  "@beellix-ai/client-executor": {
    "path": "packages/client/executor",
    "ownership": "foundation",
    "kind": "library",
    "group": "platform",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "本机文件、进程、终端、浏览器、LSP、插件与设备通道执行器，不装配智能体循环。",
    "en": "Persistent device execution mechanisms."
  },
  "@beellix-ai/client-file-upload": {
    "path": "packages/client/file-upload",
    "ownership": "foundation",
    "kind": "library",
    "group": "interfaces",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "客户端文件上传状态和传输。",
    "en": "Client upload state and transport."
  },
  "@beellix-ai/client-hmr": {
    "path": "packages/client/hmr",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "ui",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "在开发时热重载浏览器插件，保留应用外壳。",
    "en": "Dev-only hot-reload driver for script-loaded client entries: SSE rebuilt frames → invalidate/prefetch → fiber swap through the vendored Loader entry"
  },
  "@beellix-ai/client-modules": {
    "path": "packages/client/modules",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "ui",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "生成客户端模块启动图，在浏览器按需加载插件产物。",
    "en": "Client module system, dual-face: node half composes the __DSH_BOOT__ entry graph (incremental dsh.client scan, bundle route, index tap, webPlugins service); browser half is the lazy-CJS module table the vendored cordis Loader consumes as its internal seam"
  },
  "@beellix-ai/client-resources": {
    "path": "packages/client/resources",
    "ownership": "foundation",
    "kind": "library",
    "group": "interfaces",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "客户端资源状态与访问接口。",
    "en": "Client resource state and access."
  },
  "@beellix-ai/client-store": {
    "path": "packages/client/store",
    "ownership": "foundation",
    "kind": "library",
    "group": "ui",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "提供具有明确快照、订阅和生命周期的浏览器状态存储。",
    "en": "React-free observable and snapshot-store contracts with the shared Zustand/Immer engine"
  },
  "@beellix-ai/client-test-runtime": {
    "path": "packages/testing/client/client-runtime",
    "ownership": "foundation",
    "kind": "library",
    "group": "engineering",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "面向浏览器功能测试的 jsdom slot 测试运行时，供测试作者针对生产机制检验 slot、store 与渲染。",
    "en": "jsdom slot test runtime: real Cordis Context + SlotRegistry + UI renderer with test-owned session/workspace doubles for feature specs"
  },
  "@beellix-ai/cloud-execution": {
    "path": "packages/harness/execution/builtin/cloud-execution",
    "ownership": "foundation",
    "kind": "library",
    "group": "platform",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "Harness 云端工具通道，不装配智能体循环。",
    "en": "Execution integration library."
  },
  "@beellix-ai/cmdline": {
    "path": "packages/harness/boot/cmdline",
    "ownership": "foundation",
    "kind": "library",
    "group": "platform",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "dsh app bin 的应用自有命令行：应用从启动器剩余参数中解析自己的 flag、--help 与退出行为。",
    "en": "Immutable command-line handoff from a dsh launcher to any app plugin that injects cmdlineArgs"
  },
  "@beellix-ai/code-runtime": {
    "path": "packages/harness/code-runtime/builtin/code-runtime",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "execution",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "抽象代码执行 seam（`ctx.codeRuntime`），供用户与维护者组合、消费或构建后端，以针对宿主提供的绑定运行一段模型编写的程序。",
    "en": "Abstract code-execution seam (ctx.codeRuntime) for the BEELLIX Harness"
  },
  "@beellix-ai/code-runtime-worker-thread": {
    "path": "packages/harness/code-runtime/builtin/code-runtime-worker-thread",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "execution",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "Worker 线程代码执行，供用户与维护者组合、调优或排查这个已发布的 TypeScript 后端——它在全新的 Node worker 中运行每个程序。",
    "en": "Worker-thread implementation of the BEELLIX Harness code-execution seam"
  },
  "@beellix-ai/command-compact": {
    "path": "packages/harness/compaction/builtin/command-compact",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "context",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "面向交互式组合的按需 /compact 命令：它做什么、你会看到什么，以及如何挂载。",
    "en": "Human-facing slash command for explicit session compaction"
  },
  "@beellix-ai/command-feedback": {
    "path": "packages/harness/feedback/builtin/command-feedback",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "sessions",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "通过 `/feedback` 命令记录自由文本会话反馈，供用户与维护者选择、组合或排查反馈采集。",
    "en": "Log-only session feedback producer and human-facing slash command"
  },
  "@beellix-ai/command-goal": {
    "path": "packages/harness/goal/builtin/command-goal",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "orchestration",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "面向在 UI 命令平面中选择、组合或排查 goal 控制的用户与维护者的 /goal 斜杠命令说明。",
    "en": "Human-facing slash command for persisted same-session goals"
  },
  "@beellix-ai/commands": {
    "path": "packages/harness/interaction/builtin/commands",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "security",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "面向交互式 UI 的人类斜杠命令注册表：插件拥有的命令直接针对 agent 执行，不产生模型消息；供组合或扩展命令面的用户与维护者阅读。",
    "en": "Plugin-owned human command registry for BEELLIX Harness UIs"
  },
  "@beellix-ai/compaction": {
    "path": "packages/harness/compaction/builtin/compaction",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "context",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "面向后端实现者与部署方的共享压缩约定：会话压缩做什么、何时使用，以及如何实现后端。",
    "en": "Abstract compaction service seam (ctx.compaction) for the BEELLIX Harness"
  },
  "@beellix-ai/compaction-basic": {
    "path": "packages/harness/compaction/builtin/compaction-basic",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "context",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "面向部署方的自动会话压缩：选择、调优或排查随 token 压力上升如何把较早历史摘要为总结。",
    "en": "Token-meter-driven compaction policy and LLM summarization backend for the BEELLIX Harness"
  },
  "@beellix-ai/compaction-image-offload": {
    "path": "packages/harness/context/builtin/compaction-image-offload",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "context",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "持久保存图片卸载决策并在会话重放时恢复投影。",
    "en": "Durable image offload and replay projection."
  },
  "@beellix-ai/compaction-tool-result-pruner": {
    "path": "packages/harness/compaction/builtin/compaction-tool-result-pruner",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "context",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "面向组合压缩的部署方的工具输出修剪：选择大小限制或排查超大工具结果为何被缩短。",
    "en": "Replay-safe model-free head/middle/tail pruning for tool-result surface nodes"
  },
  "@beellix-ai/contract-management": {
    "path": "packages/scenarios/contract-management",
    "ownership": "business",
    "kind": "plugin",
    "group": "extensions",
    "management": "extension",
    "contributes": [
      "tools",
      "skills",
      "ui"
    ],
    "configuration": null,
    "zh": "合同管理的资料、专业核对、人员复核、产物与后续记录。",
    "en": "Contract management workbench.",
    "displayZh": "合同管理",
    "displayEn": "Contract management"
  },
  "@beellix-ai/control-plane-core": {
    "path": "packages/control-plane/core",
    "ownership": "foundation",
    "kind": "library",
    "group": "security",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "管理账户、用户、角色、群组、浏览器会话、审计及发布登记；登记不等于运行采用。",
    "en": "Accounts, users, roles, groups, browser sessions, audit and release records; registration is not runtime adoption."
  },
  "@beellix-ai/control-plane-resources": {
    "path": "packages/control-plane/resources",
    "ownership": "foundation",
    "kind": "library",
    "group": "sessions",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "管理企业知识与数据连接、资源授权和导入任务；存储事务由应用注入。",
    "en": "Enterprise knowledge, data connections, resource authorization and ingestion jobs with application-provided storage transactions."
  },
  "@beellix-ai/cordis": {
    "path": "vendor/cordis",
    "ownership": "foundation",
    "kind": "library",
    "group": "platform",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "提供插件上下文、服务依赖注入、事件和效果生命周期。",
    "en": "Plugin contexts, service dependency injection, events and effect lifecycles."
  },
  "@beellix-ai/cordis-client-runner": {
    "path": "packages/harness/extensions/development/cordis-client-runner",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "extensions",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "动态 Cordis 包的浏览器半说明，供选择、组合或排查页面如何应答运行请求并装载浏览器半代码的用户与维护者阅读。",
    "en": "Browser half of dynamic dual-half plugin packages: event subscription, closure evaluation, guard facade, and loader entries"
  },
  "@beellix-ai/cordis-host-runner": {
    "path": "packages/harness/extensions/development/cordis-host-runner",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "extensions",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "动态 Cordis 包的 host 半说明，供选择、组合或排查注册表、沙箱与运行往返的 agent 与维护者阅读。",
    "en": "Dynamic package definition registry, host-half sandbox lifecycle, and invoke handler table for model-mounted dual-half packages"
  },
  "@beellix-ai/cordis-plugin-group": {
    "path": "vendor/group",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "platform",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "把多个插件组织为嵌套配置组并共享组作用域。",
    "en": "Organize plugins in nested configuration groups with a shared group scope."
  },
  "@beellix-ai/cordis-plugin-hmr": {
    "path": "vendor/hmr",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "platform",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "提供开发热更新，在源文件变化后重载宿主插件。",
    "en": "Development hot reload for host plugins after source changes."
  },
  "@beellix-ai/cordis-plugin-include": {
    "path": "vendor/include",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "platform",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "将其他配置文件纳入插件树，组合 profile 配置层。",
    "en": "Include configuration files in the plugin tree and compose profile layers."
  },
  "@beellix-ai/cordis-plugin-loader": {
    "path": "vendor/loader",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "platform",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "读取插件配置，管理插件加载、依赖等待与卸载。",
    "en": "Read plugin configuration and manage loading, dependency waiting and disposal."
  },
  "@beellix-ai/cordis-plugin-logger-console": {
    "path": "vendor/logger-console",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "platform",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "将 Cordis 日志输出到控制台。",
    "en": "Export Cordis logs to the console."
  },
  "@beellix-ai/cordis-plugin-timer": {
    "path": "vendor/timer",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "platform",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "提供随插件生命周期释放的定时器和间隔任务。",
    "en": "Timers and intervals disposed with the owning plugin."
  },
  "@beellix-ai/cosmokit": {
    "path": "vendor/cosmokit",
    "ownership": "foundation",
    "kind": "library",
    "group": "platform",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "提供对象、数组、异步处理等通用 JavaScript 辅助函数。",
    "en": "Common JavaScript utilities for objects, arrays and asynchronous operations."
  },
  "@beellix-ai/credentials": {
    "path": "packages/harness/credentials/builtin/credentials",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "security",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "面向用户与维护者的凭据 seam：在不把机密值写进配置的前提下解析、描述或存储凭据——引用值与持久化记录。",
    "en": "Abstract credential seam (ctx.credentials): settings carry references to secrets, providers own the values"
  },
  "@beellix-ai/credentials-local": {
    "path": "packages/harness/credentials/builtin/credentials-local",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "security",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "面向用户与维护者的文件型凭据提供方：选择、配置或排查本地凭据存储及其环境分层。",
    "en": "File-backed credentials provider ($DSH_HOME/.env under the live process environment) for the BEELLIX Harness"
  },
  "@beellix-ai/deepseek-account": {
    "path": "packages/harness/credentials/extensions/deepseek-account",
    "ownership": "foundation",
    "kind": "library",
    "group": "security",
    "management": "technical",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "上游账号服务抽象与任务撤销契约；企业入口不自动启用。",
    "en": "Fixed upstream provider compatibility contract."
  },
  "@beellix-ai/deepseek-llm-api-extensions": {
    "path": "packages/harness/llm/extensions/deepseek-llm-api-extensions",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "models",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "为官方 DeepSeek 请求注册额外 API 字段。",
    "en": "Additive request-field registry for the official DeepSeek LLM API adapter"
  },
  "@beellix-ai/deque": {
    "path": "packages/shared/common/deque",
    "ownership": "foundation",
    "kind": "library",
    "group": "platform",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "供 Host 和浏览器包使用的环形双端队列，提供摊销常数时间的队列操作、已移除条目的即时释放和有界空闲存储。",
    "en": "Zero-dependency circular deque with amortized constant-time end operations and bounded vacant storage"
  },
  "@beellix-ai/desktop": {
    "path": "apps/desktop",
    "ownership": "foundation",
    "kind": "application",
    "group": "platform",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "个人桌面宿主、内部 Harness 生命周期与受限本机交互。",
    "en": "Personal desktop host and internal Harness lifecycle."
  },
  "@beellix-ai/device-execution": {
    "path": "packages/harness/execution/builtin/device-execution",
    "ownership": "foundation",
    "kind": "library",
    "group": "platform",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "Harness 本机工具适配，调用受授权设备执行器。",
    "en": "Execution integration library."
  },
  "@beellix-ai/dsh-ui": {
    "path": "packages/plugins/dsh-ui",
    "ownership": "business",
    "kind": "plugin",
    "group": "ui",
    "management": "extension",
    "contributes": [
      "ui",
      "services"
    ],
    "configuration": null,
    "zh": "DSH 原生中台引导包与配套目录管理",
    "en": "DSH bootstrap and persistent directory management",
    "displayZh": "Beelli X 中台",
    "displayEn": "Beelli X"
  },
  "@beellix-ai/e2b": {
    "path": "packages/harness/sandbox/extensions/e2b",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "execution",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "E2B 文件与命令工作的共享远程 Linux 沙箱：配置、生命周期，以及启动与关闭时会发生什么。",
    "en": "Shared E2B sandbox lifecycle for BEELLIX Harness provider adapters"
  },
  "@beellix-ai/employee-onboarding": {
    "path": "packages/scenarios/employee-onboarding",
    "ownership": "business",
    "kind": "plugin",
    "group": "extensions",
    "management": "extension",
    "contributes": [
      "tools",
      "skills",
      "ui"
    ],
    "configuration": null,
    "zh": "入职培训的资料、专业核对、人员复核、产物与后续记录。",
    "en": "Employee onboarding and training workbench.",
    "displayZh": "入职培训",
    "displayEn": "Employee onboarding and training"
  },
  "@beellix-ai/engineering-change": {
    "path": "packages/scenarios/engineering-change",
    "ownership": "business",
    "kind": "plugin",
    "group": "extensions",
    "management": "extension",
    "contributes": [
      "tools",
      "skills",
      "ui"
    ],
    "configuration": null,
    "zh": "工程变更的资料、专业核对、人员复核、产物与后续记录。",
    "en": "Engineering change workbench.",
    "displayZh": "工程变更",
    "displayEn": "Engineering change"
  },
  "@beellix-ai/enterprise-knowledge": {
    "path": "packages/plugins/enterprise-knowledge",
    "ownership": "business",
    "kind": "plugin",
    "group": "extensions",
    "management": "extension",
    "contributes": [
      "skills"
    ],
    "configuration": null,
    "zh": "连接独立 RAG 服务，使用 OS 授权、版本与原文引用。",
    "en": "RAG adapter with OS authorization, version control and source citations.",
    "displayZh": "企业知识检索",
    "displayEn": "Enterprise knowledge"
  },
  "@beellix-ai/equipment-maintenance": {
    "path": "packages/scenarios/equipment-maintenance",
    "ownership": "business",
    "kind": "plugin",
    "group": "extensions",
    "management": "extension",
    "contributes": [
      "tools",
      "skills",
      "ui"
    ],
    "configuration": null,
    "zh": "设备维护的资料、专业核对、人员复核、产物与后续记录。",
    "en": "Equipment maintenance workbench.",
    "displayZh": "设备维护",
    "displayEn": "Equipment maintenance"
  },
  "@beellix-ai/example-contract-review": {
    "path": "examples/agent-packages/contract-review",
    "ownership": "foundation",
    "kind": "example",
    "group": "engineering",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "演示合同关键词检查、工具结果表和 JSON 下载；不是法律判断或已安装生产插件。",
    "en": "Example contract keyword checks, result tables and JSON downloads; not legal analysis or an installed production plugin."
  },
  "@beellix-ai/execution-contract": {
    "path": "packages/shared/execution-contract",
    "ownership": "foundation",
    "kind": "library",
    "group": "platform",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "云端和设备的公共执行封套、结果与版本契约，不包含执行实现。",
    "en": "Shared execution protocol contracts."
  },
  "@beellix-ai/execution-router": {
    "path": "packages/harness/execution/builtin/execution-router",
    "ownership": "foundation",
    "kind": "library",
    "group": "platform",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "Harness 会话执行目标与设备路由。",
    "en": "Execution integration library."
  },
  "@beellix-ai/executor-profile": {
    "path": "apps/harness/executor-profile",
    "ownership": "foundation",
    "kind": "application",
    "group": "platform",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "受控容器内的独立云端工具执行入口，不启动 Harness Loop。",
    "en": "Isolated cloud tool execution entry."
  },
  "@beellix-ai/expense-review": {
    "path": "packages/scenarios/expense-review",
    "ownership": "business",
    "kind": "plugin",
    "group": "extensions",
    "management": "extension",
    "contributes": [
      "tools",
      "skills",
      "ui"
    ],
    "configuration": null,
    "zh": "报销审核的资料、专业核对、人员复核、产物与后续记录。",
    "en": "Expense review workbench.",
    "displayZh": "报销审核",
    "displayEn": "Expense review"
  },
  "@beellix-ai/experimental-agent-team": {
    "path": "packages/harness/experimental/agent-team",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "engineering",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "在一个会话中运行一个小型具名 agent 团队：成员之间的持久消息与共享任务板，供组合实验性 Team 插件的部署方阅读。",
    "en": "Implicit-root Agent Teams roster, durable peer mailbox, and shared task DAG"
  },
  "@beellix-ai/experimental-agent-team-profile": {
    "path": "packages/harness/experimental/agent-team-profile",
    "ownership": "foundation",
    "kind": "bundle",
    "group": "engineering",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "叠加在 dsh-base 上的私有 Agent Teams profile 层，供源码 checkout 用户使用 Team-scoped 协作工具，同时保留一次性 delegation。",
    "en": "Private profile bundle enabling Agent Teams over dsh-base"
  },
  "@beellix-ai/experimental-auto-review": {
    "path": "packages/harness/experimental/auto-review",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "security",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "按当前任务授权审查单次工具调用，企业权限和执行环境限制继续生效。",
    "en": "Per-call authorization review retaining enterprise and execution boundaries."
  },
  "@beellix-ai/experimental-code-runtime-python": {
    "path": "packages/harness/experimental/code-runtime-python",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "engineering",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "CPython 子进程代码 runtime：为 Python 模型代码实现 dsh-code-runtime seam，及其使用的 fd-3 wire 协议。",
    "en": "CPython subprocess implementation of the BEELLIX Harness code-execution seam"
  },
  "@beellix-ai/experimental-tool-agent-team": {
    "path": "packages/harness/experimental/tool-agent-team",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "engineering",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "九个让模型创建、发消息与协调 teammate 的工具，供组合实验性 Team 插件的部署方阅读。",
    "en": "Scoped model-facing Agent Teams tools over ctx.agentTeams"
  },
  "@beellix-ai/experimental-webworker-packer": {
    "path": "packages/harness/experimental/webworker-packer",
    "ownership": "foundation",
    "kind": "library",
    "group": "engineering",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "面向构建或排查实验性预览部署的维护者，说明浏览器 worker VFS 镜像打包。",
    "en": "Build-time packer for the browser runtime's base VFS image and ordered data-overlay archives"
  },
  "@beellix-ai/experimental-webworker-runtime": {
    "path": "packages/harness/experimental/webworker-runtime",
    "ownership": "foundation",
    "kind": "library",
    "group": "engineering",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "面向构建或排查实验性 Web 预览运行时的维护者，说明浏览器 worker 中的 harness 托管。",
    "en": "Browser-only harness runtime: in-memory VFS, module transform and loader, postMessage tunnel, and the dedicated Web Worker assembly, with the Node-compatibility layer that lets the host tree run unchanged"
  },
  "@beellix-ai/file-reference": {
    "path": "packages/harness/context/builtin/file-reference",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "context",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "面向宿主驱动 UI 的文件引用发现与 @file mention 语法，供选择该 seam 或为其搭配提供方的用户与维护者阅读。",
    "en": "File-reference discovery contract and shared @file grammar"
  },
  "@beellix-ai/file-reference-local": {
    "path": "packages/harness/context/builtin/file-reference-local",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "context",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "面向用户与维护者的本地工作区 @file 补全提供方，用于启用、设置大小或排查 ctx.fileReferences 的发现能力。",
    "en": "Local-filesystem ctx.fileReferences provider with bounded fuzzy indexes"
  },
  "@beellix-ai/fs": {
    "path": "packages/harness/fs/builtin/fs",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "files",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "提供统一文件系统服务，允许选择本地或沙箱实现。",
    "en": "Abstract filesystem capability seam (ctx.fs) for the BEELLIX Harness — vocabulary types, the FileSystem service (text IO + optional version-guarded atomic mutations), and the fs/* policy event vocabulary"
  },
  "@beellix-ai/fs-e2b": {
    "path": "packages/harness/fs/extensions/fs-e2b",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "execution",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "共享远程沙箱内的文件操作：agent 可以在那里对文件做什么、何时使用，以及可以期待什么——面向 E2B 家族的部署方与维护者。",
    "en": "E2B filesystem implementation for BEELLIX Harness"
  },
  "@beellix-ai/fs-local": {
    "path": "packages/harness/fs/builtin/fs-local",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "files",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "通过统一文件接口读写宿主文件系统。",
    "en": "Local-filesystem implementation of the BEELLIX Harness filesystem seam (ctx.fs)"
  },
  "@beellix-ai/fs-observation-policy": {
    "path": "packages/harness/fs/builtin/fs-observation-policy",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "files",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "检查文件编辑前的读取记录，保护基于过期观察的写入。",
    "en": "File-context policy plugin for the BEELLIX Harness — observed-state, read-before-edit, and version-guarded write/edit added over the ctx.fs provider seam through the fs/* event gate (no service API)"
  },
  "@beellix-ai/fs-sandbox": {
    "path": "packages/harness/fs/builtin/fs-sandbox",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "files",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "把模型文件访问限制在配置允许的沙箱路径内。",
    "en": "Sandbox-enforcing implementation of the BEELLIX Harness filesystem seam: fences write/edit by the per-call sandbox mode (read-only denies mutation, workspace-write contains it to the workspace + temp roots) while reads pass through"
  },
  "@beellix-ai/goal": {
    "path": "packages/harness/goal/builtin/goal",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "orchestration",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "面向选择、配置或排查同会话持久 goal 服务的用户与维护者：每会话一个持久的完成目标。",
    "en": "Event-sourced same-session goal state and lifecycle service for the BEELLIX Harness"
  },
  "@beellix-ai/goal-round-driver": {
    "path": "packages/harness/goal/builtin/goal-round-driver",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "orchestration",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "面向选择、组合或排查自动 Goal Round 的用户与维护者的同会话续行驱动器说明。",
    "en": "Race-fenced same-session goal-round driver"
  },
  "@beellix-ai/harness-package-host": {
    "path": "packages/harness/extensions/builtin/package-host",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "extensions",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": {
      "href": "/admin/plugin-settings/package-host"
    },
    "zh": "向现有 Harness 注册可信能力包的工具、Skills 和提示片段。",
    "en": "Register trusted package tools, skills and prompts with the existing Harness."
  },
  "@beellix-ai/harness-runtime": {
    "path": "apps/harness",
    "ownership": "foundation",
    "kind": "application",
    "group": "platform",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "完整 Harness 的 Web、CLI、SDK 与 ACP 应用装配入口。",
    "en": "Full Harness assembly for Web, CLI, SDK and ACP."
  },
  "@beellix-ai/harness-source-profile": {
    "path": "apps/harness/source-profile",
    "ownership": "foundation",
    "kind": "application",
    "group": "platform",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "隔离的源码回放与恢复验收入口，不是日常 Web 服务。",
    "en": "Isolated source replay and recovery verification, not the product Web service."
  },
  "@beellix-ai/harness-web-profile": {
    "path": "apps/harness/web-profile",
    "ownership": "foundation",
    "kind": "application",
    "group": "platform",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "装配正式 Web Harness、标准预设、持久终端与会话提醒。",
    "en": "Product Web Harness assembly with presets, persistent terminals and session reminders."
  },
  "@beellix-ai/headless": {
    "path": "packages/harness/bundle/headless",
    "ownership": "foundation",
    "kind": "bundle",
    "group": "platform",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "dsh 的一次性任务模式：从命令行运行单个任务并打印最终答案，供用户脚本化或自动化 dsh。",
    "en": "The dsh one-shot bundle: a direct core Agent/Session runner over dsh-base with no Host, HTTP, or browser layer"
  },
  "@beellix-ai/home-paths": {
    "path": "packages/harness/boot/home-paths",
    "ownership": "foundation",
    "kind": "library",
    "group": "platform",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "DeepSeek Harness 主目录与用户数据路径的共享解析，供需要统一根目录、波浪号展开与稳定监听路径的包使用。",
    "en": "Shared filesystem path helpers for the BEELLIX Harness"
  },
  "@beellix-ai/hook-protocol": {
    "path": "packages/harness/hooks/hook-protocol",
    "ownership": "foundation",
    "kind": "library",
    "group": "extensions",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "Claude Code 与 Codex 桥接背后的共享钩子规则——钩子能做什么、运行时会发生什么——供 hooks 子系统的用户与维护者阅读。",
    "en": "Shared Claude Code / Codex hook wire protocol: matcher engine, stdin/exit-code/stdout codec, multi-hook merge, and hook/* session events"
  },
  "@beellix-ai/hooks-claude-code": {
    "path": "packages/harness/hooks/extensions/hooks-claude-code",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "extensions",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "在 agent 运行期间使用你现有的 Claude Code hooks.json 或 settings 钩子配置——阻塞提示词与工具、附加上下文或强制继续——供本桥接的用户与维护者阅读。",
    "en": "Bridge plugin: run a Claude Code hooks.json / settings hook config on the BEELLIX Harness interception seams"
  },
  "@beellix-ai/hooks-codex": {
    "path": "packages/harness/hooks/extensions/hooks-codex",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "extensions",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "在 agent 运行期间使用你现有的 Codex hooks.json 钩子配置——阻塞提示词与工具、附加上下文或强制继续——供本桥接的用户与维护者阅读。",
    "en": "Bridge plugin: run a Codex hooks.json hook config on the BEELLIX Harness interception seams"
  },
  "@beellix-ai/host-directory-picker": {
    "path": "packages/harness/host/builtin/directory-picker",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "interfaces",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "面向 web GUI 宿主的工作区目录选择 seam：原生与浏览后端所实现的服务约定、能力词汇与错误码。",
    "en": "Abstract workspace-directory picking seam (ctx.directoryPicker) for the BEELLIX Harness web GUI host"
  },
  "@beellix-ai/host-directory-picker-auto": {
    "path": "packages/harness/host/builtin/directory-picker-auto",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "interfaces",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "目录选择 seam 的自适应选择器：在启动时判定一次 web GUI 宿主的处境，并挂载匹配的原生或浏览后端。",
    "en": "Adaptive chooser of the directory-picker seam: resolves the host situation at boot and mounts the native or browse backend for the BEELLIX Harness web GUI host"
  },
  "@beellix-ai/host-directory-picker-browse": {
    "path": "packages/harness/host/builtin/directory-picker-browse",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "interfaces",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "目录选择 seam 的应用内浏览后端：为 web GUI 宿主提供单层目录列举与子目录创建，也能服务于远程客户端。",
    "en": "In-app browsing backend of the directory-picker seam (listing/creation primitives over the host filesystem)"
  },
  "@beellix-ai/host-directory-picker-native": {
    "path": "packages/harness/host/builtin/directory-picker-native",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "interfaces",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "目录选择 seam 的原生 OS 选择器后端：为坐在 web GUI 宿主屏幕前的操作者每次打开一个平台选择器。",
    "en": "Native-OS-chooser backend of the directory-picker seam for the BEELLIX Harness web GUI host"
  },
  "@beellix-ai/host-frontend-static": {
    "path": "packages/harness/host/builtin/frontend-static",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "interfaces",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "Web 壳的 SPA dist 服务器：占据 webserver 回退席位，以遍历拒绝与 SPA index 回退服务已构建的前端。",
    "en": "SPA dist server for the Web shell: owns the webserver fallback seat, serving explicit index entries and static assets with traversal rejection and 404 misses"
  },
  "@beellix-ai/host-plugin-inventory": {
    "path": "packages/harness/host/builtin/plugin-inventory",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "interfaces",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "只读列出全局 Loader 状态与每个会话预设的插件组合。",
    "en": "Read-only Remote projection of current Cordis Loader plugin state"
  },
  "@beellix-ai/host-webserver": {
    "path": "packages/harness/host/builtin/webserver",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "interfaces",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "web GUI 宿主的 HTTP 服务器：具名路由与 upgrade 注册、index 转换，以及服务 Web 壳 SPA dist 的唯一回退席位。",
    "en": "Web route-registration plugin: HTTP and upgrade routes, index transform taps, and static dist fallback; knows no harness concepts"
  },
  "@beellix-ai/http-proxy": {
    "path": "packages/harness/network/http-proxy",
    "ownership": "foundation",
    "kind": "library",
    "group": "platform",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "Harness 的出站 HTTP 代理支持：从启动环境解析出的一份策略，如何覆盖到 Node fetch 本来会直连的每一个请求。",
    "en": "Process-wide outbound HTTP proxy policy for BEELLIX Harness: resolve it from the launch environment and install it as undici's global dispatcher"
  },
  "@beellix-ai/invariants": {
    "path": "packages/harness/runtime-diagnostics/builtin/invariants",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "core",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": {
      "href": "/admin/plugin-settings/invariants"
    },
    "zh": "注册并执行各能力包自有的运行时一致性检查。",
    "en": "Registry service for package-owned BEELLIX Harness runtime invariants"
  },
  "@beellix-ai/inventory-replenishment": {
    "path": "packages/scenarios/inventory-replenishment",
    "ownership": "business",
    "kind": "plugin",
    "group": "extensions",
    "management": "extension",
    "contributes": [
      "tools",
      "skills",
      "ui"
    ],
    "configuration": null,
    "zh": "库存补货的资料、专业核对、人员复核、产物与后续记录。",
    "en": "Inventory replenishment workbench.",
    "displayZh": "库存补货",
    "displayEn": "Inventory replenishment"
  },
  "@beellix-ai/jobs": {
    "path": "packages/harness/jobs/builtin/jobs",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "orchestration",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "后台任务注册表约定，供组合、实现或排查后台工作的用户与维护者阅读：id、归属、生命周期与完成监听器。",
    "en": "Background job registry (ctx.jobs) for the BEELLIX Harness — shared ids, owner isolation, polling, cancellation, and completion listeners for long-running tool work"
  },
  "@beellix-ai/jobs-local": {
    "path": "packages/harness/jobs/builtin/jobs-local",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "orchestration",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "进程本地后台任务注册表，供组合、容量评估或排查进程内任务的用户与维护者阅读：按所有者的准入、生命周期与销毁。",
    "en": "Process-local implementation of the BEELLIX Harness background job registry seam"
  },
  "@beellix-ai/launch-environment": {
    "path": "packages/harness/boot/launch-environment",
    "ownership": "foundation",
    "kind": "library",
    "group": "platform",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "本次运行环境的不可变快照，记住每个值来自哪一层；供必须以不信任压平 process.env 的方式解析面向用户值的包使用。",
    "en": "Immutable BEELLIX Harness launch environment that records which layer supplied each value"
  },
  "@beellix-ai/lazy-require": {
    "path": "packages/shared/node/lazy-require",
    "ownership": "foundation",
    "kind": "library",
    "group": "platform",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "按调用方位置延迟加载宿主依赖，并缓存成功结果。",
    "en": "Caller-relative, success-cached lazy loading for CommonJS-compatible Host dependencies"
  },
  "@beellix-ai/llm": {
    "path": "packages/harness/llm/builtin/llm",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "models",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "统一流式模型请求、提供方注册与模型元数据查询。",
    "en": "Provider-neutral LLM service interface for the BEELLIX Harness"
  },
  "@beellix-ai/llm-amazon-bedrock": {
    "path": "packages/harness/llm/extensions/llm-amazon-bedrock",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "models",
    "management": "builtin",
    "contributes": [
      "models"
    ],
    "configuration": {
      "href": "/admin/models"
    },
    "zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
    "en": "Vendor models and administrator connection settings."
  },
  "@beellix-ai/llm-ant-ling": {
    "path": "packages/harness/llm/extensions/llm-ant-ling",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "models",
    "management": "builtin",
    "contributes": [
      "models"
    ],
    "configuration": {
      "href": "/admin/models"
    },
    "zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
    "en": "Vendor models and administrator connection settings."
  },
  "@beellix-ai/llm-anthropic": {
    "path": "packages/harness/llm/extensions/llm-anthropic",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "models",
    "management": "builtin",
    "contributes": [
      "models"
    ],
    "configuration": {
      "href": "/admin/models"
    },
    "zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
    "en": "Vendor models and administrator connection settings."
  },
  "@beellix-ai/llm-azure": {
    "path": "packages/harness/llm/extensions/llm-azure",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "models",
    "management": "builtin",
    "contributes": [
      "models"
    ],
    "configuration": {
      "href": "/admin/models"
    },
    "zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
    "en": "Vendor models and administrator connection settings."
  },
  "@beellix-ai/llm-baseten": {
    "path": "packages/harness/llm/extensions/llm-baseten",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "models",
    "management": "builtin",
    "contributes": [
      "models"
    ],
    "configuration": {
      "href": "/admin/models"
    },
    "zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
    "en": "Vendor models and administrator connection settings."
  },
  "@beellix-ai/llm-cerebras": {
    "path": "packages/harness/llm/extensions/llm-cerebras",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "models",
    "management": "builtin",
    "contributes": [
      "models"
    ],
    "configuration": {
      "href": "/admin/models"
    },
    "zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
    "en": "Vendor models and administrator connection settings."
  },
  "@beellix-ai/llm-cloudflare": {
    "path": "packages/harness/llm/extensions/llm-cloudflare",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "models",
    "management": "builtin",
    "contributes": [
      "models"
    ],
    "configuration": {
      "href": "/admin/models"
    },
    "zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
    "en": "Vendor models and administrator connection settings."
  },
  "@beellix-ai/llm-deepseek": {
    "path": "packages/harness/llm/extensions/llm-deepseek",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "models",
    "management": "builtin",
    "contributes": [
      "models"
    ],
    "configuration": {
      "href": "/admin/models"
    },
    "zh": "连接 DeepSeek Chat Completions，处理 thinking 与图片输入。",
    "en": "DeepSeek chat-completions adapter for the BEELLIX Harness LLM seam"
  },
  "@beellix-ai/llm-deepseek-account": {
    "path": "packages/harness/llm/extensions/llm-deepseek-account",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "models",
    "management": "builtin",
    "contributes": [
      "models"
    ],
    "configuration": null,
    "zh": "可选上游账号提供方；不装配企业身份或登录页面。",
    "en": "Fixed upstream provider compatibility contract."
  },
  "@beellix-ai/llm-deepseek-api-key": {
    "path": "packages/harness/llm/extensions/llm-deepseek-api-key",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "models",
    "management": "builtin",
    "contributes": [
      "models"
    ],
    "configuration": null,
    "zh": "DeepSeek API Key 提供方；凭据由运行环境服务解析。",
    "en": "Fixed upstream provider compatibility contract."
  },
  "@beellix-ai/llm-fireworks": {
    "path": "packages/harness/llm/extensions/llm-fireworks",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "models",
    "management": "builtin",
    "contributes": [
      "models"
    ],
    "configuration": {
      "href": "/admin/models"
    },
    "zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
    "en": "Vendor models and administrator connection settings."
  },
  "@beellix-ai/llm-github-copilot": {
    "path": "packages/harness/llm/extensions/llm-github-copilot",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "models",
    "management": "builtin",
    "contributes": [
      "models"
    ],
    "configuration": {
      "href": "/admin/models"
    },
    "zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
    "en": "Vendor models and administrator connection settings."
  },
  "@beellix-ai/llm-google": {
    "path": "packages/harness/llm/extensions/llm-google",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "models",
    "management": "builtin",
    "contributes": [
      "models"
    ],
    "configuration": {
      "href": "/admin/models"
    },
    "zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
    "en": "Vendor models and administrator connection settings."
  },
  "@beellix-ai/llm-groq": {
    "path": "packages/harness/llm/extensions/llm-groq",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "models",
    "management": "builtin",
    "contributes": [
      "models"
    ],
    "configuration": {
      "href": "/admin/models"
    },
    "zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
    "en": "Vendor models and administrator connection settings."
  },
  "@beellix-ai/llm-huggingface": {
    "path": "packages/harness/llm/extensions/llm-huggingface",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "models",
    "management": "builtin",
    "contributes": [
      "models"
    ],
    "configuration": {
      "href": "/admin/models"
    },
    "zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
    "en": "Vendor models and administrator connection settings."
  },
  "@beellix-ai/llm-minimax": {
    "path": "packages/harness/llm/extensions/llm-minimax",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "models",
    "management": "builtin",
    "contributes": [
      "models"
    ],
    "configuration": {
      "href": "/admin/models"
    },
    "zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
    "en": "Vendor models and administrator connection settings."
  },
  "@beellix-ai/llm-mistral": {
    "path": "packages/harness/llm/extensions/llm-mistral",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "models",
    "management": "builtin",
    "contributes": [
      "models"
    ],
    "configuration": {
      "href": "/admin/models"
    },
    "zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
    "en": "Vendor models and administrator connection settings."
  },
  "@beellix-ai/llm-mock-server": {
    "path": "packages/testing/models/llm-mock-server",
    "ownership": "foundation",
    "kind": "library",
    "group": "engineering",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "用于在无提供方密钥的情况下测试 LLM 适配器与恢复策略的可编脚本 OpenAI 兼容故障服务器，面向测试作者与演示。",
    "en": "Scriptable OpenAI-compatible HTTP/SSE fault server for LLM recovery tests"
  },
  "@beellix-ai/llm-moonshot": {
    "path": "packages/harness/llm/extensions/llm-moonshot",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "models",
    "management": "builtin",
    "contributes": [
      "models"
    ],
    "configuration": {
      "href": "/admin/models"
    },
    "zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
    "en": "Vendor models and administrator connection settings."
  },
  "@beellix-ai/llm-nvidia": {
    "path": "packages/harness/llm/extensions/llm-nvidia",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "models",
    "management": "builtin",
    "contributes": [
      "models"
    ],
    "configuration": {
      "href": "/admin/models"
    },
    "zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
    "en": "Vendor models and administrator connection settings."
  },
  "@beellix-ai/llm-openai": {
    "path": "packages/harness/llm/extensions/llm-openai",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "models",
    "management": "builtin",
    "contributes": [
      "models"
    ],
    "configuration": {
      "href": "/admin/models"
    },
    "zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
    "en": "Vendor models and administrator connection settings."
  },
  "@beellix-ai/llm-opencode": {
    "path": "packages/harness/llm/extensions/llm-opencode",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "models",
    "management": "builtin",
    "contributes": [
      "models"
    ],
    "configuration": {
      "href": "/admin/models"
    },
    "zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
    "en": "Vendor models and administrator connection settings."
  },
  "@beellix-ai/llm-openrouter": {
    "path": "packages/harness/llm/extensions/llm-openrouter",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "models",
    "management": "builtin",
    "contributes": [
      "models"
    ],
    "configuration": {
      "href": "/admin/models"
    },
    "zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
    "en": "Vendor models and administrator connection settings."
  },
  "@beellix-ai/llm-pi-ai": {
    "path": "packages/harness/llm/protocols/pi-ai",
    "ownership": "foundation",
    "kind": "library",
    "group": "models",
    "management": "technical",
    "contributes": [],
    "configuration": {
      "href": "/admin/models"
    },
    "zh": "BEELLIX OS 共享模型协议引擎；厂商目录由各厂商包提供。",
    "en": "Shared model protocol engine for BEELLIX OS; vendor packages own catalogs."
  },
  "@beellix-ai/llm-qwen": {
    "path": "packages/harness/llm/extensions/llm-qwen",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "models",
    "management": "builtin",
    "contributes": [
      "models"
    ],
    "configuration": {
      "href": "/admin/models"
    },
    "zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
    "en": "Vendor models and administrator connection settings."
  },
  "@beellix-ai/llm-replay": {
    "path": "packages/testing/models/llm-replay",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "engineering",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "面向快照测试的无密钥 LLM 回放插件，供测试作者针对已记录模型 transcript 启动真实 agent。",
    "en": "Replay LLM plugin: short-circuits llm/stream with model chunks reconstructed from a recorded session JSONL (keyless snapshot tests)"
  },
  "@beellix-ai/llm-retry": {
    "path": "packages/harness/llm/builtin/llm-retry",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "models",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "按提供方策略重试模型请求，保留可恢复的步骤记录。",
    "en": "Provider-routed LLM request retry policy for the BEELLIX Harness"
  },
  "@beellix-ai/llm-together": {
    "path": "packages/harness/llm/extensions/llm-together",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "models",
    "management": "builtin",
    "contributes": [
      "models"
    ],
    "configuration": {
      "href": "/admin/models"
    },
    "zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
    "en": "Vendor models and administrator connection settings."
  },
  "@beellix-ai/llm-vendor": {
    "path": "packages/harness/llm/builtin/llm-vendor",
    "ownership": "foundation",
    "kind": "library",
    "group": "models",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "厂商定义校验、管理员参数与热更新机制。",
    "en": "Vendor definition validation, administrator settings and live updates."
  },
  "@beellix-ai/llm-vercel-ai-gateway": {
    "path": "packages/harness/llm/extensions/llm-vercel-ai-gateway",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "models",
    "management": "builtin",
    "contributes": [
      "models"
    ],
    "configuration": {
      "href": "/admin/models"
    },
    "zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
    "en": "Vendor models and administrator connection settings."
  },
  "@beellix-ai/llm-xai": {
    "path": "packages/harness/llm/extensions/llm-xai",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "models",
    "management": "builtin",
    "contributes": [
      "models"
    ],
    "configuration": {
      "href": "/admin/models"
    },
    "zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
    "en": "Vendor models and administrator connection settings."
  },
  "@beellix-ai/llm-xiaomi": {
    "path": "packages/harness/llm/extensions/llm-xiaomi",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "models",
    "management": "builtin",
    "contributes": [
      "models"
    ],
    "configuration": {
      "href": "/admin/models"
    },
    "zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
    "en": "Vendor models and administrator connection settings."
  },
  "@beellix-ai/llm-zai": {
    "path": "packages/harness/llm/extensions/llm-zai",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "models",
    "management": "builtin",
    "contributes": [
      "models"
    ],
    "configuration": {
      "href": "/admin/models"
    },
    "zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
    "en": "Vendor models and administrator connection settings."
  },
  "@beellix-ai/loader-smoke": {
    "path": "packages/testing/harness/loader-smoke",
    "ownership": "foundation",
    "kind": "library",
    "group": "engineering",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "面向无密钥示例冒烟测试的共享子进程与直接 agent harness，供测试作者启动真实 Loader 组合。",
    "en": "Shared subprocess and direct-agent harness for keyless real-Loader example smoke tests"
  },
  "@beellix-ai/lsp": {
    "path": "packages/harness/lsp/builtin/lsp",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "files",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "LSP 能力 seam（ctx.lsp）：按文件扩展名选择提供方、四种规范化的代码导航操作与结构化错误，供组合或扩展代码导航的用户与维护者阅读。",
    "en": "Abstract LSP capability seam (ctx.lsp) for the BEELLIX Harness — language-server provider registry keyed by branded id and extension mapping, order-independent per-query selection, normalized definition/references/implementation/hover requests and results, and the LspError taxonomy"
  },
  "@beellix-ai/lsp-stdio": {
    "path": "packages/harness/lsp/builtin/lsp-stdio",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "files",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": {
      "href": "/admin/plugin-settings/lsp-stdio"
    },
    "zh": "ctx.lsp 的 stdio 语言服务器提供方：配置好的服务器命令、扩展名映射与有边界的临时打开查询，供组合本地代码导航的用户与维护者阅读。",
    "en": "Generic stdio language-server provider for the BEELLIX Harness LSP capability seam (ctx.lsp) — spawns configured servers, translates JSON-RPC, and serves transient-open goToDefinition/findReferences/goToImplementation/hover queries in the host filesystem namespace"
  },
  "@beellix-ai/mcp-client": {
    "path": "packages/harness/mcp/builtin/mcp-client",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "extensions",
    "management": "builtin",
    "contributes": [
      "mcp"
    ],
    "configuration": {
      "href": "/admin/connections"
    },
    "zh": "连接外部 MCP 服务器，并把其工具注册到 Harness 工具服务。",
    "en": "MCP client bridge: connects to MCP servers and registers their tools on ctx.tools"
  },
  "@beellix-ai/mcp-resources": {
    "path": "packages/harness/mcp/builtin/mcp-resources",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "extensions",
    "management": "builtin",
    "contributes": [
      "mcp"
    ],
    "configuration": {
      "href": "/admin/connections"
    },
    "zh": "按会话作用域发现和读取已配置 MCP 服务的资源及资源模板。",
    "en": "Scoped discovery and reading of configured MCP resources and templates."
  },
  "@beellix-ai/meeting-minutes": {
    "path": "packages/scenarios/meeting-minutes",
    "ownership": "business",
    "kind": "plugin",
    "group": "extensions",
    "management": "extension",
    "contributes": [
      "tools",
      "skills",
      "ui"
    ],
    "configuration": null,
    "zh": "会议发言转写、说话人确认、本场与企业声纹复用及有来源的纪要。",
    "en": "Meeting transcripts, confirmed speakers, meeting and enterprise voice profiles, and sourced minutes.",
    "displayZh": "会议纪要",
    "displayEn": "Meeting minutes"
  },
  "@beellix-ai/message-feedback": {
    "path": "packages/harness/feedback/builtin/message-feedback",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "sessions",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "针对已完成 assistant 消息的逐消息评分与备注，供用户与维护者选择、组合或排查该反馈服务。",
    "en": "Lifecycle-bound per-message rating and note sidecar for the BEELLIX Harness"
  },
  "@beellix-ai/mobile": {
    "path": "apps/mobile",
    "ownership": "foundation",
    "kind": "application",
    "group": "platform",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "个人电脑的手机配套端；配对与安全通道完成前禁止构建制品。",
    "en": "Mobile and tablet application delivery."
  },
  "@beellix-ai/native-command": {
    "path": "packages/harness/subprocess/native-command",
    "ownership": "foundation",
    "kind": "library",
    "group": "platform",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "宿主原生命令与路径打开工具，提供无 shell 执行、取消、桌面探测与 WSL 路径交接。",
    "en": "Host-native command and path-opening utilities with shell-free execution, cancellation, desktop detection, and WSL handoff"
  },
  "@beellix-ai/node-addon-landlock-run": {
    "path": "native/landlock-run/packages/entry",
    "ownership": "foundation",
    "kind": "native",
    "group": "platform",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "定位并探测 Linux Landlock 启动器，生成受限进程的授权参数。",
    "en": "Resolve and probe the Linux Landlock launcher and generate process grants."
  },
  "@beellix-ai/node-addon-landlock-run-linux-arm64": {
    "path": "native/landlock-run/packages/linux-arm64",
    "ownership": "foundation",
    "kind": "native",
    "group": "platform",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "提供 Linux ARM64 的 Landlock 沙箱启动二进制，不用于 Windows。",
    "en": "Landlock sandbox launcher binary for Linux ARM64, not Windows."
  },
  "@beellix-ai/node-addon-landlock-run-linux-x64": {
    "path": "native/landlock-run/packages/linux-x64",
    "ownership": "foundation",
    "kind": "native",
    "group": "platform",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "提供 Linux x64 的 Landlock 沙箱启动二进制，不用于 Windows。",
    "en": "Landlock sandbox launcher binary for Linux x64, not Windows."
  },
  "@beellix-ai/node-addon-system": {
    "path": "native/system/packages/entry",
    "ownership": "foundation",
    "kind": "library",
    "group": "platform",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "原生系统能力与对应平台的运行载体。",
    "en": "Native system capabilities and platform runtime artifacts."
  },
  "@beellix-ai/node-addon-system-darwin-arm64": {
    "path": "native/system/packages/darwin-arm64",
    "ownership": "foundation",
    "kind": "library",
    "group": "platform",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "原生系统能力与对应平台的运行载体。",
    "en": "Native system capabilities and platform runtime artifacts."
  },
  "@beellix-ai/node-addon-system-darwin-x64": {
    "path": "native/system/packages/darwin-x64",
    "ownership": "foundation",
    "kind": "library",
    "group": "platform",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "原生系统能力与对应平台的运行载体。",
    "en": "Native system capabilities and platform runtime artifacts."
  },
  "@beellix-ai/node-addon-system-linux-arm64": {
    "path": "native/system/packages/linux-arm64",
    "ownership": "foundation",
    "kind": "library",
    "group": "platform",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "原生系统能力与对应平台的运行载体。",
    "en": "Native system capabilities and platform runtime artifacts."
  },
  "@beellix-ai/node-addon-system-linux-x64": {
    "path": "native/system/packages/linux-x64",
    "ownership": "foundation",
    "kind": "library",
    "group": "platform",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "原生系统能力与对应平台的运行载体。",
    "en": "Native system capabilities and platform runtime artifacts."
  },
  "@beellix-ai/office-capabilities": {
    "path": "packages/plugins/office",
    "ownership": "business",
    "kind": "plugin",
    "group": "extensions",
    "management": "extension",
    "contributes": [
      "tools",
      "skills"
    ],
    "configuration": null,
    "zh": "独立交付文档、表格和演示工具及技能，沿用本机插件协议。",
    "en": "Independently delivered document, spreadsheet and presentation tools and skills using the existing local plugin protocol.",
    "displayZh": "Office 文档能力",
    "displayEn": "Office capabilities"
  },
  "@beellix-ai/output-retention": {
    "path": "packages/shared/common/output-retention",
    "ownership": "foundation",
    "kind": "library",
    "group": "platform",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "为必须限制返回上下文量的工具提供有界的面向模型输出：项与文本 retainer，以及标准化的省略页脚。",
    "en": "Zero-dependency bounded-retention primitive: ItemRetainer/TextRetainer + neutral notice helpers (what did we keep, what did we omit)"
  },
  "@beellix-ai/permission-presets": {
    "path": "packages/harness/interaction/builtin/permission-presets",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "security",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "面向用户的权限预设：供选择、配置或排查把沙箱模式与审批策略捆绑在一起的 Permissions 选择器的用户与维护者阅读。",
    "en": "User-facing permission presets (ctx.permissionPresets) for the BEELLIX Harness: one product-level Permissions select bundling the sandbox-mode and approval-policy knobs, written through to their own session events"
  },
  "@beellix-ai/persona": {
    "path": "packages/harness/preset/builtin/persona",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "core",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "为预设中的 Agent 配置可组合的系统提示词人设。",
    "en": "Composition-authored deployment persona section for the BEELLIX Harness"
  },
  "@beellix-ai/plan-mode": {
    "path": "packages/harness/plan/builtin/plan-mode",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "orchestration",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "面向用户与维护者的计划模式说明：用于选择、配置或排查带部署引导、/plan 命令与经用户评审退出的逐 agent 规划功能。",
    "en": "Logged per-agent plan mode with deployment guidance, a direct slash command, and a user-reviewed exit"
  },
  "@beellix-ai/plugin-package-inventory-deepseek": {
    "path": "packages/harness/llm/extensions/plugin-package-inventory-deepseek",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "models",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "向官方 DeepSeek 请求附加活跃 Loader 包清单元数据。",
    "en": "Active Loader-backed plugin package inventory for official DeepSeek LLM API requests"
  },
  "@beellix-ai/project-acceptance": {
    "path": "packages/scenarios/project-acceptance",
    "ownership": "business",
    "kind": "plugin",
    "group": "extensions",
    "management": "extension",
    "contributes": [
      "tools",
      "skills",
      "ui"
    ],
    "configuration": null,
    "zh": "项目验收的资料、专业核对、人员复核、产物与后续记录。",
    "en": "Project acceptance workbench.",
    "displayZh": "项目验收",
    "displayEn": "Project acceptance"
  },
  "@beellix-ai/project-cost-review": {
    "path": "packages/scenarios/project-cost-review",
    "ownership": "business",
    "kind": "plugin",
    "group": "extensions",
    "management": "extension",
    "contributes": [
      "tools",
      "skills",
      "ui"
    ],
    "configuration": null,
    "zh": "成本复盘的资料、专业核对、人员复核、产物与后续记录。",
    "en": "Project cost review workbench.",
    "displayZh": "成本复盘",
    "displayEn": "Project cost review"
  },
  "@beellix-ai/ptc-runtime": {
    "path": "packages/harness/ptc-runtime/builtin/ptc-runtime",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "execution",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "统一声明程序化工具调用的执行服务与沙箱契约。",
    "en": "Abstract PTC execution seam (ctx.ptcRuntime) for the DeepSeek Harness"
  },
  "@beellix-ai/ptc-runtime-node": {
    "path": "packages/harness/ptc-runtime/builtin/ptc-runtime-node",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "execution",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "在受管 Node 子进程中运行程序化工具调用，使用共享沙箱与调用边界。",
    "en": "Managed Node process provider for programmatic tool calls."
  },
  "@beellix-ai/purchase-comparison": {
    "path": "packages/scenarios/purchase-comparison",
    "ownership": "business",
    "kind": "plugin",
    "group": "extensions",
    "management": "extension",
    "contributes": [
      "tools",
      "skills",
      "ui"
    ],
    "configuration": null,
    "zh": "采购比价的资料、专业核对、人员复核、产物与后续记录。",
    "en": "Purchase comparison workbench.",
    "displayZh": "采购比价",
    "displayEn": "Purchase comparison"
  },
  "@beellix-ai/purchase-followup": {
    "path": "packages/scenarios/purchase-followup",
    "ownership": "business",
    "kind": "plugin",
    "group": "extensions",
    "management": "extension",
    "contributes": [
      "tools",
      "skills",
      "ui"
    ],
    "configuration": null,
    "zh": "采购跟单的资料、专业核对、人员复核、产物与后续记录。",
    "en": "Purchase order follow-up workbench.",
    "displayZh": "采购跟单",
    "displayEn": "Purchase order follow-up"
  },
  "@beellix-ai/pwsh-local": {
    "path": "packages/harness/shell/builtin/pwsh-local",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "execution",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": {
      "href": "/admin/plugin-settings/shell"
    },
    "zh": "在宿主运行普通 PowerShell 命令，本身不提供进程隔离。",
    "en": "Local PowerShell implementation of the BEELLIX Harness bash executor seam"
  },
  "@beellix-ai/pwsh-sandbox": {
    "path": "packages/harness/shell/builtin/pwsh-sandbox",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "execution",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": {
      "href": "/admin/plugin-settings/shell"
    },
    "zh": "按共享沙箱策略执行受限 PowerShell 命令。",
    "en": "Sandbox-consuming implementation of the BEELLIX Harness PowerShell executor seam (confines every command via ctx.sandbox, reports denial/enforcement result facts)"
  },
  "@beellix-ai/python-runtime-closure": {
    "path": "apps/harness/python/sdk-runtime",
    "ownership": "foundation",
    "kind": "application",
    "group": "platform",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "定义 Python 运行时 wheel 打包的 CLI 与 Node 依赖集合。",
    "en": "CLI and Node dependency closure for Python runtime wheels."
  },
  "@beellix-ai/quality-correction": {
    "path": "packages/scenarios/quality-correction",
    "ownership": "business",
    "kind": "plugin",
    "group": "extensions",
    "management": "extension",
    "contributes": [
      "tools",
      "skills",
      "ui"
    ],
    "configuration": null,
    "zh": "质量整改的资料、专业核对、人员复核、产物与后续记录。",
    "en": "Quality correction workbench.",
    "displayZh": "质量整改",
    "displayEn": "Quality correction"
  },
  "@beellix-ai/receivables-collection": {
    "path": "packages/scenarios/receivables-collection",
    "ownership": "business",
    "kind": "plugin",
    "group": "extensions",
    "management": "extension",
    "contributes": [
      "tools",
      "skills",
      "ui"
    ],
    "configuration": null,
    "zh": "应收回款的资料、专业核对、人员复核、产物与后续记录。",
    "en": "Receivables collection workbench.",
    "displayZh": "应收回款",
    "displayEn": "Receivables collection"
  },
  "@beellix-ai/recruitment-assessment": {
    "path": "packages/scenarios/recruitment-assessment",
    "ownership": "business",
    "kind": "plugin",
    "group": "extensions",
    "management": "extension",
    "contributes": [
      "tools",
      "skills",
      "ui"
    ],
    "configuration": null,
    "zh": "多平台履历归集、沟通草稿、简历初筛与面试交接。",
    "en": "Recruitment assessment workbench.",
    "displayZh": "招聘助手",
    "displayEn": "Recruitment assessment"
  },
  "@beellix-ai/remote-mock": {
    "path": "packages/testing/core/remote-mock",
    "ownership": "foundation",
    "kind": "library",
    "group": "engineering",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "测试 Remote 服务响应与调用。",
    "en": "Mock remote responses and calls."
  },
  "@beellix-ai/repeat-tool-reminder": {
    "path": "packages/harness/guard/builtin/repeat-tool-reminder",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "security",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "建议性循环卫生 guard：当 agent 重复完全相同的工具调用时提醒模型，供选择、配置或排查此插件的用户与维护者阅读。",
    "en": "Repeat-tool-call guard plugin: advisory reminders when an agent loops on identical tool calls"
  },
  "@beellix-ai/sales-opportunity": {
    "path": "packages/scenarios/sales-opportunity",
    "ownership": "business",
    "kind": "plugin",
    "group": "extensions",
    "management": "extension",
    "contributes": [
      "tools",
      "skills",
      "ui"
    ],
    "configuration": null,
    "zh": "商机跟进的资料、专业核对、人员复核、产物与后续记录。",
    "en": "Sales opportunity follow-up workbench.",
    "displayZh": "商机跟进",
    "displayEn": "Sales opportunity follow-up"
  },
  "@beellix-ai/sales-order-review": {
    "path": "packages/scenarios/sales-order-review",
    "ownership": "business",
    "kind": "plugin",
    "group": "extensions",
    "management": "extension",
    "contributes": [
      "tools",
      "skills",
      "ui"
    ],
    "configuration": null,
    "zh": "订单审核的资料、专业核对、人员复核、产物与后续记录。",
    "en": "Sales order review workbench.",
    "displayZh": "订单审核",
    "displayEn": "Sales order review"
  },
  "@beellix-ai/sandbox": {
    "path": "packages/harness/sandbox/builtin/sandbox",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "security",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "进程沙箱服务约定：面向组合、使用或扩展同世界子进程隔离的用户与维护者。",
    "en": "Abstract process-sandbox seam (ctx.sandbox) for the BEELLIX Harness: same-world confinement vocabulary and the SandboxProvider contract"
  },
  "@beellix-ai/sandbox-local": {
    "path": "packages/harness/sandbox/builtin/sandbox-local",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "security",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "面向 Linux、macOS 或 Windows 上选择、配置或排查进程隔离的用户与维护者的本地各平台沙箱后端。",
    "en": "Local process-sandbox backends for the BEELLIX Harness sandbox seam: bwrap, the npm-distributed landlock-run launcher, macOS Seatbelt, or the Windows ACL restricted-token runner — functionally probed, fail-closed"
  },
  "@beellix-ai/sandbox-policy": {
    "path": "packages/harness/sandbox/builtin/sandbox-policy",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "security",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "面向组合、配置或排查跨执行能力文件效果策略的用户与维护者的共享逐调用沙箱策略解析器与当前模型上下文。",
    "en": "Per-call sandbox policy resolver and current model context: deployment fallbacks plus each session's mode and workspace root, shared by every enforcing capability family"
  },
  "@beellix-ai/sandbox-windows-acl": {
    "path": "packages/harness/sandbox/sandbox-windows-acl",
    "ownership": "foundation",
    "kind": "library",
    "group": "security",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "面向 Windows 上选择、配置或排查受限令牌进程隔离的用户与维护者的 Windows 写入限制沙箱后端。",
    "en": "Windows ACL write-restriction sandbox backend (restricted-token spawn with capability-SID write allowlist) for the BEELLIX Harness sandbox seam"
  },
  "@beellix-ai/scenario-starter": {
    "path": "examples/agent-packages/scenario-starter",
    "ownership": "foundation",
    "kind": "example",
    "group": "engineering",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "场景开发教学模板，演示公共工具、来源、复核与专属UI；不作为已安装的业务场景。",
    "en": "Scenario authoring example with public tools, sources, review and custom UI; not an installed business scenario."
  },
  "@beellix-ai/schedule": {
    "path": "packages/harness/schedule/builtin/schedule",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "orchestration",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "Host 独立持久提醒、显式旧会话导入、投递回执与故障恢复。",
    "en": "Host-wide durable reminders with explicit legacy import and inbox receipt recovery"
  },
  "@beellix-ai/schemastery": {
    "path": "vendor/schemastery",
    "ownership": "foundation",
    "kind": "library",
    "group": "platform",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "定义并验证插件配置，提供类型化配置描述。",
    "en": "Typed configuration definitions and validation."
  },
  "@beellix-ai/scope": {
    "path": "packages/harness/core/scope",
    "ownership": "foundation",
    "kind": "library",
    "group": "core",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "提供按 Agent 或分组隔离贡献的作用域注册辅助库。",
    "en": "Scoped-context registration primitive (scope tags, scope-filtered event dispatch) for the BEELLIX Harness"
  },
  "@beellix-ai/sdk-app": {
    "path": "packages/harness/bundle/sdk-app",
    "ownership": "foundation",
    "kind": "bundle",
    "group": "platform",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "面向启动 JSON-RPC harness 运行时的用户与维护者，说明 SDK stdio 应用 profile。",
    "en": "The dsh SDK profile bundle: stdio JSON-RPC serving and process lifecycle over dsh-base"
  },
  "@beellix-ai/sdk-client": {
    "path": "apps/harness/sdk-client",
    "ownership": "foundation",
    "kind": "sdk",
    "group": "interfaces",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "面向以子进程方式启动 DeepSeek Harness 运行时、并通过 stdio JSON-RPC 驱动 agent 轮次的调用方的 TypeScript SDK 客户端：DeepSeekHarness 运行 API 与低层 HarnessClient。",
    "en": "TypeScript client SDK for driving a BEELLIX Harness runtime subprocess over stdio JSON-RPC: the DeepSeekHarness high-level turns API and the lower-level HarnessClient"
  },
  "@beellix-ai/sdk-jsonrpc-server": {
    "path": "packages/harness/sdk/builtin/server",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "interfaces",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "面向让进程外 SDK 客户端在 DeepSeek Harness 运行时中打开会话并驱动 agent 的部署的 stdio JSON-RPC 服务插件。",
    "en": "Stdio JSON-RPC server plugin for out-of-process BEELLIX Harness SDK clients"
  },
  "@beellix-ai/sdk-minimal": {
    "path": "packages/harness/bundle/sdk-minimal",
    "ownership": "foundation",
    "kind": "bundle",
    "group": "platform",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "供需要不含共享 base bundle 的极简跨平台 coding agent 的用户使用的独立双工具 SDK profile。",
    "en": "The standalone minimal SDK profile bundle: JSON-RPC, one DeepSeek adapter, persistent shell, editor, and JSONL sessions"
  },
  "@beellix-ai/sdk-protocol": {
    "path": "packages/harness/sdk/protocol",
    "ownership": "foundation",
    "kind": "library",
    "group": "interfaces",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "面向客户端与服务端实现者的 SDK 协议格式说明：Harness 运行时与其 SDK 客户端之间使用的按换行分帧 JSON-RPC 传输，以及具名的请求、结果与通知类型。",
    "en": "Shared wire protocol for the BEELLIX Harness SDK runtime: the newline-delimited JSON-RPC stdio transport and the named request, result, and notification types spoken between the runtime server and SDK clients"
  },
  "@beellix-ai/session": {
    "path": "packages/harness/core/session",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "core",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "记录 Agent 交互事件，提供可回放的会话日志与内存存储。",
    "en": "Event-sourced session store for the BEELLIX Harness"
  },
  "@beellix-ai/session-checkpoint-policy": {
    "path": "packages/harness/session/builtin/session-checkpoint-policy",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "sessions",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "面向用户与维护者的语义会话持久性检查点说明，用于部署不会在崩溃时丢失模型请求或工具副作用的持久化 agent。",
    "en": "Semantic session durability checkpoints before model requests and tool side effects"
  },
  "@beellix-ai/session-format": {
    "path": "packages/harness/session/builtin/session-format",
    "ownership": "foundation",
    "kind": "library",
    "group": "sessions",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "会话格式定义、版本目录或顺序迁移。",
    "en": "Session format definitions, version catalog or ordered migration."
  },
  "@beellix-ai/session-format-catalog": {
    "path": "packages/harness/session/builtin/session-format-catalog",
    "ownership": "foundation",
    "kind": "library",
    "group": "sessions",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "会话格式定义、版本目录或顺序迁移。",
    "en": "Session format definitions, version catalog or ordered migration."
  },
  "@beellix-ai/session-format-v0-to-v1": {
    "path": "packages/harness/session/builtin/session-format-v0-to-v1",
    "ownership": "foundation",
    "kind": "library",
    "group": "sessions",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "会话格式定义、版本目录或顺序迁移。",
    "en": "Session format definitions, version catalog or ordered migration."
  },
  "@beellix-ai/session-format-v1-to-v2": {
    "path": "packages/harness/session/builtin/session-format-v1-to-v2",
    "ownership": "foundation",
    "kind": "library",
    "group": "sessions",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "会话格式定义、版本目录或顺序迁移。",
    "en": "Session format definitions, version catalog or ordered migration."
  },
  "@beellix-ai/session-format-v2-to-v3": {
    "path": "packages/harness/session/builtin/session-format-v2-to-v3",
    "ownership": "foundation",
    "kind": "library",
    "group": "sessions",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "会话格式定义、版本目录或顺序迁移。",
    "en": "Session format definitions, version catalog or ordered migration."
  },
  "@beellix-ai/session-format-v3-to-v4": {
    "path": "packages/harness/session/builtin/session-format-v3-to-v4",
    "ownership": "foundation",
    "kind": "library",
    "group": "sessions",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "独立的 V3→V4 会话迁移、历史来源兼容和新版格式校验。",
    "en": "Standalone V3 to V4 session migration and validation."
  },
  "@beellix-ai/session-log-deepseek": {
    "path": "packages/harness/session/extensions/session-log-deepseek",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "sessions",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "面向启用官方 DeepSeek 请求元数据的部署，说明规范会话日志的增量上传。",
    "en": "Incremental lossless session-log request extension for the official DeepSeek LLM API"
  },
  "@beellix-ai/session-log-export": {
    "path": "packages/harness/session-query/builtin/session-log-export",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "sessions",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "Web 会话日志 ZIP 导出：Host 流式传输、认证下载路由、Session Header 操作与 /export 命令。",
    "en": "Web Session-log export command and shared download dialog"
  },
  "@beellix-ai/session-persistence": {
    "path": "packages/harness/session/builtin/session-persistence",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "sessions",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "面向用户与维护者的持久会话存储 seam 说明，用于选择持久化后端、恢复会话，或按共享服务约定构建后端。",
    "en": "Abstract durable session persistence seam (ctx.sessionPersistence) for the BEELLIX Harness"
  },
  "@beellix-ai/session-persistence-jsonl": {
    "path": "packages/harness/session/builtin/session-persistence-jsonl",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "sessions",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "面向部署方与维护者的随产品交付 JSONL 会话持久化后端说明，用于选择、配置或排查带可选 Zstandard 压缩的逐会话持久日志。",
    "en": "JSONL durable session persistence backend for the BEELLIX Harness"
  },
  "@beellix-ai/session-projection": {
    "path": "packages/harness/session/builtin/session-projection",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "sessions",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "面向开发者与维护者的会话投影注册表说明，用于向客户端载体提供日志派生逐会话状态的完整当前值，或维护驱动约定。",
    "en": "Session-projection seam: the merge-extensible projection type table, the provider contract, and the ctx.sessionProjections registry serving whole current values of log-derived per-session state"
  },
  "@beellix-ai/session-projection-cache": {
    "path": "packages/harness/session/builtin/session-projection-cache",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "sessions",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "面向部署方与维护者的持久会话投影缓存说明，用于选择、配置或排查持久检查点、零 I/O 列表读取与加速的冷投影折叠。",
    "en": "Persisted projection cache (ctx.sessionProjectionCache): durable per-session checkpoint records on the session_projcache storage domain (per-record layout), throttled write-behind, and the cached listing read"
  },
  "@beellix-ai/session-query": {
    "path": "packages/harness/session-query/builtin/session-query",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "sessions",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "面向消费方与后端作者的统一会话历史查询服务：对实时与持久会话日志的精确读取、关系追踪与提供方无关过滤。",
    "en": "Combined session query service contract with concrete reads, traces, and filters"
  },
  "@beellix-ai/session-query-sqlite": {
    "path": "packages/harness/session-query/builtin/session-query-sqlite",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "sessions",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "面向部署方与维护者的 SQLite FTS5 会话历史全文搜索后端，用于选择、配置或排查查询服务之上的全文搜索。",
    "en": "Concrete ctx.sessionQuery backend with SQLite FTS5 search"
  },
  "@beellix-ai/session-reference": {
    "path": "packages/harness/context/builtin/session-reference",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "context",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "跨会话快照引用与持久的不受信任模型上下文，供启用或排查 ctx.sessionReferenceResolver 的用户与维护者阅读。",
    "en": "Cross-session snapshot references and durable untrusted model context (ctx.sessionReferenceResolver)"
  },
  "@beellix-ai/session-snapshot": {
    "path": "packages/testing/harness/session-snapshot",
    "ownership": "foundation",
    "kind": "library",
    "group": "engineering",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "面向无密钥 profile 测试的 session-log 快照支持：manifest、身份脱敏、规范化、workspace 检查与协议适配器。",
    "en": "Session-log snapshot core with an ACP protocol adapter, expected-output normalization, and fixture invariants"
  },
  "@beellix-ai/session-stats": {
    "path": "packages/harness/session/builtin/session-stats",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "sessions",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "面向客户端与维护者的全日志会话计数与墙钟时间说明，用于选择、组合或排查 sessionStats 投影单元。",
    "en": "Whole-log conversation counts and wall times projection (sessionStats) for the BEELLIX Harness"
  },
  "@beellix-ai/session-telemetry": {
    "path": "packages/harness/session/session-telemetry",
    "ownership": "foundation",
    "kind": "library",
    "group": "sessions",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "面向部署方与后端作者的会话遥测捕获 seam 说明，用于选择上报后端、挂载脱敏规则或实现后端约定。",
    "en": "SessionTelemetryBackend seam for the BEELLIX Harness: session-event capture, projection, redaction, and handoff to a reporting backend"
  },
  "@beellix-ai/session-telemetry-otel": {
    "path": "packages/harness/session/extensions/session-telemetry-otel",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "sessions",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "面向部署方的 OpenTelemetry 会话遥测后端说明，用于选择模式、配置导出器或排查哪些数据离开本机。",
    "en": "OpenTelemetry backend for the BEELLIX Harness telemetry seam: hands captured session records to the OTel JS SDK's log pipeline"
  },
  "@beellix-ai/session-title": {
    "path": "packages/harness/session/builtin/session-title",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "sessions",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "面向用户与维护者的日志会话标题说明，用于选择标题来源、配置服务或排查标题状态。",
    "en": "Log-backed session title service and provider registry for the BEELLIX Harness"
  },
  "@beellix-ai/session-title-all-prompts-llm": {
    "path": "packages/harness/session/builtin/session-title-all-prompts-llm",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "sessions",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "面向用户与维护者的全消息 LLM 会话标题提供方说明，用于选择标题策略或排查自动标题生成。",
    "en": "All-user-messages LLM provider plugin for BEELLIX Harness session titles"
  },
  "@beellix-ai/session-title-first-prompt-llm": {
    "path": "packages/harness/session/builtin/session-title-first-prompt-llm",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "sessions",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "面向用户与维护者的首消息 LLM 会话标题提供方说明，用于选择标题策略或排查自动标题生成。",
    "en": "First-message LLM provider plugin for BEELLIX Harness session titles"
  },
  "@beellix-ai/session-title-llm": {
    "path": "packages/harness/session/session-title-llm",
    "ownership": "foundation",
    "kind": "library",
    "group": "sessions",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "面向用户与维护者的共享模型标题生成策略说明，用于配置标题提供方或排查辅助 LLM 请求。",
    "en": "Shared LLM generation policy for BEELLIX Harness session-title providers"
  },
  "@beellix-ai/session-turn-outline": {
    "path": "packages/harness/session/builtin/session-turn-outline",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "sessions",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "面向组合或调试 turnOutline 投影单元的客户端与维护者的全量轮次大纲说明，支撑整会话轮次导航。",
    "en": "Whole-log turn outline projection (turnOutline) for the BEELLIX Harness"
  },
  "@beellix-ai/settings": {
    "path": "packages/harness/settings/builtin/settings",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "platform",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "面向插件作者与维护者的用户设置服务：注册可配置 namespace、读取解析值或接入配置界面。",
    "en": "Abstract user-settings seam (ctx.settings) for the BEELLIX Harness"
  },
  "@beellix-ai/settings-file": {
    "path": "packages/harness/settings/builtin/settings-file",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "platform",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "面向用户与维护者的文件型设置提供方：选择、配置或排查 YAML/JSON 设置文档及其热重载。",
    "en": "File-backed settings provider (settings.yaml) for the BEELLIX Harness"
  },
  "@beellix-ai/shell": {
    "path": "packages/harness/shell/builtin/shell",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "execution",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": {
      "href": "/admin/plugin-settings/shell"
    },
    "zh": "提供统一命令执行服务，供 Bash、PowerShell 实现与工具使用。",
    "en": "Abstract bash executor seam (ctx.shell) for the BEELLIX Harness"
  },
  "@beellix-ai/shell-env": {
    "path": "packages/harness/shell/builtin/shell-env",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "execution",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "为模型 Shell 调用注入受管环境信息。",
    "en": "Tool-independent managed DSH_* shell environment registry"
  },
  "@beellix-ai/skill": {
    "path": "packages/harness/skill/builtin/skill",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "extensions",
    "management": "builtin",
    "contributes": [
      "skills"
    ],
    "configuration": null,
    "zh": "注册并合并来自不同提供方的技能，统一解析与加载。",
    "en": "Agent skill provider registry for the BEELLIX Harness"
  },
  "@beellix-ai/skill-badge": {
    "path": "packages/harness/skill/builtin/skill-badge",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "extensions",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "随包附带的「powered by dsh」徽章 skill，供启用、使用或排查该可选徽章提供方的用户与维护者阅读。",
    "en": "Bundled dsh badge skill provider for BEELLIX Harness"
  },
  "@beellix-ai/skill-filesystem": {
    "path": "packages/harness/skill/builtin/skill-filesystem",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "extensions",
    "management": "builtin",
    "contributes": [
      "skills"
    ],
    "configuration": {
      "href": "/admin/plugin-settings/skill-filesystem"
    },
    "zh": "发现并监视项目、用户和自定义目录中的本地技能。",
    "en": "Local filesystem skill provider for the BEELLIX Harness"
  },
  "@beellix-ai/smart-quotation": {
    "path": "packages/scenarios/smart-quotation",
    "ownership": "business",
    "kind": "plugin",
    "group": "extensions",
    "management": "extension",
    "contributes": [
      "tools",
      "skills",
      "ui"
    ],
    "configuration": null,
    "zh": "清单报价工作台、用户字段配置、精确计算、来源核对与交付组织。",
    "en": "List quotation workspace, personal field configuration, calculation and delivery tools.",
    "displayZh": "智能报价-建筑",
    "displayEn": "Smart quotation · Construction"
  },
  "@beellix-ai/spill": {
    "path": "packages/harness/spill/builtin/spill",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "sessions",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "spill 存储服务：部署方与插件作者如何保存过大的工具文本并取回可检索的定位信息。",
    "en": "Abstract spill storage seam (ctx.spillStore) for the BEELLIX Harness — save oversized tool text and return a retrieval locator"
  },
  "@beellix-ai/spill-local": {
    "path": "packages/harness/spill/builtin/spill-local",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "sessions",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "本地文件系统 spill 后端：spill 工具输出如何保存到私有会话级文件，并用 read 或 grep 取回。",
    "en": "Local-filesystem implementation of the BEELLIX Harness spill storage seam (private session-scoped files)"
  },
  "@beellix-ai/spill-policy": {
    "path": "packages/harness/spill/builtin/spill-policy",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "sessions",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "工具结果 spill 策略：部署如何用预览和可检索的 spill 文件把过大的纯文本工具结果挡在模型上下文之外。",
    "en": "Tool-result spill policy for the BEELLIX Harness — replaces oversized plain-text tool results with a retained preview plus a spill-file path (no service API)"
  },
  "@beellix-ai/storage": {
    "path": "packages/harness/storage/builtin/storage",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "sessions",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "存储枢纽（ctx.storage）：面向选择、挂载或排查具名存储后端与数据形式设施的组合方与维护者。",
    "en": "Storage hub (ctx.storage): named backend registry plus mounted data-form facilities for the BEELLIX Harness"
  },
  "@beellix-ai/storage-domain": {
    "path": "packages/harness/storage/builtin/storage-domain",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "sessions",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "领域数据形式（ctx.storageDomain）：面向在存储后端之上选择、挂载或排查经过 schema 校验、发出变更事件的 KV 领域的宿主与维护者。",
    "en": "Domain data form (ctx.storage.domain): schema-validated, event-emitting KV domains over storage backends for the BEELLIX Harness"
  },
  "@beellix-ai/storage-json": {
    "path": "packages/harness/storage/builtin/storage-json",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "sessions",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "JSON 存储后端：面向在配置根目录下选择、配置或排查整单元文件与逐记录文件的宿主与维护者。",
    "en": "JSON file KV storage backend for the BEELLIX Harness storage hub"
  },
  "@beellix-ai/storage-sqlite": {
    "path": "packages/harness/storage/builtin/storage-sqlite",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "sessions",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "SQLite 存储后端：面向在单个数据库文件中选择、配置或排查按行存储文档的 KV 存储的宿主与维护者。",
    "en": "SQLite storage backend (kv facet) for the BEELLIX Harness storage hub"
  },
  "@beellix-ai/subagent": {
    "path": "packages/harness/subagent/builtin/subagent",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "orchestration",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "面向用户与维护者的 subagent 委派 seam，用于选择提供方后端、组装委派工具或排查子 agent 运行问题。",
    "en": "Abstract subagent seam (ctx.subagents): named-provider registry for delegating to child agents"
  },
  "@beellix-ai/subagent-acp": {
    "path": "packages/harness/subagent/extensions/subagent-acp",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "orchestration",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "面向用户与维护者的进程外 ACP subagent 后端，用于选择委派提供方、配置子 ACP agent 命令或排查远程子 agent 运行问题。",
    "en": "Out-of-process ACP subagent backend: drives a child agent in a spawned subprocess over the Agent Client Protocol"
  },
  "@beellix-ai/subagent-claude-code": {
    "path": "packages/harness/subagent/extensions/subagent-claude-code",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "orchestration",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "通过官方 Agent SDK 注册一次性 Claude Code 子智能体提供方；随包附带可选装配补丁。",
    "en": "One-shot Claude Code subagent provider over the official Agent SDK, with an optional composition patch"
  },
  "@beellix-ai/subagent-codex": {
    "path": "packages/harness/subagent/extensions/subagent-codex",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "orchestration",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "通过官方 app-server 协议注册一次性 Codex 子智能体提供方；随包附带可选装配补丁。",
    "en": "One-shot Codex subagent provider over the official app-server protocol, with an optional composition patch"
  },
  "@beellix-ai/subagent-dsh-sdk": {
    "path": "apps/harness/subagent-sdk",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "interfaces",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "面向用户与维护者的进程外 SDK subagent 后端，用于选择委派提供方、配置子 Harness 运行时命令或排查远程子 agent 运行问题。",
    "en": "Out-of-process SDK subagent backend: drives a child BEELLIX Harness runtime subprocess over stdio JSON-RPC through the TypeScript SDK client"
  },
  "@beellix-ai/subagent-fork-in-process": {
    "path": "packages/harness/subagent/builtin/subagent-fork-in-process",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "orchestration",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "面向用户与维护者的进程内 fork subagent 后端说明，用于选择、配置或排查以父级已完成轮次作初始内容的子 agent。",
    "en": "In-process fork subagent backend: runs a child agent seeded with a prefix of the parent's log"
  },
  "@beellix-ai/subagent-in-process-driver": {
    "path": "packages/harness/subagent/subagent-in-process-driver",
    "ownership": "foundation",
    "kind": "library",
    "group": "orchestration",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "共享进程内 subagent 运行驱动器，供维护者与后端作者理解或扩展 spawn 与 fork 的运行生命周期。",
    "en": "Shared in-process subagent run driver: drives a child agent on ctx.agents (used by the spawn and fork backends)"
  },
  "@beellix-ai/subagent-spawn-in-process": {
    "path": "packages/harness/subagent/builtin/subagent-spawn-in-process",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "orchestration",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "面向用户与维护者的进程内 spawn subagent 后端说明，用于选择、配置或排查全新子级委派。",
    "en": "In-process spawn subagent backend: runs a fresh child agent on ctx.agents"
  },
  "@beellix-ai/subprocess": {
    "path": "packages/harness/subprocess/builtin/subprocess",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "execution",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "提供受管子进程和终端的启动、观察与终止接口。",
    "en": "Subprocess seam (ctx.subprocess) for the BEELLIX Harness — managed process groups, bounded spill-backed output, and escalated kills behind one abstract service"
  },
  "@beellix-ai/subprocess-e2b": {
    "path": "packages/harness/subprocess/extensions/subprocess-e2b",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "execution",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "共享远程沙箱内的 shell 命令与终端：agent 可以在那里运行什么、输出如何处理，以及可以期待什么——面向 E2B 家族的部署方与维护者。",
    "en": "E2B subprocess implementation for BEELLIX Harness"
  },
  "@beellix-ai/subprocess-local": {
    "path": "packages/harness/subprocess/builtin/subprocess-local",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "execution",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "在本机管理进程树与真实终端，负责退出和清理。",
    "en": "Local-subprocess implementation of the BEELLIX Harness subprocess seam"
  },
  "@beellix-ai/system-prompt": {
    "path": "packages/harness/core/system-prompt",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "core",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "组装系统提示词、变量、工具说明与提示片段。",
    "en": "System prompt assembly registry for the BEELLIX Harness"
  },
  "@beellix-ai/tender-response": {
    "path": "packages/scenarios/tender-response",
    "ownership": "business",
    "kind": "plugin",
    "group": "extensions",
    "management": "extension",
    "contributes": [
      "tools",
      "skills",
      "ui"
    ],
    "configuration": null,
    "zh": "投标响应的资料、专业核对、人员复核、产物与后续记录。",
    "en": "Tender response workbench.",
    "displayZh": "投标响应",
    "displayEn": "Tender response"
  },
  "@beellix-ai/terminal": {
    "path": "packages/harness/terminal/builtin/terminal",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "execution",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "管理按所有者隔离的持久终端会话。",
    "en": "Persistent PTY session seam for the BEELLIX Harness — owner-scoped ids, backend registry, interactive sends, reads, signals, and awaited cleanup"
  },
  "@beellix-ai/terminal-bash": {
    "path": "packages/harness/terminal/builtin/terminal-bash",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "execution",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "启动交互式 Bash 或 PowerShell 终端，检测就绪并限制保留输出。",
    "en": "Persistent shell PTY backend over the BEELLIX Harness subprocess terminal primitive"
  },
  "@beellix-ai/three-way-match": {
    "path": "packages/scenarios/three-way-match",
    "ownership": "business",
    "kind": "plugin",
    "group": "extensions",
    "management": "extension",
    "contributes": [
      "tools",
      "skills",
      "ui"
    ],
    "configuration": null,
    "zh": "三单匹配的资料、专业核对、人员复核、产物与后续记录。",
    "en": "Three-way matching workbench.",
    "displayZh": "三单匹配",
    "displayEn": "Three-way matching"
  },
  "@beellix-ai/time-context": {
    "path": "packages/harness/context/builtin/time-context",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "context",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "可选的按步骤时钟上下文，包含当前时间、浏览器时区与经过时长，供启用或调优本插件的用户与维护者阅读。",
    "en": "Opt-in durable per-step context with the current time and elapsed time"
  },
  "@beellix-ai/timeout": {
    "path": "packages/shared/common/timeout",
    "ownership": "foundation",
    "kind": "library",
    "group": "platform",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "共享超时运算、截止时间融合与超时/取消分类，供需要限制调用方提示、启动 deadline 并在之后区分二者的能力使用。",
    "en": "Zero-dependency timeout/deadline primitive: clampTimeout, deadline, timeoutOf, TimeoutReason (timing + classification only, no termination)"
  },
  "@beellix-ai/tmux-context": {
    "path": "packages/harness/context/extensions/tmux-context",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "context",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "可选的按轮次 tmux 位置上下文，供启用或调优 agent 的 session、window 与 pane 感知的用户与维护者阅读。",
    "en": "Opt-in durable per-step context with this agent's tmux pane and window location"
  },
  "@beellix-ai/token-meter": {
    "path": "packages/harness/llm/builtin/token-meter",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "models",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "估算 token 与上下文压力，为压缩和容量显示提供计量。",
    "en": "Replay-aware token measurement service (ctx.tokenMeter) for the BEELLIX Harness"
  },
  "@beellix-ai/tool-ask-user": {
    "path": "packages/harness/interaction/builtin/tool-ask-user",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "security",
    "management": "builtin",
    "contributes": [
      "tools"
    ],
    "configuration": null,
    "zh": "基于用户交互 seam 的模型侧 ask_user_question 工具；供组合或排查交互式 agent 表面的用户与维护者阅读。",
    "en": "Model-facing ask_user_question tool over the ctx.userQuestions seam"
  },
  "@beellix-ai/tool-bash": {
    "path": "packages/harness/shell/builtin/tool-bash",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "execution",
    "management": "builtin",
    "contributes": [
      "tools"
    ],
    "configuration": {
      "href": "/admin/plugin-settings/shell"
    },
    "zh": "向模型提供一次性 Bash 命令、后台任务与审批升权入口。",
    "en": "Model-facing bash tool with optional generic background-job and sandbox-escalation support"
  },
  "@beellix-ai/tool-bash-persistent": {
    "path": "packages/harness/shell/builtin/tool-bash-persistent",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "execution",
    "management": "builtin",
    "contributes": [
      "tools"
    ],
    "configuration": null,
    "zh": "向模型提供跨调用保留状态、按所有者隔离的 Bash 工具。",
    "en": "Model-facing owner-scoped persistent Bash tool backed by the Harness PTY service"
  },
  "@beellix-ai/tool-call-timeout-policy": {
    "path": "packages/harness/guard/builtin/timeout-policy",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "security",
    "management": "builtin",
    "contributes": [
      "tools"
    ],
    "configuration": null,
    "zh": "为配合取消的工具调用设置协作式时间上限，并在超时流程完成后映射为清晰的模型错误，供选择或排查此插件的用户与维护者阅读。",
    "en": "Tool-call timeout policy: a tools/execute wrapper that arms a per-tool deadline on exec.signal and returns TOOL_TIMEOUT when it wins"
  },
  "@beellix-ai/tool-cordis": {
    "path": "packages/harness/extensions/development/tool-cordis",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "extensions",
    "management": "builtin",
    "contributes": [
      "tools"
    ],
    "configuration": null,
    "zh": "面向 agent 与维护者的 Cordis 运行时工具说明，用于选择、组合或排查动态包工作流。",
    "en": "Self-referential cordis toolset: inspect the live runtime, mount and dispose model-written plugins"
  },
  "@beellix-ai/tool-enterprise-resources": {
    "path": "packages/harness/enterprise/builtin/tool-enterprise-resources",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "extensions",
    "management": "builtin",
    "contributes": [
      "tools"
    ],
    "configuration": null,
    "zh": "通过私有资源客户端向模型贡献五个企业资源工具，卸载时释放工具注册。",
    "en": "Five enterprise resource tools through the private resource client; releases registrations on unload."
  },
  "@beellix-ai/tool-fs": {
    "path": "packages/harness/fs/builtin/tool-fs",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "files",
    "management": "builtin",
    "contributes": [
      "tools"
    ],
    "configuration": null,
    "zh": "向模型提供文本读取、图片读取、写入和编辑工具。",
    "en": "Model-facing filesystem tools (read, write, edit) over the BEELLIX Harness filesystem seam (ctx.fs)"
  },
  "@beellix-ai/tool-fs-search": {
    "path": "packages/harness/fs/builtin/tool-fs-search",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "files",
    "management": "builtin",
    "contributes": [
      "tools"
    ],
    "configuration": null,
    "zh": "向模型提供 glob 文件发现和 grep 内容搜索工具。",
    "en": "Model-facing filesystem discovery tools (glob, grep) backed by the packaged ripgrep binary (@vscode/ripgrep)"
  },
  "@beellix-ai/tool-goal": {
    "path": "packages/harness/goal/builtin/tool-goal",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "orchestration",
    "management": "builtin",
    "contributes": [
      "tools"
    ],
    "configuration": null,
    "zh": "面向选择、组合或排查 get_goal、create_goal 与 update_goal 的用户与维护者的模型侧 goal 工具说明。",
    "en": "Model-facing same-session goal tools with execution-time authority checks"
  },
  "@beellix-ai/tool-jobs": {
    "path": "packages/harness/jobs/builtin/tool-jobs",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "orchestration",
    "management": "builtin",
    "contributes": [
      "tools"
    ],
    "configuration": null,
    "zh": "面向模型的背景任务控制，供选择、配置或排查 job_output、job_list、job_kill 与完成通知的用户与维护者阅读。",
    "en": "Model-facing background job control tools (job_output, job_list, job_kill) over the ctx.jobs registry"
  },
  "@beellix-ai/tool-lsp": {
    "path": "packages/harness/lsp/builtin/tool-lsp",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "files",
    "management": "builtin",
    "contributes": [
      "tools"
    ],
    "configuration": {
      "href": "/admin/plugin-settings/lsp-stdio"
    },
    "zh": "向模型提供四种只读代码导航操作，限制返回结果规模。",
    "en": "Model-facing lsp tool over the BEELLIX Harness LSP capability seam (ctx.lsp) — one read-only tool with goToDefinition/findReferences/goToImplementation/hover operations, one-based UTF-16 cursor coordinates, bounded location rendering, and hover normalization"
  },
  "@beellix-ai/tool-present": {
    "path": "packages/harness/fs/builtin/tool-present",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "files",
    "management": "builtin",
    "contributes": [
      "tools"
    ],
    "configuration": null,
    "zh": "向工作区交付文件及预览入口。",
    "en": "Present workspace files and previews."
  },
  "@beellix-ai/tool-pwsh": {
    "path": "packages/harness/shell/builtin/tool-pwsh",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "execution",
    "management": "builtin",
    "contributes": [
      "tools"
    ],
    "configuration": {
      "href": "/admin/plugin-settings/shell"
    },
    "zh": "向模型提供一次性 PowerShell 命令、后台任务与审批升权入口。",
    "en": "Model-facing pwsh tool over the bash executor seam"
  },
  "@beellix-ai/tool-pwsh-persistent": {
    "path": "packages/harness/shell/builtin/tool-pwsh-persistent",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "execution",
    "management": "builtin",
    "contributes": [
      "tools"
    ],
    "configuration": null,
    "zh": "向模型提供跨调用保留状态、按所有者隔离的 PowerShell 工具。",
    "en": "Model-facing owner-scoped persistent PowerShell tool backed by the Harness PTY service"
  },
  "@beellix-ai/tool-ralph": {
    "path": "packages/harness/workflow/builtin/tool-ralph",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "orchestration",
    "management": "builtin",
    "contributes": [
      "tools"
    ],
    "configuration": null,
    "zh": "面向模型的 ralph 工具：面向一个不可变目标的固定前台全新 agent 循环，供选择或配置全新 agent 迭代的用户与维护者阅读。",
    "en": "Model-facing fresh-agent Ralph loop over the workflow and subagent seams"
  },
  "@beellix-ai/tool-session-query": {
    "path": "packages/harness/session-query/builtin/tool-session-query",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "sessions",
    "management": "builtin",
    "contributes": [
      "tools"
    ],
    "configuration": null,
    "zh": "面向 agent 开发者与维护者的工作区授权模型会话历史工具，用于选择、配置或排查既往会话搜索、追踪与事件读取。",
    "en": "Workspace-authorized model-facing session history search, trace, and event read tools"
  },
  "@beellix-ai/tool-skill": {
    "path": "packages/harness/skill/builtin/tool-skill",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "extensions",
    "management": "builtin",
    "contributes": [
      "tools",
      "skills"
    ],
    "configuration": {
      "href": "/admin/plugin-settings/skill-filesystem"
    },
    "zh": "向模型提供技能目录浏览和技能内容加载工具。",
    "en": "Model-facing skill loading tool for the BEELLIX Harness"
  },
  "@beellix-ai/tool-str-replace-editor": {
    "path": "packages/harness/fs/builtin/tool-str-replace-editor",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "files",
    "management": "builtin",
    "contributes": [
      "tools"
    ],
    "configuration": null,
    "zh": "提供 Claude Code 风格的独立文本替换编辑工具。",
    "en": "Model-facing view, create, literal replace, and line insert tool over the Harness filesystem service"
  },
  "@beellix-ai/tool-subagent": {
    "path": "packages/harness/subagent/builtin/tool-subagent",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "orchestration",
    "management": "builtin",
    "contributes": [
      "tools"
    ],
    "configuration": {
      "href": "/admin/plugin-settings/subagent-model-selection"
    },
    "zh": "面向模型的 subagent 委派工具，供用户与维护者配置、组合或排查基于 subagent 提供方的委派。",
    "en": "Model-facing subagent delegation tool over the ctx.subagents seam"
  },
  "@beellix-ai/tool-subagent-control": {
    "path": "packages/harness/subagent/builtin/tool-subagent-control",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "orchestration",
    "management": "builtin",
    "contributes": [
      "tools"
    ],
    "configuration": null,
    "zh": "全局 send_message、interrupt_agent 与 list_agents 工具，供用户与维护者组合或排查可继续子级的控制。",
    "en": "Globally named send_message, interrupt_agent, and list_agents tools over ctx.subagents continuations"
  },
  "@beellix-ai/tool-terminal": {
    "path": "packages/harness/terminal/builtin/tool-terminal",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "execution",
    "management": "builtin",
    "contributes": [
      "tools"
    ],
    "configuration": null,
    "zh": "向模型提供打开、读写、列出和关闭持久终端的六项工具。",
    "en": "Six model-facing persistent PTY tools with owner isolation and generic background-job integration"
  },
  "@beellix-ai/tool-todo": {
    "path": "packages/harness/todo/builtin/tool-todo",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "orchestration",
    "management": "builtin",
    "contributes": [
      "tools"
    ],
    "configuration": null,
    "zh": "面向 DeepSeek Harness 会话日志的模型侧 todo_write 工具：整表替换、单一会话归属与 todos 投影，供选择、配置或排查该工具的用户与维护者阅读。",
    "en": "Model-facing todo_write tool over the BEELLIX Harness event-sourced session log"
  },
  "@beellix-ai/tool-web": {
    "path": "packages/harness/web/builtin/tool-web",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "web",
    "management": "builtin",
    "contributes": [
      "tools"
    ],
    "configuration": {
      "href": "/admin/plugin-settings/web-search-routing"
    },
    "zh": "向模型提供 web_search 与 web_fetch 工具。",
    "en": "Model-facing web tools (web_search, web_fetch) over the BEELLIX Harness web capability seam (ctx.web)"
  },
  "@beellix-ai/tool-workflow": {
    "path": "packages/harness/workflow/builtin/tool-workflow",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "orchestration",
    "management": "builtin",
    "contributes": [
      "tools"
    ],
    "configuration": null,
    "zh": "面向模型的 workflow 工具：运行扇出 subagent 的 JavaScript 编排脚本，供选择或配置模型驱动编排的用户与维护者阅读。",
    "en": "Model-facing workflow tool: run a JavaScript orchestration script over ctx.workflowEngine"
  },
  "@beellix-ai/tool-working-directory": {
    "path": "packages/harness/session/builtin/tool-working-directory",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "sessions",
    "management": "builtin",
    "contributes": [
      "tools"
    ],
    "configuration": null,
    "zh": "读取或切换当前会话的工作目录，保留执行授权。",
    "en": "读取或切换当前会话的工作目录，保留执行授权。"
  },
  "@beellix-ai/tools": {
    "path": "packages/harness/core/tools",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "core",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "注册模型工具，管理调用限制、执行流水线与结果呈现。",
    "en": "Tool registry and execution pipeline for the BEELLIX Harness"
  },
  "@beellix-ai/typert-generator": {
    "path": "packages/harness/typert/generator",
    "ownership": "foundation",
    "kind": "library",
    "group": "interfaces",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "构建时 Typert 生成器：源代码类型分析、与编译器无关的模型与产物生成，供接入 Typert 发布或消费生成产物的维护者阅读。",
    "en": "TypeScript project analyzer and model-driven Typert artifact generator"
  },
  "@beellix-ai/typert-loader": {
    "path": "packages/harness/typert/builtin/loader",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "interfaces",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "生成的 Typert 产物所用的 Loader 集成：已挂载的包如何自动把宿主侧反射与 schema 贡献给运行时注册表。",
    "en": "Loader integration for generated Typert package contributions"
  },
  "@beellix-ai/typert-protocol": {
    "path": "packages/harness/typert/protocol",
    "ownership": "foundation",
    "kind": "library",
    "group": "interfaces",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "共享的 Typert Remote 协议：业务包、生成产物、Host Gateway 与 Client API 使用的装饰器、wire 描述符、编解码器与提供方约定。",
    "en": "Compiler-independent Remote metadata and Typert provider protocols"
  },
  "@beellix-ai/typert-registry": {
    "path": "packages/harness/typert/builtin/registry",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "interfaces",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "运行时 Typert 注册表：保存生成的包反射、实时 Zod schema 与 Remote 调用描述符，并按需为消费方解析。",
    "en": "Runtime registry for generated package reflection and Zod schemas"
  },
  "@beellix-ai/ui-admin": {
    "path": "packages/ui/admin",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "ui",
    "management": "builtin",
    "contributes": [
      "ui"
    ],
    "configuration": null,
    "zh": "账户、角色、模型、插件目录与运行配置等管理页面，写操作由服务端授权。",
    "en": "Account, role, model, plugin and runtime administration with server-authorized writes.",
    "displayZh": "管理后台",
    "displayEn": "Administration"
  },
  "@beellix-ai/ui-browser": {
    "path": "packages/ui/browser",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "ui",
    "management": "builtin",
    "contributes": [
      "ui"
    ],
    "configuration": null,
    "zh": "右侧实时网页画面、地址栏与人工接管。",
    "en": "Live browser viewport, navigation and human takeover.",
    "displayZh": "浏览器面板",
    "displayEn": "Browser panel"
  },
  "@beellix-ai/ui-components": {
    "path": "packages/ui/components",
    "ownership": "foundation",
    "kind": "component-library",
    "group": "ui",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "按钮、输入框、菜单、图标与主题标记等可复用展示，不装配运行服务。",
    "en": "Reusable controls, icons and theme tokens without runtime services.",
    "displayZh": "公共组件",
    "displayEn": "Shared components"
  },
  "@beellix-ai/ui-conversation": {
    "path": "packages/ui/conversation",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "ui",
    "management": "builtin",
    "contributes": [
      "ui"
    ],
    "configuration": null,
    "zh": "消息、输入区、当前会话选择、审批、任务及工具结果呈现。",
    "en": "Messages, composer, active-session controls, approvals, tasks and tool results.",
    "displayZh": "对话",
    "displayEn": "Conversation"
  },
  "@beellix-ai/ui-developer": {
    "path": "packages/ui/developer",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "ui",
    "management": "builtin",
    "contributes": [
      "ui"
    ],
    "configuration": null,
    "zh": "Cordis 开发诊断及调试展示，不因目录存在开放生产修改权限。",
    "en": "Cordis development diagnostics without granting production modification access.",
    "displayZh": "开发调试",
    "displayEn": "Developer tools"
  },
  "@beellix-ai/ui-extension-results": {
    "path": "packages/ui/extension-results",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "ui",
    "management": "builtin",
    "contributes": [
      "ui"
    ],
    "configuration": null,
    "zh": "扩展面板数据协议与安全结果展示；不启动或执行业务插件。",
    "en": "Extension panel data and validated result presentation, without business execution.",
    "displayZh": "扩展结果展示",
    "displayEn": "Extension results"
  },
  "@beellix-ai/ui-mailbox": {
    "path": "packages/ui/mailbox",
    "ownership": "business",
    "kind": "plugin",
    "group": "ui",
    "management": "extension",
    "contributes": [
      "ui"
    ],
    "configuration": null,
    "zh": "工作台内部成员收发、附件、独立草稿及对话引用。",
    "en": "Internal correspondence, attachments, drafts and conversation references in the workbench.",
    "displayZh": "内部工作信箱",
    "displayEn": "Internal mailbox"
  },
  "@beellix-ai/ui-mobile": {
    "path": "packages/ui/mobile",
    "ownership": "foundation",
    "kind": "library",
    "group": "ui",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "移动会话、工作、文件与账户；平板分栏和手机独立聊天页面。",
    "en": "Shared mobile and tablet user interface.",
    "displayZh": "移动端界面",
    "displayEn": "Mobile UI"
  },
  "@beellix-ai/ui-platform": {
    "path": "packages/ui/platform",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "ui",
    "management": "builtin",
    "contributes": [
      "ui"
    ],
    "configuration": null,
    "zh": "槽位渲染、会话绑定、设置同步、主题、语言及 Web 启动；不包含功能页面。",
    "en": "Slot rendering, session binding, settings synchronization, theme, locale and Web bootstrap.",
    "displayZh": "界面公共运行",
    "displayEn": "UI runtime"
  },
  "@beellix-ai/ui-records": {
    "path": "packages/ui/records",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "ui",
    "management": "builtin",
    "contributes": [
      "ui"
    ],
    "configuration": null,
    "zh": "请求轨迹、运行记录与会话日志下载，数据来自既有持久记录。",
    "en": "Request trajectories, execution records and durable session-log downloads.",
    "displayZh": "运行记录",
    "displayEn": "Execution records"
  },
  "@beellix-ai/ui-resources": {
    "path": "packages/ui/resources",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "ui",
    "management": "builtin",
    "contributes": [
      "ui"
    ],
    "configuration": null,
    "zh": "为已确认的管理后台提供知识库与数据连接界面，不挂载独立成员门户。",
    "en": "Knowledge and connection views for administration, without standalone member portals.",
    "displayZh": "后台资源管理",
    "displayEn": "Resource administration"
  },
  "@beellix-ai/ui-settings": {
    "path": "packages/ui/settings",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "ui",
    "management": "builtin",
    "contributes": [
      "ui"
    ],
    "configuration": null,
    "zh": "偏好、新会话默认权限与预设管理；当前会话选择留在对话。",
    "en": "Preferences, default permissions and preset management.",
    "displayZh": "设置",
    "displayEn": "Settings"
  },
  "@beellix-ai/ui-shell": {
    "path": "packages/ui/shell",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "ui",
    "management": "builtin",
    "contributes": [
      "ui"
    ],
    "configuration": null,
    "zh": "整体布局、主侧栏、导航入口与品牌内容，由功能通过槽位扩展。",
    "en": "Application layout, sidebar, navigation and branding extended through slots.",
    "displayZh": "应用框架",
    "displayEn": "Application shell"
  },
  "@beellix-ai/ui-workspace": {
    "path": "packages/ui/workspace",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "ui",
    "management": "builtin",
    "contributes": [
      "ui"
    ],
    "configuration": null,
    "zh": "项目和会话导航、创建与归档，以及按宿主能力选择的目录交互。",
    "en": "Project and session navigation, creation, archiving and host-selected directory interaction.",
    "displayZh": "项目与会话管理",
    "displayEn": "Projects and sessions"
  },
  "@beellix-ai/user-approval": {
    "path": "packages/harness/interaction/builtin/user-approval",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "security",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "与通道无关的一次性审批 seam；供组合应答者、设置策略或排查以拒绝方式关闭的权限决定的用户与维护者阅读。",
    "en": "User-approval seam (ctx.approval) for the BEELLIX Harness: one-shot permission decisions dispatched to composed answerers over the approval/request waterfall, fail-closed by default"
  },
  "@beellix-ai/user-questions": {
    "path": "packages/harness/interaction/builtin/user-questions",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "security",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "基于 waterfall 的问答服务，用于工具、权限插件、本地 answerer 与 Agent-scoped Web 交互。",
    "en": "Abstract user-questions seam (ctx.userQuestions) for asking the human during agent runs"
  },
  "@beellix-ai/util-code-language": {
    "path": "packages/shared/common/code-language",
    "ownership": "foundation",
    "kind": "library",
    "group": "engineering",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "统一文件扩展名与语法高亮语言映射。",
    "en": "统一文件扩展名与语法高亮语言映射。"
  },
  "@beellix-ai/util-crypto": {
    "path": "packages/shared/common/crypto",
    "ownership": "foundation",
    "kind": "library",
    "group": "platform",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "面向替换仅安全上下文可用的 crypto.randomUUID 调用的维护者，说明跨运行时 UUID 生成。",
    "en": "Zero-dependency browser-safe UUID and byte-encoding helpers"
  },
  "@beellix-ai/util-time": {
    "path": "packages/shared/common/time",
    "ownership": "foundation",
    "kind": "library",
    "group": "platform",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "面向在协议边界接收调用方所报时区的维护者，说明 IANA 时区校验与规范化。",
    "en": "Zero-dependency time vocabulary shared by wire boundaries: canonicalClientTimeZone (IANA zone validation and canonicalization only, no formatting)"
  },
  "@beellix-ai/util-values": {
    "path": "packages/shared/common/values",
    "ownership": "foundation",
    "kind": "library",
    "group": "platform",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "供运行时包使用的无损 JSON 校验、分离式快照、深度冻结、结构相等与穷尽联合类型辅助函数。",
    "en": "Duplicate-install-safe value primitives for the BEELLIX Harness"
  },
  "@beellix-ai/util-workspace-path": {
    "path": "packages/harness/workspace/paths",
    "ownership": "foundation",
    "kind": "library",
    "group": "platform",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "浏览器安全的 Workspace 路径辅助函数：拼接相对路径、缩写 POSIX 主目录并生成显示标题。",
    "en": "Browser-safe Workspace path and display helpers"
  },
  "@beellix-ai/web": {
    "path": "packages/harness/web/builtin/web",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "web",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": {
      "href": "/admin/plugin-settings/web-search-routing"
    },
    "zh": "统一网页搜索与 URL 抓取，选择对应提供方。",
    "en": "Abstract web access capability seam (ctx.web) for the BEELLIX Harness — search/fetch provider registry, registration-order-independent selection, request/result vocabulary, and the WebError taxonomy"
  },
  "@beellix-ai/web-app": {
    "path": "apps/harness/web-bundle",
    "ownership": "foundation",
    "kind": "bundle",
    "group": "platform",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "dsh 的浏览器 GUI：交互式聊天、模型与设置管理、会话历史，供用户运行 dsh web 表层。",
    "en": "The dsh browser-surface bundle: the web patch layer over dsh-base plus the runtime glue plugin (frontend dist serving, web-surface prompt, bash runtime variables, URL line)"
  },
  "@beellix-ai/web-fetch-http": {
    "path": "packages/harness/web/builtin/web-fetch-http",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "web",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "ctx.web 的匿名公共 HTTP(S) 抓取后端：部署方如何挂载有界、安全的 URL 抓取，含同源重定向与仅文本解码。",
    "en": "Anonymous public HTTP(S) fetch provider for the BEELLIX Harness web capability seam (ctx.web)"
  },
  "@beellix-ai/web-frontend": {
    "path": "apps/web",
    "ownership": "foundation",
    "kind": "application",
    "group": "platform",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "Web 产品入口，构建登录页并装配会话与管理员界面。",
    "en": "Web application entry, login page, conversation and administration assembly."
  },
  "@beellix-ai/web-search-deepseek": {
    "path": "packages/harness/web/extensions/web-search-deepseek",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "web",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": {
      "href": "/admin/plugin-settings/web-search-deepseek"
    },
    "zh": "ctx.web 的 DeepSeek 搜索提供方：部署方如何通过 Anthropic 兼容 Messages API 挂载 DeepSeek 原生 web 搜索，并逐次解析凭据。",
    "en": "DeepSeek-backed search provider (native web_search via the Anthropic-compatible API) for the BEELLIX Harness web capability seam (ctx.web)"
  },
  "@beellix-ai/web-search-exa": {
    "path": "packages/harness/web/extensions/web-search-exa",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "web",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": {
      "href": "/admin/plugin-settings/web-search-routing"
    },
    "zh": "ctx.web 的 Exa 搜索提供方：部署方如何挂载厂商原生 web 搜索，获得可移植 snippet 与发布日期。",
    "en": "Exa-backed search provider for the BEELLIX Harness web capability seam (ctx.web)"
  },
  "@beellix-ai/web-search-perplexity": {
    "path": "packages/harness/web/extensions/web-search-perplexity",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "web",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": {
      "href": "/admin/plugin-settings/web-search-routing"
    },
    "zh": "ctx.web 的 Perplexity 搜索提供方：部署方如何挂载 OpenAI 兼容的 Perplexity 搜索，获得生成答案与引用。",
    "en": "Perplexity-backed search provider for the BEELLIX Harness web capability seam (ctx.web)"
  },
  "@beellix-ai/webhook": {
    "path": "packages/harness/webhook/builtin/webhook",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "web",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "面向注册可信外部事件策略并创建 Workspace Session 的维护者，说明 webhook 规则运行时。",
    "en": "Fire-and-forget webhook rule runtime that creates Workspace-backed BEELLIX Harness Sessions"
  },
  "@beellix-ai/webhook-github": {
    "path": "packages/harness/webhook/extensions/webhook-github",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "web",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "面向把已认证 JSON 事件路由到 webhook 运行时的部署，说明带签名的 GitHub webhook 适配器。",
    "en": "Signed GitHub HTTP webhook adapter for the BEELLIX Harness webhook runtime"
  },
  "@beellix-ai/win32-process": {
    "path": "packages/harness/subprocess/win32-process",
    "ownership": "foundation",
    "kind": "library",
    "group": "execution",
    "management": "technical",
    "contributes": [],
    "configuration": null,
    "zh": "面向实现或排查 Windows ACL 沙箱的维护者，说明底层 Win32 进程原语。",
    "en": "Low-level Win32 process, stdio, and Job Object primitives for the BEELLIX Harness Windows sandbox"
  },
  "@beellix-ai/workflow": {
    "path": "packages/harness/workflow/builtin/workflow",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "orchestration",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "工作流编排能力：运行由模型编写的、扇出 subagent 的脚本，供选择或构建在 ctx.workflowEngine 之上的用户与维护者阅读。",
    "en": "Workflow capability seam: ctx.workflowEngine service, run vocabulary, and workflow/* events"
  },
  "@beellix-ai/workflow-worker-thread": {
    "path": "packages/harness/workflow/builtin/workflow-worker-thread",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "orchestration",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "worker-thread 工作流引擎：在宿主事件循环之外执行由模型编写的编排脚本，供选择或配置执行隔离的用户与维护者阅读。",
    "en": "worker-thread workflow engine: executes model-written orchestration scripts off the host event loop, bridging agent() calls back to ctx.subagents"
  },
  "@beellix-ai/working-directory": {
    "path": "packages/harness/session/builtin/working-directory",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "sessions",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "维护会话当前目录、有效性和持久化恢复。",
    "en": "维护会话当前目录、有效性和持久化恢复。"
  },
  "@beellix-ai/workspace": {
    "path": "packages/harness/workspace/builtin/workspace",
    "ownership": "foundation",
    "kind": "plugin",
    "group": "files",
    "management": "builtin",
    "contributes": [
      "services"
    ],
    "configuration": null,
    "zh": "持久保存工作区记录，校验会话所属工作区。",
    "en": "Workspace entity registry (ctx.workspaceRegistry): durable workspace records with validated session attachment over the domain data form for the BEELLIX Harness"
  }
} as const
