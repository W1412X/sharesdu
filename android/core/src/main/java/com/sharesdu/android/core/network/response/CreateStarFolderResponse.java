package com.sharesdu.android.core.network.response;

import com.google.gson.annotations.SerializedName;

/**
 * 创建收藏夹响应
 * POST /star/create
 */
public class CreateStarFolderResponse {
    @SerializedName("status")
    private int status;
    
    @SerializedName("message")
    private String message;
    
    @SerializedName("folder_id")
    private Integer folder_id;
    
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
    
    public Integer getFolder_id() {
        return folder_id;
    }
    
    public void setFolder_id(Integer folder_id) {
        this.folder_id = folder_id;
    }
    
    public boolean isSuccess() {
        return status == 200 || status == 201;
    }
}

