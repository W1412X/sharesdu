package com.sharesdu.android.core.network.response;

import com.google.gson.annotations.SerializedName;

/**
 * 课程回滚响应
 * POST /admin/courses/rollback
 */
public class RollbackCourseResponse {
    @SerializedName("status")
    private int status;
    
    @SerializedName("message")
    private String message;
    
    @SerializedName("new_version")
    private Integer new_version;
    
    @SerializedName("rollback_to")
    private Integer rollback_to;
    
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
    
    public Integer getNew_version() {
        return new_version;
    }
    
    public void setNew_version(Integer new_version) {
        this.new_version = new_version;
    }
    
    public Integer getRollback_to() {
        return rollback_to;
    }
    
    public void setRollback_to(Integer rollback_to) {
        this.rollback_to = rollback_to;
    }
    
    public boolean isSuccess() {
        return status == 200 || status == 201;
    }
}

