package com.sharesdu.android.core.network.response;

import com.google.gson.annotations.SerializedName;
import java.util.Map;

/**
 * 回复详情响应
 * GET /reply/detail
 * 响应格式：status + message + reply_detail在根级别
 */
public class ReplyDetailResponse {
    @SerializedName("status")
    private int status;
    
    @SerializedName("message")
    private String message;
    
    @SerializedName("reply_detail")
    private Map<String, Object> reply_detail;
    
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
    
    public Map<String, Object> getReply_detail() {
        return reply_detail;
    }
    
    public void setReply_detail(Map<String, Object> reply_detail) {
        this.reply_detail = reply_detail;
    }
    
    public boolean isSuccess() {
        return status == 200 || status == 201;
    }
}

