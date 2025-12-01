package com.sharesdu.android.core.network.response;

import com.google.gson.annotations.SerializedName;

/**
 * 删除帖子响应
 * POST /post/delete
 * 响应格式：status + message
 */
public class DeletePostResponse {
    @SerializedName("status")
    private int status;
    
    @SerializedName("message")
    private String message;
    
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
    
    public boolean isSuccess() {
        return status == 200;
    }
}

