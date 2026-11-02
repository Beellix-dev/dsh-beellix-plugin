# 模型页接入与验证

开发根：`E:/BELLIX_AGENT/Beellix_Plugins`。包版本固定为0.1.1；源码、已验证候选和当前客户端采用分别记录在 STATUS.md。插件专用模型与主聊天模型分开，旧场景主模型覆盖设计已撤销。

## 页面

主模型配置管理DSH原生厂商、服务连接、模型目录与凭据，沿原生ProviderEditor、CustomProviderCard和能力校验；知识库沿用的主模型不另造一个插件连接。

插件模型配置按插件分组。知识库标签只管理该插件专用的模型／服务连接：MinerU文档解析、向量模型、重排模型，直接显示连接与配置／启停操作，不展示入库处理、检索流程页签或聊天增强模型表单。MinerU是文档解析增强，不是备用聊天模型。入库、检索的使用策略属于知识库自己的配置；模型页不承载流程配置。

旧适配器的configurationGroups元数据与稳定用途ID保留兼容，但不据此在模型页生成业务流程。未分组的旧插件仍沿已有目录。主模型沿用用途不重复显示；已有显式专用聊天选择保留可见，可按原修订协议恢复主模型，不自动清除或迁移用户配置。向量、重排、解析继续打开业务包原连接表单；上传范围与授权保留在MinerU连接配置中。

用量与余额读取所选服务官方接口，缺数据为“—”，不跨模型累加或跨币种换算。模型页不加入工具、MCP或技能目录，它们仍沿DSH原生运行。

## 执行接入

工作区和场景的主对话都使用 DSH 原生模型选择、提示装配和请求链。UI 不在 `agent/request` 或 `system-prompt/assemble` 覆盖场景主模型。旧 `config/scene-models.json` 保留但不再读取执行，也不写入或转换旧会话。

专用模型通过已登记场景提供方，或公共能力 `beellixPlatform.register()` 的可选 `modelConfiguration` 接口接入：`read()` 返回 `{revision,purposes:[{id,title,kind?,inputModalities?,selection}]}`，`write({purposeId,selection,expectedRevision})` 由提供方再次检查修订并保存。`kind` 为 `vision/document/audio/retrieval/other`，旧适配器未声明时归入“其他”，不按用途名称猜测。`inputModalities` 声明所需输入；chat 用途仅接受 DSH 原生模型目录中的路由。工具包、技能包、模型包、连接包也可用同一已归属登记接入。原 `/models/scenes` 接口兼容保留，新页面使用 `/models/plugins`。当前已采用报价包未声明专用模型接口，不能据此声称其 OCR 服务已接入。

图片消息、文件读图及模型能力校验完全沿 DSH 原生链路，不覆盖 `read_image`，不增加通用视觉模型路由或辅助推理调用。已核对本机原生 `deepseek-flash`（DeepSeek-V4.1-Flash）声明图片输入，并有原生图片消息直接回答的会话证据；不能笼统认为所有 DeepSeek 模型都不支持图片。具体能力以所选型号为准；插件若另有 OCR 等专用任务，仍由该插件声明并执行。

用户已撤销此前未采用的通用视觉路由候选。新的 `/models/plugins` 不再返回或接收该配置，不读取、不改写已有 `config/model-routing.json`；该文件若已存在则原样保留。旧会话、原 `scene-models.json` 和业务资料不转换。原生主模型的输入限制仍由 DSH 处理。

## DeepSeek Search / Fetch

主模型的 DeepSeek 详情沿用原搜索卡片，开关为“使用 Search API”。`GET/POST /models/search` 接原生 `web`、`web-deepseek-api` 和兼容搜索提供方；只读取主连接的 `apiKeyEnv` 引用，不在页面增加另一份密钥输入，也不将明文密钥返回前端或保存到配套目录。启用前先同步提供方引用，再选择 `deepseek-search-api` 与 `deepseek-fetch-api`；关闭恢复原生兼容搜索与 HTTP 抓取，不意味着卸载所有网页工具。

只接直连 `deepseek-official`，接受原版 Messages 的官方 `/anthropic` 地址；主连接为代理站、环境指定非官方地址或只配有旧明文密钥时，拒绝借用凭据。搜索请求固定到官方 `/v1/tools`，不将主连接凭据转发到其他搜索地址。原生凭据轮换在下一次调用生效；更换凭据引用后，页面提示重新启用同步。接口受原有连接授权、操作令牌与修订校验保护。传输与鉴权沿 DSH 原生插件，不另写网页搜索实现。

## 官方数据实际范围

