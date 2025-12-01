package com.sharesdu.android.core.network.response;

import com.google.gson.annotations.SerializedName;
import java.util.List;
import java.util.Map;

/**
 * 收藏列表响应
 * GET /star/list?folder_id=folder_id&page_index=page_index&page_size=page_size
 * 响应格式：status + message + star_list在根级别
 */
public class StarListResponse {
    @SerializedName("status")
    private int status;
    
    @SerializedName("message")
    private String message;
    
    @SerializedName("star_list")
    private List<Map<String, Object>> star_list;
    
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
    
    public List<Map<String, Object>> getStar_list() {
        return star_list;
    }
    
    public void setStar_list(List<Map<String, Object>> star_list) {
        this.star_list = star_list;
    }
    
    public boolean isSuccess() {
        return status == 200;
    }
}

