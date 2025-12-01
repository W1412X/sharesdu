package com.sharesdu.android.core.network.response;

import com.google.gson.annotations.SerializedName;
import java.util.Map;

/**
 * 文章详情响应
 * GET /article/detail
 */
public class ArticleDetailResponse {
    @SerializedName("status")
    private int status;
    
    @SerializedName("message")
    private String message;
    
    @SerializedName("article_detail")
    private Map<String, Object> article_detail;
    
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
    
    public Map<String, Object> getArticle_detail() {
        return article_detail;
    }
    
    public void setArticle_detail(Map<String, Object> article_detail) {
        this.article_detail = article_detail;
    }
    
    public boolean isSuccess() {
        return status == 200;
    }
}

