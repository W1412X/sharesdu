package com.sharesdu.android.data.response;

import com.google.gson.annotations.SerializedName;
import java.util.List;
import java.util.Map;

/**
 * 黑名单列表响应
 * GET /blocklist?user_id=user_id
 * 响应格式：status + message + block_list在根级别
 */
public class BlockListResponse {
    @SerializedName("status")
    private int status;
    
    @SerializedName("message")
    private String message;
    
    @SerializedName("block_list")
    private List<Map<String, Object>> block_list;
    
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
    
    public List<Map<String, Object>> getBlock_list() {
        return block_list;
    }
    
    public void setBlock_list(List<Map<String, Object>> block_list) {
        this.block_list = block_list;
    }
    
    public boolean isSuccess() {
        return status == 200;
    }
}

