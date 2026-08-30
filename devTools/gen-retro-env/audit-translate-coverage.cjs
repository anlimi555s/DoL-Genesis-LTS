// audit-translate-coverage：翻译规则覆盖率审计（以 git 真相为准）。
// 口径：git rename 记录（R）是该翻的真相集——规则翻译结果 == rename 的 new 值才算命中。
// 删除类（0.5.8 有、rename 表无映射）不需要翻。误翻 = 共有路径被规则翻成 0.5.11 不存在的路径。
// 用法：先由 gen-img-manifests.py 生成清单，再跑本脚本。
const fs = require('fs');
const vm = require('vm');

// 加载翻译函数
const sb = { window: {} };
sb.window.window = sb.window;
vm.createContext(sb);
vm.runInContext(fs.readFileSync('compat/genesis-compat/dist/retro-path-translate.js', 'utf8'), sb);
const tr = sb.window.GenesisCompatTranslate58to511;

const data = JSON.parse(fs.readFileSync(process.argv[2] || 'devTools/gen-retro-env/img-manifests.json', 'utf8'));
const p58Set = new Set(data.p58.map((p) => 'img/' + p));
const p511Set = new Set(data.p511.map((p) => 'img/' + p));
const renameMap = data.renames || {};  // old(带 img/ 前缀) -> new

// 真相集：rename 表里有映射的 0.5.8 路径。
// 过滤 git 乱配对：old/new 的前 4 段（含变量名目录）必须一致（跨目录配对 = rename 检测猜错）。
const truth = Object.keys(renameMap).filter((old) => {
	if (!p58Set.has(old)) return false;
	const o4 = old.split('/').slice(0, 4).join('/');
	const n4 = (renameMap[old] || '').split('/').slice(0, 4).join('/');
	return o4 === n4;
});
// 删除类：0.5.8 有、0.5.11 没有、rename 表也没有
const deleted = [...p58Set].filter((p) => !p511Set.has(p) && !(p in renameMap));

let hit = 0;
const missed = [];
for (const old of truth) {
	const t = tr(old);
	if (t === renameMap[old]) {
		hit += 1;
	} else {
		missed.push(old);
	}
}

// 误翻：共有路径（两版同名，不需翻译）被规则翻坏
let misfires = 0;
const misfireSamples = [];
for (const p of p58Set) {
	if (!p511Set.has(p)) continue;
	const t = tr(p);
	if (t && !p511Set.has(t)) { misfires += 1; if (misfireSamples.length < 8) misfireSamples.push(p + ' => ' + t); }
}

console.log('git rename 真相集:', truth.length, ' 删除类(不翻):', deleted.length);
console.log('规则命中:', hit, '/' + truth.length, (hit / truth.length * 100).toFixed(1) + '%');
console.log('规则缺(rename 有映射但没翻对):', missed.length);
console.log('误翻(共有路径被翻坏):', misfires);
if (misfireSamples.length) console.log('误翻样本:', misfireSamples.join('\n  '));

// 规则缺按目录聚合
const byDir = {};
for (const p of missed) {
	const d = p.split('/').slice(0, 3).join('/');
	byDir[d] = (byDir[d] || 0) + 1;
}
console.log('\n=== 规则缺按目录 top20 ===');
Object.entries(byDir).sort((a, b) => b[1] - a[1]).slice(0, 20).forEach(([d, c]) => console.log(' ', d, c));
console.log('\n=== 规则缺样本(前 40) ===');
for (const p of missed.slice(0, 40)) console.log(' ', p, '-> 应为', renameMap[p]);

