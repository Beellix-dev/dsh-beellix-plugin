import { i as validateProject, n as SUPPORTED_STANDARD_VERSIONS, t as STANDARD_VERSION } from "./validate-D-PAWpJS.mjs";
import { lstat, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { createHash, randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
String.raw`
$ErrorActionPreference='Stop'
$root=$env:BEELLIX_PRIVATE_DATA_DIR
$sid=[System.Security.Principal.WindowsIdentity]::GetCurrent().User
$allowed=@($sid.Value,'S-1-5-18','S-1-5-32-544')|Select-Object -Unique
function Canonical($path,$directory) {
  $acl=Get-Acl -LiteralPath $path
  if(-not $acl.AreAccessRulesProtected){return $false}
  if($acl.GetOwner([System.Security.Principal.SecurityIdentifier]).Value -notin $allowed){return $false}
  $rules=@($acl.GetAccessRules($true,$true,[System.Security.Principal.SecurityIdentifier]))
  if($rules.Count -ne $allowed.Count){return $false}
  foreach($identity in $allowed){
    $matches=@($rules|Where-Object {$_.IdentityReference.Value -eq $identity})
    if($matches.Count -ne 1){return $false}
    $rule=$matches[0]
    if($rule.AccessControlType -ne 'Allow' -or $rule.FileSystemRights -ne 'FullControl' -or $rule.IsInherited){return $false}
    if($directory -and $rule.InheritanceFlags -ne 'ContainerInherit,ObjectInherit'){return $false}
    if(-not $directory -and $rule.InheritanceFlags -ne 'None'){return $false}
  }
  return $true
}
function Protect($path,$directory) {
  $current=Get-Acl -LiteralPath $path
  if($current.GetOwner([System.Security.Principal.SecurityIdentifier]).Value -notin $allowed){throw 'PRIVATE_DATA_OWNER'}
  $acl=if($directory){[System.Security.AccessControl.DirectorySecurity]::new()}else{[System.Security.AccessControl.FileSecurity]::new()}
  $acl.SetAccessRuleProtection($true,$false)
  $inherit=if($directory){[System.Security.AccessControl.InheritanceFlags]::ContainerInherit -bor [System.Security.AccessControl.InheritanceFlags]::ObjectInherit}else{[System.Security.AccessControl.InheritanceFlags]::None}
  foreach($identity in $allowed){
    $identifier=[System.Security.Principal.SecurityIdentifier]::new($identity)
    $rule=[System.Security.AccessControl.FileSystemAccessRule]::new($identifier,'FullControl',$inherit,'None','Allow')
    [void]$acl.AddAccessRule($rule)
  }
  $item=if($directory){[System.IO.DirectoryInfo]::new($path)}else{[System.IO.FileInfo]::new($path)}
  if($PSVersionTable.PSVersion.Major -ge 7){[System.IO.FileSystemAclExtensions]::SetAccessControl($item,$acl)}else{$item.SetAccessControl($acl)}
  if(-not (Canonical $path $directory)){throw 'PRIVATE_DATA_VERIFY'}
}
if(([System.IO.File]::GetAttributes($root) -band [System.IO.FileAttributes]::ReparsePoint) -ne 0){throw 'PRIVATE_DATA_LINK'}
if(Canonical $root $true){ConvertTo-Json -Compress -InputObject @{protected=$true;changed=$false;entries=0;powerShellVersion=$PSVersionTable.PSVersion.ToString()};exit 0}
$entries=0
function Walk($directory){
  foreach($child in [System.IO.Directory]::EnumerateFileSystemEntries($directory)){
    $attributes=[System.IO.File]::GetAttributes($child)
    if(($attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0){continue}
    if(($attributes -band [System.IO.FileAttributes]::Directory) -ne 0){
      if(Canonical $child $true){continue}
      Walk $child;Protect $child $true
    }else{Protect $child $false}
    $script:entries++
  }
}
# 根最后提交；中断时根仍待整改，下次启动重新核验全部既有原件。
Walk $root
Protect $root $true
ConvertTo-Json -Compress -InputObject @{protected=$true;changed=$true;entries=$entries+1;powerShellVersion=$PSVersionTable.PSVersion.ToString()}
`;
/**
* Zero-dependency atomic file replacement and writer coordination.
* `writeFileAtomic` writes a random-suffix sibling with exclusive create and
* the caller's permission bits, then renames it over the target, so readers
* observe either the old or the new complete content and a replaced file ends
* up with exactly the stated mode. `withFileLock` serializes cross-process
* writers of one file through a `wx`-created `<file>.lock` sibling, so a
* read-modify-write cycle can never resurrect a state another writer just
* replaced; readers stay lock-free because the rename commit is atomic. A lock
* whose recorded holder process no longer exists is taken over.
* @module @beellix-ai/atomic-write
*/
const WINDOWS_TRANSIENT_RENAME_ERRORS = /* @__PURE__ */ new Set([
	"EACCES",
	"EBUSY",
	"EPERM"
]);
const WINDOWS_RENAME_RETRY_INITIAL_MS = 20;
const WINDOWS_RENAME_RETRY_MAX_MS = 200;
const WINDOWS_RENAME_RETRY_LIMIT = 8;
/** Whether Windows reported temporary interference with an atomic replacement. */
function isTransientWindowsRenameError(error) {
	if (process.platform !== "win32") return false;
	return WINDOWS_TRANSIENT_RENAME_ERRORS.has(error?.code ?? "");
}
/** Replace the target after bounded retries for transient Windows interference. */
async function renameAtomicTemp(temp, filename) {
	let delay = WINDOWS_RENAME_RETRY_INITIAL_MS;
	for (let retries = 0;; retries += 1) {
		try {
			await rename(temp, filename);
			return;
		} catch (error) {
			if (!isTransientWindowsRenameError(error)) throw error;
			if (retries >= WINDOWS_RENAME_RETRY_LIMIT) throw error;
		}
		await new Promise((resolve) => setTimeout(resolve, delay));
		delay = Math.min(delay * 2, WINDOWS_RENAME_RETRY_MAX_MS);
	}
}
/**
* Replace `filename` with `content` in one atomic step, creating parent
* directories. The content is first written to a random-suffix sibling opened
* with exclusive create (`wx`): the open refuses to follow a symlink planted
* at the temp path, and the fresh inode carries `options.mode` through the
* rename, so replacing a wider-permission file narrows it without a chmod
* race. The rename also replaces a symlinked target itself instead of writing
* through to its referent, and the same-directory sibling keeps the rename on
* one filesystem. Windows replacement retries transient `EACCES`, `EBUSY`,
* and `EPERM` failures for a bounded interval while the complete temp file
* remains the rename source. On any remaining failure the temp file is
* removed and the failure rethrown. Crash durability (fsync) is out of scope.
* @param filename - final path receiving the content.
* @param content - complete next file content.
* @param options - permission bits for the replacement inode.
*/
async function writeFileAtomic(filename, content, options) {
	await mkdir(dirname(filename), {
		recursive: true,
		...options.dirMode === void 0 ? {} : { mode: options.dirMode }
	});
	const temp = `${filename}.${randomBytes(6).toString("hex")}.tmp`;
	try {
		if (options.createTemp) await options.createTemp(temp, content);
		else await writeFile(temp, content, {
			mode: options.mode,
			flag: "wx"
		});
		await renameAtomicTemp(temp, filename);
	} catch (error) {
		await rm(temp, { force: true });
		throw error;
	}
}
/** Whether an exclusive create found an existing lock. */
async function isLockContention(error, lockPath) {
	const code = error?.code;
	if (code === "EEXIST") return true;
	if (code !== "EPERM") return false;
	try {
		await lstat(lockPath);
		return true;
	} catch {
		return false;
	}
}
/** 仅当信号探测确认 `<pid>\n` 记录中的进程不存在时，认定所有者已经退出。 */
function holderExited(record) {
	if (!/^\d+\n$/.test(record)) return false;
	const pid = Number(record.trim());
	if (pid === 0 || pid > 2147483647) return false;
	if (pid === process.pid) return false;
	try {
		process.kill(pid, 0);
		return false;
	} catch (error) {
		return error.code === "ESRCH";
	}
}
/** 读取锁记录；不可读时返回 undefined，不推定锁已失效。 */
async function readLockRecord(lockPath) {
	try {
		return await readFile(lockPath, "utf8");
	} catch (error) {
		return;
	}
}
/**
* 竞争者通过记录摘要命名的接管声明文件串行化恢复。取得声明后重新读取
* 锁记录并探测进程，只有记录未变且所有者仍不存在时才移除锁，避免删除
* 后继竞争者已经持有的锁，包括进程号被重新使用的情况。
* @returns 本次是否移除了已退出所有者的锁。
*/
async function takeOverExitedLock(lockPath) {
	const record = await readLockRecord(lockPath);
	if (record === void 0 || !holderExited(record)) return false;
	const claim = `${lockPath}.takeover-${createHash("sha256").update(record).digest("hex").slice(0, 16)}`;
	try {
		await writeFile(claim, `${process.pid}\n`, {
			mode: 384,
			flag: "wx"
		});
	} catch (error) {
		const code = error.code;
		if (code === "EEXIST" || code === "EPERM") return false;
		throw error;
	}
	try {
		if (await readLockRecord(lockPath) !== record || !holderExited(record)) return false;
		try {
			await rm(lockPath, { force: true });
		} catch (error) {
			return false;
		}
		return true;
	} finally {
		await rm(claim, { force: true }).catch((error) => {});
	}
}
/**
* Retry cadence for a contended lock. These stay robustness invariants of the
* cross-process write protocol rather than deployment tunables: they govern how
* often a contender asks, which no caller has a reason to vary.
*/
const LOCK_RETRY_INITIAL_MS = 20;
const LOCK_RETRY_MAX_MS = 200;
/**
* How long a contender waits when the caller states no limit — sized for the
* render-and-rename cycle every call site had when this package was written.
* Expiry fails the contender rather than guessing whether the existing lock
* still has an owner. How long is *worth* waiting is a property of the
* operation the lock holder runs, which is why {@link FileLockOptions.waitMs}
* exists; the value here is the floor for an operation that does file work
* alone.
*/
const DEFAULT_LOCK_WAIT_MS = 2e3;
/**
* 以 wx 创建同级写锁，串行化文件的读、修改和提交；读取方不加锁。
* EEXIST 表示竞争；EPERM 需要 lstat 确认，Windows 允许一次未确认的重试。
* 只有 ESRCH 证明记录中的进程已退出时才接管，存活、权限不足或记录不完整
* 均继续等待并受超时限制。PID 被存活进程复用时仍须人工恢复。
* 本协议只适用于同一主机、同一 PID 命名空间，不能用于跨容器共享写入。
* 操作派生的其他写入进程必须一同停止或支持恢复对账；父目录必须存在。
* @param filename - 需要串行化写入的文件。
* @param operation - 持锁期间执行的读、修改和提交。
* @param options - 取得锁的选项，默认等待 DEFAULT_LOCK_WAIT_MS。
* @returns 操作结果；成功或失败均释放锁。
*/
async function withFileLock(filename, operation, options) {
	const lockPath = `${filename}.lock`;
	const deadline = Date.now() + (options?.waitMs ?? DEFAULT_LOCK_WAIT_MS);
	let delay = LOCK_RETRY_INITIAL_MS;
	let retriedUnconfirmedPermissionError = false;
	for (;;) {
		try {
			await writeFile(lockPath, `${process.pid}\n`, {
				mode: 384,
				flag: "wx"
			});
			break;
		} catch (error) {
			if (!await isLockContention(error, lockPath)) {
				if (process.platform !== "win32" || error?.code !== "EPERM" || retriedUnconfirmedPermissionError) throw error;
				retriedUnconfirmedPermissionError = true;
			} else if (await takeOverExitedLock(lockPath)) continue;
		}
		if (Date.now() >= deadline) throw new Error(`atomic-write: timed out waiting for the writer lock at ${lockPath}`);
		await new Promise((resolve) => setTimeout(resolve, delay));
		delay = Math.min(delay * 2, LOCK_RETRY_MAX_MS);
	}
	try {
		return await operation();
	} finally {
		await rm(lockPath, { force: true });
	}
}
//#endregion
//#region packages/platform/community/src/creation-runtime.mjs
/** Beelli X guidance in the native cordis scope; no preset or execution-loop replacement. */
const idPattern = /^[A-Za-z0-9][A-Za-z0-9_-]{0,199}$/;
const skill = "beellix-plugin-development";
async function safeDirectory(path) {
	const parent = dirname(path);
	if (parent !== path) await safeDirectory(parent);
	try {
		const s = await lstat(path);
		if (s.isSymbolicLink() || !s.isDirectory()) throw Error("CREATION_DIRECTORY_UNSAFE");
	} catch (error) {
		if (error.code !== "ENOENT") throw error;
		await mkdir(path, { mode: 448 }).catch((e) => {
			if (e.code !== "EEXIST") throw e;
		});
		const s = await lstat(path);
		if (s.isSymbolicLink() || !s.isDirectory()) throw Error("CREATION_DIRECTORY_UNSAFE");
	}
}
const mode = (agent) => agent.ctx.get("agentPresets").composedPreset(agent.ctx);
var CreationRuntime = class {
	constructor(root, { sceneBinding = async () => void 0, library, capabilities = async () => [] } = {}) {
		this.root = resolve(root);
		this.sceneBinding = sceneBinding;
		this.library = library;
		this.capabilities = capabilities;
		this.active = /* @__PURE__ */ new Map();
		this.pending = /* @__PURE__ */ new Map();
		this.closed = false;
	}
	async standard() {
		if (!this.library) {
			const data = JSON.parse(await readFile(new URL("./development/standard.json", import.meta.url), "utf8"));
			for (const item of Object.values(data.references)) if (createHash("sha256").update(item.text).digest("hex") !== item.sha256) throw Error("CREATION_STANDARD_HASH_MISMATCH");
			this.library = data;
		}
		if (this.library.version !== "1.1.0") throw Error("CREATION_STANDARD_UNSUPPORTED");
		return this.library;
	}
	async activation() {
		if (this.activationPromise) return this.activationPromise;
		this.activationPromise = (async () => {
			const path = join(this.root, "data/control-plane/creation/activation.json");
			await safeDirectory(dirname(path));
			return withFileLock(path, async () => {
				try {
					const stat = await lstat(path);
					if (stat.isSymbolicLink() || !stat.isFile() || stat.size > 2048) throw Error("CREATION_ACTIVATION_UNSAFE");
					const value = JSON.parse(await readFile(path, "utf8"));
					if (value.schemaVersion !== 1 || !SUPPORTED_STANDARD_VERSIONS.includes(value.standardVersion) || !Number.isSafeInteger(value.enabledAt)) throw Error("CREATION_ACTIVATION_INVALID");
					return value;
				} catch (error) {
					if (error.code !== "ENOENT") throw error;
					const value = {
						schemaVersion: 1,
						standardVersion: STANDARD_VERSION,
						enabledAt: Date.now()
					};
					await writeFileAtomic(path, JSON.stringify(value, null, 2) + "\n", { mode: 384 });
					return value;
				}
			});
		})().catch((error) => {
			this.activationPromise = void 0;
			throw error;
		});
		return this.activationPromise;
	}
	async eligible(agent) {
		if (this.closed || !agent || !idPattern.test(agent.id ?? "") || mode(agent) !== "cordis") return false;
		const header = agent.session.header;
		if (!Number.isSafeInteger(header.createdAt)) return false;
		if (header.parentSession || header.origin === "subagent") {
			const parent = this.active.get(header.parentSession)?.agent;
			if (header.origin !== "subagent" || !parent || !await this.eligible(parent)) return false;
		}
		const activation = await this.activation();
		if (header.createdAt < activation.enabledAt) return false;
		return !await this.sceneBinding(agent.id);
	}
	async require(agent, owner) {
		if (agent !== owner || !await this.eligible(agent)) throw Error("CREATION_SCOPE_REQUIRED");
	}
	async sync(agent) {
		if (this.pending.has(agent.id)) return this.pending.get(agent.id);
		const job = this.mount(agent).finally(() => this.pending.delete(agent.id));
		this.pending.set(agent.id, job);
		return job;
	}
	async mount(agent) {
		if (!await this.eligible(agent)) {
			this.remove(agent.id);
			return false;
		}
		const existing = this.active.get(agent.id);
		if (existing?.agent === agent && existing.ctx === agent.ctx) return true;
		this.remove(agent.id);
		const library = await this.standard(), disposers = [];
		const content = library.skill + "\n\n配套根：" + this.root + "\n工程默认位置：" + join(this.root, "development/projects/<projectId>") + "\n静态检查器绝对路径：" + fileURLToPath(new URL("./development/check.mjs", import.meta.url)) + "\n使用 DSH 原生终端执行 node \"<检查器绝对路径>\" \"<工程目录>\"；Windows 使用 PowerShell 7。";
		const registry = agent.ctx.get("skills") ?? agent.ctx.skills, tools = agent.ctx.get("tools") ?? agent.ctx.tools;
		try {
			for (const name of [skill, "cordis-plugin-development"]) disposers.push(registry.register({
				name,
				description: "开发、修改、检查 Beelli X 场景包、工具包、技能包及能力包时使用；沿 DSH 原生工具开发，由 Beelli X 中台管理业务包。",
				content,
				source: "runtime",
				provider: "@beellix-ai/dsh-beellix-plugin",
				resourceBase: {
					kind: "opaque",
					description: "beellix_develop action index/read 按需读取标准"
				},
				invocation: {
					modelInvocable: true,
					userInvocable: true
				}
			}));
			disposers.push(tools.register({
				name: "beellix_develop",
				description: "查询 Beelli X 开发标准与真实能力目录，或静态校验工程描述和包清单；不执行代码、不安装插件、不授予业务权限。",
				parameters: {
					type: "object",
					additionalProperties: false,
					required: ["action"],
					properties: {
						action: { enum: [
							"index",
							"read",
							"check"
						] },
						reference: { type: "string" },
						offset: {
							type: "integer",
							minimum: 0
						},
						project: { type: "object" },
						manifest: { type: "object" },
						business: { type: "object" }
					}
				},
				output: {
					schema: { type: "object" },
					render: (_args, value) => [{
						type: "text",
						text: JSON.stringify(value)
					}]
				},
				isConcurrencySafe: () => true,
				execute: async (args, exec) => {
					exec.signal?.throwIfAborted();
					await this.require(exec.agent, agent);
					const keys = args?.action === "index" ? ["action"] : args?.action === "read" ? [
						"action",
						"reference",
						"offset"
					] : args?.action === "check" ? [
						"action",
						"project",
						"manifest",
						"business"
					] : [];
					if (!args || Array.isArray(args) || typeof args !== "object" || !keys.length || Object.keys(args).some((key) => !keys.includes(key))) throw Error("CREATION_ARGUMENT_INVALID");
					if (args.action === "index") {
						const installed = await this.capabilities();
						exec.signal?.throwIfAborted();
						await this.require(exec.agent, agent);
						return {
							standardVersion: STANDARD_VERSION,
							defaultType: "scene",
							projectRoot: join(this.root, "development/projects"),
							references: Object.entries(library.references).map(([id, row]) => ({
								id,
								title: row.title,
								sha256: row.sha256,
								characters: row.text.length
							})),
							capabilities: library.capabilities,
							installed,
							checkScope: "check 只验证传入的描述与清单；工程文件用原生工具读取，构建和运行必须另验收"
						};
					}
					if (args.action === "read") {
						const row = Object.hasOwn(library.references, args.reference ?? "") ? library.references[args.reference] : void 0;
						if (!row) throw Error("CREATION_REFERENCE_NOT_FOUND");
						const offset = args.offset ?? 0;
						if (!Number.isSafeInteger(offset) || offset < 0 || offset > row.text.length) throw Error("CREATION_REFERENCE_OFFSET");
						const end = Math.min(offset + 8e3, row.text.length);
						return {
							standardVersion: STANDARD_VERSION,
							reference: args.reference,
							sha256: row.sha256,
							text: row.text.slice(offset, end),
							nextOffset: end < row.text.length ? end : null
						};
					}
					if (args.action === "check") {
						if (!args.project || !args.manifest) throw Error("CREATION_CHECK_INPUT_REQUIRED");
						return validateProject(args.project, args.manifest, args.business);
					}
					throw Error("CREATION_ACTION_INVALID");
				}
			}));
			const prompt = agent.ctx.get("systemPrompt") ?? agent.ctx.systemPrompt;
			disposers.push(prompt.context({
				name: "beellix:development",
				order: 251,
				interpolate: false,
				text: "当前是 DSH 原生创造模式。开发 Beelli X 插件前加载 beellix-plugin-development 技能，按 beellix_develop 的版本化标准开发；详细规范按需读取，不注入全部场景。业务包通过 Beelli X 中台安装管理，不直接写 DSH Profile。工程声明和静态检查不代表权限、测试或运行就绪。"
			}));
			if (this.closed || !await this.eligible(agent)) {
				for (const dispose of disposers.reverse()) dispose();
				return false;
			}
			this.active.set(agent.id, {
				agent,
				ctx: agent.ctx,
				disposers
			});
			return true;
		} catch (error) {
			for (const dispose of disposers.reverse()) dispose();
			throw error;
		}
	}
	remove(id, { contextDisposed = false } = {}) {
		const record = this.active.get(id);
		this.active.delete(id);
		if (record && !contextDisposed) for (const dispose of record.disposers.reverse()) dispose();
	}
	async dispose() {
		this.closed = true;
		await Promise.allSettled(this.pending.values());
		for (const id of this.active.keys()) this.remove(id);
	}
};
//#endregion
export { CreationRuntime };
