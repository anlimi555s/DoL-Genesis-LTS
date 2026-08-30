// check-html：起 headless Chrome 加载成品 HTML，抓 console 日志验证 GenesisCompat 钩子是否注册。
// 用法：node devTools/gen-retro-env/check-html.cjs [html路径]
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const htmlPath = process.argv[2] || 'DoL-Genesis-LTS v0.2.html';
const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
if (!fs.existsSync(chromePath)) { console.error('Chrome 未找到'); process.exit(1); }

const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genesis-check-'));
const port = 9333;

(async () => {
	const chrome = spawn(chromePath, [
		'--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
		'--remote-debugging-port=' + port, '--user-data-dir=' + userDataDir,
		'about:blank',
	], { stdio: 'ignore' });

	const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
	let ws;
	for (let i = 0; i < 30; i++) {
		try {
			const r = await fetch('http://localhost:' + port + '/json');
			const targets = await r.json();
			const page = targets.find((t) => t.type === 'page');
			if (page) { ws = new WebSocket(page.webSocketDebuggerUrl); break; }
		} catch (e) { /* 未就绪 */ }
		await sleep(500);
	}
	if (!ws) { console.error('CDP 连接失败'); chrome.kill(); process.exit(1); }

	const logs = [];
	let id = 0;
	const pending = new Map();
	function send(method, params) {
		return new Promise((resolve) => {
			const mid = ++id;
			pending.set(mid, resolve);
			ws.send(JSON.stringify({ id: mid, method, params }));
		});
	}
	ws.onmessage = (ev) => {
		const msg = JSON.parse(ev.data);
		if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg.result); pending.delete(msg.id); return; }
		if (msg.method === 'Runtime.consoleAPICalled') {
			const text = (msg.params.args || []).map((a) => a.value !== undefined ? String(a.value) : (a.description || '')).join(' ');
			logs.push('[console] ' + text.slice(0, 300));
		}
		if (msg.method === 'Runtime.exceptionThrown') {
			logs.push('[exception] ' + (msg.params.exceptionDetails.text || '') + ' ' + ((msg.params.exceptionDetails.exception && msg.params.exceptionDetails.exception.description) || '').slice(0, 200));
		}
	};
	await new Promise((r) => { ws.onopen = r; });
	await send('Runtime.enable');
	await send('Page.enable');
	await send('Page.navigate', { url: 'file:///' + path.resolve(htmlPath).replace(/\\/g, '/') });
	await sleep(12000);

	const relevant = logs.filter((l) => /GenesisCompat|img-translate|img keys|modUtils|ModLoader ====== load|afterModLoad/i.test(l));
	console.log('=== 相关日志(' + relevant.length + '/' + logs.length + ') ===');
	relevant.slice(0, 30).forEach((l) => console.log(l));
	if (!relevant.length) console.log('(无) 全部日志样例:', logs.slice(0, 10).join('\n'));

	// 直接在页面里 eval 测试加载的翻译函数（真机函数版本验证）
	const testCases = [
		'img/clothes/over_upper/假日小兔外套/left.png',
		'img/clothes/over_upper/假日小兔外套/right_cover.png',
		'img/clothes/feet/bootheels/full_gray.png',
		'img/body/breasts/breasts0.png',
		'img/body/cum/Chest 1.png',
	];
	const evalResult = await send('Runtime.evaluate', {
		expression: 'JSON.stringify({fn: typeof window.GenesisCompatTranslate58to511, results: [' +
			testCases.map((c) => 'window.GenesisCompatTranslate58to511 ? window.GenesisCompatTranslate58to511(' + JSON.stringify(c) + ') : "no-fn"').join(',') +
			'], cases: ' + JSON.stringify(testCases) + '})',
		returnByValue: true,
	});
	console.log('=== 页面内翻译函数测试 ===');
	const r = evalResult.result && evalResult.result.value !== undefined ? JSON.parse(evalResult.result.value) : { fn: 'eval-failed', results: [] };
	console.log('fn type:', r.fn);
	r.cases.forEach((c, i) => console.log(' ', c, '=>', r.results[i]));

	ws.close();
	chrome.kill();
	process.exit(0);
})();
