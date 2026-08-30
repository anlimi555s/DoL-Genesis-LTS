// scope-analyze：作用域链自由变量分析（gen-retro-env 提取器 + audit-freevars 审计器共用）。
// 精确模型：每个函数独立作用域（参数 + 体内声明），块建作用域，引用沿链从内到外解析。
// 相比扁平"已声明集合"减法，正确处理参数遮蔽：
//   getCustomColourRGB 的参数名 contrast 不再遮蔽 applyContrastFilter 需要的函数 contrast
//   （旧 freeVarsOf 把任意嵌套函数的参数无条件算进"已声明"，导致同名遮蔽漏提取）。
// 覆盖所有函数节点：语句位置的函数声明、对象字面量里的层 fn、表达式里的箭头函数。
const acorn = require('C:/Users/Selena/Desktop/dol-mod/sugarcube-2-ModLoader-master/node_modules/acorn/dist/acorn.js');

function parseAst(src) {
	const base = { ecmaVersion: 'latest', sourceType: 'script', ranges: true };
	try {
		return acorn.parse(src, base);
	} catch (e) {
		// 大文件/片段可能有宽容场景：退化再试一次
		return acorn.parse(src, { ...base, ecmaVersion: 2022, allowReturnOutsideFunction: true });
	}
}

function lineOf(node, src) {
	return src.slice(0, node.start).split('\n').length;
}

// 解构模式里的绑定名集合
function patternNames(node, out) {
	if (!node || typeof node !== 'object') return;
	if (node.type === 'Identifier') { out.add(node.name); return; }
	if (node.type === 'ObjectPattern') { for (const p of node.properties) patternNames(p.value, out); return; }
	if (node.type === 'ArrayPattern') { for (const e of node.elements) if (e) patternNames(e, out); return; }
	if (node.type === 'AssignmentPattern') { patternNames(node.left, out); return; }
	if (node.type === 'RestElement') { patternNames(node.argument, out); return; }
}

// 任意深度收集声明名（近似 var 提升；不进任何函数体——嵌套函数声明属于嵌套函数作用域）
function collectDecls(node, scope) {
	const walk = (n) => {
		if (!n || typeof n !== 'object') return;
		if (n.type === 'VariableDeclaration') { for (const d of n.declarations) patternNames(d.id, scope); return; }
		if (n.type === 'FunctionDeclaration') { if (n.id) scope.add(n.id.name); return; }
		if (n.type === 'FunctionExpression' || n.type === 'ArrowFunctionExpression') return;
		if (n.type === 'ClassDeclaration' || n.type === 'ClassExpression') { if (n.id) scope.add(n.id.name); return; }
		if (n.type === 'CatchClause') { patternNames(n.param, scope); }
		for (const k of Object.keys(n)) {
			const v = n[k];
			if (v && typeof v === 'object') {
				if (Array.isArray(v)) v.forEach(walk);
				else if (v.type) walk(v);
			}
		}
	};
	walk(node);
}

// 收集 window.xxx = ... 挂载名（副作用可见名，引用它的代码依赖 window 全局）
function collectWindowMounts(node, out, src) {
	const walk = (n) => {
		if (!n || typeof n !== 'object') return;
		if (n.type === 'AssignmentExpression' && n.operator === '=' &&
			n.left && n.left.type === 'MemberExpression' && !n.left.computed &&
			n.left.object && n.left.object.type === 'Identifier' && n.left.object.name === 'window' &&
			n.left.property && n.left.property.type === 'Identifier') {
			if (!out.has(n.left.property.name)) out.set(n.left.property.name, lineOf(n, src));
		}
		for (const k of Object.keys(n)) {
			const v = n[k];
			if (v && typeof v === 'object') {
				if (Array.isArray(v)) v.forEach(walk);
				else if (v.type) walk(v);
			}
		}
	};
	walk(node);
}

function fnCtxName(node, parentCtx, keyHint, src) {
	if (node.id) return node.id.name;
	if (keyHint) return parentCtx + '.' + keyHint;
	if (parentCtx && parentCtx !== '<segment>') return parentCtx + '.anon@' + lineOf(node, src);
	return 'anon@' + lineOf(node, src);
}

// 函数作用域：参数 + 体内声明组成 scope，压链后逐语句分析
function walkScope(fn, chain, ctx, onUnresolved, src) {
	const scope = new Set();
	for (const p of fn.params) patternNames(p, scope);
	if (fn.id) scope.add(fn.id.name); // 函数自身名（递归调用可用）
	const chain2 = [scope, ...chain];
	if (fn.body.type === 'BlockStatement') {
		collectDecls(fn.body, scope);
		for (const stmt of fn.body.body) analyzeInto(stmt, chain2, ctx, onUnresolved, src);
	} else {
		// 单行箭头函数：body 是表达式，直接在该函数作用域链内检查
		analyzeInto(fn.body, chain2, ctx, onUnresolved, src);
	}
}

