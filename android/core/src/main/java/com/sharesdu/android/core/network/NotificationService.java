package com.sharesdu.android.core.network;

import com.sharesdu.android.core.network.response.NotificationListResponse;
import com.sharesdu.android.core.network.response.SimpleResponse;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Query;
import java.util.Map;

/**
 * 通知板块 API 接口
 */
public interface NotificationService {
    /**
     * 获取通知列表
     * GET /notifications/list?page_size=page_size&page_index=page_index
     * 
     * @param page_size 每页数量，默认10
     * @param page_index 页码，默认1
     * @return NotificationListResponse，包含 notification_list, total, unread_count
     */
    @GET("notifications/list")
    Call<NotificationListResponse> getNotificationList(
            @Query("page_size") Integer page_size,
            @Query("page_index") Integer page_index
    );
    
    /**
     * 标记通知为已读
     * POST /notifications/read
     * 
     * @param requestBody 包含 notification_ids 数组
     *                    {"notification_ids": [1, 2, 3]}
     * @return SimpleResponse
     */
    @POST("notifications/read")
    Call<SimpleResponse> markNotificationsAsRead(@Body Map<String, Object> requestBody);
}

