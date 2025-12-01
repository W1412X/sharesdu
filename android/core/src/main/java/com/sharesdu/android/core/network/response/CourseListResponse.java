package com.sharesdu.android.core.network.response;

import com.google.gson.annotations.SerializedName;
import java.util.List;
import java.util.Map;

/**
 * 课程列表响应
 * GET /course/list
 * 响应格式：status + message + course_list在根级别
 */
public class CourseListResponse {
    @SerializedName("status")
    private int status;
    
    @SerializedName("message")
    private String message;
    
    @SerializedName("course_list")
    private List<Map<String, Object>> course_list;
    
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
    
    public List<Map<String, Object>> getCourse_list() {
        return course_list;
    }
    
    public void setCourse_list(List<Map<String, Object>> course_list) {
        this.course_list = course_list;
    }
    
    public boolean isSuccess() {
        return status == 200;
    }
}

