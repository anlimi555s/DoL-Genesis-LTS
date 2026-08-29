package com.cordova.geckoview;

import android.content.Context;
import android.content.SharedPreferences;
import android.content.res.AssetManager;
import android.net.Uri;
import android.text.TextUtils;

import org.apache.cordova.CordovaResourceApi;
import org.apache.cordova.LOG;

import java.io.BufferedOutputStream;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.InetAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.SocketException;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Minimal embedded HTTP server that serves files from Cordova's ResourceApi.
 */
class LocalHttpServer {

    private static final String TAG = "LocalHttpServer";
    private static final String LOCAL_HOST = "localhost";
    private static final String APP_PREFIX = "/_app_file_";
    private static final String CDV_PREFIX = "/_cdvfile_/";
    private static final String ANDROID_ASSET_PREFIX = "file:///android_asset/";
    private static final String DEFAULT_APP_BASE = "file:///android_asset/www/";
    private static final int FIXED_PORT = 8080;
    private static final String CONTROL_PREFIX = "/__self_update__/";
    private static final String PREFS_NAME = "geckoview_engine_prefs";
    private static final String PREF_OVERRIDE_BASE = "override_base";
    private static final String PREF_OVERRIDE_ENTRY = "override_entry";

    private final CordovaResourceApi resourceApi;
    private final ExecutorService executor = Executors.newCachedThreadPool();
    private ServerSocket serverSocket;
    private Thread acceptThread;
    private volatile boolean running;
    private String baseUrl;
    private final String appBase;
    private final AssetManager assetManager;
    private final String assetListingRoot;
    private final File fileListingRoot;
    private String defaultRelativePath = "index.html";
    private final Context appContext;

    LocalHttpServer(CordovaResourceApi resourceApi, String appBasePath, Context context) {
        this.resourceApi = resourceApi;
        this.appContext = context != null ? context.getApplicationContext() : null;
        String canonicalBase = TextUtils.isEmpty(appBasePath) ? DEFAULT_APP_BASE : appBasePath;
        if (!canonicalBase.endsWith("/")) {
            canonicalBase += "/";
        }
        this.appBase = canonicalBase;
        if (context != null) {
            assetManager = context.getAssets();
        } else {
            assetManager = null;
        }
        if (appBase.startsWith(ANDROID_ASSET_PREFIX)) {
            String rel = appBase.substring(ANDROID_ASSET_PREFIX.length());
            while (rel.startsWith("/")) {
                rel = rel.substring(1);
            }
            if (rel.endsWith("/")) {
                rel = rel.substring(0, rel.length() - 1);
            }
            assetListingRoot = rel;
            fileListingRoot = null;
        } else {
            assetListingRoot = null;
            File root = null;
            try {
                Uri uri = Uri.parse(appBase);
                if ("file".equalsIgnoreCase(uri.getScheme())) {
                    root = new File(uri.getPath());
                }
            } catch (Exception ignored) {
            }
            fileListingRoot = root;
        }
    }

    synchronized void start() throws IOException {
        if (running) {
            return;
        }
        InetAddress loopback = InetAddress.getLoopbackAddress();
        serverSocket = new ServerSocket(FIXED_PORT, 0, loopback);
        running = true;
        baseUrl = String.format(Locale.US, "http://%s:%d", LOCAL_HOST, serverSocket.getLocalPort());
        acceptThread = new Thread(this::acceptLoop, "GeckoAssetServer");
        acceptThread.start();
        executor.execute(this::logAppDirectoryContents);
    }

    private void acceptLoop() {
        while (running) {
            try {
                final Socket client = serverSocket.accept();
                executor.execute(() -> handleClient(client));
            } catch (SocketException se) {
                // Socket closed during shutdown.
                break;
            } catch (IOException e) {
                if (running) {
                    e.printStackTrace();
                }
            }
        }
    }

    synchronized void stop() {
        running = false;
        if (serverSocket != null) {
            try {
                serverSocket.close();
            } catch (IOException ignored) {
            }
            serverSocket = null;
        }
        executor.shutdownNow();
    }

    private int loadPreferredPort() {
        return FIXED_PORT;
    }

    private void savePreferredPort(int port) {
        // No-op; fixed port
    }

    String getBaseUrl() {
        return baseUrl;
    }

