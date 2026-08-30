// phone-cdp：连手机 webview(adb forward 9222)执行 eval / 截图。
// 用法：node phone-cdp.cjs eval "<js>" | node phone-cdp.cjs shot [输出png]
const fs = require('fs');

(async () => {
	const mode = process.argv[2] || 'eval';
	const arg = process.argv[3];
	const r = await fetch('http://localhost:9222/json');
	const targets = await r.json();
	const page = targets.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
	if (!page) { console.error('无页面 target'); process.exit(1); }
	const ws = new WebSocket(page.webSocketDebuggerUrl);
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
		if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg.result); pending.delete(msg.id); }
	};
	await new Promise((r2) => { ws.onopen = r2; });

	if (mode === 'eval') {
		const res = await send('Runtime.evaluate', { expression: arg, returnByValue: true, awaitPromise: true });
		if (res.exceptionDetails) console.error('EXC:', res.exceptionDetails.text, (res.exceptionDetails.exception && res.exceptionDetails.exception.description) || '');
		else console.log(JSON.stringify(res.result.value, null, 2));
	} else if (mode === 'shot') {
		const res = await send('Page.captureScreenshot', { format: 'png' });
		const outPath = arg || 'phone-shot.png';
		fs.writeFileSync(outPath, Buffer.from(res.data, 'base64'));
		console.log('saved:', outPath);
	} else if (mode === 'console-on') {
		await send('Runtime.enable');
		console.log('console 已开启(本进程退出后失效)');
	}
	ws.close();
	process.exit(0);
})();
