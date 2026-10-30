# 企业业务模块：现有底座检查与开发准入

检查日期：2026-10-28。适用个人、本机小团队业务管理及后续企业应用开发。这里的“企业业务”是财务、合同、人事等业务类型；当前运行身份仍为本机单主用户，不能宣称已经支持远程多人协作、部门数据隔离或企业IAM。本轮源码候选与日常客户端采用分别记录，不据此变更旧库、旧会话或包版本。

## 1. 检查结论与责任

现有底座可以承接新的本地业务模块，继续使用现有中台、DSH和数据库插件。数据库互通解决资料可访问的问题；各模块还须明确谁负责原始记录、谁执行业务动作、如何引用原对象和防止重复提交。不要再建设第二套数据库、通用资源中台、Agent执行器或插件结对设置。

| 项目 | 现有实现或本轮补齐 | 新模块怎么做 |
| --- | --- | --- |
| 安装、分类、启停、依赖和保留卸载 | 原有中台登记、Include加载、包契约 | 复用现有安装链；静态依赖声明不等于自动安装依赖 |
| PostgreSQL、隔离实例、迁移、附件、备份恢复 | 原有database SDK | 只登记本模块迁移，显式首次初始化；旧库不重新建、不合并；恢复副本不替代原实例 |
| 数据发现和访问 | 原有ctx.beellixData与原生beellix_data | 从catalog取真实资源和数据库ID，describe按需取契约；不开放任意SQL、文件或Odoo方法 |
| 动作输入校验 | 本轮让既有inputSchema在统一入口实际执行 | 每个read/write/export都提供有界JSON Schema；不转换类型、不补默认值、不删除未知字段；领域规则继续由原服务执行 |
| 跨模块对象关联 | 本轮给既有服务增加record-references feature及resolve | 保存原资源、原数据库、对象类型与原ID，读取原业务服务；不复制主数据、不按同名自动合并 |
| CRM、进销存对象 | 本轮薄适配原有get服务 | CRM五类对象用字符串ID；进销存现有十类对象用整数ID；不新建主数据数据库 |
| 人工审核、幂等、修订冲突 | 原CRM和进销存业务服务 | 新模块实现领域规则和真实原生逐条审核；通用描述或confirmed字段不能代替审核 |
| 会话、工具、模型、知识范围 | 原DSH及中台知识选择 | 复用真实exec.agent、原生工具、知识开关和模型配置，子代理只读；不另造执行循环 |
| UI与列表 | 原DESIGN与场景工作台 | UI由Beelli X重做；按任务分页面，列表保留决策字段，详情按需展开，不照搬上游整站或内嵌第二套后台 |
| 模块开发检查 | 本轮可选business v1扩展和原生检查器 | 检查数据责任、引用、引擎来源、许可及必要验收项；通过仍是ready:false |

稳定引用是对象定位契约，不等于主数据清洗、自动同步、跨库事务或完整企业权限。客户关系记录由CRM负责，开票与结算主体由进销存负责，二者可关联但不能直接视为同一法律主体。交易快照由交易模块保留，不能因客户改名回写历史单据。

## 2. 现有统一数据服务的兼容扩展

服务仍为contractVersion:1；增加features `validated-input`、`record-references`。旧提供方未声明Schema或recordTypes仍可运行；新业务模块必须声明Schema，需要对象引用时先检查feature和方法存在，缺失明确提示更新入口包，不能静默回退到复制记录。特性存在也不保证目标资源、数据库已安装或就绪。

资源登记额外接受recordTypes：每项含entity、title、idType（string或integer）、read(reference,scope)。read使用本模块原有详情方法；写入仍沿原业务命令，不允许提供SQL／任意模型调用。describe只返回对象类型元数据，不暴露回调或连接凭据。

```js
const data=ctx.beellixData
if(data.contractVersion!==1||!data.features?.includes('record-references'))throw Error('请更新中台入口包')
const api=data.forAgent(exec.agent)
// resource、accountId、entity取真实catalog/describe，id取实际查询结果。
const reference={version:1,resource:'sales-crm.business',accountId:crmDatabaseId,entity:'customers',id:customerId}
const {record}=await api.resolve(reference,{signal:exec.signal})
```

原生工具对应`beellix_data {action:'resolve',reference}`。引用精确区分资源、数据库、对象类型及ID类型（整数1不等于文本"1"）。不包含凭据、SQL、调用者身份或用户权限。对象丢失、原库不在、提供方停用、知识选择撤销或任务取消时明确失败，不能自动转向恢复副本或同名对象。解析只读，交付结果前重验真实Agent和当前服务状态。

