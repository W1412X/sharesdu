package com.sharesdu.android.feature.auth;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import androidx.appcompat.app.AppCompatActivity;
import com.sharesdu.android.feature.auth.R;
import com.sharesdu.android.core.network.AccountService;
import com.sharesdu.android.core.network.ApiClient;
import com.sharesdu.android.core.network.ApiConfig;
import com.sharesdu.android.core.network.TokenService;
import com.sharesdu.android.core.network.UserService;
import com.sharesdu.android.core.network.response.GetAuthorInfoResponse;
import com.sharesdu.android.core.network.response.LoginResponse;
import com.sharesdu.android.core.network.response.RefreshTokenResponse;
import com.sharesdu.android.core.utils.TokenManager;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import java.util.HashMap;
import java.util.Map;

/**
 * 启动 Activity
 * 负责检查登录状态并决定跳转到登录页面还是主页面
 */
public class LaunchActivity extends AppCompatActivity {
    private static final int DELAY_MS = 500; // 最小显示时间（毫秒）
    private long startTime;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_launch);
        startTime = System.currentTimeMillis();
        
        // 初始化 ApiClient
        ApiClient.init(this);
        
        // 检查登录状态
        checkLoginStatus();
    }
    
    /**
     * 检查登录状态
     * 按照以下顺序尝试：
     * 1. 验证 access token
     * 2. 使用 refresh token 刷新 access token
     * 3. 使用保存的用户名密码自动登录
     */
    private void checkLoginStatus() {
        TokenManager tokenManager = TokenManager.getInstance(this);
        String accessToken = tokenManager.getAccessToken();
        
        if (accessToken != null && !accessToken.isEmpty()) {
            // 尝试验证 access token
            verifyAccessToken(accessToken);
        } else {
            // 没有 access token，尝试使用 refresh token
            tryRefreshToken();
        }
    }
    
    /**
     * 验证 access token
     */
    private void verifyAccessToken(String accessToken) {
        // 使用一个需要认证的 API 来验证 token
        // 这里使用获取用户主页信息来验证
        UserService userService = ApiClient.getRetrofit().create(UserService.class);
        TokenManager tokenManager = TokenManager.getInstance(this);
        String userId = tokenManager.getUserId();
        
        if (userId == null || userId.isEmpty()) {
            // 没有用户 ID，尝试刷新 token
            tryRefreshToken();
            return;
        }
        
        try {
            int userIdInt = Integer.parseInt(userId);
            Call<GetAuthorInfoResponse> call = userService.getAuthorInfo(userIdInt);
            call.enqueue(new Callback<GetAuthorInfoResponse>() {
                @Override
                public void onResponse(Call<GetAuthorInfoResponse> call, Response<GetAuthorInfoResponse> response) {
                    if (response.isSuccessful() && response.body() != null) {
                        GetAuthorInfoResponse authorResponse = response.body();
                        if (authorResponse.isSuccess()) {
                            // Token 有效，跳转到主页面
                            navigateToMain();
                            return;
                        }
                    }
                    // Token 无效，尝试刷新
                    tryRefreshToken();
                }
                
                @Override
                public void onFailure(Call<GetAuthorInfoResponse> call, Throwable t) {
                    // 请求失败，尝试刷新 token
                    tryRefreshToken();
                }
            });
        } catch (NumberFormatException e) {
            // 用户 ID 格式错误，尝试刷新 token
            tryRefreshToken();
        }
    }
    
    /**
     * 尝试使用 refresh token 刷新 access token
     */
    private void tryRefreshToken() {
        TokenManager tokenManager = TokenManager.getInstance(this);
        String refreshToken = tokenManager.getRefreshToken();
        
        if (refreshToken == null || refreshToken.isEmpty()) {
            // 没有 refresh token，尝试自动登录
            tryAutoLogin();
            return;
        }
        
        TokenService tokenService = ApiClient.getRetrofitNoAuth().create(TokenService.class);
        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("refresh", refreshToken);
        
        Call<RefreshTokenResponse> call = tokenService.refreshToken(requestBody);
        call.enqueue(new Callback<RefreshTokenResponse>() {
            @Override
            public void onResponse(Call<RefreshTokenResponse> call, Response<RefreshTokenResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    RefreshTokenResponse refreshResponse = response.body();
                    if (refreshResponse.getStatus() == ApiConfig.TOKEN_REFRESH_SUCCESS) {
                        // 刷新成功，保存新的 access token
                        String newAccessToken = refreshResponse.getAccess();
                        if (newAccessToken != null && !newAccessToken.isEmpty()) {
                            tokenManager.saveAccessToken(newAccessToken);
                            // 跳转到主页面
                            navigateToMain();
                            return;
                        }
                    }
                }
                // 刷新失败，尝试自动登录
                tryAutoLogin();
            }
            
            @Override
            public void onFailure(Call<RefreshTokenResponse> call, Throwable t) {
                // 刷新失败，尝试自动登录
                tryAutoLogin();
            }
        });
    }
    
    /**
     * 尝试使用保存的用户名密码自动登录
     */
    private void tryAutoLogin() {
        TokenManager tokenManager = TokenManager.getInstance(this);
        String savedUserName = tokenManager.getSavedUserName();
        String savedPassword = tokenManager.getSavedPassword();
        
        if (savedUserName == null || savedPassword == null || 
            savedUserName.isEmpty() || savedPassword.isEmpty()) {
            // 没有保存的账号密码，跳转到登录页面
            navigateToLogin();
            return;
        }
        
        AccountService accountService = ApiClient.getRetrofitNoAuth().create(AccountService.class);
        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("user_name", savedUserName);
        requestBody.put("pass_word", savedPassword);
        
        Call<LoginResponse> call = accountService.loginWithPassword(requestBody);
        call.enqueue(new Callback<LoginResponse>() {
            @Override
            public void onResponse(Call<LoginResponse> call, Response<LoginResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    LoginResponse loginResponse = response.body();
                    if (loginResponse.isSuccess()) {
                        // 自动登录成功
                        handleAutoLoginSuccess(loginResponse);
                        return;
                    }
                }
                // 自动登录失败，跳转到登录页面
                navigateToLogin();
            }
            
            @Override
            public void onFailure(Call<LoginResponse> call, Throwable t) {
                // 自动登录失败，跳转到登录页面
                navigateToLogin();
            }
        });
    }
    
    /**
     * 处理自动登录成功
     */
    private void handleAutoLoginSuccess(LoginResponse loginResponse) {
        TokenManager tokenManager = TokenManager.getInstance(this);
        
        // 保存 refresh token
        String refreshToken = loginResponse.getRefresh();
        tokenManager.saveRefreshToken(refreshToken);
        
        // 保存用户信息
        Integer userId = loginResponse.getUser_id();
        String avatarUrl = ApiConfig.BASE_URL + "/image/user?user_id=" + userId;
        tokenManager.saveUserInfo(
                userId != null ? String.valueOf(userId) : null,
                loginResponse.getUser_name(),
                loginResponse.getEmail(),
                loginResponse.getIs_master(),
                loginResponse.getIs_super_master(),
                avatarUrl
        );
        
        // 使用 refresh token 获取 access token
        TokenService tokenService = ApiClient.getRetrofitNoAuth().create(TokenService.class);
        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("refresh", refreshToken);
        
        Call<RefreshTokenResponse> refreshCall = tokenService.refreshToken(requestBody);
        refreshCall.enqueue(new Callback<RefreshTokenResponse>() {
            @Override
            public void onResponse(Call<RefreshTokenResponse> call, Response<RefreshTokenResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    RefreshTokenResponse refreshResponse = response.body();
                    if (refreshResponse.getStatus() == ApiConfig.TOKEN_REFRESH_SUCCESS) {
                        // 保存 access token
                        String accessToken = refreshResponse.getAccess();
                        if (accessToken != null && !accessToken.isEmpty()) {
                            tokenManager.saveAccessToken(accessToken);
                            // 跳转到主页面
                            navigateToMain();
                            return;
                        }
                    }
                }
                // 获取 access token 失败，跳转到登录页面
                navigateToLogin();
            }
            
            @Override
            public void onFailure(Call<RefreshTokenResponse> call, Throwable t) {
                // 获取 access token 失败，跳转到登录页面
                navigateToLogin();
            }
        });
    }
    
    /**
     * 跳转到主页面
     */
    private void navigateToMain() {
        ensureDelay(() -> {
            // 使用字符串形式避免循环依赖
            Intent intent = new Intent();
            intent.setClassName(LaunchActivity.this, "com.sharesdu.android.MainActivity");
            startActivity(intent);
            finish();
        });
    }
    
    /**
     * 跳转到登录页面
     */
    private void navigateToLogin() {
        ensureDelay(() -> {
            Intent intent = new Intent(LaunchActivity.this, LoginActivity.class);
            startActivity(intent);
            finish();
        });
    }
    
    /**
     * 确保最小显示时间
     */
    private void ensureDelay(Runnable action) {
        long elapsed = System.currentTimeMillis() - startTime;
        long remaining = Math.max(0, DELAY_MS - elapsed);
        
        new Handler(Looper.getMainLooper()).postDelayed(action, remaining);
    }
}

