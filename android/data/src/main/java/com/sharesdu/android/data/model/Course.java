package com.sharesdu.android.data.model;

import com.google.gson.annotations.SerializedName;

/**
 * 课程数据模型
 */
public class Course {
    @SerializedName("id")
    private Integer id;
    
    @SerializedName("course_name")
    private String name;
    
    @SerializedName("course_type")
    private String type;
    
    @SerializedName("college")
    private String college;
    
    @SerializedName("campus")
    private String campus;
    
    @SerializedName("credits")
    private Integer credit;
    
    @SerializedName("course_teacher")
    private String teacher;
    
    @SerializedName("course_method")
    private String attendMethod;
    
    @SerializedName("assessment_method")
    private String examineMethod;
    
    @SerializedName("all_score")
    private Double score;
    
    @SerializedName("all_people")
    private Integer evaluateNum;
    
    @SerializedName("publish_time")
    private String publishTime;
    
    @SerializedName("like_count")
    private Integer likeNum;
    
    @SerializedName("if_like")
    private Boolean ifLike;
    
    @SerializedName("if_star")
    private Boolean ifStar;
    
    @SerializedName("score_distribution")
    private java.util.List<Integer> scoreDistribution;
    
    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public String getCollege() { return college; }
    public void setCollege(String college) { this.college = college; }
    
    public String getCampus() { return campus; }
    public void setCampus(String campus) { this.campus = campus; }
    
    public Integer getCredit() { return credit; }
    public void setCredit(Integer credit) { this.credit = credit; }
    
    public String getTeacher() { return teacher; }
    public void setTeacher(String teacher) { this.teacher = teacher; }
    
    public String getAttendMethod() { return attendMethod; }
    public void setAttendMethod(String attendMethod) { this.attendMethod = attendMethod; }
    
    public String getExamineMethod() { return examineMethod; }
    public void setExamineMethod(String examineMethod) { this.examineMethod = examineMethod; }
    
    public Double getScore() { return score; }
    public void setScore(Double score) { this.score = score; }
    
    public Integer getEvaluateNum() { return evaluateNum; }
    public void setEvaluateNum(Integer evaluateNum) { this.evaluateNum = evaluateNum; }
    
    public String getPublishTime() { return publishTime; }
    public void setPublishTime(String publishTime) { this.publishTime = publishTime; }
    
    public Integer getLikeNum() { return likeNum; }
    public void setLikeNum(Integer likeNum) { this.likeNum = likeNum; }
    
    public Boolean getIfLike() { return ifLike; }
    public void setIfLike(Boolean ifLike) { this.ifLike = ifLike; }
    
    public Boolean getIfStar() { return ifStar; }
    public void setIfStar(Boolean ifStar) { this.ifStar = ifStar; }
    
    public java.util.List<Integer> getScoreDistribution() { return scoreDistribution; }
    public void setScoreDistribution(java.util.List<Integer> scoreDistribution) { 
        this.scoreDistribution = scoreDistribution; 
    }
}

