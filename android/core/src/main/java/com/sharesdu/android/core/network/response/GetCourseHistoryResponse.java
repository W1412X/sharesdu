package com.sharesdu.android.core.network.response;

import com.google.gson.annotations.SerializedName;
import java.util.List;
import java.util.Map;

/**
 * 获取课程历史版本响应
 * GET /admin/courses/{course_id}/history
 */
public class GetCourseHistoryResponse {
    @SerializedName("status")
    private int status;
    
    @SerializedName("message")
    private String message;
    
    @SerializedName("total_versions")
    private Integer total_versions;
    
    @SerializedName("count")
    private Integer count;
    
    @SerializedName("histories")
    private List<Map<String, Object>> histories;
    
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
    
    public Integer getTotal_versions() {
        return total_versions;
    }
    
    public void setTotal_versions(Integer total_versions) {
        this.total_versions = total_versions;
    }
    
    public Integer getCount() {
        return count;
    }
    
    public void setCount(Integer count) {
        this.count = count;
    }
    
    public List<Map<String, Object>> getHistories() {
        return histories;
    }
    
    public void setHistories(List<Map<String, Object>> histories) {
        this.histories = histories;
    }
    
    public boolean isSuccess() {
        return status == 200;
    }
}

