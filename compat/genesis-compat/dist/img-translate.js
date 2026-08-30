// GenesisCompat 图片 key 翻译。
// 旧 mod（boot.json 声明 compat 字符串版本号）的图 key 是 0.5.8 命名，主线 0.5.11 请求新命名。
// mod 加载后把图 key 翻译成新命名，主线请求直接命中旧包图。规则级翻译，零动态维护。
// 两条图注册链都要翻：
//   imgFileList 包 → modInfo.imgs（afterModLoad 时翻，先于查表构建）
//   BSA 包（addonPlugin）→ BSA imgList（whenSC2PassageInit 时翻，BSA 异步扫描完成后收敛）
// mask-{integrity} 别名：0.5.8 单张 mask.png → 0.5.11 按破损状态四张，两条链都注册别名。
(function () {
	'use strict';

	const COMPAT_FLOOR = '0.5.9';
	const MASK_STATES = ['full', 'frayed', 'tattered', 'torn'];

	function compareVersion(a, b) {
		const pa = String(a).split('.').map((x) => parseInt(x, 10) || 0);
		const pb = String(b).split('.').map((x) => parseInt(x, 10) || 0);
		for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
			const x = pa[i] || 0, y = pb[i] || 0;
			if (x !== y) return x - y;
		}
		return 0;
	}

	function isLegacyMod(modInfo) {
		const compat = modInfo && modInfo.bootJson && modInfo.bootJson.compat;
		// 只认字符串版本号（"0.5.8"）。数组/对象（ModLoader revive 格式等）不是本层声明，不碰。
		if (typeof compat !== 'string') return false;
		if (!/^\d+(\.\d+)*$/.test(compat.trim())) return false;
		return compareVersion(compat, COMPAT_FLOOR) < 0;
	}

	// 翻译单个路径。兼容带 mod 前缀的 key（AUandrogynous/img/...）：剥前缀翻 img/ 段再拼回。
	function translatePath(p) {
		const tr = window.GenesisCompatTranslate58to511;
		if (!tr || typeof p !== 'string') return null;
		const idx = p.indexOf('img/');
		if (idx > 0) {
			const t = tr(p.slice(idx));
			return t ? p.slice(0, idx) + t : null;
		}
		return tr(p);
	}

	// 主名 → 同图别名列表（0.5.11 状态拆分：hard/soft 等共享旧版单图），带前缀拼接。
	function getAliases(newPath) {
		const aliases = window.GenesisCompatAliases58to511;
		if (!aliases) return null;
		const idx = newPath.indexOf('img/');
		const key = idx > 0 ? newPath.slice(idx) : newPath;
		const list = aliases[key];
		if (!list) return null;
		const prefix = idx > 0 ? newPath.slice(0, idx) : '';
		return list.map((a) => prefix + a);
	}

	let totalTranslated = 0;

	function noteTranslated(name, count) {
		if (count > 0) {
			totalTranslated += count;
			console.log('[GenesisCompat] translated ' + count + ' keys in ' + name + ' (total ' + totalTranslated + ')');
			const tel = window.__LTS_TELEMETRY__;
			if (tel && tel.stats) tel.stats.sandbox.translateHits = totalTranslated;
		}
	}

	// imgFileList 链：翻 imgs[].path；mask.png 注册四状态别名（共享 getter，从 zip 读同一张图）。
	function translateImgs(modInfo) {
		let count = 0;
		for (const img of [...(modInfo.imgs || [])]) {
			const t = translatePath(img.path);
			if (t) {
				img.path = t;
				count += 1;
				const aliases = getAliases(t);
				if (aliases) {
					for (const alias of aliases) {
						modInfo.imgs.push({ path: alias, getter: img.getter });
						count += 1;
					}
				}
			}
			if (/\/mask\.png$/.test(img.path)) {
				for (const state of MASK_STATES) {
					modInfo.imgs.push({ path: img.path.replace(/mask\.png$/, 'mask-' + state + '.png'), getter: img.getter });
					count += 1;
				}
			}
		}
		return count;
	}

	function afterModLoad(bootJson, zip, modInfo) {
		if (!isLegacyMod(modInfo)) return;
		noteTranslated(modInfo.name, translateImgs(modInfo));
	}

	// BSA 链：翻 imgList key（value 不动）；mask.png 注册四状态别名（同一 value）。
	// BSA 图扫描是异步的（写 IndexedDB），imgList 逐步填充——连续两轮无新翻译才停。
	let bsaSettled = 0;
	function translateBsaImgList() {
		if (bsaSettled >= 2) return 0;
		const bsa = window.addonBeautySelectorAddon;
		if (!bsa || !bsa.getTypeOrder) return 0;
		let roundCount = 0;
		try {
			for (const item of bsa.getTypeOrder()) {
				// item.modRef = BSA 的 type 注册结构 {name, mod, modZip, typeImg}，modRef.mod 就是 modInfo。
				const modInfo = item.modRef && item.modRef.mod ? item.modRef.mod : null;
				if (!isLegacyMod(modInfo)) continue;
				const imgList = item.imgListRef;
				if (!imgList) continue;
				let count = 0;
				for (const key of [...imgList.keys()]) {
					const sk = String(key);
					const t = translatePath(sk);
					if (t && t !== sk) {
						const v = imgList.get(key);
						imgList.set(t, v);
						imgList.delete(key);
						count += 1;
						const aliases = getAliases(t);
						if (aliases) {
							for (const alias of aliases) {
								if (!imgList.has(alias)) {
									imgList.set(alias, v);
									count += 1;
								}
							}
						}
					}
				}
				for (const key of [...imgList.keys()]) {
					const sk = String(key);
					if (!/\/mask\.png$/.test(sk)) continue;
					for (const state of MASK_STATES) {
						const alias = sk.replace(/mask\.png$/, 'mask-' + state + '.png');
						if (!imgList.has(alias)) {   // 幂等：已注册的别名不重算，收敛依赖 count=0
							imgList.set(alias, imgList.get(key));
							count += 1;
						}
					}
				}
				noteTranslated((modInfo && modInfo.name) || '?', count);
				roundCount += count;
			}
		} catch (e) {
			console.warn('[GenesisCompat] bsa translate error:', e);
		}
		if (roundCount === 0) bsaSettled += 1; else bsaSettled = 0;
		return roundCount;
	}

	function startHook() {
		// afterModLoad 生命周期钩子（ModLoader 官方"modify a mod"扩展点）
		const tryHook = function () {
			if (!window.modUtils || !window.modUtils.getModLoadController) return false;
			const controller = window.modUtils.getModLoadController();
			if (!controller || !controller.addLifeTimeCircleHook) return false;
			controller.addLifeTimeCircleHook('genesis-compat-img-translate', { afterModLoad: afterModLoad });
			return true;
		};
		if (!tryHook()) {
			const timer = setInterval(function () {
				if (tryHook()) clearInterval(timer);
			}, 200);
			setTimeout(function () { clearInterval(timer); }, 30000);
		}
		// BSA 时机：whenSC2PassageInit（游戏 JS 已执行、BSA 注册开始、第一次渲染前）
		const sc2 = window.modSC2DataManager;
		if (sc2 && sc2.getSc2EventTracer) {
			sc2.getSc2EventTracer().addCallback({
				whenSC2PassageInit: translateBsaImgList,
			});
		}
	}

	startHook();
})();
