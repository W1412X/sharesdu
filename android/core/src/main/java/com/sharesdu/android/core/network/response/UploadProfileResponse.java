package com.sharesdu.android.core.network.response;

import com.google.gson.annotations.SerializedName;

/**
 * 上传头像响应
 * POST /image/profile
 */
public class UploadProfileResponse {
    @SerializedName("status")
    private int status;
    
    @SerializedName("message")
    private String message;
    
    @SerializedName("profile_url")
    private String profile_url;
    
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
    
    public String getProfile_url() {
        return profile_url;
    }
    
    public void setProfile_url(String profile_url) {
        this.profile_url = profile_url;
    }
    
    public boolean isSuccess() {
        return status == 200 || status == 201;
    }
}

