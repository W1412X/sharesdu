package com.sharesdu.android.core.network;

/**
 * API 配置类
 * 管理 API 基础 URL 和其他网络配置
 */
public class ApiConfig {
    // API 基础 URL
    public static final String BASE_URL = "https://api.sharesdu.com/index/api";
    
    // 请求超时时间（秒）
    public static final int CONNECT_TIMEOUT = 30;
    public static final int READ_TIMEOUT = 30;
    public static final int WRITE_TIMEOUT = 30;
    
    // Token 相关常量
    public static final String TOKEN_PREFIX = "Bearer ";
    public static final String HEADER_AUTHORIZATION = "Authorization";
    
    // Token 状态码
    public static final int TOKEN_REFRESH_SUCCESS = 999;
    public static final int TOKEN_INVALID = 1000;
    public static final int TOKEN_EXPIRED = 1001;
    public static final int USER_BLOCKED = 1002;
    public static final int REFRESH_TOKEN_EXPIRED = 1003;
    public static final int AUTHORIZATION_FORMAT_ERROR = 1004;
    public static final int AUTHORIZATION_MISSING = 1006;
}

