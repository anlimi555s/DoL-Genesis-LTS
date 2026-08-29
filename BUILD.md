# DoL-Genesis-LTS 构建流程

本工程 = 官方 DoL 0.5.11.9 英文源码 + ModLoader 2.101.1 + 内置 mod。
构建链与官方 DoLModLoaderBuild 完全一致。

## 前置

- node（任意新版本）
- tweego：工程自带 `devTools/tweego/tweego_win64.exe`（2.1.1），无需另装
- ModLoader 官方成品包（`ModLoader Package.zip`，从 [ModLoader/actions](https://github.com/Lyoko-Jeremie/sugarcube-2-ModLoader/actions) 下载，需 GitHub 登录）
  - 从包里取三个文件，放入工具目录 `dol-mod/tools/modloader-build/`（下文称 `<工具目录>`）：
    - `dist-BeforeSC2/BeforeSC2.js`
    - `dist-insertTools/sc2PatchTool.js`
    - `dist-insertTools/insert2html.js`（复制一份改名为 `insert2html.cjs`，因为本工程 package.json 是 `"type": "module"`，直接跑 .js 会报 require 错误）
- `locale/chs.js`（SugarCube 引擎简体中文 UI 文本，来自 [sugarcube-2_Vrelnir](https://github.com/Lyoko-Jeremie/sugarcube-2_Vrelnir) 仓库 `locale/chs.js`，同样放 `<工具目录>`）
  - 作用：翻译引擎 UI 层文本（存档界面框架等），注入后由 `initI10n` 生效。不传会导致 `initI10n is not a function` 报错且引擎 UI 永远英文

## 构建步骤

全部在工程根目录执行。

### 1. 编译游戏

```bash
FORCE_VERSION=0.5.11.9 sh compile.sh
```

产出 `Degrees of Lewdity 0.5.11.9.html`。

注意：**引擎必须保持 vanilla**（`devTools/tweego/storyFormats/sugarcube-2/format.js` 用官方原装，不要覆盖成定制版）。
引导点不是编译时打进去的，由下一步 sc2PatchTool 处理。

### 2. sc2PatchTool（打引导点 + 注入引擎 UI 汉化）

```bash
node <工具目录>/sc2PatchTool.js "Degrees of Lewdity 0.5.11.9.html" <工具目录>/chs.js
```

产出 `Degrees of Lewdity 0.5.11.9.html.sc2patch.html`。

这一步做三件事：
1. 把引擎启动点包成 mainStart + ModLoader 调度器（引导点）
2. cheerio 重新序列化 html——**把 tweego 编译产生的 `&quot;` 实体转义还原成原样引号**
3. 注入 `initI10n(l10nStrings)` + chs.js 的中文 UI 文本（存档界面框架等引擎 UI 层翻译）

第 2 点至关重要：ModI18N 这类按字符位置锚定的 mod 依赖引号原样的格式。跳过这步，存档界面等引号密集的 passage 会汉化失效。

第 3 点同样必须：不传 chs.js，调度器里 `window.initI10n(l10nStrings)` 调用会直接 TypeError，且引擎 UI 层永远英文。

### 3. 注入 ModLoader + 内置 mod

```bash
cd mods
node <工具目录>/insert2html.cjs "../Degrees of Lewdity 0.5.11.9.html.sc2patch.html" "modList.json" <工具目录>/BeforeSC2.js
```

产出最终成品 `Degrees of Lewdity 0.5.11.9.html.sc2patch.html.mod.html`。

- `modList.json` 里的路径相对 `mods/` 目录（形如 `"ModLoaderGui/ModLoaderGui.mod.zip"`）
- 列出的 mod 会作为 Local 类型内嵌进 html
- cwd 必须是 `mods/`，否则路径找不到

## 成品

`Degrees of Lewdity 0.5.11.9.html.sc2patch.html.mod.html` —— 单个 html，开箱即玩。
内含 ModLoader 2.101.1 + 24 个内置 mod（23 个官方 + ModI18N 汉化）。

### 4. 分发复制（稳定版命名）

构建完成后复制一份为分发名（每次构建后覆盖）：

```bash
cp "Degrees of Lewdity 0.5.11.9.html.sc2patch.html.mod.html" "DoL-Genesis-LTS v0.1.html"
```

分发用这个文件名，构建产物（原名）保留不动。

**分发结构硬约束**：`img/` 目录（36MB 旁侧图包）必须与成品 HTML **同目录并排打包**——游戏通过 file:// 相对路径直接读它。HTML 不能单独放进 release 文件夹，否则图全部 404。

图包**不内嵌**，以旁侧 `img/` 目录形式随成品分发（与成品 HTML 同目录并排，file:// 相对路径直读，见上面第 4 步的硬约束）。`img/` 目录内容即原版贴图，构建链不打包它（tweego 编译文件列表不含根 img/）。

## 内置 mod 更新

`mods/` 下的 mod zip 来自 ModLoader 官方包；`ModI18N.mod.zip` 来自汉化组 release（[Eltirosto/Degrees-of-Lewdity-Chinese-Localization](https://github.com/Eltirosto/Degrees-of-Lewdity-Chinese-Localization)）；`GameOriginalImagePack.mod.zip` 来自 [DoLModLoaderBuild](https://github.com/Lyoko-Jeremie/DoLModLoaderBuild) release。
更新时用新包的同名 zip 替换，再重走第 3 步（无需重编译）。
若增删 mod，同步改 `mods/modList.json`。

## 验证要点

- 引导点：grep `modSC2DataManager.startInit` 应为 1
- 版本：grep `2.101.1`
- 转义：passage 内引号应为原样（`class="..."` 而非 `class=&quot;..."`）
