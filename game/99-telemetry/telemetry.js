// LTS 遥测层（telemetry）：游戏内部性能观测。
// - monkey-patch 包裹上游函数，不改任何游戏逻辑；整目录删除即可移除。
// - 输出走 console.error（[telemetry] 前缀）→ GeckoView consoleOutputEnabled（仅 debug 构建）→ logcat。
// - 运行时开销 <0.1%（纯计时/计数），release 构建 console 输出关闭即自然静默。
// - 模块加载顺序：99 目录最后执行，此时上游对象均已就绪；未就绪的对象每 2s 重试 patch。
(function () {
	'use strict';
	if (typeof jQuery === 'undefined' || !window.performance) return;

	const L = (window.__LTS_TELEMETRY__ = {
		stats: {
			passage: { count: 0, bodyMs: 0, restMs: 0 },
			model: { compiles: 0, compileMs: 0, composes: 0, composeMs: 0 },
			weather: { draws: 0, drawMs: 0 },
			state: { snapshots: 0, snapshotMs: 0 },
			events: { initToDisplayMs: 0 },
			longTasks: 0,
			recentGaps: [],
		},
		_lastReport: {},
		patched: { model: false, compose: false, weather: false, state: false },
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

	/* ---------- 1. passage 管线 ---------- */
	let tInit, tDisplay;
	jQuery(document).on(':passageinit', () => {
		tInit = performance.now();
		tryPatchAll();
	});
	jQuery(document).on(':passagedisplay', () => {
		tDisplay = performance.now();
	});
	jQuery(document).on(':passageend', (ev) => {
		if (tInit === undefined || tDisplay === undefined) return;
		const end = performance.now();
		// :passageend 事件的 dispatch 时刻（timeStamp 与 performance.now 同源）：
		// display → dispatch 之间是侧边栏渲染段；dispatch → 我们（最后注册）执行完是 mod 链段。
		let dispatched = 0;
		try {
			dispatched = (ev && (ev.originalEvent ? ev.originalEvent.timeStamp : ev.timeStamp)) || 0;
		} catch (e) { /* ignore */ }
		const body = tDisplay - tInit;
		const caption = dispatched > tDisplay ? dispatched - tDisplay : 0;
		const chain = dispatched > tDisplay ? end - dispatched : end - tDisplay;
		const s = L.stats.passage;
		s.count++;
		s.bodyMs += body;
		s.restMs += chain + caption;
		const name = (typeof State !== 'undefined' && State.passage) || '?';
		console.error(`[telemetry] passage="${name}" body=${body.toFixed(1)}ms caption=${caption.toFixed(1)}ms chain=${chain.toFixed(1)}ms total=${(end - tInit).toFixed(1)}ms`);
	});

	/* ---------- 2. 角色模型 compile / composeLayers ---------- */
	function patchModel() {
		// CanvasModels.main 是模板对象；真实模型是 CanvasModel 实例（slot "sidebar" 缓存，跨 passage 复用）。
		// 通过 Renderer.locateModel 拿实例再 patch。实例更换时（未打标记）重新 patch。
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
		// 实例可能被重建：检测到未打标记的实例时重新 patch
		if (L.patched.model && typeof Renderer !== 'undefined' && typeof Renderer.locateModel === 'function') {
			try {
				const model = Renderer.locateModel('main', 'sidebar');
				if (model && typeof model.compile === 'function' && !model.__ltsTelemetryPatched) {
					L.patched.model = false;
					model.__ltsTelemetryPatched = true;
					patch(model, 'compile', ms => {
						const s = L.stats.model;
						s.compiles++;
						s.compileMs += ms;
					});
					L.patched.model = true;
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

	/* ---------- 4. SugarCube State 快照 ---------- */
	function patchState() {
		if (L.patched.state) return;
		if (typeof State === 'undefined' || typeof State.momentCreate !== 'function') return;
		L.patched.state = patch(State, 'momentCreate', ms => {
			const s = L.stats.state;
			s.snapshots++;
			s.snapshotMs += ms;
		});
	}

	function tryPatchAll() {
		patchModel();
		patchWeather();
		patchState();
	}

	/* ---------- 5. 主线程长任务（rAF 间隔监控） ---------- */
	let lastFrame = 0;
	function frameLoop(now) {
		if (lastFrame) {
			const gap = now - lastFrame;
			if (gap > 30) {
				L.stats.longTasks++;
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
		// 贴图诊断：渲染路径判断（新 canvas / 旧 weatherdisplay）+ location 层状态
		let diag = '';
		try {
			const V = window.V;
			const hasSkybox = !!document.getElementById('canvasSkybox');
			const sidebar = (typeof Weather !== 'undefined' && Weather.sidebar) || null;
			const locLayer = sidebar && sidebar.layers ? sidebar.layers.get('location') : null;
			const locCanvas = locLayer && locLayer.canvas ? locLayer.canvas.element : null;
			let locPixels = 'no-layer';
			if (locCanvas) {
				try {
					const data = locCanvas.getContext('2d').getImageData(0, 0, Math.min(locCanvas.width, 4), Math.min(locCanvas.height, 4)).data;
					locPixels = Array.from(data.slice(0, 8)).join(',');
				} catch (e) { locPixels = 'read-err'; }
			}
			diag = `diag images=${V.options && V.options.images} weatherUpdate=${V.options && V.options.weatherUpdate} ` +
				`canvasSkyboxInDom=${hasSkybox} sidebarLoaded=${sidebar ? sidebar.loaded.value : 'none'} ` +
				`locationLayerPixels=[${locPixels}]`;
		} catch (e) { diag = 'diag-error ' + e.message; }
		console.error(
			`[telemetry] 10s-summary weatherDraws=${weatherDraws10s} ` +
			`weatherDrawAvgMs=${weatherDraws10s ? (s.weather.drawMs / Math.max(1, s.weather.draws)).toFixed(1) : 0} ` +
			`modelCompiles=${modelCompiles10s} ` +
			`modelCompileAvgMs=${s.model.compiles ? (s.model.compileMs / s.model.compiles).toFixed(1) : 0} ` +
			`composeCalls=${diff('composes', s.model.composes)} ` +
			`composeAvgMs=${s.model.composes ? (s.model.composeMs / s.model.composes).toFixed(1) : 0} ` +
			`longTasks=${s.longTasks} recentGaps=[${s.recentGaps.join(',')}] ` +
			diag
		);
	}, 10000);

	/* ---------- patch 重试 ---------- */
	setInterval(tryPatchAll, 2000);

	console.error('[telemetry] installed');
})();
