// GenesisCompat patch 锚点重挂。
// 声明 compat 的老 mod，其 ReplacePatcher 规则的 from（旧代码锚点）在新版对不上 → patch 静默失效。
// 本模块在 mod 加载完成后（afterModLoad）、patch 应用前（patchModToGame），
// 按锚点翻译表重写 from/to 文本，把 patch 重挂到新版锚点上。
// 只处理声明 compat 的老 mod——现代 mod 的规则不碰（零介入）。
(function () {
	'use strict';

	// 回退线：compat 声明低于 0.5.9 的包才重挂 patch（与渲染回退同一家族判定）
	const COMPAT_FLOOR = '0.5.9';

	// 锚点翻译表：旧代码片段 → 新代码片段。
	// 来源：git diff 0.5.8.10..0.5.11.9 的破坏性 rename（官方 commit 逐条对照）。
	// 条目必须是"足够长的字面量片段"，避免短词全局误伤。
	// 新增 rename 时：从 git 历史确认旧片段 → 新片段的对应关系后加到这里。
	// 文件名级条目同时用于 patch 规则 fileName 的翻译（旧文件名 → 新文件名）。
	const PATCH_REDIRECT = [
		// 文件级 rename（git 记录的 4 个 + susato 案例的 0.5.8 前叫法）
		['canvasmodel-00-data.js', '00-canvasmodel-data.js'],
		['00-base-canvas.js', 'base-canvas.js'],
		['weather-generation.js', 'weather-config.js'],
		// c202e5f0c: ZIndices 改名
		['ZIndices.bg', 'ZIndices.background'],
		['ZIndices.precipitationFront', 'ZIndices.foreground'],
		['bg: 0,', 'background: 0,'],
		['bg: 0.5,', 'background: 0.5,'],
		['precipitationFront:', 'foreground:'],
	];

	// 统计
	let redirectedMods = 0;
	let redirectedRules = 0;

	function translateText(s) {
		let r = s;
		for (const [oldStr, newStr] of PATCH_REDIRECT) {
			if (r.indexOf(oldStr) !== -1) {
				r = r.split(oldStr).join(newStr);
			}
		}
		return r;
	}

	// 重写一个 ReplacePatcher 实例的全部规则
	function redirectInstance(instance, modName) {
		let changed = 0;
		const map = instance.patchInfoMap;
		if (!map) return 0;
		for (const kind of ['js', 'css', 'twee']) {
			const kindMap = map[kind];
			if (!kindMap) continue;
			// 1. fileName 翻译：key 旧文件名 → 新文件名
			for (const [file, items] of [...kindMap.entries()]) {
				const nf = translateText(file);
				if (nf === file) continue;
				kindMap.delete(file);
				if (!kindMap.has(nf)) kindMap.set(nf, []);
				kindMap.get(nf).push(...items);
				changed += items.length;
				console.log('[GenesisCompat] patch fileName redirect:', modName, file, '->', nf);
			}
			// 2. from/to 文本翻译
			for (const [file, items] of kindMap) {
				for (const item of items) {
					if (typeof item.from === 'string') {
						const nf = translateText(item.from);
						if (nf !== item.from) { item.from = nf; changed += 1; }
					}
					if (typeof item.to === 'string') {
						const nt = translateText(item.to);
						if (nt !== item.to) { item.to = nt; changed += 1; }
					}
				}
			}
		}
		return changed;
	}

	// afterModLoad：mod 加载完成（replacePatcher 已构造），patch 应用前
	function afterModLoad(bootJson, zip, modInfo) {
		if (!modInfo || !modInfo.bootJson || !modInfo.bootJson.compat) return;
		const cmp = window.GenesisCompatCompareVersion;
		if (!cmp) return;
		if (cmp(modInfo.bootJson.compat, COMPAT_FLOOR) >= 0) return;
		const patchers = modInfo.replacePatcher || [];
		if (!patchers.length) return;
		let total = 0;
		for (const rp of patchers) {
			total += redirectInstance(rp, modInfo.name);
		}
		if (total > 0) {
			redirectedMods += 1;
			redirectedRules += total;
			console.log('[GenesisCompat] patch redirect:', modInfo.name, 'rules', total);
		}
	}

	// 注册到 ModLoader 生命周期钩子
	function startHook() {
		const tryHook = function () {
			if (!window.modUtils || !window.modUtils.getModLoadController) return false;
			const controller = window.modUtils.getModLoadController();
			if (!controller || !controller.addLifeTimeCircleHook) return false;
			controller.addLifeTimeCircleHook('genesis-compat-patch-redirect', {
				afterModLoad: afterModLoad,
			});
			console.log('[GenesisCompat] patch-redirect hooked');
			return true;
		};
		if (tryHook()) return;
		// modUtils 未就绪：轮询
		const timer = setInterval(function () {
			if (tryHook()) clearInterval(timer);
		}, 200);
		// 超时放弃（30s）
		setTimeout(function () { clearInterval(timer); }, 30000);
	}

	// 注册到变更注册表
	if (window.GenesisCompatRegisterApply) {
		window.GenesisCompatRegisterApply('patch:anchor-redirect', function () {
			return redirectedMods > 0 ? 'redirected ' + redirectedRules + ' rules in ' + redirectedMods + ' mods' : 'no-patch-rules';
		});
	}

	startHook();
})();
