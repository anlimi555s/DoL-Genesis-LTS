// 打印沙盒工厂体指定行号段（对照浏览器 <anonymous>:6254 的 eval 行号）
const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', '..', 'compat', 'genesis-compat', 'dist', 'retro-env.js'), 'utf8');
const bodyStart = src.indexOf('{', src.indexOf('window.GenesisCompatRetroEnv'));
const body = src.slice(bodyStart + 1);
const lines = body.split('\n');
const target = parseInt(process.argv[2] || '6254', 10);
for (let i = target - 7; i < Math.min(target + 3, lines.length); i++) {
	console.log((i + 1) + ': ' + lines[i]);
}
