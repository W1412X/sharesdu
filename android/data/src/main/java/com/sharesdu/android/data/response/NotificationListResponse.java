package com.sharesdu.android.data.response;

import com.google.gson.annotations.SerializedName;
import java.util.List;
import java.util.Map;

/**
 * 通知列表响应
 * GET /notifications/list
 * 响应格式：status + message + notification_list/total/unread_count在根级别
 */
public class NotificationListResponse {
    @SerializedName("status")
    private int status;
    
    @SerializedName("message")
    private String message;
    
    @SerializedName("notification_list")
    private List<Map<String, Object>> notification_list;
    
    @SerializedName("total")
    private Integer total;
    
    @SerializedName("unread_count")
    private Integer unread_count;
    
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
    
    public List<Map<String, Object>> getNotification_list() {
        return notification_list;
    }
    
    public void setNotification_list(List<Map<String, Object>> notification_list) {
        this.notification_list = notification_list;
    }
    
    public Integer getTotal() {
        return total;
    }
    
    public void setTotal(Integer total) {
        this.total = total;
    }
    
    public Integer getUnread_count() {
        return unread_count;
    }
    
    public void setUnread_count(Integer unread_count) {
        this.unread_count = unread_count;
    }
    
    public boolean isSuccess() {
        return status == 200;
    }
}

