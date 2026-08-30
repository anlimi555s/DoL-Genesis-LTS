// GenesisCompat 出口路径翻译（0.5.8 路径 → 0.5.11 文件系统）。
// 实现：规则级翻译。规则来自渲染重命名研究，三类：
//   A 纯命名差：下划线折叠、数字后缀、arm 拆词/状态段、语义改名
//   B 行为变更+命名差：_gray 剥离（0.5.8 灰度图+hard-light 上色 → 0.5.11 原图+desaturate 上色，
//     灰度图内容正是 0.5.11 要的底图，主线滤镜天然兼容）
//   C 运行时状态依赖：mask-{integrity} 别名注册（见 img-translate.js，不在此处）
// 覆盖率与误翻由 devTools/gen-retro-env/audit-translate-coverage.cjs 审计。
// 未命中返回 null（调用方不动原路径）。
(function () {
	'use strict';

	// 语义改名映射（特性改名，git rename 记录）：旧名前缀 → 新名前缀。
	const SEMANTIC_RENAMES = [
		['breastsparasite', 'ear-slime'],
		['chestparasite', 'urchin'],
		['chestslime', 'slime'],
	];
	// 完整文件名语义改名
	const SEMANTIC_EXACT = {
		'img/ui/clothes/traits/covered.png': 'img/ui/clothes/traits/face-covering.png',
		// 0.5.8 身体寄生虫散文件 → 0.5.11 归入 parasites/ 目录（clit/tummy 前缀词序也变了）
		'img/body/cliturchin.png': 'img/body/parasites/urchin-clit.png',
		'img/body/clitslime.png': 'img/body/parasites/slime-clit.png',
		'img/body/tummyurchin.png': 'img/body/parasites/urchin-tummy.png',
		'img/body/tummyslime.png': 'img/body/parasites/slime-tummy.png',
		'img/body/parasitepanty.png': 'img/body/ear-slime-panties.png',
		'img/body/parasiteshorts.png': 'img/body/ear-slime-shorts.png',
		// belted 的两个 belt 文件状态怪异（git 实证：左变右、cover 脱落）
		'img/clothes/hands/belted/left_cover_belts_gray.png': 'img/clothes/hands/belted/right-cover-belts.png',
		'img/clothes/hands/belted/right_cover_belts_gray.png': 'img/clothes/hands/belted/right-idle-belts.png',
		'img/clothes/props/general/shoe-box.png': 'img/clothes/props/general/shoebox.png',
		'img/clothes/props/tending/hawk-egg.png': 'img/clothes/props/tending/hawk-egg-1.png',
		'img/ui/tf_fallenangel.png': 'img/ui/tf-fallen-angel.png',
		// 这几个 arm 形态例外：shirt/arm 修饰词不带 idle 状态段（git 实证）
		'img/clothes/upper/rosesuit/left_shirt.png': 'img/clothes/upper/rosesuit/left-shirt.png',
		'img/clothes/upper/rosesuit/right_shirt.png': 'img/clothes/upper/rosesuit/right-shirt.png',
		'img/clothes/upper/rosesuitfrilly/left_shirt.png': 'img/clothes/upper/rosesuitfrilly/left-shirt.png',
		'img/clothes/upper/rosesuitfrilly/right_shirt.png': 'img/clothes/upper/rosesuitfrilly/right-shirt.png',
		'img/clothes/props/npc/witchprisoner/left_arm.png': 'img/clothes/props/npc/witchprisoner/left-arm.png',
		'img/clothes/props/npc/witchprisoner/left_arm_alt.png': 'img/clothes/props/npc/witchprisoner/left-arm-alt.png',
		// git 实证的状态互换 / 怪异命名（按类挖完 clothes 后的全部残余例外）
		'img/clothes/hands/belted/hold_belts_gray.png': 'img/clothes/hands/belted/left-cover-belts.png',
		'img/clothes/hands/belted/right_belts_gray.png': 'img/clothes/hands/belted/right-hold-belts.png',
		'img/clothes/lower/open skort/acc_frayed_gray.png': 'img/clothes/lower/open skort/acc-full.png',
		'img/clothes/lower/open skort/acc_tattered_gray.png': 'img/clothes/lower/open skort/acc-torn.png',
		'img/clothes/handheld/parasolpaper/right-hold-acc.png': 'img/clothes/handheld/parasolpaper/right-hold-apricots-acc.png',
		'img/clothes/belly/belly_mask_upper_shadow.png': 'img/clothes/belly/belly-mask-upper-shadow-2.png',
		'img/clothes/belly/belly_mask_upper_shadow_2.png': 'img/clothes/belly/belly-mask-upper-shadow.png',
		'img/clothes/upper/winterjacket/left_acc_gray.png': 'img/clothes/upper/winterjacket/left-cover-acc.png',
		'img/clothes/upper/winterjacket/left_cover_acc_gray.png': 'img/clothes/upper/winterjacket/left-idle-acc.png',
		'img/clothes/under-upper/harnessbra/4-accl.png': 'img/clothes/under-upper/harnessbra/4-acc.png',
		'img/clothes/under-lower/harness panties/frayed-metal.png': 'img/clothes/under-lower/harness panties/acc.png',
	};

	// ===== body/penis 家族 =====
	// 0.5.8 尺寸 -2..4（7 档）→ 0.5.11 尺寸 0..6（整体 +2，git 证据：penisparasite0 → ear-slime-2）。
	// 0.5.11 按状态拆分 hard/soft、hard-virgin/soft-virgin、condom-hard/condom-soft——
	// 旧版每档只有一张图，翻译取主名，别名由 img-translate 层注册共享同一图（C 类）。
	// 目录：penisnoballs → penis-no-balls；penisparasite 盖住蛋蛋 → 归 penis-no-balls。
	const PENIS_KINDS = {
		penis: { dir: null, fam: 'hard' },
		penis_virgin: { dir: null, fam: 'hard-virgin' },
		condom: { dir: null, fam: 'condom-hard' },
		penisparasite: { dir: 'penis-no-balls', fam: 'ear-slime' },
		penisparasiteballs: { dir: 'penis', fam: 'ear-slime' },
	};
	// 主名 → 同图别名（0.5.11 状态拆分，旧版单图同时喂两个状态）
	const PENIS_ALIASES = {};
	for (const dir of ['penis', 'penis-no-balls']) {
		for (let n = 0; n <= 6; n++) {
			PENIS_ALIASES['img/body/' + dir + '/hard-' + n + '.png'] = ['img/body/' + dir + '/soft-' + n + '.png'];
			PENIS_ALIASES['img/body/' + dir + '/hard-virgin-' + n + '.png'] = ['img/body/' + dir + '/soft-virgin-' + n + '.png'];
		}
	}
	for (let n = 0; n <= 6; n++) {
		PENIS_ALIASES['img/body/penis/condom-hard-' + n + '.png'] = ['img/body/penis/condom-soft-' + n + '.png'];
	}

	function translatePenisFile(p) {
		const m = p.match(/^img\/body\/(penisnoballs|penis)\/(penis|penis_virgin|condom|penisparasite|penisparasiteballs)(-2|-1|\d+)\.png$/);
		if (!m) return null;
		const kind = PENIS_KINDS[m[2]];
		const dir = m[1] === 'penisnoballs' ? 'penis-no-balls' : 'penis';
		const n = parseInt(m[3], 10) + 2;
		const out = 'img/body/' + (kind.dir || dir) + '/' + kind.fam + '-' + n + '.png';
		return out === p ? null : out;
	}
	function translatePenisChastity(p) {
		// 0.5.8 三种贞操锁 → 0.5.11 单张 chastity.png
		if (/^img\/body\/penis\/penis_chastity(flat|small)?\.png$/.test(p)) return 'img/body/penis/chastity.png';
		return null;
	}

	// 数字后缀规则白名单目录（git rename 确认数字加连字符的目录；其余目录不翻数字后缀）
	const DIGIT_SUFFIX_DIRS = [
		'img/body/breasts/',
		'img/body/penis/',
		'img/body/penisnoballs/',
		'img/body/preggyBelly/',
		'img/body/mannequin/breasts/',
		'img/bodywriting/',
	];

	// 数字后缀是否适用：face/default 只翻根层（blush1/tear1），子目录 makeup（mascara1）不翻。
	function shouldDigitSuffix(p) {
		if (p.startsWith('img/face/default/')) {
			return p.split('/').length === 4;
		}
		return DIGIT_SUFFIX_DIRS.some((d) => p.startsWith(d));
	}

	function applyCommon(base) {
		// 前缀改名特例
		base = base.replace(/^basenoarms/, 'base');
		base = base.replace(/^basehead$/, 'base-head');
		// 词序调换特例（wraith_scars → scars-wraith）
		base = base.replace(/^wraith_scars$/, 'scars-wraith');
		// arm 拆词（leftarmidle→left-arm-idle、leftarmcover→left-arm-cover、rightarmhold→right-arm-hold）
		base = base.replace(/^(left|right)arm(idle|cover|hold)/, '$1-arm-$2');
		// 语义改名映射
		for (const [oldName, newName] of SEMANTIC_RENAMES) {
			if (base.startsWith(oldName)) base = newName + base.slice(oldName.length);
		}
		return base;
	}

	// 通用 arm 形态：0.5.8 的 {side}[_cover][_{modifier}][_acc]（_gray 已剥离）→
	// 0.5.11 的 {side}-{state}[-{modifier}][-acc]。
	// 状态：hold → right-hold（归属右手）；left/right → {side}-idle；_cover（可在修饰词前）→ cover 态。
	function translateArmState(core) {
		let body = core;
		let acc = '';
		if (body.endsWith('_acc')) { acc = '-acc'; body = body.slice(0, -4); }
		let side = '';
		let rest = body;
		if (rest.startsWith('hold')) { side = 'hold'; rest = rest.slice(4); }
		else if (rest.startsWith('left')) { side = 'left'; rest = rest.slice(4); }
		else if (rest.startsWith('right')) { side = 'right'; rest = rest.slice(5); }
		else return null;
		let cover = false;
		if (rest.startsWith('_cover')) { cover = true; rest = rest.slice(6); }
		let out;
		if (side === 'hold') out = 'right-' + (cover ? 'cover' : 'hold');
		else out = side + '-' + (cover ? 'cover' : 'idle');
		if (rest) out += rest.replace(/_/g, '-');
		return out + acc;
	}

	// handheld 状态段：0.5.8 的 {side}[_cover][_{color}][_acc] → 0.5.11 的 {side}-{state}[-{color}][-acc]。
	// 状态规律（git rename 归纳）：_cover 标记 → cover 态；无标记 → hold 态。
	// 例外目录（语义相反，普通 → cover）：candy cane/cane/crutch。
	// pompoms 的 left/right 是 idle 态，走 arm 规则。
	const HANDHELD_SWAP_DIRS = new Set(['candy cane', 'cane', 'crutch']);
	const HANDHELD_ARM_DIRS = new Set(['pompoms']);
	const HANDHELD_ACC_SWAP_DIRS = new Set(['backpack', 'star purse']);

	function translateHandheld(core, dirVar) {
		if (HANDHELD_ACC_SWAP_DIRS.has(dirVar)) {
			// 两个 acc 文件状态互换（git 实证的怪异命名）
			if (core.startsWith('right_acc')) return 'right-cover-acc';
			if (core.startsWith('right_cover_acc')) return 'right-hold-acc';
		}
		const acc = core.endsWith('_acc');
		const body = acc ? core.slice(0, -4) : core;
		const cover = /^(left|right)_cover(?:$|_)/.test(body);
		const swap = HANDHELD_SWAP_DIRS.has(dirVar);
		let state;
		if (cover) state = swap ? 'hold' : 'cover';
		else state = swap ? 'cover' : 'hold';
		const side = body.startsWith('left') ? 'left' : 'right';
		let rest = body.slice(side.length);
		if (rest.startsWith('_cover')) rest = rest.slice(6);
		let out = side + '-' + state + rest;
		if (acc) out += '-acc';
		return out;
	}

	// cum 组合档位 → 0.5.11 重编号档（"Face 5" → face-3 是重编号，不是取首数字）
	const CUM_STAGE_MAP = {
		'Chest 4,5': 'chest-4',
		'Face 1,2': 'face-1', 'Face 3,4': 'face-2', 'Face 5': 'face-3',
		'Feet 2,3': 'feet-1', 'Feet 4,5': 'feet-2',
		'Neck 1,2': 'neck-1', 'Neck 3,4': 'neck-2', 'Neck 5': 'neck-3',
		'Left Arm 1,2,3': 'left-arm-1', 'Left Arm 4,5': 'left-arm-2',
		'Right Arm 1,2,3': 'right-arm-1', 'Right Arm 4,5': 'right-arm-2',
	};

	// 人模/身体书写路径翻译：img/body img/face img/hair img/bodywriting 等非 clothes 前缀。
	function translateHumanoid58to511(p) {
		// cum 目录特规：0.5.8 是 VaginalCumDripStart.png / Chest 1.png，
		// 0.5.11 是 vaginal-start.png / chest-1.png。
		if (p.startsWith('img/body/cum/')) {
			const name = p.slice('img/body/cum/'.length);
			const isPng = name.endsWith('.png');
			let base = isPng ? name.slice(0, -4) : name;
			const ext = isPng ? '.png' : '';
			const drip = base.match(/^(Vaginal|Anal|Mouth)CumDrip(Start|VerySlow|Slow|Fast|VeryFast)$/);
			if (drip) {
				const speedMap = { Start: 'start', VerySlow: 'very-slow', Slow: 'slow', Fast: 'fast', VeryFast: 'very-fast' };
				base = drip[1].toLowerCase() + '-' + speedMap[drip[2]];
			} else if (CUM_STAGE_MAP[base]) {
				base = CUM_STAGE_MAP[base];
			} else {
				// 前缀词 + 空格 + 档位 → 小写连字符（Chest 1 → chest-1、Thighs 2 → thighs-2）
				base = base.replace(/^(Chest|Face|Feet|Left Arm|Right Arm|Neck|Thighs|Tummy) /, (m, w) => w.toLowerCase().replace(' ', '-') + '-');
			}
			const translated = 'img/body/cum/' + base + ext;
			return translated === p ? null : translated;
		}

		const parts = p.split('/');
		// 目录段折叠：hair 的类型名目录（old_hime）是变量名，不折叠；其余折叠。
		for (let i = 1; i < parts.length - 1; i++) {
			if (p.startsWith('img/hair/') && i >= 2) continue;
			parts[i] = parts[i].replace(/_/g, '-');
		}
		const name = parts[parts.length - 1];
		const isPng = name.endsWith('.png');
		let base = isPng ? name.slice(0, -4) : name;
		const ext = isPng ? '.png' : '';

		if (p.startsWith('img/body/mannequin/') && base === 'basenoarms') {
			base = 'base-body';  // mannequin 特规：basenoarms → base-body（不是 base）
		} else {
			base = applyCommon(base);
		}
		// breasts 罩杯中间档（curvy/slender 的 mid 档）→ 0.5.11 mask- 系列
		if (p.startsWith('img/body/breasts/') && base === 'urchin') base = 'urchin-6';  // 裸 urchin → 最大档
		if (p.startsWith('img/body/breasts/') && base === 'breasts-curvy-mid') base = 'mask-curvy-3-4';
		else if (p.startsWith('img/body/breasts/') && base === 'breasts-curvy') base = 'mask-curvy';
		else if (p.startsWith('img/body/breasts/') && base === 'breasts-slender-mid') base = 'mask-slender-3-4';
		else if (p.startsWith('img/body/breasts/') && base === 'breasts-slender') base = 'mask-slender';
		// 眼泪：face/default/tearN → tears-N（复数改名）
		if (p.startsWith('img/face/default/') && /^tear\d+$/.test(base)) base = 'tears-' + base.slice(4);
		// fallen 翅膀：classicfallenplus → classic-fallenplus（粘连词拆分）
		base = base.replace(/^(classic|cherub|harpy)fallenplus/, '$1-fallenplus');
		// clothed 变体
		const clothed = base.match(/^([a-z]+)(\d+)_clothed$/);
		if (clothed) base = 'clothed-' + clothed[2];
		// 数字后缀加连字符（限定目录，避免 makeup/mascara1 误翻）
		if (shouldDigitSuffix(p)) {
			base = base.replace(/([a-z])(\d+)$/, '$1-$2');
		}
		// _gray 剥离
		base = base.replace(/_gray$/, '');
		// 空格 → 连字符（仅 cow 的 "spotted black"；其余带空格文件名在 0.5.11 保持原样）
		if (p.startsWith('img/transformations/cow/')) base = base.replace(/ /g, '-');
		base = base.replace(/_/g, '-');

		parts[parts.length - 1] = base + ext;
		const translated = parts.join('/');
		return translated === p ? null : translated;
	}

	// misc/ambient 环境特效：CamelCase → 连字符小写（thunderstorm 是粘连词）、数字加连字符。
	function translateAmbient58to511(p) {
		if (!p.startsWith('img/misc/ambient/')) return null;
		const parts = p.split('/');
		const name = parts[parts.length - 1];
		if (!name.endsWith('.png')) return null;
		const core = name.slice(0, -4);
		let c2 = core.replace(/^thunderStorm/, 'thunderstorm');
		c2 = c2.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase().replace(/_/g, '-');
		c2 = c2.replace(/([a-z])(\d+)$/, '$1-$2');
		if (c2 === core) return null;
		parts[parts.length - 1] = c2 + '.png';
		return parts.join('/');
	}

	// 贞操笼寄生虫变体：0.5.8 在 clothes/genitals 下按笼型分目录放 slime/urchin 图，
	// 0.5.11 归入 body/parasites/ 的 {slime,urchin}-cage{,-fetish,-flat,-small}。
	const CAGE_PARASITE_SUFFIX = { chastitycage: '', chastitycagefetish: '-fetish', flatchastitycage: '-flat', smallchastitycage: '-small' };
	const GENITAL_EXACT = {
		'img/clothes/genitals/slimechastitycage/frayed-1.png': 'img/body/ear-slime-chastity-0.png',
		'img/clothes/genitals/slimechastitycage/full0.png': 'img/body/ear-slime-chastity-1.png',
		'img/clothes/genitals/slimechastitycage/full1.png': 'img/body/ear-slime-chastity-2.png',
		'img/clothes/genitals/slimechastitycage/full2.png': 'img/body/ear-slime-chastity-3.png',
	};
	function translateGenitalParasite(p) {
		if (GENITAL_EXACT[p]) return GENITAL_EXACT[p];
		const m = p.match(/^img\/clothes\/genitals\/(chastitycage|chastitycagefetish|flatchastitycage|smallchastitycage)\/(slime|urchin)\.png$/);
		if (!m) return null;
		return 'img/body/parasites/' + m[2] + '-cage' + CAGE_PARASITE_SUFFIX[m[1]] + '.png';
	}

	// img/ui/ 翻译：0.5.11 的 ui 文件名全部小写连字符（coin-copper、star-gold、wraith-active）。
	// 规则：coin/star/wolf/obsession/locket 特规 → 通用 CamelCase 拆分（含 all(alt) → all-alt）→ 下划线折叠。
	const UI_EXACT = {
		'img/ui/clothes/small_uarrow.png': 'img/ui/clothes/small-arrow.png',
		'img/ui/wrench.png': 'img/misc/icon/wrench.png',
		'img/ui/condom1.png': 'img/ui/condom.png',
		'img/ui/condom2.png': 'img/ui/condom.png',
		'img/ui/emptyspray.png': 'img/ui/pepper-spray-empty.png',
		'img/ui/icon_closed.png': 'img/ui/sidebar-closed.png',
		'img/ui/icon_day.png': 'img/ui/sidebar-day.png',
		'img/ui/icon_open.png': 'img/ui/sidebar-open.png',
		'img/ui/closedeye.png': 'img/ui/sidebar-closed.png',
		'img/ui/eye.png': 'img/ui/sidebar-open.png',
		'img/ui/wideclosedeye.png': 'img/ui/sidebar-day.png',
	};
	function translateUi58to511(p) {
		if (UI_EXACT[p]) return UI_EXACT[p];
		const parts = p.split('/');
		const name = parts[parts.length - 1];
		if (!name.endsWith('.png') && !name.endsWith('.gif')) return null;
		let core = name.slice(0, -4);
		const ext = name.slice(-4);
		let changed = false;
		let m;
		if ((m = core.match(/^(Copper|Gold|Silver|Platinum|Jeweled)Coin(Fake|Dull)?$/))) {
			core = 'coin-' + m[1].toLowerCase() + (m[2] ? '-' + m[2].toLowerCase() : '');
			changed = true;
		} else if ((m = core.match(/^(platinum|silver)-coin(-(fake|dull))?$/))) {
			// 0.5.8 内部的中间态名（PlatinumCoin → platinum-coin → coin-platinum 链）
			core = 'coin-' + m[1] + (m[3] ? '-' + m[3] : '');
			changed = true;
		} else if ((m = core.match(/^(gold|bronze|silver|empty)_star$/))) {
			core = 'star-' + m[1];
			changed = true;
		} else if ((m = core.match(/^wolf(ferocity|harmony)$/))) {
			core = 'sym-' + m[1];
			changed = true;
		} else if (core.startsWith('obsession')) {
			core = 'sym-obsession' + (core.length > 9 ? '-' + core.slice(9) : '');
			changed = true;
		} else if ((m = core.match(/^locket_photo_(bronze|gold|silver|rose_gold)$/))) {
			core = 'locket-' + m[1].replace(/_/g, '-') + '-photo';
			changed = true;
		} else if ((m = core.match(/^wraith(active|despair|haunt)$/))) {
			core = 'wraith-' + m[1];
			changed = true;
		} else if ((m = core.match(/^(over|under)(outfit|lower|upper)$/))) {
			core = m[1] + '-' + m[2];
			changed = true;
		} else if (core === 'coldresistance') {
			core = 'cold-resistance';
			changed = true;
		} else if (core === 'pepperspray') {
			core = 'pepper-spray';
			changed = true;
		} else {
			let c2 = core.replace(/\(([^)]+)\)/g, '-$1');
			if (!c2.includes('-')) c2 = c2.replace(/([a-z0-9])([A-Z])/g, '$1-$2');
			c2 = c2.toLowerCase().replace(/_/g, '-');
			if (c2 !== core) { core = c2; changed = true; }
		}
		if (!changed) return null;
		parts[parts.length - 1] = core + ext;
		return parts.join('/');
	}

	// 孕肚：preggyBelly/pregnancy_belly_N → pregnant-belly/N（目录改名 + 文件名去掉前缀）
	function translatePreggyBelly(p) {
		const m = p.match(/^img\/body\/preggyBelly\/pregnancy_belly_(\d+)\.png$/);
		if (!m) return null;
		return 'img/body/pregnant-belly/' + m[1] + '.png';
	}

	// phair balls 档位：0.5.8 的 -2/-1/0/1/2 → 0.5.11 的 0/1/2/3/4（档位体系整体 +2）
	function translatePhairBalls(p) {
		if (!p.startsWith('img/hair/phair/balls/')) return null;
		const m = p.match(/^img\/hair\/phair\/balls\/(-2|-1|\d+)_(pb\d+)\.png$/);
		if (!m) return null;
		const n = parseInt(m[1], 10) + 2;
		return 'img/hair/phair/balls/' + n + '-' + m[2] + '.png';
	}

	// 衣物路径翻译：img/clothes/ 前缀。
	// 目录规则：只有 slot 段（parts[2]：over_upper→over-upper）折叠；
	// 变量名目录（parts[3]）是衣服变量名，0.5.11 仍保留下划线（fur_boots 两版同名），不折叠。
	function translateClothes58to511(p) {
		const parts = p.split('/');
		if (parts.length < 4) return null;
		// swimshirt 槽位移：0.5.8 有 upper 版，0.5.11 只在 under-upper
		if (parts[2] === 'upper' && parts[3] === 'swimshirt') parts[2] = 'under_upper';
		// 目录级改名（git 实证）：pajama→pyjama 英式拼写、harness garter 组合名去掉 harness
		const DIR_RENAMES = {
			'sheer lace pajama': 'sheer lace pyjama',
			'harness garter and fishnet stockings': 'fishnet garter stockings',
			'harness garter and striped stockings': 'striped garter stockings',
		};
		if (DIR_RENAMES[parts[3]]) parts[3] = DIR_RENAMES[parts[3]];
		const isHandheld = parts[2] === 'handheld';
		const dirVar = parts[3] || '';
		parts[2] = parts[2].replace(/_/g, '-');
		let name = parts.pop();
		const isPng = name.endsWith('.png');
		const base0 = isPng ? name.slice(0, -4) : name;
		const ext = isPng ? '.png' : '';
		let core = base0;
		let suffix = '';
		if (base0.endsWith('_alt')) { core = base0.slice(0, -4); suffix = '-alt'; }
		// _gray 剥离
		core = core.replace(/_gray$/, '');
		// ao dai 裸 acc 名：0.5.8 无前缀配件图 → 0.5.11 acc- 前缀
		//（排除数字档位、已有 acc-、以及 frayed/full/left 等状态词）
		const AO_DAI_BARE_ACC = /^(frayed|full|tattered|torn|left|right|hold|back)(_|$)/;
		if ((dirVar === 'ao dai' || dirVar === 'ao dai2') && !/^\d/.test(core) && !core.startsWith('acc') && !AO_DAI_BARE_ACC.test(core)) core = 'acc-' + core;
		if (isHandheld && /^(left|right)/.test(core)) {
			core = HANDHELD_ARM_DIRS.has(dirVar) ? translateArmState(core) : translateHandheld(core, dirVar);
		} else if (/^(left|right|hold)(_|$)/.test(core) || /^(left|right)-alt(?:-|$)/.test(core)) {
			// 通用 arm 形态：0.5.8 的 {side}[_{modifier}][_acc][_gray] →
			// 0.5.11 的 {side}-{state}[-{modifier}][-acc]；hold 归属右手，状态段显式化。
			// 连字符形态只认 -alt（kimono/schoolcardigan 的 left-alt → left-idle-alt）。
			core = translateArmState(core);
		}
		core = core.replace(/_/g, '-');
		parts.push(core + suffix + ext);
		const translated = parts.join('/');
		return translated === p ? null : translated;
	}

	// 0.5.8 → 0.5.11 路径翻译（翻译无变化返回 null）
	function translate58to511(p) {
		if (typeof p !== 'string') return null;
		if (SEMANTIC_EXACT[p]) return SEMANTIC_EXACT[p];
		const phair = translatePhairBalls(p);
		if (phair) return phair;
		const penis = translatePenisFile(p) || translatePenisChastity(p);
		if (penis) return penis;
		const preggy = translatePreggyBelly(p);
		if (preggy) return preggy;
		const genital = translateGenitalParasite(p);
		if (genital) return genital;
		if (p.startsWith('img/clothes/')) return translateClothes58to511(p);
		if (p.startsWith('img/ui/')) {
			const t = translateUi58to511(p);
			if (t) return t;
		}
		if (p.startsWith('img/misc/ambient/')) {
			const t = translateAmbient58to511(p);
			if (t) return t;
		}
		if (p.startsWith('img/')) return translateHumanoid58to511(p);
		return null;
	}
	window.GenesisCompatTranslate58to511 = translate58to511;
	window.GenesisCompatAliases58to511 = PENIS_ALIASES;
})();
