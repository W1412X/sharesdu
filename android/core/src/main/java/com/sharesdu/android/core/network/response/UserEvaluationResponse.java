package com.sharesdu.android.core.network.response;

import com.google.gson.annotations.SerializedName;

/**
 * 用户评价响应
 * POST /course/user_evaluation
 */
public class UserEvaluationResponse {
    @SerializedName("status")
    private int status;
    
    @SerializedName("message")
    private String message;
    
    @SerializedName("score")
    private Double score;
    
    @SerializedName("comment")
    private String comment;
    
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
    
    public Double getScore() {
        return score;
    }
    
    public void setScore(Double score) {
        this.score = score;
    }
    
    public String getComment() {
        return comment;
    }
    
    public void setComment(String comment) {
        this.comment = comment;
    }
    
    public boolean isSuccess() {
        return status == 200;
    }
}

