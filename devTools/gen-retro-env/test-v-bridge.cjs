// 验证沙盒内 V 桥接：注入真实形状 V，跑沙盒 srcfn，看 V 是否可见
const fs = require('fs');
const vm = require('vm');

const src = fs.readFileSync('compat/genesis-compat/dist/retro-env.js', 'utf8');
const sandboxCtx = { window: {}, console };
sandboxCtx.window = sandboxCtx;
vm.createContext(sandboxCtx);
vm.runInContext(src, sandboxCtx, { filename: 'retro-env.js' });

// 真实形状 V
const V = {
	worn: { upper: { altsleeve: 'alt' } },
};
const deepProxy = (label) => new Proxy(function () { return deepProxy(label); }, {
	get: (t, k) => k === Symbol.toPrimitive ? () => '[mock]' : deepProxy(label + '.' + String(k)),
	apply: () => deepProxy(label + '()'),
	set: () => true,
});

sandboxCtx.window.GenesisCompatDiagSandbox = true;
sandboxCtx.window.__gcDiagSeen = {};

const env = sandboxCtx.GenesisCompatRetroEnv(V, deepProxy('setup'), deepProxy('T'), deepProxy('Renderer'), deepProxy('Utils'), deepProxy('Errors'), deepProxy('ZIndices'), deepProxy('State'), deepProxy('Time'), deepProxy('Story'), deepProxy('passage'));
const layer = env.layers.layers.upper_rightarm;
console.log('upper_rightarm srcfn:', typeof layer.srcfn);

// 真实形状 options（worn 有 upper）
const setup58 = { altposition: undefined, altdisabled: [], sleeve_colour: 'primary', sleeve_img: 1, variable: 'tshirt' };
const options = {
	show_clothes: true,
	alt_override: false,
	alt_sleeve_state: undefined,
	arm_left: 'idle',
	arm_right: 'idle',
	handheld_position: undefined,
	worn: { upper: { index: 1, alt: 'alt', pattern: '', setup: setup58, integrity: 'full' } },
	filters: {},
};
try {
	const layerCtx = Object.assign({}, layer);
	const r = layer.srcfn.call(layerCtx, options);
	console.log('srcfn 返回:', r);
} catch (e) {
	console.log('srcfn 炸:', e.message);
}
