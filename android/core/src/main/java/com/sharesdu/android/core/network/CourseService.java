package com.sharesdu.android.core.network;

import com.sharesdu.android.core.network.response.CourseDetailResponse;
import com.sharesdu.android.core.network.response.CourseListResponse;
import com.sharesdu.android.core.network.response.CoursePostListResponse;
import com.sharesdu.android.core.network.response.CourseScoreListResponse;
import com.sharesdu.android.core.network.response.CreateCourseResponse;
import com.sharesdu.android.core.network.response.SimpleResponse;
import com.sharesdu.android.core.network.response.UserEvaluationResponse;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Query;
import java.util.Map;

/**
 * 课程板块 API 接口
 */
public interface CourseService {
    /**
     * 创建课程
     * POST /course/create
     * 
     * @param requestBody 课程信息
     *                    {
     *                      "course_name": "课程名",
     *                      "course_type": "compulsory/elective/restricted_elective",
     *                      "college": "学院",
     *                      "campus": "校区",
     *                      "credits": 学分,
     *                      "course_teacher": "教师",
     *                      "course_method": "online/offline/hybrid",
     *                      "assessment_method": "考核方式"
     *                    }
     * @return CreateCourseResponse，成功时包含 course_id
     */
    @POST("course/create")
    Call<CreateCourseResponse> createCourse(@Body Map<String, Object> requestBody);
    
    /**
     * 编辑课程
     * POST /course/edit
     * 
     * @param requestBody 课程信息（id 必填）
     *                    {
     *                      "id": 课程ID,
     *                      "course_name": "课程名",
     *                      "course_type": "课程类型",
     *                      "college": "学院",
     *                      "credits": 学分,
     *                      "course_teacher": "教师",
     *                      "course_method": "教学方式",
     *                      "assessment_method": "考核方式"
     *                    }
     * @return SimpleResponse
     */
    @POST("course/edit")
    Call<SimpleResponse> editCourse(@Body Map<String, Object> requestBody);
    
    /**
     * 删除课程
     * POST /course/delete
     * 
     * @param requestBody 包含 course_id
     *                    {"course_id": 课程ID}
     * @return SimpleResponse
     */
    @POST("course/delete")
    Call<SimpleResponse> deleteCourse(@Body Map<String, Integer> requestBody);
    
    /**
     * 对课程评分并评价
     * POST /course/rate
     * 
     * @param requestBody 评分信息
     *                    {
     *                      "course_id": 课程ID,
     *                      "score": 评分（1-5的整数）,
     *                      "comment": "评价内容（选填）"
     *                    }
     * @return SimpleResponse
     */
    @POST("course/rate")
    Call<SimpleResponse> rateCourse(@Body Map<String, Object> requestBody);
    
    /**
     * 修改课程评分或评价
     * POST /course/edit_rating
     * 
     * @param requestBody 评分信息
     *                    {
     *                      "course_id": 课程ID,
     *                      "score": 评分（0.00-5.00，选填）,
     *                      "comment": "评价内容（选填）"
     *                    }
     * @return SimpleResponse
     */
    @POST("course/edit_rating")
    Call<SimpleResponse> editRating(@Body Map<String, Object> requestBody);
    
    /**
     * 获取某个用户对某个课程的评价
     * POST /course/user_evaluation
     * 
     * @param requestBody 包含 course_id 和 user_id（都是必填）
     *                    {
     *                      "course_id": 课程ID,
     *                      "user_id": 用户ID
     *                    }
     * @return UserEvaluationResponse，包含 score 和 comment
     */
    @POST("course/user_evaluation")
    Call<UserEvaluationResponse> getUserEvaluation(@Body Map<String, Integer> requestBody);
    
    /**
     * 获取课程详细信息
     * GET /course/detail?course_id=course_id
     * 
     * @param course_id 课程ID
     * @return CourseDetailResponse，包含 course_detail
     */
    @GET("course/detail")
    Call<CourseDetailResponse> getCourseDetail(@Query("course_id") Integer course_id);
    
    /**
     * 获取课程下的帖子列表
     * GET /course/post_list?course_id=course_id&page_index=page_index&page_size=page_size
     * 
     * @param course_id 课程ID
     * @param page_index 页码，默认为1
     * @param page_size 每页数量，默认为20
     * @return CoursePostListResponse，包含 post_list
     */
    @GET("course/post_list")
    Call<CoursePostListResponse> getCoursePostList(
            @Query("course_id") Integer course_id,
            @Query("page_index") Integer page_index,
            @Query("page_size") Integer page_size
    );
    
    /**
     * 获取课程下的评分列表
     * GET /course/score_list?course_id=course_id&page_index=page_index&page_size=page_size
     * 
     * @param course_id 课程ID
     * @param page_index 页码，默认为1
     * @param page_size 每页数量，默认为20
     * @return CourseScoreListResponse，包含 score_list
     */
    @GET("course/score_list")
    Call<CourseScoreListResponse> getCourseScoreList(
            @Query("course_id") Integer course_id,
            @Query("page_index") Integer page_index,
            @Query("page_size") Integer page_size
    );
    
    /**
     * 分页获取课程列表
     * GET /course/list?page_index=page_index&page_size=page_size&college=college&course_type=course_type
     * 响应格式：status + message + course_list在根级别（不在data中）
     * 
     * @param page_index 页码，默认为1
     * @param page_size 每页数量，默认为20
     * @param college 学院（选填）
     * @param course_type 课程类型（选填）
     * @return CourseListResponse，包含 course_list
     */
    @GET("course/list")
    Call<CourseListResponse> getCourseList(
            @Query("page_index") Integer page_index,
            @Query("page_size") Integer page_size,
            @Query("college") String college,
            @Query("course_type") String course_type
    );
}