// 普通块作用域
function walkBlock(block, chain, ctx, onUnresolved, src) {
	const scope = new Set();
	collectDecls(block, scope);
	const chain2 = [scope, ...chain];
	for (const stmt of block.body) analyzeInto(stmt, chain2, ctx, onUnresolved, src);
}

// 核心分发：遍历节点树。块建作用域、函数建作用域（参数默认值在外层求值）、
// 引用位置的 Identifier 沿链解析，解析不到回调 onUnresolved(name, node)。
function analyzeInto(node, chain, ctx, onUnresolved, src) {
	const walk = (n, parent, keyHint) => {
		if (!n || typeof n !== 'object') return;
		if (n.type === 'FunctionDeclaration' || n.type === 'FunctionExpression' || n.type === 'ArrowFunctionExpression') {
			for (const p of n.params) if (p.defaultValue) walk(p.defaultValue, n, null); // 默认值在外层作用域
			walkScope(n, chain, fnCtxName(n, ctx, keyHint, src), onUnresolved, src);
			return;
		}
		if (n.type === 'BlockStatement') { walkBlock(n, chain, ctx, onUnresolved, src); return; }
		if (n.type === 'ClassDeclaration' || n.type === 'ClassExpression') {
			// 简化：extends 在外层求值，方法体不审计（0.5.8 渲染代码极少用 class）
			if (n.superClass) walk(n.superClass, n, null);
			return;
		}
		if (n.type === 'VariableDeclarator') { walk(n.init, n, null); return; } // id 是声明，不进引用检查
		if (n.type === 'Identifier') {
			const p = parent;
			if (p) {
				if (p.type === 'MemberExpression' && p.property === n && !p.computed) return; // 成员名 obj.x 的 x
				if (p.type === 'Property' && p.key === n && !p.computed && !p.shorthand) return; // 键名 { x: 1 } 的 x
				if (p.type === 'VariableDeclarator' && p.id === n) return; // 声明名
				if ((p.type === 'FunctionDeclaration' || p.type === 'FunctionExpression') && p.id === n) return;
				if ((p.type === 'ClassDeclaration' || p.type === 'ClassExpression') && p.id === n) return;
				if (p.type === 'LabeledStatement' && p.label === n) return;
				if ((p.type === 'BreakStatement' || p.type === 'ContinueStatement') && p.label === n) return;
				if (p.type === 'MetaProperty') return;
			}
			const name = n.name;
			if (chain.some(s => s.has(name))) return;
			onUnresolved(name, n, ctx);
			return;
		}
		for (const k of Object.keys(n)) {
			const v = n[k];
			if (v && typeof v === 'object') {
				if (Array.isArray(v)) v.forEach(x => walk(x, n, null));
				else if (v.type) {
					const hint = (n.type === 'Property' && k === 'value' && n.key && n.key.type === 'Identifier' && !n.computed) ? n.key.name : null;
					walk(v, n, hint);
				}
			}
		}
	};
	walk(node, null, null);
}

// 片段自由变量：分析一个源码片段（可能含多个顶层函数/声明）的外部依赖名集合。
// 片段顶层声明构成最外层作用域；window.xxx = ... 副作用名也算片段内可见（旧形式兼容）。
function segmentFreeVars(src) {
	let ast;
	try { ast = parseAst(src); } catch (e) { return []; }
	const top = new Set();
	for (const stmt of ast.body) {
		if (stmt.type === 'FunctionDeclaration' && stmt.id) top.add(stmt.id.name);
		if (stmt.type === 'ClassDeclaration' && stmt.id) top.add(stmt.id.name);
		if (stmt.type === 'VariableDeclaration') for (const d of stmt.declarations) patternNames(d.id, top);
		if (stmt.type === 'ExpressionStatement' && stmt.expression.type === 'AssignmentExpression' &&
			stmt.expression.left && stmt.expression.left.type === 'MemberExpression' && !stmt.expression.left.computed &&
			stmt.expression.left.object && stmt.expression.left.object.type === 'Identifier' && stmt.expression.left.object.name === 'window' &&
			stmt.expression.left.property && stmt.expression.left.property.type === 'Identifier') {
			top.add(stmt.expression.left.property.name);
		}
	}
	const unresolved = new Set();
	for (const stmt of ast.body) analyzeInto(stmt, [top], '<segment>', (name) => unresolved.add(name), src);
	return [...unresolved];
}

module.exports = { parseAst, lineOf, patternNames, collectDecls, collectWindowMounts, analyzeInto, walkScope, segmentFreeVars };
