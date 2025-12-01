package com.sharesdu.android.core.network;

import com.sharesdu.android.core.network.response.GetLikeCountResponse;
import com.sharesdu.android.core.network.response.GetUserLikeListResponse;
import com.sharesdu.android.core.network.response.SimpleResponse;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Query;
import java.util.Map;

/**
 * 点赞板块 API 接口
 */
public interface LikeService {
    /**
     * 为 article/post/reply 点赞
     * POST /like
     * 
     * @param requestBody 点赞信息
     *                    {
     *                      "content_type": 0/1/2 (article/post/reply),
     *                      "content_id": 内容ID
     *                    }
     * @return SimpleResponse
     */
    @POST("like")
    Call<SimpleResponse> like(@Body Map<String, Integer> requestBody);
    
    /**
     * 取消点赞
     * POST /unlike
     * 
     * @param requestBody 包含 content_type 和 content_id
     *                    {
     *                      "content_type": 0/1/2,
     *                      "content_id": 内容ID
     *                    }
     * @return SimpleResponse
     */
    @POST("unlike")
    Call<SimpleResponse> unlike(@Body Map<String, Integer> requestBody);
    
    /**
     * 获取内容的点赞数
     * GET /like/count?content_type=content_type&content_id=content_id
     * 
     * @param content_type 内容类型：0/1/2
     * @param content_id 内容ID
     * @return GetLikeCountResponse，包含 like_count
     */
    @GET("like/count")
    Call<GetLikeCountResponse> getLikeCount(
            @Query("content_type") Integer content_type,
            @Query("content_id") Integer content_id
    );
    
    /**
     * 获取用户点赞的内容列表
     * GET /like/user?user_id=user_id&page_size=page_size&page_index=page_index
     * 
     * @param user_id 用户ID
     * @param page_size 每页数量，默认20
     * @param page_index 页码，默认1
     * @return GetUserLikeListResponse，包含 content_list
     */
    @GET("like/user")
    Call<GetUserLikeListResponse> getUserLikeList(
            @Query("user_id") Integer user_id,
            @Query("page_size") Integer page_size,
            @Query("page_index") Integer page_index
    );
}

