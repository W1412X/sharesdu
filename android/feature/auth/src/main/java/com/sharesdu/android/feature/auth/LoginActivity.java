package com.sharesdu.android.feature.auth;

import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.checkbox.MaterialCheckBox;
import com.google.android.material.tabs.TabLayout;
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;
import com.sharesdu.android.feature.auth.R;
import com.sharesdu.android.core.network.AccountService;
import com.sharesdu.android.core.network.ApiClient;
import com.sharesdu.android.core.network.ApiConfig;
import com.sharesdu.android.core.network.response.LoginResponse;
import com.sharesdu.android.core.network.response.RefreshTokenResponse;
import com.sharesdu.android.core.network.response.SimpleResponse;
import com.sharesdu.android.core.utils.ErrorHandler;
import com.sharesdu.android.core.utils.TokenManager;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

public class LoginActivity extends AppCompatActivity {
    // UI 组件
    private TabLayout tabLayout;
    private View loginUsernameForm;
    private View loginEmailForm;
    private TextInputEditText etUsername;
    private TextInputEditText etPassword;
    private TextInputEditText etEmail;
    private TextInputEditText etEmailCode;
    private MaterialCheckBox cbSavePassword;
    private MaterialButton btnLoginUsername;
    private MaterialButton btnLoginEmail;
    private MaterialButton btnGetEmailCode;
    private View progressBar;
    
