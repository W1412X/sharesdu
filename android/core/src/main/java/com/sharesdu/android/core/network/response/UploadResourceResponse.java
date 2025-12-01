package com.sharesdu.android.core.network.response;

import com.google.gson.annotations.SerializedName;

/**
 * 上传资源响应
 * POST /resource/upload
 */
public class UploadResourceResponse {
    @SerializedName("status")
    private int status;
    
    @SerializedName("message")
    private String message;
    
    @SerializedName("resource_url")
    private String resource_url;
    
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
    
    public String getResource_url() {
        return resource_url;
    }
    
    public void setResource_url(String resource_url) {
        this.resource_url = resource_url;
    }
    
    public boolean isSuccess() {
        return status == 200 || status == 201;
    }
}

