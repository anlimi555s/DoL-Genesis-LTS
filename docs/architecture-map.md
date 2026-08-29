# DoL-Genesis-LTS 渲染与性能架构图谱

> 用途：性能优化与 bug 定位的导航图。每次上游合并或系统改动后同步更新。
> 图例：`★修复X` = 已落地的 LTS 修复；`⚠断点` = 已知问题/待验证假设。

## 1. 总览：passage 渲染全链路

```mermaid
graph TD
    CLICK["玩家点击链接"] --> ENGINE["SugarCube 引擎<br/>State.momentCreate（全量 State 深拷贝）"]
    ENGINE --> BODY["正文 wikify 渲染<br/>（DoL passage 代码 + 文本）"]
    BODY --> DISPLAY[":passagedisplay 事件"]
    DISPLAY --> CAPTION["StoryCaption 侧边栏全量重建<br/>caption.twee（meter/按钮/状态文本）"]
    CAPTION --> MODEL["角色模型渲染<br/>CanvasModels.main（slot=sidebar）"]
    MODEL --> END[":passageend 事件"]
    END --> MODCHAIN["26 个 mod 串行 hook 链<br/>Sc2EventTracer 三阶段回调"]
    MODCHAIN --> IDLE["空闲：rAF/动画循环"]
    IDLE --> CLICK

    style ENGINE fill:#ffd,stroke:#aa8
    style MODEL fill:#ffd,stroke:#aa8
    style MODCHAIN fill:#ffd,stroke:#aa8
```

**实测耗时（GeckoView 102 / 骁龙 855 / 真机遥测）**：

| 段 | 耗时 | 备注 |
|----|------|------|
| 正文渲染 | 45-82ms | DoL passage JS + wikify |
| 侧边栏+mod 链 | 61-104ms | 含 StoryCaption 重建 + 26 mod 回调 |
| 角色模型 compile | **4.3ms** | 缓存命中率高，非瓶颈（勿再优化） |
| 角色模型 compose | **1.7ms** | 同上 |
| 总计 | 114-172ms | "点一下顿一下"的来源 |

## 2. 天气画布系统（新 canvas 系统）

```mermaid
graph TD
    SUBEVENT["01-events.js :passagestart"] --> FIX_C["★修复C：开关检查<br/>!(weatherUpdate && images) → stopAll + loaded=false"]
    FIX_C --> INIT["Sky.initialize → setupCanvas → initEffects"]
    INIT --> LAYERS["17 个 layer（sky/clouds/location/fog/lightning…）"]
    LAYERS --> EFFECTS["各 layer 的 effects<br/>（locationImage / multiSmoke / fog / lightning…）"]
    EFFECTS --> GROUP["AnimationGroup（每层一个）<br/>start(): rAF 循环按 updateRate tick"]
    GROUP --> FIX_A["★修复A：animations.size<1 时不再 onUpdate"]
    FIX_A --> UPD["updateAnimations → onUpdate()"]
    UPD --> DRAW["Sky.drawLayers(name)<br/>全层 blit 合成（~5ms/次）"]
    DRAW --> UPD
    GROUP --> TICKER["ParticleEmitter 静态 ticker<br/>（emitter 创建时 add，常驻）"]
    TICKER --> FIX_B2["fog/precipitation 粒子清零仍重绘<br/>（已知残留，待优化）"]
    LIGHTNING["effects-lightning init<br/>无条件 add ticker"] --> FIX_B["★修复B：ticker.condition = enableLightning"]
    FIX_B --> UPD
    OBS["01-observables.js<br/>每 passageend setBindings<br/>变量变化 → layer.init + drawLayers"] --> DRAW
```

**关键文件**：
- `game/03-JavaScript/weather/03-canvas/01-src/00-classes/`——Sky/Layer/AnimationGroup/Animation/ParticleEmitter
- `game/03-JavaScript/weather/03-canvas/02-lib/01-layers/`——各层定义（layer-location/layer-lightning/layer-fog…）
- `game/03-JavaScript/weather/03-canvas/02-lib/00-effects/`——各 effect（effects-location/effects-lightning/effects-particles…）
- `game/03-JavaScript/weather/01-setup/weather-bindings.js`——observables 绑定表（含 location: V.location → location 层）

**已知残留（docs/weather-fix-2026-08-29.md）**：
1. 反射关闭但地点有反射图 → distortion 动画 10fps 白烧（disable 不 remove）
2. fog/precipitation 粒子清零后仍重绘（ParticleEmitter ticker 常驻）
3. ParticleEmitter re-init 泄漏（静态 #emittersByGroup 持有旧引用）

## 3. 贴图渲染双路径（⚠ 地点贴图消失调查中）

