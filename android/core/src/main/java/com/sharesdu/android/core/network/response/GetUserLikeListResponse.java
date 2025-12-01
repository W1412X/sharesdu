package com.sharesdu.android.core.network.response;

import com.google.gson.annotations.SerializedName;
import java.util.List;
import java.util.Map;

/**
 * 获取用户点赞列表响应
 * GET /like/user
 */
public class GetUserLikeListResponse {
    @SerializedName("status")
    private int status;
    
    @SerializedName("message")
    private String message;
    
    @SerializedName("content_list")
    private List<Map<String, Object>> content_list;
    
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
    
    public List<Map<String, Object>> getContent_list() {
        return content_list;
    }
    
    public void setContent_list(List<Map<String, Object>> content_list) {
        this.content_list = content_list;
    }
    
    public boolean isSuccess() {
        return status == 200;
    }
}

