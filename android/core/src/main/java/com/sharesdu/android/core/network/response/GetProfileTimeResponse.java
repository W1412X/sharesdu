package com.sharesdu.android.core.network.response;

import com.google.gson.annotations.SerializedName;
import java.util.List;
import java.util.Map;

/**
 * 获取头像更新时间响应
 * GET /image/profile/time
 */
public class GetProfileTimeResponse {
    @SerializedName("status")
    private int status;
    
    @SerializedName("message")
    private String message;
    
    @SerializedName("time_list")
    private List<Map<String, Object>> time_list;
    
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
    
    public List<Map<String, Object>> getTime_list() {
        return time_list;
    }
    
    public void setTime_list(List<Map<String, Object>> time_list) {
        this.time_list = time_list;
    }
    
    public boolean isSuccess() {
        return status == 200;
    }
}

