package com.sharesdu.android.core.network.response;

import com.google.gson.annotations.SerializedName;

/**
 * 创建回复响应
 * POST /reply/create
 * 响应格式：status + message + reply_id在根级别
 */
public class CreateReplyResponse {
    @SerializedName("status")
    private int status;
    
    @SerializedName("message")
    private String message;
    
    @SerializedName("reply_id")
    private Integer reply_id;
    
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
    
    public Integer getReply_id() {
        return reply_id;
    }
    
    public void setReply_id(Integer reply_id) {
        this.reply_id = reply_id;
    }
    
    public boolean isSuccess() {
        return status == 200 || status == 201;
    }
}

