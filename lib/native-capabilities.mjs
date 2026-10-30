import { lstat, mkdir, realpath } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
//#region dev/shared/runtime/native-capabilities.mjs
/** 自有能力接入点，不装配插件或接管 DSH 执行。 */
async function directory(path) {
	const parent = dirname(path);
	if (parent !== path) await directory(parent);
	try {
		const stat = await lstat(path);
		if (stat.isSymbolicLink() || !stat.isDirectory()) throw Error("CAPABILITY_DIRECTORY_UNSAFE");
	} catch (error) {
		if (error.code !== "ENOENT") throw error;
		try {
			await mkdir(path, { mode: 448 });
		} catch (created) {
			if (created.code !== "EEXIST") throw created;
		}
		const stat = await lstat(path);
		if (stat.isSymbolicLink() || !stat.isDirectory()) throw Error("CAPABILITY_DIRECTORY_UNSAFE");
	}
}
var NativeCapabilities = class {
	constructor(root, { owned, ready = () => true }) {
		this.root = resolve(root);
		this.owned = owned;
		this.ready = ready;
		this.contractVersion = 1;
		this.connections = /* @__PURE__ */ new Map();
		this.pending = /* @__PURE__ */ new Set();
		this.closed = false;
	}
	async register(input) {
		if (this.closed || !this.ready()) throw Error("CAPABILITY_PLATFORM_NOT_READY");
		if (!input || Object.keys(input).some((key) => ![
			"packageName",
			"packageDirectory",
			"modelConfiguration"
		].includes(key)) || typeof input.packageName !== "string" || typeof input.packageDirectory !== "string" || input.modelConfiguration !== void 0 && (typeof input.modelConfiguration?.read !== "function" || typeof input.modelConfiguration?.write !== "function")) throw Error("CAPABILITY_INPUT_INVALID");
		if (this.pending.has(input.packageName)) throw Error("CAPABILITY_ALREADY_CONNECTED");
		this.pending.add(input.packageName);
		try {
			const owned = (await this.owned()).find((row) => row.name === input.packageName && [
				"resources",
				"tools",
				"skills",
				"models",
				"mcp"
			].includes(row.category));
			if (!owned || !/^[a-z][a-z0-9-]{0,79}$/u.test(owned.id)) throw Error("CAPABILITY_NOT_OWNED");
			if (relative(await realpath(owned.directory), await realpath(resolve(input.packageDirectory))) !== "") throw Error("CAPABILITY_SOURCE_MISMATCH");
			if (this.connections.has(owned.id)) throw Error("CAPABILITY_ALREADY_CONNECTED");
			const paths = Object.freeze(Object.fromEntries([
				"config",
				"data",
				"files",
				"cache"
			].map((kind) => [kind, join(this.root, kind, "capabilities", owned.id)]).concat([["knowledge", join(this.root, "knowledge", owned.id)]])));
			for (const path of Object.values(paths)) await directory(path);
			if (this.closed || !this.ready()) throw Error("CAPABILITY_PLATFORM_NOT_READY");
			if (!(await this.owned()).find((row) => row.name === owned.name && row.version === owned.version && row.id === owned.id)) throw Error("CAPABILITY_SOURCE_MISMATCH");
			if (this.connections.has(owned.id)) throw Error("CAPABILITY_ALREADY_CONNECTED");
			const connection = {
				name: owned.name,
				version: owned.version,
				paths,
				...input.modelConfiguration ? { modelConfiguration: input.modelConfiguration } : {}
			};
			this.connections.set(owned.id, connection);
			return Object.freeze({
				id: owned.id,
				contractVersion: this.contractVersion,
				paths,
				dispose: () => {
					if (this.connections.get(owned.id) === connection) this.connections.delete(owned.id);
				}
			});
		} finally {
			this.pending.delete(input.packageName);
		}
	}
	snapshot(rows) {
		return rows.map((row) => {
			if (row.category !== "resources") return row;
			const connection = this.connections.get(row.id), connected = connection?.name === row.name && connection.version === row.version;
			return {
				...row,
				connection: connected ? "ready" : "waiting",
				...connected ? { paths: connection.paths } : {}
			};
		});
	}
	async dispose() {
		this.closed = true;
		this.connections.clear();
	}
};
//#endregion
export { NativeCapabilities };
