package com.cordova.geckoview;

import android.app.Activity;
import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.res.XmlResourceParser;
import android.net.Uri;
import android.text.TextUtils;
import android.util.AttributeSet;
import android.util.Xml;
import android.view.KeyEvent;
import android.view.View;
import android.widget.FrameLayout;
import android.webkit.ValueCallback;

import org.apache.cordova.CordovaBridge;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPreferences;
import org.apache.cordova.CordovaResourceApi;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.CordovaWebViewEngine;
import org.apache.cordova.ICordovaCookieManager;
import org.apache.cordova.NativeToJsMessageQueue;
import org.apache.cordova.PluginManager;
import org.apache.cordova.LOG;

import org.mozilla.geckoview.AllowOrDeny;
import org.mozilla.geckoview.GeckoResult;
import org.mozilla.geckoview.GeckoRuntime;
import org.mozilla.geckoview.GeckoRuntimeSettings;
import org.mozilla.geckoview.GeckoSession;
import org.mozilla.geckoview.GeckoView;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import org.xmlpull.v1.XmlPullParser;
import org.xmlpull.v1.XmlPullParserException;

/**
 * Minimal, stable GeckoView-based Cordova WebView engine.
 *
 * - GeckoView 146.x compatible
 * - Cordova-Android 10+ CordovaWebViewEngine interface compatible
 * - JS-based back navigation (window.history.back())
 */
public class GeckoViewEngine implements CordovaWebViewEngine {
    private static final String TAG = "GeckoViewEngine";

    // Cordova state
    protected CordovaWebView parentWebView;
    protected CordovaInterface cordova;
    protected CordovaPreferences preferences;
    protected Client cordovaClient;
    protected CordovaResourceApi resourceApi;
    protected PluginManager pluginManager;
    protected NativeToJsMessageQueue nativeToJsMessageQueue;
    protected CordovaBridge bridge;
    protected boolean bridgeModeConfigured;

    // Gecko + server state
    protected EngineFrameLayout containerView;
    protected GeckoView geckoView;
    protected GeckoSession geckoSession;
    protected static GeckoRuntime sRuntime;
    protected LocalHttpServer localServer;
    protected String serverBaseUrl;
    protected String startPageUri;

    // Track current URL for Cordova's getUrl()
    protected String currentUrl;

    // No-op cookie manager (Cordova requires an instance)
    protected final ICordovaCookieManager cookieManager = new NoopCookieManager();

    // Constructors (Cordova instantiates through reflection)
    public GeckoViewEngine(Context context, CordovaPreferences preferences) {
        this.preferences = preferences;
        createGeckoView(context);
    }

    public GeckoViewEngine(Context context, AttributeSet attrs, CordovaPreferences preferences) {
        this(context, preferences);
    }

    // -------------------------------------------------------------------------
    // CordovaWebViewEngine implementation
    // -------------------------------------------------------------------------

    @Override
    public void init(CordovaWebView parentWebView,
                     CordovaInterface cordova,
                     Client client,
                     CordovaResourceApi resourceApi,
                     PluginManager pluginManager,
                     NativeToJsMessageQueue nativeToJsMessageQueue) {

        this.parentWebView = parentWebView;
        this.cordova = cordova;
        this.cordovaClient = client;
        this.resourceApi = resourceApi;
        this.pluginManager = pluginManager;
        this.nativeToJsMessageQueue = nativeToJsMessageQueue;

        if (nativeToJsMessageQueue != null && cordova != null && !bridgeModeConfigured) {
            nativeToJsMessageQueue.addBridgeMode(
                    new NativeToJsMessageQueue.OnlineEventsBridgeMode(
                            new NativeToJsMessageQueue.OnlineEventsBridgeMode.OnlineEventsBridgeModeDelegate() {
                                @Override
                                public void setNetworkAvailable(boolean value) {
                                    dispatchSyntheticOnlineEvent(value);
                                }

                                @Override
                                public void runOnUiThread(Runnable r) {
                                    GeckoViewEngine.this.cordova.getActivity().runOnUiThread(r);
                                }
                            }
                    ));
            nativeToJsMessageQueue.addBridgeMode(
                    new NativeToJsMessageQueue.EvalBridgeMode(this, cordova));
            bridgeModeConfigured = true;
        }

        if (pluginManager != null && nativeToJsMessageQueue != null) {
            bridge = new CordovaBridge(pluginManager, nativeToJsMessageQueue);
        }

        rebindSessionDelegates();

        if (resourceApi != null) {
            startLocalServer(resourceApi);
        }
    }

