/** 开发期类型出口；运行时由 DSH 装配中的 UI 引导包提供服务。 */
import type {} from '@deepseek-ai/cordis'
export interface CapabilityPaths {
 readonly config:string
 readonly data:string
 readonly files:string
 readonly cache:string
 readonly knowledge:string
}
export interface CapabilityConnection {
 readonly id:string
 readonly contractVersion:1
 readonly paths:Readonly<CapabilityPaths>
 /** 释放本次接入，保留目录和资料。 */
 dispose():void
}
export interface BeellixPlatform {
 readonly contractVersion:1
 register(input:{packageName:string;packageDirectory:string;modelConfiguration?:PluginModelConfiguration}):Promise<Readonly<CapabilityConnection>>
}
export interface PluginModelConfiguration {
 read():Promise<{revision:number;purposes:Array<{id:string;title:string;kind?:'vision'|'document'|'audio'|'retrieval'|'other';operation?:'chat'|'embedding'|'rerank'|'parse';configurationPanel?:string;configured?:boolean;enabled?:boolean;canToggle?:boolean;connection?:{kind:'local'|'api';model:string;endpoint?:string};inputModalities?:Array<'text'|'image'|'audio'|'video'>;selection:{provider:string;model:string}|null}>}>
 write(input:{purposeId:string;expectedRevision:number}&({selection:{provider:string;model:string}|null;enabled?:never}|{enabled:boolean;selection?:never})):Promise<{application:'applied'|'restart-required'}>
}
export declare const PLATFORM_API_VERSION:1
export interface KnowledgeScope {readonly sessionId:string;readonly spaceIds:readonly string[];readonly revision:number;readonly signal:AbortSignal;validate():Promise<void>;dispose():void}
export interface KnowledgeSessionControl {
 readonly contractVersion:1
 readonly features:readonly string[]
 registerProvider(input:{packageName:string;packageDirectory:string;provider:{status():Promise<{status:string}>;listSpaces():Promise<Array<{id:string;title:string}>>}}):Promise<{dispose():void;changed():void}>
 scope(sessionId:string):Promise<KnowledgeScope>
 subscribe(listener:(sessionId?:string)=>void):()=>void
}
declare module '@deepseek-ai/cordis' {
 interface Context {beellixPlatform:BeellixPlatform;beellixKnowledgeSessions:KnowledgeSessionControl;beellixData:BeellixData;beellixAccount:BeellixAccount}
}

/** 官网身份独立于本机业务 owner；仅供宿主侧查询，不授予工具或业务权限。 */
export type WebsiteAccountStatus='unconfigured'|'signed-out'|'starting'|'pending'|'signed-in'|'offline'|'expired'
export interface WebsiteAccountSnapshot {
 readonly status:WebsiteAccountStatus
 readonly canLogin:boolean
 readonly account:Readonly<{displayName:string}>|null
 readonly membership:Readonly<{label:string;expiresAt:string|null}>|null
 readonly attemptId?:string
 readonly expiresAt?:string
}
export interface BeellixAccount {
 readonly contractVersion:1
 snapshot():Promise<WebsiteAccountSnapshot>
 /** 预留资格查询；当前未接入安装／更新／运行拦截，调用者不能据此改写本地业务权限。 */
 eligibility(input:{pluginId:string;action:'download'|'update'|'run'}):Promise<{allowed:boolean;status:WebsiteAccountStatus|'eligible'|'not-entitled';expiresAt?:string|null}>
}

/** 本机主用户数据入口。默认全权；包名只为来源。业务审核与会话知识选择仍生效。 */
export type DataAction='read'|'write'|'export'
export interface DataReference {readonly version:1;readonly resource:string;readonly accountId:string;readonly entity:string;readonly id:string|number}
export interface DataRecordType {entity:string;title:string;idType:'string'|'integer';read(reference:DataReference,scope:DataScope):Promise<Record<string,unknown>>}
export interface DataPacket {resource:string;action:DataAction;accountId:string;input:Record<string,unknown>}
export interface DataScope {
 readonly agent:unknown
 readonly actor:Readonly<{principal:'owner';subject:string;sessionId:string;identity:string;readOnly:boolean;knowledgeSpaceIds?:string[]}>
 readonly signal:AbortSignal
 readonly readOnly:boolean
 /** 长任务交付和业务写入前再次核验；不能缓存会话或插件状态代替此检查。 */
 validate():Promise<void>
}
export interface BeellixData {
 readonly contractVersion:1
 readonly features:readonly string[]
 register(input:{packageName:string;packageDirectory:string;accounts():Promise<Array<{instanceId:string;title?:string}>>;resources:Array<{id:string;title:string;actions:DataAction[];consent?:'knowledge';inputSchema?:Record<string,unknown>;recordTypes?:DataRecordType[];instructions?:string;invoke(packet:DataPacket,scope:DataScope):Promise<Record<string,unknown>>}>}):Promise<{readonly contractVersion:1;guard<T>(agent:unknown,packet:Omit<DataPacket,'input'>,run:(scope:DataScope)=>Promise<T>,options?:{signal?:AbortSignal}):Promise<T>;dispose():void}>
 forAgent(agent:unknown):{catalog():Promise<{resources:Array<{id:string;title:string;plugin:string;actions:DataAction[];accounts:Array<{instanceId:string;title:string;actions:DataAction[]}>}>}>;describe(resource:string):Promise<{id:string;title:string;inputSchema:Record<string,unknown>|null;instructions:string|null;recordTypes:Array<Pick<DataRecordType,'entity'|'title'|'idType'>>}>;call(packet:DataPacket,options?:{signal?:AbortSignal}):Promise<Record<string,unknown>>;resolve(reference:DataReference,options?:{signal?:AbortSignal}):Promise<{reference:DataReference;record:Record<string,unknown>}>}
}
