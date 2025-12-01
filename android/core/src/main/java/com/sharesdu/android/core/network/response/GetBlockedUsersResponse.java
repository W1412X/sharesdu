package com.sharesdu.android.core.network.response;

import com.google.gson.annotations.SerializedName;
import java.util.List;
import java.util.Map;

/**
 * 获取封禁用户列表响应
 * GET /admin/blocked-users
 */
public class GetBlockedUsersResponse {
    @SerializedName("status")
    private int status;
    
    @SerializedName("message")
    private String message;
    
    @SerializedName("user_list")
    private List<Map<String, Object>> user_list;
    
    @SerializedName("user_num")
    private Integer user_num;
    
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
    
    public List<Map<String, Object>> getUser_list() {
        return user_list;
    }
    
    public void setUser_list(List<Map<String, Object>> user_list) {
        this.user_list = user_list;
    }
    
    public Integer getUser_num() {
        return user_num;
    }
    
    public void setUser_num(Integer user_num) {
        this.user_num = user_num;
    }
    
    public boolean isSuccess() {
        return status == 200;
    }
}

