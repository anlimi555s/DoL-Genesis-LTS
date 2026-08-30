// 检查 retro-env.js 里每个嵌入片段的可解析性（把 // ===== 注释行剥掉后解析）
const fs = require('fs');
const acorn = require('C:/Users/Selena/Desktop/dol-mod/sugarcube-2-ModLoader-master/node_modules/acorn/dist/acorn.js');
const src = fs.readFileSync('compat/genesis-compat/dist/retro-env.js', 'utf8');
// 提取工厂函数体（window.GenesisCompatRetroEnv = function (...) { BODY } 的 BODY）
const m = src.match(/window\.GenesisCompatRetroEnv = function \([\s\S]*?\{([\s\S]*)\n\treturn \{/);
if (!m) { console.log('未找到工厂体'); process.exit(1); }
const body = m[1];
// 按 // ===== 注释分段（注释行整行剔除）
const rawSegs = body.split(/\n\/\/ ===== /);
let ok = 0;
for (let i = 1; i < rawSegs.length; i++) {
	let seg = rawSegs[i];
	const nl = seg.indexOf('\n');
	const label = seg.slice(0, nl).trim();
	seg = seg.slice(nl); // 去掉注释残行
	try {
		acorn.parse(seg, { ecmaVersion: 'latest', sourceType: 'script', ranges: true });
		ok++;
	} catch (e) {
		console.log('坏段:', label, '→', e.message.slice(0, 90));
	}
}
console.log('可解析段:', ok, '/', rawSegs.length - 1);
// 整体解析（除桥接段外）
try {
	acorn.parse(body, { ecmaVersion: 'latest', sourceType: 'script', ranges: true });
	console.log('整体 body: OK');
} catch (e) {
	console.log('整体 body 失败:', e.message.slice(0, 120));
}
