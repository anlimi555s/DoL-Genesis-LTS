// 冒烟测试：mock 环境加载 retro-env.js 工厂，验证无 ReferenceError、导出结构完整
const fs = require('fs');
const vm = require('vm');

const src = fs.readFileSync('compat/genesis-compat/dist/retro-env.js', 'utf8');

// 无限深层 Proxy：读任何属性返回同构 Proxy（模拟 V/setup 等游戏对象）
const deepProxy = (label) => {
	const fn = () => deepProxy(label);
	fn.label = label;
	return new Proxy(fn, {
		get: (t, k) => {
			if (k === Symbol.toPrimitive) return () => '[mock:' + label + ']';
			if (k === 'label') return label;
			return deepProxy(label + '.' + String(k));
		},
		apply: () => deepProxy(label + '()'),
		construct: () => deepProxy('new ' + label),
		set: () => true,
	});
};

const sandboxCtx = {
	window: {},
	console,
	ZIndices: deepProxy('ZIndices'),
	// 工厂在 window 上挂 GenesisCompatRetroEnv
};
sandboxCtx.window = sandboxCtx;
vm.createContext(sandboxCtx);
vm.runInContext(src, sandboxCtx, { filename: 'retro-env.js' });

const factory = sandboxCtx.GenesisCompatRetroEnv;
console.log('工厂存在:', typeof factory === 'function');

try {
	const env = factory(deepProxy('V'), deepProxy('setup'), deepProxy('T'), deepProxy('Renderer'), deepProxy('Utils'), deepProxy('Errors'), deepProxy('ZIndices'), deepProxy('State'), deepProxy('Time'), deepProxy('Story'), deepProxy('passage'));
	console.log('工厂执行: OK（无 ReferenceError）');
	console.log('model 顶层键:', env.layers ? Object.keys(env.layers).join(', ') : 'NULL'); console.log('layers 层数:', env.layers && env.layers.layers ? Object.keys(env.layers.layers).length : 'NULL');
	console.log('buildBodyOptions:', typeof env.buildBodyOptions);
	console.log('buildClothesOptions:', typeof env.buildClothesOptions);
	console.log('globals 数量:', Object.keys(env.globals).length);
	console.log('globals 样例:', Object.keys(env.globals).slice(0, 8).join(', '));
	// 抽查关键层
	const layer = env.layers && env.layers.layers && env.layers.layers.lower;
	console.log('lower 层存在:', !!layer, layer ? '| srcfn:' + typeof layer.srcfn + ' showfn:' + typeof layer.showfn + ' zfn:' + typeof layer.zfn : '');
} catch (e) {
	console.log('工厂执行失败:', e.message.slice(0, 200));
	console.log(e.stack.split('\n').slice(0, 4).join('\n'));
}
