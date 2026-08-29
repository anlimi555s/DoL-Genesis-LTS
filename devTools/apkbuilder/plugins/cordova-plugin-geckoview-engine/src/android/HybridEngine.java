package com.cordova.geckoview;

import android.content.Context;
import android.content.pm.PackageInfo;
import android.util.Log;
import android.view.View;
import android.webkit.ValueCallback;
import android.webkit.WebView;

import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPreferences;
import org.apache.cordova.CordovaResourceApi;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.CordovaWebViewEngine;
import org.apache.cordova.ICordovaCookieManager;
import org.apache.cordova.NativeToJsMessageQueue;
import org.apache.cordova.PluginManager;
import org.apache.cordova.engine.SystemWebViewEngine;

/**
 * LTS hybrid 引擎选择器（架构正解：V8 主力 + GeckoView 兼容兜底）。
 *
 * - 系统 WebView >= 85（DoL 实际语法门槛 ES2021/??=）→ SystemWebViewEngine（V8，性能主力）
 * - 否则（老设备/厂商不更新 WebView）→ GeckoViewEngine（自带现代引擎，兼容兜底）
 *
 * 选择在构造时决定一次，之后所有 CordovaWebViewEngine 接口转发给 delegate。
 * 注意：SystemWebView 85-98 同样缺 ctx.reset（Chrome 99+），游戏层 polyfill 对两个引擎都生效。
 */
public class HybridEngine implements CordovaWebViewEngine {
    private static final String TAG = "HybridEngine";
    private static final int MIN_WEBVIEW_MAJOR = 85;

    private final CordovaWebViewEngine delegate;

    public HybridEngine(Context context, CordovaPreferences preferences) {
        if (isSystemWebViewUsable(context)) {
            Log.i(TAG, "LTS hybrid: system WebView OK, using SystemWebViewEngine (V8)");
            delegate = new SystemWebViewEngine(context, preferences);
        } else {
            Log.i(TAG, "LTS hybrid: system WebView too old, falling back to GeckoViewEngine");
            delegate = new GeckoViewEngine(context, preferences);
        }
    }

    /** 检测系统 WebView 大版本号（API 26+ 才支持 getCurrentWebViewPackage）。 */
    private static boolean isSystemWebViewUsable(Context context) {
        try {
            if (android.os.Build.VERSION.SDK_INT < 26) {
                return false; // 老系统无法检测，保守走 GeckoView 兜底
            }
            PackageInfo pi = WebView.getCurrentWebViewPackage();
            if (pi == null || pi.versionName == null) {
                return false;
            }
            int major = Integer.parseInt(pi.versionName.split("\\.")[0]);
            return major >= MIN_WEBVIEW_MAJOR;
        } catch (Throwable t) {
            Log.w(TAG, "LTS hybrid: WebView detection failed, using GeckoView fallback", t);
            return false;
        }
    }

    /* ---- CordovaWebViewEngine 接口转发 ---- */

    @Override
    public void init(CordovaWebView parentWebView, CordovaInterface cordova,
                     CordovaWebViewEngine.Client client, CordovaResourceApi resourceApi,
                     PluginManager pluginManager, NativeToJsMessageQueue nativeToJsMessageQueue) {
        delegate.init(parentWebView, cordova, client, resourceApi, pluginManager, nativeToJsMessageQueue);
    }

    @Override
    public CordovaWebView getCordovaWebView() {
        return delegate.getCordovaWebView();
    }

    @Override
    public ICordovaCookieManager getCookieManager() {
        return delegate.getCookieManager();
    }

    @Override
    public View getView() {
        return delegate.getView();
    }

    @Override
    public void loadUrl(String url, boolean clearNavigationStack) {
        delegate.loadUrl(url, clearNavigationStack);
    }

    @Override
    public void stopLoading() {
        delegate.stopLoading();
    }

    @Override
    public String getUrl() {
        return delegate.getUrl();
    }

    @Override
    public void clearCache() {
        delegate.clearCache();
    }

    @Override
    public void clearHistory() {
        delegate.clearHistory();
    }

    @Override
    public boolean canGoBack() {
        return delegate.canGoBack();
    }

    @Override
    public boolean goBack() {
        return delegate.goBack();
    }

    @Override
    public void setPaused(boolean value) {
        delegate.setPaused(value);
    }

    @Override
    public void destroy() {
        delegate.destroy();
    }

    @Override
    public void evaluateJavascript(String js, ValueCallback<String> callback) {
        delegate.evaluateJavascript(js, callback);
    }
}
