package com.sharesdu.android.core.network.response;

import com.google.gson.annotations.SerializedName;
import java.util.Map;

/**
 * 课程详情响应
 * GET /course/detail
 */
public class CourseDetailResponse {
    @SerializedName("status")
    private int status;
    
    @SerializedName("message")
    private String message;
    
    @SerializedName("course_detail")
    private Map<String, Object> course_detail;
    
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
    
    public Map<String, Object> getCourse_detail() {
        return course_detail;
    }
    
    public void setCourse_detail(Map<String, Object> course_detail) {
        this.course_detail = course_detail;
    }
    
    public boolean isSuccess() {
        return status == 200;
    }
}

