package com.sharesdu.android.core.network;

import com.sharesdu.android.core.network.response.RefreshTokenResponse;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.POST;
import java.util.Map;

/**
 * Token 相关 API 接口
 */
public interface TokenService {
    /**
     * 刷新 Access Token
     * POST /token/refresh
     * 
     * @param requestBody 请求体，包含 refresh token
     *                    {"refresh": "refresh_token_string"}
     * @return RefreshTokenResponse，成功时 status=999，access 字段包含新的 access token
     */
    @POST("token/refresh")
    Call<RefreshTokenResponse> refreshToken(@Body Map<String, String> requestBody);
}