    @Override
    public CordovaWebView getCordovaWebView() {
        return parentWebView;
    }

    @Override
    public ICordovaCookieManager getCookieManager() {
        return cookieManager;
    }

    @Override
    public View getView() {
        return containerView;
    }

    @Override
    public void loadUrl(String url, boolean clearNavigationStack) {
        if (clearNavigationStack) {
            clearHistory();
        }
        String rewritten = rewriteStartUrl(url);
        if (cordovaClient != null) {
            cordovaClient.onPageStarted(rewritten);
        }
        currentUrl = rewritten;
        if (geckoSession != null) {
            geckoSession.loadUri(rewritten);
        }
    }

    @Override
    public void stopLoading() {
        if (geckoSession != null) {
            geckoSession.stop();
        }
    }

    @Override
    public String getUrl() {
        return currentUrl;
    }

    @Override
    public void clearCache() {
        // Approximate cache clearing by forcing a cache-bypass reload
        if (geckoSession != null && currentUrl != null) {
            geckoSession.reload(GeckoSession.LOAD_FLAGS_BYPASS_CACHE);
        }
    }

    @Override
    public void clearHistory() {
        recreateSession();
    }

    // -------------------------------------------------------------------------
    // JS-based back navigation
    // -------------------------------------------------------------------------

    @Override
    public boolean canGoBack() {
        // We don't see native history state; let Cordova attempt JS-level back.
        return true;
    }

    @Override
    public boolean goBack() {
        // Use JS to navigate browser history instead of GeckoSession.canGoBack()/goBack()
        String js = "if (window.history && window.history.length > 1) {" +
                    "window.history.back();" +
                    "}";
        evaluateJavascript(js, null);
        return true;
    }

    @Override
    public void setPaused(boolean value) {
        if (geckoSession != null) {
            geckoSession.setActive(!value);
        }
    }

    @Override
    public void destroy() {
        if (localServer != null) {
            localServer.stop();
            localServer = null;
            serverBaseUrl = null;
        }
        if (geckoSession != null) {
            geckoSession.close();
            geckoSession = null;
        }
        if (geckoView != null && containerView != null) {
            containerView.removeView(geckoView);
            geckoView = null;
        }
    }

    @Override
    public void evaluateJavascript(String js, ValueCallback<String> callback) {
        if (geckoSession != null) {
            geckoSession.loadUri("javascript:" + js);
        }
        if (callback != null) {
            // GeckoView doesn't return JS results through this API
            callback.onReceiveValue(null);
        }
    }

    // -------------------------------------------------------------------------
    // Internal helpers
    // -------------------------------------------------------------------------

    private void createGeckoView(Context context) {
        containerView = new EngineFrameLayout(context);
        geckoView = new GeckoView(context);

        if (sRuntime == null) {
            boolean enableRemoteDebug = isDebugBuild(context);
            GeckoRuntimeSettings.Builder settingsBuilder = new GeckoRuntimeSettings.Builder();
            if (enableRemoteDebug) {
                List<String> runtimeArgs = new ArrayList<>();
                runtimeArgs.add("-start-debugger-server");
                runtimeArgs.add("6000");
                settingsBuilder
                        .remoteDebuggingEnabled(true)
                        // LTS 遥测：debug 构建输出 JS console 到 logcat（GeckoConsole 标签）。
                        // release 构建不开启，遥测自然静默。
                        .consoleOutput(true)
                        .arguments(runtimeArgs.toArray(new String[0]));
            }
            // LTS 内存说明（GeckoView 102 无 pref() API，用内核默认）：
            // - 单内容进程（默认）——省内存，低配机友好
            // - 图片解码内存上限 256MB（Firefox 内核默认）
            // - 解码内存可回收（默认开启）
            GeckoRuntimeSettings settings = settingsBuilder.build();
            sRuntime = GeckoRuntime.create(context.getApplicationContext(), settings);
        }

        geckoSession = new GeckoSession();
        geckoSession.open(sRuntime);

        geckoView.setSession(geckoSession);

        rebindSessionDelegates();

        containerView.addView(
                geckoView,
                new FrameLayout.LayoutParams(
                        FrameLayout.LayoutParams.MATCH_PARENT,
                        FrameLayout.LayoutParams.MATCH_PARENT)
        );
    }

