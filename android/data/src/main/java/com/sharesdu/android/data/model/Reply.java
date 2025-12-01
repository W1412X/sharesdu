package com.sharesdu.android.data.model;

import com.google.gson.annotations.SerializedName;

/**
 * 回复/评论数据模型
 */
public class Reply {
    @SerializedName("reply_id")
    private Integer id;
    
    @SerializedName("reply_content")
    private String content;
    
    @SerializedName("replier_name")
    private String authorName;
    
    @SerializedName("replier_id")
    private Integer authorId;
    
    @SerializedName("like_count")
    private Integer likeNum;
    
    @SerializedName("reply_time")
    private String publishTime;
    
    @SerializedName("if_like")
    private Boolean ifLike;
    
    @SerializedName("parent_reply_id")
    private Integer parentReplyId;
    
    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }
    
    public Integer getAuthorId() { return authorId; }
    public void setAuthorId(Integer authorId) { this.authorId = authorId; }
    
    public Integer getLikeNum() { return likeNum; }
    public void setLikeNum(Integer likeNum) { this.likeNum = likeNum; }
    
    public String getPublishTime() { return publishTime; }
    public void setPublishTime(String publishTime) { this.publishTime = publishTime; }
    
    public Boolean getIfLike() { return ifLike; }
    public void setIfLike(Boolean ifLike) { this.ifLike = ifLike; }
    
    public Integer getParentReplyId() { return parentReplyId; }
    public void setParentReplyId(Integer parentReplyId) { this.parentReplyId = parentReplyId; }
}