| 连接 | 模型 | 价格 | 余额 | 历史用量 |
|---|---|---|---|---|
| 直连 DeepSeek API Key | 官方 `/models` | 在线读取官方中文定价表，保留高峰/空闲和人民币单位 | 官方 `/user/balance` | 尚未接入，提供官方账单链接 |
| 直连 OpenAI API Key | 官方 `/v1/models` | 官方定价链接 | 未接入 | 未接入 |
| 其他厂商、DSH账户登录及自定义中转 | 按当前适配范围显示 | 未接入时只提供已核对的官方链接 | 未接入 | 未接入 |

普通推理密钥不等于财务管理凭据。未实现的接口不能显示“同步成功”、零用量或零余额，也不把手动价格和本机日志伪装成原厂全账户账单。

查询通过现有 DSH 凭据服务，仅向内部固定的官方地址发送对应密钥；中转地址和账户登录路线不借用另一条 API Key 查询余额。禁止携带密钥跟随重定向，限制超时和响应体积，响应及磁盘缓存不含密钥。数据只在内存短暂缓存；价格表变化无法可靠解析时显示缺数据，不返回猜测价格。

来源：[DeepSeek模型](https://api-docs.deepseek.com/api/list-models/)、[图片输入](https://api-docs.deepseek.com/guides/vision/)、[余额](https://api-docs.deepseek.com/api/get-user-balance/)、[价格](https://api-docs.deepseek.com/zh-cn/quick_start/pricing/)、[官方用量入口](https://platform.deepseek.com/usage)。

## 验证边界

历史证据：`.artifacts/model-center-20261026/`。本轮候选与验证位于 `.artifacts/model-routing-20261027/`：仅插件声明用途、空列表、修订冲突、旧配置原样保留、拒绝已撤销的路由写入、原生 Search/Fetch 共用凭据、HTTP写入保护及卡片交互。网络传输用隔离响应或本地兼容服务，不使用用户真实密钥或真实计费请求。专用用途适配器使用夹具，不能当作已交付的 OCR/知识检索业务。隔离验收不代表已切换日常客户端。

DeepSeek公开定价页此前已联网抓取和解析，记录在 `official-pricing-live.json`。账户余额、鉴权和异常分支通过隔离接口测试，未使用用户真实密钥验收余额。

## 知识包专用操作

MinerU由知识包声明`kind:document, operation:parse, id:parser`，在“插件模型配置 → 知识库”显示独立连接。只进入知识包`model:parser`原生弹窗，保留上传授权、密钥存储与原启停协议。解析连接不加入聊天模型目录，不覆盖主模型。

`configurationGroups`可声明`kind:'connection'`，表示同一服务连接的多个专用用途。中台只合并同一配置面板且至少有两个非chat用途的连接，保留各自状态／启停；一个服务只有一个配置入口。未声明该kind的旧业务分组不生成流程导航，未分组的旧插件继续使用原目录与卡片。知识库Qwen API共用一个密钥、分别选择向量与重排模型；本地／其他服务连接保持独立，MinerU独立。入库整理沿用主模型时不重复列出连接，已有显式选择保留可见并可恢复主模型。入库与检索的规则和策略属于知识库设置。

专用用途可增加 `configured`、`enabled`、`canToggle` 和 `connection: {kind:'local'|'api',model,endpoint?}`。连接信息只包含模型和无凭据地址，拒绝密钥字段及带账号/密码/查询串的 URL；不从非聊天模型伪造上下文窗口或聊天能力。旧适配器没有这些字段时仍可配置，但开关只读并说明原因。启停使用 `write({purposeId,enabled,expectedRevision})`，不能同时提交 selection；仅允许已声明 canToggle 的非chat用途。配置按钮打开该插件的配置页，详情显示真实连接，不复制密钥。

知识模型的 enabled 默认兼容为 true；只有用户操作才写入。关闭检索阻止新推理、保留待处理任务与原有资料；恢复后继续，不清除连接、缓存或凭据。停用可选重排时沿用原检索排序。修订冲突拒绝覆盖，不改主模型或旧会话；插件停用时配置与开关均禁用。需共同安装支持该扩展的 UI/知识候选，旧包不自动获得这些能力；采用状态见知识实施说明和 STATUS.md。

专用模型可由业务包声明`modelOptions:string[]`，中台使用统一行内选择器，不内置厂商型号。选择提交`write({purposeId,modelId,expectedRevision})`；服务端再次核对该用途声明的型号、连接可用性和修订，拒绝混合写入。已有共用服务密钥时，业务包可允许未独立配置的可选用途直接启用，并由业务包创建默认连接；缺少密钥时，点击开关进入该业务包的连接表单。中台不保存密钥、不调用模型、不实现知识业务。
