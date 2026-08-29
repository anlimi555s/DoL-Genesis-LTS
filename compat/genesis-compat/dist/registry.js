// GenesisCompat 变更注册表（changeId 体系）。
// 每条变更：id 唯一、introduced 标记引入版本、scope 作用域（组/数据）、apply 应用函数。
// 判定：mod 声明 compat 版本 < introduced → 该变更对声明 mod 启用。
// 参照 Android changeId（CompatibilityChangeInfo）：enableSinceTargetSdk 语义。
(function () {
	'use strict';

	// 版本比较：'0.5.8' vs '0.5.9' -> -1
	function compareVersion(a, b) {
		const pa = String(a).split('.').map((x) => parseInt(x, 10) || 0);
		const pb = String(b).split('.').map((x) => parseInt(x, 10) || 0);
		for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
			const x = pa[i] || 0;
			const y = pb[i] || 0;
			if (x !== y) return x - y;
		}
		return 0;
	}

	// 变更注册表。apply 函数由 retro-apply.js / migrate.js 注册。
	// 这里只放声明与数据，apply 在对应模块里挂上。
	window.GenesisCompatRegistry = [
		{ id: 'render:humanoid-group', introduced: '0.5.9', scope: 'group', apply: null },
		{ id: 'render:clothes-group', introduced: '0.5.9', scope: 'group', apply: null },
		{ id: 'data:covered-trait', introduced: '0.5.9', scope: 'data', apply: null },
		{ id: 'patch:anchor-redirect', introduced: '0.5.9', scope: 'patch', apply: null },
	];

	// 对某声明版本启用变更：declaredCompat < introduced
	window.GenesisCompatEnabled = function (declaredCompat) {
		return window.GenesisCompatRegistry.filter((c) => compareVersion(declaredCompat, c.introduced) < 0);
	};

	// 注册 apply 函数
	window.GenesisCompatRegisterApply = function (id, fn) {
		const entry = window.GenesisCompatRegistry.find((c) => c.id === id);
		if (entry) entry.apply = fn;
	};

	window.GenesisCompatCompareVersion = compareVersion;
})();
