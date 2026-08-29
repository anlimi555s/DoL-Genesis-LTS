# 天气 Canvas 空转修复记录（2026-08-29）

## 背景

移动端（GeckoView/WebView）整体卡顿。真机诊断：渲染帧率健康（5ms），但空闲时内容进程持续烧 32% CPU。

精读 `game/03-JavaScript/weather/03-canvas/` 全链路后定位：天气画布系统存在大量"空转重绘"——无动画内容时仍以 20-33fps 全画布重合成，且关闭开关不停止循环。

## 改动清单（3 个独立 commit，可单独 revert）

| commit | 文件 | 行为变化 |
|--------|------|---------|
| `15590b96b` 修复 A | `weather-AnimationGroup.js` | `animations.size < 1` 时不再调 `onUpdate()`（原每帧全画布重合成）。受益：location 层（无反射图时）、locationSmoke 层（无烟时）20fps 空转归零 |
| `416255817` 修复 B | `effects-lightning.js` | 闪电 ticker 加 `condition: () => Weather.enableLightning`。无闪电时 4 层 × 20fps 恒定重绘归零（canUpdate 每 tick 现查，开关动态生效） |
| `d361c2de8` 修复 C | `01-events.js` | `:passagestart` 检查 `V.options.weatherUpdate && V.options.images`（对齐 caption.twee:6 渲染条件）：关闭 → `stopAll()` + `loaded.value=false`；重开 → 自动走初始化路径恢复 |

## 回退方法

- **全部回退**：`git reset --hard pre-weather-fix-2026-08-29`（基线 tag，指向 6c00baef6）
- **单个回退**：`git revert <commit>`（A/B/C 相互独立，可单独回退）
- **代码内注释**：每处改动都带 `// LTS 修复` 注释说明回退方式（删行/恢复调用）

## 未修（已知残留，待数据后决策）

1. **反射关闭但地点有反射图**：distortion 动画照跑（10fps 白烧）——动画对象 `onDisable` 只 disable 不 remove，`animations.size` 仍 >0
2. **fog/precipitation 粒子清零后仍重绘**：ParticleEmitter ticker 常驻，粒子为 0 时 emitter 空转但层重绘照跑（fog 20fps / precipitation 33fps）
3. **ParticleEmitter re-init 泄漏**：静态 `#emittersByGroup` 持有旧 emitter 引用（上游已有问题，修复 C 的开关切换会放大）

## 验证清单

- [ ] PC 构建后 DevTools 确认 rAF 触发次数下降
- [ ] 真机空闲 CPU 对比（修复前 32%）
- [ ] 视觉回归：反射水面地点、下雨/下雪、闪电（血月/暴风）、无天气静态场景
- [ ] 开关回归：设置里 weatherUpdate / images 关→开→关，画面正确消失/恢复
- [ ] 标题画面 banner 不受影响
- [ ] 存档兼容：三个修复均不触碰 V 变量结构与存档格式
