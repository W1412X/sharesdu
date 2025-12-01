package com.sharesdu.android.core.network;

import android.content.Context;
import okhttp3.OkHttpClient;
import okhttp3.logging.HttpLoggingInterceptor;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import java.util.concurrent.TimeUnit;

/**
 * Retrofit API 客户端
 * 提供统一的网络请求客户端配置
 */
public class ApiClient {
    private static Retrofit retrofit;
    private static Retrofit retrofitNoAuth;
    private static Context appContext;
    
    /**
     * 初始化 ApiClient（需要在 Application 中调用）
     */
    public static void init(Context context) {
        appContext = context.getApplicationContext();
    }
    
    /**
     * 获取带认证的 Retrofit 实例（自动添加 token 和错误处理）
     */
    public static Retrofit getRetrofit() {
        if (retrofit == null) {
            if (appContext == null) {
                throw new IllegalStateException("ApiClient not initialized. Call ApiClient.init(context) first.");
            }
            
            OkHttpClient client = new OkHttpClient.Builder()
                    .addInterceptor(new AuthInterceptor(appContext))
                    .addInterceptor(new ErrorHandlerInterceptor(appContext))
                    .addInterceptor(createLoggingInterceptor())
                    .connectTimeout(ApiConfig.CONNECT_TIMEOUT, TimeUnit.SECONDS)
                    .readTimeout(ApiConfig.READ_TIMEOUT, TimeUnit.SECONDS)
                    .writeTimeout(ApiConfig.WRITE_TIMEOUT, TimeUnit.SECONDS)
                    .build();
            
            retrofit = new Retrofit.Builder()
                    .baseUrl(ApiConfig.BASE_URL + "/")
                    .client(client)
                    .addConverterFactory(GsonConverterFactory.create())
                    .build();
        }
        return retrofit;
    }
    
    /**
     * 获取不带认证的 Retrofit 实例（用于登录、注册等接口）
     */
    public static Retrofit getRetrofitNoAuth() {
        if (retrofitNoAuth == null) {
            OkHttpClient client = new OkHttpClient.Builder()
                    .addInterceptor(createLoggingInterceptor())
                    .connectTimeout(ApiConfig.CONNECT_TIMEOUT, TimeUnit.SECONDS)
                    .readTimeout(ApiConfig.READ_TIMEOUT, TimeUnit.SECONDS)
                    .writeTimeout(ApiConfig.WRITE_TIMEOUT, TimeUnit.SECONDS)
                    .build();
            
            retrofitNoAuth = new Retrofit.Builder()
                    .baseUrl(ApiConfig.BASE_URL + "/")
                    .client(client)
                    .addConverterFactory(GsonConverterFactory.create())
                    .build();
        }
        return retrofitNoAuth;
    }
    
    /**
     * 重置 Retrofit 实例（用于 token 更新后）
     */
    public static void reset() {
        retrofit = null;
    }
    
    /**
     * 创建日志拦截器
     */
    private static HttpLoggingInterceptor createLoggingInterceptor() {
        HttpLoggingInterceptor interceptor = new HttpLoggingInterceptor();
        interceptor.setLevel(HttpLoggingInterceptor.Level.BODY);
        return interceptor;
    }
}

