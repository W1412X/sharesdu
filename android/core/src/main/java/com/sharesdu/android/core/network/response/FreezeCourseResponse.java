package com.sharesdu.android.core.network.response;

import com.google.gson.annotations.SerializedName;

/**
 * 冻结课程响应
 * POST /admin/courses/freeze
 */
public class FreezeCourseResponse {
    @SerializedName("status")
    private int status;
    
    @SerializedName("message")
    private String message;
    
    @SerializedName("course_id")
    private Integer course_id;
    
    @SerializedName("new_state")
    private String new_state;
    
    @SerializedName("modified_at")
    private String modified_at;
    
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
    
    public Integer getCourse_id() {
        return course_id;
    }
    
    public void setCourse_id(Integer course_id) {
        this.course_id = course_id;
    }
    
    public String getNew_state() {
        return new_state;
    }
    
    public void setNew_state(String new_state) {
        this.new_state = new_state;
    }
    
    public String getModified_at() {
        return modified_at;
    }
    
    public void setModified_at(String modified_at) {
        this.modified_at = modified_at;
    }
    
    public boolean isSuccess() {
        return status == 200 || status == 201;
    }
}

