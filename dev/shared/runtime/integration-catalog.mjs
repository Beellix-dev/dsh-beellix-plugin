/** Declarative configuration for the shipped compatibility contract, never business execution. */
export const integrationContracts=[{
 id:'beellix.crm-inventory.v1',title:'CRM 与进销存',
 source:{packageName:'@beellix-ai/sales-crm',accountKey:'crmAccount'},target:{packageName:'@beellix-ai/inventory',accountKey:'inventoryAccount'},
 operations:[{id:'inventory.catalog',title:'查询共享商品',default:true},{id:'inventory.orderStatus',title:'查询订单状态',default:true},{id:'inventory.createDraft',title:'审核后创建销售草稿',write:true},{id:'inventory.paymentSummary',title:'查询回款汇总'},{id:'crm.customer',title:'读取关联客户资料'}],
 fields:[{key:'customerMap',title:'客户对应',kind:'mapping',sourceLabel:'来源客户',targetLabel:'目标客户',sourceCollection:'customers',targetCollection:'partners',sourceKey:'crmId',targetKey:'inventoryId',required:true},{key:'productIds',title:'共享商品',kind:'multiple',side:'target',collection:'products',required:true},{key:'warehouseId',title:'共享仓库',kind:'single',side:'target',collection:'warehouses',required:true},{key:'customerFields',title:'共享客户字段',kind:'checks',whenPermission:'crm.customer',options:[{id:'name',title:'名称'},{id:'industry',title:'行业'},{id:'region',title:'地区'}],default:['name']}],
}]

export const connectionManagementAuthority=()=>({kind:'local-owner',title:'本机管理者',permissions:['connections:read','connections:manage','integration-audit:read'],businessAccess:'explicit-grants'})
