package com.sharesdu.android.core.navigation;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.util.Log;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 链接跳转工具类
 * 统一处理所有类型的链接跳转逻辑
 * 参考Web项目中的navigation.js和LinkItem组件
 */
public class LinkNavigator {
    private static final String TAG = "LinkNavigator";
    
    // sharesdu.com 域名（用于识别内部链接）
    private static final String SHARESDU_DOMAIN = "sharesdu.com";
    
    // 内部链接格式: #/type/id 或完整URL: https://sharesdu.com/#/type/id
    private static final Pattern INTERNAL_LINK_PATTERN = Pattern.compile("^#/([^/]+)/([^/]+)(?:/(.*))?$");
    
    // sharesdu.com 完整URL格式: https://sharesdu.com/#/type/id
    private static final Pattern SHARESDU_URL_PATTERN = Pattern.compile("https?://(?:www\\.)?sharesdu\\.com(?:/.*)?(#/[^\\s]+)", Pattern.CASE_INSENSITIVE);
    
    // 外部链接格式: http://, https://, www.
    private static final Pattern EXTERNAL_LINK_PATTERN = Pattern.compile("^(https?://|www\\.).+", Pattern.CASE_INSENSITIVE);
    
    /**
     * 链接类型枚举
     */
    public enum LinkType {
        ARTICLE("article"),
        COURSE("course"),
        POST("post"),
        REPLY("reply"),  // 回复（通过post页面显示）
        AUTHOR("author"),
        SEARCH("search"),
        CHAT("chat"),
        DOCUMENT("document"),
        DEBUG("debug"),
        EXTERNAL("external"),
        UNKNOWN("unknown");
        
        private final String value;
        
        LinkType(String value) {
            this.value = value;
        }
        
        public String getValue() {
            return value;
        }
        
        public static LinkType fromString(String value) {
            if (value == null || value.isEmpty()) {
                return UNKNOWN;
            }
            
            for (LinkType type : LinkType.values()) {
                if (type.value.equalsIgnoreCase(value)) {
                    return type;
                }
            }
            return UNKNOWN;
        }
    }
    
    /**
     * 解析链接并执行跳转
     * @param context 上下文
     * @param link 链接字符串（可以是内部链接 #/type/id、sharesdu.com完整URL或外部链接）
     */
    public static void navigate(Context context, String link) {
        if (context == null || link == null || link.isEmpty()) {
            Log.w(TAG, "无效的上下文或链接");
            return;
        }
        
        // 规范化链接（提取hash部分）
        String normalizedLink = normalizeInternalLink(link);
        
        // 判断链接类型并跳转
        if (normalizedLink != null && isInternalLink(normalizedLink)) {
            navigateToInternalLink(context, normalizedLink);
        } else if (isExternalLink(link)) {
            navigateToExternalLink(context, link);
        } else {
            Log.w(TAG, "无法识别的链接格式: " + link);
        }
    }
    
    /**
     * 规范化内部链接（从完整URL中提取hash部分）
     * @param link 原始链接
     * @return 规范化后的链接（#/type/id 格式），如果不是内部链接则返回null
     */
    private static String normalizeInternalLink(String link) {
        if (link == null || link.isEmpty()) {
            return null;
        }
        
        // 如果是 #/ 开头的，直接返回
        if (link.startsWith("#/")) {
            return link;
        }
        
        // 尝试从完整URL中提取hash部分
        try {
            Uri uri = Uri.parse(link);
            String host = uri.getHost();
            
            // 检查是否是 sharesdu.com 域名
            if (host != null && (host.equals(SHARESDU_DOMAIN) || host.equals("www." + SHARESDU_DOMAIN))) {
                // 优先从fragment（hash）中提取
                String fragment = uri.getFragment();
                if (fragment != null && fragment.startsWith("/")) {
                    return "#" + fragment; // 返回 #/type/id 格式
                }
                
                // 如果没有fragment，尝试从路径解析
                // 例如：https://sharesdu.com/article/123 -> #/article/123
                String path = uri.getPath();
                if (path != null && path.startsWith("/") && path.length() > 1) {
                    String pathWithoutSlash = path.substring(1);
                    // 匹配路径格式: /article/123 或 /course/456
                    Pattern pathPattern = Pattern.compile("^([^/]+)/([^/]+)(?:/(.*))?$");
                    Matcher pathMatcher = pathPattern.matcher(pathWithoutSlash);
                    if (pathMatcher.matches()) {
                        String type = pathMatcher.group(1);
                        String id = pathMatcher.group(2);
                        return "#/" + type + "/" + id;
                    }
                }
            }
        } catch (Exception e) {
            Log.w(TAG, "解析URL失败: " + link, e);
        }
        
        return null;
    }
    
