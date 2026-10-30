import { n as writeFileAtomic, t as withFileLock } from "./lib-Dl5J5M7o.mjs";
import { lstat, mkdir, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
//#region dev/shared/runtime/native-scenes.mjs
/** DSH 原生场景绑定：保存业务归属，在原生 Agent 作用域贡献资源，不驱动执行循环。 */
const SCENE_PRESET = "beellix-scene";
const identity = /^[A-Za-z0-9][A-Za-z0-9_-]{0,199}$/u;
const sceneIdentity = /^[a-z][a-z0-9-]{0,79}$/u;
const own = (object, key) => Object.hasOwn(object, key) ? object[key] : void 0;
function recordedPreset(snapshot) {
	let preset = snapshot?.meta?.agentPreset;
	for (const event of snapshot?.events ?? []) if (event.type === "agent-preset/selected") preset = event.data?.agentPreset;
	return preset;
}
function expectedPreset(binding) {
	return binding.legacy ? binding.legacyPreset ?? "standard" : binding.executionPreset ?? "beellix-scene";
}
function matchesPreset(binding, preset) {
	return !binding.legacy && (binding.executionPreset === void 0 || binding.executionPreset === "standard") ? [SCENE_PRESET, "standard"].includes(preset) : preset === expectedPreset(binding);
}
async function readJson(path) {
	try {
		const stat = await lstat(path);
		if (stat.isSymbolicLink() || !stat.isFile() || stat.size > 16 * 1024 * 1024) throw Error("SCENE_BINDING_FILE_UNSAFE");
		return JSON.parse(await readFile(path, "utf8"));
	} catch (error) {
		if (error.code === "ENOENT") return void 0;
		throw error;
	}
}
async function directory(path) {
	const parent = dirname(path);
	if (parent !== path) await directory(parent);
	try {
		const stat = await lstat(path);
		if (stat.isSymbolicLink() || !stat.isDirectory()) throw Error("SCENE_DIRECTORY_UNSAFE");
	} catch (error) {
		if (error.code !== "ENOENT") throw error;
		try {
			await mkdir(path);
		} catch (created) {
			if (created.code !== "EEXIST") throw created;
			const stat = await lstat(path);
			if (stat.isSymbolicLink() || !stat.isDirectory()) throw Error("SCENE_DIRECTORY_UNSAFE");
		}
	}
}
/** 从宿主当前标准模式声明继承原版工具、子代理与压缩配置，保留 !!js 原生表达式。 */
async function registerScenePreset(ctx) {
	const [{ content }, yamlModule, include] = await Promise.all([
		ctx.agentPresets.readDocument("standard"),
		ctx.loader.import("js-yaml"),
		ctx.loader.import("@deepseek-ai/cordis-plugin-include")
	]);
	const plugins = (yamlModule.load ? yamlModule : yamlModule.default).load(content, { schema: include.entryListSchema });
	if (!Array.isArray(plugins)) throw Error("SCENE_STANDARD_COMPOSITION_INVALID");
	const persona = plugins.find((row) => row.name === "@deepseek-ai/dsh-persona");
	if (!persona) throw Error("SCENE_STANDARD_PERSONA_MISSING");
	persona.config = {
		...persona.config,
		prefix: "你是 Beelli X 场景智能助手，使用 {{model}} 模型。按照当前绑定场景的技能、业务规则和真实资料完成任务；使用 DSH 原生工具、规划、子代理与恢复机制。场景上下文给出当前业务范围；先加载匹配的场景技能，不编造业务数据。"
	};
	return ctx.agentPresets.register({
		id: SCENE_PRESET,
		name: "场景模式",
		description: "使用已安装场景的专业技能、工具和工作台",
		order: 3,
		plugins
	});
}
var SceneRuntime = class {
	constructor(root, { getAgent = () => void 0, inspectSession } = {}) {
		this.root = resolve(root);
		this.path = join(this.root, "data/control-plane/scene-bindings.json");
		this.providers = /* @__PURE__ */ new Map();
		this.agents = /* @__PURE__ */ new Map();
		this.pending = /* @__PURE__ */ new Map();
		this.getAgent = getAgent;
		this.inspectSession = inspectSession;
		this.closed = false;
		this.contractVersion = 1;
		this.fileSnapshots = /* @__PURE__ */ new Map();
	}
	async readState(path) {
		const fingerprint = (stat) => [
			stat.dev,
			stat.ino,
			stat.size,
			stat.mtimeNs,
			stat.ctimeNs,
			stat.mode
		].join(":");
		let stat;
		try {
			stat = await lstat(path, { bigint: true });
		} catch (error) {
			if (error.code === "ENOENT") {
				this.fileSnapshots.delete(path);
				return;
			}
			throw error;
		}
		if (stat.isSymbolicLink() || !stat.isFile() || stat.size > 16n * 1024n * 1024n) throw Error("SCENE_BINDING_FILE_UNSAFE");
		const key = fingerprint(stat), cached = this.fileSnapshots.get(path);
		if (cached?.key === key) return cached.value;
		const value = await readJson(path);
		if (fingerprint(await lstat(path, { bigint: true })) !== key) throw Error("SCENE_BINDING_FILE_CHANGED");
		this.fileSnapshots.set(path, {
			key,
			value
		});
		return value;
	}
	async bindingState() {
		const state = await this.readState(this.path);
		if (!state) return {
			schemaVersion: 1,
			revision: 0,
			bindings: {}
		};
		if (state.schemaVersion !== 1 || !Number.isSafeInteger(state.revision) || !state.bindings || Array.isArray(state.bindings) || typeof state.bindings !== "object") throw Error("SCENE_BINDINGS_INVALID");
		return state;
	}
	async load() {
		return structuredClone(await this.bindingState());
	}
	async bind(value) {
		if (!identity.test(value.sessionId ?? "") || !sceneIdentity.test(value.sceneId ?? "") || typeof value.packageName !== "string" || typeof value.packageVersion !== "string") throw Error("SCENE_BINDING_INVALID");
		if (value.executionPreset !== void 0 && !["standard", "beellix-scene"].includes(value.executionPreset)) throw Error("SCENE_BINDING_INVALID");
		const binding = {
			...value,
			businessSessionId: value.businessSessionId ?? value.sessionId,
			attachmentSessionId: value.attachmentSessionId ?? value.sessionId,
			readOnly: value.readOnly === true,
			legacy: value.legacy === true
		};
		if (!identity.test(binding.businessSessionId) || !identity.test(binding.attachmentSessionId)) throw Error("SCENE_BINDING_INVALID");
		await directory(dirname(this.path));
		return withFileLock(this.path, async () => {
			const state = await this.load(), existing = own(state.bindings, value.sessionId);
			if (existing) {
				if (existing.sceneId !== binding.sceneId || existing.packageName !== binding.packageName || existing.businessSessionId !== binding.businessSessionId || existing.attachmentSessionId !== binding.attachmentSessionId || existing.readOnly !== binding.readOnly || existing.executionPreset !== void 0 && binding.executionPreset !== void 0 && existing.executionPreset !== binding.executionPreset) throw Error("SCENE_BINDING_CONFLICT");
				return existing;
			}
			state.bindings = {
				...state.bindings,
				[value.sessionId]: binding
			};
			state.revision++;
			await writeFileAtomic(this.path, JSON.stringify(state, null, 2) + "\n", { mode: 384 });
			return binding;
		});
	}
	async legacyBinding(sessionId, legacyPreset = "standard") {
		const navigation = await this.readState(join(this.root, "config/scene-navigation.json"));
		if (!navigation || navigation.schemaVersion !== 1) return void 0;
		const id = navigation.links && own(navigation.links, sessionId), provider = this.providers.get(id)?.provider;
		if (!provider) return void 0;
		return this.bind({
			sessionId,
			sceneId: id,
			packageName: provider.packageName,
			packageVersion: provider.version,
			legacy: true,
			legacyPreset
		});
	}
	async bindingFor(agent) {
		if (this.closed || !agent || !identity.test(agent.id ?? "")) return void 0;
		const preset = agent.ctx.get?.("agentPresets")?.composedPreset(agent.ctx) ?? agent.session.header.agentPreset;
		let binding = own((await this.bindingState()).bindings, agent.id);
		if (!binding && !agent.session.header.parentSession) binding = await this.legacyBinding(agent.id, preset);
		if (!binding && agent.session.header.origin === "subagent") {
			const parentId = agent.session.header.parentSession;
			if (!identity.test(parentId ?? "")) return void 0;
			const state = await this.bindingState(), parent = own(state.bindings, parentId) ?? await this.legacyBinding(parentId);
			const parentAgent = this.getAgent(parentId) ?? this.agents.get(parentId), parentPreset = parentAgent ? parentAgent.ctx.get?.("agentPresets")?.composedPreset(parentAgent.ctx) ?? parentAgent.session.header.agentPreset : parent && expectedPreset(parent);
			if (parent && preset === parentPreset && matchesPreset(parent, preset)) binding = await this.bind({
				...parent,
				sessionId: agent.id,
				parentSessionId: parentId,
				readOnly: true
			});
		}
		if (!binding || !matchesPreset(binding, preset)) return void 0;
		const provider = this.providers.get(binding.sceneId)?.provider;
		if (!provider || provider.packageName !== binding.packageName) return void 0;
		return {
			...binding,
			activePackageVersion: provider.version
		};
	}
	async requireBinding(agentOrId, sceneId) {
		const agent = typeof agentOrId === "string" ? this.getAgent(agentOrId) ?? this.agents.get(agentOrId) : agentOrId;
		let binding = await this.bindingFor(agent);
		let inspectedPreset;
		if (!agent && !this.closed && typeof agentOrId === "string" && identity.test(agentOrId) && this.inspectSession) {
			const saved = own((await this.bindingState()).bindings, agentOrId);
			if (saved?.sceneId === sceneId) {
				const snapshot = await this.inspectSession(agentOrId);
				const preset = recordedPreset(snapshot);
				inspectedPreset = preset;
				const provider = this.providers.get(saved.sceneId)?.provider;
				if (!this.closed && snapshot?.meta?.id === agentOrId && provider?.packageName === saved.packageName && matchesPreset(saved, preset)) binding = {
					...saved,
					activePackageVersion: provider.version
				};
			}
		}
		if (!binding || binding.sceneId !== sceneId) {
			const id = typeof agentOrId === "string" ? agentOrId : agent?.id, saved = id && own((await this.bindingState()).bindings, id), provider = this.providers.get(sceneId)?.provider;
			const preset = agent ? agent.ctx.get?.("agentPresets")?.composedPreset(agent.ctx) ?? agent.session.header.agentPreset : inspectedPreset;
			const reason = !identity.test(id ?? "") ? "SESSION_ID_MISSING" : this.closed ? "RUNTIME_CLOSED" : !saved || saved.sceneId !== sceneId ? "BINDING_MISSING" : !provider ? "PROVIDER_NOT_READY" : provider.packageName !== saved.packageName ? "PROVIDER_MISMATCH" : !matchesPreset(saved, preset) ? "PRESET_MISMATCH" : "SESSION_NOT_VERIFIED";
			const error = Error("SCENE_SESSION_REQUIRED: 请从当前场景入口打开会话（" + reason + "）");
			error.reason = reason;
			throw error;
		}
		return binding;
	}
	mountAgent(agent) {
		const task = (this.pending.get(agent) ?? Promise.resolve()).catch(() => {}).then(() => this.mountFreshAgent(agent));
		this.pending.set(agent, task);
		const finish = () => {
			if (this.pending.get(agent) === task) this.pending.delete(agent);
		};
		task.then(finish, finish);
		return task;
	}
	async mountFreshAgent(agent) {
		if (this.closed) return void 0;
		this.agents.set(agent.id, agent);
		const binding = await this.bindingFor(agent);
		if (!binding) {
			await this.unmountAgent(agent);
			return;
		}
		const entry = this.providers.get(binding.sceneId);
		if (!entry) return void 0;
		if (entry.mounts.has(agent)) return binding;
		const disposers = [];
		try {
			const provider = entry.provider;
			if (agent.ctx.systemPrompt) disposers.push(agent.ctx.systemPrompt.context({
				name: "beellix:scene",
				order: 250,
				interpolate: false,
				text: JSON.stringify({
					scene: binding.sceneId,
					package: binding.packageName,
					createdWithVersion: binding.legacy ? null : binding.packageVersion,
					versionProvenance: binding.legacy ? "legacy-adoption" : "native-session-creation",
					activeVersion: provider.version,
					skill: provider.skill,
					delegatedReadOnly: binding.readOnly,
					instructions: binding.readOnly ? "只读取和分析主会话授权的业务资料，返回结果交主会话提交；不能修改业务记录。" : "先加载场景技能，按需查询详细工具契约；只使用本场景资料。"
				})
			}));
			disposers.push(await provider.mount(agent, binding));
			entry.mounts.set(agent, async () => {
				for (const dispose of disposers.reverse()) if (typeof dispose === "function") await dispose();
			});
			return binding;
		} catch (error) {
			for (const dispose of disposers.reverse()) if (typeof dispose === "function") await dispose();
			throw error;
		}
	}
	async unmountAgent(agent) {
		for (const entry of this.providers.values()) {
			const dispose = entry.mounts.get(agent);
			entry.mounts.delete(agent);
			await dispose?.();
		}
	}
	async removeAgent(agent) {
		await this.pending.get(agent)?.catch(() => {});
		for (const entry of this.providers.values()) entry.mounts.delete(agent);
		this.agents.delete(agent.id);
	}
	async registerProvider(provider) {
		if (this.closed || !sceneIdentity.test(provider.id ?? "") || typeof provider.mount !== "function") throw Error("SCENE_PROVIDER_INVALID");
		if (this.providers.has(provider.id)) throw Error("SCENE_PROVIDER_DUPLICATE");
		const entry = {
			provider,
			mounts: /* @__PURE__ */ new Map()
		};
		this.providers.set(provider.id, entry);
		const dispose = async () => {
			if (this.providers.get(provider.id) !== entry) return;
			this.providers.delete(provider.id);
			for (const cleanup of entry.mounts.values()) await cleanup();
			entry.mounts.clear();
		};
		try {
			for (const agent of this.agents.values()) await this.mountAgent(agent);
			return dispose;
		} catch (error) {
			await dispose();
			throw error;
		}
	}
	async dispose() {
		this.closed = true;
		await Promise.allSettled([...this.pending.values()]);
		for (const entry of this.providers.values()) for (const cleanup of entry.mounts.values()) await cleanup();
		this.providers.clear();
		this.agents.clear();
		this.fileSnapshots.clear();
	}
};
//#endregion
export { SCENE_PRESET, SceneRuntime, registerScenePreset };
