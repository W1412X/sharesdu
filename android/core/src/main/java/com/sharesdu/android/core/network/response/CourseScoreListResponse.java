package com.sharesdu.android.core.network.response;

import com.google.gson.annotations.SerializedName;
import java.util.List;
import java.util.Map;

/**
 * 课程评分列表响应
 * GET /course/score_list
 */
public class CourseScoreListResponse {
    @SerializedName("status")
    private int status;
    
    @SerializedName("message")
    private String message;
    
    @SerializedName("score_list")
    private List<Map<String, Object>> score_list;
    
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
    
    public List<Map<String, Object>> getScore_list() {
        return score_list;
    }
    
    public void setScore_list(List<Map<String, Object>> score_list) {
        this.score_list = score_list;
    }
    
    public boolean isSuccess() {
        return status == 200;
    }
}