    // 验证规则
    private static final Pattern USERNAME_PATTERN = Pattern.compile("^[A-Za-z0-9@.+-_一-龥]{1,20}$");
    private static final Pattern PASSWORD_PATTERN = Pattern.compile("^(?=.*[A-Za-z])(?=.*\\d)(?=.*[*/@#/$/./!])[A-Za-z0-9*/@#/$/./!]{8,16}$");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9._%+-]+@mail\\.sdu\\.edu\\.cn$");
    
    // 当前登录方式
    private int currentTab = 0; // 0: 用户名登录, 1: 邮箱登录
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);
        
        // 初始化 ApiClient
        ApiClient.init(this);
        
        initViews();
        setupTabs();
        setupListeners();
        loadSavedCredentials();
    }
    
    private void initViews() {
        tabLayout = findViewById(R.id.tab_layout);
        loginUsernameForm = findViewById(R.id.login_username_form);
        loginEmailForm = findViewById(R.id.login_email_form);
        etUsername = findViewById(R.id.et_username);
        etPassword = findViewById(R.id.et_password);
        etEmail = findViewById(R.id.et_email);
        etEmailCode = findViewById(R.id.et_email_code);
        cbSavePassword = findViewById(R.id.cb_save_password);
        btnLoginUsername = findViewById(R.id.btn_login_username);
        btnLoginEmail = findViewById(R.id.btn_login_email);
        btnGetEmailCode = findViewById(R.id.btn_get_email_code);
        progressBar = findViewById(R.id.progress_bar);
        
        // 设置 Tab
        tabLayout.addTab(tabLayout.newTab().setText("用户名登录"));
        tabLayout.addTab(tabLayout.newTab().setText("邮箱登录"));
    }
    
    private void setupTabs() {
        tabLayout.addOnTabSelectedListener(new TabLayout.OnTabSelectedListener() {
            @Override
            public void onTabSelected(TabLayout.Tab tab) {
                currentTab = tab.getPosition();
                if (currentTab == 0) {
                    loginUsernameForm.setVisibility(View.VISIBLE);
                    loginEmailForm.setVisibility(View.GONE);
                } else {
                    loginUsernameForm.setVisibility(View.GONE);
                    loginEmailForm.setVisibility(View.VISIBLE);
                }
            }
            
            @Override
            public void onTabUnselected(TabLayout.Tab tab) {
                // 不需要实现
            }
            
            @Override
            public void onTabReselected(TabLayout.Tab tab) {
                // 不需要实现
            }
        });
    }
    
    private void setupListeners() {
        // 用户名登录按钮
        btnLoginUsername.setOnClickListener(v -> {
            String username = etUsername.getText().toString().trim();
            String password = etPassword.getText().toString();
            
            if (!validateUsername(username)) {
                showError("用户名应在1到20之间，并且仅包含数字、字母、@.+-_以及汉字");
                return;
            }
            
            if (!validatePassword(password)) {
                showError("密码必须同时包含字母、数字和符号（*/@/#/$/./!），且长度在8到16之间");
                return;
            }
            
            loginWithUsername(username, password);
        });
        
        // 邮箱登录按钮
        btnLoginEmail.setOnClickListener(v -> {
            String email = etEmail.getText().toString().trim();
            String emailCode = etEmailCode.getText().toString().trim();
            
            if (!validateEmail(email)) {
                showError("请输入山东大学邮箱");
                return;
            }
            
            if (emailCode.isEmpty()) {
                showError("请输入验证码");
                return;
            }
            
            loginWithEmail(email, emailCode);
        });
        
        // 获取验证码按钮
        btnGetEmailCode.setOnClickListener(v -> {
            String email = etEmail.getText().toString().trim();
            if (!validateEmail(email)) {
                showError("请输入山东大学邮箱");
                return;
            }
            getEmailCode(email);
        });
        
        // 实时验证输入
        etUsername.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            
            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {}
            
            @Override
            public void afterTextChanged(Editable s) {
                String username = s.toString().trim();
                btnLoginUsername.setEnabled(validateUsername(username) && 
                                           validatePassword(etPassword.getText().toString()));
            }
        });
        
        etPassword.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            
            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {}
            
            @Override
            public void afterTextChanged(Editable s) {
                String password = s.toString();
                btnLoginUsername.setEnabled(validateUsername(etUsername.getText().toString().trim()) && 
                                           validatePassword(password));
            }
        });
        
        etEmail.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            
            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {}
            
            @Override
            public void afterTextChanged(Editable s) {
                String email = s.toString().trim();
                btnLoginEmail.setEnabled(validateEmail(email) && 
                                        !etEmailCode.getText().toString().trim().isEmpty());
                btnGetEmailCode.setEnabled(validateEmail(email));
            }
        });
        
        etEmailCode.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            
            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {}
            
            @Override
            public void afterTextChanged(Editable s) {
                String emailCode = s.toString().trim();
                btnLoginEmail.setEnabled(validateEmail(etEmail.getText().toString().trim()) && 
                                        !emailCode.isEmpty());
            }
        });
    }
    
    private void loadSavedCredentials() {
        TokenManager tokenManager = TokenManager.getInstance(this);
        String savedUsername = tokenManager.getSavedUserName();
        if (savedUsername != null && !savedUsername.isEmpty()) {
            etUsername.setText(savedUsername);
            cbSavePassword.setChecked(true);
        }
    }
    
    /**
     * 用户名密码登录
     */
    private void loginWithUsername(String username, String password) {
        setLoading(true);
        
        AccountService accountService = ApiClient.getRetrofitNoAuth().create(AccountService.class);
        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("user_name", username);
        requestBody.put("pass_word", password);
        
        Call<LoginResponse> call = accountService.loginWithPassword(requestBody);
        call.enqueue(new Callback<LoginResponse>() {
            @Override
            public void onResponse(Call<LoginResponse> call, Response<LoginResponse> response) {
                setLoading(false);
                
                if (response.isSuccessful() && response.body() != null) {
                    LoginResponse loginResponse = response.body();
                    
                    if (loginResponse.isSuccess()) {
                        // 登录成功
                        handleLoginSuccess(loginResponse, username, password);
                    } else {
                        // 显示后端返回的错误信息
                        String errorMessage = loginResponse.getMessage();
                        if (errorMessage == null || errorMessage.isEmpty()) {
                            errorMessage = "登录失败";
                        }
                        showError(errorMessage);
                    }
                } else {
                    // 尝试从响应体中解析错误信息
                    String errorMessage = ErrorHandler.getErrorMessage(response);
                    showError(errorMessage);
                }
            }
            
            @Override
            public void onFailure(Call<LoginResponse> call, Throwable t) {
                setLoading(false);
                String errorMessage = ErrorHandler.getErrorMessage(t);
                showError(errorMessage);
            }
        });
    }
    
    /**
     * 邮箱验证码登录
     */
    private void loginWithEmail(String email, String emailCode) {
        setLoading(true);
        
        AccountService accountService = ApiClient.getRetrofitNoAuth().create(AccountService.class);
        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("email", email);
        requestBody.put("email_code", emailCode);
        
        Call<LoginResponse> call = accountService.loginWithEmail(requestBody);
        call.enqueue(new Callback<LoginResponse>() {
            @Override
            public void onResponse(Call<LoginResponse> call, Response<LoginResponse> response) {
                setLoading(false);
                
                if (response.isSuccessful() && response.body() != null) {
                    LoginResponse loginResponse = response.body();
                    
                    if (loginResponse.isSuccess()) {
                        // 登录成功
                        handleLoginSuccess(loginResponse, null, null);
                    } else {
                        // 显示后端返回的错误信息
                        String errorMessage = loginResponse.getMessage();
                        if (errorMessage == null || errorMessage.isEmpty()) {
                            errorMessage = "登录失败";
                        }
                        showError(errorMessage);
                    }
                } else {
                    // 尝试从响应体中解析错误信息
                    String errorMessage = ErrorHandler.getErrorMessage(response);
                    showError(errorMessage);
                }
            }
            
            @Override
            public void onFailure(Call<LoginResponse> call, Throwable t) {
                setLoading(false);
                String errorMessage = ErrorHandler.getErrorMessage(t);
                showError(errorMessage);
            }
        });
    }
    
    /**
     * 获取邮箱验证码
     */
    private void getEmailCode(String email) {
        setLoading(true);
        
        AccountService accountService = ApiClient.getRetrofitNoAuth().create(AccountService.class);
        Call<SimpleResponse> call = accountService.getLoginEmailCode(1, email);
        call.enqueue(new Callback<SimpleResponse>() {
            @Override
            public void onResponse(Call<SimpleResponse> call, Response<SimpleResponse> response) {
                setLoading(false);
                
                if (response.isSuccessful() && response.body() != null) {
                    SimpleResponse simpleResponse = response.body();
                    if (simpleResponse.isSuccess()) {
                        showSuccess("验证码已发送到您的邮箱");
                    } else {
                        // 显示后端返回的错误信息
                        String errorMessage = simpleResponse.getMessage();
                        if (errorMessage == null || errorMessage.isEmpty()) {
                            errorMessage = "获取验证码失败";
                        }
                        showError(errorMessage);
                    }
                } else {
                    // 尝试从响应体中解析错误信息
                    String errorMessage = ErrorHandler.getErrorMessage(response);
                    showError(errorMessage);
                }
            }
            
            @Override
            public void onFailure(Call<SimpleResponse> call, Throwable t) {
                setLoading(false);
                String errorMessage = ErrorHandler.getErrorMessage(t);
                showError(errorMessage);
            }
        });
    }
    
    /**
     * 处理登录成功
     */
    private void handleLoginSuccess(LoginResponse loginResponse, String username, String password) {
        TokenManager tokenManager = TokenManager.getInstance(this);
        String refreshToken = loginResponse.getRefresh();
        
        // 保存 refresh token
        tokenManager.saveRefreshToken(refreshToken);
        
        // 构建头像 URL
        Integer userId = loginResponse.getUser_id();
        String avatarUrl = ApiConfig.BASE_URL + "/image/user?user_id=" + userId;
        
        // 保存用户信息
        tokenManager.saveUserInfo(
                userId != null ? String.valueOf(userId) : null,
                loginResponse.getUser_name(),
                loginResponse.getEmail(),
                loginResponse.getIs_master(),
                loginResponse.getIs_super_master(),
                avatarUrl
        );
        
        // 如果勾选了记住密码，保存账号密码
        if (cbSavePassword.isChecked() && username != null && password != null) {
            tokenManager.saveCredentials(username, password);
        } else {
            tokenManager.clearSavedCredentials();
        }
        
        // 使用 refresh token 获取 access token
        getAccessTokenFromRefresh(refreshToken, username, password);
    }
    
    /**
     * 使用 refresh token 获取 access token
     */
    private void getAccessTokenFromRefresh(String refreshToken, String username, String password) {
        AccountService accountService = ApiClient.getRetrofitNoAuth().create(AccountService.class);
        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("refresh", refreshToken);
        
        // 使用 TokenService 获取 access token
        com.sharesdu.android.core.network.TokenService tokenService = 
                ApiClient.getRetrofitNoAuth().create(com.sharesdu.android.core.network.TokenService.class);
        Call<RefreshTokenResponse> call = tokenService.refreshToken(requestBody);
        call.enqueue(new Callback<RefreshTokenResponse>() {
            @Override
            public void onResponse(Call<RefreshTokenResponse> call, Response<RefreshTokenResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    RefreshTokenResponse refreshResponse = response.body();
                    if (refreshResponse.getStatus() == ApiConfig.TOKEN_REFRESH_SUCCESS) {
                        // 保存 access token
                        TokenManager tokenManager = TokenManager.getInstance(LoginActivity.this);
                        tokenManager.saveAccessToken(refreshResponse.getAccess());
                        
                        showSuccess("登录成功");
                        
                        // 跳转到 MainActivity（使用字符串形式避免循环依赖）
                        Intent intent = new Intent();
                        intent.setClassName(LoginActivity.this, "com.sharesdu.android.MainActivity");
                        startActivity(intent);
                        finish();
                    } else {
                        // 显示后端返回的错误信息
                        String errorMessage = refreshResponse.getMessage();
                        if (errorMessage == null || errorMessage.isEmpty()) {
                            errorMessage = "获取访问令牌失败";
                        } else {
                            errorMessage = "获取访问令牌失败：" + errorMessage;
                        }
                        showError(errorMessage);
                    }
                } else {
                    // 尝试从响应体中解析错误信息
                    String errorMessage = ErrorHandler.getErrorMessage(response);
                    if (!errorMessage.contains("获取访问令牌")) {
                        errorMessage = "获取访问令牌失败：" + errorMessage;
                    }
                    showError(errorMessage);
                }
            }
            
            @Override
            public void onFailure(Call<RefreshTokenResponse> call, Throwable t) {
                String errorMessage = ErrorHandler.getErrorMessage(t);
                if (!errorMessage.contains("获取访问令牌")) {
                    errorMessage = "获取访问令牌失败：" + errorMessage;
                }
                showError(errorMessage);
            }
        });
    }
    
    /**
     * 验证用户名
     */
    private boolean validateUsername(String username) {
        if (username == null || username.isEmpty()) {
            return false;
        }
        // 检查是否包含不允许的字符
        if (username.contains(";") || username.contains(" ") || username.contains(",")) {
            return false;
        }
        return USERNAME_PATTERN.matcher(username).matches();
    }
    
    /**
     * 验证密码
     */
    private boolean validatePassword(String password) {
        if (password == null || password.isEmpty()) {
            return false;
        }
        return PASSWORD_PATTERN.matcher(password).matches();
    }
    
    /**
     * 验证邮箱
     */
    private boolean validateEmail(String email) {
        if (email == null || email.isEmpty()) {
            return false;
        }
        return EMAIL_PATTERN.matcher(email).matches();
    }
    
    /**
     * 设置加载状态
     */
    private void setLoading(boolean loading) {
        progressBar.setVisibility(loading ? View.VISIBLE : View.GONE);
        btnLoginUsername.setEnabled(!loading);
        btnLoginEmail.setEnabled(!loading);
        btnGetEmailCode.setEnabled(!loading);
    }
    
    /**
     * 显示错误信息
     */
    private void showError(String message) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show();
    }
    
    /**
     * 显示成功信息
     */
    private void showSuccess(String message) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
    }
}

