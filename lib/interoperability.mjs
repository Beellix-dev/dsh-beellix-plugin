import { n as writeFileAtomic, t as withFileLock } from "./lib-Dl5J5M7o.mjs";
import { appendFile, mkdir, open, readFile, realpath } from "node:fs/promises";
import { join, resolve } from "node:path";
import { createHash, createHmac, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
//#region dev/shared/runtime/integration-catalog.mjs
/** Declarative configuration for the shipped compatibility contract, never business execution. */
const integrationContracts = [{
	id: "beellix.crm-inventory.v1",
	title: "CRM 与进销存",
	source: {
		packageName: "@beellix-ai/sales-crm",
		accountKey: "crmAccount"
	},
	target: {
		packageName: "@beellix-ai/inventory",
		accountKey: "inventoryAccount"
	},
	operations: [
		{
			id: "inventory.catalog",
			title: "查询共享商品",
			default: true
		},
		{
			id: "inventory.orderStatus",
			title: "查询订单状态",
			default: true
		},
		{
			id: "inventory.createDraft",
			title: "审核后创建销售草稿",
			write: true
		},
		{
			id: "inventory.paymentSummary",
			title: "查询回款汇总"
		},
		{
			id: "crm.customer",
			title: "读取关联客户资料"
		}
	],
	fields: [
		{
			key: "customerMap",
			title: "客户对应",
			kind: "mapping",
			sourceLabel: "来源客户",
			targetLabel: "目标客户",
			sourceCollection: "customers",
			targetCollection: "partners",
			sourceKey: "crmId",
			targetKey: "inventoryId",
			required: true
		},
		{
			key: "productIds",
			title: "共享商品",
			kind: "multiple",
			side: "target",
			collection: "products",
			required: true
		},
		{
			key: "warehouseId",
			title: "共享仓库",
			kind: "single",
			side: "target",
			collection: "warehouses",
			required: true
		},
		{
			key: "customerFields",
			title: "共享客户字段",
			kind: "checks",
			whenPermission: "crm.customer",
			options: [
				{
					id: "name",
					title: "名称"
				},
				{
					id: "industry",
					title: "行业"
				},
				{
					id: "region",
					title: "地区"
				}
			],
			default: ["name"]
		}
	]
}];
const connectionManagementAuthority = () => ({
	kind: "local-owner",
	title: "本机管理者",
	permissions: [
		"connections:read",
		"connections:manage",
		"integration-audit:read"
	],
	businessAccess: "explicit-grants"
});
//#endregion
//#region dev/shared/runtime/integration-extensions.mjs
/** Registration contract for future managed providers. The owner is the target data provider. */
const reject$1 = (condition, code) => {
	if (!condition) throw Error("INTEGRATION_" + code);
};
const text = (v) => typeof v === "string" && v.length > 0 && v.length <= 200 && !/[\u0000-\u001f]/u.test(v);
const reserved = [
	"id",
	"revision",
	"enabled",
	"status",
	"actor",
	"createdAt",
	"updatedAt",
	"contractId",
	"sourceAccount",
	"targetAccount",
	"sourceInstallation",
	"targetInstallation",
	"sourcePackage",
	"targetPackage",
	"permissions",
	"expiresAt",
	"__proto__",
	"constructor",
	"prototype"
];
const freeze = (value) => {
	if (value && typeof value === "object") {
		for (const child of Object.values(value)) freeze(child);
		Object.freeze(value);
	}
	return value;
};
function registerContract(definition, owner, contracts) {
	reject$1(definition && text(definition.id) && /^[a-zA-Z0-9._-]+$/.test(definition.id) && !contracts.has(definition.id) && text(definition.title), "CONTRACT");
	reject$1(definition.source && text(definition.source.packageName) && definition.source.packageName !== owner && definition.source.accountKey === "sourceAccount" && definition.target?.packageName === owner && definition.target.accountKey === "targetAccount", "CONTRACT");
	reject$1(Array.isArray(definition.operations) && definition.operations.length > 0 && definition.operations.length <= 50 && new Set(definition.operations.map((r) => r.id)).size === definition.operations.length && definition.operations.every((r) => text(r.id) && text(r.title) && ["read", "write"].includes(r.effect)), "CONTRACT");
	reject$1(Array.isArray(definition.fields) && definition.fields.length <= 30 && new Set(definition.fields.map((f) => f.key)).size === definition.fields.length, "CONTRACT");
	for (const field of definition.fields) {
		reject$1(text(field.key) && /^[A-Za-z][A-Za-z0-9]*$/.test(field.key) && !reserved.includes(field.key) && text(field.title) && [
			"mapping",
			"single",
			"multiple",
			"checks"
		].includes(field.kind), "CONTRACT");
		if (field.kind === "mapping") reject$1(text(field.sourceCollection) && text(field.targetCollection) && text(field.sourceKey) && text(field.targetKey) && !reserved.includes(field.sourceKey) && !reserved.includes(field.targetKey), "CONTRACT");
		else if (field.kind !== "checks") reject$1(["source", "target"].includes(field.side) && text(field.collection), "CONTRACT");
		else reject$1(Array.isArray(field.options) && field.options.length <= 50 && field.options.every((o) => text(o.id) && text(o.title)), "CONTRACT");
	}
	for (const key of [
		"validate",
		"authorize",
		"project"
	]) reject$1(typeof definition[key] === "function", "CONTRACT");
	if (definition.operations.some((r) => r.effect === "write")) reject$1(typeof definition.review === "function", "CONTRACT");
	const metadata = descriptor(definition);
	contracts.set(definition.id, freeze({
		...metadata,
		validate: definition.validate,
		authorize: definition.authorize,
		project: definition.project,
		review: definition.review
	}));
}
function descriptor(definition) {
	return structuredClone({
		id: definition.id,
		title: definition.title,
		source: definition.source,
		target: definition.target,
		operations: definition.operations.map((op) => ({
			...op,
			write: op.effect === "write"
		})),
		fields: definition.fields
	});
}
async function validateCustom(broker, input) {
	const contract = broker.contracts.get(input?.contractId);
	reject$1(contract, "CONTRACT_UNAVAILABLE");
	const keys = [
		"contractId",
		"sourceAccount",
		"targetAccount",
		"permissions",
		"expiresAt",
		...contract.fields.map((f) => f.key)
	];
	reject$1(input && typeof input === "object" && !Array.isArray(input) && Object.keys(input).every((k) => keys.includes(k)), "FIELDS");
	reject$1(text(input.sourceAccount) && text(input.targetAccount), "ACCOUNT");
	reject$1(Array.isArray(input.permissions) && input.permissions.length > 0 && new Set(input.permissions).size === input.permissions.length && input.permissions.every((id) => contract.operations.some((o) => o.id === id)), "PERMISSION");
	const expiry = Date.parse(input.expiresAt);
	reject$1(Number.isFinite(expiry) && expiry > Date.now() && expiry <= Date.now() + 366 * 864e5, "EXPIRY");
	reject$1(!broker.closed && broker.ready(), "PROVIDER_UNAVAILABLE");
	const source = broker.providers.get(contract.source.packageName), target = broker.providers.get(contract.target.packageName);
	reject$1(source && target, "PROVIDER_UNAVAILABLE");
	for (const [provider, account] of [[source, input.sourceAccount], [target, input.targetAccount]]) {
		await broker.validateProvider(provider);
		reject$1((await provider.accounts()).some((a) => a.instanceId === account), "ACCOUNT");
	}
	reject$1(await contract.validate(input) !== false, "FIELDS");
	return {
		contract,
		source,
		target
	};
}
async function writeCustom(broker, mode, input) {
	let previous, data, enabled;
	if (mode === "create") {
		data = input;
		enabled = true;
	} else {
		previous = (await broker.list()).find((g) => g.id === input.id);
		reject$1(previous && previous.revision === input.expectedRevision, "GRANT_REVISION");
		enabled = mode === "enabled" ? input.enabled : previous.enabled;
		reject$1(typeof enabled === "boolean", "GRANT");
		data = mode === "update" ? input.input : Object.fromEntries([
			"contractId",
			"sourceAccount",
			"targetAccount",
			"permissions",
			"expiresAt",
			...(broker.contracts.get(previous.contractId)?.fields ?? []).map((f) => f.key)
		].filter((k) => Object.hasOwn(previous, k)).map((k) => [k, previous[k]]));
		if (mode === "update") reject$1(data.contractId === previous.contractId && data.sourceAccount === previous.sourceAccount && data.targetAccount === previous.targetAccount, "IDENTITY");
	}
	if (mode === "enabled" && !enabled) {
		const grant = await broker.mutate((state) => {
			const row = state.grants.find((g) => g.id === input.id);
			reject$1(row?.revision === input.expectedRevision, "GRANT_REVISION");
			row.enabled = false;
			row.revision++;
			return structuredClone(row);
		});
		for (const [key, control] of broker.inflight) if (key.startsWith(grant.id + ":")) control.abort(Error("INTEGRATION_GRANT_REVOKED"));
		for (const name of [grant.sourcePackage, grant.targetPackage]) try {
			await broker.providers.get(name)?.snapshotGrant(grant);
		} catch {}
		await broker.audit(grant, "grant.change", "complete");
		return grant;
	}
	const { contract, source, target } = await validateCustom(broker, data), grant = {
		...previous,
		...structuredClone(data),
		id: previous?.id ?? randomUUID(),
		revision: (previous?.revision ?? 0) + 1,
		enabled,
		status: "pending",
		actor: "local-owner",
		createdAt: previous?.createdAt ?? (/* @__PURE__ */ new Date()).toISOString(),
		sourceInstallation: source.installationId,
		targetInstallation: target.installationId,
		sourcePackage: source.packageName,
		targetPackage: target.packageName
	};
	if (previous) reject$1(previous.sourceInstallation === source.installationId && previous.targetInstallation === target.installationId, "IDENTITY");
	await source.validateGrant(grant);
	await target.validateGrant(grant);
	await broker.mutate((state) => {
		if (previous) {
			const i = state.grants.findIndex((g) => g.id === previous.id);
			reject$1(state.grants[i]?.revision === previous.revision, "GRANT_REVISION");
			state.grants[i] = {
				...grant,
				enabled: false
			};
		} else state.grants.push({
			...grant,
			enabled: false
		});
	});
	for (const [key, control] of broker.inflight) if (key.startsWith(grant.id + ":")) control.abort(Error("INTEGRATION_GRANT_REVOKED"));
	try {
		await source.snapshotGrant(grant);
		await target.snapshotGrant(grant);
		grant.status = "ready";
		await broker.mutate((state) => {
			const i = state.grants.findIndex((g) => g.id === grant.id);
			reject$1(state.grants[i]?.revision === grant.revision, "GRANT_REVISION");
			state.grants[i] = grant;
		});
		await broker.audit(grant, mode === "update" ? "grant.update" : mode === "create" ? "grant.create" : "grant.change", "complete");
		return grant;
	} catch (error) {
		await broker.audit(grant, "grant.update", "rejected");
		throw error;
	}
}
async function authorizeCustom(broker, entry, packet, context, grant) {
	const contract = broker.contracts.get(grant.contractId);
	reject$1(contract, "CONTRACT_UNAVAILABLE");
	const target = broker.providers.get(grant.targetPackage);
	reject$1(entry.packageName === grant.sourcePackage && entry.installationId === grant.sourceInstallation && target?.installationId === grant.targetInstallation, "PROVIDER_UNAVAILABLE");
	await broker.validateProvider(entry);
	await broker.validateProvider(target);
	reject$1(packet.accountId === grant.sourceAccount && (await entry.accounts()).some((a) => a.instanceId === grant.sourceAccount) && (await target.accounts()).some((a) => a.instanceId === grant.targetAccount), "ACCOUNT");
	const operation = contract.operations.find((o) => o.id === packet.operation);
	reject$1(operation && grant.permissions.includes(operation.id), "PERMISSION");
	if (operation.effect === "write") {
		reject$1(!context.readOnly, "READ_ONLY");
		reject$1(text(packet.requestId) && /^[A-Za-z0-9_-]{8,100}$/.test(packet.requestId), "REQUEST");
	}
	reject$1(await contract.authorize({
		grant,
		packet,
		context
	}) !== false, "OBJECT_SCOPE");
	return {
		grant,
		target,
		contract,
		operation,
		targetAccount: grant.targetAccount
	};
}
//#endregion
//#region dev/shared/runtime/interoperability.mjs
/** V1 local-owner, explicitly granted CRM/inventory calls. No database transport. */
const CRM = "@beellix-ai/sales-crm";
const INV = "@beellix-ai/inventory";
const permissions = [
	"crm.customer",
	"inventory.catalog",
	"inventory.createDraft",
	"inventory.orderStatus",
	"inventory.paymentSummary"
];
const fields = [
	"name",
	"industry",
	"region"
];
const canonical = (value) => JSON.stringify(value, (_key, row) => row && typeof row === "object" && !Array.isArray(row) ? Object.fromEntries(Object.keys(row).sort().map((key) => [key, row[key]])) : row);
const digest = (value) => createHash("sha256").update(canonical(value)).digest("hex");
const pick = (row, allowed) => Object.fromEntries(allowed.filter((k) => Object.hasOwn(row ?? {}, k)).map((k) => [k, row[k]]));
const reject = (condition, code) => {
	if (!condition) throw Error("INTEGRATION_" + code);
};
const safeText = (v) => typeof v === "string" && v.length > 0 && v.length <= 200 && !/[\u0000-\u001f]/u.test(v);
const positive = (v) => Number.isSafeInteger(v) && v > 0;
const exact = (object, keys) => reject(object && typeof object === "object" && !Array.isArray(object) && Object.keys(object).every((k) => keys.includes(k)), "FIELDS");
var Interoperability = class {
	constructor(root, { owned, ready = () => true, secrets }) {
		this.root = resolve(root);
		this.owned = owned;
		this.ready = ready;
		this.secrets = secrets;
		this.path = join(this.root, "config/integration/grants.json");
		this.providers = /* @__PURE__ */ new Map();
		this.pending = /* @__PURE__ */ new Set();
		this.inflight = /* @__PURE__ */ new Map();
		this.contracts = /* @__PURE__ */ new Map();
		this.closed = false;
		this.contractVersion = 1;
	}
	async load() {
		try {
			const value = JSON.parse(await readFile(this.path, "utf8"));
			reject(value.version === 1 && Array.isArray(value.grants) && value.installations, "STORE");
			return value;
		} catch (e) {
			if (e.code === "ENOENT") return {
				version: 1,
				installations: {},
				grants: []
			};
			throw e;
		}
	}
	publicService() {
		return Object.freeze({
			contractVersion: 1,
			register: (input) => this.register(input)
		});
	}
	async managementSnapshot() {
		const providers = await this.providersState(), byName = new Map(providers.map((p) => [p.packageName, p])), connections = [];
		for (const grant of await this.list()) {
			const contract = [...integrationContracts, ...this.contracts.values()].find((c) => c.id === (grant.contractId ?? "beellix.crm-inventory.v1")), source = byName.get(contract?.source.packageName), target = byName.get(contract?.target.packageName), sourceAccount = source?.accounts.find((a) => a.instanceId === grant[contract.source.accountKey]), targetAccount = target?.accounts.find((a) => a.instanceId === grant[contract.target.accountKey]);
			connections.push({
				...grant,
				contractId: contract?.id ?? grant.contractId,
				sourcePlugin: source?.title ?? grant.sourcePackage ?? "销售 CRM",
				targetPlugin: target?.title ?? grant.targetPackage ?? "进销存",
				sourceTitle: sourceAccount?.title ?? "原账套暂不可用",
				targetTitle: targetAccount?.title ?? "原账套暂不可用",
				available: Boolean(contract && sourceAccount && targetAccount),
				expired: Date.parse(grant.expiresAt) <= Date.now()
			});
		}
		return {
			authority: connectionManagementAuthority(),
			providers,
			contracts: [...structuredClone(integrationContracts), ...[...this.contracts.values()].map(descriptor)],
			connections
		};
	}
	async validateProvider(provider) {
		const owned = (await this.owned()).find((r) => r.name === provider.packageName && r.enabled !== false);
		reject(owned && await realpath(resolve(owned.directory)) === await realpath(resolve(provider.packageDirectory)), "PROVIDER_UNAVAILABLE");
	}
	async choice(input) {
		exact(input, [
			"contractId",
			"side",
			"accountId",
			"collection",
			"q",
			"offset",
			"limit",
			"ids"
		]);
		const contract = integrationContracts.find((c) => c.id === input.contractId) ?? this.contracts.get(input.contractId);
		reject(contract && ["source", "target"].includes(input.side), "CONTRACT");
		const allowed = contract.fields.some((f) => f.kind === "mapping" ? (input.side === "source" ? f.sourceCollection : f.targetCollection) === input.collection : f.side === input.side && f.collection === input.collection);
		reject(allowed, "COLLECTION");
		const offset = input.offset ?? 0, limit = input.limit ?? 25, q = input.q ?? "", ids = input.ids ?? [];
		reject(Number.isSafeInteger(offset) && offset >= 0 && Number.isSafeInteger(limit) && limit >= 1 && limit <= 100 && typeof q === "string" && q.length <= 200 && Array.isArray(ids) && ids.length <= 100 && ids.every((v) => safeText(v) || Number.isSafeInteger(v) && v > 0), "LOOKUP");
		const side = contract[input.side], provider = this.providers.get(side.packageName);
		reject(provider?.choices && (await provider.accounts()).some((a) => a.instanceId === input.accountId), "ACCOUNT");
		const installed = (await this.owned()).find((r) => r.name === side.packageName && r.enabled !== false);
		reject(installed && await realpath(resolve(installed.directory)) === await realpath(resolve(provider.packageDirectory)), "PROVIDER_UNAVAILABLE");
		const result = await provider.choices(input.accountId, {
			collection: input.collection,
			q,
			offset,
			limit,
			ids
		});
		reject(result && Array.isArray(result.items) && Number.isSafeInteger(result.total), "LOOKUP");
		return result;
	}
	async mutate(run) {
		await mkdir(join(this.root, "config/integration"), { recursive: true });
		return withFileLock(this.path, async () => {
			const state = await this.load(), result = await run(state);
			await writeFileAtomic(this.path, JSON.stringify(state), {
				mode: 384,
				dirMode: 448
			});
			return result;
		});
	}
	async key() {
		return this.keyPromise ??= (async () => {
			reject(this.secrets?.get && this.secrets?.set, "CREDENTIALS_UNAVAILABLE");
			const ref = "BEELLIX_INTEGRATION_" + digest(this.root).slice(0, 24);
			let key = await this.secrets.get(ref);
			if (!key) {
				key = randomBytes(32).toString("base64");
				await this.secrets.set(ref, key);
			}
			return key;
		})().catch((error) => {
			this.keyPromise = void 0;
			throw error;
		});
	}
	async register(input) {
		reject(!this.closed && this.ready(), "PROVIDER_UNAVAILABLE");
		reject(safeText(input.packageName) && !this.pending.has(input.packageName) && !this.providers.has(input.packageName), "PROVIDER_DUPLICATE");
		this.pending.add(input.packageName);
		try {
			const owned = (await this.owned()).find((r) => r.name === input.packageName && r.enabled !== false);
			reject(owned, "PROVIDER_NOT_OWNED");
			reject(await realpath(resolve(owned.directory)) === await realpath(resolve(input.packageDirectory)), "PROVIDER_SOURCE");
			for (const key of [
				"accounts",
				"validateGrant",
				"snapshotGrant",
				"call"
			]) reject(typeof input[key] === "function", "PROVIDER_CONTRACT");
			reject(!input.contracts || Array.isArray(input.contracts) && input.contracts.length <= 20, "CONTRACT");
			const next = new Map(this.contracts);
			for (const contract of input.contracts ?? []) {
				reject(!integrationContracts.some((c) => c.id === contract.id), "CONTRACT_DUPLICATE");
				registerContract(contract, input.packageName, next);
			}
			const installationId = await this.mutate((state) => state.installations[input.packageName] ??= randomUUID()), entry = {
				...input,
				installationId
			}, latest = new Map(this.contracts);
			for (const contract of input.contracts ?? []) registerContract(contract, input.packageName, latest);
			this.providers.set(input.packageName, entry);
			this.contracts = latest;
			const current = () => reject(!this.closed && this.ready() && this.providers.get(input.packageName) === entry, "PROVIDER_UNAVAILABLE");
			return Object.freeze({
				installationId,
				contractVersion: 1,
				list: async (accountId) => {
					current();
					reject((await entry.accounts()).some((a) => a.instanceId === accountId), "ACCOUNT");
					return (await this.list()).filter((g) => g.sourcePackage ? g.sourcePackage === entry.packageName && g.sourceAccount === accountId || g.targetPackage === entry.packageName && g.targetAccount === accountId : [CRM, INV].includes(entry.packageName) && g[input.packageName === CRM ? "crmAccount" : "inventoryAccount"] === accountId);
				},
				call: async (packet, context) => {
					current();
					return this.call(entry, packet, context);
				},
				review: async (packet, context) => {
					current();
					return this.review(entry, packet, context);
				},
				dispose: async () => {
					if (this.providers.get(input.packageName) === entry) {
						this.providers.delete(input.packageName);
						for (const contract of input.contracts ?? []) this.contracts.delete(contract.id);
						for (const control of this.inflight.values()) control.abort(Error("INTEGRATION_PROVIDER_UNAVAILABLE"));
					}
				}
			});
		} finally {
			this.pending.delete(input.packageName);
		}
	}
	async providersState() {
		const rows = [];
		for (const row of this.providers.values()) try {
			await this.validateProvider(row);
			rows.push({
				packageName: row.packageName,
				title: row.title,
				available: true,
				accounts: await row.accounts()
			});
		} catch {
			rows.push({
				packageName: row.packageName,
				title: row.title,
				available: false,
				accounts: []
			});
		}
		return rows;
	}
	async choices(accountId) {
		const provider = this.providers.get(CRM);
		reject(provider?.choices && (await provider.accounts()).some((r) => r.instanceId === accountId), "ACCOUNT");
		return provider.choices(accountId);
	}
	async list() {
		return structuredClone((await this.load()).grants);
	}
	async validateInput(input) {
		exact(input, [
			"contractId",
			"crmAccount",
			"inventoryAccount",
			"customerMap",
			"productIds",
			"warehouseId",
			"permissions",
			"customerFields",
			"expiresAt"
		]);
		reject(!input.contractId || input.contractId === "beellix.crm-inventory.v1", "CONTRACT");
		reject(safeText(input.crmAccount) && safeText(input.inventoryAccount), "ACCOUNT");
		reject(Array.isArray(input.customerMap) && input.customerMap.length > 0 && input.customerMap.length <= 100 && input.customerMap.every((r) => Object.keys(r).every((k) => ["crmId", "inventoryId"].includes(k)) && safeText(r.crmId) && positive(r.inventoryId)), "MAPPING");
		reject(new Set(input.customerMap.map((r) => r.crmId)).size === input.customerMap.length, "MAPPING");
		reject(Array.isArray(input.productIds) && input.productIds.length > 0 && input.productIds.length <= 500 && input.productIds.every(positive) && new Set(input.productIds).size === input.productIds.length && positive(input.warehouseId), "PRODUCT_SCOPE");
		reject(Array.isArray(input.permissions) && input.permissions.length > 0 && new Set(input.permissions).size === input.permissions.length && input.permissions.every((k) => permissions.includes(k)), "PERMISSION");
		reject(Array.isArray(input.customerFields) && new Set(input.customerFields).size === input.customerFields.length && input.customerFields.every((k) => fields.includes(k)), "FIELD_SCOPE");
		const until = Date.parse(input.expiresAt);
		reject(Number.isFinite(until) && until > Date.now() && until <= Date.now() + 366 * 864e5, "EXPIRY");
		const crm = this.providers.get(CRM), inventory = this.providers.get(INV);
		reject(crm && inventory && !this.closed && this.ready(), "PROVIDER_UNAVAILABLE");
		for (const [provider, account] of [[crm, input.crmAccount], [inventory, input.inventoryAccount]]) reject((await provider.accounts()).some((r) => r.instanceId === account), "ACCOUNT");
		for (const provider of [crm, inventory]) {
			const owned = (await this.owned()).find((r) => r.name === provider.packageName && r.enabled !== false);
			reject(owned && await realpath(resolve(owned.directory)) === await realpath(resolve(provider.packageDirectory)), "PROVIDER_UNAVAILABLE");
		}
		return {
			crm,
			inventory
		};
	}
	async create(input) {
		if (input?.contractId && input.contractId !== "beellix.crm-inventory.v1") return writeCustom(this, "create", input);
		const { crm, inventory } = await this.validateInput(input);
		const grant = {
			...structuredClone(input),
			id: randomUUID(),
			revision: 1,
			enabled: true,
			status: "pending",
			crmInstallation: crm.installationId,
			inventoryInstallation: inventory.installationId,
			actor: "local-owner",
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		await crm.validateGrant(grant);
		await inventory.validateGrant(grant);
		await this.mutate((state) => state.grants.push(grant));
		try {
			await crm.snapshotGrant(grant);
			await inventory.snapshotGrant(grant);
			grant.status = "ready";
			await this.mutate((state) => {
				const i = state.grants.findIndex((r) => r.id === grant.id);
				reject(state.grants[i]?.revision === grant.revision, "GRANT_REVISION");
				state.grants[i] = grant;
			});
		} catch (error) {
			await this.setEnabled({
				id: grant.id,
				enabled: false,
				expectedRevision: 1
			}).catch(() => {});
			throw error;
		}
		await this.audit(grant, "grant.create", "complete");
		return structuredClone(grant);
	}
	async setEnabled({ id, enabled, expectedRevision }) {
		const previous = (await this.list()).find((r) => r.id === id);
		reject(previous && previous.revision === expectedRevision, "GRANT_REVISION");
		if (previous.sourcePackage) return writeCustom(this, "enabled", {
			id,
			enabled,
			expectedRevision
		});
		if (enabled) {
			const input = Object.fromEntries([
				"contractId",
				"crmAccount",
				"inventoryAccount",
				"customerMap",
				"productIds",
				"warehouseId",
				"permissions",
				"customerFields",
				"expiresAt"
			].filter((k) => Object.hasOwn(previous, k)).map((k) => [k, previous[k]])), { crm, inventory } = await this.validateInput(input);
			await crm.validateGrant(previous);
			await inventory.validateGrant(previous);
		}
		reject(typeof enabled === "boolean", "GRANT");
		const grant = await this.mutate((state) => {
			const row = state.grants.find((r) => r.id === id);
			reject(row && row.revision === expectedRevision, "GRANT_REVISION");
			row.enabled = false;
			if (enabled) row.status = "pending";
			row.revision++;
			return structuredClone(row);
		});
		for (const [key, control] of this.inflight) if (key.startsWith(id + ":")) control.abort(Error("INTEGRATION_GRANT_REVOKED"));
		if (enabled) try {
			for (const name of [CRM, INV]) await this.providers.get(name).snapshotGrant({
				...grant,
				enabled: true,
				status: "ready"
			});
			await this.mutate((state) => {
				const row = state.grants.find((r) => r.id === id);
				reject(row?.revision === grant.revision, "GRANT_REVISION");
				row.enabled = true;
				row.status = "ready";
			});
			grant.enabled = true;
			grant.status = "ready";
		} catch (error) {
			await this.audit(grant, "grant.change", "rejected");
			throw error;
		}
		else for (const name of [CRM, INV]) try {
			await this.providers.get(name)?.snapshotGrant(grant);
		} catch {}
		await this.audit(grant, "grant.change", "complete");
		return grant;
	}
	async update(input) {
		exact(input, [
			"id",
			"expectedRevision",
			"input"
		]);
		const previous = (await this.list()).find((r) => r.id === input.id);
		reject(previous && previous.revision === input.expectedRevision, "GRANT_REVISION");
		if (previous.sourcePackage) return writeCustom(this, "update", input);
		reject(input.input?.crmAccount === previous.crmAccount && input.input?.inventoryAccount === previous.inventoryAccount, "IDENTITY");
		const { crm, inventory } = await this.validateInput(input.input), grant = {
			...previous,
			...structuredClone(input.input),
			revision: previous.revision + 1,
			status: "pending",
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		await crm.validateGrant(grant);
		await inventory.validateGrant(grant);
		await this.mutate((state) => {
			const i = state.grants.findIndex((r) => r.id === input.id);
			reject(state.grants[i]?.revision === input.expectedRevision, "GRANT_REVISION");
			state.grants[i] = {
				...grant,
				enabled: false
			};
		});
		for (const [key, control] of this.inflight) if (key.startsWith(grant.id + ":")) control.abort(Error("INTEGRATION_GRANT_REVOKED"));
		try {
			await crm.snapshotGrant(grant);
			await inventory.snapshotGrant(grant);
			grant.status = "ready";
			await this.mutate((state) => {
				const i = state.grants.findIndex((r) => r.id === grant.id);
				reject(state.grants[i]?.revision === grant.revision, "GRANT_REVISION");
				state.grants[i] = grant;
			});
			await this.audit(grant, "grant.update", "complete");
			return structuredClone(grant);
		} catch (error) {
			await this.audit(grant, "grant.update", "rejected");
			throw error;
		}
	}
	async auditSnapshot({ offset = 0, limit = 40, grantId } = {}) {
		reject(Number.isSafeInteger(offset) && offset >= 0 && Number.isSafeInteger(limit) && limit > 0 && limit <= 100 && (!grantId || safeText(grantId)), "LOOKUP");
		let file;
		try {
			file = await open(join(this.root, "data/integration/audit.jsonl"), "r");
		} catch (error) {
			if (error.code === "ENOENT") return {
				items: [],
				total: 0,
				nextOffset: null
			};
			throw error;
		}
		try {
			let position = (await file.stat()).size, carry = Buffer.alloc(0), total = 0;
			const items = [];
			const collect = (line) => {
				if (!line.trim()) return;
				let row;
				try {
					row = JSON.parse(line);
				} catch {
					return;
				}
				if (grantId && row.grantId !== grantId) return;
				if (total >= offset && items.length < limit) items.push(row);
				total++;
			};
			while (position > 0) {
				const length = Math.min(position, 65536), buffer = Buffer.alloc(length);
				position -= length;
				await file.read(buffer, 0, length, position);
				const bytes = Buffer.concat([buffer, carry]);
				let end = bytes.length;
				for (let i = bytes.length - 1; i >= 0; i--) if (bytes[i] === 10) {
					collect(bytes.subarray(i + 1, end).toString("utf8"));
					end = i;
				}
				carry = bytes.subarray(0, end);
				reject(carry.length <= 1048576, "AUDIT_INVALID");
			}
			collect(carry.toString("utf8"));
			return {
				items,
				total,
				nextOffset: offset + items.length < total ? offset + items.length : null
			};
		} finally {
			await file.close();
		}
	}
	async authorize(entry, packet, context = {}) {
		reject(packet?.version === 1, "VERSION");
		exact(packet, [
			"version",
			"grantId",
			"accountId",
			"operation",
			"input",
			"requestId"
		]);
		reject(!this.closed && this.ready() && this.providers.get(entry.packageName) === entry, "PROVIDER_UNAVAILABLE");
		const grant = (await this.load()).grants.find((r) => r.id === packet.grantId);
		reject(grant?.enabled && grant.status === "ready" && Date.parse(grant.expiresAt) > Date.now(), "GRANT_UNAVAILABLE");
		if (grant.sourcePackage) return authorizeCustom(this, entry, packet, context, grant);
		const source = entry.packageName === CRM ? "crm" : "inventory", target = this.providers.get(source === "crm" ? INV : CRM);
		reject(entry.installationId === grant[source + "Installation"] && target?.installationId === grant[(source === "crm" ? "inventory" : "crm") + "Installation"], "PROVIDER_UNAVAILABLE");
		const owned = await this.owned();
		for (const provider of [entry, target]) {
			const installed = owned.find((r) => r.name === provider.packageName && r.enabled !== false);
			reject(installed && await realpath(resolve(installed.directory)) === await realpath(resolve(provider.packageDirectory)), "PROVIDER_UNAVAILABLE");
		}
		reject(packet.accountId === grant[source + "Account"] && (await entry.accounts()).some((r) => r.instanceId === packet.accountId) && (await target.accounts()).some((r) => r.instanceId === grant[(source === "crm" ? "inventory" : "crm") + "Account"]), "ACCOUNT");
		reject(grant.permissions.includes(packet.operation) && (source === "crm" ? packet.operation.startsWith("inventory.") : packet.operation === "crm.customer"), "PERMISSION");
		const input = packet.input ?? {};
		if (packet.operation === "inventory.catalog") exact(input, []);
		else if (packet.operation === "crm.customer") {
			exact(input, ["customerId"]);
			reject(grant.customerMap.some((r) => r.crmId === input.customerId), "OBJECT_SCOPE");
		} else if (packet.operation === "inventory.createDraft") {
			reject(!context.readOnly, "READ_ONLY");
			exact(input, [
				"customerId",
				"lines",
				"reference",
				"sourceRevision"
			]);
			reject(grant.customerMap.some((r) => r.crmId === input.customerId) && Array.isArray(input.lines) && input.lines.length > 0 && input.lines.length <= 100, "OBJECT_SCOPE");
			for (const line of input.lines) {
				exact(line, [
					"productId",
					"quantity",
					"price"
				]);
				reject(grant.productIds.includes(line.productId) && /^(?:\d{1,12})(?:\.\d{1,6})?$/.test(line.quantity) && Number(line.quantity) > 0 && /^(?:\d{1,12})(?:\.\d{1,6})?$/.test(line.price), "PRODUCT_SCOPE");
			}
			reject(safeText(packet.requestId) && /^[A-Za-z0-9_-]{8,100}$/.test(packet.requestId), "REQUEST");
			reject(input.reference === void 0 || safeText(input.reference), "FIELDS");
		} else {
			exact(input, ["orderId"]);
			reject(positive(input.orderId), "OBJECT_SCOPE");
		}
		return {
			grant,
			target
		};
	}
	async review(entry, packet, context = {}) {
		reject(!context.readOnly, "READ_ONLY");
		const frozen = structuredClone(packet), { grant, target, contract, operation, targetAccount } = await this.authorize(entry, frozen, context), previewAction = target.preview ?? target.previewDraft;
		reject((contract ? operation.effect === "write" : frozen.operation === "inventory.createDraft") && typeof previewAction === "function", "REVIEW_OPERATION");
		reject(context.questions?.ask, "REVIEW_UNAVAILABLE");
		const preview = await previewAction({
			grant,
			accountId: targetAccount ?? grant.inventoryAccount,
			input: frozen.input,
			requestId: frozen.requestId,
			operation: frozen.operation,
			signal: context.signal
		}), questionIds = [];
		const rows = contract ? contract.review(preview) : [`客户：${preview.result.partner_id?.name ?? "已关联客户"}\n销售草稿（不会确认或出库）`, ...(preview.result.lines ?? []).map((r) => `${r.product_id?.name ?? "商品"}\n数量：${r.product_uom_qty}　未税单价：${r.price_unit}`)];
		reject(Array.isArray(rows) && rows.length > 0 && rows.length <= 101 && rows.every((r) => typeof r === "string" && r.length <= 4e3), "REVIEW_OPERATION");
		for (let i = 0; i < rows.length; i++) {
			context.signal?.throwIfAborted();
			const id = "integration-" + randomUUID();
			const answer = (await context.questions.ask({
				agent: context.agent,
				signal: context.signal,
				questions: [{
					id,
					header: contract ? "跨插件操作审核" : "跨应用建单审核",
					question: `第 ${i + 1}/${rows.length} 项`,
					detail: rows[i].replace(/[\\`*_{}[\]()#+.!|<>-]/g, "\\$&"),
					options: [{
						label: "暂不提交",
						description: contract ? "不执行本次业务写入。" : "不创建任何销售单。"
					}, {
						label: "确认此项",
						description: i === rows.length - 1 ? "提交已核对的业务请求。" : "继续核对，尚未写入。"
					}]
				}]
			}))?.answers?.find((r) => r.id === id);
			if (!(answer && !answer.custom && answer.selected?.length === 1 && answer.selected[0] === "确认此项")) {
				await this.audit(grant, "review.reject", "rejected", frozen.requestId);
				reject(false, "REVIEW_NOT_CONFIRMED");
			}
			questionIds.push(id);
		}
		const again = await this.authorize(entry, frozen, context);
		reject(again.grant.revision === grant.revision, "GRANT_REVISION");
		const value = {
			version: 1,
			grantId: grant.id,
			grantRevision: grant.revision,
			source: entry.installationId,
			requestId: frozen.requestId,
			digest: digest(frozen),
			stateRevision: preview.stateRevision,
			questionIds,
			expiresAt: Date.now() + 15 * 6e4
		};
		return {
			value,
			signature: createHmac("sha256", await this.key()).update(canonical(value)).digest("hex")
		};
	}
	async call(entry, packet, context = {}) {
		const frozen = structuredClone(packet);
		let authorized;
		try {
			authorized = await this.authorize(entry, frozen, context);
		} catch (error) {
			const grant = (await this.list()).find((r) => r.id === frozen?.grantId);
			if (grant) await this.audit(grant, frozen?.operation, "rejected", frozen?.requestId);
			throw error;
		}
		const { grant, target, contract, operation, targetAccount } = authorized, accountId = targetAccount ?? (entry.packageName === CRM ? grant.inventoryAccount : grant.crmAccount);
		if (contract ? operation.effect === "write" : frozen.operation === "inventory.createDraft") {
			const receipt = context.approval, value = receipt?.value;
			reject(value && value.version === 1 && value.expiresAt > Date.now() && value.grantId === grant.id && value.grantRevision === grant.revision && value.source === entry.installationId && value.requestId === frozen.requestId && value.digest === digest(frozen), "REVIEW_REQUIRED");
			const expected = createHmac("sha256", await this.key()).update(canonical(value)).digest(), actual = Buffer.from(receipt.signature ?? "", "hex");
			reject(expected.length === actual.length && timingSafeEqual(expected, actual), "REVIEW_SIGNATURE");
		}
		const controller = new AbortController(), key = grant.id + ":" + randomUUID();
		this.inflight.set(key, controller);
		const signal = context.signal ? AbortSignal.any([
			context.signal,
			controller.signal,
			AbortSignal.timeout(6e4)
		]) : AbortSignal.any([controller.signal, AbortSignal.timeout(6e4)]);
		try {
			const result = await target.call({
				grant,
				accountId,
				operation: frozen.operation,
				input: frozen.input ?? {},
				requestId: frozen.requestId,
				source: {
					packageName: entry.packageName,
					installationId: entry.installationId,
					accountId: frozen.accountId,
					actor: "local-owner"
				},
				approval: context.approval?.value,
				signal
			});
			signal.throwIfAborted();
			const current = await this.authorize(entry, frozen, context);
			reject(current.grant.revision === grant.revision, "GRANT_REVISION");
			let data;
			if (contract) {
				data = await contract.project({
					grant,
					packet: frozen,
					result
				});
				reject(data && typeof data === "object" && !Array.isArray(data), "OUTPUT");
			} else if (frozen.operation === "inventory.catalog") {
				const items = (result.items ?? []).filter((r) => grant.productIds.includes(r.id)).map((r) => pick(r, [
					"id",
					"name",
					"sku",
					"unit",
					"price",
					"available",
					"warehouse",
					"asOf",
					"revision"
				]));
				data = {
					items,
					total: items.length
				};
			} else if (frozen.operation === "crm.customer") data = pick(result, [
				"id",
				"revision",
				...grant.customerFields
			]);
			else {
				reject(grant.customerMap.some((r) => r.inventoryId === result.customerId), "OBJECT_SCOPE");
				data = pick(result, [
					"id",
					"name",
					"state",
					"customerId",
					"amount",
					"currency",
					"delivered",
					"invoiced",
					"paid",
					"remaining",
					"revision",
					"replayed"
				]);
			}
			await this.audit(grant, frozen.operation, "complete", frozen.requestId);
			return {
				version: 1,
				grantId: grant.id,
				grantRevision: grant.revision,
				sourceAccount: frozen.accountId,
				targetAccount: accountId,
				data
			};
		} catch (error) {
			await this.audit(grant, frozen.operation, "rejected", frozen.requestId);
			throw error;
		} finally {
			this.inflight.delete(key);
		}
	}
	async audit(grant, operation, result, requestId) {
		const dir = join(this.root, "data/integration");
		await mkdir(dir, { recursive: true });
		await appendFile(join(dir, "audit.jsonl"), JSON.stringify({
			version: 1,
			id: randomUUID(),
			at: (/* @__PURE__ */ new Date()).toISOString(),
			actor: "local-owner",
			grantId: grant.id,
			revision: grant.revision,
			contractId: grant.contractId,
			sourcePackage: grant.sourcePackage,
			targetPackage: grant.targetPackage,
			sourceAccount: grant.sourceAccount,
			targetAccount: grant.targetAccount,
			sourceInstallation: grant.sourceInstallation,
			targetInstallation: grant.targetInstallation,
			crmInstallation: grant.crmInstallation,
			inventoryInstallation: grant.inventoryInstallation,
			crmAccount: grant.crmAccount,
			inventoryAccount: grant.inventoryAccount,
			operation: safeText(operation) ? operation : "unknown",
			requestId: safeText(requestId) ? requestId : void 0,
			result
		}) + "\n", { mode: 384 });
	}
	async dispose() {
		this.closed = true;
		for (const control of this.inflight.values()) control.abort(Error("INTEGRATION_PROVIDER_UNAVAILABLE"));
		this.inflight.clear();
		this.providers.clear();
	}
};
//#endregion
export { Interoperability };
