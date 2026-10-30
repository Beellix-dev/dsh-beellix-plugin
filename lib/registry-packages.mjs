import { r as inspectAddonArchive } from "./native-companion-CLK1m8GH.mjs";
import { createHash, timingSafeEqual } from "node:crypto";
//#region dev/shared/runtime/registry-packages.mjs
/** npm / pnpm 共享 npm 制品；下载核验后仍交自有目录及 DSH 原生加载器。 */
const origin = "https://registry.npmjs.org";
const versionPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[a-zA-Z0-9.-]+)?$/u;
const namePattern = /^@beellix-ai\/[a-z0-9][a-z0-9-]{0,80}$/u;
const validVersion = (value) => typeof value === "string" && versionPattern.test(value);
const validName = (value) => typeof value === "string" && namePattern.test(value);
function sourceSpec(value) {
	if (typeof value !== "string" || value.length > 500) throw Error("ADDON_SOURCE_INVALID");
	let source = value.trim().replace(/^(?:npm (?:install|i)|pnpm (?:add|install))\s+/u, "").replace(/^npm:/u, "");
	if (source.startsWith("https://")) {
		let url;
		try {
			url = new URL(source);
		} catch {
			throw Error("ADDON_SOURCE_INVALID");
		}
		if (url.username || url.password || url.port || url.search || url.hash) throw Error("ADDON_SOURCE_INVALID");
		let path;
		try {
			path = decodeURIComponent(url.pathname).replace(/\/$/u, "");
		} catch {
			throw Error("ADDON_SOURCE_INVALID");
		}
		if (["https://www.npmjs.com", "https://npmjs.com"].includes(url.origin)) {
			const match = /^\/package\/(@beellix-ai\/[a-z0-9-]+)(?:\/v\/([^/]+))?$/u.exec(path);
			if (!match) throw Error("ADDON_SOURCE_INVALID");
			source = match[1] + (match[2] ? "@" + match[2] : "");
		} else if (url.origin === origin) {
			const match = /^\/@beellix-ai\/([a-z0-9-]+)\/-\/([^/]+)\.tgz$/u.exec(path);
			if (!match || !match[2].startsWith(match[1] + "-")) throw Error("ADDON_SOURCE_INVALID");
			source = "@beellix-ai/" + match[1] + "@" + match[2].slice(match[1].length + 1);
		} else throw Error("ADDON_SOURCE_INVALID");
	}
	const match = /^(@beellix-ai\/[a-z0-9][a-z0-9-]{0,80})(?:@([^\s]+))?$/u.exec(source);
	if (!match || match[2] && match[2] !== "latest" && !validVersion(match[2])) throw Error("ADDON_SOURCE_INVALID");
	return {
		name: match[1],
		version: match[2] ?? "latest"
	};
}
async function responseBytes(response, max) {
	if (Number(response.headers.get("content-length")) > max) {
		await response.body?.cancel();
		throw Error("REQUEST_TOO_LARGE");
	}
	const chunks = [];
	let size = 0;
	for await (const chunk of response.body ?? []) {
		size += chunk.length;
		if (size > max) throw Error("REQUEST_TOO_LARGE");
		chunks.push(chunk);
	}
	return Buffer.concat(chunks);
}
function verifyIntegrity(bytes, dist) {
	const tokens = typeof dist.integrity === "string" ? dist.integrity.split(/\s+/u) : [];
	const token = tokens.find((value) => value.startsWith("sha512-")) ?? tokens.find((value) => value.startsWith("sha256-")) ?? tokens.find((value) => value.startsWith("sha1-"));
	let algorithm, expected;
	if (token) {
		const match = /^(sha512|sha256|sha1)-([A-Za-z0-9+/]+={0,2})$/u.exec(token);
		if (!match) throw Error("ADDON_SOURCE_INTEGRITY");
		algorithm = match[1];
		expected = Buffer.from(match[2], "base64");
	} else if (/^[a-f0-9]{40}$/iu.test(dist.shasum ?? "")) {
		algorithm = "sha1";
		expected = Buffer.from(dist.shasum, "hex");
	} else throw Error("ADDON_SOURCE_INTEGRITY");
	const actual = createHash(algorithm).update(bytes).digest();
	if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw Error("ADDON_SOURCE_INTEGRITY");
}
var RegistryPackages = class {
	constructor(addons, { fetch: fetchImpl = globalThis.fetch } = {}) {
		this.addons = addons;
		this.fetch = fetchImpl;
		this.busy = false;
	}
	async exclusive(task) {
		if (this.busy) throw Error("ADDON_INSTALLING");
		this.busy = true;
		try {
			return await task();
		} catch (error) {
			if (/^(?:ADDON_|REQUEST_TOO_LARGE)/u.test(error.message)) throw error;
			throw Error("ADDON_SOURCE_UNAVAILABLE");
		} finally {
			this.busy = false;
		}
	}
	async download(source, expectedName) {
		const spec = sourceSpec(source);
		if (expectedName !== void 0 && (!validName(expectedName) || expectedName !== spec.name)) throw Error("ADDON_SOURCE_MISMATCH");
		const options = {
			redirect: "error",
			signal: AbortSignal.timeout(45e3),
			headers: { accept: "application/json" }
		};
		const response = await this.fetch("https://registry.npmjs.org/" + encodeURIComponent(spec.name) + "/" + encodeURIComponent(spec.version), options);
		if (response.status === 404) {
			await response.body?.cancel();
			throw Error("ADDON_SOURCE_NOT_FOUND");
		}
		if (!response.ok) {
			await response.body?.cancel();
			throw Error("ADDON_SOURCE_UNAVAILABLE");
		}
		let metadata;
		try {
			metadata = JSON.parse((await responseBytes(response, 1024 * 1024)).toString("utf8"));
		} catch (error) {
			if (error.message === "REQUEST_TOO_LARGE") throw error;
			throw Error("ADDON_SOURCE_INVALID");
		}
		if (metadata?.name !== spec.name || !validVersion(metadata.version) || spec.version !== "latest" && metadata.version !== spec.version || !metadata.dist) throw Error("ADDON_SOURCE_INVALID");
		let tarball;
		try {
			tarball = new URL(metadata.dist.tarball);
		} catch {
			throw Error("ADDON_SOURCE_INVALID");
		}
		const suffix = spec.name.slice(12), expectedPath = "/@beellix-ai/" + suffix + "/-/" + suffix + "-" + metadata.version + ".tgz";
		if (tarball.origin !== origin || tarball.username || tarball.password || tarball.search || tarball.hash || decodeURIComponent(tarball.pathname) !== expectedPath) throw Error("ADDON_SOURCE_INVALID");
		const archive = await this.fetch(tarball.href, {
			...options,
			headers: { accept: "application/octet-stream" }
		});
		if (!archive.ok) {
			await archive.body?.cancel();
			throw Error("ADDON_SOURCE_UNAVAILABLE");
		}
		const bytes = await responseBytes(archive, 64 * 1024 * 1024);
		verifyIntegrity(bytes, metadata.dist);
		const { manifest, id } = inspectAddonArchive(bytes);
		if (manifest.name !== spec.name || manifest.version !== metadata.version) throw Error("ADDON_SOURCE_MISMATCH");
		return {
			bytes,
			id,
			name: manifest.name,
			version: manifest.version,
			title: manifest.beellix?.displayName?.zh ?? manifest.name.slice(12),
			digest: createHash("sha256").update(bytes).digest("hex")
		};
	}
	async preview(input) {
		if (!input || Object.keys(input).some((key) => !["source", "expectedName"].includes(key))) throw Error("ADDON_SOURCE_INVALID");
		return this.exclusive(async () => {
			const { bytes, ...preview } = await this.download(input.source, input.expectedName), owned = (await this.addons.owned()).find((row) => row.name === preview.name);
			return {
				...preview,
				...owned ? { expectedVersion: owned.version } : {}
			};
		});
	}
	async install(input) {
		if (!input || Object.keys(input).some((key) => ![
			"name",
			"version",
			"digest",
			"expectedVersion"
		].includes(key)) || !validName(input.name) || !validVersion(input.version) || !/^[a-f0-9]{64}$/u.test(input.digest ?? "") || input.expectedVersion !== void 0 && !validVersion(input.expectedVersion)) throw Error("ADDON_SOURCE_INVALID");
		return this.exclusive(async () => {
			if ((await this.addons.owned()).find((row) => row.name === input.name)?.version !== input.expectedVersion) throw Error("ADDON_PACKAGE_CHANGED");
			const value = await this.download(input.name + "@" + input.version);
			if (value.digest !== input.digest) throw Error("ADDON_PACKAGE_CHANGED");
			await this.addons.importArchive(value.bytes);
			return this.addons.install({
				id: value.id,
				digest: value.digest,
				...input.expectedVersion ? { expectedVersion: input.expectedVersion } : {}
			}, { allowNetwork: true });
		});
	}
};
//#endregion
export { RegistryPackages };
