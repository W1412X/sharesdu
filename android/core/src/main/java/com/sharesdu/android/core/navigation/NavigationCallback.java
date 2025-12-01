package com.sharesdu.android.core.navigation;

import android.content.Context;

/**
 * 导航回调接口
 * 用于解耦 View 组件对 Activity 的直接依赖
 * 实现类应该在 app 模块中，处理具体的页面跳转逻辑
 */
public interface NavigationCallback {
    /**
     * 打开图片查看器
     * @param context 上下文
     * @param imageUrl 图片 URL
     */
    void navigateToImageViewer(Context context, String imageUrl);
    
    /**
     * 打开作者页面
     * @param context 上下文
     * @param userId 用户 ID（可以是 String 或 Integer）
     */
    void navigateToAuthor(Context context, String userId);
    
    /**
     * 打开文章详情页面
     * @param context 上下文
     * @param articleId 文章 ID
     */
    void navigateToArticle(Context context, String articleId);
    
    /**
     * 打开课程详情页面
     * @param context 上下文
     * @param courseId 课程 ID
     */
    void navigateToCourse(Context context, String courseId);
    
    /**
     * 打开帖子详情页面
     * @param context 上下文
     * @param postId 帖子 ID
     */
    void navigateToPost(Context context, String postId);
    
    /**
     * 打开外部链接
     * @param context 上下文
     * @param url 外部链接 URL
     */
    void navigateToExternalLink(Context context, String url);
}

