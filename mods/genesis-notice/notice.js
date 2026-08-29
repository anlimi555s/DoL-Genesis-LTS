// genesis-notice：游戏内远程通告横幅。
// 从仓库 notice.html 拉 HTML 片段，只显示在标题画面（开始界面），菜单下方。
// 发通告 = 改仓库里的 notice.html，玩家下次回到标题画面自动看到。
// 缓存 10 分钟，避免每次加载都打网络。
(function () {
	'use strict';

	var NOTICE_URL = 'https://cdn.jsdelivr.net/gh/anlimi555s/DoL-Genesis-LTS@v0.1.1/notice.html';
	var CACHE_KEY = 'genesis_notice_cache';
	var CACHE_TTL = 10 * 60 * 1000; // 10 分钟

	var injectedHtml = null;

	// 标题画面判断：
	// 1. SugarCube 状态：当前 passage 是 StoryTitle（标题画面）
	// 2. 游戏内侧边栏已渲染（#overlayButtons）→ 一定不是标题画面
	// 3. 兜底：标题画面默认菜单 #menu 存在
	function isTitleScreen() {
		try {
			if (typeof State !== 'undefined' && State.passage === 'StoryTitle') return true;
		} catch (e) { /* ignore */ }
		if (document.getElementById('overlayButtons')) return false;
		return !!document.getElementById('menu');
	}

	function removeNotice() {
		var old = document.getElementById('genesis-sidebar-notice');
		if (old && old.parentNode) old.parentNode.removeChild(old);
	}

	function injectNotice(html) {
		if (!html || typeof $ === 'undefined') return;
		if (!isTitleScreen()) {
			removeNotice();
			return;
		}
		removeNotice();
		try {
			var div = document.createElement('div');
			div.id = 'genesis-sidebar-notice';
			div.style.cssText = 'margin:6px 0;padding:6px 10px;border:1px solid var(--gold,#D4AF37);border-radius:6px;background:rgba(212,175,55,0.06);font-size:12px;line-height:1.5;';
			div.innerHTML = html;
			// 标题画面：挂在默认菜单下方（与 New Game/Load 同区）
			var anchor = document.getElementById('menu');
			if (anchor && anchor.parentNode) {
				anchor.parentNode.insertBefore(div, anchor.nextSibling);
				injectedHtml = html;
			}
		} catch (e) { console.warn('[genesis-notice] inject failed:', e); }
	}

	function loadNotice() {
		// 非标题画面直接清掉，不拉网络
		if (!isTitleScreen()) {
			removeNotice();
			return;
		}
		// 1. 本地缓存命中且未过期 → 直接注入
		try {
			var cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
			if (cached && cached.t && Date.now() - cached.t < CACHE_TTL && cached.html) {
				injectNotice(cached.html);
				return;
			}
		} catch (e) { /* ignore */ }
		// 2. 拉远程
		fetch(NOTICE_URL, { cache: 'no-store' })
			.then(function (r) { return r.ok ? r.text() : Promise.reject(new Error('HTTP ' + r.status)); })
			.then(function (html) {
				if (!html || !html.trim()) return;
				try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), html: html })); } catch (e) { /* ignore */ }
				injectNotice(html);
			})
			.catch(function (e) { /* 网络失败静默，通告不是关键路径 */ });
	}

	// 每次 passageend 都检查：标题画面才注入，进入游戏即移除
	if (window.jQuery) {
		window.jQuery(document).on(':passageend', loadNotice);
	} else {
		// 兜底：轮询
		var timer = setInterval(function () {
			if (window.jQuery) {
				window.jQuery(document).on(':passageend', loadNotice);
				clearInterval(timer);
			}
		}, 1000);
	}

	// 首次尝试（标题画面可见）
	setTimeout(loadNotice, 3000);
})();