    String rewriteUri(String url) {
        if (TextUtils.isEmpty(url) || baseUrl == null) {
            return url;
        }
        if (url.startsWith("javascript:")) {
            return url;
        }
        if (url.startsWith("http://") || url.startsWith("https://")) {
            Uri uri = Uri.parse(url);
            String host = uri.getHost();
            if ("localhost".equalsIgnoreCase(host) || "127.0.0.1".equals(host)) {
                String path = uri.getPath();
                if (TextUtils.isEmpty(path) || "/".equals(path)) {
                    path = "/index.html";
                }
                if (path.startsWith("/")) {
                    path = path.substring(1);
                }
                String rewritten = baseUrl + "/" + path;
                if (!TextUtils.isEmpty(uri.getEncodedQuery())) {
                    rewritten += "?" + uri.getEncodedQuery();
                }
                return rewritten;
            }
        }
        if (url.startsWith("cdvfile://")) {
            return baseUrl + CDV_PREFIX + Uri.encode(url);
        }
        if (url.startsWith(appBase)) {
            String rel = url.substring(appBase.length());
            return joinUrl(rel);
        }
        if (url.startsWith("file:///android_asset/www/")) {
            String rel = url.substring("file:///android_asset/www/".length());
            return joinUrl(rel);
        }
        return url;
    }

    String rewriteFileUri(String fileUri) {
        if (TextUtils.isEmpty(fileUri) || baseUrl == null) {
            return fileUri;
        }
        if (fileUri.startsWith(appBase)) {
            String rel = fileUri.substring(appBase.length());
            return joinUrl(rel);
        }
        String effectiveBase = getEffectiveBase();
        if (!TextUtils.isEmpty(effectiveBase) && fileUri.startsWith(effectiveBase)) {
            String rel = fileUri.substring(effectiveBase.length());
            return joinUrl(rel);
        }
        return fileUri;
    }

    void setDefaultAsset(String assetUri) {
        if (TextUtils.isEmpty(assetUri)) {
            return;
        }
        if (assetUri.startsWith(appBase)) {
            String rel = assetUri.substring(appBase.length());
            if (TextUtils.isEmpty(rel)) {
                rel = "index.html";
            }
            defaultRelativePath = rel;
        }
    }

    private String joinUrl(String relative) {
        if (relative.startsWith("/")) {
            relative = relative.substring(1);
        }
        return baseUrl + "/" + relative;
    }

    private void handleClient(Socket socket) {
        try (Socket client = socket;
             BufferedReader reader = new BufferedReader(new InputStreamReader(client.getInputStream(), StandardCharsets.US_ASCII));
             OutputStream rawOut = new BufferedOutputStream(client.getOutputStream())) {

            String requestLine = reader.readLine();
            if (requestLine == null || requestLine.isEmpty()) {
                return;
            }
            LOG.d(TAG, "Request line: " + requestLine);
            String[] parts = requestLine.split(" ");
            if (parts.length < 2) {
                sendStatus(rawOut, "400 Bad Request", "Malformed request");
                return;
            }
            String method = parts[0];
            String path = parts[1];

            // Consume and log request headers for debugging.
            String headerLine;
            while ((headerLine = reader.readLine()) != null && headerLine.length() > 0) {
                LOG.d(TAG, "Header: " + headerLine);
            }

            if (!"GET".equalsIgnoreCase(method)) {
                sendStatus(rawOut, "405 Method Not Allowed", "Only GET supported");
                return;
            }

            servePath(rawOut, path);
        } catch (IOException e) {
            // Ignore broken pipe etc.
            LOG.e(TAG, "Error handling request", e);
        }
    }

