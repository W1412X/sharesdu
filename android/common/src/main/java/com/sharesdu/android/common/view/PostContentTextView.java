package com.sharesdu.android.common.view;

import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.text.Html;
import android.text.Spannable;
import android.text.SpannableString;
import android.text.Spanned;
import android.text.method.LinkMovementMethod;
import android.text.style.ClickableSpan;
import android.text.style.ForegroundColorSpan;
import android.text.style.UnderlineSpan;
import android.util.AttributeSet;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import androidx.annotation.Nullable;
import com.sharesdu.android.common.R;
import com.sharesdu.android.common.utils.PostContentParser;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 帖子内容文本视图
 * 支持链接解析、HTML帖子显示等功能
 * 参考Web项目中的WithLinkContainer组件
 */
public class PostContentTextView extends FrameLayout {
    private static final String TAG = "PostContentTextView";
    
    private TextView textView;
    private WebView webView;
    private ProgressBar progressBar;
    private LinearLayout parentLinkContainer;
    private TextView parentLinkText;
    
    private String content;
    private List<String> keywords;
    private String parentLink; // 父级依赖链接，如 #/article/123
    private boolean isHtml;
    private String htmlContent;
    
    // 主题颜色（用于链接高亮）
    private int linkColor = Color.parseColor("#9c0c13");
    
    public PostContentTextView(Context context) {
        super(context);
        init();
    }
    
    public PostContentTextView(Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
        init();
    }
    
    public PostContentTextView(Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init();
    }
    
    private void init() {
        LayoutInflater.from(getContext()).inflate(R.layout.view_post_content_text, this, true);
        
        textView = findViewById(R.id.tv_content);
        webView = findViewById(R.id.webview_content);
        progressBar = findViewById(R.id.progress_bar);
        parentLinkContainer = findViewById(R.id.parent_link_container);
        parentLinkText = findViewById(R.id.parent_link_text);
        
        // 设置TextView支持链接点击
        if (textView != null) {
            textView.setMovementMethod(LinkMovementMethod.getInstance());
        }
        
        // 初始化WebView（用于HTML帖子）
        setupWebView();
    }
    
    /**
     * 设置文字颜色为白色（用于帖子详情页面）
     */
    public void setTextColorWhite() {
        if (textView != null) {
            textView.setTextColor(android.graphics.Color.WHITE);
        }
    }
    
    /**
     * 设置帖子内容
     * @param content 原始内容
     */
    public void setContent(String content) {
        this.content = content;
        parseAndRender();
    }
    
    /**
     * 设置关键词（用于高亮显示）
     * @param keywords 关键词列表
     */
    public void setKeywords(List<String> keywords) {
        this.keywords = keywords != null ? keywords : new ArrayList<>();
        parseAndRender();
    }
    
    /**
     * 设置链接颜色
     * @param color 颜色值
     */
    public void setLinkColor(int color) {
        this.linkColor = color;
        parseAndRender();
    }
    
    /**
     * 解析并渲染内容
     */
    private void parseAndRender() {
        if (content == null || content.isEmpty()) {
            return;
        }
        
        // 使用PostContentParser解析内容
        PostContentParser.ParsedPostContent parsed = PostContentParser.parse(content);
        
        this.isHtml = parsed.isHtml();
        this.htmlContent = parsed.getHtmlContent();
        this.parentLink = parsed.getLink();
        
        if (isHtml) {
            // 显示HTML内容
            showHtmlContent();
        } else {
            // 显示普通文本内容（支持链接）
            showTextContent(parsed.getDisplayContent());
        }
        
        // 显示父级依赖链接
        showParentLink(parentLink);
    }
    
