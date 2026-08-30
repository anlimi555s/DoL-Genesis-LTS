// audit-freevars：对 retro-env.js 做自由变量完备性审计。
// 问题：工厂执行 OK 只证明声明层（函数体不被调用），运行时自由变量缺失（contrast）测不出来。
// 用作用域链模型（scope-analyze.cjs）静态审计产物：每个函数体引用的每个标识符，
// 沿 自身作用域 → 外层函数 → 工厂体 → 注入参数 → 白名单 逐层解析，
// 任何一层都解析不到的名字就是运行时炸点。
//
// 用法：node devTools/gen-retro-env/audit-freevars.cjs
// 输入：compat/genesis-compat/dist/retro-env.js（自动生成产物，勿手改）
// 输出：三类问题清单
//   1. bombs     —— 确认炸点（任何作用域/白名单都解析不到，运行时必 ReferenceError）
//   2. windowRefs —— 引用 window.xxx = ... 挂载名（依赖 window 副作用，且覆盖本体全局）
//   3. maybe    —— 命中 DoL/SugarCube 全局候选集（0.5.11 是否有同名全局需人工验证）
// 退出码：bombs 非空 → 1（构建链用）
const fs = require('fs');
const path = require('path');
const { parseAst, lineOf, analyzeInto, walkScope, collectWindowMounts } = require('./scope-analyze.cjs');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(ROOT, 'compat', 'genesis-compat', 'dist', 'retro-env.js');

// JS 内建（引擎保证存在，无需审计）
const JS_BUILTINS = new Set((
	'Object Array String Number Boolean Math JSON Date RegExp Error TypeError RangeError ReferenceError SyntaxError EvalError URIError ' +
	'Promise Set Map WeakMap WeakSet Symbol Reflect Proxy console parseInt parseFloat isNaN isFinite Infinity NaN undefined ' +
	'structuredClone Intl BigInt decodeURI decodeURIComponent encodeURI encodeURIComponent atob btoa ' +
	'Uint8Array Uint8ClampedArray Int8Array Uint16Array Int16Array Uint32Array Int32Array Float32Array Float64Array ' +
	'BigInt64Array BigUint64Array ArrayBuffer SharedArrayBuffer DataView TextEncoder TextDecoder ' +
	'queueMicrotask setTimeout setInterval clearTimeout clearInterval requestAnimationFrame performance ' +
	'alert confirm prompt globalThis window document arguments Blob File FileReader URL getComputedStyle'
).split(' '));

// gen-retro-env 的 knownGlobals（构建时已假设 0.5.11 环境存在——继承同一假设）
const KNOWN_GLOBALS = new Set((
	'between playerHasStrapon playerHasButtPlug calculatePenisBulge isPartEnabled isChimeraEnabled ' +
	'generateClothingFilter generateClothingAccFilter Errors Time tinycolor'
).split(' '));

// 已验证 0.5.11 存在的全局（C：pregnancy-types.js 裸用；$：namespace.js 裸用；clone：SugarCube 自带；
// Utils：GetStack 同名同签名；Skin/Weather/Transformations/idb/LZString：本体源码存在；Engine/Config：SugarCube 标准全局）
const VERIFIED_GLOBALS = new Set('C $ clone Utils Skin Weather Transformations idb LZString Engine Config round'.split(' '));

// 工厂注入参数原名（桥接后沙盒代码用 V/setup/T 等桥接名，这些作为工厂体声明被收集）
const INJECTED_ORIG = new Set(['__V', '__setup', '__T', '__Renderer', '__Utils', '__Errors', '__ZIndices', '__State', '__Time', '__Story', '__passage']);

// DoL 0.5.8 全局候选：0.5.11 是否有同名全局，需对照本体逐个验证
const MAYBE_GLOBALS = new Set((
	'jQuery SugarCube Wikifier Dialog Save Setting Variables Macro Scripting Random Rainbow'
).split(' '));

const WHITELIST = new Set([...JS_BUILTINS, ...KNOWN_GLOBALS, ...VERIFIED_GLOBALS, ...INJECTED_ORIG, '__gcDiagSeen']);

function main() {
	const src = fs.readFileSync(OUT, 'utf8');
	const ast = parseAst(src);
	// 定位 window.GenesisCompatRetroEnv = function (...) { ... }
	let factoryFn = null;
	const findFactory = (n) => {
		if (factoryFn || !n || typeof n !== 'object') return;
		if (n.type === 'AssignmentExpression' && n.right && n.right.type === 'FunctionExpression' &&
			n.left && n.left.type === 'MemberExpression' && !n.left.computed &&
			n.left.object && n.left.object.type === 'Identifier' && n.left.object.name === 'window' &&
			n.left.property && n.left.property.type === 'Identifier' && n.left.property.name === 'GenesisCompatRetroEnv') {
			factoryFn = n.right;
			return;
		}
		for (const k of Object.keys(n)) {
			const v = n[k];
			if (v && typeof v === 'object') {
				if (Array.isArray(v)) v.forEach(findFactory);
				else if (v.type) findFactory(v);
			}
		}
	};
	findFactory(ast);
	if (!factoryFn) { console.error('[audit] 未找到 GenesisCompatRetroEnv 工厂函数'); process.exit(1); }

	const issues = { bombs: [], windowRefs: [], maybe: [] };
	const wm = new Map();
	collectWindowMounts(factoryFn.body, wm, src);
	wm.delete('__gcDiagSeen'); // 插桩自管全局，非产物语义

	// 工厂参数是最外层作用域
	const paramScope = new Set();
	for (const p of factoryFn.params) paramScope.add(p.name);
	walkScope(factoryFn, [paramScope], '<factory>', (name, node, ctx) => {
		const line = lineOf(node, src);
		if (wm.has(name)) { issues.windowRefs.push({ name, ctx, line }); return; }
		if (WHITELIST.has(name)) return;
		if (MAYBE_GLOBALS.has(name)) { issues.maybe.push({ name, ctx, line }); return; }
		issues.bombs.push({ name, ctx, line });
	}, src);

	// ---- 报告 ----
	const group = (list) => {
		const byName = new Map();
		for (const it of list) {
			if (!byName.has(it.name)) byName.set(it.name, []);
			byName.get(it.name).push(it.ctx + ':' + it.line);
		}
		return byName;
	};
	const fmtGroup = (label, list) => {
		const g = group(list);
		console.log(`\n=== ${label}：${g.size} 个唯一标识符，${list.length} 处引用 ===`);
		for (const [name, refs] of g) {
			console.log(`  ${name}`);
			for (const r of refs) console.log(`    - ${r}`);
		}
	};
	console.log(`审计对象: ${path.basename(OUT)} (${fs.statSync(OUT).size} bytes)`);
	console.log(`window 挂载名: ${[...wm.keys()].join(', ') || '(无)'}`);
	fmtGroup('确认炸点（运行时必 ReferenceError）', issues.bombs);
	fmtGroup('引用 window 挂载名（依赖 window 副作用 + 覆盖本体全局风险）', issues.windowRefs);
	fmtGroup('待验证全局（DoL/SugarCube 候选，需对照 0.5.11）', issues.maybe);
	const total = issues.bombs.length + issues.windowRefs.length + issues.maybe.length;
	console.log(`\n总计: ${total} 处未闭合引用。bombs=${issues.bombs.length} windowRefs=${issues.windowRefs.length} maybe=${issues.maybe.length}`);
	process.exit(issues.bombs.length ? 1 : 0);
}

main();
