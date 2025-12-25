package com.sharesdu.android;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.net.Uri;
import android.net.http.SslError;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.util.Log;
import android.view.KeyEvent;
import android.view.View;
import android.view.WindowManager;
import android.webkit.ConsoleMessage;
import android.webkit.JsResult;
import android.webkit.PermissionRequest;
import android.webkit.SslErrorHandler;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebChromeClient.FileChooserParams;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import java.util.ArrayList;
import java.util.List;

public class MainActivity extends AppCompatActivity {
    private static final String TAG = "MainActivity";
    private static final int PERMISSION_REQUEST_CODE = 1001;
    private static final int FILE_CHOOSER_REQUEST_CODE = 1002;
    
    private WebView web;
    private ValueCallback<Uri[]> fileUploadCallback;
    private boolean isJavaScriptHistoryAvailable = false;
    
    // 需要申请的权限列表
    private String[] permissions = {
        Manifest.permission.INTERNET,
        Manifest.permission.READ_EXTERNAL_STORAGE,
        Manifest.permission.WRITE_EXTERNAL_STORAGE
    };
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        // 初始化WebView
        web = findViewById(R.id.web);
        
        // 检查并申请权限
        checkAndRequestPermissions();
        
        // 初始化WebView配置
        initWeb(web);
        
