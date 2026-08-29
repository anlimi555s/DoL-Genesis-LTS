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

## 核心机制（2026-08-29 定稿）

**声明制 + 回退渲染（引擎侧）**：mod 在 boot.json 声明 `"compat": "0.5.8"` →
引擎按 0.5.8 的路径规则生成图片请求 → 老 mod 的图直接命中。**mod 数据零手术**。

渲染管线按部位图层组独立：body/face/clothes 各有 srcfn 与着色逻辑。
每个部位看"给它供图的包"的声明版本，独立决定走新走旧——
旧人模+新衣服、新人模+旧衣服、全旧、全新，四种组合互不影响。

变更体系参照 Android changeId：注册表条目 = `{id, introduced, state, apply}`，
`declaredCompat < introduced` → 启用该变更的规范化/回退。
（当前实现是直接函数，注册表抽象待做）

## 文件构成

| 文件 | 职责 | 大小 |
|---|---|---|
| `dist/retro-render.js` | 回退渲染主体（见下） | 274 行 |
| `dist/rename-map.js` | 命名映射数据（forward 新→旧，运行时查表用） | 8294 条 |
| `dist/normalize.js` | 数据迁移：covered trait 拆分 | 62 行 |

## retro-render.js 的四层

触发：BSA typeOrder 里有声明 compat 的 type（whenSC2PassageInit 时应用一次）。

1. **preprocess 包装**：用 V 按 0.5.8 公式重算路径字段（penis 旧格式、parasite 旧值、
   cum 大写 dripspeeds、0.5.8 合并档位表）
2. **显式 srcfn 回退**（行为变更，非纯命名）：penis/penis_parasite/clit_parasite/
   cum×8/leftarm/rightarm —— 18 个图层
3. **通用 srcfn 包装**（纯命名差异）：所有其余图层的 srcfn 结果经 rename-map forward
   （新→旧）查表转换；表未命中且图层滤镜是 hard-light 时加 `_gray` 后缀
   （0.5.8 gray_suffix 着色管线）—— 397 个图层
4. **眼睛分层禁用**：sclera/iris/lashes/brows 的 showfn → false（老包无分层图，只用整眼）

## 验证状态

- ✅ AUandrogynous 实机（内嵌构建 + headless）：retro 415 项应用、penis/cum/arm 旧路径、
  clothes `full_gray.png`、眼睛分层禁用，零报错
- ✅ 新游戏数据流干净（Clothing Shop 穿衣服不报错）
- ⏳ 混合场景（新美型+老衣服）未实测
- ⏳ 其他老美型包（非 AUandrogynous）未实测
- ⏳ 老衣物 mod（covered 迁移 + 图片）未实测
- ⏳ 变更体系注册表抽象（当前直接函数）

## 无解缺口（文档说明用）

- ear-slime 全套（0.5.8 无此特性，无对应美术）
- 0.5.11 新增衣服/物品目录（467 个新目录，老包没画）
- covered trait 拆三张图标（语义拆分）

## 生成器

`dol-mod/tools/compat-gen/`：
- `gen_map.py`：两版 img 目录 diff + 候选规则 → gen_map_result.json
- `merge_community.py`：吸收 legacy-compat SPECIAL_RENAMES
- `purge_behavior_domains.py`：从 rename 表剔除行为变更域
- `gen_rename_map_js.py`：生成 rename-map.js
- `audit_gaps.py`：以引擎请求集为基线审计缺图
- `pack_compat.py`：打包 genesis-compat.mod.zip
- `gen_alias.py`（已弃用）：penis alias 生成器，srcfn 回退后不再需要

## 构建

见工程根 BUILD.md。兼容层打包后走 insert2html 第 3 步（无需重编译）。
