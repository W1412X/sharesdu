package com.sharesdu.android.core.network.response;

import com.google.gson.annotations.SerializedName;

/**
 * 创建文章帖子响应
 * POST /post/article_post
 */
public class CreateArticlePostResponse {
    @SerializedName("status")
    private int status;
    
    @SerializedName("message")
    private String message;
    
    @SerializedName("post_id")
    private Integer post_id;
    
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
    
    public Integer getPost_id() {
        return post_id;
    }
    
    public void setPost_id(Integer post_id) {
        this.post_id = post_id;
    }
    
    public boolean isSuccess() {
        return status == 200 || status == 201;
    }
}

