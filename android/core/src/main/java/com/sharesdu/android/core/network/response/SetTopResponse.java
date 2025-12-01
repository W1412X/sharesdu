package com.sharesdu.android.core.network.response;

import com.google.gson.annotations.SerializedName;

/**
 * 置顶响应（通用）
 * POST /articles/{article_id}/top, /article-posts/{post_id}/top, /course-posts/{post_id}/top
 */
public class SetTopResponse {
    @SerializedName("status")
    private int status;
    
    @SerializedName("message")
    private String message;
    
    @SerializedName("article_id")
    private Integer article_id;
    
    @SerializedName("post_id")
    private Integer post_id;
    
    @SerializedName("course_id")
    private Integer course_id;
    
    @SerializedName("top")
    private Boolean top;
    
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
    
    public Integer getArticle_id() {
        return article_id;
    }
    
    public void setArticle_id(Integer article_id) {
        this.article_id = article_id;
    }
    
    public Integer getPost_id() {
        return post_id;
    }
    
    public void setPost_id(Integer post_id) {
        this.post_id = post_id;
    }
    
    public Integer getCourse_id() {
        return course_id;
    }
    
    public void setCourse_id(Integer course_id) {
        this.course_id = course_id;
    }
    
    public Boolean getTop() {
        return top;
    }
    
    public void setTop(Boolean top) {
        this.top = top;
    }
    
    public boolean isSuccess() {
        return status == 200 || status == 201;
    }
}

