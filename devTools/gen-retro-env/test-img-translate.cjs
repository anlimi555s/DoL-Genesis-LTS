// test-img-translate：验证 mod 加载时图片 key 翻译。
// 覆盖：legacy mod 的 imgs[].path 翻译、getter 不动、新 mod 零介入、BSA imgList 兜底。
const fs = require('fs');
const vm = require('vm');

let afterModLoadHook = null;
let passageInitCb = null;
const bsaImgList = new Map([
	['legacy/img/body/breasts/breasts0.png', { data: 1 }],
	['legacy/img/body/base-head.png', { data: 2 }],
	['legacy/img/clothes/head/bonnet/mask.png', { data: 3 }],
]);
// 捕获 vm 内 console（img-translate 的日志），用于断言重复计数
const vmLogs = [];
const sandbox = {
	window: {
		modUtils: {
			getModLoadController: () => ({
				addLifeTimeCircleHook: (id, hooks) => { afterModLoadHook = hooks.afterModLoad; },
			}),
			getMod: (name) => (name === 'legacy-bsa' ? { name: 'legacy-bsa', bootJson: { compat: '0.5.8' } } : null),
		},
		addonBeautySelectorAddon: {
			getTypeOrder: () => [{
				type: 'legacy-bsa',
				modRef: { mod: { name: 'legacy-bsa', bootJson: { compat: '0.5.8' } } },
				imgListRef: bsaImgList,
			}],
		},
		modSC2DataManager: {
			getSc2EventTracer: () => ({ addCallback: (cb) => { passageInitCb = cb; } }),
		},
		console: { log: (...a) => vmLogs.push(a.join(' ')), warn: (...a) => vmLogs.push(a.join(' ')) },
		performance: { now: () => 0 },
	},
	console: { log: (...a) => vmLogs.push(a.join(' ')), warn: (...a) => vmLogs.push(a.join(' ')) },
	setTimeout: setTimeout,
	clearInterval: clearInterval,
};
sandbox.window.window = sandbox.window;
vm.createContext(sandbox);

for (const f of ['retro-path-translate.js', 'img-translate.js']) {
	vm.runInContext(fs.readFileSync('compat/genesis-compat/dist/' + f, 'utf8'), sandbox, { filename: f });
}

const failures = [];
function check(name, cond) {
	if (!cond) failures.push(name);
	console.log((cond ? 'PASS' : 'FAIL') + ' ' + name);
}
function makeImg(path) { return { path, getter: { imgPath: path } }; }

// afterModLoad 钩子已捕获
check('afterModLoad 钩子已注册', typeof afterModLoadHook === 'function');

const legacyImgs = [
	makeImg('img/body/leftarmidle-classic.png'),
	makeImg('img/body/cum/Chest 1.png'),
	makeImg('img/clothes/upper/tshirt/right.png'),
	makeImg('img/body/base-head.png'),
	makeImg('img/clothes/head/bonnet/mask.png'),
];
const legacyMod = { name: 'legacy', bootJson: { compat: '0.5.8' }, imgs: legacyImgs };
const newMod = { name: 'new', bootJson: {}, imgs: [makeImg('img/body/base-classic.png')] };

afterModLoadHook(null, null, legacyMod);
afterModLoadHook(null, null, newMod);

check('leftarmidle → left-arm-idle-classic', legacyImgs[0].path === 'img/body/left-arm-idle-classic.png');
check('cum Chest 1 → chest-1', legacyImgs[1].path === 'img/body/cum/chest-1.png');
check('clothes right → right-idle', legacyImgs[2].path === 'img/clothes/upper/tshirt/right-idle.png');
check('已是新格式不翻', legacyImgs[3].path === 'img/body/base-head.png');
check('getter 保持旧路径(读 zip)', legacyImgs[0].getter.imgPath === 'img/body/leftarmidle-classic.png');
check('新 mod 零介入', newMod.imgs[0].path === 'img/body/base-classic.png');
// C 类：mask 别名注册（单张 mask.png → 四状态别名，共享 getter）
const maskAliases = legacyImgs.filter((im) => im.path.startsWith('img/clothes/head/bonnet/mask-'));
check('mask 四状态别名已注册', maskAliases.length === 4
	&& ['full', 'frayed', 'tattered', 'torn'].every((s) => maskAliases.some((im) => im.path === 'img/clothes/head/bonnet/mask-' + s + '.png')));
check('mask 别名共享 getter', maskAliases.length === 4 && maskAliases.every((im) => im.getter === legacyImgs[4].getter));

// BSA 兜底（跨 realm 的 Map 方法调用在 Node 侧观察不可靠，验证放 vm 内）
check('passageInit 回调已注册', passageInitCb && typeof passageInitCb.whenSC2PassageInit === 'function');
passageInitCb.whenSC2PassageInit();
const bsaR1 = vm.runInContext(`(() => {
	const m = window.addonBeautySelectorAddon.getTypeOrder()[0].imgListRef;
	return {
		size: m.size,
		translated: m.has('legacy/img/body/breasts/breasts-0.png') && !m.has('legacy/img/body/breasts/breasts0.png'),
		maskAliases: ['full', 'frayed', 'tattered', 'torn'].every((s) => m.has('legacy/img/clothes/head/bonnet/mask-' + s + '.png')),
	};
})()`, sandbox);
check('BSA imgList key 翻译', bsaR1.translated === true);
check('BSA mask 四状态别名', bsaR1.maskAliases === true);

// 收敛：第二轮再跑，count 必须为 0（mask 别名幂等），否则 bsaSettled 永远到不了 2
passageInitCb.whenSC2PassageInit();
const bsaR2 = vm.runInContext(`(() => {
	const m = window.addonBeautySelectorAddon.getTypeOrder()[0].imgListRef;
	return { size: m.size };
})()`, sandbox);
check('第二轮无新翻译(幂等)', bsaR2.size === bsaR1.size);
check('mask 别名不重复计数', vmLogs.filter((l) => l.includes('keys in legacy-bsa')).length === 1);

console.log(failures.length ? ('\n' + failures.length + ' 项失败') : '\n全部通过');
process.exit(failures.length ? 1 : 0);
