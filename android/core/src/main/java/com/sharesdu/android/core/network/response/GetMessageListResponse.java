package com.sharesdu.android.core.network.response;

import com.google.gson.annotations.SerializedName;
import java.util.List;
import java.util.Map;

/**
 * 获取私信列表响应
 * GET /messages/list
 */
public class GetMessageListResponse {
    @SerializedName("status")
    private int status;
    
    @SerializedName("message")
    private String message;
    
    @SerializedName("message_list")
    private List<Map<String, Object>> message_list;
    
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
    
    public List<Map<String, Object>> getMessage_list() {
        return message_list;
    }
    
    public void setMessage_list(List<Map<String, Object>> message_list) {
        this.message_list = message_list;
    }
    
    public boolean isSuccess() {
        return status == 200;
    }
}

