package com.sharesdu.android.core.network;

import com.sharesdu.android.core.network.response.AdminInvitationCodeResponse;
import com.sharesdu.android.core.network.response.FreezeCourseResponse;
import com.sharesdu.android.core.network.response.GetAdminUserListResponse;
import com.sharesdu.android.core.network.response.GetBlockedUsersResponse;
import com.sharesdu.android.core.network.response.GetCourseHistoryResponse;
import com.sharesdu.android.core.network.response.RollbackCourseResponse;
import com.sharesdu.android.core.network.response.SimpleResponse;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.PATCH;
import retrofit2.http.POST;
import retrofit2.http.Path;
import retrofit2.http.Query;
import java.util.Map;

/**
 * 管理员板块 API 接口
 * 包括：邀请码管理、封禁与屏蔽管理、权限设置、课程管理
 */
public interface AdminService {
    // ========== 邀请码管理 ==========
    
    /**
     * 创建邀请码
     * POST /admin/invitation-codes
     * 
     * @param requestBody 邀请码信息
     *                    {
     *                      "capacity": 邀请码容量（可使用次数）,
     *                      "expires_days": 有效期天数（选填）
     *                    }
     * @return AdminInvitationCodeResponse，data 包含邀请码信息
     */
    @POST("admin/invitation-codes")
    Call<AdminInvitationCodeResponse> createInvitationCode(@Body Map<String, Object> requestBody);
    
    /**
     * 获取邀请码列表
     * GET /admin/invitation-codes
     * 
     * @return AdminInvitationCodeResponse，data 包含邀请码列表
     */
    @GET("admin/invitation-codes")
    Call<AdminInvitationCodeResponse> getInvitationCodeList();
    
    /**
     * 修改邀请码状态
     * PATCH /admin/invitation-codes
     * 
     * @param requestBody 包含 code 和 is_active
     *                    {
     *                      "code": "邀请码",
     *                      "is_active": true/false
     *                    }
     * @return AdminInvitationCodeResponse，data 包含邀请码信息
     */
    @PATCH("admin/invitation-codes")
    Call<AdminInvitationCodeResponse> updateInvitationCodeStatus(@Body Map<String, Object> requestBody);
    
    // ========== 封禁与屏蔽管理 ==========
    
    /**
     * 封禁用户
     * POST /admin/block/user
     * 
     * @param requestBody 包含 user_id 和 days
     *                    {
     *                      "user_id": 用户ID,
     *                      "days": 封禁天数（1-90，超过90视作永久封禁）
     *                    }
     * @return SimpleResponse
     */
    @POST("admin/block/user")
    Call<SimpleResponse> blockUser(@Body Map<String, Integer> requestBody);
    
    /**
     * 解禁用户
     * POST /admin/unblock/user
     * 
     * @param requestBody 包含 user_id
     *                    {"user_id": 用户ID}
     * @return SimpleResponse
     */
    @POST("admin/unblock/user")
    Call<SimpleResponse> unblockUser(@Body Map<String, Integer> requestBody);
    
    /**
     * 文章屏蔽管理
     * POST /admin/block/article
     * 
     * @param requestBody 包含 article_id 和 reason（选填）
     *                    {
     *                      "article_id": 文章ID,
     *                      "reason": "屏蔽原因（选填）"
     *                    }
     * @return SimpleResponse
     */
    @POST("admin/block/article")
    Call<SimpleResponse> blockArticle(@Body Map<String, Object> requestBody);
    
    /**
     * 文章解除屏蔽
     * POST /admin/unblock/article
     * 
     * @param requestBody 包含 article_id 和 reason（选填）
     *                    {
     *                      "article_id": 文章ID,
     *                      "reason": "解除屏蔽原因（选填）"
     *                    }
     * @return SimpleResponse
     */
    @POST("admin/unblock/article")
    Call<SimpleResponse> unblockArticle(@Body Map<String, Object> requestBody);
    
    /**
     * 获取封禁用户列表
     * GET /admin/blocked-users?page_index=page_index&page_size=page_size
     * 
     * @param page_index 页码，默认1
     * @param page_size 每页数量，默认20
     * @return GetBlockedUsersResponse，包含 user_list 和 user_num
     */
    @GET("admin/blocked-users")
    Call<GetBlockedUsersResponse> getBlockedUsers(
            @Query("page_index") Integer page_index,
            @Query("page_size") Integer page_size
    );
    
    // ========== 权限设置 ==========
    
    /**
     * 提升用户为管理员
     * POST /admin/promote
     * 
     * @param requestBody 包含 user_id
     *                    {"user_id": 用户ID}
     * @return SimpleResponse
     */
    @POST("admin/promote")
    Call<SimpleResponse> promoteUser(@Body Map<String, Integer> requestBody);
    
    /**
     * 撤销管理员权限
     * POST /admin/demote
     * 
     * @param requestBody 包含 user_id
     *                    {"user_id": 用户ID}
     * @return SimpleResponse
     */
    @POST("admin/demote")
    Call<SimpleResponse> demoteUser(@Body Map<String, Integer> requestBody);
    
    /**
     * 分页获取用户列表（管理员权限）
     * GET /admin/users?page_index=page_index&page_size=page_size
     * 
     * @param page_index 页码，默认1
     * @param page_size 每页数量，默认20
     * @return GetAdminUserListResponse，包含 user_list 和 user_num
     */
    @GET("admin/users")
    Call<GetAdminUserListResponse> getAdminUserList(
            @Query("page_index") Integer page_index,
            @Query("page_size") Integer page_size
    );
    
    // ========== 课程管理 ==========
    
    /**
     * 课程冻结/解冻管理接口
     * POST /admin/courses/freeze
     * 
     * @param requestBody 包含 course_id 和 action
     *                    {
     *                      "course_id": 课程ID,
     *                      "action": "freeze/unfreeze"
     *                    }
     * @return FreezeCourseResponse，包含 course_id, new_state, modified_at
     */
    @POST("admin/courses/freeze")
    Call<FreezeCourseResponse> freezeCourse(@Body Map<String, Object> requestBody);
    
    /**
     * 课程版本回滚接口
     * POST /admin/courses/rollback
     * 
     * @param requestBody 包含 course_id 和 target_version
     *                    {
     *                      "course_id": 课程ID,
     *                      "target_version": 目标回滚版本号
     *                    }
     * @return RollbackCourseResponse，包含 new_version, rollback_to
     */
    @POST("admin/courses/rollback")
    Call<RollbackCourseResponse> rollbackCourse(@Body Map<String, Integer> requestBody);
    
    /**
     * 课程历史版本查询接口
     * GET /admin/courses/{course_id}/history?page_index=page_index&page_size=page_size
     * 
     * @param course_id 课程ID（路径参数）
     * @param page_index 页码，默认1
     * @param page_size 每页数量，默认10
     * @return GetCourseHistoryResponse，包含 total_versions, count, histories
     */
    @GET("admin/courses/{course_id}/history")
    Call<GetCourseHistoryResponse> getCourseHistory(
            @Path("course_id") Integer course_id,
            @Query("page_index") Integer page_index,
            @Query("page_size") Integer page_size
    );
}

