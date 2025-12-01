package com.sharesdu.android.core.network.response;

import com.google.gson.annotations.SerializedName;
import java.util.List;
import java.util.Map;

/**
 * 搜索响应（通用）
 * GET /search/articles, /search/posts, /search/replies, /search/courses, /search/global
 */
public class SearchResponse {
    @SerializedName("status")
    private int status;
    
    @SerializedName("message")
    private String message;
    
    @SerializedName("results")
    private List<Map<String, Object>> results;
    
    @SerializedName("count")
    private Integer count;
    
    @SerializedName("page")
    private Integer page;
    
    @SerializedName("page_size")
    private Integer page_size;
    
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
    
    public List<Map<String, Object>> getResults() {
        return results;
    }
    
    public void setResults(List<Map<String, Object>> results) {
        this.results = results;
    }
    
    public Integer getCount() {
        return count;
    }
    
    public void setCount(Integer count) {
        this.count = count;
    }
    
    public Integer getPage() {
        return page;
    }
    
    public void setPage(Integer page) {
        this.page = page;
    }
    
    public Integer getPage_size() {
        return page_size;
    }
    
    public void setPage_size(Integer page_size) {
        this.page_size = page_size;
    }
    
    public boolean isSuccess() {
        return status == 200;
    }
}

