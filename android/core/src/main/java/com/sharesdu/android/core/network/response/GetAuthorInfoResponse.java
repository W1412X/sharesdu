package com.sharesdu.android.core.network.response;

import com.google.gson.annotations.SerializedName;
import java.util.Map;

/**
 * 获取作者信息响应
 * GET /homepage
 */
public class GetAuthorInfoResponse {
    @SerializedName("status")
    private int status;
    
    @SerializedName("message")
    private String message;
    
    @SerializedName("data")
    private Map<String, Object> data;
    
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
    
    public Map<String, Object> getData() {
        return data;
    }
    
    public void setData(Map<String, Object> data) {
        this.data = data;
    }
    
    public boolean isSuccess() {
        return status == 200;
    }
}

