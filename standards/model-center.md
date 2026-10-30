# 模型页接入与验证


## 页面

- 主模型配置：沿原厂商目录、图标、启停及模型详情。右上角“添加模型”使用已有 ProviderEditor、CustomProviderCard；提供商与自定义 API 两种接入，凭据、地址、协议、模型发现和手动模型清单仍由 DSH 原组件及服务保存。内置适配器的编辑窗口也接回完整 ProviderEditor；专用原生认证仍沿其自身流程。
- 插件模型配置：顶部按插件名称生成标签，一个插件只有一个标签，例如“知识库”；该插件的全部模型用途在同一标签内展示卡片，10项用途也不拆成文档／检索／其他标签。完全复用主模型卡片、图标、详情和配置弹窗，不使用配置表格或用途下拉。只列出已安装插件明确声明的用途，无声明的插件不生成标签；没有任何声明时显示“暂无需要配置的插件模型”。向量／重排／解析等卡片打开插件自己的连接设置；聊天整理等用途点击配置后进入已有原生模型目录，返回仍在同一插件标签，原生添加、提供方编辑、能力过滤与选择继续保留。包声明沿用主模型时如实展示，不能把未配置的其他用途伪装为可用。用途选择不更改主聊天模型；原生目录明确不支持所需输入的模型不参与选择，保存时再验证真实模型能力。
- 用量与余额：选择已配置服务，余额与用量用图标指标，模型和价格用表格。缺数据为“—”，原因及计费时段放在提示中，账单和价格保留官方链接。余额属于所选连接的账户，不跨模型累加，不跨币种换算。

模型页移除工具、MCP和技能目录。它们仍通过 DSH 原插件与会话服务运行；没有删除其原生能力。运行页保留任务记录；旧本地计量数据和接口保留，不冒充官方账单。

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

DeepSeek公开定价页此前已联网抓取和解析，记录在 `official-pricing-live.json`。账户余额、鉴权和异常分支通过隔离接口测试，未使用用户真实密钥验收余额。

## 知识包专用操作

MinerU由知识包声明 `kind:document, operation:parse, id:parser`，在“插件模型配置 → 知识库”标签内用同一 `CatalogVendorCard` 显示“知识库 · 文档解析 · MinerU”。配置仅进入 `beellix-knowledge` 的 `model:parser` 原生弹窗，填写API Key、确认官方上传范围后保存；知识库业务设置不重复放连接入口。开关启用API解析或恢复本地解析，保留已存Key、原件及索引。解析连接不加入聊天模型目录，不覆盖主模型，元信息不返回密钥。`parse`与embedding/rerank同属非聊天专用操作，包声明、运行校验与公开类型一起约束；旧插件不必增加此用途。

知识包使用可校验的beellixModels声明。chat用途仍沿原生厂商/模型目录；embedding/rerank/parse不进入聊天目录，但使用与主模型相同的 `CatalogVendorCard` 组件和CSS：图标/名称在左，配置/开关在右上，真实模型与运行方式在中间，状态/版本/详情在底部。搜索、状态筛选、卡片网格与主模型保持一致；顶部按插件分组，一个“知识库”标签显示该插件所有用途，不再按文档／检索拆标签或通过用途下拉隐藏卡片。专用连接不显示创建聊天模型的“添加模型”按钮；chat用途仍保留原入口。

专用用途可增加 `configured`、`enabled`、`canToggle` 和 `connection: {kind:'local'|'api',model,endpoint?}`。连接信息只包含模型和无凭据地址，拒绝密钥字段及带账号/密码/查询串的 URL；不从非聊天模型伪造上下文窗口或聊天能力。旧适配器没有这些字段时仍可配置，但开关只读并说明原因。启停使用 `write({purposeId,enabled,expectedRevision})`，不能同时提交 selection；仅允许已声明 canToggle 的非chat用途。配置按钮打开该插件的配置页，详情显示真实连接，不复制密钥。

知识模型的 enabled 默认兼容为 true；只有用户操作才写入。关闭检索阻止新推理、保留待处理任务与原有资料；恢复后继续，不清除连接、缓存或凭据。停用可选重排时沿用原检索排序。修订冲突拒绝覆盖，不改主模型或旧会话；插件停用时配置与开关均禁用。需共同安装支持该扩展的 UI/知识候选，旧包不自动获得这些能力；采用状态见知识实施说明和 验证说明。