```mermaid
graph TD
    COND["caption.twee:6<br/>&lt;&lt;if $options.weatherUpdate && $options.images&gt;&gt;"] -->|true| NEW["&lt;&lt;skybox&gt;&gt; 新 canvas 画布<br/>id=canvasSkybox"]
    COND -->|false| OLD["&lt;&lt;weatherdisplay&gt;&gt; 旧贴图系统<br/>CSS div.skybox-xxx + img 元素"]

    NEW --> LOC["location 层<br/>locationImage effect"]
    LOC --> CACHE["ImageCache.getOrCreate()<br/>img/misc/locations/"]
    CACHE --> NEWIMG["new Image()"]
    NEWIMG --> IL["ImageLoaderHook 全局劫持<br/>（不引用 Weather，但劫持所有 Image 构造）"]
    IL -->|成功| DRAWN["drawLayers → 水彩地点图"]
    IL -->|失败/晚到| EMPTY["⚠断点：画空层"]
    FIX_A2["★修复A 停掉空转 tick"] -.切断.-> RETRY["官方隐性兜底：20fps 空转<br/>每 50ms 重画 = 失败自动重试"]
    RETRY -.-> DRAWN

    OLD --> CSS["img/misc/old/ 的 CSS 背景 + gif"]
    CSS --> IL2["ImageLoaderHook CssReplacer"]
```

**⚠ 调查中（2026-08-29）**：地点贴图不显示。已确认的事实：① 诊断数据 `images=1 weatherUpdate=true canvasSkyboxInDom=true`，走新 canvas 路径；② location 层画布像素全透明；③ logcat 有 `ctx.reset is not a function` 报错（FF122+ 才有该 API）。未决：天气修复 A/B/C 与贴图显示的关系（修复前贴图状态待实测裁决）。当前动作：天气修复已整体回退，遥测诊断输出保留，待重新定位。

## 4. 角色模型渲染（已确认非瓶颈）

```mermaid
graph TD
    IMG["&lt;&lt;img&gt;&gt; 宏（caption.twee 侧边栏）"] --> LOCATE["Renderer.locateModel('main','sidebar')"]
    LOCATE --> CACHE2["CanvasModelCaches slot 缓存<br/>跨 passage 复用实例"]
    CACHE2 --> COMPILE["CanvasModel.compile(options)<br/>实测 4.3ms（缓存层跳过）"]
    COMPILE --> COMPOSE["Renderer.composeLayers()<br/>实测 1.7ms"]
    COMPOSE --> ANIM["Renderer.animateLayers<br/>（sidebarAnimations：眨眼/呼吸 keyframe）"]
```

## 5. ModLoader 事件链（caption+chain 的大头，待拆）

```mermaid
graph TD
    SC2["Sc2EventTracer（webpack 内部，外部不可 patch）"] --> P1["whenSC2PassageInit"]
    P1 --> P2["whenSC2PassageStart"]
    P2 --> P3["whenSC2PassageEnd"]
    P3 --> MODS["26 个内置 mod 串行 await 回调<br/>（ImageLoaderHook / I18n 系列 / DoLTimeWrapper…）"]
```

**注**：遥测目前只能测整链耗时（61-104ms），mod 级拆分需要 ModLoader 日志（ModLoaderLog 导出）或按 mod 逐个禁用的 A/B 实验。

## 6. LTS 遥测层

```mermaid
graph TD
    TEL["game/99-telemetry/telemetry.js<br/>（最后加载，monkey-patch 包裹）"] --> P_PASSAGE[":passageinit/display/end 计时"]
    TEL --> P_MODEL["patch model.compile / Renderer.composeLayers"]
    TEL --> P_WEATHER["patch Sky.drawLayers（async await 计时）"]
    TEL --> P_RAF["rAF 间隔监控（>30ms = 长任务）"]
    TEL --> P_DIAG["10s 汇总 + 贴图诊断（V.options / DOM / 像素采样）"]
    TEL --> OUT["console.error → GeckoView consoleOutput(true)<br/>（仅 debug 构建）→ logcat 'Web Content'"]
```

**开关**：输出可见性由 `GeckoViewEngine.java` 的 `consoleOutput(true)` 控制（仅 debug 构建）。遥测代码常驻、开销 <0.1%。

## 7. 引擎层（待实装）

```mermaid
graph TD
    CUR["当前：GeckoView 102 唯一引擎<br/>（SpiderMonkey，JS 慢于 V8 30-50%）"] --> HYB["计划：hybrid 引擎<br/>WebView ≥85 → 系统 V8<br/>否则 → GeckoView 兜底"]
    HYB --> GV115["兜底升级 GeckoView 115 ESR<br/>（jank/调度 bug 修复，compileSdk 33 + AGP 7.3.1）"]
```

**依据**：Speedometer 移动端 Firefox 落后 Chrome；社区共识 hybrid（webdev-support 2024）；GeckoView jank bug 修复集中在 115-118。

## 8. 引擎 API 兼容性审计（GeckoView 102 = Firefox 102）

> 审计工具：`devTools/api-scan.py`（每次上游合并后重跑）。扫描范围：game/ + modules/ 共 230 文件。

| API | 调用次数 | FF 102 | 处理 |
|-----|---------|--------|------|
| `ctx.reset()` | 4 | 缺失（FF122+） | ✅ polyfill（`game/00-framework-tools/polyfills.js`） |
| `Math.clamp()` | 249 | 缺失（FF130+） | ✅ polyfill（同上） |
| `ctx.filter`（blur 等） | 6 | 无效（FF116+，静默） | ⚠ 静默降级：反射/发光无模糊，图仍在。不可 JS polyfill，等 116+ 内核自动恢复 |
| `window.print` | 33 | 无打印 UI | 📝 功能缺失，不崩 |

其余全绿：语法级（?. / ?? / ??= / #private / top-level await）与运行时（replaceAll / at() / structuredClone / ResizeObserver / clipboard / CSS color-mix / lch / :has 未使用）均无缺口。