    /**
     * 显示普通文本内容（支持链接和关键词高亮）
     */
    private void showTextContent(String displayContent) {
        if (textView == null) {
            return;
        }
        
        // 隐藏WebView，显示TextView
        if (webView != null) {
            webView.setVisibility(GONE);
        }
        if (progressBar != null) {
            progressBar.setVisibility(GONE);
        }
        textView.setVisibility(VISIBLE);
        
        // 提取链接和关键词，构建带图标的内容
        EnhancedLinkInfo[] linkInfos = extractLinksWithInfo(displayContent);
        
        // 构建带图标的内容字符串
        StringBuilder contentBuilder = new StringBuilder();
        List<LinkSpanInfo> linkSpans = new ArrayList<>();
        int lastIndex = 0;
        
        // 按位置排序链接
        java.util.Arrays.sort(linkInfos, (a, b) -> Integer.compare(a.start, b.start));
        
        for (EnhancedLinkInfo linkInfo : linkInfos) {
            // 添加链接前的文本
            contentBuilder.append(displayContent, lastIndex, linkInfo.start);
            
            // 添加链接图标和链接文本
            String icon = linkInfo.icon;
            int iconStart = contentBuilder.length();
            contentBuilder.append(icon).append(" ");  // 图标 + 空格
            int linkStart = contentBuilder.length();
            contentBuilder.append(displayContent, linkInfo.start, linkInfo.end);
            int linkEnd = contentBuilder.length();
            
            // 记录链接Span信息（包含图标）
            linkSpans.add(new LinkSpanInfo(iconStart, linkEnd, linkInfo.url, linkInfo.linkType));
            
            lastIndex = linkInfo.end;
        }
        
        // 添加剩余文本
        contentBuilder.append(displayContent, lastIndex, displayContent.length());
        
        // 创建SpannableString
        SpannableString spannable = new SpannableString(contentBuilder.toString());
        
        // 提取关键词位置（在新内容中）
        List<KeywordInfo> keywordPositions = new ArrayList<>();
        if (keywords != null) {
            String finalContent = contentBuilder.toString();
            for (String keyword : keywords) {
                if (keyword != null && !keyword.isEmpty()) {
                    Pattern pattern = Pattern.compile(Pattern.quote(keyword), Pattern.CASE_INSENSITIVE);
                    Matcher matcher = pattern.matcher(finalContent);
                    while (matcher.find()) {
                        // 检查是否与链接重叠
                        boolean overlaps = false;
                        for (LinkSpanInfo linkSpan : linkSpans) {
                            if (matcher.start() < linkSpan.end && matcher.end() > linkSpan.start) {
                                overlaps = true;
                                break;
                            }
                        }
                        if (!overlaps) {
                            keywordPositions.add(new KeywordInfo(matcher.start(), matcher.end(), keyword));
                        }
                    }
                }
            }
        }
        
        // 应用链接样式
        for (LinkSpanInfo linkSpan : linkSpans) {
            ClickableSpan clickableSpan = new ClickableSpan() {
                @Override
                public void onClick(View widget) {
                    handleLinkClick(linkSpan.url);
                }
            };
            
            // 整个链接区域（图标+文本）可点击
            spannable.setSpan(clickableSpan, linkSpan.start, linkSpan.end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
            spannable.setSpan(new ForegroundColorSpan(linkColor), linkSpan.start, linkSpan.end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
            spannable.setSpan(new UnderlineSpan(), linkSpan.start, linkSpan.end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
        }
        
        // 应用关键词样式
        for (KeywordInfo keyword : keywordPositions) {
            spannable.setSpan(new ForegroundColorSpan(linkColor), keyword.start, keyword.end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
            spannable.setSpan(new android.text.style.StyleSpan(android.graphics.Typeface.BOLD), keyword.start, keyword.end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
        }
        
        textView.setText(spannable);
    }
    
    /**
     * 显示HTML内容
     */
    private void showHtmlContent() {
        if (webView == null || htmlContent == null) {
            return;
        }
        
        // 隐藏TextView，显示WebView
        if (textView != null) {
            textView.setVisibility(GONE);
        }
        webView.setVisibility(VISIBLE);
        
        // 显示加载进度
        if (progressBar != null) {
            progressBar.setVisibility(VISIBLE);
        }
        
        // 加载HTML内容
        String html = "<!DOCTYPE html><html><head><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"></head><body>" + htmlContent + "</body></html>";
        webView.loadDataWithBaseURL(null, html, "text/html", "UTF-8", null);
    }
    
    /**
     * 显示父级依赖链接
     */
    private void showParentLink(String link) {
        if (parentLinkContainer == null || parentLinkText == null) {
            return;
        }
        
        if (link != null && !link.isEmpty()) {
            // 解析链接类型和ID
            // 格式: #/article/123 或 #/course/456
            String[] parts = link.substring(2).split("/"); // 移除 "#/"
            if (parts.length >= 2) {
                String type = parts[0];
                String id = parts[1];
                
                String linkText = getParentLinkText(type);
                parentLinkText.setText(linkText);
                parentLinkContainer.setVisibility(VISIBLE);
                
                // 设置点击事件
                parentLinkContainer.setOnClickListener(v -> handleParentLinkClick(type, id));
            } else {
                parentLinkContainer.setVisibility(GONE);
            }
        } else {
            parentLinkContainer.setVisibility(GONE);
        }
    }
    
    /**
     * 获取父级链接显示文本
     */
    private String getParentLinkText(String type) {
        switch (type) {
            case "article":
                return "📄 查看相关文章";
            case "course":
                return "📚 查看相关课程";
            case "post":
                return "💬 查看相关帖子";
            default:
                return "🔗 查看相关内容";
        }
    }
    
    /**
     * 处理链接点击
     */
    private void handleLinkClick(String url) {
        if (url == null || url.isEmpty()) {
            return;
        }
        
        // 使用 LinkNavigator 处理链接跳转
        com.sharesdu.android.core.navigation.LinkNavigator.navigate(getContext(), url);
    }
    
    /**
     * 处理父级链接点击
     */
    private void handleParentLinkClick(String type, String id) {
        // 构建内部链接格式: #/type/id
        String link = "#/" + type + "/" + id;
        com.sharesdu.android.core.navigation.LinkNavigator.navigate(getContext(), link);
    }
    
    /**
     * 提取文本中的链接，并解析链接类型和图标
     */
    private EnhancedLinkInfo[] extractLinksWithInfo(String text) {
        if (text == null || text.isEmpty()) {
            return new EnhancedLinkInfo[0];
        }
        
        List<EnhancedLinkInfo> result = new ArrayList<>();
        
        // 匹配所有可能的链接格式
        // 包括: http://, https://, www., #/, sharesdu.com域名URL
        Pattern pattern = Pattern.compile(
            "(https?://[^\\s]+|www\\.[^\\s]+|#/[^\\s]+)",
            Pattern.CASE_INSENSITIVE
        );
        Matcher matcher = pattern.matcher(text);
        
        while (matcher.find()) {
            String url = matcher.group();
            // 使用LinkNavigator解析链接类型
            com.sharesdu.android.core.navigation.LinkNavigator.LinkInfo linkInfo = 
                com.sharesdu.android.core.navigation.LinkNavigator.parseLink(url);
            
            String icon = "🔗";  // 默认图标
            if (linkInfo != null && linkInfo.isValid()) {
                icon = linkInfo.getIcon();
            }
            
            result.add(new EnhancedLinkInfo(matcher.start(), matcher.end(), url, icon, 
                linkInfo != null ? linkInfo.getType() : com.sharesdu.android.core.navigation.LinkNavigator.LinkType.UNKNOWN));
        }
        
        return result.toArray(new EnhancedLinkInfo[0]);
    }
    
    /**
     * 设置WebView
     */
    private void setupWebView() {
        if (webView == null) {
            return;
        }
        
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                if (progressBar != null) {
                    progressBar.setVisibility(GONE);
                }
            }
        });
        
        // 初始状态隐藏
        webView.setVisibility(GONE);
    }
    
    // 内部类 - 增强的链接信息（包含图标和类型）
    private static class EnhancedLinkInfo {
        int start;
        int end;
        String url;
        String icon;
        com.sharesdu.android.core.navigation.LinkNavigator.LinkType linkType;
        
        EnhancedLinkInfo(int start, int end, String url, String icon, 
                        com.sharesdu.android.core.navigation.LinkNavigator.LinkType linkType) {
            this.start = start;
            this.end = end;
            this.url = url;
            this.icon = icon;
            this.linkType = linkType;
        }
    }
    
    // 内部类 - 链接Span信息
    private static class LinkSpanInfo {
        int start;
        int end;
        String url;
        com.sharesdu.android.core.navigation.LinkNavigator.LinkType linkType;
        
        LinkSpanInfo(int start, int end, String url, 
                    com.sharesdu.android.core.navigation.LinkNavigator.LinkType linkType) {
            this.start = start;
            this.end = end;
            this.url = url;
            this.linkType = linkType;
        }
    }
    
    private static class KeywordInfo {
        int start;
        int end;
        String keyword;
        
        KeywordInfo(int start, int end, String keyword) {
            this.start = start;
            this.end = end;
            this.keyword = keyword;
        }
    }
    
}

