package com.sharesdu.android.core.network;

import com.sharesdu.android.core.network.response.CreateArticlePostResponse;
import com.sharesdu.android.core.network.response.CreateCoursePostResponse;
import com.sharesdu.android.core.network.response.CreateReplyResponse;
import com.sharesdu.android.core.network.response.DeletePostResponse;
import com.sharesdu.android.core.network.response.DeleteReplyResponse;
import com.sharesdu.android.core.network.response.PostDetailResponse;
import com.sharesdu.android.core.network.response.ReplyDetailResponse;
import com.sharesdu.android.core.network.response.ReplyListResponse;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Query;
import java.util.Map;

/**
 * 帖子与回复板块 API 接口
 */
public interface PostService {
    /**
     * 在文章下发帖
     * POST /post/article_post
     * 
     * @param requestBody 帖子信息
     *                    {
     *                      "article_id": 文章ID,
     *                      "post_title": "帖子标题（选填）",
     *                      "post_content": "帖子内容"
     *                    }
     * @return CreateArticlePostResponse，成功时包含 post_id
     */
    @POST("post/article_post")
    Call<CreateArticlePostResponse> createArticlePost(@Body Map<String, Object> requestBody);
    
    /**
     * 在课程下发帖
     * POST /post/course_post
     * 
     * @param requestBody 帖子信息
     *                    {
     *                      "course_id": 课程ID,
     *                      "post_title": "帖子标题（选填）",
     *                      "post_content": "帖子内容"
     *                    }
     * @return CreateCoursePostResponse，成功时包含 post_id
     */
    @POST("post/course_post")
    Call<CreateCoursePostResponse> createCoursePost(@Body Map<String, Object> requestBody);
    
    /**
     * 获取帖子详细信息
     * GET /post/detail?post_id=post_id
     * 
     * @param post_id 帖子ID
     * @return PostDetailResponse
     */
    @GET("post/detail")
    Call<PostDetailResponse> getPostDetail(@Query("post_id") Integer post_id);
    
    /**
     * 获取帖子下的回复列表
     * GET /post/reply_list?post_id=post_id&page_index=page_index&page_size=page_size
     * 
     * @param post_id 帖子ID
     * @param page_index 页码，默认为1
     * @param page_size 每页数量，默认为20
     * @return ReplyListResponse
     */
    @GET("post/reply_list")
    Call<ReplyListResponse> getReplyList(
            @Query("post_id") Integer post_id,
            @Query("page_index") Integer page_index,
            @Query("page_size") Integer page_size
    );
    
    /**
     * 删除帖子
     * POST /post/delete
     * 
     * @param requestBody 包含 post_id
     *                    {"post_id": 帖子ID}
     * @return DeletePostResponse
     */
    @POST("post/delete")
    Call<DeletePostResponse> deletePost(@Body Map<String, Integer> requestBody);
    
    /**
     * 创建回复
     * POST /reply/create
     * 
     * @param requestBody 回复信息
     *                    {
     *                      "post_id": 帖子ID,
     *                      "reply_content": "回复内容",
     *                      "parent_reply_id": 父回复ID（选填，用于回复回复）
     *                    }
     * @return CreateReplyResponse
     */
    @POST("reply/create")
    Call<CreateReplyResponse> createReply(@Body Map<String, Object> requestBody);
    
    /**
     * 删除回复
     * POST /reply/delete
     * 
     * @param requestBody 包含 reply_id
     *                    {"reply_id": 回复ID}
     * @return DeleteReplyResponse
     */
    @POST("reply/delete")
    Call<DeleteReplyResponse> deleteReply(@Body Map<String, Integer> requestBody);
    
    /**
     * 获取回复详情
     * GET /reply/detail?reply_id=reply_id
     * 
     * @param reply_id 回复ID
     * @return ReplyDetailResponse
     */
    @GET("reply/detail")
    Call<ReplyDetailResponse> getReplyDetail(@Query("reply_id") Integer reply_id);
}

