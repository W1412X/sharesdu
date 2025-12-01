package com.sharesdu.android.core.network;

import com.sharesdu.android.core.network.response.GetUserHomepageResponse;
import com.sharesdu.android.core.network.response.LoginResponse;
import com.sharesdu.android.core.network.response.SimpleResponse;
import com.sharesdu.android.core.network.response.UserContentResponse;
import com.sharesdu.android.core.network.response.UserPreviewResponse;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Query;
import java.util.Map;

/**
 * 账户板块 API 接口
 * 包括：注册、登录、登出、注销、重置密码
 */
public interface AccountService {
    /**
     * 注册
     * POST /register
     * 
     * @param requestBody 注册信息
     *                    {
     *                      "user_name": "用户名",
     *                      "pass_word": "密码",
     *                      "email": "邮箱",
     *                      "email_code": "验证码",
     *                      "invitation_code": "邀请码（非山大邮箱必填）",
     *                      "campus": "校区（选填）",
     *                      "college": "学院（选填）",
     *                      "major": "专业（选填）"
     *                    }
     * @return SimpleResponse
     */
    @POST("register")
    Call<SimpleResponse> register(@Body Map<String, String> requestBody);
    
    /**
     * 获取注册邮箱验证码
     * GET /register?send_code=1&email=email&invitation_code=code
     * 
     * @param email 邮箱地址
     * @param invitation_code 邀请码（非山大邮箱必填）
     * @return SimpleResponse
     */
    @GET("register")
    Call<SimpleResponse> getRegisterEmailCode(
            @Query("send_code") int send_code,
            @Query("email") String email,
            @Query("invitation_code") String invitation_code
    );
    
    /**
     * 用户名密码登录
     * POST /login_passwd
     * 
     * @param requestBody 登录信息
     *                    {
     *                      "user_name": "用户名",
     *                      "pass_word": "密码"
     *                    }
     * @return LoginResponse，包含 user_id, user_name, email, refresh, is_master, is_super_master
     */
    @POST("login_passwd")
    Call<LoginResponse> loginWithPassword(@Body Map<String, String> requestBody);
    
    /**
     * 邮箱验证码登录
     * POST /login_email
     * 
     * @param requestBody 登录信息
     *                    {
     *                      "email": "邮箱",
     *                      "email_code": "验证码"
     *                    }
     * @return LoginResponse，包含 user_id, user_name, email, refresh, is_master, is_super_master
     */
    @POST("login_email")
    Call<LoginResponse> loginWithEmail(@Body Map<String, String> requestBody);
    
    /**
     * 获取登录邮箱验证码
     * GET /login_email?send_code=1&email=email
     * 
     * @param send_code 固定为 1
     * @param email 邮箱地址
     * @return SimpleResponse
     */
    @GET("login_email")
    Call<SimpleResponse> getLoginEmailCode(
            @Query("send_code") int send_code,
            @Query("email") String email
    );
    
    /**
     * 登出
     * POST /logout
     * 
     * @return SimpleResponse
     */
    @POST("logout")
    Call<SimpleResponse> logout();
    
    /**
     * 注销账户
     * POST /delete_account
     * 
     * @param requestBody 注销信息
     *                    {
     *                      "user_name": "用户名",
     *                      "email": "邮箱",
     *                      "email_code": "验证码"
     *                    }
     * @return SimpleResponse
     */
    @POST("delete_account")
    Call<SimpleResponse> deleteAccount(@Body Map<String, String> requestBody);
    
    /**
     * 获取注销账户邮箱验证码
     * GET /delete_account?send_code=1&email=email
     * 
     * @param send_code 固定为 1
     * @param email 邮箱地址
     * @return SimpleResponse
     */
    @GET("delete_account")
    Call<SimpleResponse> getDeleteAccountEmailCode(
            @Query("send_code") int send_code,
            @Query("email") String email
    );
    
    /**
     * 重置密码
     * POST /reset_password
     * 
     * @param requestBody 重置密码信息
     *                    {
     *                      "email": "邮箱",
     *                      "new_pass_word": "新密码",
     *                      "email_code": "验证码"
     *                    }
     * @return SimpleResponse
     */
    @POST("reset_password")
    Call<SimpleResponse> resetPassword(@Body Map<String, String> requestBody);
    
    /**
     * 获取重置密码邮箱验证码
     * GET /reset_password?send_code=1&email=email
     * 
     * @param send_code 固定为 1
     * @param email 邮箱地址
     * @return SimpleResponse
     */
    @GET("reset_password")
    Call<SimpleResponse> getResetPasswordEmailCode(
            @Query("send_code") int send_code,
            @Query("email") String email
    );
    
    /**
     * 获取用户主页
     * GET /user/homepage?user_id=user_id
     * 完整路径：/index/api/user/homepage?user_id=user_id
     * 与web项目保持一致：web/src/api/modules/account.js 中的 getAuthorInfo
     * 
     * @param user_id 目标用户的user_id，若为空则默认返回当前登录用户的主页
     * @return GetUserHomepageResponse，包含用户信息（response.data 包含 user_id, user_name, email, reputation, reputation_level, master, superMaster, campus, college, major, all_articles, all_posts, all_replys, block_status, block_end_time, created_at, registration_year）
     */
    @GET("user/homepage")
    Call<GetUserHomepageResponse> getUserHomepage(@Query("user_id") Integer user_id);
    
    /**
     * 获取用户创作内容预览
     * GET /user/preview?user_id=user_id
     * 完整路径：/index/api/user/preview?user_id=user_id
     * 响应格式：status + message + articles/posts/replies在根级别（不在data中）
     * 
     * @param user_id 目标用户的user_id，若为空则默认返回当前登录用户的数据
     * @return UserPreviewResponse，包含 articles, posts, replies 预览列表（各最多5条）
     */
    @GET("user/preview")
    Call<UserPreviewResponse> getUserPreview(@Query("user_id") Integer user_id);
    
    /**
     * 获取用户创作详情（分页）
     * GET /user/content?type=content_type&user_id=user_id&page=page&page_size=page_size
     * 完整路径：/index/api/user/content?type=content_type&user_id=user_id&page=page&page_size=page_size
     * 响应格式：status + message + count/next/previous/results/timestamp（不在data中）
     * 
     * @param type 内容类型：article/post/reply
     * @param user_id 目标用户的user_id，若为空则默认返回当前登录用户的数据
     * @param page 页码，默认为1
     * @param page_size 每页数量，默认为10，最大100
     * @return UserContentResponse，包含 count, next, previous, results 数组
     */
    @GET("user/content")
    Call<UserContentResponse> getUserContent(
            @Query("type") String type,
            @Query("user_id") Integer user_id,
            @Query("page") Integer page,
            @Query("page_size") Integer page_size
    );
}