        // 设置状态栏和导航栏
        setNavigationStatusColor(Color.TRANSPARENT);
    }
    
    /**
     * 检查并申请权限
     */
    private void checkAndRequestPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            List<String> permissionsToRequest = new ArrayList<>();
            
            // 基础权限检查
            for (String permission : permissions) {
                // Android 13+ (API 33+) 不再需要READ/WRITE_EXTERNAL_STORAGE权限
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    if (permission.equals(Manifest.permission.READ_EXTERNAL_STORAGE) ||
                        permission.equals(Manifest.permission.WRITE_EXTERNAL_STORAGE)) {
                        continue;
                    }
                }
                
                if (ContextCompat.checkSelfPermission(this, permission) != PackageManager.PERMISSION_GRANTED) {
                    permissionsToRequest.add(permission);
                }
            }
            
            // Android 13+ (API 33+) 需要检查媒体权限
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                String[] mediaPermissions = {
                    Manifest.permission.READ_MEDIA_IMAGES,
                    Manifest.permission.READ_MEDIA_VIDEO,
                    Manifest.permission.READ_MEDIA_AUDIO
                };
                
                for (String permission : mediaPermissions) {
                    if (ContextCompat.checkSelfPermission(this, permission) != PackageManager.PERMISSION_GRANTED) {
                        permissionsToRequest.add(permission);
                    }
                }
            }
            
            if (!permissionsToRequest.isEmpty()) {
                // 显示权限说明对话框
                showPermissionExplanationDialog(permissionsToRequest.toArray(new String[0]));
            } else {
                // 权限已授予，加载网页
                loadWebPage();
            }
        } else {
            // Android 6.0以下直接加载
            loadWebPage();
        }
    }
    
    /**
     * 显示权限说明对话框
     */
    private void showPermissionExplanationDialog(final String[] permissions) {
        new AlertDialog.Builder(this)
            .setTitle("需要权限")
            .setMessage("应用需要以下权限才能正常运行：\n" +
                       "• 网络访问：用于加载网页内容\n" +
                       "• 存储权限：用于文件上传、下载和缓存")
            .setPositiveButton("授予权限", (dialog, which) -> {
                ActivityCompat.requestPermissions(MainActivity.this, permissions, PERMISSION_REQUEST_CODE);
            })
            .setNegativeButton("取消", (dialog, which) -> {
                Toast.makeText(this, "部分功能可能无法正常使用", Toast.LENGTH_LONG).show();
                loadWebPage();
            })
            .setCancelable(false)
            .show();
    }
    
    /**
     * 权限申请结果回调
     */
    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        
        if (requestCode == PERMISSION_REQUEST_CODE) {
            boolean allGranted = true;
            List<String> deniedPermissions = new ArrayList<>();
            
            for (int i = 0; i < permissions.length; i++) {
                if (grantResults[i] != PackageManager.PERMISSION_GRANTED) {
                    allGranted = false;
                    deniedPermissions.add(permissions[i]);
                }
            }
            
            if (allGranted) {
                Toast.makeText(this, "权限已授予", Toast.LENGTH_SHORT).show();
                loadWebPage();
            } else {
                // 检查是否有权限被永久拒绝
                boolean shouldShowRationale = false;
                for (String permission : deniedPermissions) {
                    if (ActivityCompat.shouldShowRequestPermissionRationale(this, permission)) {
                        shouldShowRationale = true;
                        break;
                    }
                }
                
                if (shouldShowRationale) {
                    // 用户拒绝了权限，但可以再次请求
                    new AlertDialog.Builder(this)
                        .setTitle("权限被拒绝")
                        .setMessage("应用需要这些权限才能正常工作，请在设置中授予权限")
                        .setPositiveButton("重新申请", (dialog, which) -> {
                            checkAndRequestPermissions();
                        })
                        .setNegativeButton("稍后", (dialog, which) -> {
                            loadWebPage();
                        })
                        .show();
                } else {
                    // 权限被永久拒绝，引导用户到设置页面
                    new AlertDialog.Builder(this)
                        .setTitle("权限被拒绝")
                        .setMessage("请在系统设置中手动授予权限，否则部分功能可能无法使用")
                        .setPositiveButton("去设置", (dialog, which) -> {
                            openAppSettings();
                        })
                        .setNegativeButton("稍后", (dialog, which) -> {
                            loadWebPage();
                        })
                        .show();
                }
            }
        }
    }
    
    /**
     * 打开应用设置页面
     */
    private void openAppSettings() {
        Intent intent = new Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
        intent.setData(android.net.Uri.parse("package:" + getPackageName()));
        startActivity(intent);
    }
    
    /**
     * 加载网页
     */
    private void loadWebPage() {
        if (web != null) {
            web.loadUrl("https://sharesdu.com/#/index");
        }
    }
    
    /**
     * 初始化WebView配置
     */
    private void initWeb(WebView web) {
        WebSettings webSettings = web.getSettings();
        
        // 基础设置
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setDatabaseEnabled(true);
        // setAppCacheEnabled 已在 API 33+ 中移除，使用默认缓存策略即可
        
        // 文件访问设置
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN) {
            webSettings.setAllowFileAccessFromFileURLs(true);
            webSettings.setAllowUniversalAccessFromFileURLs(true);
        }
        
        // 媒体设置
        webSettings.setMediaPlaybackRequiresUserGesture(false);
        
        // 缓存设置
        webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);
        // setAppCachePath 已在较新 API 中移除，使用默认缓存路径即可
        
        // 其他优化设置
        webSettings.setLoadWithOverviewMode(true);
        webSettings.setUseWideViewPort(true);
        webSettings.setBuiltInZoomControls(false);
        webSettings.setDisplayZoomControls(false);
        webSettings.setSupportZoom(true);
        webSettings.setJavaScriptCanOpenWindowsAutomatically(true);
        webSettings.setSupportMultipleWindows(true);
        
        // 设置User-Agent
        webSettings.setUserAgentString(webSettings.getUserAgentString() + " SharesduApp/1.0");
        
        // 设置WebViewClient
        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                // 处理特殊协议
                if (url.startsWith("tel:") || url.startsWith("mailto:") || url.startsWith("sms:")) {
                    try {
                        Intent intent = new Intent(Intent.ACTION_VIEW, android.net.Uri.parse(url));
                        startActivity(intent);
                        return true;
                    } catch (Exception e) {
                        Log.e(TAG, "Error handling special URL: " + url, e);
                    }
                }
                return super.shouldOverrideUrlLoading(view, request);
            }
            
            @Override
            public void onReceivedSslError(WebView view, final SslErrorHandler handler, SslError error) {
                // 自动允许SSL证书错误，无提示
                handler.proceed();
            }
            
            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                super.onReceivedError(view, request, error);
                if (request.isForMainFrame()) {
                    //do nothing
                }
            }
            
            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
                Log.d(TAG, "Page started: " + url);
            }
            
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                Log.d(TAG, "Page finished: " + url);
                
                // 注入JavaScript来监听路由变化并支持返回键
                injectHistorySupport(view);
            }
        });
        
        // 设置WebChromeClient
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage msg) {
                Log.d(TAG, "Console: " + msg.message() + " -- From line " + msg.lineNumber() + " of " + msg.sourceId());
                return super.onConsoleMessage(msg);
            }
            
            @Override
            public void onPermissionRequest(PermissionRequest request) {
                // 处理WebView内的权限请求（如摄像头、麦克风等）
                String[] requestedResources = request.getResources();
                List<String> grantedResources = new ArrayList<>();
                
                for (String resource : requestedResources) {
                    if (resource.equals(PermissionRequest.RESOURCE_VIDEO_CAPTURE) ||
                        resource.equals(PermissionRequest.RESOURCE_AUDIO_CAPTURE)) {
                        // 检查系统权限
                        String permission = resource.equals(PermissionRequest.RESOURCE_VIDEO_CAPTURE) 
                            ? Manifest.permission.CAMERA 
                            : Manifest.permission.RECORD_AUDIO;
                        
                        if (ContextCompat.checkSelfPermission(MainActivity.this, permission) 
                            == PackageManager.PERMISSION_GRANTED) {
                            grantedResources.add(resource);
                        } else {
                            // 请求权限
                            ActivityCompat.requestPermissions(MainActivity.this, 
                                new String[]{permission}, PERMISSION_REQUEST_CODE);
                        }
                    } else {
                        grantedResources.add(resource);
                    }
                }
                
                if (!grantedResources.isEmpty()) {
                    request.grant(grantedResources.toArray(new String[0]));
                } else {
                    request.deny();
                }
            }
            
            @Override
            public boolean onJsAlert(WebView view, String url, String message, JsResult result) {
                new AlertDialog.Builder(view.getContext())
                    .setTitle("提示")
                    .setMessage(message)
                    .setPositiveButton("确认", (dialog, which) -> result.confirm())
                    .setCancelable(false)
                    .show();
                return true;
            }
            
            @Override
            public boolean onJsConfirm(WebView view, String url, String message, JsResult result) {
                new AlertDialog.Builder(view.getContext())
                    .setTitle("确认")
                    .setMessage(message)
                    .setPositiveButton("确定", (dialog, which) -> result.confirm())
                    .setNegativeButton("取消", (dialog, which) -> result.cancel())
                    .show();
                return true;
            }
            
            // 文件上传支持
            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, 
                                           FileChooserParams fileChooserParams) {
                if (fileUploadCallback != null) {
                    fileUploadCallback.onReceiveValue(null);
                }
                fileUploadCallback = filePathCallback;
                
                Intent intent = fileChooserParams.createIntent();
                try {
                    startActivityForResult(intent, FILE_CHOOSER_REQUEST_CODE);
                } catch (Exception e) {
                    fileUploadCallback = null;
                    Toast.makeText(MainActivity.this, "无法打开文件选择器", Toast.LENGTH_SHORT).show();
                    return false;
                }
                return true;
            }
            
            // 下载进度
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                super.onProgressChanged(view, newProgress);
                // 可以在这里显示加载进度
            }
            
            // 文件下载处理
            // 注意：onDownloadStart 在某些 API 级别可能不可用，使用条件编译
            public void onDownloadStart(String url, String userAgent, String contentDisposition,
                                      String mimeType, long contentLength) {
                // 检查存储权限
                boolean hasPermission = false;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    // Android 13+ 不需要存储权限
                    hasPermission = true;
                } else {
                    hasPermission = ContextCompat.checkSelfPermission(MainActivity.this,
                        Manifest.permission.WRITE_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED;
                }
                
                if (!hasPermission) {
                    Toast.makeText(MainActivity.this, "需要存储权限才能下载文件", Toast.LENGTH_SHORT).show();
                    // 请求权限
                    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) {
                        ActivityCompat.requestPermissions(MainActivity.this,
                            new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE},
                            PERMISSION_REQUEST_CODE);
                    }
                    return;
                }
                
                // 使用系统下载管理器下载文件
                try {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    intent.addCategory(Intent.CATEGORY_BROWSABLE);
                    startActivity(intent);
                } catch (Exception e) {
                    // 如果无法直接打开，使用下载管理器
                    try {
                        android.app.DownloadManager.Request request = new android.app.DownloadManager.Request(Uri.parse(url));
                        request.setMimeType(mimeType);
                        String fileName = contentDisposition;
                        if (fileName != null && fileName.contains("filename=")) {
                            fileName = fileName.substring(fileName.indexOf("filename=") + 9);
                            if (fileName.startsWith("\"") && fileName.endsWith("\"")) {
                                fileName = fileName.substring(1, fileName.length() - 1);
                            }
                        } else {
                            // 从URL提取文件名
                            fileName = url.substring(url.lastIndexOf("/") + 1);
                            if (fileName.contains("?")) {
                                fileName = fileName.substring(0, fileName.indexOf("?"));
                            }
                        }
                        request.addRequestHeader("User-Agent", userAgent);
                        request.setDescription("正在下载: " + fileName);
                        request.setTitle(fileName);
                        request.allowScanningByMediaScanner();
                        request.setNotificationVisibility(android.app.DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                        request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, fileName);
                        
                        android.app.DownloadManager downloadManager = (android.app.DownloadManager) getSystemService(DOWNLOAD_SERVICE);
                        downloadManager.enqueue(request);
                        Toast.makeText(MainActivity.this, "开始下载: " + fileName, Toast.LENGTH_SHORT).show();
                    } catch (Exception ex) {
                        Log.e(TAG, "Download failed", ex);
                        Toast.makeText(MainActivity.this, "下载失败: " + ex.getMessage(), Toast.LENGTH_SHORT).show();
                    }
                }
            }
        });
    }
    
    /**
     * 处理文件选择结果
     */
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        
        if (requestCode == FILE_CHOOSER_REQUEST_CODE) {
            if (fileUploadCallback != null) {
                Uri[] results = null;
                if (resultCode == Activity.RESULT_OK && data != null) {
                    String dataString = data.getDataString();
                    if (dataString != null) {
                        results = new Uri[]{android.net.Uri.parse(dataString)};
                    } else if (data.getClipData() != null) {
                        // 多文件选择
                        int count = data.getClipData().getItemCount();
                        results = new Uri[count];
                        for (int i = 0; i < count; i++) {
                            results[i] = data.getClipData().getItemAt(i).getUri();
                        }
                    }
                }
                fileUploadCallback.onReceiveValue(results);
                fileUploadCallback = null;
            }
        }
    }
    
    /**
     * 注入JavaScript支持，用于处理SPA路由的返回键
     */
    private void injectHistorySupport(WebView view) {
        String js = "(function() {" +
            "var originalPushState = history.pushState;" +
            "var originalReplaceState = history.replaceState;" +
            "window.historyStateStack = window.historyStateStack || [window.location.href];" +
            "history.pushState = function() {" +
            "  window.historyStateStack.push(window.location.href);" +
            "  originalPushState.apply(history, arguments);" +
            "};" +
            "history.replaceState = function() {" +
            "  if (window.historyStateStack.length > 0) {" +
            "    window.historyStateStack[window.historyStateStack.length - 1] = window.location.href;" +
            "  } else {" +
            "    window.historyStateStack.push(window.location.href);" +
            "  }" +
            "  originalReplaceState.apply(history, arguments);" +
            "};" +
            "window.addEventListener('popstate', function() {" +
            "  if (window.historyStateStack.length > 0) {" +
            "    window.historyStateStack.pop();" +
            "  }" +
            "});" +
            "window.addEventListener('hashchange', function() {" +
            "  if (window.historyStateStack.indexOf(window.location.href) === -1) {" +
            "    window.historyStateStack.push(window.location.href);" +
            "  }" +
            "});" +
            "window.canGoBackInHistory = function() {" +
            "  return window.historyStateStack.length > 1 || window.history.length > 1;" +
            "};" +
            "window.goBackInHistory = function() {" +
            "  if (window.historyStateStack.length > 1) {" +
            "    window.historyStateStack.pop();" +
            "  }" +
            "  if (window.history.length > 1) {" +
            "    window.history.back();" +
            "    return true;" +
            "  }" +
            "  return false;" +
            "};" +
            "})();";
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            view.evaluateJavascript(js, null);
        } else {
            view.loadUrl("javascript:" + js);
        }
        isJavaScriptHistoryAvailable = true;
    }
    
    /**
     * 处理返回键
     */
    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK && web != null) {
            // 先检查WebView的历史记录（适用于传统页面跳转）
            if (web.canGoBack()) {
                web.goBack();
                return true;
            }
            
            // 如果WebView没有历史记录，尝试JavaScript的history.back()（适用于SPA路由）
            if (isJavaScriptHistoryAvailable) {
                // 先尝试执行JavaScript的history.back()
                String backJs = "if (window.history.length > 1) { window.history.back(); return true; } return false;";
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
                    web.evaluateJavascript(backJs, result -> {
                        // 如果JavaScript返回false，检查自定义历史记录栈
                        if (result == null || result.equals("false")) {
                            String checkJs = "(window.canGoBackInHistory && window.canGoBackInHistory()) ? 'true' : 'false'";
                            web.evaluateJavascript(checkJs, hasHistory -> {
                                if (hasHistory != null && hasHistory.equals("true")) {
                                    // 有JavaScript历史记录，执行返回
                                    String goBackJs = "window.goBackInHistory();";
                                    web.evaluateJavascript(goBackJs, null);
                                } else {
                                    // 没有历史记录，退出应用
                                    finish();
                                }
                            });
                        }
                    });
                } else {
                    // 对于旧版本Android，直接执行history.back()
                    web.loadUrl("javascript:if(window.history.length > 1) window.history.back();");
                    // 延迟检查是否需要退出
                    web.postDelayed(() -> {
                        if (web != null && !web.canGoBack()) {
                            finish();
                        }
                    }, 200);
                }
                return true;
            }
            
            // 如果JavaScript不可用且WebView也没有历史记录，退出应用
            finish();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }
    
    /**
     * 设置全屏模式
     */
    public void setFullscreen(boolean isShowStatusBar, boolean isShowNavigationBar) {
        int uiOptions = View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY;

        if (!isShowStatusBar) {
            uiOptions |= View.SYSTEM_UI_FLAG_FULLSCREEN;
        }
        if (!isShowNavigationBar) {
            uiOptions |= View.SYSTEM_UI_FLAG_HIDE_NAVIGATION;
        }
        getWindow().getDecorView().setSystemUiVisibility(uiOptions);
        setNavigationStatusColor(Color.TRANSPARENT);
    }

    /**
     * 设置导航栏和状态栏颜色
     */
    public void setNavigationStatusColor(int color) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            getWindow().addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
            getWindow().setNavigationBarColor(color);
            getWindow().setStatusBarColor(color);
        }
    }
    
    /**
     * 设置状态栏文字颜色
     */
    private static void setAndroidNativeLightStatusBar(Activity activity, boolean dark) {
        View decor = activity.getWindow().getDecorView();
        if (dark) {
            decor.setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
        } else {
            decor.setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
        }
    }
    
    @Override
    protected void onDestroy() {
        if (web != null) {
            web.destroy();
        }
        super.onDestroy();
    }
    
    @Override
    protected void onPause() {
        super.onPause();
        if (web != null) {
            web.onPause();
        }
    }
    
    @Override
    protected void onResume() {
        super.onResume();
        if (web != null) {
            web.onResume();
        }
    }
}
