package com.sharesdu.android.core.network.response;

import com.google.gson.annotations.SerializedName;

/**
 * 登录响应
 * POST /login_passwd 或 POST /login_email
 */
public class LoginResponse {
    @SerializedName("status")
    private int status;
    
    @SerializedName("message")
    private String message;
    
    @SerializedName("user_id")
    private Integer user_id;
    
    @SerializedName("user_name")
    private String user_name;
    
    @SerializedName("email")
    private String email;
    
    @SerializedName("refresh")
    private String refresh;
    
    @SerializedName("is_master")
    private Boolean is_master;
    
    @SerializedName("is_super_master")
    private Boolean is_super_master;
    
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
    
    public Integer getUser_id() {
        return user_id;
    }
    
    public void setUser_id(Integer user_id) {
        this.user_id = user_id;
    }
    
    public String getUser_name() {
        return user_name;
    }
    
    public void setUser_name(String user_name) {
        this.user_name = user_name;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getRefresh() {
        return refresh;
    }
    
    public void setRefresh(String refresh) {
        this.refresh = refresh;
    }
    
    public Boolean getIs_master() {
        return is_master;
    }
    
    public void setIs_master(Boolean is_master) {
        this.is_master = is_master;
    }
    
    public Boolean getIs_super_master() {
        return is_super_master;
    }
    
    public void setIs_super_master(Boolean is_super_master) {
        this.is_super_master = is_super_master;
    }
    
    public boolean isSuccess() {
        return status == 200 || status == 201;
    }
}

