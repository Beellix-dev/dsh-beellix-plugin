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

import { createHash, randomBytes } from 'node:crypto'
import { lstat, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
export { ensurePrivateDirectorySync, type PrivateDirectoryResult } from './private-directory.js'

const WINDOWS_TRANSIENT_RENAME_ERRORS: ReadonlySet<string> = new Set(['EACCES', 'EBUSY', 'EPERM'])
const WINDOWS_RENAME_RETRY_INITIAL_MS = 20
const WINDOWS_RENAME_RETRY_MAX_MS = 200
const WINDOWS_RENAME_RETRY_LIMIT = 8

/** Whether Windows reported temporary interference with an atomic replacement. */
function isTransientWindowsRenameError(error: unknown): boolean {
  if (process.platform !== 'win32') return false
  return WINDOWS_TRANSIENT_RENAME_ERRORS.has((error as NodeJS.ErrnoException | null)?.code ?? '')
}

/** Replace the target after bounded retries for transient Windows interference. */
async function renameAtomicTemp(temp: string, filename: string): Promise<void> {
  let delay = WINDOWS_RENAME_RETRY_INITIAL_MS
  for (let retries = 0;; retries += 1) {
    try {
      await rename(temp, filename)
      return
    } catch (error) {
      if (!isTransientWindowsRenameError(error)) throw error
      if (retries >= WINDOWS_RENAME_RETRY_LIMIT) throw error
    }
    await new Promise(resolve => setTimeout(resolve, delay))
    delay = Math.min(delay * 2, WINDOWS_RENAME_RETRY_MAX_MS)
  }
}

/**
 * Filesystem options for {@link writeFileAtomic}; `mode` is required so the
 * permission decision stays visible at every call site.
 */
export interface WriteFileAtomicOptions {
  /**
   * Permission bits stamped on the fresh temp inode and carried through the
   * rename (subject to the process umask, like every fresh inode).
   */
  mode: number
  /**
   * Permission bits for parent directories this call creates (subject to the
   * umask; existing directories keep their mode). Omission uses the mkdir
   * default — pass `0o700` when the tree holds user-private data.
   */
  dirMode?: number
  /**
   * 平台专用的临时文件创建器；必须独占创建并在写入内容前建立权限，返回时已关闭句柄。
   * @param path - 本次原子替换的随机同目录临时路径。
   * @param content - 要写入的完整内容。
   * @returns 临时文件写入并关闭后的完成通知。
   */
  createTemp?: (path: string, content: string) => Promise<void>
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
export async function writeFileAtomic(filename: string, content: string, options: WriteFileAtomicOptions): Promise<void> {
  await mkdir(dirname(filename), {
    recursive: true,
    ...options.dirMode === undefined ? {} : { mode: options.dirMode },
  })
  // TODO(settings-atomic-durability): Use a replacement that fsyncs the file
  // and parent directory and preserves owner-only permissions on Windows.
  const temp = `${filename}.${randomBytes(6).toString('hex')}.tmp`
  try {
    if (options.createTemp) await options.createTemp(temp, content)
    else await writeFile(temp, content, { mode: options.mode, flag: 'wx' })
    await renameAtomicTemp(temp, filename)
  } catch (error) {
    await rm(temp, { force: true })
    throw error
  }
}

/** Whether an exclusive create found an existing lock. */
async function isLockContention(error: unknown, lockPath: string): Promise<boolean> {
  const code = (error as NodeJS.ErrnoException | null)?.code
  if (code === 'EEXIST') return true
  if (code !== 'EPERM') return false
  try {
    await lstat(lockPath)
    return true
  } catch {
    // Keep the original EPERM authoritative when lock existence is unproven.
    return false
  }
}

/** 仅当信号探测确认 `<pid>\n` 记录中的进程不存在时，认定所有者已经退出。 */
function holderExited(record: string): boolean {
  // 不完整或其他格式的内容不能证明所有者已经退出。
  if (!/^\d+\n$/.test(record)) return false
  const pid = Number(record.trim())
  // PID 0 指向进程组；只接受正的 int32 进程号。
  if (pid === 0 || pid > 0x7fffffff) return false
  // 即使运行环境不能探测自身，也不得接管自己的锁。
  if (pid === process.pid) return false
  try {
    process.kill(pid, 0)
    return false
  } catch (error) {
    // EPERM 表示进程属于其他用户，不能据此接管。
    return (error as NodeJS.ErrnoException).code === 'ESRCH'
  }
}

/** 读取锁记录；不可读时返回 undefined，不推定锁已失效。 */
async function readLockRecord(lockPath: string): Promise<string | undefined> {
  try {
    return await readFile(lockPath, 'utf8')
  } catch (error) {
    // 文件消失或仍在被 Windows 删除，均不能证明所有者状态。
    void error
    return undefined
  }
}

/**
 * 竞争者通过记录摘要命名的接管声明文件串行化恢复。取得声明后重新读取
 * 锁记录并探测进程，只有记录未变且所有者仍不存在时才移除锁，避免删除
 * 后继竞争者已经持有的锁，包括进程号被重新使用的情况。
 * @returns 本次是否移除了已退出所有者的锁。
 */
async function takeOverExitedLock(lockPath: string): Promise<boolean> {
  const record = await readLockRecord(lockPath)
  if (record === undefined || !holderExited(record)) return false
  const claim = `${lockPath}.takeover-${createHash('sha256').update(record).digest('hex').slice(0, 16)}`
  try {
    await writeFile(claim, `${process.pid}\n`, { mode: 0o600, flag: 'wx' })
  } catch (error) {
    // 其他竞争者持有该声明，或 Windows 尚未完成删除。
    const code = (error as NodeJS.ErrnoException).code
    if (code === 'EEXIST' || code === 'EPERM') return false
    throw error
  }
  try {
    if (await readLockRecord(lockPath) !== record || !holderExited(record)) return false
    try {
      await rm(lockPath, { force: true })
    } catch (error) {
      // 文件被短暂占用时 Windows 可能拒绝删除；下一轮继续尝试。
      void error
      return false
    }
    return true
  } finally {
    await rm(claim, { force: true }).catch((error: unknown) => {
      // 声明清理失败仍保留文件；如果同一 PID 再次成为遗留所有者，需人工核实恢复。
      void error
    })
  }
}

/**
 * Retry cadence for a contended lock. These stay robustness invariants of the
 * cross-process write protocol rather than deployment tunables: they govern how
 * often a contender asks, which no caller has a reason to vary.
 */
const LOCK_RETRY_INITIAL_MS = 20
const LOCK_RETRY_MAX_MS = 200

/**
 * How long a contender waits when the caller states no limit — sized for the
 * render-and-rename cycle every call site had when this package was written.
 * Expiry fails the contender rather than guessing whether the existing lock
 * still has an owner. How long is *worth* waiting is a property of the
 * operation the lock holder runs, which is why {@link FileLockOptions.waitMs}
 * exists; the value here is the floor for an operation that does file work
 * alone.
 */
const DEFAULT_LOCK_WAIT_MS = 2_000

/** Options for one {@link withFileLock} acquisition. */
export interface FileLockOptions {
  /**
   * Maximum time to wait for the lock, in milliseconds. State one when the
   * holder's operation legitimately runs longer than file work — a credential
   * mutation that refreshes a token performs a network round trip while
   * holding the lock, and leaving the default in place would fail every other
   * writer of the same file for the duration. Waiting is productive: a
   * contender that acquires the lock afterwards re-reads the committed state.
   */
  waitMs?: number
}

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
export async function withFileLock<T>(
  filename: string,
  operation: () => Promise<T>,
  options?: FileLockOptions,
): Promise<T> {
  const lockPath = `${filename}.lock`
  const deadline = Date.now() + (options?.waitMs ?? DEFAULT_LOCK_WAIT_MS)
  let delay = LOCK_RETRY_INITIAL_MS
  let retriedUnconfirmedPermissionError = false
  for (;;) {
    try {
      await writeFile(lockPath, `${process.pid}\n`, { mode: 0o600, flag: 'wx' })
      break
    } catch (error) {
      if (!await isLockContention(error, lockPath)) {
        // Windows 可能在独占创建失败与 lstat 之间释放竞争锁。
        if (process.platform !== 'win32'
          || (error as NodeJS.ErrnoException | null)?.code !== 'EPERM'
          || retriedUnconfirmedPermissionError) throw error
        retriedUnconfirmedPermissionError = true
      } else if (await takeOverExitedLock(lockPath)) continue
    }
    if (Date.now() >= deadline) {
      throw new Error(`atomic-write: timed out waiting for the writer lock at ${lockPath}`)
    }
    await new Promise(resolve => setTimeout(resolve, delay))
    delay = Math.min(delay * 2, LOCK_RETRY_MAX_MS)
  }
  try {
    return await operation()
  } finally {
    await rm(lockPath, { force: true })
  }
}
