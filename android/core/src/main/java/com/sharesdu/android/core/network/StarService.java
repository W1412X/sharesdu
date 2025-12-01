package com.sharesdu.android.core.network;

import com.sharesdu.android.core.network.response.CreateStarFolderResponse;
import com.sharesdu.android.core.network.response.SimpleResponse;
import com.sharesdu.android.core.network.response.StarFolderListResponse;
import com.sharesdu.android.core.network.response.StarListResponse;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.DELETE;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Path;
import retrofit2.http.Query;
import java.util.Map;

/**
 * 收藏板块 API 接口
 */
public interface StarService {
    /**
     * 收藏 Course/Article/Post
     * POST /star
     * 
     * @param requestBody 收藏信息
     *                    {
     *                      "content_type": 0/1/2 (课程/文章/帖子),
     *                      "content_id": 内容ID,
     *                      "folder_id": 收藏夹ID（选填）
     *                    }
     * @return SimpleResponse
     */
    @POST("star")
    Call<SimpleResponse> star(@Body Map<String, Integer> requestBody);
    
    /**
     * 创建收藏夹
     * POST /star/create
     * 
     * @param requestBody 收藏夹信息
     *                    {
     *                      "folder_name": "收藏夹名称",
     *                      "description": "描述（选填）"
     *                    }
     * @return CreateStarFolderResponse，成功时包含 folder_id
     */
    @POST("star/create")
    Call<CreateStarFolderResponse> createStarFolder(@Body Map<String, String> requestBody);
    
    /**
     * 获取收藏列表
     * GET /star/list?folder_id=folder_id&page_index=page_index&page_size=page_size
     * 
     * @param folder_id 收藏夹ID（选填）
     * @param page_index 页码，默认1
     * @param page_size 每页数量，默认20
     * @return StarListResponse，包含 star_list
     */
    @GET("star/list")
    Call<StarListResponse> getStarList(
            @Query("folder_id") Integer folder_id,
            @Query("page_index") Integer page_index,
            @Query("page_size") Integer page_size
    );
    
    /**
     * 取消收藏
     * POST /unstar
     * 
     * @param requestBody 包含 content_type 和 content_id
     *                    {
     *                      "content_type": 0/1/2,
     *                      "content_id": 内容ID
     *                    }
     * @return SimpleResponse
     */
    @POST("unstar")
    Call<SimpleResponse> unstar(@Body Map<String, Integer> requestBody);
    
    /**
     * 获取收藏夹列表
     * GET /star/folder/list
     * 
     * @return StarFolderListResponse，包含 folders
     */
    @GET("star/folder/list")
    Call<StarFolderListResponse> getStarFolderList();
    
    /**
     * 删除收藏夹
     * DELETE /star/folder/{folder_id}
     * 
     * @param folder_id 收藏夹ID
     * @return SimpleResponse
     */
    @DELETE("star/folder/{folder_id}")
    Call<SimpleResponse> deleteStarFolder(@Path("folder_id") Integer folder_id);
}