    private boolean isDebugBuild(Context context) {
        if (context == null) {
            return false;
        }
        try {
            ApplicationInfo info = context.getApplicationInfo();
            return (info.flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0;
        } catch (Exception ignored) {
            return false;
        }
    }

    private void recreateSession() {
        if (geckoSession != null) {
            geckoSession.close();
        }

        geckoSession = new GeckoSession();
        geckoSession.open(sRuntime);
        geckoView.setSession(geckoSession);

        rebindSessionDelegates();
    }

    private void rebindSessionDelegates() {
        if (geckoSession == null) {
            return;
        }

        geckoSession.setContentDelegate(new GeckoSession.ContentDelegate() {});

        geckoSession.setNavigationDelegate(new GeckoSession.NavigationDelegate() {
            @Override
            public GeckoResult<AllowOrDeny> onLoadRequest(
                    GeckoSession session,
                    GeckoSession.NavigationDelegate.LoadRequest request) {
                return interceptLocalLoad(request);
            }

            @Override
            public void onLocationChange(GeckoSession session,
                                         String url,
                                         List<GeckoSession.PermissionDelegate.ContentPermission> perms) {
                currentUrl = url;
                if (cordovaClient != null) {
                    cordovaClient.onPageFinishedLoading(url);
                }
            }
        });

        geckoSession.setPromptDelegate(new EnginePromptDelegate());
    }

    private GeckoResult<GeckoSession.PromptDelegate.PromptResponse> handleCordovaPrompt(
            GeckoSession.PromptDelegate.TextPrompt prompt) {

        if (bridge == null) {
            return null;
        }

        String origin = currentUrl != null ? currentUrl : "";
        String defaultValue = prompt.defaultValue;
        String message = prompt.message != null ? prompt.message : "";

        String handled = bridge.promptOnJsPrompt(origin, message, defaultValue);
        if (handled == null) {
            return null;
        }

        return GeckoResult.fromValue(prompt.confirm(handled));
    }

    private class EnginePromptDelegate implements GeckoSession.PromptDelegate {
        @Override
        public GeckoResult<PromptResponse> onAlertPrompt(
                GeckoSession session,
                AlertPrompt prompt) {
            Activity activity = cordova != null ? cordova.getActivity() : null;
            GeckoResult<PromptResponse> result = new GeckoResult<>();
            if (activity == null) {
                result.complete(prompt.dismiss());
                return result;
            }
            activity.runOnUiThread(() -> {
                androidx.appcompat.app.AlertDialog.Builder builder =
                        new androidx.appcompat.app.AlertDialog.Builder(activity);
                builder.setMessage(prompt.message != null ? prompt.message : "");
                builder.setPositiveButton(android.R.string.ok,
                        (dialog, which) -> result.complete(prompt.dismiss()));
                builder.setOnCancelListener(dialog -> result.complete(prompt.dismiss()));
                builder.show();
            });
            return result;
        }

        @Override
        public GeckoResult<PromptResponse> onTextPrompt(
                GeckoSession session,
                TextPrompt prompt) {
            return handleCordovaPrompt(prompt);
        }
    }

    private void dispatchSyntheticOnlineEvent(boolean online) {
        if (geckoSession == null) {
            return;
        }
        String eventName = online ? "online" : "offline";
        String js =
                "(function(){var e=document.createEvent('Events');" +
                "e.initEvent('" + eventName + "',false,false);" +
                "window.dispatchEvent(e);" +
                "})();";
        evaluateJavascript(js, null);
    }

    private void startLocalServer(CordovaResourceApi api) {
        if (localServer != null) {
            return;
        }
        try {
            Context context = containerView != null ? containerView.getContext() : null;
            localServer = new LocalHttpServer(api, null, context);
            localServer.start();
            serverBaseUrl = localServer.getBaseUrl();
            LOG.d(TAG, "Local server started at " + serverBaseUrl);
            startPageUri = resolveStartAsset(containerView.getContext());
            if (!TextUtils.isEmpty(startPageUri)) {
                LOG.d(TAG, "Resolved start page " + startPageUri);
                localServer.setDefaultAsset(startPageUri);
            }
        } catch (IOException e) {
            LOG.e(TAG, "Failed to start local server", e);
        }
    }

    private String rewriteStartUrl(String url) {
        if (localServer == null || url == null) {
            return url;
        }
        LOG.d(TAG, "Rewriting URL " + url);
        try {
            Uri uri = Uri.parse(url);
            String host = uri.getHost();
            if (!TextUtils.isEmpty(host) &&
                ("localhost".equalsIgnoreCase(host) || "127.0.0.1".equals(host))) {
                String path = uri.getPath();
                if ((TextUtils.isEmpty(path) || "/".equals(path) || "/index.html".equals(path)) &&
                        !TextUtils.isEmpty(startPageUri)) {
                    LOG.d(TAG, "Routing localhost start path to " + startPageUri);
                    return localServer.rewriteFileUri(startPageUri);
                }
            }
        } catch (Exception ignored) { }

        if (resourceApi != null) {
            try {
                Uri original = Uri.parse(url);
                Uri remapped = resourceApi.remapUri(original);
                if (remapped != null && "file".equalsIgnoreCase(remapped.getScheme())) {
                    String remappedString = remapped.toString();
                    localServer.setDefaultAsset(remappedString);
                    return localServer.rewriteFileUri(remappedString);
                }
            } catch (Exception ignored) {
            }
        }
        return localServer.rewriteUri(url);
    }

    private GeckoResult<AllowOrDeny> interceptLocalLoad(
            GeckoSession.NavigationDelegate.LoadRequest request) {
        if (request == null || resourceApi == null || cordova == null ||
                TextUtils.isEmpty(request.uri)) {
            return null;
        }

        Uri uri;
        try {
            uri = Uri.parse(request.uri);
        } catch (Exception e) {
            return null;
        }
        if (uri == null) {
            return null;
        }

        String scheme = uri.getScheme();
        boolean isCordovaScheme =
                "cdvfile".equalsIgnoreCase(scheme) ||
                (TextUtils.isEmpty(scheme) && request.uri.startsWith("cdvfile://"));
        boolean isFileScheme = "file".equalsIgnoreCase(scheme);
        boolean isLocalHttp = isLocalLoopback(uri);

        if (isLocalHttp) {
            return null;
        }

        // Gecko can treat Loader.data HTML navigations as data-doc context on some builds,
        // which breaks relative script URLs. Route local HTML navigations through the
        // embedded localhost server instead.
        if ((isCordovaScheme || isFileScheme) && shouldRerouteToLocalServer(request.uri)) {
            final String rewritten = localServer != null ? localServer.rewriteUri(request.uri) : request.uri;
            if (!TextUtils.isEmpty(rewritten) && !TextUtils.equals(rewritten, request.uri)) {
                Activity activity = cordova.getActivity();
                Runnable rerouteTask = () -> {
                    if (geckoSession == null) {
                        return;
                    }
                    currentUrl = rewritten;
                    geckoSession.loadUri(rewritten);
                };
                if (activity != null) {
                    activity.runOnUiThread(rerouteTask);
                } else {
                    rerouteTask.run();
                }
                return GeckoResult.fromValue(AllowOrDeny.DENY);
            }
        }

        if (!isCordovaScheme && !isFileScheme) {
            return null;
        }

        Uri resourceTarget = uri;
        if (resourceTarget == null) {
            return null;
        }

        final String originalUri = request.uri;
        final Uri finalTarget = resourceTarget;
        GeckoResult<AllowOrDeny> decision = new GeckoResult<>();
        cordova.getThreadPool().execute(() -> {
            boolean handled = streamLocalResourceToGecko(originalUri, finalTarget);
            decision.complete(handled
                    ? AllowOrDeny.DENY
                    : AllowOrDeny.ALLOW);
        });
        return decision;
    }

    private boolean shouldRerouteToLocalServer(String uriText) {
        if (TextUtils.isEmpty(uriText) || localServer == null) {
            return false;
        }
        String u = uriText.toLowerCase();
        if (u.startsWith("javascript:")) {
            return false;
        }
        if (u.contains(".html") || u.endsWith("/") || u.endsWith(".htm")) {
            return true;
        }
        // Handle root file/cdvfile navigations that may omit extension.
        if (u.startsWith("file://") || u.startsWith("cdvfile://")) {
            int q = u.indexOf('?');
            String noQuery = q >= 0 ? u.substring(0, q) : u;
            return noQuery.endsWith("/www") || noQuery.endsWith("/www/") || noQuery.endsWith("/tienlen");
        }
        return false;
    }

    private boolean isLocalLoopback(Uri uri) {
        if (uri == null) {
            return false;
        }
        String scheme = uri.getScheme();
        if (!"http".equalsIgnoreCase(scheme) && !"https".equalsIgnoreCase(scheme)) {
            return false;
        }
        String host = uri.getHost();
        if (TextUtils.isEmpty(host)) {
            return false;
        }
        return "localhost".equalsIgnoreCase(host) || "127.0.0.1".equals(host);
    }

    private boolean streamLocalResourceToGecko(String originalUri, Uri parsedUri) {
        if (geckoSession == null || resourceApi == null) {
            return false;
        }

        Uri target = parsedUri;
        try {
            Uri remapped = resourceApi.remapUri(parsedUri);
            if (remapped != null) {
                target = remapped;
            }
        } catch (Exception ignored) {
        }

        CordovaResourceApi.OpenForReadResult result;
        try {
            result = resourceApi.openForRead(target);
        } catch (IOException e) {
            LOG.e(TAG, "Failed to open local resource " + originalUri, e);
            return false;
        }

        byte[] data;
        try (InputStream input = result.inputStream) {
            data = drainStream(input);
        } catch (IOException e) {
            LOG.e(TAG, "Failed to read local resource " + originalUri, e);
            return false;
        }

        final byte[] payload = data;
        final String mimeType = resolveMimeType(target, result.mimeType);
        LOG.d(TAG, "Streaming " + payload.length + " bytes for " + originalUri + " from " + target);
        Activity activity = cordova.getActivity();
        Runnable loaderTask = () -> {
            if (geckoSession == null) {
                return;
            }
            GeckoSession.Loader loader = new GeckoSession.Loader()
                    .uri(originalUri)
                    .data(payload, mimeType);
            geckoSession.load(loader);
        };
        if (activity != null) {
            activity.runOnUiThread(loaderTask);
        } else {
            loaderTask.run();
        }
        return true;
    }

    private byte[] drainStream(InputStream input) throws IOException {
        if (input == null) {
            return new byte[0];
        }
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        byte[] chunk = new byte[16 * 1024];
        int read;
        while ((read = input.read(chunk)) != -1) {
            buffer.write(chunk, 0, read);
        }
        return buffer.toByteArray();
    }

    private String resolveMimeType(Uri source, String provided) {
        String candidate = provided;
        if (TextUtils.isEmpty(candidate) && resourceApi != null && source != null) {
            candidate = resourceApi.getMimeType(source);
        }
        if (TextUtils.isEmpty(candidate)) {
            candidate = "application/octet-stream";
        }
        return MimeTypeHelper.ensureMimeType(source, candidate);
    }

    private String resolveStartAsset(Context context) {
        int id = context.getResources().getIdentifier("config", "xml", context.getPackageName());
        if (id == 0) {
            return null;
        }
        XmlResourceParser parser = context.getResources().getXml(id);
        try {
            int event = parser.getEventType();
            while (event != XmlPullParser.END_DOCUMENT) {
                if (event == XmlPullParser.START_TAG && "content".equals(parser.getName())) {
                    String src = parser.getAttributeValue(null, "src");
                    if (!TextUtils.isEmpty(src)) {
                        if (!src.startsWith("file:///")) {
                            src = "file:///android_asset/www/" + src;
                        }
                        return src;
                    }
                }
                event = parser.next();
            }
        } catch (Exception ignored) {
        } finally {
            parser.close();
        }
        return null;
    }

    // -------------------------------------------------------------------------
    // No-op cookie manager
    // -------------------------------------------------------------------------

    private class EngineFrameLayout extends FrameLayout implements CordovaWebViewEngine.EngineView {

        EngineFrameLayout(Context context) {
            super(context);
        }

        @Override
        public CordovaWebView getCordovaWebView() {
            return parentWebView;
        }

        @Override
        public boolean dispatchKeyEvent(KeyEvent event) {
            if (cordovaClient != null) {
                Boolean handled = cordovaClient.onDispatchKeyEvent(event);
                if (handled != null) {
                    return handled.booleanValue();
                }
            }
            return super.dispatchKeyEvent(event);
        }
    }

    private static class NoopCookieManager implements ICordovaCookieManager {
        @Override public void setCookiesEnabled(boolean accept) { }
        @Override public void setCookie(String url, String value) { }
        @Override public String getCookie(String url) { return null; }
        @Override public void clearCookies() { }
        @Override public void flush() { }
    }
}