    private void servePath(OutputStream out, String rawPath) throws IOException {
        LOG.d(TAG, "Serving path " + rawPath);
        if (rawPath != null && rawPath.startsWith(CONTROL_PREFIX)) {
            if (handleControlPath(out, rawPath)) {
                return;
            }
        }
        Uri target = resolveTarget(rawPath);
        if (target == null) {
            LOG.e(TAG, "No target resolved for " + rawPath);
            sendStatus(out, "404 Not Found", "Not Found");
            return;
        }
        CordovaResourceApi.OpenForReadResult result = null;
        Uri servingUri = target;
        try {
            Uri remapped = resourceApi.remapUri(target);
            result = resourceApi.openForRead(remapped != null ? remapped : target);
        } catch (FileNotFoundException e) {
            Uri bundledFallback = resolveBundledFallback(rawPath, target);
            if (bundledFallback != null) {
                try {
                    Uri remappedFallbackAsset = resourceApi.remapUri(bundledFallback);
                    result = resourceApi.openForRead(remappedFallbackAsset != null ? remappedFallbackAsset : bundledFallback);
                    servingUri = bundledFallback;
                    LOG.d(TAG, "Served bundled fallback " + bundledFallback + " for " + rawPath);
                } catch (IOException ignoredFallbackErr) {
                    // continue with existing index fallback handling below
                }
            }
            if (servingUri != null && !servingUri.equals(target)) {
                // bundled fallback succeeded
            } else
            if (!TextUtils.isEmpty(defaultRelativePath) && (TextUtils.isEmpty(target.getLastPathSegment()) || "index.html".equals(target.getLastPathSegment()))) {
                Uri fallback = Uri.parse(appBase + defaultRelativePath);
                servingUri = fallback;
                try {
                    Uri remappedFallback = resourceApi.remapUri(fallback);
                    result = resourceApi.openForRead(remappedFallback != null ? remappedFallback : fallback);
                } catch (IOException ex) {
                    LOG.e(TAG, "Fallback asset not found for " + rawPath, ex);
                    sendStatus(out, "404 Not Found", "Not Found");
                    return;
                }
            } else {
                LOG.e(TAG, "File not found for " + target, e);
                sendStatus(out, "404 Not Found", "Not Found");
                return;
            }
        } catch (IOException e) {
            LOG.e(TAG, "Failed serving " + target, e);
            sendStatus(out, "500 Internal Server Error", "Error");
            return;
        }

        if (result == null) {
            LOG.e(TAG, "No open result for " + rawPath);
            sendStatus(out, "404 Not Found", "Not Found");
            return;
        }

        String mimeType = result.mimeType;
        if (TextUtils.isEmpty(mimeType)) {
            mimeType = resourceApi.getMimeType(servingUri);
        }
        if (TextUtils.isEmpty(mimeType)) {
            mimeType = "application/octet-stream";
        }
        mimeType = MimeTypeHelper.ensureMimeType(servingUri, mimeType);

        long length = result.length;
        StringBuilder headers = new StringBuilder();
        headers.append("HTTP/1.1 200 OK\r\n");
        headers.append("Content-Type: ").append(mimeType).append("\r\n");
        if (length >= 0) {
            headers.append("Content-Length: ").append(length).append("\r\n");
        }
        headers.append("Access-Control-Allow-Origin: *\r\n");
        headers.append("Connection: close\r\n\r\n");
        out.write(headers.toString().getBytes(StandardCharsets.US_ASCII));

        try (InputStream is = result.inputStream) {
            byte[] buffer = new byte[16 * 1024];
            int read;
            while ((read = is.read(buffer)) != -1) {
                out.write(buffer, 0, read);
            }
        }
        out.flush();
    }

    private Uri resolveBundledFallback(String rawPath, Uri target) {
        if (TextUtils.isEmpty(rawPath) || target == null) {
            return null;
        }
        String effectiveBase = getEffectiveBase();
        if (TextUtils.isEmpty(effectiveBase) || TextUtils.equals(normalizeBase(effectiveBase), normalizeBase(appBase))) {
            return null;
        }

        String path = rawPath;
        int query = path.indexOf('?');
        if (query >= 0) {
            path = path.substring(0, query);
        }
        if (path.startsWith(CDV_PREFIX)) {
            return null;
        }
        String relative;
        if (path.startsWith(APP_PREFIX)) {
            relative = path.substring(APP_PREFIX.length());
        } else {
            relative = path;
        }
        if (TextUtils.isEmpty(relative) || "/".equals(relative)) {
            relative = defaultRelativePath;
        } else if (relative.startsWith("/")) {
            relative = relative.substring(1);
        }
        if (TextUtils.isEmpty(relative)) {
            return null;
        }
        return Uri.parse(appBase + relative);
    }

    Uri resolveAppUri(String path) {
        return resolveTarget(path);
    }

