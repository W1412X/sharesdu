package com.sharesdu.android.core.network.response;

import com.google.gson.annotations.SerializedName;

/**
 * 获取点赞数响应
 * GET /like/count
 */
public class GetLikeCountResponse {
    @SerializedName("status")
    private int status;
    
    @SerializedName("message")
    private String message;
    
    @SerializedName("like_count")
    private Integer like_count;
    
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
    
    public Integer getLike_count() {
        return like_count;
    }
    
    public void setLike_count(Integer like_count) {
        this.like_count = like_count;
    }
    
    public boolean isSuccess() {
        return status == 200;
    }
}

