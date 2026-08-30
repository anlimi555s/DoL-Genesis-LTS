// test-overlay：验证沙盒 overlay 隔离——沙盒初始化后主线对象零污染，沙盒内部自洽。
// 运行：node devTools/gen-retro-env/test-overlay.cjs（cwd = 项目根）
const fs = require('fs');
const vm = require('vm');

const mockState = {
	player: { perceived_breastsize: 3, breastsize: 3, penisExist: false, vaginaExist: false },
	worn: { upper: { name: 'tshirt' } },
	parasite: { breast: { name: 'ear-slime' }, clit: { name: 'none' }, penis: { name: 'none' }, tummy: { name: 'none' } },
	earSlime: { focus: 'none' },
	makeup: {},
	transformationParts: {},
	haircolour: 'brown', hairfringecolour: 'brown', naturalhaircolour: 'brown',
	hairColourGradient: 'none', hairFringeColourGradient: 'none', hairColourStyle: 'none',
	leftEyeColour: 'blue', rightEyeColour: 'blue', hairlengthstage: 0, hairtype: 'default',
	settings: {}, passage: 'test', passagePrev: 'prev', wraith: { state: 'none' },
};
const mockSetup = {
	hair: { hairtype: [{ name: 'mainline-version' }] },
	clothes: { upper: [{ name: 'shirt', type: [] }], lower: [], under_lower: [], under_upper: [], over_lower: [], over_upper: [] },
	breastsizes: [0, 1, 2, 3, 4, 5, 6, 7],
	bodyliquid: { combined: () => 0 },
};
const mockT = { modeloptions: { skin_type: 'mainline' } };
const mockRenderer = {
	Animations: { 'sex-2f-idle': { keyframes: [] } },
	CanvasModels: { main: { layers: {}, preprocess: function () { } } },
};

let passageInitCb = null;
const sandbox = {
	window: {
		V: mockState,
		setup: mockSetup,
		T: mockT,
		Renderer: mockRenderer,
		State: { variables: mockState },
		Utils: {}, Errors: {}, ZIndices: { background: 0, foreground: 1 }, Time: {}, Story: {}, passage: 'test',
		modUtils: {
			getModListName: () => ['legacy-mod'],
			getMod: () => ({ bootJson: { compat: '0.5.8' }, name: 'legacy-mod', imgs: [] }),
		},
		addonBeautySelectorAddon: null,
		modSC2DataManager: {
			getSc2EventTracer: () => ({ addCallback: (cb) => { passageInitCb = cb; } }),
		},
		Image: class Image { constructor(w, h) { this.width = w; this.height = h; this.src = ''; } setAttribute() { } getAttribute() { return this._src; } addEventListener() { } },
		console: console,
		performance: { now: () => 0 },
		setTimeout: setTimeout,
		clearInterval: clearInterval,
	},
	console: console,
	performance: { now: () => 0 },
	setTimeout: setTimeout,
	clearInterval: clearInterval,
};
sandbox.window.window = sandbox.window;
vm.createContext(sandbox);

for (const f of ['retro-env.js', 'retro-path-translate.js', 'retro-apply.js']) {
	vm.runInContext(fs.readFileSync('compat/genesis-compat/dist/' + f, 'utf8'), sandbox, { filename: f });
}
if (!passageInitCb) { console.log('FAIL: whenSC2PassageInit 回调未捕获'); process.exit(1); }
passageInitCb.whenSC2PassageInit();

// 验证主线对象零污染
const failures = [];
function check(name, cond) {
	if (!cond) failures.push(name);
	console.log((cond ? 'PASS' : 'FAIL') + ' ' + name);
}

check('主线 setup.hair 未被覆盖', mockSetup.hair.hairtype[0].name === 'mainline-version');
check('主线 V.player.perceived_breastsize 未变', mockState.player.perceived_breastsize === 3);
check('主线 V.magicLeashPassage 不存在', mockState.magicLeashPassage === undefined);
check('主线 T.modeloptions.skin_type 未变', mockT.modeloptions.skin_type === 'mainline');
check('主线 Renderer.Animations 无新增 key', Object.keys(mockRenderer.Animations).length === 1);
check('主线 CanvasModels.main 有层替换入口', typeof mockRenderer.CanvasModels.main.preprocess === 'function');

// 验证沙盒内部自洽（初始化未炸，层定义可读）
const env = sandbox.window.GenesisCompatRetroEnv ? 'factory defined' : null;
check('沙盒工厂已定义', !!env);
// 沙盒初始化后自身读回 0.5.8 的 setup.hair 表（overlay 自洽验证：通过沙盒 globals 间接读）
// 这里直接验证工厂能再次构建且导出 layers 结构完整
const env2 = sandbox.window.GenesisCompatRetroEnv(mockState, mockSetup, mockT, mockRenderer, {}, {}, { background: 0, foreground: 1 }, { variables: mockState }, {}, {}, 'test');
check('沙盒二次构建 264 层', env2 && env2.layers && env2.layers.layers && Object.keys(env2.layers.layers).length >= 264);

// 人模翻译规则用例
const tr = sandbox.window.GenesisCompatTranslate58to511;
const cases = [
	['img/face/default/blush1.png', 'img/face/default/blush-1.png'],
	['img/body/breasts/breasts0.png', 'img/body/breasts/breasts-0.png'],
	['img/body/penis/condom2.png', 'img/body/penis/condom-2.png'],
	['img/body/basehead.png', 'img/body/base-head.png'],
	['img/body/basenoarms-classic.png', 'img/body/base-classic.png'],
	['img/body/breasts/breastsparasite3.png', 'img/body/breasts/ear-slime-3.png'],
	['img/body/breasts/breasts3_clothed.png', 'img/body/breasts/clothed-3.png'],
	['img/bodywriting/butterfly/left_cheek.png', 'img/bodywriting/butterfly/left-cheek.png'],
	['img/body/base-body.png', null],
];
for (const [inp, want] of cases) {
	const got = tr(inp);
	check('翻译 ' + inp + ' => ' + got, got === want);
}

console.log(failures.length ? ('\n' + failures.length + ' 项失败') : '\n全部通过');
process.exit(failures.length ? 1 : 0);