输入与结果采用有界纯JSON；普通请求120000字节，结果2MiB，深度40。批量业务沿既有领域限制；不要为逃避限制拆开一个必须原子提交的交易。登记Schema只接受本地同步Schema，不联网取远端$ref，不执行异步校验。审计记录动作与结果，不复制完整业务正文。

## 3. 可选业务描述v1

标准仍为1.1.0，旧工程Schema、桥接代次、数据代次及包版本不变。此扩展不是新的运行身份，也不要求额外安装data-platform包。新业务模块在原工程之外加入：

```json
{"beellixBusiness":{"schemaVersion":1,"profile":"beellix.business.json"}}
```

以上字段属于package.json，并把`beellix.business.json`加入files白名单。完整结构见[Schema](schemas/beellix-business-v1.schema.json)及[合同示例](examples/creation/contracts.business.json)。合同示例仅示范职责和依赖，不表示已交付合同插件。

| 字段 | 要求 |
| --- | --- |
| moduleId、deployment | 对齐工程模块ID；当前仅local-owner可通过，多人企业身份尚未交付 |
| dataFeatures | 声明真实需用特性；运行时还须协商，不伪造生态提供包 |
| resources | 只声明本模块拥有的唯一资源、动作与对象类型；写入必须有native审核和幂等 |
| references | 声明原提供方、资源、类型和是否必需；对象ID在运行时查询，不硬编码现用库 |
| engine.kind=native | 自有实现；不能冒充采用某开源引擎 |
| engine.kind=existing-provider | 复用已有引擎程序；storage省略或provider时必须有真实必需业务引用，storage=scene时须由本场景数据库SDK独立初始化并协商隔离工厂。共享程序不推定共享业务库 |
| engine.kind=embedded-upstream | 锁定HTTPS源码仓库、40位提交、模块、许可证与打包授权说明；实际依赖闭包和源码交付仍须专项验收 |
| verification | 声明必须验证的项目，不能当通过凭证；实际结果按任务验收保存 |

Codex／人工调用现有`checkProject`检查真实文件；DSH创造模式继续用`beellix_develop action=check`，可同时传business对象；`read business/businessSchema/businessExample`按需取相同内容。静态检查不执行项目代码、不连业务库、不安装插件；不能证明真实权限、原生加载或业务正确。

每个业务模块至少验证输入拒绝、取消与停用、备份恢复、真实原生加载、最终安装包；写入增加逐条拒绝不入库、确认后入库、重复提交和修订冲突；涉及关联增加跨库同ID、ID类型、对象缺失和恢复副本不重定向。列表／筛选／分页、详情、操作状态、导入导出、空态、窄屏／全屏根据真实需求补充，不以描述表代替功能测试。

## 4. 模块划分与开源复用路线

优先沿已采用的Odoo Community 19引擎和现有database SDK扩展。现有进销存是已实现的有界业务适配，不是Odoo全部应用的通用代理。新增项目、人事或生产模块前先验证该模块依赖和迁移；本轮只核对源码清单，没有向日常库安装Odoo模块。

| 业务模块 | 责任／与已有模块的边界 | 优先核对的成熟上游 |
| --- | --- | --- |
| CRM | 继续完善现有客户、商机和跟进；不另建第二套CRM | 保留当前实现；Odoo crm只作对照，不把原数据迁入第二引擎 |
| 采购、销售、库存 | 当前进销存已负责商品、往来、订单、履约 | 复用现有purchase、sale、stock适配 |
| 财务与费用 | 复用已有应收应付、收付与核销；新增总账／报销按边界扩展 | Odoo account、hr_expense；不能把Invoicing模块直接宣称完整财务与本地合规 |
| 合同与履约 | 合同文本、条款、续签、履约节点；关联CRM客户和进销存订单／回款 | OCA/contract 19.0候选；其周期合同／开票不能直接视为全套合同法务和电子签章 |
| 项目与任务 | 项目里程碑、协作、工时与交付；不重复CRM跟进任务 | Odoo project及其实际依赖 |
| 人事与费用 | 员工、组织、入转调离、休假、报销 | Odoo hr、hr_expense；薪酬考勤再比较Frappe HR，不默认增加第二运行栈 |
| 生产与设备 | BOM、生产与维护，复用现有商品库存 | Odoo mrp、maintenance |
| 资产 | 资产卡、领用、盘点、折旧；与库存商品和设备区分 | 先审计OCA/ERPNext适配，当前未选定引擎；maintenance不等于财务固定资产 |
| OA与审批 | 业务申请、审批节点、意见与记录 | 审核沿原生追问；跨人审批／代理／催办需单独实现，不把本机确认当多人流程 |
| 客服工单 | 服务请求、处理、SLA及客户关系 | Frappe Helpdesk候选；先验证部署与许可证，不默认引入Frappe运行栈 |
| 文档知识 | 企业资料、检索及知识沉淀 | 复用现有knowledge和database；签章／档案法规能力另验 |
| 经营分析 | 读取各责任方实际指标，保留来源、币种和时间口径 | 先复用原生查询和现有报表；不为展示再次复制业务库 |

