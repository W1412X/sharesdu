package com.sharesdu.android.core.network.response;

import com.google.gson.annotations.SerializedName;

/**
 * 刷新 Token 响应
 * POST /token/refresh
 */
public class RefreshTokenResponse {
    @SerializedName("status")
    private int status;
    
    @SerializedName("message")
    private String message;
    
    @SerializedName("access")
    private String access;
    
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
    
    public String getAccess() {
        return access;
    }
    
    public void setAccess(String access) {
        this.access = access;
    }
    
    public boolean isSuccess() {
        return status == 200 || status == 999;
    }
}

