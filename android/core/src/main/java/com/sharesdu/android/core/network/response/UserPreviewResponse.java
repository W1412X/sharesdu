package com.sharesdu.android.core.network.response;

import com.google.gson.annotations.SerializedName;
import java.util.List;
import java.util.Map;

/**
 * 用户创作内容预览响应
 * GET /user/preview
 * 响应格式：status + message + articles/posts/replies在根级别
 */
public class UserPreviewResponse {
    @SerializedName("status")
    private int status;
    
    @SerializedName("message")
    private String message;
    
    @SerializedName("articles")
    private List<Map<String, Object>> articles;
    
    @SerializedName("posts")
    private List<Map<String, Object>> posts;
    
    @SerializedName("replies")
    private List<Map<String, Object>> replies;
    
    @SerializedName("timestamp")
    private String timestamp;
    
    public int getStatus() {
        return status;
    }
    
    public void setStatus(int status) {
        this.status = status;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public List<Map<String, Object>> getArticles() {
        return articles;
    }
    
    public void setArticles(List<Map<String, Object>> articles) {
        this.articles = articles;
    }
    
    public List<Map<String, Object>> getPosts() {
        return posts;
    }
    
    public void setPosts(List<Map<String, Object>> posts) {
        this.posts = posts;
    }
    
    public List<Map<String, Object>> getReplies() {
        return replies;
    }
    
    public void setReplies(List<Map<String, Object>> replies) {
        this.replies = replies;
    }
    
    public String getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }
    
    public boolean isSuccess() {
        return status == 200;
    }
}

