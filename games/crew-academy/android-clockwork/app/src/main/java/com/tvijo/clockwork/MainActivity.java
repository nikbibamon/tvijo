package com.tvijo.clockwork;

import android.app.Activity;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.WindowInsets;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

import androidx.webkit.WebViewAssetLoader;

import java.io.ByteArrayInputStream;

public final class MainActivity extends Activity {
    private static final String HOST = WebViewAssetLoader.DEFAULT_DOMAIN;
    private static final String ENTRY = "https://" + HOST + "/assets/index.html";
    private WebView game;

    @Override
    public void onCreate(Bundle state) {
        super.onCreate(state);
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.rgb(21, 26, 42));
        if (Build.VERSION.SDK_INT >= 30) {
            root.setOnApplyWindowInsetsListener((view, insets) -> {
                var padding = insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
                view.setPadding(padding.left, padding.top, padding.right, padding.bottom);
                return insets;
            });
        } else {
            root.setFitsSystemWindows(true);
        }
        setContentView(root);

        game = new WebView(this);
        game.setBackgroundColor(Color.rgb(21, 26, 42));
        root.addView(game, new FrameLayout.LayoutParams(-1, -1));
        root.requestApplyInsets();
        WebSettings settings = game.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);

        WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
            .build();
        game.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return !isGameAsset(request.getUrl());
            }

            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                if (isGameAsset(request.getUrl())) {
                    WebResourceResponse asset = loader.shouldInterceptRequest(request.getUrl());
                    if (asset != null) return asset;
                }
                return new WebResourceResponse("text/plain", "utf-8", new ByteArrayInputStream(new byte[0]));
            }
        });
        game.loadUrl(ENTRY);
    }

    private static boolean isGameAsset(Uri url) {
        return "https".equals(url.getScheme()) && HOST.equals(url.getHost())
            && url.getPath() != null && url.getPath().startsWith("/assets/");
    }

    @Override
    protected void onDestroy() {
        if (game != null) {
            ((FrameLayout) game.getParent()).removeView(game);
            game.destroy();
        }
        super.onDestroy();
    }
}
