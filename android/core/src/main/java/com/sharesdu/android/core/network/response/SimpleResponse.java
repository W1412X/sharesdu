package com.sharesdu.android.core.network.response;

import com.google.gson.annotations.SerializedName;

/**
 * 简单响应（只有 status 和 message）
 * 用于不需要返回数据的接口
 */
public class SimpleResponse {
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
        return status == 200 || status == 201;
    }
}

