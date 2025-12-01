package com.sharesdu.android.data.model;

import com.google.gson.annotations.SerializedName;

/**
 * 帖子数据模型
 */
public class Post {
    @SerializedName("id")
    private Integer id;
    
    @SerializedName("post_title")
    private String title;
    
    @SerializedName("post_content")
    private String content;
    
    @SerializedName("author_name")
    private String authorName;
    
    @SerializedName("author_id")
    private Integer authorId;
    
    @SerializedName("view_count")
    private Integer viewNum;
    
    @SerializedName("reply_count")
    private Integer replyNum;
    
    @SerializedName("publish_time")
    private String publishTime;
    
    @SerializedName("article_id")
    private Integer articleId;
    
    @SerializedName("like_count")
    private Integer likeNum;
    
    @SerializedName("if_like")
    private Boolean ifLike;
    
    @SerializedName("if_top")
    private Boolean ifTop;
    
    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }
    
    public Integer getAuthorId() { return authorId; }
    public void setAuthorId(Integer authorId) { this.authorId = authorId; }
    
    public Integer getViewNum() { return viewNum; }
    public void setViewNum(Integer viewNum) { this.viewNum = viewNum; }
    
    public Integer getReplyNum() { return replyNum; }
    public void setReplyNum(Integer replyNum) { this.replyNum = replyNum; }
    
    public String getPublishTime() { return publishTime; }
    public void setPublishTime(String publishTime) { this.publishTime = publishTime; }
    
    public Integer getArticleId() { return articleId; }
    public void setArticleId(Integer articleId) { this.articleId = articleId; }
    
    public Integer getLikeNum() { return likeNum; }
    public void setLikeNum(Integer likeNum) { this.likeNum = likeNum; }
    
    public Boolean getIfLike() { return ifLike; }
    public void setIfLike(Boolean ifLike) { this.ifLike = ifLike; }
    
    public Boolean getIfTop() { return ifTop; }
    public void setIfTop(Boolean ifTop) { this.ifTop = ifTop; }
}

