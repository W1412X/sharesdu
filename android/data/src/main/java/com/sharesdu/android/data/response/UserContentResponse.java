package com.sharesdu.android.data.response;

import com.google.gson.annotations.SerializedName;
import java.util.List;
import java.util.Map;

/**
 * 用户创作详情响应（分页）
 * GET /user/content
 * 响应格式：status + message + count/next/previous/results/timestamp
 */
public class UserContentResponse {
    @SerializedName("status")
    private int status;
    
    @SerializedName("message")
    private String message;
    
    @SerializedName("count")
    private Integer count;
    
    @SerializedName("next")
    private String next;
    
    @SerializedName("previous")
    private String previous;
    
    @SerializedName("results")
    private List<Map<String, Object>> results;
    
    @SerializedName("timestamp")
    private String timestamp;
    
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
    
    public Integer getCount() {
        return count;
    }
    
    public void setCount(Integer count) {
        this.count = count;
    }
    
    public String getNext() {
        return next;
    }
    
    public void setNext(String next) {
        this.next = next;
    }
    
    public String getPrevious() {
        return previous;
    }
    
    public void setPrevious(String previous) {
        this.previous = previous;
    }
    
    public List<Map<String, Object>> getResults() {
        return results;
    }
    
    public void setResults(List<Map<String, Object>> results) {
        this.results = results;
    }
    
    public String getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }
    
    public boolean isSuccess() {
        return status == 200;
    }
}

