package com.sharesdu.android.core.network.response;

import com.google.gson.annotations.SerializedName;

/**
 * 上传文章图片响应
 * POST /image/article
 */
public class UploadArticleImageResponse {
    @SerializedName("status")
    private int status;
    
    @SerializedName("message")
    private String message;
    
    @SerializedName("image_url")
    private String image_url;
    
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
    
    public String getImage_url() {
        return image_url;
    }
    
    public void setImage_url(String image_url) {
        this.image_url = image_url;
    }
    
    public boolean isSuccess() {
        return status == 200 || status == 201;
    }
}

