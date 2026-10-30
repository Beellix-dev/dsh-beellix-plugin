import { n as writeFileAtomic, t as withFileLock } from "./lib-Dl5J5M7o.mjs";
import { r as packageContract } from "./package-contract-0HgPCmdF.mjs";
import { r as inspectAddonArchive } from "./native-companion-4N6cJnaN.mjs";
import { lstat, mkdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { createHash } from "node:crypto";
import { request } from "node:https";
import { lookup } from "node:dns";
import { isIP } from "node:net";
//#region dev/shared/runtime/public-https.mjs
/** Configured public update sources: HTTPS, bounded bodies, no redirects or private-network access. */
function isPublicAddress(address) {
	const family = isIP(address);
	if (family === 4) {
		const [a, b, c] = address.split(".").map(Number);
		return !(a === 0 || a === 10 || a === 127 || a >= 224 || a === 100 && b >= 64 && b <= 127 || a === 169 && b === 254 || a === 172 && b >= 16 && b <= 31 || a === 192 && (b === 168 || b === 0 || b === 88 && c === 99) || a === 198 && (b === 18 || b === 19 || b === 51 && c === 100) || a === 203 && b === 0 && c === 113);
	}
	if (family !== 6 || address.includes(".")) return false;
	const [left, right] = address.toLowerCase().split("::"), parts = left ? left.split(":") : [], tail = right ? right.split(":") : [];
	const values = (right === void 0 ? parts : [
		...parts,
		...Array(8 - parts.length - tail.length).fill("0"),
		...tail
	]).map((v) => parseInt(v, 16));
	return values[0] >= 8192 && values[0] <= 16383 && values[0] !== 8194 && !(values[0] === 8193 && (values[1] < 512 || values[1] === 3512)) && !(values[0] === 16383 && values[1] < 4096);
}
function publicHttpsUrl(value) {
	let url;
	try {
		url = new URL(value);
	} catch {
		throw Error("UPDATE_SOURCE_INVALID");
	}
	const host = url.hostname.replace(/^\[|\]$/gu, "");
	if (url.protocol !== "https:" || url.port || url.username || url.password || url.search || url.hash || url.href.length > 2e3 || host.endsWith(".") || isIP(host) && !isPublicAddress(host)) throw Error("UPDATE_SOURCE_INVALID");
	if (!isIP(host) && (!host.includes(".") || /(?:^|\.)(?:localhost|local|internal|test|invalid)$/iu.test(host))) throw Error("UPDATE_SOURCE_INVALID");
	return url;
}
function publicLookup(host, options, callback) {
	lookup(host, {
		all: true,
		verbatim: true
	}, (error, addresses) => {
		if (error) return callback(error);
		if (!addresses.length || addresses.some((row) => !isPublicAddress(row.address))) return callback(Error("UPDATE_SOURCE_INVALID"));
		if (options?.all) return callback(null, addresses);
		callback(null, addresses[0].address, addresses[0].family);
	});
}
async function publicHttpsBytes(value, { maxBytes, signal, accept = "application/json" } = {}) {
	const url = publicHttpsUrl(value);
	if (!Number.isSafeInteger(maxBytes) || maxBytes < 1 || maxBytes > 64 * 1024 * 1024) throw Error("UPDATE_SOURCE_INVALID");
	return new Promise((resolve, reject) => {
		const req = request(url, {
			method: "GET",
			agent: false,
			lookup: publicLookup,
			signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(45e3)]) : AbortSignal.timeout(45e3),
			headers: {
				accept,
				"accept-encoding": "identity"
			}
		}, (response) => {
			if (response.statusCode !== 200 || response.headers["content-encoding"] && response.headers["content-encoding"] !== "identity") {
				response.resume();
				req.destroy(Error("UPDATE_UNAVAILABLE"));
				return;
			}
			if (Number(response.headers["content-length"]) > maxBytes) {
				req.destroy(Error("UPDATE_TOO_LARGE"));
				return;
			}
			const chunks = [];
			let size = 0;
			response.on("data", (chunk) => {
				size += chunk.length;
				if (size > maxBytes) req.destroy(Error("UPDATE_TOO_LARGE"));
				else chunks.push(chunk);
			});
			response.on("error", reject);
			response.on("end", () => resolve(Buffer.concat(chunks)));
		});
		req.on("error", reject);
		req.end();
	});
}
//#endregion
//#region dev/shared/runtime/plugin-updates.mjs
/** Release source is supplied by the entrance package, never by a user-facing setting. */
const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
const digest = (v) => typeof v === "string" && /^[a-f0-9]{64}$/u.test(v);
const record = (v) => v && typeof v === "object" && !Array.isArray(v);
const only = (v, keys) => record(v) && Object.keys(v).every((k) => keys.includes(k));
const version = (v) => typeof v === "string" && /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*))*)?$/u.test(v) && v.length <= 100;
const timestamp = (v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/u.test(v) && Number.isFinite(Date.parse(v));
function releaseSource(value) {
	if (!only(value, [
		"schemaVersion",
		"revision",
		"sourceUrl",
		"automatic"
	]) || value.schemaVersion !== 1 || !Number.isSafeInteger(value.revision) || value.revision < 1 || typeof value.automatic !== "boolean" || value.sourceUrl !== null && typeof value.sourceUrl !== "string") throw Error("UPDATE_SOURCE_INVALID");
	const sourceUrl = value.sourceUrl === null ? null : publicHttpsUrl(value.sourceUrl).href;
	return Object.freeze({
		...value,
		sourceUrl,
		sourceKey: sha(String(sourceUrl))
	});
}
function compareVersions(a, b) {
	if (!version(a) || !version(b)) throw Error("UPDATE_CATALOG_INVALID");
	const [ac, ap] = a.split("-").length > 1 ? [a.slice(0, a.indexOf("-")), a.slice(a.indexOf("-") + 1)] : [a], [bc, bp] = b.split("-").length > 1 ? [b.slice(0, b.indexOf("-")), b.slice(b.indexOf("-") + 1)] : [b];
	const numeric = (x, y) => BigInt(x) > BigInt(y) ? 1 : BigInt(x) < BigInt(y) ? -1 : 0;
	const av = ac.split("."), bv = bc.split(".");
	for (let i = 0; i < 3; i++) {
		const n = numeric(av[i], bv[i]);
		if (n) return n;
	}
	if (ap === bp) return 0;
	if (ap === void 0) return 1;
	if (bp === void 0) return -1;
	const aa = ap.split("."), bb = bp.split(".");
	for (let i = 0; i < Math.max(aa.length, bb.length); i++) {
		if (aa[i] === bb[i]) continue;
		if (aa[i] === void 0) return -1;
		if (bb[i] === void 0) return 1;
		const an = /^\d+$/u.test(aa[i]), bn = /^\d+$/u.test(bb[i]);
		if (an && bn) return numeric(aa[i], bb[i]);
		if (an !== bn) return an ? -1 : 1;
		return aa[i] > bb[i] ? 1 : -1;
	}
	return 0;
}
function catalog(value, source, now) {
	if (!only(value, [
		"schemaVersion",
		"sequence",
		"publishedAt",
		"expiresAt",
		"packages"
	]) || value.schemaVersion !== 1 || !Number.isSafeInteger(value.sequence) || value.sequence < 1 || !timestamp(value.publishedAt) || !timestamp(value.expiresAt) || Date.parse(value.publishedAt) > now + 3e5 || Date.parse(value.expiresAt) <= Date.parse(value.publishedAt) || !Array.isArray(value.packages) || value.packages.length > 5e3) throw Error("UPDATE_CATALOG_INVALID");
	const names = /* @__PURE__ */ new Set(), origin = new URL(source).origin;
	const packages = value.packages.map((row) => {
		if (!only(row, [
			"name",
			"version",
			"notes",
			"distribution",
			"artifact",
			"bridge",
			"dataSchemaVersion"
		]) || !/^@beellix-ai\/[a-z0-9][a-z0-9-]{0,80}$/u.test(row.name ?? "") || names.has(row.name) || !version(row.version) || typeof row.notes !== "string" || row.notes.length > 4e3 || !["public", "manual"].includes(row.distribution) || !only(row.bridge, ["min", "max"]) || !Number.isSafeInteger(row.bridge.min) || !Number.isSafeInteger(row.bridge.max) || row.bridge.min < 1 || row.bridge.max < row.bridge.min || !Number.isSafeInteger(row.dataSchemaVersion) || row.dataSchemaVersion < 1) throw Error("UPDATE_CATALOG_INVALID");
		names.add(row.name);
		if (row.distribution === "manual") {
			if (row.artifact !== void 0) throw Error("UPDATE_CATALOG_INVALID");
			return row;
		}
		if (!only(row.artifact, [
			"url",
			"sha256",
			"size"
		]) || typeof row.artifact.url !== "string" || !row.artifact.url.length || row.artifact.url.length > 2e3 || !digest(row.artifact.sha256) || !Number.isSafeInteger(row.artifact.size) || row.artifact.size < 1 || row.artifact.size > 64 * 1024 * 1024) throw Error("UPDATE_CATALOG_INVALID");
		let url;
		try {
			url = publicHttpsUrl(new URL(row.artifact.url, source).href);
		} catch {
			throw Error("UPDATE_CATALOG_INVALID");
		}
		if (url.origin !== origin || !url.pathname.endsWith(".tgz")) throw Error("UPDATE_CATALOG_INVALID");
		return {
			...row,
			artifact: {
				...row.artifact,
				url: url.href
			}
		};
	});
	return {
		...value,
		packages
	};
}
var PluginUpdates = class {
	constructor(root, { addons, request = publicHttpsBytes, now = Date.now, validateManifest, ready = () => true, distribution = {
		schemaVersion: 1,
		revision: 1,
		sourceUrl: null,
		automatic: true
	} } = {}) {
		this.root = resolve(root);
		this.addons = addons;
		this.request = request;
		this.now = now;
		this.validateManifest = validateManifest;
		this.ready = ready;
		this.source = releaseSource(distribution);
		this.busy = false;
		this.closed = false;
		this.abort = new AbortController();
	}
	async directories(create = false) {
		for (const relative of [
			"",
			"config",
			"data",
			"data/control-plane"
		]) {
			const target = join(this.root, relative);
			try {
				const info = await lstat(target);
				if (info.isSymbolicLink() || !info.isDirectory()) throw Error("UPDATE_STATE_INVALID");
			} catch (error) {
				if (error.code !== "ENOENT") throw error;
				if (create) await mkdir(target, { mode: 448 });
			}
		}
	}
	async read(relative, fallback, max = 2 * 1024 * 1024) {
		await this.directories();
		try {
			const path = join(this.root, relative), info = await lstat(path);
			if (info.isSymbolicLink() || !info.isFile() || info.size > max) throw Error("UPDATE_STATE_INVALID");
			return JSON.parse(await readFile(path, "utf8"));
		} catch (error) {
			if (error.code === "ENOENT") return fallback;
			throw Error("UPDATE_STATE_INVALID");
		}
	}
	async config() {
		return this.source;
	}
	async cache(config) {
		const value = await this.read("data/control-plane/plugin-updates.json", null);
		if (value === null || value.revision !== config.revision || value.sourceKey !== config.sourceKey) return null;
		if (!record(value) || !Number.isFinite(value.lastAttemptAt) || value.catalog && (!digest(value.digest) || !Number.isFinite(value.checkedAt))) throw Error("UPDATE_STATE_INVALID");
		if (value.catalog) catalog(value.catalog, config.sourceUrl, this.now());
		return value;
	}
	async save(relative, value) {
		await this.directories(true);
		await writeFileAtomic(join(this.root, relative), JSON.stringify(value, null, 2) + "\n", { mode: 384 });
	}
	async exclusive(task) {
		if (this.closed) throw Error("UPDATE_UNAVAILABLE");
		if (this.busy) throw Error("UPDATE_BUSY");
		this.busy = true;
		try {
			await this.directories(true);
			return await withFileLock(join(this.root, "data/control-plane/plugin-updates.json"), task);
		} finally {
			this.busy = false;
		}
	}
	async snapshot() {
		const config = await this.config(), cache = config.sourceUrl ? await this.cache(config) : null, expired = cache?.catalog && Date.parse(cache.catalog.expiresAt) <= this.now();
		const status = !config.sourceUrl ? "not-launched" : expired ? "stale" : cache?.error ? "failed" : cache?.catalog ? "checked" : "unchecked";
		const packages = (await this.addons.owned()).map((owned) => {
			const release = cache?.catalog?.packages.find((row) => row.name === owned.name), base = {
				name: owned.name,
				id: owned.id,
				state: status === "not-launched" ? "not-launched" : status !== "checked" ? "stale" : "not-published"
			};
			if (status !== "checked" || !release) return base;
			const change = compareVersions(release.version, owned.version), row = {
				...base,
				version: release.version,
				notes: release.notes
			};
			if (change <= 0) return {
				...row,
				state: change === 0 && release.artifact && owned.archiveSha256 !== release.artifact.sha256 ? "conflict" : "current"
			};
			if (release.bridge.min > 1 || release.bridge.max < 1) return {
				...row,
				state: "incompatible"
			};
			if (release.dataSchemaVersion !== (owned.contract?.data.schemaVersion ?? 1)) return {
				...row,
				state: "migration-required"
			};
			if (release.distribution === "manual") return {
				...row,
				state: "manual"
			};
			if (!digest(owned.archiveSha256)) return {
				...row,
				state: "unverified"
			};
			return {
				...row,
				state: "available",
				confirmation: {
					name: owned.name,
					version: release.version,
					digest: release.artifact.sha256,
					expectedVersion: owned.version,
					expectedArchiveSha256: owned.archiveSha256,
					revision: config.revision,
					sequence: cache.catalog.sequence
				}
			};
		});
		return {
			revision: config.revision,
			automatic: config.automatic,
			status,
			checkedAt: cache?.checkedAt ?? null,
			lastAttemptAt: cache?.lastAttemptAt ?? null,
			error: cache?.error ?? null,
			packages
		};
	}
	async check(input) {
		if (!only(input, []) || this.closed) throw Error("UPDATE_SOURCE_INVALID");
		await this.exclusive(async () => {
			const config = await this.config();
			if (!config.sourceUrl) throw Error("UPDATE_SERVICE_NOT_READY");
			const previous = await this.cache(config), lastAttemptAt = this.now();
			try {
				const bytes = await this.request(config.sourceUrl, {
					maxBytes: 2 * 1024 * 1024,
					signal: this.abort.signal
				});
				if (bytes.length > 2 * 1024 * 1024) throw Error("UPDATE_TOO_LARGE");
				if (this.closed) throw Error("UPDATE_UNAVAILABLE");
				let parsed;
				try {
					parsed = JSON.parse(bytes.toString("utf8"));
				} catch {
					throw Error("UPDATE_CATALOG_INVALID");
				}
				const value = catalog(parsed, config.sourceUrl, this.now()), digest = sha(bytes);
				if (Date.parse(value.expiresAt) <= this.now()) throw Error("UPDATE_CATALOG_EXPIRED");
				if (previous?.catalog && (value.sequence < previous.catalog.sequence || value.sequence === previous.catalog.sequence && digest !== previous.digest)) throw Error("UPDATE_CATALOG_CONFLICT");
				for (const row of value.packages) {
					const prior = previous?.catalog?.packages.find((r) => r.name === row.name && r.version === row.version);
					if (prior?.artifact && row.artifact && prior.artifact.sha256 !== row.artifact.sha256) throw Error("UPDATE_CATALOG_CONFLICT");
				}
				const next = {
					revision: config.revision,
					sourceKey: config.sourceKey,
					lastAttemptAt,
					checkedAt: this.now(),
					digest,
					catalog: value,
					error: null
				};
				if (Buffer.byteLength(JSON.stringify(next)) > 2 * 1024 * 1024) throw Error("UPDATE_TOO_LARGE");
				await this.save("data/control-plane/plugin-updates.json", next);
			} catch (error) {
				const reason = /^UPDATE_/u.test(error.message) ? error.message : "UPDATE_UNAVAILABLE";
				await this.save("data/control-plane/plugin-updates.json", {
					...previous,
					revision: config.revision,
					sourceKey: config.sourceKey,
					lastAttemptAt,
					error: reason
				});
				throw Error(reason);
			}
		});
		return this.snapshot();
	}
	async install(input) {
		if (!only(input, [
			"name",
			"version",
			"digest",
			"expectedVersion",
			"expectedArchiveSha256",
			"revision",
			"sequence"
		])) throw Error("UPDATE_CHANGED");
		return this.exclusive(async () => {
			const row = (await this.snapshot()).packages.find((row) => row.name === input.name), confirmation = row?.confirmation;
			if (!confirmation || Object.keys(confirmation).some((key) => confirmation[key] !== input[key])) throw Error("UPDATE_CHANGED");
			const config = await this.config(), release = (await this.cache(config)).catalog.packages.find((row) => row.name === input.name);
			const bytes = await this.request(release.artifact.url, {
				maxBytes: 64 * 1024 * 1024,
				signal: this.abort.signal,
				accept: "application/octet-stream"
			});
			if (bytes.length !== release.artifact.size || sha(bytes) !== input.digest) throw Error("UPDATE_INTEGRITY");
			const { manifest, id } = inspectAddonArchive(bytes), contract = packageContract(manifest);
			if (manifest.name !== input.name || manifest.version !== input.version || id !== row.id || contract.data.schemaVersion !== release.dataSchemaVersion) throw Error("UPDATE_INTEGRITY");
			await this.validateManifest?.(manifest);
			if (this.closed) throw Error("UPDATE_UNAVAILABLE");
			const current = (await this.snapshot()).packages.find((row) => row.name === input.name)?.confirmation;
			if (!current || Object.keys(confirmation).some((key) => current[key] !== confirmation[key])) throw Error("UPDATE_CHANGED");
			await this.addons.importArchive(bytes, { expectedName: input.name });
			if (this.closed) throw Error("UPDATE_UNAVAILABLE");
			return this.addons.install({
				id,
				digest: input.digest,
				expectedVersion: input.expectedVersion,
				expectedArchiveSha256: input.expectedArchiveSha256
			}, { allowNetwork: true });
		});
	}
	async checkDue() {
		if (this.closed || this.busy || !this.ready()) return;
		const config = await this.config();
		if (!config.sourceUrl || !config.automatic) return;
		const cache = await this.cache(config), interval = cache?.error ? 900 * 1e3 : 360 * 60 * 1e3;
		if (cache && this.now() - cache.lastAttemptAt < interval) return;
		await this.check({});
	}
	start() {
		if (this.timer || this.closed) return;
		const check = () => {
			this.checkDue().catch(() => {});
		};
		check();
		this.timer = setInterval(check, 900 * 1e3);
		this.timer.unref?.();
	}
	dispose() {
		this.closed = true;
		clearInterval(this.timer);
		this.abort.abort();
	}
};
//#endregion
export { PluginUpdates, compareVersions };
