# GenesisCompat 兼容层

> 我并不想进行这个项目，但社区环境早已和过去不同，制作者连续不断地更新，
> 内容不多但每次都会爆破mod和美化包，这并不好。你更新折磨mod可以理解，
> 但你折磨美化作者是什么鬼，还有人说分裂社区，我再不弄。很多美化、
> mod作者迟早要退游，谁有经历天天陪你更新，一年好几次，本来也是用爱发电。
> 你不在乎社区，那就我来。

## 定位

DoL-Genesis-LTS 的兼容层。LTS 追上游更新，但保证 mod 和美化不炸：
内容更新直接合并；纯重命名类破坏性变更拒绝合并（LTS 命名规范自己说了算）；
牵涉重构的内容自己重写后合并。

## 核心机制

**声明制 + 沙盒回退**：mod 在 boot.json 声明 `"compat": "0.5.8"` →
进沙盒（0.5.8 引擎代码原样生成，隔离环境）→ 出口翻译成 0.5.11 格式 → 主线渲染。

- **判定入口只有声明**：不声明的包零介入。声明错了是玩家/作者的责任。
- **整体回退，不分人模/衣服**：任何声明的老包存在 → 264 层整体回退。
- **沙盒数据隔离**：注入对象走 overlay 代理（读共享主线，写进私有副本），主线零污染。
- **翻译规则从 git 挖**：`git log 0.5.8.10..0.5.11.9 --diff-filter=R` 的官方重命名
  commit 是规则来源，不维护手工映射表。
- **混用不承诺**：旧人模+新衣服等混合场景能跑多少算多少，不保证。

## 文件构成

| 文件 | 职责 |
|---|---|
| `dist/retro-env.js` | 沙盒本体（自动生成，真相源 git tag 0.5.8.10，勿手改） |
| `dist/retro-apply.js` | 应用引擎：检测声明 → overlay 注入 → 整体层替换 → preprocess 接缝 |
| `dist/retro-path-translate.js` | 出口路径翻译（clothes + 人模目录，Image 级挂点） |
| `dist/migrate.js` | 数据翻译：covered trait 拆分迁移 |
| `dist/patch-redirect.js` | 老功能 mod 的 ReplacePatcher 锚点重挂 |
| `dist/global-shims.js` | 官方删除的全局 API 垫片（initPlants/Fadable） |

## 生成器

`devTools/gen-retro-env/`（沙盒生成）：
- `gen-retro-env.cjs`：从 git tag 0.5.8.10 生成 retro-env.js
- `audit-freevars.cjs` / `audit-writes.cjs`：自由变量 / 写入点静态审计
- `test-*.cjs`：冒烟 / overlay 隔离 / 翻译 / srcfn 行为测试

## 构建

见工程根 BUILD.md。兼容层打包（`compat/pack-compat.py` → genesis-compat.mod.zip）
后走 insert2html 第 3 步（无需重编译游戏本体）。

## 已知缺口（文档说明用）

- ear-slime 全套（0.5.8 无此特性，无对应美术）
- 0.5.11 新增衣服/物品目录（467 个新目录，老包没画）
- covered trait 拆三张图标（语义拆分，migrate.js 处理数据侧）
