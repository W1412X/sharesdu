package com.sharesdu.android.common.util;

import com.sharesdu.android.core.network.ApiConfig;

/**
 * 帖子内容处理工具类
 * 与web项目的post.js保持一致
 */
public class PostContentHelper {
    
    /**
     * 向帖子内容添加链接
     * 对应web项目的addLinkToPost函数
     * @param content 帖子内容
     * @param type 类型（article/course）
     * @param id 关联ID
     * @return 添加链接后的内容
     */
    public static String addLinkToPost(String content, String type, String id) {
        String link = "#/" + type + "/" + id;
        return link + "\n" + content;
    }
    
    /**
     * 获取帖子内容（移除链接部分）
     * 对应web项目的getPostWithoutLink函数
     * @param content 包含链接的内容
     * @return 移除链接后的内容
     */
    public static String getPostWithoutLink(String content) {
        if (content != null && content.startsWith("#/")) {
            int firstNewline = content.indexOf("\n");
            if (firstNewline > 0) {
                return content.substring(firstNewline + 1);
            }
        }
        return content;
    }
    
    /**
     * 构建图片URL（用于嵌入到帖子内容中）
     * 图片URL格式为：[BASE_URL + image_url]
     * @param imageUrl 图片相对路径
     * @return 完整图片URL（带方括号）
     */
    public static String buildImageUrl(String imageUrl) {
        if (imageUrl == null || imageUrl.isEmpty()) {
            return "";
        }
        // 如果已经是完整URL，直接使用
        if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
            return "[" + imageUrl + "]";
        }
        // 否则拼接BASE_URL
        return "[" + ApiConfig.BASE_URL + imageUrl + "]";
    }
}

