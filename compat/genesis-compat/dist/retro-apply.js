// GenesisCompat 回退渲染应用引擎。
// 检测声明 compat 的老包 → 按组把 CanvasModels.main 的图层替换为 0.5.8 版本
// （retro-model.js 提供），并做 options 接缝适配（0.5.8 图层读 0.5.8 格式字段）。
// 完整路径二选一：人模组整体回退，不维护中间态。
(function () {
	'use strict';

	// 回退线：compat 声明低于 0.5.9 的包触发回退（0.5.4~0.5.8 是同一路径家族）
	const COMPAT_FLOOR = '0.5.9';
	let applied = false;
	let clothesApplied = false;

	function isLegacyMod(modInfo) {
		if (!(modInfo && modInfo.bootJson && modInfo.bootJson.compat)) return false;
		const cmp = window.GenesisCompatCompareVersion || function (a, b) {
			const pa = String(a).split('.').map((x) => parseInt(x, 10) || 0);
			const pb = String(b).split('.').map((x) => parseInt(x, 10) || 0);
			for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
				const x = pa[i] || 0, y = pb[i] || 0;
				if (x !== y) return x - y;
			}
			return 0;
		};
		return cmp(modInfo.bootJson.compat, COMPAT_FLOOR) < 0;
	}

	// 诊断：dump 双来源检测状态（检测失败时也能看到原因）
	function dumpLegacyState() {
		const out = {};
		const bsa = window.addonBeautySelectorAddon;
		out.bsa = !!bsa;
		if (bsa && bsa.getTypeOrder) {
			try {
				const order = bsa.getTypeOrder();
				out.typeOrderLen = order.length;
				out.bsaItems = order.map(function (item) {
					const modName = item.modRef && item.modRef.mod ? item.modRef.mod.name : null;
					const modInfo = modName && window.modUtils ? window.modUtils.getMod(modName) : null;
					const compat = modInfo && modInfo.bootJson ? modInfo.bootJson.compat : '(no-modInfo)';
					const imgList = item.imgListRef;
					let keyCount = 0, clothesKeyCount = 0, sampleKeys = [];
					if (imgList) {
						try {
							const keys = [...imgList.keys()].map(String);
							keyCount = keys.length;
							clothesKeyCount = keys.filter((k) => k.includes('clothes')).length;
							sampleKeys = keys.slice(0, 5);
						} catch (e) { sampleKeys = ['imgListRef error: ' + String(e).slice(0, 80)]; }
					} else {
						sampleKeys = ['imgListRef: ' + (imgList === undefined ? 'undefined' : typeof imgList)];
					}
					return { mod: modName, compat, keyCount, clothesKeyCount, sampleKeys };
				});
			} catch (e) { out.bsaErr = String(e).slice(0, 200); }
		}
		// ModLoader 来源：声明 compat 的 mod（ImageLoaderHook 老包）
		try {
			if (window.modUtils && window.modUtils.getModListName) {
				const names = window.modUtils.getModListName();
				out.mlModCount = names.length;
				out.mlLegacy = names.map(function (name) {
					const mod = window.modUtils.getMod(name);
					const compat = mod && mod.bootJson ? mod.bootJson.compat : null;
					if (!(compat && isLegacyMod(mod))) return null;
					const imgs = (mod.imgs || []).map(function (im) { return im.path; });
					return {
						mod: name,
						imgCount: imgs.length,
						humanoidPaths: imgs.filter(function (p) { return /img\/(body|face|hair|bodywriting|transformations)/.test(p); }).length,
						clothesPaths: imgs.filter(function (p) { return /img\/clothes/.test(p); }).length,
						sample: imgs.slice(0, 3),
					};
				}).filter(Boolean);
			} else {
				out.mlModCount = '(no modUtils)';
			}
		} catch (e) { out.mlErr = String(e).slice(0, 200); }
		return out;
	}

	// 触发检测：双来源取并集。
	// 来源 A（BSA 新式包）：typeOrder 里有声明 compat 的 type，imgListRef key 判定供图组。
	// 来源 B（ImageLoaderHook 老包）：ModLoader mod 列表里声明 compat，modInfo.imgs 路径判定供图组。
	function legacyBsAItems() {
		const bsa = window.addonBeautySelectorAddon;
		if (!bsa || !bsa.getTypeOrder) return [];
		try {
			const out = [];
			for (const item of bsa.getTypeOrder()) {
				const modName = item.modRef && item.modRef.mod ? item.modRef.mod.name : null;
				if (modName && isLegacyMod(window.modUtils.getMod(modName))) {
					out.push({ source: 'bsa', item: item });
				}
			}
			return out;
		} catch (e) { return []; }
	}
	function legacyModLoaderMods() {
		if (!window.modUtils || !window.modUtils.getModListName) return [];
		try {
			const out = [];
			for (const name of window.modUtils.getModListName()) {
				const mod = window.modUtils.getMod(name);
				if (isLegacyMod(mod)) out.push({ source: 'modloader', mod: mod });
			}
			return out;
		} catch (e) { return []; }
	}
	function hasPath(list, re) {
		return list.some((p) => re.test(String(p)));
	}
	// BSA 型：imgListRef key 判定
	function bsaSuppliesHumanoid(item) {
		const imgList = item.imgListRef;
		if (!imgList) return false;
		try { return hasPath([...imgList.keys()], /img\/(body|face|hair|bodywriting|transformations)/); } catch (e) { return false; }
	}
	function bsaSuppliesClothes(item) {
		const imgList = item.imgListRef;
		if (!imgList) return false;
		try { return hasPath([...imgList.keys()], /img\/clothes/); } catch (e) { return false; }
	}
	// ModLoader 型：modInfo.imgs 路径判定（imgFileList 加载后的实际图列表）
	function mlSuppliesHumanoid(mod) {
		return hasPath((mod.imgs || []).map((im) => im.path), /img\/(body|face|hair|bodywriting|transformations)/);
	}
	function mlSuppliesClothes(mod) {
		return hasPath((mod.imgs || []).map((im) => im.path), /img\/clothes/);
	}
	function hasLegacyHumanoid() {
		for (const e of legacyBsAItems()) { if (bsaSuppliesHumanoid(e.item)) return true; }
		for (const e of legacyModLoaderMods()) { if (mlSuppliesHumanoid(e.mod)) return true; }
		return false;
	}
	function hasLegacyClothes() {
		for (const e of legacyBsAItems()) { if (bsaSuppliesClothes(e.item)) return true; }
		for (const e of legacyModLoaderMods()) { if (mlSuppliesClothes(e.mod)) return true; }
		return false;
	}

	// options 接缝适配：用 V 按 0.5.8 公式重算 0.5.8 图层需要的字段。
	function retroHumanoidPreprocess(options) {
		const V = window.V;
		const setup = window.setup;
		if (!V) return;

		// penis：0.5.8 格式（virgin/default + 尺寸，两版 penissize 语义一致）
		if (V.player.penisExist) {
			options.penis_size = Math.clamp(V.player.penissize, -2, 4);
			options.penis = V.player.virginity.penile === true ? 'virgin' : 'default';
			options.penis_parasite = V.parasite.penis.name;
		}
		if (V.player.vaginaExist) {
			options.clit_parasite = V.parasite.clit.name;
		}
		// ear slime（0.5.8 的 parasitem/parasite 切换）
		if (options.penis_parasite === 'parasite' || options.clit_parasite === 'parasite') {
			options.clit_parasite = V.earSlime.focus === 'impregnation' ? 'parasitem' : 'parasite';
			if (V.player.penisExist && V.player.ballsExist && V.player.penissize >= -1) {
				options.penis_parasite = 'parasite';
			} else {
				options.penis_parasite = '';
			}
		}

		// cum：0.5.8 大写 dripspeeds + 合并档位表
		if (setup && setup.bodyliquid) {
			const dripspeeds = ['', 'Start', 'VerySlow', 'Slow', 'Fast', 'VeryFast'];
			options.drip_vaginal = dripspeeds[Math.clamp(setup.bodyliquid.combined('vagina'), 0, 5)];
			options.drip_anal = dripspeeds[Math.clamp(setup.bodyliquid.combined('anus'), 0, 5)];
			options.drip_mouth = dripspeeds[Math.clamp(setup.bodyliquid.combined('mouth'), 0, 5)];
			const cumsprite = {
				chest: [null, '1', '2', '3', '4,5', '4,5'],
				face: [null, '1,2', '1,2', '3,4', '3,4', '5'],
				feet: [null, null, '2,3', '2,3', '4,5', '4,5'],
				leftarm: [null, '1,2,3', '1,2,3', '1,2,3', '4,5', '4,5'],
				rightarm: [null, '1,2,3', '1,2,3', '1,2,3', '4,5', '4,5'],
				neck: [null, '1,2', '1,2', '3,4', '3,4', '5'],
				thigh: [null, '1', '2', '3', '4', '5'],
				tummy: [null, '1', '2', '3', '4', '5'],
			};
			for (const bp of ['chest', 'face', 'feet', 'leftarm', 'rightarm', 'neck', 'thigh', 'tummy']) {
				const amt = Math.clamp(setup.bodyliquid.combined(bp), 0, 5);
				options['cum_' + bp] = cumsprite[bp][amt];
			}
		}

		// TF 耳朵/尾巴：0.5.11 宏做了空格→连字符，0.5.8 用 V 原值
		if (V.transformationParts && V.transformationParts.cow) {
			options.cow_tail_type = V.transformationParts.cow.tail;
			options.cow_ears_type = V.transformationParts.cow.ears;
		}
		// 花瓣颜色：0.5.8 命名 redWhite
		if (options.petalColour === 'red-white') {
			options.petalColour = 'redWhite';
		}
	}

	// 图层替换：def 里有的字段覆盖 target 对应字段，def 没有的保留 0.5.11 字段
	function replaceLayerFields(target, def) {
		let changed = 0;
		for (const key of ['srcfn', 'showfn', 'zfn', 'masksrcfn', 'filters']) {
			if (def[key] !== undefined) {
				target[key] = def[key];
				changed += 1;
			}
		}
		return changed;
	}

	// ZIndices 字段改名兼容（0.5.11 改名 bg→background、precipitationFront→foreground）。
	// 0.5.8 模型的 z 值直接引用旧字段名，求值前必须补上别名，否则 z = undefined。
	function patchZIndicesAliases() {
		if (!window.ZIndices) return;
		if (window.ZIndices.bg === undefined && window.ZIndices.background !== undefined) window.ZIndices.bg = window.ZIndices.background;
		if (window.ZIndices.precipitationFront === undefined && window.ZIndices.foreground !== undefined) window.ZIndices.precipitationFront = window.ZIndices.foreground;
	}

	function applyHumanoidRetro(tag) {
		if (!tag) tag = 'registry';
		if (applied) return 'already';
		const check = hasLegacyHumanoid();
		if (!check) return 'no-trigger';
		const model = window.Renderer && window.Renderer.CanvasModels && window.Renderer.CanvasModels.main;
		if (!model || !model.layers) return 'no-model';
		const retro = window.GenesisCompatRetroModel;
		if (!retro) return 'no-retro';
		const helpers = retro.helpers || {};

			// 1. ZIndices 旧字段名兼容（工厂求值前必须）
		patchZIndicesAliases();

		// 2. 全局辅助函数恢复为 0.5.8 版本。
		// 官方 0.5.11 删除了这些全局函数（c202e5f0c 等），但老包自带脚本会在运行时调用它们——
		// 不挂回 window，老包脚本直接 ReferenceError（genlayer_wings_cover is not defined 就是这类）。
		let helperCount = 0;
		for (const fnName of ['getWritingImgPath', 'getWritingImgPathArrow', 'genlayer_breath', 'genlayer_effect', 'genlayer_wings_cover', 'gray_suffix']) {
			if (typeof helpers[fnName] === 'function') {
				window[fnName] = helpers[fnName];
				helperCount += 1;
			}
		}

		// 3. preprocess 接缝适配（0.5.8 图层读 0.5.8 格式字段）
		const origPre = model.preprocess;
		model.preprocess = function (options) {
			if (origPre) origPre.call(this, options);
			retroHumanoidPreprocess(options);
		};

		// 4. 人模组图层替换（工厂函数延迟求值：ZIndices 等全局此时已就绪）
		let layerCount = 0;
		let humanoid = {};
		if (typeof retro.humanoid === 'function') {
			try {
				humanoid = retro.humanoid();
			} catch (e) {
				console.error('[GenesisCompat] retro humanoid factory failed:', e);
				humanoid = {};
			}
		} else {
			humanoid = retro.humanoid || {};
		}
		for (const name of Object.keys(humanoid)) {
			const target = model.layers[name];
			if (!target) continue;
			const def = humanoid[name];
			if (typeof def === 'function') {
				// 生成器调用条目：执行得到图层对象
				let obj;
				try {
					obj = def(helpers);
				} catch (e) {
					console.error('[GenesisCompat] retro gen layer failed:', name, e);
					continue;
				}
				if (obj) {
					layerCount += replaceLayerFields(target, obj);
				}
			} else if (typeof def === 'object' && def !== null) {
				layerCount += replaceLayerFields(target, def);
			}
		}

		applied = true;
		console.log('[GenesisCompat] retro humanoid APPLIED @' + tag + ': layers', layerCount, 'helpers', helperCount);
		return 'applied';
	}

	function applyClothesRetro(tag) {
		if (!tag) tag = 'registry';
		if (clothesApplied) return 'already';
		if (!hasLegacyClothes()) return 'no-trigger';
		const model = window.Renderer && window.Renderer.CanvasModels && window.Renderer.CanvasModels.main;
		if (!model || !model.layers) return 'no-model';
		const retro = window.GenesisCompatRetroModel;
		if (!retro) return 'no-retro';
		const helpers = retro.helpers || {};

		// ZIndices 旧字段名兼容（衣服组工厂求值前）
		patchZIndicesAliases();

		// gray_suffix（0.5.8 着色管线）全局替换
		if (typeof helpers.gray_suffix === 'function') {
			window.gray_suffix = helpers.gray_suffix;
		}

		// 衣服组图层替换
		let clothes = {};
		if (typeof retro.clothes === 'function') {
			try {
				clothes = retro.clothes();
			} catch (e) {
				console.error('[GenesisCompat] retro clothes factory failed:', e);
				clothes = {};
			}
		} else {
			clothes = retro.clothes || {};
		}
		let count = 0;
		for (const name of Object.keys(clothes)) {
			const target = model.layers[name];
			if (!target) continue;
			const def = clothes[name];
			if (typeof def === 'function') {
				let obj;
				try {
					obj = def(helpers);
				} catch (e) {
					console.error('[GenesisCompat] retro clothes gen layer failed:', name, e);
					continue;
				}
				if (obj) {
					count += replaceLayerFields(target, obj);
				}
			} else if (typeof def === 'object' && def !== null) {
				count += replaceLayerFields(target, def);
			}
		}

		clothesApplied = true;
		console.log('[GenesisCompat] retro clothes APPLIED @' + tag + ': layers', count);
		return 'applied';
	}

	// 一次尝试：两组都跑，返回状态对。检测失败时打 BSA 状态 dump（看清楚为什么没触发）
	let dumpCount = 0;
	function tryApplyBoth(tag) {
		const r1 = applyHumanoidRetro(tag);
		const r2 = applyClothesRetro(tag);
		if (r1 !== 'applied' && r1 !== 'already') {
			// 人模组未应用：打状态
			if (dumpCount < 6) {
				dumpCount += 1;
				console.log('[GenesisCompat] humanoid not applied @' + tag + ' (' + r1 + '):', JSON.stringify(dumpLegacyState()));
			}
		}
		if (r2 !== 'applied' && r2 !== 'already') {
			if (r2 !== r1 || dumpCount >= 6) {
				// 衣服组单独的状态 dump（关键：看到 legacy mod 的 clothes key 情况）
				console.log('[GenesisCompat] clothes not applied @' + tag + ' (' + r2 + '):', JSON.stringify(dumpLegacyState()));
			}
		}
		return { humanoid: r1, clothes: r2 };
	}

	// 延迟重试：BSA registerMod 是异步的（50MB 包解压写 IndexedDB），
	// whenSC2PassageInit 时 typeOrder 可能还没数据。重试直到两组都应用或次数耗尽。
	let retryTimes = 0;
	const RETRY_DELAYS = [1500, 5000, 15000, 30000, 60000];
	function scheduleRetry() {
		if (retryTimes >= RETRY_DELAYS.length) {
			console.log('[GenesisCompat] retry exhausted, final state:', JSON.stringify(dumpLegacyState()));
			return;
		}
		const delay = RETRY_DELAYS[retryTimes];
		retryTimes += 1;
		setTimeout(function () {
			const r = tryApplyBoth('retry' + retryTimes);
			if (r.humanoid !== 'applied' || r.clothes !== 'applied') scheduleRetry();
		}, delay);
	}

	// 注册到变更注册表
	if (window.GenesisCompatRegisterApply) {
		window.GenesisCompatRegisterApply('render:humanoid-group', applyHumanoidRetro);
		window.GenesisCompatRegisterApply('render:clothes-group', applyClothesRetro);
	}

	// 时机：whenSC2PassageInit（游戏 JS 已执行、CanvasModels.main 已注册、第一次渲染前）
	function startHook() {
		const sc2 = window.modSC2DataManager;
		if (sc2 && sc2.getSc2EventTracer) {
			sc2.getSc2EventTracer().addCallback({
				whenSC2PassageInit: function () {
					const r = tryApplyBoth('passageInit');
					if (r.humanoid !== 'applied' || r.clothes !== 'applied') scheduleRetry();
				},
			});
			return;
		}
		const timer = setInterval(function () {
			if (window.Renderer && window.Renderer.CanvasModels && window.Renderer.CanvasModels.main) {
				clearInterval(timer);
				const r = tryApplyBoth('poll');
				if (r.humanoid !== 'applied' || r.clothes !== 'applied') scheduleRetry();
			}
		}, 200);
	}

	startHook();
})();
