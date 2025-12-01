package com.sharesdu.android.core.network;

import com.sharesdu.android.core.network.response.UploadResourceResponse;
import okhttp3.MultipartBody;
import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Multipart;
import retrofit2.http.POST;
import retrofit2.http.Part;
import retrofit2.http.Query;

/**
 * 资源 API 接口
 */
public interface ResourceService {
    /**
     * 上传资源
     * POST /resource/upload
     * 
     * @param file 资源文件
     * @param article_id 关联的文章ID
     * @return UploadResourceResponse
     */
    @Multipart
    @POST("resource/upload")
    Call<UploadResourceResponse> uploadResource(
            @Part MultipartBody.Part file,
            @Part("article_id") Integer article_id
    );
    
    /**
     * 资源下载
     * GET /resource/download?article_id=article_id
     * 
     * @param article_id 资源关联的文章ID
     * @return 返回资源文件（ResponseBody）
     */
    @GET("resource/download")
    Call<ResponseBody> downloadResource(@Query("article_id") Integer article_id);
}

