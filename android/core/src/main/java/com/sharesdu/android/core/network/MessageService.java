package com.sharesdu.android.core.network;

import com.sharesdu.android.core.network.response.ChatHistoryResponse;
import com.sharesdu.android.core.network.response.ChatUsersResponse;
import com.sharesdu.android.core.network.response.GetMessageListResponse;
import com.sharesdu.android.core.network.response.SendMessageResponse;
import com.sharesdu.android.core.network.response.SimpleResponse;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Path;
import retrofit2.http.Query;
import java.util.Map;

/**
 * 私信板块 API 接口
 */
public interface MessageService {
    /**
     * 发送私信
     * POST /messages/send
     * 
     * @param requestBody 私信信息
     *                    {
     *                      "receiver_id": 接收者用户ID,
     *                      "content": "私信内容"
     *                    }
     * @return SendMessageResponse，成功时包含 message_id
     */
    @POST("messages/send")
    Call<SendMessageResponse> sendMessage(@Body Map<String, Object> requestBody);
    
    /**
     * 获取私信列表
     * GET /messages/list?page_size=page_size&page_index=page_index
     * 
     * @param page_size 每页数量，默认10
     * @param page_index 页码，默认1
     * @return GetMessageListResponse，包含 message_list
     */
    @GET("messages/list")
    Call<GetMessageListResponse> getMessageList(
            @Query("page_size") Integer page_size,
            @Query("page_index") Integer page_index
    );
    
    /**
     * 标记消息为已读
     * POST /messages/read
     * 
     * @param requestBody 包含 message_id
     *                    {"message_id": 消息ID}
     * @return SimpleResponse
     */
    @POST("messages/read")
    Call<SimpleResponse> markMessageAsRead(@Body Map<String, Integer> requestBody);
    
    /**
     * 撤回私信
     * POST /messages/delete
     * 
     * @param requestBody 包含 message_id
     *                    {"message_id": 消息ID}
     * @return SimpleResponse
     */
    @POST("messages/delete")
    Call<SimpleResponse> deleteMessage(@Body Map<String, Integer> requestBody);
    
    /**
     * 获取聊天用户列表
     * GET /messages/chat-users
     * 
     * @return ChatUsersResponse，包含 chat_users 列表
     */
    @GET("messages/chat-users")
    Call<ChatUsersResponse> getChatUsers();
    
    /**
     * 获取聊天记录
     * GET /messages/history/{user_id}
     * 
     * @param user_id 对方用户ID
     * @param page 页码，默认1
     * @param page_size 每页数量，默认20
     * @return ChatHistoryResponse，包含消息列表
     */
    @GET("messages/history/{user_id}")
    Call<ChatHistoryResponse> getChatHistory(
            @Path("user_id") Integer user_id,
            @Query("page") Integer page,
            @Query("page_size") Integer page_size
    );
}

