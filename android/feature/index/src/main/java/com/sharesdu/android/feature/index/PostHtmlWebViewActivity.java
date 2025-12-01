package com.sharesdu.android.feature.index;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ProgressBar;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import com.sharesdu.android.feature.index.R;

/**
 * HTML帖子WebView显示页面
 */
public class PostHtmlWebViewActivity extends AppCompatActivity {
    public static final String EXTRA_HTML_CONTENT = "html_content";
    public static final String EXTRA_POST_TITLE = "post_title";
    
    // 为了兼容使用字符串key的情况
    private static final String KEY_HTML_CONTENT = "html_content";
    private static final String KEY_POST_TITLE = "post_title";
    
    private WebView webView;
    private ProgressBar progressBar;
    private Toolbar toolbar;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_post_html_webview);
        
        initViews();
        loadHtmlContent();
    }
    
    private void initViews() {
        toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            String title = getIntent().getStringExtra(EXTRA_POST_TITLE);
            if (title == null || title.isEmpty()) {
                title = getIntent().getStringExtra(KEY_POST_TITLE);
            }
            getSupportActionBar().setTitle(title != null ? title : "HTML帖子");
        }
        toolbar.setNavigationOnClickListener(v -> finish());
        
        webView = findViewById(R.id.web_view);
        progressBar = findViewById(R.id.progress_bar);
        
        setupWebView();
    }
    
    private void setupWebView() {
        WebSettings webSettings = webView.getSettings();
        
        // 启用JavaScript
        webSettings.setJavaScriptEnabled(true);
        
        // 启用DOM存储
        webSettings.setDomStorageEnabled(true);
        
        // 启用数据库存储
        webSettings.setDatabaseEnabled(true);
        
        // 允许访问文件
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        
        // 允许混合内容（HTTP和HTTPS）
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.LOLLIPOP) {
            webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }
        
        // 设置缓存模式
        webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);
        
        // 启用缩放
        webSettings.setSupportZoom(true);
        webSettings.setBuiltInZoomControls(true);
        webSettings.setDisplayZoomControls(false);
        
        // 设置视口
        webSettings.setUseWideViewPort(true);
        webSettings.setLoadWithOverviewMode(true);
        
        // 设置User Agent
        webSettings.setUserAgentString(webSettings.getUserAgentString());
        
        // 设置WebViewClient
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                // 在WebView中加载链接，不跳转到外部浏览器
                view.loadUrl(url);
                return true;
            }
            
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                progressBar.setVisibility(View.GONE);
            }
        });
        
        // 设置WebChromeClient（用于显示进度条）
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                if (newProgress < 100) {
                    progressBar.setVisibility(View.VISIBLE);
                    progressBar.setProgress(newProgress);
                } else {
                    progressBar.setVisibility(View.GONE);
                }
            }
        });
    }
    
    private void loadHtmlContent() {
        // 尝试从两个可能的key获取内容
        String htmlContent = getIntent().getStringExtra(EXTRA_HTML_CONTENT);
        if (htmlContent == null || htmlContent.isEmpty()) {
            htmlContent = getIntent().getStringExtra(KEY_HTML_CONTENT);
        }
        if (htmlContent != null && !htmlContent.isEmpty()) {
            // 包装HTML内容，添加viewport meta标签和样式
            // 使用更宽松的viewport设置，确保内容能完整显示
            String fullHtml = "<!DOCTYPE html>" +
                "<html><head>" +
                "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes\">" +
                "<meta charset=\"UTF-8\">" +
                "<style>" +
                "body { margin: 0; padding: 8px; width: 100%; box-sizing: border-box; } " +
                "* { max-width: 100%; box-sizing: border-box; } " +
                "img { max-width: 100%; height: auto; } " +
                "</style>" +
                "</head><body>" + htmlContent + "</body></html>";
            
            // 使用loadDataWithBaseURL，设置baseURL为null，但使用data协议
            webView.loadDataWithBaseURL("file:///android_asset/", fullHtml, "text/html", "UTF-8", null);
        }
    }
    
    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
    
    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }
    
    /**
     * 启动PostHtmlWebViewActivity的静态方法
     */
    public static void start(Context context, String htmlContent, String postTitle) {
        Intent intent = new Intent(context, PostHtmlWebViewActivity.class);
        intent.putExtra(EXTRA_HTML_CONTENT, htmlContent);
        intent.putExtra(EXTRA_POST_TITLE, postTitle);
        context.startActivity(intent);
    }
}

