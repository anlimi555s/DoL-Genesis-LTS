// 复现 arm srcfn TypeError：真实形状 mock，跑沙盒 upper_rightarm 的 showfn/srcfn
const fs = require('fs');
const vm = require('vm');

const src = fs.readFileSync('compat/genesis-compat/dist/retro-env.js', 'utf8');
const deepProxy = (label) => new Proxy(function () { return deepProxy(label); }, {
	get: (t, k) => k === Symbol.toPrimitive ? () => '[mock]' : deepProxy(label + '.' + String(k)),
	apply: () => deepProxy(label + '()'),
	set: () => true,
});
const sandboxCtx = { window: {}, console };
sandboxCtx.window = sandboxCtx;
vm.createContext(sandboxCtx);
vm.runInContext(src, sandboxCtx, { filename: 'retro-env.js' });

// 真实 V mock：worn 有值
const V = {
	worn: {
		upper: { altsleeve: 'alt', index: 1, alt: 'alt', pattern: '', integrity: 'full', setup: {} },
	},
};
const env = sandboxCtx.GenesisCompatRetroEnv(V, deepProxy('setup'), deepProxy('T'), deepProxy('Renderer'), deepProxy('Utils'), deepProxy('Errors'), deepProxy('ZIndices'), deepProxy('State'), deepProxy('Time'), deepProxy('Story'), deepProxy('passage'));
const layer = env.layers.layers.upper_rightarm;
console.log('upper_rightarm:', typeof layer.srcfn, typeof layer.showfn, typeof layer.filtersfn);

// 0.5.11 形状的 options mock（worn 结构按 0.5.11）
function makeOptions(wornDef) {
	return {
		show_clothes: true,
		alt_override: false,
		alt_sleeve_state: undefined,
		arm_left: 'idle',
		arm_right: 'idle',
		handheld_position: undefined,
		worn: wornDef,
		filters: {},
	};
}
const setup58 = {
	altposition: 'cover',
	altdisabled: ['full'],
	sleeve_colour: 'primary',
	sleeve_img: 1,
	variable: 'tshirt',
	pattern_layer: 'primary',
};
const worn58 = { upper: { index: 1, alt: 'alt', pattern: '', setup: setup58 } };
const opts = makeOptions(worn58);

try {
	console.log('showfn:', layer.showfn(opts));
} catch (e) { console.log('showfn 炸:', e.message); }
try {
	// 层对象作为 this（模拟 propeval 的 layer[fnkey](options)）
	const layerCtx = Object.assign({}, layer);
	console.log('srcfn:', layer.srcfn.call(layerCtx, opts));
} catch (e) {
	console.log('srcfn 炸:', e.message);
	console.log(e.stack.split('\n').slice(0, 4).join('\n'));
}
// 对比：worn 缺失场景
const opts2 = makeOptions(undefined);
try { console.log('showfn(worn=undefined):', layer.showfn(opts2)); } catch (e) { console.log('showfn(worn=undefined) 炸:', e.message); }
try { const layerCtx = Object.assign({}, layer); console.log('srcfn(worn=undefined):', layer.srcfn.call(layerCtx, opts2)); } catch (e) { console.log('srcfn(worn=undefined) 炸:', e.message); }
