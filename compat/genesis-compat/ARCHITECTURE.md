# GenesisCompat 架构（Selena 设计）

## 一句话

主体是现代版本。声明 compat 的旧包走沙盒隔离生成 → 出口翻译 → 回主线。不声明的包零介入。

## 流程图

```
mod 加载
  │
  ├─ boot.json 没有 "compat": "0.5.8" ──→ 完全不管，按原版（0.5.11）走
  │
  └─ boot.json 有 "compat": "0.5.8" ──→ 进沙盒
                                          │
                                          │ 沙盒 = 隔离环境，旧版代码原样生成
                                          │ （旧代码天然理解旧数据，不需要映射表）
                                          ▼
                                     产出（P58 格式路径等，可以翻译）
                                          │
                                          │ 出口翻译：统一翻译成 0.5.11 格式
                                          │ （规则来自官方 git 重命名 commit）
                                          ▼
                                     回主线（0.5.11 引擎渲染）
```

## 各部分的定位

| 部分 | 定位 |
|------|------|
| 主线（0.5.11） | 唯一渲染者，完全不动 |
| 分流 | 判定方法只有一条：boot.json 有没有 `"compat": "0.5.8"`。判定错了是玩家/作者的责任，不纠错 |
| 沙盒 | 隔离的执行环境。旧版代码在里面生成，保证渲染相互独立、不互相影响 |
| 出口翻译 | 沙盒产出的数据统一翻译成 0.5.11 格式（规则级小变换，规则从 git 挖，不是手工映射表） |
| 主线渲染 | 翻译后的数据进主线，主线照常渲染 |

## 规则

1. **进不进沙盒，只看声明。** 判定方法就是 boot.json 有没有 `"compat": "0.5.8"`。
2. **新版绝对不能进沙盒。** 沙盒内部是旧版本渲染，新版数据进去必坏。
3. **声明错了是玩家的问题。** 玩家把新版包标了旧版声明，兼容层不负责纠错。
4. **混用不承诺。** 旧人模+新衣服等混合场景，能跑多少算多少（出口翻译兜住路径差），不保证。
5. **不维护复杂映射表。** 旧版代码原样跑，天然理解旧数据；只翻译产出（路径格式差），翻译规则简单可枚举。
6. **不分人模/衣服。** 判定入口只有声明。包供人模图还是衣服图，是包的内容，不是兼容层的分流依据。

## 隔离边界（2026-08-30 定稿）

沙盒隔离 = 代码隔离 + 数据隔离：

- **代码隔离**：0.5.8 函数在沙盒闭包内互调自洽，不挂 window，不污染全局。
  例外：6 个老包脚本运行时会调的全局函数（getWritingImgPath/genlayer_wings_cover 等）
  由 retro-apply 显式恢复到 window——白名单挂载，不是放任。
- **数据隔离（overlay 代理）**：注入沙盒的 V/setup/T/Renderer 全部走写时复制代理。
  读共享主线实时状态（旧代码需要真实数据才能算产出）；
  写进沙盒私有副本（旧代码写 setup.hair 等旧格式表，只影响沙盒自己，主线零污染）。
  沙盒写后自读，从副本读回旧格式表——内部自洽。

## 实现文件

| 文件 | 职责 |
|---|---|
| `dist/retro-env.js` | 沙盒本体（生成器 devTools/gen-retro-env 从 git tag 0.5.8.10 生成，勿手改） |
| `dist/retro-apply.js` | 应用引擎：检测声明 → overlay 注入 → 264 层整体替换 → preprocess 接缝 |
| `dist/retro-path-translate.js` | 出口翻译：0.5.8 路径 → 0.5.11 路径（规则来自 git rename commit） |
| `dist/migrate.js` | 数据翻译：covered trait 迁移（旧数据格式 → 新格式） |
| `dist/patch-redirect.js` | 老功能 mod 的 ReplacePatcher 锚点重挂（锚点翻译表来自 git diff） |
| `dist/global-shims.js` | 老包脚本调用的全局 API 垫片（initPlants/Fadable） |

## 测试

- `devTools/gen-retro-env/test-smoke.cjs`：沙盒加载冒烟（264 层、globals 导出）
- `devTools/gen-retro-env/test-overlay.cjs`：overlay 隔离验证（主线五对象零污染）+ 人模翻译用例
- `devTools/gen-retro-env/test-translate.cjs`：衣物翻译用例
- `devTools/gen-retro-env/test-arm.cjs` / `test-v-bridge.cjs`：srcfn/V 桥接行为
- `devTools/gen-retro-env/audit-writes.cjs`：沙盒写入点静态审计（改动后回归用）
