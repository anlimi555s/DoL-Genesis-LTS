// GenesisCompat 全局 API 垫片。
// 官方 0.5.11 删除的全局 API，老包自带脚本可能在运行时调用。
// 检测到声明 compat 的 legacy mod 后，把这些 API 挂回 window。
// 全量对比（0.5.8 vs 0.5.11 顶层 function + window.xxx）确认的缺口：
//   initPlants  — 植物初始化（新版重构进 tending.js/setup.foodstuff，引擎侧已初始化，垫片 no-op）
//   Fadable     — 天气淡入淡出类（新版天气重构删除，0.5.8 实现原样恢复，依赖 DateTime/TimeConstants 新版仍在）
// genlayer_*/gray_suffix/getWritingImgPath 由 retro-apply.js 在渲染回退时恢复，不在此处。
(function () {
	'use strict';

	const COMPAT_FLOOR = '0.5.9';
	let installed = false;

	function install() {
		if (installed) return;
		installed = true;

		// initPlants：新版植物系统已重构，初始化由引擎完成。老包调用不炸即可。
		if (typeof window.initPlants === 'undefined') {
			window.initPlants = function () {
				console.warn('[GenesisCompat] initPlants() is a no-op in 0.5.11: plant system refactored into setup.foodstuff / tending.js.');
			};
			console.log('[GenesisCompat] shim installed: initPlants (no-op)');
		}

		// Fadable：0.5.8 实现原样恢复（依赖 DateTime / TimeConstants，新版仍在 00-framework-tools/10-time/）。
		if (typeof window.Fadable === 'undefined') {
			window.Fadable = class Fadable {
				constructor(settings, date, initFactor) {
					this.settings = settings;
					this.factor = initFactor;
					this.currentDate = new window.DateTime(date);
				}
				setTime(date) {
					this.elapsedTime = this.currentDate?.compareWith(date, true) / window.TimeConstants.secondsPerMinute;
					this.currentDate = new window.DateTime(date);
				}
				setFadeFactor(date, fadeTarget, instant = false) {
					this.setTime(date);
					if (instant) {
						this.factor = fadeTarget;
						return;
					}
					const fadeChange = (1 / this.settings.timeToFade) * this.elapsedTime;
					const fadeDirection = Math.sign(fadeTarget - this.factor);
					if (fadeDirection !== 0) {
						this.factor += fadeChange * fadeDirection;
						if ((fadeDirection > 0 && this.factor > fadeTarget) || (fadeDirection < 0 && this.factor < fadeTarget)) {
							this.factor = fadeTarget;
						}
						this.factor = Math.clamp(this.factor, 0, 1);
					}
				}
			};
			console.log('[GenesisCompat] shim installed: Fadable');
		}
	}

	// 检测到 legacy mod（afterModLoad 比 passageInit 早，覆盖老包脚本在加载期调用全局 API 的场景）
	function afterModLoad(bootJson, zip, modInfo) {
		if (!modInfo || !modInfo.bootJson || !modInfo.bootJson.compat) return;
		const cmp = window.GenesisCompatCompareVersion;
		if (!cmp) return;
		if (cmp(modInfo.bootJson.compat, COMPAT_FLOOR) < 0) install();
	}

	function startHook() {
		const tryHook = function () {
			if (!window.modUtils || !window.modUtils.getModLoadController) return false;
			const controller = window.modUtils.getModLoadController();
			if (!controller || !controller.addLifeTimeCircleHook) return false;
			controller.addLifeTimeCircleHook('genesis-compat-global-shims', {
				afterModLoad: afterModLoad,
			});
			console.log('[GenesisCompat] global-shims hooked');
			return true;
		};
		if (tryHook()) return;
		const timer = setInterval(function () {
			if (tryHook()) clearInterval(timer);
		}, 200);
		setTimeout(function () { clearInterval(timer); }, 30000);
	}

	startHook();
})();
