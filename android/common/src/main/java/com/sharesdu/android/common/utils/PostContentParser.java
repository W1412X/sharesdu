package com.sharesdu.android.common.utils;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 帖子内容解析工具类
 * 参考web项目中的帖子解析逻辑
 */
public class PostContentParser {
    
    /**
     * 解析后的帖子内容数据
     */
    public static class ParsedPostContent {
        private String displayContent; // 用于显示的内容（已移除图片和链接标记）
        private List<String> imageUrls; // 图片URL列表
        private String link; // 关联项目链接（#/开头）
        private boolean isHtml; // 是否为HTML帖子
        private String htmlContent; // HTML内容（如果是HTML帖子）
        
        public String getDisplayContent() { return displayContent; }
        public void setDisplayContent(String displayContent) { this.displayContent = displayContent; }
        
        public List<String> getImageUrls() { return imageUrls; }
        public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }
        
        public String getLink() { return link; }
        public void setLink(String link) { this.link = link; }
        
        public boolean isHtml() { return isHtml; }
        public void setHtml(boolean html) { isHtml = html; }
        
        public String getHtmlContent() { return htmlContent; }
        public void setHtmlContent(String htmlContent) { this.htmlContent = htmlContent; }
    }
    
    /**
     * 解析帖子内容
     * @param content 原始内容
     * @return 解析后的内容
     */
    public static ParsedPostContent parse(String content) {
        ParsedPostContent result = new ParsedPostContent();
        
        if (content == null || content.isEmpty()) {
            result.setDisplayContent("");
            result.setImageUrls(new ArrayList<>());
            return result;
        }
        
        // 先提取关联项目链接（#/开头）
        String link = getLinkInPost(content);
        result.setLink(link);
        
        // 移除链接部分，获取实际内容
        String contentWithoutLink = getPostWithoutLink(content);
        
        // 检查是否为HTML帖子（在移除父级链接后检查）
        if (contentWithoutLink.startsWith("SELF-DEFINE-HTML")) {
            result.setHtml(true);
            result.setHtmlContent(contentWithoutLink.substring(16)); // 移除 "SELF-DEFINE-HTML" 前缀
            result.setDisplayContent("");
            result.setImageUrls(new ArrayList<>());
            return result;
        }
        
        // 提取图片链接（[]包裹）
        List<String> imageUrls = extractImageLinksInBrackets(contentWithoutLink);
        result.setImageUrls(imageUrls);
        
        // 移除图片链接标记，保留纯文本用于显示
        String displayContent = removeImageLinksInBrackets(contentWithoutLink);
        result.setDisplayContent(displayContent);
        
        return result;
    }
    
    /**
     * 从帖子内容中提取链接（#/开头）
     * @param content 帖子内容
     * @return 链接或null
     */
    private static String getLinkInPost(String content) {
        if (content == null || content.isEmpty()) {
            return null;
        }
        
        String firstLine = content.split("\n")[0];
        if (firstLine.startsWith("#/")) {
            return firstLine;
        }
        return null;
    }
    
    /**
     * 获取帖子内容（移除链接部分）
     * @param content 原始内容
     * @return 移除链接后的内容
     */
    private static String getPostWithoutLink(String content) {
        if (content == null || content.isEmpty()) {
            return "";
        }
        
        if (content.startsWith("#/")) {
            int newlineIndex = content.indexOf("\n");
            if (newlineIndex != -1) {
                return content.substring(newlineIndex + 1);
            } else {
                return "";
            }
        }
        return content;
    }
    
    /**
     * 从内容中提取图片链接（方括号格式）
     * @param content 内容
     * @return 图片URL列表
     */
    private static List<String> extractImageLinksInBrackets(String content) {
        List<String> result = new ArrayList<>();
        if (content == null || content.isEmpty()) {
            return result;
        }
        
        // 匹配 [http://...] 或 [data:image/...] 格式
        Pattern pattern = Pattern.compile(
            "\\[(https?://[^\\s\\]]+\\.(jpg|jpeg|png|gif|webp|bmp)(\\?[^\\s\\]]*)?|data:image/[a-z+]+;base64,[^\"'>\\]]+)\\]",
            Pattern.CASE_INSENSITIVE
        );
        
        Matcher matcher = pattern.matcher(content);
        while (matcher.find()) {
            result.add(matcher.group(1));
        }
        
        return result;
    }
    
    /**
     * 从内容中移除图片链接（方括号格式）
     * @param content 内容
     * @return 移除图片链接后的内容
     */
    private static String removeImageLinksInBrackets(String content) {
        if (content == null || content.isEmpty()) {
            return "";
        }
        
        // 移除 [http://...] 或 [data:image/...] 格式
        Pattern pattern = Pattern.compile(
            "\\[(https?://[^\\s\\]]+\\.(jpg|jpeg|png|gif|webp|bmp)(\\?[^\\s\\]]*)?|data:image/[a-z+]+;base64,[^\"'>\\]]+)\\]",
            Pattern.CASE_INSENSITIVE
        );
        
        return pattern.matcher(content).replaceAll("");
    }
    
    /**
     * 从文本中提取普通链接（http/https/www开头）
     * @param text 文本
     * @return 链接列表
     */
    public static List<String> extractLinks(String text) {
        List<String> result = new ArrayList<>();
        if (text == null || text.isEmpty()) {
            return result;
        }
        
        Pattern pattern = Pattern.compile("https?://\\S+|www\\.\\S+", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(text);
        while (matcher.find()) {
            result.add(matcher.group());
        }
        
        return result;
    }
}

