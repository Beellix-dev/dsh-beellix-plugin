/** 私有数据根的操作系统权限；不跟随链接，不改变文件内容。 */
import { execFileSync } from 'node:child_process'
import { chmodSync, lstatSync, mkdirSync, readdirSync } from 'node:fs'
import { dirname, isAbsolute, join, parse, resolve } from 'node:path'

const windowsProtection = String.raw`
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
`

export interface PrivateDirectoryResult {
  protected: true
  changed: boolean
  entries: number
  powerShellVersion?: string
}

/** 在写入私有资料前收紧数据根；Windows 使用真实 DACL，POSIX 使用 0700。 */
export function ensurePrivateDirectorySync(directory: string): PrivateDirectoryResult {
  if (typeof directory !== 'string' || !isAbsolute(directory)) throw Error('PRIVATE_DATA_PATH')
  const root = resolve(directory)
  if (root === parse(root).root) throw Error('PRIVATE_DATA_PATH')
  const checkParents = () => {
    for (let path = root;; path = dirname(path)) {
      try { if (lstatSync(path).isSymbolicLink()) throw Error('PRIVATE_DATA_LINK') }
      catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error }
      if (dirname(path) === path) break
    }
  }
  checkParents()
  mkdirSync(root, { recursive: true, mode: 0o700 })
  checkParents()
  if (!lstatSync(root).isDirectory()) throw Error('PRIVATE_DATA_PATH')
  if (process.platform === 'win32') {
    const args = ['-NoProfile', '-NonInteractive', '-Command', windowsProtection]
    const options = {
      windowsHide: true, encoding: 'utf8', timeout: 600000, maxBuffer: 65536,
      env: { ...process.env, BEELLIX_PRIVATE_DATA_DIR: root },
    } as const
    let output: string
    try { output = execFileSync('pwsh.exe', args, options) }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
      // 客户端首次启动可能尚未准备托管 Pwsh；仅操作系统 DACL 使用既有系统兼容路径。
      const env = Object.fromEntries(Object.entries(options.env).filter(([key]) => key.toLowerCase() !== 'psmodulepath'))
      output = execFileSync(join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe'), args, { ...options, env })
    }
    const result = JSON.parse(output) as PrivateDirectoryResult
    if (result.protected !== true) throw Error('PRIVATE_DATA_VERIFY')
    return result
  }
  let entries = 0, changed = false
  const walk = (path: string) => {
    const info = lstatSync(path)
    if (info.isSymbolicLink() || !info.isDirectory()) return
    for (const name of readdirSync(path)) walk(join(path, name))
    if ((info.mode & 0o777) !== 0o700) { chmodSync(path, 0o700); changed = true }
    entries++
  }
  walk(root)
  return { protected: true, changed, entries }
}
