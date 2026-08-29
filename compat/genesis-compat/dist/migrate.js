// GenesisCompat 数据迁移（非渲染变更）。
// covered trait：老数据 type:["covered"] -> 按槽位拆新 trait。
// 原版数据源已是新 trait，setup.clothes 里仍含 covered 的只会是老 mod 条目。
// 时机：:passageend（ModdedClothesAddon 在 whenSC2PassageInit 写入 setup.clothes，早于此事件）。
(function () {
	'use strict';

	const COVERED_MAP = {
		under_upper: 'torso_covering',
		under_lower: 'lower_covering',
		lower: 'overalls',
		face: 'face_covering',
	};

	function migrateCovered() {
		const setup = window.DOL && window.DOL.setup;
		if (!setup || !setup.clothes) return;
		let count = 0;
		for (const slot of Object.keys(setup.clothes)) {
			const arr = setup.clothes[slot];
			if (!Array.isArray(arr)) continue;
			for (const item of arr) {
				if (!item || !Array.isArray(item.type)) continue;
				const idx = item.type.indexOf('covered');
				if (idx === -1) continue;
				const itemSlot = item.slot || slot;
				const replacement = COVERED_MAP[itemSlot];
				if (replacement) {
					item.type.splice(idx, 1, replacement);
					count += 1;
					console.log('[GenesisCompat] migrate covered:', [item.name, itemSlot, replacement]);
				}
			}
		}
		if (count > 0) {
			console.log('[GenesisCompat] covered migrated:', count);
		}
	}

	if (window.GenesisCompatRegisterApply) {
		window.GenesisCompatRegisterApply('data:covered-trait', migrateCovered);
	}

	// 时机：第一个 passage 渲染结束后
	if (window.jQuery) {
		window.jQuery(document).one(':passageend', migrateCovered);
	} else {
		setTimeout(migrateCovered, 5000);
	}
})();
