package com.sharesdu.android.core.network;

import com.sharesdu.android.core.network.response.GetAuthorInfoResponse;
import com.sharesdu.android.core.network.response.GetUserListResponse;
import com.sharesdu.android.core.network.response.UserContentResponse;
import com.sharesdu.android.core.network.response.UserPreviewResponse;
import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Query;

/**
 * 用户板块 API 接口
 */
public interface UserService {
    /**
     * 获取用户主页
     * GET /homepage?user_id=user_id
     * 
     * @param user_id 目标用户的 user_id，若为空则返回当前登录用户的主页
     * @return GetAuthorInfoResponse，data 包含用户信息
     */
    @GET("homepage")
    Call<GetAuthorInfoResponse> getAuthorInfo(@Query("user_id") Integer user_id);
    
    /**
     * 分页获取用户列表（按照荣誉分排序，master和super_master置顶）
     * GET /user/list?page_index=page_index&page_size=page_size
     * 
     * @param page_index 页码
     * @param page_size 每页数量
     * @return GetUserListResponse，包含 user_list 数组
     */
    @GET("user/list")
    Call<GetUserListResponse> getUserList(
            @Query("page_index") Integer page_index,
            @Query("page_size") Integer page_size
    );
    
    /**
     * 获取用户创作内容预览
     * GET /user/preview?user_id=user_id
     * 
     * @param user_id 目标用户的 user_id，若为空则返回当前登录用户的数据
     * @return UserPreviewResponse，包含 articles, posts, replies 数组
     */
    @GET("user/preview")
    Call<UserPreviewResponse> getUserPreview(@Query("user_id") Integer user_id);
    
    /**
     * 获取用户创作详情
     * GET /user/content?type=content_type&user_id=user_id&page=page&page_size=page_size
     * 
     * @param type 内容类型：article/post/reply
     * @param user_id 目标用户的 user_id，若为空则返回当前登录用户的数据
     * @param page 页码，默认为1
     * @param page_size 每页数量，默认为10，最大100
     * @return UserContentResponse，包含 results 数组
     */
    @GET("user/content")
    Call<UserContentResponse> getUserContent(
            @Query("type") String type,
            @Query("user_id") Integer user_id,
            @Query("page") Integer page,
            @Query("page_size") Integer page_size
    );
}