    private Uri resolveTarget(String path) {
        if (TextUtils.isEmpty(path)) {
            path = "/";
        }
        int query = path.indexOf('?');
        if (query >= 0) {
            path = path.substring(0, query);
        }
        if (path.startsWith(CDV_PREFIX)) {
            String encoded = path.substring(CDV_PREFIX.length());
            String decoded = Uri.decode(encoded);
            LOG.d(TAG, "Decoding " + path + " -> " + decoded);
            return Uri.parse(decoded);
        }
        String relative;
        if (path.startsWith(APP_PREFIX)) {
            relative = path.substring(APP_PREFIX.length());
        } else {
            relative = path;
        }
        if (TextUtils.isEmpty(relative) || "/".equals(relative)) {
            String overrideEntry = getOverrideEntry();
            relative = TextUtils.isEmpty(overrideEntry) ? defaultRelativePath : overrideEntry;
        } else if (relative.startsWith("/")) {
            relative = relative.substring(1);
        }
        String effectiveBase = getEffectiveBase();
        if (TextUtils.isEmpty(effectiveBase)) {
            effectiveBase = appBase;
        }
        if (!effectiveBase.endsWith("/")) {
            effectiveBase += "/";
        }
        return Uri.parse(effectiveBase + relative);
    }

    private boolean handleControlPath(OutputStream out, String rawPath) throws IOException {
        Uri controlUri = parseControlUri(rawPath);
        if (controlUri == null) {
            sendStatus(out, "400 Bad Request", "Invalid control path");
            return true;
        }
        String path = controlUri.getPath();
        if (TextUtils.isEmpty(path)) {
            sendStatus(out, "404 Not Found", "Not Found");
            return true;
        }
        if (path.endsWith("/activate")) {
            String base = controlUri.getQueryParameter("base");
            String entry = controlUri.getQueryParameter("entry");
            if (TextUtils.isEmpty(base)) {
                sendStatus(out, "400 Bad Request", "Missing base");
                return true;
            }
            String normalizedBase = normalizeBase(base);
            if (TextUtils.isEmpty(normalizedBase) || !normalizedBase.startsWith("file://")) {
                sendStatus(out, "400 Bad Request", "Invalid base");
                return true;
            }
            String normalizedEntry = normalizeEntry(entry);
            saveOverride(normalizedBase, normalizedEntry);
            sendJson(out, "{\"ok\":true,\"mode\":\"updated\"}");
            return true;
        }
        if (path.endsWith("/deactivate")) {
            clearOverride();
            sendJson(out, "{\"ok\":true,\"mode\":\"bundled\"}");
            return true;
        }
        if (path.endsWith("/status")) {
            String base = getOverrideBase();
            String entry = getOverrideEntry();
            boolean active = !TextUtils.isEmpty(base);
            String body = "{\"ok\":true,\"active\":" + (active ? "true" : "false") +
                    ",\"base\":\"" + jsonEscape(active ? base : appBase) + "\"" +
                    ",\"entry\":\"" + jsonEscape(TextUtils.isEmpty(entry) ? defaultRelativePath : entry) + "\"}";
            sendJson(out, body);
            return true;
        }
        sendStatus(out, "404 Not Found", "Not Found");
        return true;
    }

    private Uri parseControlUri(String rawPath) {
        if (TextUtils.isEmpty(rawPath)) {
            return null;
        }
        try {
            return Uri.parse(baseUrl + rawPath);
        } catch (Exception ignored) {
            return null;
        }
    }

    private String normalizeBase(String base) {
        String value = base == null ? "" : base.trim();
        if (TextUtils.isEmpty(value)) {
            return "";
        }
        return value.endsWith("/") ? value : value + "/";
    }

    private String normalizeEntry(String entry) {
        String value = entry == null ? "" : entry.trim();
        if (TextUtils.isEmpty(value)) {
            return defaultRelativePath;
        }
        while (value.startsWith("/")) {
            value = value.substring(1);
        }
        return TextUtils.isEmpty(value) ? defaultRelativePath : value;
    }

    private synchronized void saveOverride(String base, String entry) {
        if (appContext == null) {
            return;
        }
        SharedPreferences prefs = appContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit()
                .putString(PREF_OVERRIDE_BASE, base)
                .putString(PREF_OVERRIDE_ENTRY, entry)
                .apply();
        LOG.d(TAG, "Updated local server override base=" + base + " entry=" + entry);
    }

    private synchronized void clearOverride() {
        if (appContext == null) {
            return;
        }
        SharedPreferences prefs = appContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit()
                .remove(PREF_OVERRIDE_BASE)
                .remove(PREF_OVERRIDE_ENTRY)
                .apply();
        LOG.d(TAG, "Cleared local server override; serving bundled assets.");
    }

    private synchronized String getOverrideBase() {
        if (appContext == null) {
            return "";
        }
        SharedPreferences prefs = appContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        return prefs.getString(PREF_OVERRIDE_BASE, "");
    }