    /**
     * 判断是否为内部链接（包括 #/ 格式和 sharesdu.com 域名的完整URL）
     * @param link 链接字符串
     * @return true 如果是内部链接
     */
    public static boolean isInternalLink(String link) {
        if (link == null || link.isEmpty()) {
            return false;
        }
        
        // 检查是否为 #/ 开头的内部链接
        if (link.startsWith("#/")) {
            return true;
        }
        
        // 检查是否为 sharesdu.com 域名的完整URL
        try {
            Uri uri = Uri.parse(link);
            String host = uri.getHost();
            if (host != null && (host.equals(SHARESDU_DOMAIN) || host.equals("www." + SHARESDU_DOMAIN))) {
                String fragment = uri.getFragment();
                if (fragment != null && fragment.startsWith("/")) {
                    return true; // 包含 hash 路由
                }
            }
        } catch (Exception e) {
            // URL 解析失败，不是有效的URL
        }
        
        return false;
    }
    
    /**
     * 判断是否为 sharesdu.com 域名的链接
     * @param link 链接字符串
     * @return true 如果是 sharesdu.com 域名的链接
     */
    public static boolean isSharesduDomain(String link) {
        if (link == null || link.isEmpty()) {
            return false;
        }
        
        try {
            Uri uri = Uri.parse(link);
            String host = uri.getHost();
            return host != null && (host.equals(SHARESDU_DOMAIN) || host.equals("www." + SHARESDU_DOMAIN));
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * 判断是否为外部链接
     * @param link 链接字符串
     * @return true 如果是外部链接
     */
    public static boolean isExternalLink(String link) {
        if (link == null || link.isEmpty()) {
            return false;
        }
        return EXTERNAL_LINK_PATTERN.matcher(link).matches();
    }
    
    /**
     * 解析内部链接并跳转
     * @param context 上下文
     * @param link 内部链接（格式: #/type/id）
     */
    private static void navigateToInternalLink(Context context, String link) {
        Matcher matcher = INTERNAL_LINK_PATTERN.matcher(link);
        
        if (!matcher.matches()) {
            Log.w(TAG, "内部链接格式错误: " + link);
            return;
        }
        
        String type = matcher.group(1);
        String id = matcher.group(2);
        
        if (type == null || id == null) {
            Log.w(TAG, "链接缺少类型或ID: " + link);
            return;
        }
        
        LinkType linkType = LinkType.fromString(type);
        NavigationCallback callback = NavigationManager.getInstance().getNavigationCallback();
        
        if (callback == null) {
            Log.e(TAG, "NavigationCallback 未设置，无法执行导航");
            return;
        }
        
        // 根据类型调用相应的导航方法
        switch (linkType) {
            case ARTICLE:
                callback.navigateToArticle(context, id);
                break;
            case COURSE:
                callback.navigateToCourse(context, id);
                break;
            case POST:
            case REPLY:  // 回复链接也跳转到帖子页面（Web项目中reply通过post页面显示）
                callback.navigateToPost(context, id);
                break;
            case AUTHOR:
                callback.navigateToAuthor(context, id);
                break;
            case SEARCH:
                // TODO: 实现搜索页面导航
                Log.d(TAG, "搜索页面导航（待实现）: " + id);
                break;
            case CHAT:
                // TODO: 实现聊天页面导航
                Log.d(TAG, "聊天页面导航（待实现）: " + id);
                break;
            case DOCUMENT:
                // TODO: 实现文档页面导航
                Log.d(TAG, "文档页面导航（待实现）: " + id);
                break;
            case DEBUG:
                // TODO: 实现调试页面导航
                Log.d(TAG, "调试页面导航（待实现）: " + id);
                break;
            default:
                Log.w(TAG, "未知的内部链接类型: " + type);
                break;
        }
    }
    
    /**
     * 跳转到外部链接
     * @param context 上下文
     * @param url 外部链接URL
     */
    private static void navigateToExternalLink(Context context, String url) {
        NavigationCallback callback = NavigationManager.getInstance().getNavigationCallback();
        
        if (callback != null) {
            // 使用回调接口处理外部链接
            callback.navigateToExternalLink(context, normalizeUrl(url));
        } else {
            // 如果回调未设置，直接使用浏览器打开
            openInBrowser(context, normalizeUrl(url));
        }
    }
    
    /**
     * 规范化URL（处理 www. 开头的情况）
     * @param url 原始URL
     * @return 规范化后的URL
     */
    private static String normalizeUrl(String url) {
        if (url == null || url.isEmpty()) {
            return url;
        }
        
        // 如果以 www. 开头，添加 https://
        if (url.toLowerCase().startsWith("www.")) {
            return "https://" + url;
        }
        
        return url;
    }
    
    /**
     * 在浏览器中打开链接（备用方法）
     * @param context 上下文
     * @param url 链接URL
     */
    public static void openInBrowser(Context context, String url) {
        if (context == null || url == null || url.isEmpty()) {
            return;
        }
        
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(normalizeUrl(url)));
            context.startActivity(intent);
        } catch (Exception e) {
            Log.e(TAG, "无法打开外部链接: " + url, e);
        }
    }
    
