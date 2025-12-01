package com.sharesdu.android.data.response;

import com.google.gson.annotations.SerializedName;
import java.util.List;
import java.util.Map;

/**
 * 收藏夹列表响应
 * GET /star/folder/list
 * 响应格式：status + message + folders在根级别
 */
public class StarFolderListResponse {
    @SerializedName("status")
    private int status;
    
    @SerializedName("message")
    private String message;
    
    @SerializedName("folders")
    private List<Map<String, Object>> folders;
    
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
    
    public List<Map<String, Object>> getFolders() {
        return folders;
    }
    
    public void setFolders(List<Map<String, Object>> folders) {
        this.folders = folders;
    }
    
    public boolean isSuccess() {
        return status == 200;
    }
}

