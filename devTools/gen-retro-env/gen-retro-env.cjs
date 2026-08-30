// gen-retro-env：从 git tag 0.5.8.10 生成 GenesisCompat 沙盒渲染环境（retro-env.js）。
// 用法：node devTools/gen-retro-env/gen-retro-env.js
// 输入：git tag 0.5.8.10（真相源）+ work/ 缓存
// 输出：compat/genesis-compat/dist/retro-env.js —— window.GenesisCompatRetroEnv 工厂
//       (V, setup, T, ZIndices, Renderer, Utils) => { layers, buildBodyOptions, buildClothesOptions, globals }
//
// 处理：
//   1. canvasmodel-main.js 顶层副作用重定向（Renderer.CanvasModels.main= → __sandbox__.layers=）
//   2. canvasmodel-img.js 宏体提取（DefineMacro → __sandbox__.build*Options 函数）
//   3. 依赖函数从 0.5.8.10 其他文件函数粒度提取（递归解析裸调）
//   4. 拼接为单作用域工厂，参数注入 0.5.11 运行时对象
const { execSync, execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const WORK = path.join(__dirname, 'work');
const OUT = path.join(ROOT, 'compat', 'genesis-compat', 'dist', 'retro-env.js');
const TAG = '0.5.8.10';

function gitShow(p) {
	return execSync(`git show ${TAG}:${p}`, { encoding: 'utf8', cwd: ROOT, maxBuffer: 64 * 1024 * 1024 });
}

// 从源码中提取函数（AST 定位，支持 function/赋值/箭头/单行箭头）。
// 返回可执行的完整文本：单行箭头整体返回；其余返回声明到体收口。
// 作用域链分析共享模块（audit-freevars 同源）：parseAst + segmentFreeVars
const { parseAst, segmentFreeVars } = require('./scope-analyze.cjs');
function extractFunction(src, name) {
	let ast;
	try { ast = parseAst(src); } catch (e) { return null; }
	let range = null;
	const walk = (node) => {
		if (range) return;
		if (!node || typeof node !== 'object') return;
		// 1. 目标匹配（必须在守卫之前：目标本身可能是函数节点）
		// function name() {}
		if (node.type === 'FunctionDeclaration' && node.id && node.id.name === name) { range = node.range; return; }
		// const name = () => {} / const name = function () {}
		if (node.type === 'VariableDeclarator' && node.id && node.id.name === name && node.init) {
			const init = node.init;
			if (init.type === 'FunctionExpression' || init.type === 'ArrowFunctionExpression') {
				range = init.body.type === 'BlockStatement' ? [init.range[0], init.range[1]] : init.range;
				return;
			}
		}
		// window.name = function () {} / bare.name = function () {}（object 必须是裸标识符；
		// 排除 obj.name = function 补丁形式，如 tinycolor.prototype.hsl —— 提取会污染本体原型）
		if (node.type === 'AssignmentExpression' && node.operator === '=' && node.left.type === 'MemberExpression' && !node.left.computed && node.left.object.type === 'Identifier' && node.left.property.name === name && (node.right.type === 'FunctionExpression' || node.right.type === 'ArrowFunctionExpression')) {
			range = node.range; // 含 window.name = 前缀，后续统一重定向
			return;
		}
		// 2. 不进函数体：只提取模块顶层声明（体内函数依赖闭包，单独提取会断链成孤儿语句）
		if (node !== ast && (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression')) return;
		// 3. 深入子节点
		for (const key of Object.keys(node)) {
			const v = node[key];
			if (v && typeof v === 'object') {
				if (Array.isArray(v)) v.forEach(walk);
				else if (v.type) walk(v);
			}
		}
	};
	walk(ast);
	if (!range) return null;
	return src.slice(range[0], range[1]);
}

// 提取某源码里所有裸调用名
function bareCalls(src) {
	const set = new Set();
	const re = /(?<![\w.])[a-zA-Z_$][a-zA-Z0-9_$]*\s*\(/g;
	let m;
	while ((m = re.exec(src))) set.add(m[0].replace(/[\s(]/g, ''));
	return set;
}

// （旧 freeVarsOf 已删除：扁平"已声明集合"减法会被同名参数遮蔽——getCustomColourRGB 的参数
//  contrast 遮蔽了 applyContrastFilter 需要的函数 contrast。改用具作用域链的 segmentFreeVars。）

// 声明块的依赖拓扑排序（const TDZ：块间互相引用时按依赖顺序输出）
function topoSortDecls(decls) {
	const order = [];
	const remaining = decls.map(d => ({ d, declared: extractDeclNames(d), refs: collectIdentifiers(d) }));
	while (remaining.length) {
		let progressed = false;
		for (let i = 0; i < remaining.length; i++) {
			const item = remaining[i];
			// 依赖 = 其他剩余块声明的名字中，被本块引用的
			const deps = remaining.filter((o, j) => j !== i && [...o.declared].some(n => item.refs.has(n)));
			if (!deps.length) {
				order.push(item.d);
				remaining.splice(i, 1);
				progressed = true;
				break;
			}
		}
		if (!progressed) { order.push(...remaining.map(r => r.d)); break; } // 环：按原序兜底
	}
	return order;
}

// 提取声明块里声明的所有变量名
function extractDeclNames(src) {
	const names = new Set();
	let ast;
	try { ast = parseAst(src); } catch (e) { return names; }
	const walk = (n) => {
		if (!n || typeof n !== 'object') return;
		if (n.type === 'VariableDeclaration') for (const d of n.declarations) if (d.id && d.id.name) names.add(d.id.name);
		if (n.type === 'FunctionDeclaration' && n.id) names.add(n.id.name);
		for (const k of Object.keys(n)) {
			const v = n[k];
			if (v && typeof v === 'object') { if (Array.isArray(v)) v.forEach(walk); else if (v.type) walk(v); }
		}
	};
	walk(ast);
	return names;
}

// 收集源码中所有标识符名（AST 遍历）
function collectIdentifiers(src) {
	let ast;
	try { ast = parseAst(src); } catch (e) { return new Set(); }
	const ids = new Set();
	const walk = (n) => {
		if (!n || typeof n !== 'object') return;
		if (n.type === 'Identifier') ids.add(n.name);
		for (const k of Object.keys(n)) {
			const v = n[k];
			if (v && typeof v === 'object') { if (Array.isArray(v)) v.forEach(walk); else if (v.type) walk(v); }
		}
	};
	walk(ast);
	return ids;
}

// 从源码中提取模块顶层变量声明（含初始化器；多声明符取整个声明语句，保证语法完整）。
// 排除 for 头（for (const x of ...) 的 x 不是可迁移声明）。
// 不进函数体：函数体内声明是闭包局部，单独提取会成孤儿语句（引用外层参数/局部）。
function extractVarDecl(src, name) {
	let ast;
	try { ast = parseAst(src); } catch (e) { return null; }
	let range = null;
	const walk = (n, parent) => {
		if (range) return;
		if (!n || typeof n !== 'object') return;
		if (n !== ast && (n.type === 'FunctionDeclaration' || n.type === 'FunctionExpression' || n.type === 'ArrowFunctionExpression')) return;
		if (n.type === 'VariableDeclaration' && parent && !/^For/.test(parent.type)) {
			for (const d of n.declarations) {
				if (d.id && d.id.name === name) { range = n.range; return; }
			}
		}
		for (const k of Object.keys(n)) {
			const v = n[k];
			if (v && typeof v === 'object') { if (Array.isArray(v)) v.forEach(x => walk(x, n)); else if (v.type) walk(v, n); }
		}
	};
	walk(ast, null);
	return range ? src.slice(range[0], range[1]) : null;
}

// 跨文件定位声明/函数（主提取 + 自由变量提取共用；自由变量可能定义在依赖函数之外的另一个文件）
function findDeclAnywhere(name) {
	let candidates = [];
	try {
		const hits = execSync(`git grep -l "function ${name}\\b\\|${name} =" ${TAG} -- game/`, { encoding: 'utf8', cwd: ROOT }).trim().split('\n').filter(Boolean);
		candidates = hits.map(h => h.replace(/^[^:]+:/, '')).filter(h => /\.js$/.test(h));
	} catch (e) { candidates = []; }
	for (const file of candidates) {
		const src = gitShow(file);
		const decl = extractVarDecl(src, name) || extractFunction(src, name);
		if (decl) return { decl, file };
	}
	return null;
}

// 把 canvasmodel-img.js 的 DefineMacro 体转成 __sandbox__ 函数（AST 定位，避免文本替换误伤）
function convertImgMacros(src) {
	const ast = parseAst(src);
	const pieces = [];
	let lastEnd = 0;
	const map = { 'modelprepare-player-body': 'buildBodyOptions', 'modelprepare-player-clothes': 'buildClothesOptions' };
	for (const n of ast.body) {
		if (n.type === 'ExpressionStatement' && n.expression.type === 'CallExpression' && n.expression.callee.name === 'DefineMacro') {
			const arg0 = n.expression.arguments[0];
			const arg1 = n.expression.arguments[1];
			if (arg0 && arg0.type === 'Literal' && map[arg0.value] && arg1 && arg1.range) {
				const fnBody = src.slice(arg1.body.range[0], arg1.body.range[1]); // { ... } 含大括号
				const inner = fnBody.slice(1, -1); // 去掉外层大括号，作为函数体内容
				pieces.push(src.slice(lastEnd, n.range[0]));
				pieces.push(`__sandbox__.${map[arg0.value]} = function () ${fnBody};`);
				lastEnd = n.range[1];
			}
		}
	}
	pieces.push(src.slice(lastEnd));
	return pieces.join('\n');
}

// 文件级 window 导出转换管线（对所有搬入文件统一执行）：
//   1. window.xxx = function → function xxx（函数声明，工厂体局部作用域）
//   2. window.xxx = xxx; → 删除（原文件内冗余回写）
//   3. Object.defineProperty(window, ...) → 删除（只读 getter 导出，沙盒不需要，防污染本体 window）
//   转换后统一在文件末尾生成 __sandbox__.globals.xxx = xxx 导出。
// 意义：0.5.8 文件内的"导出到 window"是文件边界机制；沙盒拍平后文件边界消失，
// 跨文件引用靠工厂体作用域直接解析，globals 导出供 retro-apply 决定是否挂 window。
function convertWindowAssigns(src) {
	const exported = [];
	let out = src.replace(/^(\s*)window\.([a-zA-Z_$][\w$]*)\s*=\s*function\b/gm, (m, ind, g) => {
		exported.push(g);
		return `${ind}function ${g}`;
	});
	out = out.replace(/^(\s*)window\.([a-zA-Z_$][\w$]*)\s*=\s*\2\s*;?\s*$/gm, (m, ind, g) => {
		exported.push(g);
		return '';
	});
	out = out.replace(/^(\s*)Object\.defineProperty\(window,[\s\S]*?\);\s*$/gm, '');
	// 裸顶层函数声明也导出（0.5.8 脚本顶层函数即 window 全局，老包脚本运行时调用）。
	// 只匹配顶格声明：嵌套函数（带缩进）不在工厂体顶层作用域，导出会 ReferenceError。
	out = out.replace(/^function\s+([a-zA-Z_$][\w$]*)\b/gm, (m, g) => {
		exported.push(g);
		return m;
	});
	if (exported.length) {
		out = out.trimEnd() + '\n' + [...new Set(exported)].map(g => `__sandbox__.globals.${g} = ${g};`).join('\n') + '\n';
	}
	return out;
}

// 把 canvasmodel-main.js 顶层副作用重定向
function convertMain(src) {
	let out = src.replace(/Renderer\.CanvasModels\.main\s*=\s*\{/, '__sandbox__.layers = {');
	out = convertWindowAssigns(out);
	return out;
}

// 0.5.11 环境适配 patch（0.5.8 代码在 0.5.11 运行时下的语义修正）：
// 1. gray_suffix：0.5.11 贴图管线改为“原图即灰度图 + 滤镜上色”（实测 img 饱和度 0），
//    _gray.png 文件机制已随 d87803f65 删除。0.5.8 的换后缀逻辑必须改为返回原路径。
function patchGraySuffix(src) {
	// 精确替换 0.5.8 gray_suffix 函数体（保留函数签名，调用点不动）
	const re = /function gray_suffix\(path, filter\) \{[\s\S]*?\n\}/;
	const replaced = src.replace(re, `function gray_suffix(path, filter) {
	// LTS 适配：0.5.11 原图即灰度图，_gray 文件机制已删除（d87803f65），颜色由滤镜管线处理
	return path;
}`);
	if (replaced === src) console.log('  [warn] gray_suffix patch 未命中');
	return replaced;
}

// 诊断插桩：对 clothes genlayer 系的 showfn/srcfn 函数体开头插入输入快照记录。
// 记录 options.worn / V.worn 的键列表与 slot 命中情况，节流（每个组合前 3 次），
// 用 window.GenesisCompatDiagSandbox 开关（默认开，测试期）。
function instrumentDiag(src) {
	const targetGens = new Set(['genlayer_clothing_arm', 'genlayer_clothing_arm_fitted', 'genlayer_clothing_arm_acc', 'genlayer_clothing_accessory', 'genlayer_clothing_main', 'genlayer_clothing_basic', 'genlayer_clothing_detail', 'genlayer_clothing_fitted_left', 'genlayer_clothing_fitted_right', 'genlayer_clothing_belly_split']);
	let ast;
	try { ast = parseAst(src); } catch (e) { console.log('  [warn] instrumentDiag 解析失败:', e.message.slice(0, 80)); return src; }
	const inserts = [];
	const diagBody = (fnName) => `\n\tif (window.GenesisCompatDiagSandbox) { try { const k = '${fnName}:' + (typeof slot !== 'undefined' ? slot : '?'); if (!window.__gcDiagSeen) window.__gcDiagSeen = {}; if (!window.__gcDiagSeen[k]) window.__gcDiagSeen[k] = 0; if (window.__gcDiagSeen[k] < 3) { window.__gcDiagSeen[k]++; console.error('[GenesisCompat][diag-env] ' + k + ' worn=' + (options && options.worn ? Object.keys(options.worn).join(',') : String(options && options.worn)) + ' wornSlot=' + (options && options.worn && typeof slot !== 'undefined' ? (options.worn[slot] ? Object.keys(options.worn[slot]).join(',') : 'MISSING') : '?') + ' typeofV=' + typeof V + ' VwornType=' + (typeof V !== 'undefined' && V ? typeof V.worn : 'noV') + ' Vkeys=' + (typeof V !== 'undefined' && V && typeof V === 'object' ? Object.keys(V).slice(0, 6).join(',') : '?') + ' filters=' + (options && options.filters ? Object.keys(options.filters).slice(0, 8).join(',') : String(options && options.filters))); } } catch (e) {} }`;
	const walk = (node) => {
		if (!node || typeof node !== 'object') return;
		if (node.type === 'FunctionDeclaration' && node.id && targetGens.has(node.id.name)) {
			const collect = (n) => {
				if (!n || typeof n !== 'object') return;
				if (n.type === 'Property' && !n.computed && n.key && (n.key.name === 'srcfn' || n.key.name === 'showfn' || n.key.name === 'filtersfn') && n.value.type === 'FunctionExpression' && n.value.body.type === 'BlockStatement') {
					inserts.push({ pos: n.value.body.range[0] + 1, code: diagBody(n.key.name) });
				}
				for (const k of Object.keys(n)) {
					const v = n[k];
					if (v && typeof v === 'object') { if (Array.isArray(v)) v.forEach(collect); else if (v.type) collect(v); }
				}
			};
			collect(node.body);
		}
		for (const k of Object.keys(node)) {
			const v = node[k];
			if (v && typeof v === 'object') { if (Array.isArray(v)) v.forEach(walk); else if (v.type) walk(v); }
		}
	};
	walk(ast);
	if (!inserts.length) { console.log('  [warn] instrumentDiag 未命中任何函数'); return src; }
	inserts.sort((a, b) => b.pos - a.pos);
	let out = src;
	for (const ins of inserts) out = out.slice(0, ins.pos) + ins.code + out.slice(ins.pos);
	console.log('  [diag] 插桩 ' + inserts.length + ' 个 genlayer 函数体');
	return out;
}

function main() {
	const parts = [];
	const embedded = new Set(); // 已并入沙盒的函数名

	// ---- 1. 核心文件（嵌入后登记所有顶层函数名，避免把同文件函数当外部依赖）----
	const registerLocalFns = (src) => {
		for (const m of src.matchAll(/^(?:window\.)?([a-zA-Z_$][\w$]*)\s*=\s*function\b|^function\s+([a-zA-Z_$][\w$]*)\s*\(/gm)) {
			embedded.add(m[1] || m[2]);
		}
		// 宏体/块内函数也登记
		for (const m of src.matchAll(/function\s+([a-zA-Z_$][\w$]*)\s*\(/g)) embedded.add(m[1]);
	};
	const pushCore = (label, src) => {
		parts.push(`\n// ===== 0.5.8.10 ${label} =====`);
		parts.push(src);
		registerLocalFns(src);
	};
	pushCore('base-clothing.js（getClothingOptions 系列）', fs.readFileSync(path.join(WORK, 'base-clothing.js'), 'utf8'));
	pushCore('text-helpers.js', fs.readFileSync(path.join(WORK, 'text-helpers.js'), 'utf8'));
	pushCore('00-canvasmodel-data.js', fs.readFileSync(path.join(WORK, '00-canvasmodel-data.js'), 'utf8'));
	pushCore('canvasmodel-img.js（宏体 → buildOptions）', convertImgMacros(fs.readFileSync(path.join(WORK, 'canvasmodel-img.js'), 'utf8')));
	pushCore('canvasmodel-main.js（层定义 + genlayer）', instrumentDiag(patchGraySuffix(convertMain(fs.readFileSync(path.join(WORK, 'canvasmodel-main.js'), 'utf8')))));

	// ---- 1b. 渲染依赖闭包文件（文件级整搬——模块地图整理结论：这 3 个文件小且内聚）----
	// colour-namer.js：contrast/applyContrastFilter/getCustomClothesColourCanvasFilter 同文件兄弟函数，
	//   整搬保留文件级闭包语义（参数遮蔽在兄弟函数间天然无害）。
	// colour-utils.js：ColourUtils IIFE 完全自洽（文件级分析零外部依赖）。
	// hair-defs.js：hairLengthStringToNumber（canvasmodel-main 唯一直接依赖的跨文件符号）。
	pushCore('colour-namer.js（颜色命名 + 滤镜）', convertWindowAssigns(gitShow('game/03-JavaScript/colour-namer.js')));
	pushCore('colour-utils.js（ColourUtils IIFE）', convertWindowAssigns(gitShow('game/03-JavaScript/02-Helpers/colour-utils.js')));
	pushCore('hair-defs.js（hairLengthStringToNumber）', convertWindowAssigns(gitShow('game/04-Variables/hair-defs.js')));

	// ---- 2. 依赖函数递归提取 ----
	const builtins = new Set('if for while switch function return typeof new catch throw Object Array String Number Math JSON Boolean isNaN parseInt parseFloat Set Map RegExp Promise WeakMap Symbol Reflect structuredClone Error console includes startsWith endsWith replace test toFixed setup V T window jQuery State Story passage DefineMacro clone day'.split(' '));
	const toFetch = new Map(); // name -> file
	// 第一轮：核心文件的裸调
	let combined = parts.join('\n');
	let pending = bareCalls(combined);
	// 已知 window 全局（0.5.11 环境有，或我们已有 polyfill）不提取。
	// tinycolor：完整 UMD 颜色库，0.5.11 自带 window.tinycolor（同库），函数粒度提取会断内部闭包。
	// 已验证 0.5.11 存在的全局（Utils：GetStack 同名同签名；Skin/Weather/Transformations/idb/LZString/Engine/Config 均在 0.5.11 本体；
	// round：math.js:191 同定义同导出）
	const knownGlobals = new Set('between playerHasStrapon playerHasButtPlug calculatePenisBulge isPartEnabled isChimeraEnabled generateClothingFilter generateClothingAccFilter Errors Time tinycolor C $ Utils Skin Weather Transformations idb LZString Engine Config round'.split(' '));

	for (let round = 0; round < 5 && pending.size; round++) {
		const next = new Set();
		for (const name of pending) {
			if (builtins.has(name) || knownGlobals.has(name) || embedded.has(name)) continue;
			// 单字母（压缩代码误抓）、jQuery 别名、对象键名伪引用
			if (/^[a-zA-Z]$/.test(name) || name === '$' || name === 'day') continue;
			if (/^(srcfn|showfn|zfn|filtersfn|alphafn|wornfn|masksrcfn|dxfn|dyfn|brightnessfn|animationfn|preprocess|postprocess|defaultOptions|generatedOptions|clothes|conversion|convertItem|inputs|offsets|position|state|styles|_)$/.test(name)) continue;
			// 在 0.5.8.10 定位：跨文件搜索（自由变量可能定义在依赖函数之外的另一个文件）
			const found = findDeclAnywhere(name);
			if (!found) { console.log('  [skip] 未定位/提取失败:', name); continue; }
			let fnSrc = found.decl;
			const usedFile = found.file;
			// window.xxx = function 形式统一转换（与自由变量提取一致）：
			// 转函数声明（工厂体局部作用域）+ globals 导出，避免工厂执行时直接覆盖本体 window 全局
			if (/^window\.([a-zA-Z_$][\w$]*)\s*=\s*function\b/m.test(fnSrc)) {
				const gName = fnSrc.match(/^window\.([a-zA-Z_$][\w$]*)/)[1];
				fnSrc = fnSrc.replace(/^window\.[a-zA-Z_$][\w$]*\s*=\s*function\b/m, `function ${gName}`) + `\n__sandbox__.globals.${gName} = ${gName};`;
			}
			parts.push(`\n// ===== dep: ${name} @ 0.5.8.10:${usedFile} =====`);
			parts.push(fnSrc);
			embedded.add(name);
			// 闭包自由变量递归提取（matchers 类：函数引用的模块级变量跟着走；
			// 作用域链分析，参数遮蔽不会漏提——getCustomColourRGB 的参数 contrast 不再遮蔽函数 contrast）
			const fileSrc = gitShow(usedFile);
			const fileOf = new Map();
			const extraDecls = [];
			let cur = fnSrc;
			for (let d = 0; d < 3; d++) {
				const free = segmentFreeVars(cur).filter(x =>
					!builtins.has(x) && !knownGlobals.has(x) && !embedded.has(x) &&
					!/^[a-zA-Z]$/.test(x) && !/fn$/.test(x));
				let added = false;
				for (const fv of free) {
					let decl = extractVarDecl(fileSrc, fv) || extractFunction(fileSrc, fv);
					let declFile = usedFile;
					if (!decl) {
						const f2 = findDeclAnywhere(fv);
						if (f2) { decl = f2.decl; declFile = f2.file; }
					}
					// 含 arguments 引用的声明必是函数体内局部（逃逸提取），跳过
					if (decl && /\barguments\b/.test(decl)) continue;
					// window.name = function 形式转函数声明（提升，避免顺序 TDZ）+ globals 导出
					if (decl && /^window\.([a-zA-Z_$][\w$]*)\s*=\s*function\b/m.test(decl)) {
						const gName = decl.match(/^window\.([a-zA-Z_$][\w$]*)/)[1];
						decl = decl.replace(/^window\.[a-zA-Z_$][\w$]*\s*=\s*function\b/m, `function ${gName}`) + `\n__sandbox__.globals.${gName} = ${gName};`;
					}
					if (decl && !fileOf.has(decl)) {
						fileOf.set(decl, declFile);
						extraDecls.push(decl);
						embedded.add(fv);
						added = true;
					}
				}
				if (!added) break;
				cur = extraDecls.join('\n');
			}
			// 拓扑排序（const TDZ：声明块间依赖顺序）
			for (const decl of topoSortDecls(extraDecls)) {
				parts.push(`\n// ===== dep-freevar @ ${fileOf.get(decl) || usedFile} =====`);
				parts.push(decl);
			}
			// 递归：新函数的裸调
			for (const n of bareCalls(fnSrc)) if (!builtins.has(n) && !embedded.has(n)) next.add(n);
			console.log('  [dep]', name, '<-', usedFile, extraDecls.length ? '(自由变量 ' + extraDecls.length + ' 个)' : '');
		}
		pending = next;
		combined = parts.join('\n');
	}

	// ---- 3. 拼接工厂 ----
	const body = combined
		.replace(/window\.([a-zA-Z_$][\w$]*)\s*=\s*\1\s*;?\s*$/gm, '__sandbox__.globals.$1 = $1;')
		.replace(/DefineMacro\([\s\S]*?\}\);/g, ''); // 残留宏剔除

	// 桥接注入：分析嵌入代码的顶层声明，只对未声明名生成 const X = __X;
	const injectNames = ['V', 'setup', 'T', 'Renderer', 'Utils', 'Errors', 'ZIndices', 'State', 'Time', 'Story', 'passage'];
	const declared = new Set();
	const collectDecls = (src) => {
		try {
			const ast = parseAst(src);
			for (const n of ast.body) {
				if (n.type === 'FunctionDeclaration' && n.id) declared.add(n.id.name);
				if (n.type === 'VariableDeclaration') for (const d of n.declarations) if (d.id && d.id.name) declared.add(d.id.name);
				if (n.type === 'ClassDeclaration' && n.id) declared.add(n.id.name);
			}
			return true;
		} catch (e) { return false; }
	};
	if (!collectDecls(body)) {
		// 整体解析失败（嵌入片段间可能有重复声明）：逐段收集
		console.log('  [warn] 整体桥接分析失败，逐段收集声明');
		for (const seg of body.split(/\n\/\/ ===== /).slice(1)) {
			const nl = seg.indexOf('\n');
			if (nl < 0) continue;
			collectDecls(seg.slice(nl));
		}
	}
	const bridgeLines = [];
	for (const n of injectNames) {
		if (declared.has(n)) continue;
		if (n === 'V') {
			// V 直通注入参数。注入方（retro-apply.js）传 overlay 代理：读共享主线实时状态、写隔离。
			// 沙盒不自寻 window.V / State.variables，避免绕开隔离层直写主线。
			bridgeLines.push(`const V = __V;`);
		} else {
			bridgeLines.push(`const ${n} = __${n};`);
		}
	}
	const bridge = bridgeLines.join('\n\t');

	const factory = `// GenesisCompat 沙盒渲染环境（自动生成，勿手改 —— devTools/gen-retro-env/gen-retro-env.cjs）
// 真相源：git tag 0.5.8.10。运行时 Function 构造器加载，参数注入 0.5.11 对象。
// 桥接规则：文件内已有同名顶层声明（如 0.5.8 自带 const ZIndices）则用文件内版本，
//           否则 const X = __X 桥接到注入参数。
// 导出：layers（0.5.8 主模型层定义）/ buildBodyOptions / buildClothesOptions / globals
window.GenesisCompatRetroEnv = function (__V, __setup, __T, __Renderer, __Utils, __Errors, __ZIndices, __State, __Time, __Story, __passage) {
	const __sandbox__ = { layers: null, globals: {} };
	${bridge}
${body}
	return {
		layers: __sandbox__.layers,
		buildBodyOptions: __sandbox__.buildBodyOptions,
		buildClothesOptions: __sandbox__.buildClothesOptions,
		globals: __sandbox__.globals,
	};
};
`;

	fs.writeFileSync(OUT, factory);
	console.log('done:', OUT, fs.statSync(OUT).size, 'bytes');

	// 自由变量完备性审计（构建链硬门禁）：炸点非零则中止
	try {
		execFileSync(process.execPath, [path.join(__dirname, 'audit-freevars.cjs')], { stdio: 'inherit', cwd: ROOT });
		console.log('[gen-retro-env] 自由变量审计通过：0 炸点');
	} catch (e) {
		console.error('[gen-retro-env] 产物存在未闭合自由变量引用，构建中止（见审计输出）');
		process.exit(1);
	}
}

main();
