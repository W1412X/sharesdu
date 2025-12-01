package com.sharesdu.android.core.network;

import android.content.Context;
import com.sharesdu.android.core.utils.TokenManager;
import okhttp3.Interceptor;
import okhttp3.Request;
import okhttp3.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * 错误处理拦截器
 * 处理 token 过期、自动刷新、自动登录等逻辑
 */
public class ErrorHandlerInterceptor implements Interceptor {
    private Context context;
    private static final Object lock = new Object();
    private static LoginCallback loginCallback;
    
    public ErrorHandlerInterceptor(Context context) {
        this.context = context.getApplicationContext();
    }
    
    /**
     * 设置登录回调接口
     * 应该在 Application 或 MainActivity 中调用
     */
    public static void setLoginCallback(LoginCallback callback) {
        loginCallback = callback;
    }
    
    @Override
    public Response intercept(Chain chain) throws IOException {
        Request request = chain.request();
        Response response = chain.proceed(request);
        
        // 如果请求成功，直接返回
        if (response.isSuccessful()) {
            return response;
        }
        
        // 处理 token 相关错误
        int statusCode = response.code();
        
        // 检查是否是 token 相关错误
        if (statusCode == 401 || statusCode == 403) {
            // 尝试刷新 token
            if (tryRefreshToken()) {
                // 刷新成功，重试原请求
                Request newRequest = request.newBuilder().build();
                response.close();
                return chain.proceed(newRequest);
            } else {
                // 刷新失败，尝试自动登录
                if (tryAutoLogin()) {
                    // 自动登录成功，重试原请求
                    Request newRequest = request.newBuilder().build();
                    response.close();
                    return chain.proceed(newRequest);
                } else {
                    // 自动登录失败，跳转到登录页面
                    response.close();
                    redirectToLogin();
                    return response;
                }
            }
        }
        
        return response;
    }
    
    /**
     * 尝试刷新 token
     */
    private boolean tryRefreshToken() {
        synchronized (lock) {
            TokenManager tokenManager = TokenManager.getInstance(context);
            String refreshToken = tokenManager.getRefreshToken();
            
            if (refreshToken == null || refreshToken.isEmpty()) {
                return false;
            }
            
            try {
                Retrofit retrofit = new Retrofit.Builder()
                        .baseUrl(ApiConfig.BASE_URL + "/")
                        .addConverterFactory(GsonConverterFactory.create())
                        .build();
                
                TokenService tokenService = retrofit.create(TokenService.class);
                Map<String, String> requestBody = new HashMap<>();
                requestBody.put("refresh", refreshToken);
                
                retrofit2.Response<com.sharesdu.android.core.network.response.RefreshTokenResponse> response = 
                        tokenService.refreshToken(requestBody).execute();
                
                if (response.isSuccessful() && response.body() != null) {
                    com.sharesdu.android.core.network.response.RefreshTokenResponse refreshResponse = response.body();
                    if (refreshResponse.getStatus() == ApiConfig.TOKEN_REFRESH_SUCCESS) {
                        String newAccessToken = refreshResponse.getAccess();
                        if (newAccessToken != null && !newAccessToken.isEmpty()) {
                            tokenManager.saveAccessToken(newAccessToken);
                            return true;
                        }
                    }
                }
            } catch (Exception e) {
                // 刷新失败
                return false;
            }
            
            return false;
        }
    }
    
    /**
     * 尝试自动登录
     */
    private boolean tryAutoLogin() {
        synchronized (lock) {
            TokenManager tokenManager = TokenManager.getInstance(context);
            String savedUserName = tokenManager.getSavedUserName();
            String savedPassword = tokenManager.getSavedPassword();
            
            if (savedUserName == null || savedPassword == null || 
                savedUserName.isEmpty() || savedPassword.isEmpty()) {
                return false;
            }
            
            try {
                Retrofit retrofit = new Retrofit.Builder()
                        .baseUrl(ApiConfig.BASE_URL + "/")
                        .addConverterFactory(GsonConverterFactory.create())
                        .build();
                
                AccountService accountService = retrofit.create(AccountService.class);
                Map<String, String> requestBody = new HashMap<>();
                requestBody.put("user_name", savedUserName);
                requestBody.put("pass_word", savedPassword);
                
                retrofit2.Response<com.sharesdu.android.core.network.response.LoginResponse> loginResponse = 
                        accountService.loginWithPassword(requestBody).execute();
                
                if (loginResponse.isSuccessful() && loginResponse.body() != null) {
                    com.sharesdu.android.core.network.response.LoginResponse loginApiResponse = loginResponse.body();
                    if (loginApiResponse.getStatus() == 200) {
                        // 保存 refresh token
                        String refreshToken = loginApiResponse.getRefresh();
                        tokenManager.saveRefreshToken(refreshToken);
                        
                        // 保存用户信息
                        Integer userId = loginApiResponse.getUser_id();
                        String avatarUrl = ApiConfig.BASE_URL + "/image/user?user_id=" + userId;
                        tokenManager.saveUserInfo(
                                userId != null ? String.valueOf(userId) : null,
                                loginApiResponse.getUser_name(),
                                loginApiResponse.getEmail(),
                                loginApiResponse.getIs_master(),
                                loginApiResponse.getIs_super_master(),
                                avatarUrl
                        );
                        
                        // 使用 refresh token 获取 access token
                        TokenService tokenService = retrofit.create(TokenService.class);
                        Map<String, String> refreshRequestBody = new HashMap<>();
                        refreshRequestBody.put("refresh", refreshToken);
                        
                        retrofit2.Response<com.sharesdu.android.core.network.response.RefreshTokenResponse> refreshResponse = 
                                tokenService.refreshToken(refreshRequestBody).execute();
                        
                        if (refreshResponse.isSuccessful() && refreshResponse.body() != null) {
                            com.sharesdu.android.core.network.response.RefreshTokenResponse refreshApiResponse = refreshResponse.body();
                            if (refreshApiResponse.getStatus() == ApiConfig.TOKEN_REFRESH_SUCCESS) {
                                tokenManager.saveAccessToken(refreshApiResponse.getAccess());
                                return true;
                            }
                        }
                    }
                }
            } catch (Exception e) {
                // 自动登录失败
                return false;
            }
            
            return false;
        }
    }
    
    /**
     * 跳转到登录页面
     */
    private void redirectToLogin() {
        if (loginCallback != null) {
            loginCallback.navigateToLogin(context);
        }
    }
}

