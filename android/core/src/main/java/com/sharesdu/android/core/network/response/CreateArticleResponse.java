package com.sharesdu.android.core.network.response;

import com.google.gson.annotations.SerializedName;

/**
 * 创建文章响应
 * POST /article/create
 */
public class CreateArticleResponse {
    @SerializedName("status")
    private int status;
    
    @SerializedName("message")
    private String message;
    
    @SerializedName("article_id")
    private Integer article_id;
    
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
    
    public Integer getArticle_id() {
        return article_id;
    }
    
    public void setArticle_id(Integer article_id) {
        this.article_id = article_id;
    }
    
    public boolean isSuccess() {
        return status == 200 || status == 201;
    }
}

