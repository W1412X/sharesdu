package com.sharesdu.android.core.navigation;

import android.content.Context;

/**
 * 导航管理器
 * 全局单例，用于管理导航回调
 * 实现类应该在 app 模块的 Application 或 MainActivity 中设置
 */
public class NavigationManager {
    private static NavigationManager instance;
    private NavigationCallback navigationCallback;
    
    private NavigationManager() {
    }
    
    public static synchronized NavigationManager getInstance() {
        if (instance == null) {
            instance = new NavigationManager();
        }
        return instance;
    }
    
    /**
     * 设置导航回调接口
     * 应该在 Application 或 MainActivity 的 onCreate 中调用
     */
    public void setNavigationCallback(NavigationCallback callback) {
        this.navigationCallback = callback;
    }
    
    /**
     * 获取导航回调接口
     */
    public NavigationCallback getNavigationCallback() {
        return navigationCallback;
    }
}

