package com.sharesdu.android.core.network.response;

import com.google.gson.annotations.SerializedName;
import java.util.List;
import java.util.Map;

/**
 * 获取标签列表响应
 * GET /tag/list
 */
public class GetTagListResponse {
    @SerializedName("status")
    private int status;
    
    @SerializedName("message")
    private String message;
    
    @SerializedName("tag_list")
    private List<Map<String, Object>> tag_list;
    
    @SerializedName("total_items")
    private Integer total_items;
    
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
    
    public List<Map<String, Object>> getTag_list() {
        return tag_list;
    }
    
    public void setTag_list(List<Map<String, Object>> tag_list) {
        this.tag_list = tag_list;
    }
    
    public Integer getTotal_items() {
        return total_items;
    }
    
    public void setTotal_items(Integer total_items) {
        this.total_items = total_items;
    }
    
    public boolean isSuccess() {
        return status == 200;
    }
}

