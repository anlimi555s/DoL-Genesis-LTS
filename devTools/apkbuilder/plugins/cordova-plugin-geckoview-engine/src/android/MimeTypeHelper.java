package com.cordova.geckoview;

import android.net.Uri;
import android.text.TextUtils;
import android.webkit.MimeTypeMap;

import java.util.Collections;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/**
 * Resolves the correct MIME type for bundled Cordova assets.
 * CordovaResourceApi sometimes reports {@code application/octet-stream} for JS/CSS assets.
 * GeckoView refuses to execute scripts with a binary MIME type, so we normalize here.
 */
final class MimeTypeHelper {

    private static final Map<String, String> EXTRA_MIME_TYPES;

    static {
        Map<String, String> map = new HashMap<>();
        map.put("js", "application/javascript");
        map.put("mjs", "application/javascript");
        map.put("cjs", "application/javascript");
        map.put("ts", "application/javascript");
        map.put("tsx", "application/javascript");
        map.put("css", "text/css");
        map.put("json", "application/json");
        map.put("map", "application/json");
        map.put("wasm", "application/wasm");
        map.put("svg", "image/svg+xml");
        map.put("woff", "font/woff");
        map.put("woff2", "font/woff2");
        map.put("ttf", "font/ttf");
        map.put("otf", "font/otf");
        EXTRA_MIME_TYPES = Collections.unmodifiableMap(map);
    }

    private MimeTypeHelper() {
    }

    static String ensureMimeType(Uri source, String candidate) {
        if (!TextUtils.isEmpty(candidate) && !"application/octet-stream".equals(candidate)) {
            return candidate;
        }
        String path = source != null ? source.getPath() : null;
        if (TextUtils.isEmpty(path)) {
            return candidate;
        }
        int dot = path.lastIndexOf('.');
        if (dot < 0 || dot == path.length() - 1) {
            return candidate;
        }
        String ext = path.substring(dot + 1).toLowerCase(Locale.US);
        String guessed = MimeTypeMap.getSingleton().getMimeTypeFromExtension(ext);
        if (!TextUtils.isEmpty(guessed)) {
            return guessed;
        }
        String fallback = EXTRA_MIME_TYPES.get(ext);
        if (fallback != null) {
            return fallback;
        }
        return candidate;
    }
}
