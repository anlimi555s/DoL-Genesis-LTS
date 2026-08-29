// LTS 引擎兼容 polyfills：GeckoView 102（Firefox 102）及旧版系统 WebView 缺失的 Web API。
// 证据（2026-08-29 实验裁决）：修复前版本真机 logcat 每 50ms 刷
//   "Error during effect ' location ' function: TypeError: this.canvas.ctx.reset is not a function"
// 地点贴图因此透明。上游按桌面最新浏览器开发，移动端内置内核落后时需补齐。
// 每个 polyfill 都是"存在即跳过"，对现代浏览器零影响。
(function () {
	'use strict';

	// CanvasRenderingContext2D.reset()：Firefox 122+ / Chrome 99+
	// 语义：重置上下文状态到默认值并清空画布为透明黑。
	// 使用点：game/00-framework-tools/base-canvas.js（天气画布 BaseCanvas.reset）
	if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.reset) {
		CanvasRenderingContext2D.prototype.reset = function () {
			this.setTransform(1, 0, 0, 1, 0, 0);
			this.globalAlpha = 1;
			this.globalCompositeOperation = 'source-over';
			this.filter = 'none';
			this.imageSmoothingEnabled = true;
			this.shadowBlur = 0;
			this.shadowColor = 'rgba(0,0,0,0)';
			this.shadowOffsetX = 0;
			this.shadowOffsetY = 0;
			this.lineWidth = 1;
			this.lineCap = 'butt';
			this.lineJoin = 'miter';
			this.miterLimit = 10;
			this.font = '10px sans-serif';
			this.textAlign = 'start';
			this.textBaseline = 'alphabetic';
			this.clearRect(0, 0, this.canvas.width, this.canvas.height);
		};
	}

	// Math.clamp()：Chrome 117+ / Firefox 130+
	// 使用点：colour-utils.js、children-story-functions.js 等（静态扫描 249 处）
	if (typeof Math.clamp !== 'function') {
		Math.clamp = function (value, min, max) {
			return Math.min(Math.max(value, min), max);
		};
	}
})();
