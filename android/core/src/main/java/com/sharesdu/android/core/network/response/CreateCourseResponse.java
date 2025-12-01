package com.sharesdu.android.core.network.response;

import com.google.gson.annotations.SerializedName;

/**
 * 创建课程响应
 * POST /course/create
 */
public class CreateCourseResponse {
    @SerializedName("status")
    private int status;
    
    @SerializedName("message")
    private String message;
    
    @SerializedName("course_id")
    private Integer course_id;
    
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
    
    public boolean isSuccess() {
        return status == 200 || status == 201;
    }
}