    /**
     * 解析链接获取类型和ID
     * @param link 链接字符串
     * @return LinkInfo 对象，包含类型和ID，如果是无效链接则返回null
     */
    public static LinkInfo parseLink(String link) {
        if (link == null || link.isEmpty()) {
            return null;
        }
        
        // 规范化内部链接
        String normalizedLink = normalizeInternalLink(link);
        
        if (normalizedLink != null && isInternalLink(normalizedLink)) {
            Matcher matcher = INTERNAL_LINK_PATTERN.matcher(normalizedLink);
            if (matcher.matches()) {
                String type = matcher.group(1);
                String id = matcher.group(2);
                LinkType linkType = LinkType.fromString(type);
                return new LinkInfo(linkType, id, link, normalizedLink);
            }
        } else if (isSharesduDomain(link)) {
            // sharesdu.com 域名的链接但没有hash，作为外部链接处理
            return new LinkInfo(LinkType.EXTERNAL, null, link, link);
        } else if (isExternalLink(link)) {
            return new LinkInfo(LinkType.EXTERNAL, null, normalizeUrl(link), link);
        }
        
        return null;
    }
    
    /**
     * 获取链接类型的图标符号（Unicode字符）
     * @param linkType 链接类型
     * @return 图标符号
     */
    public static String getLinkIcon(LinkType linkType) {
        switch (linkType) {
            case ARTICLE:
                return "📄";  // 文章
            case COURSE:
                return "📚";  // 课程
            case POST:
                return "💬";  // 帖子
            case REPLY:
                return "↩️";  // 回复
            case AUTHOR:
                return "👤";  // 作者/用户
            case SEARCH:
                return "🔍";  // 搜索
            case CHAT:
                return "💭";  // 聊天
            case DOCUMENT:
                return "📋";  // 文档
            case DEBUG:
                return "🐛";  // 调试
            case EXTERNAL:
                return "🔗";  // 外部链接
            default:
                return "🔗";  // 默认链接
        }
    }
    
    /**
     * 获取链接类型的显示文本
     * @param linkType 链接类型
     * @return 显示文本
     */
    public static String getLinkTypeText(LinkType linkType) {
        switch (linkType) {
            case ARTICLE:
                return "文章";
            case COURSE:
                return "课程";
            case POST:
                return "帖子";
            case REPLY:
                return "回复";
            case AUTHOR:
                return "用户";
            case SEARCH:
                return "搜索";
            case CHAT:
                return "聊天";
            case DOCUMENT:
                return "文档";
            case DEBUG:
                return "调试";
            case EXTERNAL:
                return "外部链接";
            default:
                return "链接";
        }
    }
    
    /**
     * 获取链接的显示文本（用于UI显示）
     * @param linkInfo 链接信息
     * @return 显示文本
     */
    public static String getLinkDisplayText(LinkInfo linkInfo) {
        if (linkInfo == null) {
            return "链接";
        }
        
        switch (linkInfo.getType()) {
            case ARTICLE:
                return "文章";
            case COURSE:
                return "课程";
            case POST:
                return "帖子";
            case AUTHOR:
                return "用户";
            case EXTERNAL:
                return "外部链接";
            default:
                return "链接";
        }
    }
    
    /**
     * 链接信息类
     */
    public static class LinkInfo {
        private final LinkType type;
        private final String id;
        private final String originalLink;
        private final String normalizedLink;  // 规范化后的链接（#/type/id 格式）
        
        public LinkInfo(LinkType type, String id, String originalLink, String normalizedLink) {
            this.type = type;
            this.id = id;
            this.originalLink = originalLink;
            this.normalizedLink = normalizedLink;
        }
        
        public LinkType getType() {
            return type;
        }
        
        public String getId() {
            return id;
        }
        
        public String getOriginalLink() {
            return originalLink;
        }
        
        public String getNormalizedLink() {
            return normalizedLink;
        }
        
        public boolean isValid() {
            return type != LinkType.UNKNOWN;
        }
        
        /**
         * 获取链接图标
         */
        public String getIcon() {
            return getLinkIcon(type);
        }
        
        /**
         * 获取链接类型文本
         */
        public String getTypeText() {
            return getLinkTypeText(type);
        }
    }
}

