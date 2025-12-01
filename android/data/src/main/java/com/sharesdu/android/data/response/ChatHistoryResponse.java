package com.sharesdu.android.data.response;

import com.google.gson.annotations.SerializedName;
import java.util.List;
import java.util.Map;

/**
 * 聊天记录响应
 * GET /messages/history/<user_id>
 * 响应格式：status + message + data（包含 other_user, count, next, previous, results, timestamp）
 */
public class ChatHistoryResponse {
    @SerializedName("status")
    private int status;
    
    @SerializedName("message")
    private String message;
    
    @SerializedName("data")
    private ChatHistoryData data;
    
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
    
    public ChatHistoryData getData() {
        return data;
    }
    
    public void setData(ChatHistoryData data) {
        this.data = data;
    }
    
    public boolean isSuccess() {
        return status == 200;
    }
    
    /**
     * 聊天记录数据内部类
     */
    public static class ChatHistoryData {
        @SerializedName("other_user")
        private Map<String, Object> other_user;
        
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
        
        public Map<String, Object> getOther_user() {
            return other_user;
        }
        
        public void setOther_user(Map<String, Object> other_user) {
            this.other_user = other_user;
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
    }
}

