package com.sharesdu.android.core.network;

import android.content.Context;

/**
 * 登录回调接口
 * 用于 ErrorHandlerInterceptor 在需要登录时回调
 * 实现类应该处理跳转到登录页面的逻辑
 */
public interface LoginCallback {
    /**
     * 跳转到登录页面
     * @param context 上下文
     */
    void navigateToLogin(Context context);
}