    private synchronized String getOverrideEntry() {
        if (appContext == null) {
            return "";
        }
        SharedPreferences prefs = appContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        return prefs.getString(PREF_OVERRIDE_ENTRY, "");
    }

    private String getEffectiveBase() {
        String override = getOverrideBase();
        if (!TextUtils.isEmpty(override)) {
            return normalizeBase(override);
        }
        return appBase;
    }

    private void sendJson(OutputStream out, String body) throws IOException {
        if (body == null) {
            body = "{}";
        }
        byte[] data = body.getBytes(StandardCharsets.UTF_8);
        String header = "HTTP/1.1 200 OK\r\n" +
                "Content-Type: application/json\r\n" +
                "Content-Length: " + data.length + "\r\n" +
                "Access-Control-Allow-Origin: *\r\n" +
                "Connection: close\r\n\r\n";
        out.write(header.getBytes(StandardCharsets.US_ASCII));
        out.write(data);
        out.flush();
    }

    private String jsonEscape(String text) {
        String value = text == null ? "" : text;
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private void sendStatus(OutputStream out, String status, String message) throws IOException {
        String body = message == null ? "" : message;
        String header = "HTTP/1.1 " + status + "\r\n" +
                "Content-Type: text/plain\r\n" +
                "Content-Length: " + body.length() + "\r\n" +
                "Connection: close\r\n\r\n";
        LOG.d(TAG, "Responding " + status + " for " + message);
        out.write(header.getBytes(StandardCharsets.US_ASCII));
        out.write(body.getBytes(StandardCharsets.UTF_8));
        out.flush();
    }

    private void logAppDirectoryContents() {
        if (assetManager != null && assetListingRoot != null) {
            String rootLabel = TextUtils.isEmpty(assetListingRoot) ? "/" : assetListingRoot;
            LOG.d(TAG, "Listing Cordova assets under " + rootLabel);
            try {
                dumpAssetDirectory(assetListingRoot, "");
            } catch (IOException e) {
                LOG.e(TAG, "Failed to enumerate assets for " + rootLabel, e);
            }
            return;
        }
        if (fileListingRoot != null && fileListingRoot.exists()) {
            LOG.d(TAG, "Listing Cordova files under " + fileListingRoot.getAbsolutePath());
            dumpFileDirectory(fileListingRoot, "");
            return;
        }
        LOG.d(TAG, "Asset listing unavailable for base path " + appBase);
    }

    private void dumpAssetDirectory(String assetPath, String relativePath) throws IOException {
        String actualPath = assetPath == null ? "" : assetPath;
        String[] children = assetManager.list(actualPath);
        if (children == null || children.length == 0) {
            String name = !TextUtils.isEmpty(relativePath) ? relativePath : actualPath;
            if (!TextUtils.isEmpty(name)) {
                LOG.d(TAG, "File: " + name);
            }
            return;
        }
        for (String child : children) {
            String childAssetPath = TextUtils.isEmpty(actualPath) ? child : actualPath + "/" + child;
            String childRelative = TextUtils.isEmpty(relativePath) ? child : relativePath + "/" + child;
            String[] nested = assetManager.list(childAssetPath);
            boolean isDirectory = nested != null && nested.length > 0;
            if (isDirectory) {
                LOG.d(TAG, "Dir: " + childRelative + "/");
                dumpAssetDirectory(childAssetPath, childRelative);
            } else {
                LOG.d(TAG, "File: " + childRelative);
            }
        }
    }

    private void dumpFileDirectory(File dir, String relativePath) {
        if (dir == null) {
            return;
        }
        if (!dir.exists()) {
            LOG.d(TAG, "Path does not exist: " + dir.getAbsolutePath());
            return;
        }
        if (dir.isFile()) {
            String display = TextUtils.isEmpty(relativePath) ? dir.getName() : relativePath;
            LOG.d(TAG, "File: " + display);
            return;
        }
        File[] children = dir.listFiles();
        if (children == null || children.length == 0) {
            LOG.d(TAG, "Dir: " + (TextUtils.isEmpty(relativePath) ? dir.getName() : relativePath) + "/");
            return;
        }
        for (File child : children) {
            String childRelative = TextUtils.isEmpty(relativePath) ? child.getName() : relativePath + "/" + child.getName();
            if (child.isDirectory()) {
                LOG.d(TAG, "Dir: " + childRelative + "/");
                dumpFileDirectory(child, childRelative);
            } else {
                LOG.d(TAG, "File: " + childRelative);
            }
        }
    }
}
