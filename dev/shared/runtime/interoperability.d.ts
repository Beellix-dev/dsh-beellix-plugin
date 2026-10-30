/** V1 local-owner contract. Installed trusted providers only; not an OS sandbox. */
export interface IntegrationGrant {
 contractId?:'beellix.crm-inventory.v1'
 id:string;revision:number;enabled:boolean;status:'pending'|'ready';actor:'local-owner';createdAt:string
 crmInstallation:string;inventoryInstallation:string;crmAccount:string;inventoryAccount:string
 customerMap:Array<{crmId:string;inventoryId:number}>;productIds:number[];warehouseId:number
 permissions:Array<'crm.customer'|'inventory.catalog'|'inventory.createDraft'|'inventory.orderStatus'|'inventory.paymentSummary'>
 customerFields:Array<'name'|'industry'|'region'>;expiresAt:string
}
export interface IntegrationPacket {
 version:1;grantId:string;accountId:string;operation:string
 input:Record<string,unknown>;requestId?:string
}
export interface IntegrationReceipt {
 value:{version:1;grantId:string;grantRevision:number;source:string;requestId:string;digest:string;stateRevision:number;questionIds:string[];expiresAt:number}
 signature:string
}
export interface IntegrationContext {readOnly?:boolean;approval?:IntegrationReceipt;agent?:unknown;questions?:{ask(request:unknown):Promise<unknown>};signal?:AbortSignal}
export interface IntegrationHandle {
 readonly installationId:string;readonly contractVersion:1
 list(accountId:string):Promise<Array<IntegrationGrant|GenericIntegrationGrant>>
 review(packet:IntegrationPacket,context:IntegrationContext):Promise<IntegrationReceipt>
 call(packet:IntegrationPacket,context:IntegrationContext):Promise<{version:1;grantId:string;grantRevision:number;sourceAccount:string;targetAccount:string;data:Record<string,unknown>}>
 dispose():Promise<void>
}
export interface IntegrationProvider {
 packageName:string;packageDirectory:string;title:string
 contracts?:IntegrationContract[]
 accounts():Promise<Array<{instanceId:string;title?:string}>>
 choices?(accountId:string,lookup?:{collection:string;q?:string;offset?:number;limit?:number;ids?:Array<string|number>}):Promise<Array<{id:string;name:string;revision:number}>|{items:Array<{id:string|number;name:string}>;selected?:Array<{id:string|number;name:string}>;total:number;nextOffset:number|null}>
 validateGrant(grant:IntegrationGrant|GenericIntegrationGrant):Promise<unknown>;snapshotGrant(grant:IntegrationGrant|GenericIntegrationGrant):Promise<unknown>
 previewDraft?(input:Record<string,unknown>):Promise<{stateRevision:number;result:Record<string,unknown>}>
 preview?(input:Record<string,unknown>):Promise<{stateRevision:number;result:Record<string,unknown>}>
 call(input:Record<string,unknown>):Promise<Record<string,unknown>>
}
export interface BeellixInteroperability {
 readonly contractVersion:1
 register(provider:IntegrationProvider):Promise<IntegrationHandle>
}
export interface GenericIntegrationGrant {
 id:string;revision:number;contractId:string;sourcePackage:string;targetPackage:string;sourceAccount:string;targetAccount:string;sourceInstallation:string;targetInstallation:string
 enabled:boolean;status:'pending'|'ready';actor:'local-owner';createdAt:string;expiresAt:string;permissions:string[];[scopeField:string]:unknown
}
export interface IntegrationContract {
 id:string;title:string
 source:{packageName:string;accountKey:'sourceAccount'};target:{packageName:string;accountKey:'targetAccount'}
 operations:Array<{id:string;title:string;effect:'read'|'write';default?:boolean}>
 fields:Array<{key:string;title:string;kind:'mapping'|'single'|'multiple'|'checks';required?:boolean;side?:'source'|'target';collection?:string;sourceLabel?:string;targetLabel?:string;sourceCollection?:string;targetCollection?:string;sourceKey?:string;targetKey?:string;default?:string[];options?:Array<{id:string;title:string}>;whenPermission?:string}>
 /** Throw on invalid scope, object mapping or extra input fields. Never mutates the original input. */
 validate(input:Record<string,unknown>):void|Promise<void>
 authorize(input:{grant:GenericIntegrationGrant;packet:IntegrationPacket;context:IntegrationContext}):void|Promise<void>
 /** Return only the permitted public DTO, including filtered totals/aggregates. */
 project(input:{grant:GenericIntegrationGrant;packet:IntegrationPacket;result:Record<string,unknown>}):Record<string,unknown>|Promise<Record<string,unknown>>
 /** One human-readable item per native review step; required for write operations. */
 review?(preview:{stateRevision:number;result:Record<string,unknown>}):string[]
}
/** Owner console only; never injected into business plugins. */
export interface IntegrationManagement {
 managementSnapshot():Promise<Record<string,unknown>>
 choice(input:Record<string,unknown>):Promise<Record<string,unknown>>
 create(input:Record<string,unknown>):Promise<IntegrationGrant|GenericIntegrationGrant>
 update(input:{id:string;expectedRevision:number;input:Record<string,unknown>}):Promise<IntegrationGrant|GenericIntegrationGrant>
 setEnabled(input:{id:string;enabled:boolean;expectedRevision:number}):Promise<IntegrationGrant|GenericIntegrationGrant>
 auditSnapshot(input?:{offset?:number;limit?:number;grantId?:string}):Promise<Record<string,unknown>>
}
import type {} from '@deepseek-ai/cordis'
declare module '@deepseek-ai/cordis' {interface Context {beellixInteroperability:BeellixInteroperability}}
