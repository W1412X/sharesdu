package com.sharesdu.android.core.network;

import com.sharesdu.android.core.network.response.SetTopResponse;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.POST;
import retrofit2.http.Path;
import java.util.Map;

/**
 * 置顶板块 API 接口
 */
public interface TopService {
    /**
     * 文章置顶
     * POST /articles/{article_id}/top
     * 
     * @param article_id 文章ID（路径参数）
     * @param requestBody 包含 top（boolean）
     *                    {"top": true/false}
     * @return SetTopResponse，包含 article_id 和 top
     */
    @POST("articles/{article_id}/top")
    Call<SetTopResponse> setArticleTop(
            @Path("article_id") Integer article_id,
            @Body Map<String, Boolean> requestBody
    );
    
    /**
     * 文章内帖子置顶
     * POST /article-posts/{post_id}/top
     * 
     * @param post_id 帖子ID（路径参数）
     * @param requestBody 包含 top（boolean）
     *                    {"top": true/false}
     * @return SetTopResponse，包含 post_id, article_id 和 top
     */
    @POST("article-posts/{post_id}/top")
    Call<SetTopResponse> setArticlePostTop(
            @Path("post_id") Integer post_id,
            @Body Map<String, Boolean> requestBody
    );
    
    /**
     * 课程内帖子置顶
     * POST /course-posts/{post_id}/top
     * 
     * @param post_id 帖子ID（路径参数）
     * @param requestBody 包含 top（boolean）
     *                    {"top": true/false}
     * @return SetTopResponse，包含 post_id, course_id 和 top
     */
    @POST("course-posts/{post_id}/top")
    Call<SetTopResponse> setCoursePostTop(
            @Path("post_id") Integer post_id,
            @Body Map<String, Boolean> requestBody
    );
}