本地核对的Odoo锁定提交：`d8e815359fc252fcae0156e148dec89972a2c3c9`。通过ast.literal_eval读取10个__manifest__.py，保存每项依赖、许可证和SHA256，未执行上游代码。account、crm、hr、hr_expense、maintenance、mrp、project、purchase、sale、stock均为LGPL-3。清单存在／installable不等于完成集成验收；不能宣称社区源码含商业版documents/helpdesk/sign全部功能。

官方依据：[Odoo模块清单与依赖规则](https://www.odoo.com/documentation/19.0/es_419/developer/reference/backend/module.html)、[锁定源码](https://github.com/odoo/odoo/tree/d8e815359fc252fcae0156e148dec89972a2c3c9/addons)。

合同候选[OCA/contract](https://github.com/OCA/contract)，已确认19.0分支及提交`6aa8fcb5a11d6feacceb3a8bedd4cf6013a1110e`，仓库AGPL-3.0；还需逐模块依赖与授权确认。备选[ERPNext](https://github.com/frappe/erpnext)和[Frappe HR](https://github.com/frappe/hrms)仓库GPL-3.0，[Helpdesk](https://github.com/frappe/helpdesk)AGPL-3.0；[官方许可说明](https://docs.frappe.io/legal/others/license-and-trademark)要求以各仓库为准，商标与软件许可分开。源码调查不是发行许可结论。备选默认分支develop只用于调查，不作可交付版本锁；正式接入必须选稳定版本、锁定依赖和验证运行环境。

## 5. 仍需专项实现的企业能力

当前用户要求七款企业场景各自初始化独立数据库，以独立存储与中台互通为准。下段共库实施说明保留前轮历史；新实现不把本库整数ID自动当作进销存ID，也不自动复制或过账其他库的业务。

2026-10-28后续实施已实际复用上述固定Odoo引擎，完成人事、费用报销、财务、生产制造四个本地应用；项目、办公IT资产、客服分别参考OpenProject、Snipe-IT、Zammad并沿现有数据库SDK实现。实际功能、源模型、共库边界和最终验收见七款场景实施，上表候选调查不能替代该实施结论。新四款保持原员工／商品／账簿ID，原生逐条审核，不新建第二ERP运行栈。

当前不能直接承诺远程团队／企业生产部署。可信多人登录、组织／租户边界、记录与字段权限、并发会话、离职撤权及跨人审批需要端到端的人身份服务；官网账号和负责人字段都不能充当它。此能力落在既有身份与统一访问边界扩展，不在每个插件建立独立账号。

跨模块写流程也不能宣称已经有通用事务平台：单模块沿原事务，跨模块用可恢复步骤、持久化幂等与对账；需要自动投递时再给实际流程实现事务outbox／inbox，不能仅加事件接口就声称可靠。当前没有新增通用工作流、定时器或集成平台。

金融／税务／薪酬／电子签章等模块仍需对应地域和业务验收。开源引擎不是业务规则、合法发行或完整交付的替代物。

## 6. 本轮证据与保留范围

证据目录：`.artifacts/business-modules-20261028`。保留红灯测试、运行检查、真实CRM／Odoo双库测试、开源提交与清单回执、隔离构建和最终检查结果；最终结论见同目录acceptance.json。

本轮未改已有迁移、未建第二数据库服务、未修改日常数据库／恢复密码／会话／附件／旧授权文件，未安装或切换日常客户端。测试仅在.artifacts隔离资料中执行。源码、隔离候选与已采用包不能因同为0.1.1混为一谈。
