// audit-writes：审计 retro-env.js 沙盒对注入参数（V/setup/T/... ）的写入点。
// 目的：定沙盒只读方案前，先弄清旧代码（0.5.8 引擎函数）到底写不写主线数据。
// 检测四类写：赋值（含深层成员，Proxy 拦不住）、自增减、delete、突变方法调用（push/splice/set 等）。
// 用法：node devTools/gen-retro-env/audit-writes.cjs
const acorn = require('C:/Users/Selena/Desktop/dol-mod/sugarcube-2-ModLoader-master/node_modules/acorn/dist/acorn.js');
const fs = require('fs');
const path = require('path');

const SRC_PATH = path.join(__dirname, '../../compat/genesis-compat/dist/retro-env.js');
const src = fs.readFileSync(SRC_PATH, 'utf8');
const ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'script', ranges: true });

// 沙盒内可写主线的根对象名（V 是 Proxy，其余是注入直引用）
const ROOTS = new Set(['V', 'setup', 'T', 'Renderer', 'Utils', 'Errors', 'ZIndices', 'State', 'Time', 'Story', 'passage']);
const MUT_METHODS = new Set(['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse', 'fill', 'copyWithin', 'set', 'delete', 'add', 'clear']);

function lineOf(node) { return src.slice(0, node.start).split('\n').length; }
function textOf(node) { return src.slice(node.start, node.end).slice(0, 140).replace(/\s+/g, ' '); }

// 成员链最左标识符名
function rootName(node) {
	let n = node;
	while (n.type === 'MemberExpression') n = n.object;
	return n.type === 'Identifier' ? n.name : null;
}

// 从节点向上找最近函数名（输出定位用）
function enclosingFn(node, fnStack) {
	for (let i = fnStack.length - 1; i >= 0; i--) {
		if (node.start >= fnStack[i].start && node.end <= fnStack[i].end) return fnStack[i].name;
	}
	return '<top>';
}

const writes = [];
const fnStack = [];

function walk(node) {
	if (!node || typeof node !== 'object' || !node.type) return;
	if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') {
		fnStack.push({ start: node.start, end: node.end, name: node.id ? node.id.name : '<anon>' });
	}
	const fn = fnStack.length ? fnStack[fnStack.length - 1].name : '<top>';

	if (node.type === 'AssignmentExpression') {
		const root = rootName(node.left);
		if (root && ROOTS.has(root)) writes.push({ line: lineOf(node), fn, kind: 'assign', root, text: textOf(node) });
	} else if (node.type === 'UpdateExpression') {
		const root = rootName(node.argument);
		if (root && ROOTS.has(root)) writes.push({ line: lineOf(node), fn, kind: 'update', root, text: textOf(node) });
	} else if (node.type === 'UnaryExpression' && node.operator === 'delete') {
		const root = rootName(node.argument);
		if (root && ROOTS.has(root)) writes.push({ line: lineOf(node), fn, kind: 'delete', root, text: textOf(node) });
	} else if (node.type === 'CallExpression' && node.callee.type === 'MemberExpression') {
		const root = rootName(node.callee.object);
		const method = node.callee.property.type === 'Identifier' ? node.callee.property.name : null;
		if (root && ROOTS.has(root) && method && MUT_METHODS.has(method)) {
			writes.push({ line: lineOf(node), fn, kind: 'mut:' + method, root, text: textOf(node) });
		}
	}

	for (const key of Object.keys(node)) {
		if (key === 'parent') continue;
		const v = node[key];
		if (Array.isArray(v)) { for (const c of v) walk(c); }
		else if (v && typeof v === 'object' && v.type) walk(v);
	}
	if (fnStack.length && fnStack[fnStack.length - 1].end === node.end && node.type.indexOf('Function') !== -1) {
		fnStack.pop();
	}
}

walk(ast);

console.log('写入点总数:', writes.length);
console.log('按根对象分布:');
const byRoot = {};
for (const w of writes) byRoot[w.root] = (byRoot[w.root] || 0) + 1;
for (const [k, v] of Object.entries(byRoot)) console.log(' ', k, v);

console.log('\n明细:');
for (const w of writes) {
	console.log(`  L${w.line} [${w.fn}] ${w.kind} ${w.root}: ${w.text}`);
}
