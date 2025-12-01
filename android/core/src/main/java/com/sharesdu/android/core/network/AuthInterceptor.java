package com.sharesdu.android.core.network;

import android.content.Context;
import com.sharesdu.android.core.utils.TokenManager;
import okhttp3.Interceptor;
import okhttp3.Request;
import okhttp3.Response;
import java.io.IOException;

/**
 * 认证拦截器
 * 自动在请求头中添加 Authorization token
 */
public class AuthInterceptor implements Interceptor {
    private Context context;
    
    public AuthInterceptor(Context context) {
        this.context = context.getApplicationContext();
    }
    
    @Override
    public Response intercept(Chain chain) throws IOException {
        Request original = chain.request();
        
        // 如果已有 Authorization 头，则不添加
        if (original.header(ApiConfig.HEADER_AUTHORIZATION) == null) {
            String accessToken = TokenManager.getInstance(context).getAccessToken();
            if (accessToken != null && !accessToken.isEmpty()) {
                Request.Builder requestBuilder = original.newBuilder()
                        .header(ApiConfig.HEADER_AUTHORIZATION, 
                                ApiConfig.TOKEN_PREFIX + accessToken);
                
                Request request = requestBuilder.build();
                return chain.proceed(request);
            }
        }
        
        return chain.proceed(original);
    }
}

