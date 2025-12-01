package com.sharesdu.android.core.network.response;

import com.google.gson.annotations.SerializedName;

/**
 * 发送私信响应
 * POST /messages/send
 */
public class SendMessageResponse {
    @SerializedName("status")
    private int status;
    
    @SerializedName("message")
    private String message;
    
    @SerializedName("message_id")
    private Integer message_id;
    
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
    
    public Integer getMessage_id() {
        return message_id;
    }
    
    public void setMessage_id(Integer message_id) {
        this.message_id = message_id;
    }
    
    public boolean isSuccess() {
        return status == 200 || status == 201;
    }
}

