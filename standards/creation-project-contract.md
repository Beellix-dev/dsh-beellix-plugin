# Beelli X 创造工程描述协议 v1

## 1 格式与效力

工程根新增 beellix.project.json，按 [Schema](schemas/beellix-project-v1.schema.json) 校验。本文定义跨字段语义，Schema 通过不代表这些检查已通过。未知字段拒绝，扩展更新协议。

工程文件可由模型编辑；可信工程登记、权限、检查与回执由宿主控制面维护，不能用自报字段替代。工程格式、标准、模板、npm 包、桥接、服务契约、数据结构和迁移分别管理版本。

## 2 字段

| 字段 | 含义与校验 |
| --- | --- |
| schemaVersion、standardVersion | Schema仍1；新工程用标准1.1.0，兼容1.0.0描述；未知标准拒绝，不改写已有文件 |
| projectId | 稳定 UUID，与宿主登记及工程根匹配 |
| plugin.id/name/title/type | 稳定插件身份、包名、名称与主要类型；与打包清单一致 |
| template.id/version | 起始模板与精确版本；来源、摘要另存宿主回执 |
| ecosystem | 能力 ID、提供包、契约区间、features 和必需性；不是 npm dependencies |
| storage | none/config/postgres 与数据结构代次；非原生会话存储 |
| initialization | 不需要业务初始化或用户首次启用时初始化；禁止加载即建库 |
| access | 文件、网络、进程和服务的用途及访问方式；不是实际授权 |

ecosystem.contract 是整数接口兼容区间，features 来自真实提供方；没有真实契约的需求只能用于设计，不得通过就绪门禁。access.resource 是逻辑资源 ID，不是任意路径授权。

v1 postgres 场景按插件＋账套隔离，postgres 能力按能力＋实例隔离。tool、skill、ui 如需结构化业务库，应改为有对应归属的 capability 或 scene。数据库管理员和 SQL 权限不授予模型。

## 3 跨字段检查

1. plugin 身份与 package.json、tarball 清单及宿主登记一致。一个包选择 scene 或 capability 运行身份，不混合冒用。
2. ui 类型的运行身份映射未实现前，不可发布为生态可安装包。
3. postgres 必须声明 required=true 的 database 依赖，provider=@beellix-ai/database，service:database 的 read-write 访问，存在有效迁移。其他存储不含 migrations。
4. database 与 knowledge 的提供方分别为当前生态官方服务；其他依赖从真实目录解析。声明服务访问必须有对应生态依赖。
5. 知识只读声明 service:knowledge read；write/read-write 需要独立维护授权。应用声明不自动开启会话知识开关。
6. 可选依赖有真实降级路径；用户核心需求不能靠标为 optional 掩盖缺失。必需依赖未就绪可保存工程，但应用不标 ready。
7. 路径使用工程相对 POSIX 格式，拒绝绝对路径、反斜线、空段、点段、重解析点逃逸和大小写别名冲突，宿主再次核验真实路径。
8. 契约 min<=max；生态 ID 不重复，access 同一资源不重复。版本、features、方法与真实提供方文档匹配。
9. 数据版本与迁移一致，历史迁移不改写；未实现通用升级协调前遵守原安装器拒绝规则。
10. 仅1.1.0新增：required生态能力同步到运行清单beellixRequirements，运行contractVersion落在描述min/max内且包含所需features；非chat模型用途不得default=host-main。1.0.0保留原静态规则。这不证明目标服务存在或权限、能力与初始化已通过。

## 4 样例与运行声明

[库存场景](examples/creation/inventory.project.json) 使用必需数据库和可选只读知识库；[单位换算](examples/creation/unit-converter.project.json) 无数据库。样例已声明标准1.1.0，模板版本仍是起始模板自己的版本。它们是描述校验夹具，不是应用或安装包。知识实际提供方已有契约1，但样例不会检查用户是否安装、初始化或授权；真实服务就绪另验收。

运行包保留原生入口及现有插件契约。后续须正式定义、生成并强制消费运行依赖、初始化和权限协议；该实现完成前，不能以此工程文件宣称运行依赖检查已生效。
