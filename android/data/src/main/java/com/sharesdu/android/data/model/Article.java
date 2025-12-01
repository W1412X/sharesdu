package com.sharesdu.android.data.model;

import com.google.gson.annotations.SerializedName;

/**
 * 文章数据模型
 */
public class Article {
    @SerializedName("id")
    private Integer id;
    
    @SerializedName("article_title")
    private String title;
    
    @SerializedName("article_summary")
    private String summary;
    
    @SerializedName("author_name")
    private String authorName;
    
    @SerializedName("author_id")
    private Integer authorId;
    
    @SerializedName("view_count")
    private Integer viewNum;
    
    @SerializedName("star_count")
    private Integer starNum;
    
    @SerializedName("like_count")
    private Integer likeNum;
    
    @SerializedName("reply_count")
    private Integer replyNum;
    
    @SerializedName("hot_score")
    private Integer hotScore;
    
    @SerializedName("cover_link")
    private String coverLink;
    
    @SerializedName("publish_time")
    private String publishTime;
    
    @SerializedName("article_tags")
    private String articleTags;
    
    @SerializedName("if_top")
    private Boolean ifTop;
    
    @SerializedName("article_type")
    private String type;
    
    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    
    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }
    
    public Integer getAuthorId() { return authorId; }
    public void setAuthorId(Integer authorId) { this.authorId = authorId; }
    
    public Integer getViewNum() { return viewNum; }
    public void setViewNum(Integer viewNum) { this.viewNum = viewNum; }
    
    public Integer getStarNum() { return starNum; }
    public void setStarNum(Integer starNum) { this.starNum = starNum; }
    
    public Integer getLikeNum() { return likeNum; }
    public void setLikeNum(Integer likeNum) { this.likeNum = likeNum; }
    
    public Integer getReplyNum() { return replyNum; }
    public void setReplyNum(Integer replyNum) { this.replyNum = replyNum; }
    
    public Integer getHotScore() { return hotScore; }
    public void setHotScore(Integer hotScore) { this.hotScore = hotScore; }
    
    public String getCoverLink() { return coverLink; }
    public void setCoverLink(String coverLink) { this.coverLink = coverLink; }
    
    public String getPublishTime() { return publishTime; }
    public void setPublishTime(String publishTime) { this.publishTime = publishTime; }
    
    public String getArticleTags() { return articleTags; }
    public void setArticleTags(String articleTags) { this.articleTags = articleTags; }
    
    public Boolean getIfTop() { return ifTop; }
    public void setIfTop(Boolean ifTop) { this.ifTop = ifTop; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}

