package com.sharesdu.android.core.network.response;

import com.google.gson.annotations.SerializedName;
import java.util.List;
import java.util.Map;

/**
 * 课程帖子列表响应
 * GET /course/post_list
 */
public class CoursePostListResponse {
    @SerializedName("status")
    private int status;
    
    @SerializedName("message")
    private String message;
    
    @SerializedName("post_list")
    private List<Map<String, Object>> post_list;
    
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
    
    public List<Map<String, Object>> getPost_list() {
        return post_list;
    }
    
    public void setPost_list(List<Map<String, Object>> post_list) {
        this.post_list = post_list;
    }
    
    public boolean isSuccess() {
        return status == 200;
    }
}

