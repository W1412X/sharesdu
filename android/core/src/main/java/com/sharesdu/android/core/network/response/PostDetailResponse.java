package com.sharesdu.android.core.network.response;

import com.google.gson.annotations.SerializedName;
import java.util.Map;

/**
 * 帖子详情响应
 * GET /post/detail
 * 响应格式：status + message + post_detail在根级别
 */
public class PostDetailResponse {
    @SerializedName("status")
    private int status;
    
    @SerializedName("message")
    private String message;
    
    @SerializedName("post_detail")
    private Map<String, Object> post_detail;
    
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
    
    public Map<String, Object> getPost_detail() {
        return post_detail;
    }
    
    public void setPost_detail(Map<String, Object> post_detail) {
        this.post_detail = post_detail;
    }
    
    public boolean isSuccess() {
        return status == 200;
    }
}

