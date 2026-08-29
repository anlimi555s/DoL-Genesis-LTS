// genesis-notice：游戏内远程通告横幅。
// 从仓库 notice.html 拉 HTML 片段，注入侧边栏（mod 管理按钮下方）。
// 发通告 = 改仓库里的 notice.html，玩家下次 passageend 自动看到。
// 缓存 10 分钟，避免每次 passageend 都打网络。
(function () {
	'use strict';

	var NOTICE_URL = 'https://cdn.jsdelivr.net/gh/anlimi555s/DoL-Genesis-LTS@main/notice.html';
	var CACHE_KEY = 'genesis_notice_cache';
	var CACHE_TTL = 10 * 60 * 1000; // 10 分钟

	var injectedHtml = null;

	function injectSidebar(html) {
		if (!html || typeof $ === 'undefined') return;
		try {
			var old = document.getElementById('genesis-sidebar-notice');
			if (old && old.parentNode) old.parentNode.removeChild(old);
		} catch (e) { /* ignore */ }
		try {
			var div = document.createElement('div');
			div.id = 'genesis-sidebar-notice';
			div.style.cssText = 'margin:6px 0;padding:6px 10px;border:1px solid var(--gold,#D4AF37);border-radius:6px;background:rgba(212,175,55,0.06);font-size:12px;line-height:1.5;';
			div.innerHTML = html;
			var target = document.getElementById('overlayButtons');
			if (target && target.parentNode) {
				target.parentNode.insertBefore(div, target.nextSibling);
				injectedHtml = html;
			}
		} catch (e) { console.warn('[genesis-notice] inject failed:', e); }
	}

	function loadNotice() {
		// 1. 本地缓存命中且未过期 → 直接注入
		try {
			var cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
			if (cached && cached.t && Date.now() - cached.t < CACHE_TTL && cached.html) {
				injectSidebar(cached.html);
				return;
			}
		} catch (e) { /* ignore */ }
		// 2. 拉远程
		fetch(NOTICE_URL, { cache: 'no-store' })
			.then(function (r) { return r.ok ? r.text() : Promise.reject(new Error('HTTP ' + r.status)); })
			.then(function (html) {
				if (!html || !html.trim()) return;
				try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), html: html })); } catch (e) { /* ignore */ }
				injectSidebar(html);
			})
			.catch(function (e) { /* 网络失败静默，通告不是关键路径 */ });
	}

	// 每次 passageend 都尝试（侧边栏 DOM 存在才注入）
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

	// 首次尝试（标题画面也可见）
	setTimeout(loadNotice, 3000);
})();
