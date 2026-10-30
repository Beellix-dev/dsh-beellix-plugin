# 安全报告

如问题涉及密钥、访问控制、用户资料或可被直接利用的漏洞，请使用 GitHub 的[私密漏洞报告](https://github.com/Beellix-dev/dsh-beellix-plugin/security/advisories/new)，不要在公开 Issue 中粘贴敏感内容。

报告应说明受影响版本、最少复现步骤、影响范围及建议；只提供必要且脱敏的证据。维护者确认后再协调修复与公开披露。普通功能问题使用 [Issues](https://github.com/Beellix-dev/dsh-beellix-plugin/issues)。

## 维护范围

当前维护社区版0.1.1。接口验证基线与未验证范围见[验证说明](docs/verification.md)；不以兼容声明代替每一版桌面验收。

## 运行边界

插件在本机用户权限下运行。DSH 的执行权限、会话范围和业务审核需要同时遵守；它们不构成针对恶意本地代码的操作系统隔离。

不要将真实 Profile、业务数据库、恢复密码、API Key、令牌或备份提交到仓库。MIT 许可和市场收录不等同于安全保证；第三方依赖及业务插件分别评估。
