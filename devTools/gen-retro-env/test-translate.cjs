// 翻译函数用例验证
const fs = require('fs');
const vm = require('vm');
const src = fs.readFileSync('compat/genesis-compat/dist/retro-path-translate.js', 'utf8');
const ctx = { window: {}, HTMLImageElement: class {}, Event: function (t) { this.type = t; } };
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(src, ctx);
const translate = ctx.window.GenesisCompatTranslate58to511;

const cases = [
	// 目录下划线折叠
	['img/clothes/under_lower/plainpanties/full.png', 'img/clothes/under-lower/plainpanties/full.png'],
	['img/clothes/over_upper/coat/full.png', 'img/clothes/over-upper/coat/full.png'],
	// arm 简名 → 状态段
	['img/clothes/upper/kimonomini/right.png', 'img/clothes/upper/kimonomini/right-idle.png'],
	['img/clothes/upper/kimonomini/left_alt.png', 'img/clothes/upper/kimonomini/left-idle-alt.png'],
	['img/clothes/upper/kimonomini/hold.png', 'img/clothes/upper/kimonomini/right-hold.png'],
	['img/clothes/upper/kimonomini/right_cover_alt.png', 'img/clothes/upper/kimonomini/right-cover-alt.png'],
	// arm+acc 组合（cowonesie 404 的核心用例）
	['img/clothes/upper/cowonesie/right_acc.png', 'img/clothes/upper/cowonesie/right-idle-acc.png'],
	['img/clothes/upper/cowonesie/left_acc.png', 'img/clothes/upper/cowonesie/left-idle-acc.png'],
	// acc 前缀保持（acc_xxx → acc-xxx）
	['img/clothes/upper/kimonomini/acc_full.png', 'img/clothes/upper/kimonomini/acc-full.png'],
	['img/clothes/upper/gingham/acc_gingham.png', 'img/clothes/upper/gingham/acc-gingham.png'],
	['img/clothes/upper/gingham/3_acc_gingham.png', 'img/clothes/upper/gingham/3-acc-gingham.png'],
	// 无变化 / 非衣服路径
	['img/clothes/lower/sundress/full_alt.png', 'img/clothes/lower/sundress/full-alt.png'],
	['img/body/base-body.png', null],
	['img/clothes/lower/sundress/full.png', null],
	// cum 目录特规（git rename：AnalCumDripFast→anal-fast、Chest 1→chest-1）
	['img/body/cum/AnalCumDripFast.png', 'img/body/cum/anal-fast.png'],
	['img/body/cum/VaginalCumDripVerySlow.png', 'img/body/cum/vaginal-very-slow.png'],
	['img/body/cum/MouthCumDripStart.png', 'img/body/cum/mouth-start.png'],
	['img/body/cum/Chest 1.png', 'img/body/cum/chest-1.png'],
	// 组合档位重编号（git rename：Face 1,2→face-1、Feet 4,5→feet-2、Face 5→face-3）
	['img/body/cum/Face 1,2.png', 'img/body/cum/face-1.png'],
	['img/body/cum/Feet 4,5.png', 'img/body/cum/feet-2.png'],
	['img/body/cum/Left Arm 1,2,3.png', 'img/body/cum/left-arm-1.png'],
	['img/body/cum/Face 5.png', 'img/body/cum/face-3.png'],
	['img/body/cum/Thighs 2.png', 'img/body/cum/thighs-2.png'],
	['img/body/cum/anal-fast.png', null],
	// arm 拆词（git rename：leftarmidle-classic→left-arm-idle-classic）
	['img/body/leftarmidle-classic.png', 'img/body/left-arm-idle-classic.png'],
	['img/body/rightarmcover.png', 'img/body/right-arm-cover.png'],
	// 人模规则（git rename：breasts0→breasts-0、basenoarms→base、basehead→base-head）
	['img/body/breasts/breasts0.png', 'img/body/breasts/breasts-0.png'],
	// penis 家族（尺寸整体 +2：0.5.8 的 -2..4 → 0.5.11 的 0..6；hard/soft 由别名层共享）
	['img/body/penis/condom2.png', 'img/body/penis/condom-hard-4.png'],
	['img/body/penis/penis-2.png', 'img/body/penis/hard-0.png'],
	['img/body/penisnoballs/penis4.png', 'img/body/penis-no-balls/hard-6.png'],
	['img/body/penis/penisparasite0.png', 'img/body/penis-no-balls/ear-slime-2.png'],
	['img/body/penis/penis_chastityflat.png', 'img/body/penis/chastity.png'],
	['img/body/basenoarms-classic.png', 'img/body/base-classic.png'],
	['img/body/basehead.png', 'img/body/base-head.png'],
	['img/face/default/blush1.png', 'img/face/default/blush-1.png'],
	['img/body/breasts/breastsparasite3.png', 'img/body/breasts/ear-slime-3.png'],
	['img/body/breasts/breasts3_clothed.png', 'img/body/breasts/clothed-3.png'],
	['img/bodywriting/butterfly/left_cheek.png', 'img/bodywriting/butterfly/left-cheek.png'],
];
let pass = 0;
for (const [input, expected] of cases) {
	const got = translate(input);
	const ok = got === expected;
	if (ok) pass++;
	console.log(ok ? 'PASS' : 'FAIL', input, '→', got, ok ? '' : '(期望 ' + expected + ')');
}
console.log(pass + '/' + cases.length);
process.exit(pass === cases.length ? 0 : 1);
