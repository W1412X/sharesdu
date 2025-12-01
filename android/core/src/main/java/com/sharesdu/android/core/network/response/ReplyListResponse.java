package com.sharesdu.android.core.network.response;

import com.google.gson.annotations.SerializedName;
import java.util.List;
import java.util.Map;

/**
 * 回复列表响应
 * GET /post/reply_list
 * 响应格式：status + message + reply_list + total_pages + current_page在根级别
 */
public class ReplyListResponse {
    @SerializedName("status")
    private int status;
    
    @SerializedName("message")
    private String message;
    
    @SerializedName("reply_list")
    private List<Map<String, Object>> reply_list;
    
    @SerializedName("total_pages")
    private Integer total_pages;
    
    @SerializedName("current_page")
    private Integer current_page;
    
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
    
    public List<Map<String, Object>> getReply_list() {
        return reply_list;
    }
    
    public void setReply_list(List<Map<String, Object>> reply_list) {
        this.reply_list = reply_list;
    }
    
    public Integer getTotal_pages() {
        return total_pages;
    }
    
    public void setTotal_pages(Integer total_pages) {
        this.total_pages = total_pages;
    }
    
    public Integer getCurrent_page() {
        return current_page;
    }
    
    public void setCurrent_page(Integer current_page) {
        this.current_page = current_page;
    }
    
    public boolean isSuccess() {
        return status == 200;
    }
}

