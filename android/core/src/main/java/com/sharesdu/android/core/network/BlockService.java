package com.sharesdu.android.core.network;

import com.sharesdu.android.core.network.response.BlockListResponse;
import com.sharesdu.android.core.network.response.SimpleResponse;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Query;
import java.util.Map;

/**
 * 黑名单板块 API 接口
 */
public interface BlockService {
    /**
     * 拉黑用户
     * POST /block
     * 
     * @param requestBody 包含 to_user_id
     *                    {"to_user_id": 被拉黑用户ID}
     * @return SimpleResponse
     */
    @POST("block")
    Call<SimpleResponse> blockUser(@Body Map<String, Integer> requestBody);
    
    /**
     * 解除拉黑
     * POST /unblock
     * 
     * @param requestBody 包含 to_user_id
     *                    {"to_user_id": 被拉黑用户ID}
     * @return SimpleResponse
     */
    @POST("unblock")
    Call<SimpleResponse> unblockUser(@Body Map<String, Integer> requestBody);
    
    /**
     * 获取黑名单列表
     * GET /blocklist?user_id=user_id
     * 
     * @param user_id 用户ID
     * @return BlockListResponse，包含 block_list
     */
    @GET("blocklist")
    Call<BlockListResponse> getBlockList(@Query("user_id") Integer user_id);
}

