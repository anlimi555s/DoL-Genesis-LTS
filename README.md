# DoL-Genesis-LTS

Degrees of Lewdity fork ：LTS platform. Mods that ran keep running. / DoL 稳定平台：让能跑的永远能跑。

## 这是什么

基于 DoL 0.5.11.9 + ModLoader 的长期支持（LTS）整合版。追官方更新，同时保证旧 mod 和美化包不炸：

- **旧美化包复活**：0.5.4~0.5.8 时代的美型/衣服包，只要 boot.json 声明 `"compat": "0.5.8"`（或写包针对的版本号），引擎自动回退渲染模型，直接能用
- **新包零介入**：0.5.9+ 的现代包不声明，直接跑
- **数据兼容**：covered trait 等数据变更自动迁移
- **老包脚本兼容**：官方删除的全局 API 自动垫片

## 下载

去 [Release](https://github.com/anlimi555s/DoL-Genesis-LTS/releases) 下载，解压后 **HTML 和 img 文件夹必须并排**，浏览器打开 HTML 即玩。

## 给 mod 作者

想让你的 0.5.8 老包被兼容层识别，在 boot.json 加一行：

```json
"compat": "0.5.8"
```

声明值写你包当初针对的游戏版本（0.5.4~0.5.8 均可）。不声明的包零介入，什么都不用改。

## 反馈 bug

[Issues](https://github.com/anlimi555s/DoL-Genesis-LTS/issues) 提交，附上：

- F12 console 里 `[GenesisCompat]` 开头的日志
- 出问题画面的截图

## 构建

见 [BUILD.md](BUILD.md)。

---

注意！这是"DRESS OF LEWDITY stable version"的Alpha测试版本。
Alpha测试版本并不代表本产品的最终质量。感谢您的理解和支持，祝你好运！

因为v的神秘更新速度，我们选择直接进行公测，请去release下载版本，我们会根据您提交的bug进行修复，请您谅解
