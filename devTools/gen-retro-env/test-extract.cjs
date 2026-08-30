const { execSync } = require('child_process');
const src = execSync('git show 0.5.8.10:game/03-JavaScript/ingame.js', { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

function extractFunction(src, name) {
	let m = new RegExp('function\\s+' + name + '\\s*\\(').exec(src);
	if (!m) m = new RegExp('(?:window\\.)?' + name + '\\s*=\\s*function\\s*\\(').exec(src);
	if (!m) m = new RegExp('(?:window\\.)?' + name + '\\s*=\\s*\\(?[^=]*\\)?\\s*=>\\s*\\{').exec(src);
	if (!m) return null;
	let depth = 0;
	let inStr = null;
	let inTpl = false;
	let i = src.indexOf('{', m.index);
	for (; i < src.length; i++) {
		const c = src[i];
		const prev = i > 0 ? src[i - 1] : '';
		if (inStr) {
			if (c === inStr && prev !== '\\') inStr = null;
			continue;
		}
		if (inTpl) {
			if (c === '`' && prev !== '\\') inTpl = false;
			else if (c === '$' && src[i + 1] === '{') { depth++; i++; }
			continue;
		}
		if (c === '"' || c === "'" || c === '`') { inTpl = c === '`'; inStr = inTpl ? null : c; continue; }
		if (c === '{') depth++;
		else if (c === '}') { depth--; if (depth === 0) return src.slice(m.index, i + 1); }
	}
	return null;
}

const r = extractFunction(src, 'clothesIndex');
console.log('clothesIndex:', r ? r.length + ' 字符' : 'NULL');
if (r) console.log('头:', r.slice(0, 60), '尾:', r.slice(-50));
const r2 = extractFunction(src, 'painToTearsLvl');
console.log('painToTearsLvl:', r2 ? r2.length + ' 字符' : 'NULL');
