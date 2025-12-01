package com.sharesdu.android.core.network;

import com.sharesdu.android.core.network.response.GetProfileTimeResponse;
import com.sharesdu.android.core.network.response.UploadArticleImageResponse;
import com.sharesdu.android.core.network.response.UploadProfileResponse;
import okhttp3.MultipartBody;
import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Multipart;
import retrofit2.http.POST;
import retrofit2.http.Part;
import retrofit2.http.Path;
import retrofit2.http.Query;

/**
 * 图片 API 接口
 */
public interface ImageService {
    /**
     * 上传头像
     * POST /image/profile
     * 
     * @param image 图片文件
     * @return UploadProfileResponse，成功时包含 profile_url
     */
    @Multipart
    @POST("image/profile")
    Call<UploadProfileResponse> uploadProfile(@Part MultipartBody.Part image);
    
    /**
     * 获取用户头像
     * GET /image/user?user_id=user_id
     * 
     * @param user_id 用户ID
     * @return 返回图片文件（ResponseBody）
     */
    @GET("image/user")
    Call<okhttp3.ResponseBody> getUserImage(@Query("user_id") Integer user_id);
    
    /**
     * 在文章中上传图片
     * POST /image/article
     * 
     * @param image 图片文件
     * @return UploadArticleImageResponse，成功时包含 image_url
     */
    @Multipart
    @POST("image/article")
    Call<UploadArticleImageResponse> uploadArticleImage(@Part MultipartBody.Part image);
    
    /**
     * 根据 URL 获取图片
     * GET /image/get/<image_name>
     * 
     * @param image_name 图片名称
     * @return 返回图片文件（ResponseBody）
     */
    @GET("image/get/{image_name}")
    Call<okhttp3.ResponseBody> getImage(@Path("image_name") String image_name);
    
    /**
     * 获取用户头像更新信息
     * GET /image/profile/time?user_ids=user_id_1,user_id_2,...
     * 
     * @param user_ids 用户ID列表，逗号分隔，最多100个
     * @return GetProfileTimeResponse，包含 time_list
     */
    @GET("image/profile/time")
    Call<GetProfileTimeResponse> getProfileTime(@Query("user_ids") String user_ids);
}

