package com.sharesdu.android.core.utils;

import android.content.Context;
import android.content.SharedPreferences;

/**
 * Token 和用户信息管理工具类
 * 使用 SharedPreferences 存储登录信息
 */
public class TokenManager {
    private static final String PREF_NAME = "ShareSDU_Prefs";
    private static final String KEY_ACCESS_TOKEN = "access_token";
    private static final String KEY_REFRESH_TOKEN = "refresh_token";
    private static final String KEY_USER_ID = "user_id";
    private static final String KEY_USER_NAME = "user_name";
    private static final String KEY_EMAIL = "email";
    private static final String KEY_IS_MASTER = "is_master";
    private static final String KEY_IS_SUPER_MASTER = "is_super_master";
    private static final String KEY_SAVED_USER_NAME = "saved_user_name";
    private static final String KEY_SAVED_PASSWORD = "saved_password";
    private static final String KEY_AVATAR_URL = "avatar_url";
    
    private static TokenManager instance;
    private SharedPreferences preferences;
    
    private TokenManager(Context context) {
        preferences = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
    }
    
    public static synchronized TokenManager getInstance(Context context) {
        if (instance == null) {
            instance = new TokenManager(context.getApplicationContext());
        }
        return instance;
    }
    
    /**
     * 保存 Access Token
     */
    public void saveAccessToken(String accessToken) {
        preferences.edit().putString(KEY_ACCESS_TOKEN, accessToken).apply();
    }
    
    /**
     * 获取 Access Token
     */
    public String getAccessToken() {
        return preferences.getString(KEY_ACCESS_TOKEN, null);
    }
    
    /**
     * 保存 Refresh Token
     */
    public void saveRefreshToken(String refreshToken) {
        preferences.edit().putString(KEY_REFRESH_TOKEN, refreshToken).apply();
    }
    
    /**
     * 获取 Refresh Token
     */
    public String getRefreshToken() {
        return preferences.getString(KEY_REFRESH_TOKEN, null);
    }
    
    /**
     * 保存用户信息
     */
    public void saveUserInfo(String user_id, String user_name, String email, 
                            Boolean is_master, Boolean is_super_master, String avatar_url) {
        SharedPreferences.Editor editor = preferences.edit();
        editor.putString(KEY_USER_ID, user_id);
        editor.putString(KEY_USER_NAME, user_name);
        editor.putString(KEY_EMAIL, email);
        editor.putBoolean(KEY_IS_MASTER, is_master != null && is_master);
        editor.putBoolean(KEY_IS_SUPER_MASTER, is_super_master != null && is_super_master);
        if (avatar_url != null) {
            editor.putString(KEY_AVATAR_URL, avatar_url);
        }
        editor.apply();
    }
    
    /**
     * 获取用户 ID
     */
    public String getUserId() {
        return preferences.getString(KEY_USER_ID, null);
    }
    
    /**
     * 获取用户名
     */
    public String getUserName() {
        return preferences.getString(KEY_USER_NAME, null);
    }
    
    /**
     * 获取邮箱
     */
    public String getEmail() {
        return preferences.getString(KEY_EMAIL, null);
    }
    
    /**
     * 是否为管理员
     */
    public boolean isMaster() {
        return preferences.getBoolean(KEY_IS_MASTER, false);
    }
    
    /**
     * 是否为超级管理员
     */
    public boolean isSuperMaster() {
        return preferences.getBoolean(KEY_IS_SUPER_MASTER, false);
    }
    
    /**
     * 获取头像 URL
     */
    public String getAvatarUrl() {
        return preferences.getString(KEY_AVATAR_URL, null);
    }
    
    /**
     * 保存账号密码（用于自动登录）
     */
    public void saveCredentials(String user_name, String password) {
        SharedPreferences.Editor editor = preferences.edit();
        editor.putString(KEY_SAVED_USER_NAME, user_name);
        editor.putString(KEY_SAVED_PASSWORD, password);
        editor.apply();
    }
    
    /**
     * 获取保存的用户名
     */
    public String getSavedUserName() {
        return preferences.getString(KEY_SAVED_USER_NAME, null);
    }
    
    /**
     * 获取保存的密码
     */
    public String getSavedPassword() {
        return preferences.getString(KEY_SAVED_PASSWORD, null);
    }
    
    /**
     * 清除保存的账号密码
     */
    public void clearSavedCredentials() {
        preferences.edit()
                .remove(KEY_SAVED_USER_NAME)
                .remove(KEY_SAVED_PASSWORD)
                .apply();
    }
    
    /**
     * 检查是否已登录（是否有 access token）
     */
    public boolean isLoggedIn() {
        return getAccessToken() != null && !getAccessToken().isEmpty();
    }
    
    /**
     * 清除所有登录信息
     */
    public void clearAll() {
        preferences.edit().clear().apply();
    }
    
    /**
     * 清除 token（保留用户信息）
     */
    public void clearTokens() {
        preferences.edit()
                .remove(KEY_ACCESS_TOKEN)
                .remove(KEY_REFRESH_TOKEN)
                .apply();
    }
}

