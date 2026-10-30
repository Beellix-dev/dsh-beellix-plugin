# 公共数据库开发接入 v1

适用包 @beellix-ai/database 0.1.1，服务 beellixDatabase.contractVersion=1。本文说明已交付场景登记接口；能力登记扩展是否存在，以所装服务与公共 SDK 为准，不猜测方法。

## 生命周期

场景宿主注入 beellixDatabase，调用 registerSceneDatabase(ctx, {packageName, packageDirectory, migrations}) 获得 provider；把 provider.dispose 交给原生 ctx.effect。SDK 是薄调用，运行时复用已启用的公共数据库，不作为业务包运行依赖再装第二份服务。包必须由中台安装，真实来源目录和场景清单匹配。

register 只登记场景与迁移。不要在 apply 中 provider.open 或插入演示数据。用户首次打开业务数据库时，经过服务器归属校验，再调用 provider.open(instanceId, label)，返回受限 account。用 provider.list() 列出本场景的已有与恢复数据库，不能凭消息中的 ID 越过应用归属。

```js
// 加载阶段：仅登记。以下为场景宿主接入片段，不是完整可安装应用。
import {registerSceneDatabase} from '@beellix-ai/database/sdk'
import {fileURLToPath} from 'node:url'
export const inject=['beellixDatabase','beellixScenes']
export async function apply(ctx){
  const provider=await registerSceneDatabase(ctx,{
    packageName:'@beellix-ai/inventory',
    packageDirectory:fileURLToPath(new URL('../',import.meta.url)),
    migrations:[{version:'001',sql:'CREATE TABLE products(id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,name text NOT NULL)'}],
  })
  ctx.effect(()=>provider.dispose,'库存数据库登记')
  // 实际业务入口核验执行身份、场景绑定、数据库和用户授权之后，才调用：
  // const account=await provider.open(verifiedInstanceId,'我的库存')
  // await account.transaction(tx=>tx.query('INSERT INTO products(name) VALUES($1)',[validatedName]))
}
```

## 业务与保护

account.transaction(fn) 中的 tx.query(text, values) 沿同一事务连接执行；参数值必须参数化，结束后句柄失效。account.filesDirectory 为该数据库附件根，附件保存相对引用；account.backup() 获取业务快照。恢复会产生新数据库，通过 provider.list() 重新选择，不覆盖原库。恢复前取得的句柄可能失效，需要重新打开，不能无限重试写操作。

迁移数组按声明顺序执行，version 与 SQL 内容摘要不可改写；拒绝降级和更改已应用迁移。模型只调用场景定义的有界业务工具，不直接暴露 tx.query、管理连接、角色密码或文件根。业务幂等键、冲突检查、分页、取消与审计仍由场景服务实现。数据库事务和附件不是分布式事务；不能宣传任意跨进程附件写入都具备原子性。

受管服务有逻辑快照、加密物理基础备份、WAL 归档与已完成保护点恢复。第二份位置需用户配置独立介质；云存储尚未选定。不能宣称零丢失、未配置的双备份或云端恢复已可用。不直接复制运行中的 PostgreSQL 数据文件冒充一致备份；应用复用公共备份服务。

已安装、服务已加载与已初始化是不同状态。缺失服务应显示统一安装入口，未初始化应进入数据库初始化，错误口令或中断保留原资料；应用不自动新建另一套数据库掩盖连接故障。

## 能力包与工作进程：知识候选扩展

当前源码候选在 contractVersion=1 下用 features 显式声明 capability-registration、worker-connections、backup-barrier、vector-extension；业务包须同时检查这些特性。status() 返回运行状态，安装或装配不代表 ready。此扩展尚未自动采用到日常客户端，采用摘要见 STATUS.md。

registerCapability 或 registerCapabilityDatabase 只接受中台 environment/node_modules 中身份、真实目录匹配的 resources 能力包（knowledge、data-platform）。其余输入与场景登记类似；数据库身份使用 capability--<id>，不能借场景登记冒用。登记不建库，显式初始化时才 open('main')。知识主实例与业务场景数据库使用独立数据库、角色和附件根。

需要向量的包提交 extensions:[{name:'vector',version:'0.8.7'}]。固定组件只部署到受管 PostgreSQL18 x64，管理员负责启用扩展；业务连接不能安装扩展。组件不匹配、已有文件摘要冲突或版本升级需求须明确失败，不能覆盖用户服务。

account.connectWorker({process,pause,resume}) 要求真实受管子进程与暂停/恢复回调，返回只在宿主内使用的 connection 和 revoke()。专用登录只能访问当前数据库，具备业务表读写权限，没有建库、建表、建角色或复制权限。子进程退出、能力停用或 dispose 时撤销登录并终止连接；不得把连接参数暴露给页面、模型或写入包配置。

## 受管业务引擎结构维护

`features`包含`engine-maintenance`才可调用`account.maintainEngine({revision,process,run})`。revision必须是已验证组件的40至64位十六进制修订；process是实际受管子进程。先停止该数据库全部普通worker，接口先完成加密备份，再进入维护；未停止时拒绝，不给现有worker追加建表权限。

run仅在宿主内获得当前目标库的临时维护连接。登录显式获CONNECT，以稳定的本数据库角色创建对象；没有超级用户、建库、建角色或复制权限。10分钟硬超时、进程退出、停用及回调成功或失败均撤销登录并终止连接；不让浏览器、模型或任意SQL工具取得连接。维护状态、确定修订及维护前备份保存在数据库插件记录中；失败不换数据库或删除原库。

普通运行仍使用connectWorker。外部引擎必须另外完成初始化重试、组件来源与摘要、业务级降权、附件路径及新副本恢复验证；此接口本身不证明任意上游系统已兼容。进销存的隔离依据见任务与验收，当前未切换日常客户端。

业务进程必须先停止接收新写入、排空已接收写入，再响应 pause；resume 后继续。公共逻辑与物理备份在此屏障下捕获数据和附件；不能绕开回调复制活动数据库。原件先落不可变文件，随后事务写相对引用，事务失败最多留下未引用对象，不产生缺失原件的有效记录。恢复到新副本，不覆盖原资料。
