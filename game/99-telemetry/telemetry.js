// LTS 遥测层（telemetry）：游戏内部性能观测。
// - monkey-patch 包裹上游函数，不改任何游戏逻辑；整目录删除即可移除。
// - 输出走 console.error（[telemetry] 前缀）→ GeckoView consoleOutput(true)（仅 debug 构建）→ logcat。
// - 运行时开销 <0.1%（纯计时/计数），release 构建 console 输出关闭即自然静默。
// - 模块加载顺序：99 目录最后执行，此时上游对象均已就绪；未就绪的对象每 2s 重试 patch。
(function () {
	'use strict';
	if (typeof jQuery === 'undefined' || !window.performance) return;

	const L = (window.__LTS_TELEMETRY__ = {
		stats: {
			passage: { count: 0, bodyMs: 0, restMs: 0 },
			passages: new Map(), // name -> {n, bodyMs, totalMs, max}
			model: { compiles: 0, compileMs: 0, composes: 0, composeMs: 0 },
			weather: { draws: 0, drawMs: 0 },
			// 沙盒（GenesisCompat）：环境初始化 / 层函数求值 / 替换成本 / 路径翻译
			sandbox: { initMs: 0, srcCalls: 0, srcMs: 0, srcCrashes: 0, replaceMs: 0, replacedFields: 0, layers: 0, translateCalls: 0, translateHits: 0, translate404s: 0 },
			longTasks: 0,
			recentGaps: [],
			frames: { n: 0, sumMs: 0, slowMs: 0 },
		},
		_lastReport: {},
		patched: { model: false, compose: false, weather: false },
		// 供 GenesisCompat retro-apply 调用的埋点钩子（零依赖，纯计数/计时）
		sandbox: {
			init: (ms) => { L.stats.sandbox.initMs = ms; },
			replace: (ms, fields, layers) => {
				L.stats.sandbox.replaceMs += ms;
				L.stats.sandbox.replacedFields += fields;
				L.stats.sandbox.layers = Math.max(L.stats.sandbox.layers, layers);
			},
			srcCall: (ms) => { L.stats.sandbox.srcCalls++; L.stats.sandbox.srcMs += ms; },
			srcCrash: () => { L.stats.sandbox.srcCrashes++; },
		},
	});

	function patch(obj, key, onDone) {
		if (!obj || typeof obj[key] !== 'function') return false;
		const orig = obj[key];
		obj[key] = function (...args) {
			const t0 = performance.now();
			let r;
			try {
				r = orig.apply(this, args);
			} finally {
				onDone(performance.now() - t0, args);
			}
			return r;
		};
		return true;
	}

	/* ---------- 1. passage 管线（body / rest 两段，rest = 侧边栏 + mod 链） ---------- */
	let tInit, tDisplay;
	jQuery(document).on(':passageinit', () => {
		tInit = performance.now();
		tryPatchAll();
	});
	jQuery(document).on(':passagedisplay', () => {
		tDisplay = performance.now();
	});
	jQuery(document).on(':passageend', () => {
		if (tInit === undefined || tDisplay === undefined) return;
		const end = performance.now();
		const body = tDisplay - tInit;
		const rest = end - tDisplay;
		const s = L.stats.passage;
		s.count++;
		s.bodyMs += body;
		s.restMs += rest;
		const name = (typeof State !== 'undefined' && State.passage) || '?';
		// 累积统计（per-passage 聚合，供 10s 汇报 top 慢场景）
		let rec = L.stats.passages.get(name);
		if (!rec) {
			rec = { n: 0, bodyMs: 0, totalMs: 0, max: 0 };
			L.stats.passages.set(name, rec);
		}
		rec.n++;
		rec.bodyMs += body;
		rec.totalMs += end - tInit;
		rec.max = Math.max(rec.max, end - tInit);
		console.error(`[telemetry] passage="${name}" body=${body.toFixed(1)}ms rest=${rest.toFixed(1)}ms total=${(end - tInit).toFixed(1)}ms`);
	});

	/* ---------- 2. 角色模型 compile / composeLayers ---------- */
	function patchModel() {
		// CanvasModels.main 是模板对象；真实模型是 CanvasModel 实例（slot "sidebar" 缓存，跨 passage 复用）。
		if (!L.patched.model && typeof Renderer !== 'undefined' && typeof Renderer.locateModel === 'function') {
			let model = null;
			try { model = Renderer.locateModel('main', 'sidebar'); } catch (e) { /* not ready */ }
			if (model && typeof model.compile === 'function') {
				L.patched.model = true;
				model.__ltsTelemetryPatched = true;
				patch(model, 'compile', ms => {
					const s = L.stats.model;
					s.compiles++;
					s.compileMs += ms;
				});
			}
		}
		// 实例被重建时重新 patch
		if (L.patched.model && typeof Renderer !== 'undefined' && typeof Renderer.locateModel === 'function') {
			try {
				const model = Renderer.locateModel('main', 'sidebar');
				if (model && typeof model.compile === 'function' && !model.__ltsTelemetryPatched) {
					model.__ltsTelemetryPatched = true;
					patch(model, 'compile', ms => {
						const s = L.stats.model;
						s.compiles++;
						s.compileMs += ms;
					});
				}
			} catch (e) { /* ignore */ }
		}
		if (!L.patched.compose && typeof Renderer !== 'undefined' && typeof Renderer.composeLayers === 'function') {
			L.patched.compose = patch(Renderer, 'composeLayers', ms => {
				const s = L.stats.model;
				s.composes++;
				s.composeMs += ms;
			});
		}
	}

	/* ---------- 3. 天气 canvas ---------- */
	function patchWeather() {
		if (L.patched.weather) return;
		const Sky = (typeof Weather !== 'undefined' && Weather.Renderer && Weather.Renderer.Sky) || null;
		if (!Sky || typeof Sky.prototype.drawLayers !== 'function') return;
		L.patched.weather = true;
		const orig = Sky.prototype.drawLayers;
		Sky.prototype.drawLayers = async function (...args) {
			const s = L.stats.weather;
			s.draws++;
			const t0 = performance.now();
			const r = await orig.apply(this, args);
			s.drawMs += performance.now() - t0;
			return r;
		};
	}

	function tryPatchAll() {
		patchModel();
		patchWeather();
	}

	/* ---------- 4. 主线程帧率（全量 rAF 间隔统计） ---------- */
	let lastFrame = 0;
	function frameLoop(now) {
		if (lastFrame) {
			const gap = now - lastFrame;
			const f = L.stats.frames;
			f.n++;
			f.sumMs += gap;
			if (gap > 30) {
				L.stats.longTasks++;
				f.slowMs += gap;
				L.stats.recentGaps.push(Math.round(gap));
				if (L.stats.recentGaps.length > 8) L.stats.recentGaps.shift();
			}
		}
		lastFrame = now;
		requestAnimationFrame(frameLoop);
	}
	requestAnimationFrame(frameLoop);

	/* ---------- 周期汇总（每 10s） ---------- */
	function diff(key, now) {
		const d = now - (L._lastReport[key] || 0);
		L._lastReport[key] = now;
		return d;
	}
	setInterval(() => {
		const s = L.stats;
		const weatherDraws10s = diff('weatherDraws', s.weather.draws);
		const modelCompiles10s = diff('modelCompiles', s.model.compiles);
		// 真实帧率（所有 rAF 间隔）
		const f = s.frames;
		const avgFps = f.n && f.sumMs > 0 ? (1000 / (f.sumMs / f.n)).toFixed(1) : '0';
		// 慢场景 top5（按平均 total）
		const top = [...s.passages.entries()]
			.map(([name, r]) => ({ name, avg: r.totalMs / r.n, max: r.max, n: r.n }))
			.sort((a, b) => b.avg - a.avg)
			.slice(0, 5)
			.map(r => `${r.name}(${r.avg.toFixed(0)}/${r.max.toFixed(0)}ms×${r.n})`)
			.join(' ');
		console.error(
			`[telemetry] 10s-summary avgFps=${avgFps} ` +
			`weatherDraws=${weatherDraws10s} weatherDrawAvgMs=${s.weather.draws ? (s.weather.drawMs / s.weather.draws).toFixed(1) : 0} ` +
			`modelCompiles=${modelCompiles10s} compileAvgMs=${s.model.compiles ? (s.model.compileMs / s.model.compiles).toFixed(1) : 0} ` +
			`composeCalls=${diff('composes', s.model.composes)} composeAvgMs=${s.model.composes ? (s.model.composeMs / s.model.composes).toFixed(1) : 0} ` +
			`translateCalls=${diff('translateCalls', s.sandbox.translateCalls)} translateHits=${s.sandbox.translateHits} translate404s=${s.sandbox.translate404s} ` +
			`genesis=${JSON.stringify(s.sandbox.genesis || {})} ` +
			`longTasks=${s.longTasks} recentGaps=[${s.recentGaps.join(',')}] ` +
			`top5=[${top}]`
		);
	}, 10000);

	/* ---------- patch 重试 ---------- */
	setInterval(tryPatchAll, 2000);

	console.error('[telemetry] installed');
})();
