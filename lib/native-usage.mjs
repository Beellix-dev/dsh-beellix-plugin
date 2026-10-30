import { n as writeFileAtomic, t as withFileLock } from "./lib-Dl5J5M7o.mjs";
import { lstat, mkdir, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { createHash, randomUUID } from "node:crypto";
//#region dev/shared/runtime/native-usage.mjs
/** 原生调用的最小计量索引；不保存提示词、回答、工具参数或凭据。 */
const identity = (value) => typeof value === "string" && value.length > 0 && value.length <= 200 && !/[\u0000-\u001f]/u.test(value);
const integer = (value) => Number.isSafeInteger(value) && value >= 0;
const digest = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const buckets = [
	"inputTokens",
	"outputTokens",
	"cacheReadTokens",
	"cacheWriteTokens"
];
const prices = [
	"input",
	"output",
	"cacheRead",
	"cacheWrite"
];
const amount = (value) => {
	const text = value.toString().padStart(13, "0");
	return `${text.slice(0, -12)}.${text.slice(-12)}`;
};
const micros = (value) => {
	const [whole, fraction = ""] = value.split(".");
	return BigInt(whole) * 1000000n + BigInt(fraction.padEnd(6, "0"));
};
async function plainDirectory(path) {
	const parent = dirname(path);
	if (parent !== path) await plainDirectory(parent);
	try {
		const stat = await lstat(path);
		if (stat.isSymbolicLink() || !stat.isDirectory()) throw Error("用量目录包含链接或异常类型。");
	} catch (error) {
		if (error.code !== "ENOENT") throw error;
		await mkdir(path).catch((error) => {
			if (error.code !== "EEXIST") throw error;
		});
		const stat = await lstat(path);
		if (stat.isSymbolicLink() || !stat.isDirectory()) throw Error("用量目录不安全。");
	}
}
function normalizedUsage(value) {
	if (!value || !integer(value.inputTokens) || !integer(value.outputTokens)) return null;
	if (["cacheReadTokens", "cacheWriteTokens"].some((key) => value[key] !== void 0 && !integer(value[key]))) return null;
	return Object.fromEntries(buckets.map((key) => [key, value[key] ?? 0]));
}
/** 沿原生日志顺序折叠，继承前缀不计费，同一尝试的修订只保留最后一次用量。 */
function projectUsage({ meta, events, inheritedEventCount = 0 }) {
	if (!identity(meta?.id) || !Array.isArray(events) || !integer(inheritedEventCount) || inheritedEventCount > events.length) throw Error("原生调用记录格式不支持。");
	let route = {}, current;
	const attempts = /* @__PURE__ */ new Map(), records = /* @__PURE__ */ new Map();
	for (const event of events) {
		const data = event.data ?? {};
		if (event.type === "request/header") route = data.header?.config ?? {};
		if (!integer(event.seq) || event.seq < inheritedEventCount) continue;
		if (event.type === "step/start") {
			current = `${data.turn}:${data.step}`;
			attempts.set(current, {
				retry: 0,
				startedAt: event.time
			});
		}
		if (event.type === "llm/retry-started") {
			current = `${data.turn}:${data.step}`;
			const previous = attempts.get(current);
			attempts.set(current, {
				retry: (previous?.retry ?? 0) + 1,
				startedAt: event.time
			});
		}
		if (event.type === "compaction/summary" && data.llmStreamCall === true) {
			if (!identity(data.provider) || !identity(data.model) || !integer(event.time)) throw Error("压缩调用缺少计量身份。");
			const id = digest([
				meta.id,
				"compaction",
				data.compactionId ?? event.seq
			]);
			records.set(id, {
				id,
				sessionId: meta.id,
				parentSessionId: meta.parentSession ?? null,
				kind: "compaction",
				turn: null,
				step: null,
				attempt: 0,
				startedAt: event.time,
				time: event.time,
				provider: data.provider,
				model: data.model,
				outcome: "message",
				usage: normalizedUsage(data.usage)
			});
			continue;
		}
		if (!["assistant/message", "assistant/attempt"].includes(event.type)) continue;
		if (!integer(data.turn) || !integer(data.step) || !integer(event.time)) throw Error("原生调用缺少计量身份。");
		const attempt = attempts.get(`${data.turn}:${data.step}`) ?? {
			retry: 0,
			startedAt: event.time
		};
		let usage = data.usage;
		if (usage === void 0) {
			for (const item of [...data.stream ?? []].reverse()) if (item.type === "chunk" && item.chunk?.type === "usage") {
				usage = item.chunk.usage;
				break;
			}
		}
		const id = digest([
			meta.id,
			data.turn,
			data.step,
			attempt.retry
		]);
		records.set(id, {
			id,
			sessionId: meta.id,
			parentSessionId: meta.parentSession ?? null,
			kind: meta.origin === "subagent" ? "subagent" : "main",
			turn: data.turn,
			step: data.step,
			attempt: attempt.retry,
			startedAt: attempt.startedAt,
			time: event.time,
			provider: identity(route.provider) ? route.provider : null,
			model: identity(route.model) ? route.model : null,
			outcome: data.interrupted ? "interrupted" : event.type === "assistant/attempt" ? "attempt" : "message",
			usage: normalizedUsage(usage)
		});
	}
	return [...records.values()];
}
function priceInput(input) {
	if (!input || Array.isArray(input) || Object.keys(input).some((key) => ![
		"provider",
		"model",
		"currency",
		...prices,
		"expectedRevision",
		"applyUnpriced"
	].includes(key))) throw Error("价格字段无效。");
	if (!identity(input.provider) || !identity(input.model) || ![
		"CNY",
		"USD",
		"EUR",
		"JPY",
		"GBP",
		"HKD"
	].includes(input.currency) || !integer(input.expectedRevision) || input.applyUnpriced !== void 0 && typeof input.applyUnpriced !== "boolean") throw Error("模型或价格字段无效。");
	for (const key of prices) if (typeof input[key] !== "string" || input[key] !== "" && !/^(?:0|[1-9]\d{0,8})(?:\.\d{1,6})?$/u.test(input[key])) throw Error("价格需为非负数字，最多六位小数。");
	if (input.input === "" || input.output === "") throw Error("请填写输入和输出价格。");
	return Object.fromEntries([
		"provider",
		"model",
		"currency",
		...prices
	].map((key) => [key, input[key]]));
}
function evaluate(call, rule, basis) {
	if (!call.usage || !rule) return null;
	let total = 0n;
	for (let i = 0; i < buckets.length; i++) {
		const count = call.usage[buckets[i]], price = rule[prices[i]];
		if (count > 0 && price === "") return null;
		if (price !== "") total += BigInt(count) * micros(price);
	}
	return {
		ruleId: rule.id,
		version: rule.version,
		currency: rule.currency,
		rates: Object.fromEntries(prices.map((key) => [key, rule[key]])),
		amount: amount(total),
		basis
	};
}
var UsageStore = class {
	constructor(root, { now = Date.now } = {}) {
		this.root = resolve(root);
		this.path = join(this.root, "data/control-plane/usage-ledger.json");
		this.now = now;
	}
	async load() {
		await plainDirectory(dirname(this.path));
		try {
			const stat = await lstat(this.path);
			if (stat.isSymbolicLink() || !stat.isFile() || stat.size > 32 * 1024 * 1024) throw Error("用量记录不可安全读取。");
			const state = JSON.parse(await readFile(this.path, "utf8"));
			if (state.schemaVersion !== 1 || !integer(state.revision) || !Array.isArray(state.prices) || !state.calls || Array.isArray(state.calls) || typeof state.calls !== "object") throw Error("用量记录格式不支持，原文件已保留。");
			for (const rule of state.prices) {
				priceInput({
					...Object.fromEntries([
						"provider",
						"model",
						"currency",
						...prices
					].map((key) => [key, rule[key]])),
					expectedRevision: rule.version
				});
				if (!identity(rule.id) || !integer(rule.createdAt) || Object.keys(rule).some((key) => ![
					"id",
					"version",
					"createdAt",
					"provider",
					"model",
					"currency",
					...prices
				].includes(key))) throw Error("价格记录格式不支持。");
			}
			for (const [id, row] of Object.entries(state.calls)) {
				const source = row.source;
				if (!/^[a-f0-9]{64}$/u.test(id) || source?.id !== id || !identity(source.sessionId) || !integer(source.time) || !integer(source.startedAt) || source.usage !== null && !normalizedUsage(source.usage) || Object.keys(source).some((key) => ![
					"id",
					"sessionId",
					"parentSessionId",
					"kind",
					"turn",
					"step",
					"attempt",
					"startedAt",
					"time",
					"provider",
					"model",
					"outcome",
					"usage"
				].includes(key))) throw Error("用量记录格式不支持。");
				if (row.pricing !== null) {
					const rule = state.prices.find((rule) => rule.id === row.pricing?.ruleId);
					if (!rule || !["at-call", "backfill"].includes(row.pricing.basis) || JSON.stringify(evaluate(source, rule, row.pricing.basis)) !== JSON.stringify(row.pricing)) throw Error("费用快照不一致，原记录已保留。");
				}
			}
			return state;
		} catch (error) {
			if (error.code !== "ENOENT") throw error;
			return {
				schemaVersion: 1,
				revision: 0,
				prices: [],
				calls: {}
			};
		}
	}
	async write(state) {
		if (Object.keys(state.calls).length > 5e4 || state.prices.length > 4096) throw Error("用量记录达到当前容量，请备份后扩容。");
		const content = JSON.stringify(state) + "\n";
		if (Buffer.byteLength(content) > 32 * 1024 * 1024) throw Error("用量记录达到当前容量，请备份后扩容。");
		await writeFileAtomic(this.path, content, { mode: 384 });
	}
	async ingest(inspection) {
		const calls = projectUsage(inspection);
		if (!calls.length) return;
		await plainDirectory(dirname(this.path));
		return withFileLock(this.path, async () => {
			const state = await this.load();
			let dirty = false;
			for (const call of calls) {
				const previous = state.calls[call.id];
				if (previous && digest(previous.source) === digest(call)) continue;
				const previousRule = previous?.pricing && state.prices.find((rule) => rule.id === previous.pricing.ruleId && rule.provider === call.provider && rule.model === call.model);
				const matching = state.prices.filter((rule) => rule.provider === call.provider && rule.model === call.model && rule.createdAt <= call.startedAt);
				const rule = previousRule ?? matching.at(-1);
				state.calls[call.id] = {
					source: call,
					pricing: evaluate(call, rule, previous?.pricing?.basis ?? "at-call")
				};
				dirty = true;
			}
			if (dirty) await this.write(state);
		});
	}
	async savePrice(input) {
		const value = priceInput(input);
		await plainDirectory(dirname(this.path));
		return withFileLock(this.path, async () => {
			const state = await this.load();
			if (state.revision !== input.expectedRevision) throw Object.assign(Error("价格已更新，请刷新后重试。"), { status: 409 });
			const rule = {
				...value,
				id: randomUUID(),
				version: ++state.revision,
				createdAt: this.now()
			};
			state.prices.push(rule);
			let repriced = 0;
			if (input.applyUnpriced) for (const row of Object.values(state.calls)) {
				if (row.pricing || row.source.provider !== rule.provider || row.source.model !== rule.model) continue;
				const pricing = evaluate(row.source, rule, "backfill");
				if (pricing) {
					row.pricing = pricing;
					repriced++;
				}
			}
			await this.write(state);
			return {
				revision: state.revision,
				repriced
			};
		});
	}
	async snapshot({ from = 0, to = Number.MAX_SAFE_INTEGER, provider = "", model = "", offset = 0, limit = 100 } = {}) {
		if (![
			from,
			to,
			offset,
			limit
		].every(integer) || from > to || limit < 1 || limit > 100 || provider && !identity(provider) || model && !identity(model)) throw Object.assign(Error("用量筛选条件无效。"), { status: 400 });
		const state = await this.load(), filtered = Object.values(state.calls).filter((row) => row.source.time >= from && row.source.time < to && (!provider || row.source.provider === provider) && (!model || row.source.model === model)).sort((a, b) => b.source.time - a.source.time);
		const totals = {}, models = /* @__PURE__ */ new Map();
		let unpriced = 0, missingUsage = 0;
		for (const row of filtered) {
			const call = row.source;
			if (!call.usage) missingUsage++;
			if (!row.pricing) unpriced++;
			else totals[row.pricing.currency] = (totals[row.pricing.currency] ?? 0n) + BigInt(row.pricing.amount.replace(".", ""));
			const key = JSON.stringify([call.provider, call.model]), group = models.get(key) ?? {
				provider: call.provider,
				model: call.model,
				calls: 0,
				usage: Object.fromEntries(buckets.map((key) => [key, 0n])),
				missingUsage: 0
			};
			group.calls++;
			if (!call.usage) group.missingUsage++;
			else for (const key of buckets) group.usage[key] += BigInt(call.usage[key]);
			models.set(key, group);
		}
		const latest = /* @__PURE__ */ new Map();
		for (const rule of state.prices) latest.set(JSON.stringify([rule.provider, rule.model]), rule);
		return {
			revision: state.revision,
			prices: [...latest.values()],
			summary: {
				totalCalls: filtered.length,
				unpriced,
				missingUsage,
				currencies: Object.fromEntries(Object.entries(totals).map(([key, value]) => [key, amount(value)]))
			},
			models: [...models.values()].map((row) => ({
				...row,
				usage: Object.fromEntries(buckets.map((key) => [key, row.usage[key].toString()]))
			})),
			calls: filtered.slice(offset, offset + limit).map((row) => ({
				...row.source,
				pricing: row.pricing
			})),
			nextOffset: offset + limit < filtered.length ? offset + limit : null
		};
	}
};
/** 只用公开的原生会话读取，不恢复 Agent，不改写原日志。 */
var NativeUsage = class {
	constructor(store, { list, inspect }) {
		this.store = store;
		this.list = list;
		this.inspect = inspect;
		this.pending = null;
		this.active = /* @__PURE__ */ new Map();
		this.lastSync = null;
	}
	capture(id) {
		const current = this.active.get(id);
		if (current) {
			current.dirty = true;
			return current.pending;
		}
		const task = { dirty: false };
		task.pending = (async () => {
			do {
				task.dirty = false;
				await this.store.ingest(await this.inspect(id));
			} while (task.dirty);
		})().finally(() => {
			if (this.active.get(id) === task) this.active.delete(id);
		});
		this.active.set(id, task);
		return task.pending;
	}
	async flush() {
		await Promise.all([...this.active.values()].map((task) => task.pending));
	}
	sync() {
		return this.pending ??= (async () => {
			const rows = await this.list(), unique = [...new Set(rows.map((row) => row.header?.id ?? row.id).filter(identity))];
			if (unique.length > 1e4) throw Error("原生记录较多，需要分批同步。");
			let failed = 0;
			for (const id of unique) try {
				await this.capture(id);
			} catch {
				failed++;
			}
			return this.lastSync = {
				total: unique.length,
				failed,
				updatedAt: Date.now()
			};
		})().finally(() => {
			this.pending = null;
		});
	}
};
//#endregion
export { NativeUsage, UsageStore, projectUsage };
