package com.sharesdu.android.core.utils;

import android.util.Log;
import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;
import com.sharesdu.android.core.network.response.SimpleResponse;
import okhttp3.ResponseBody;
import retrofit2.Response;
import java.io.IOException;

/**
 * 错误处理工具类
 * 用于解析和显示 API 错误信息
 */
public class ErrorHandler {
    private static final String TAG = "ErrorHandler";
    private static final Gson gson = new Gson();
    
    /**
     * 从响应中提取错误信息
     * @param response Retrofit 响应对象
     * @return 错误信息字符串
     */
    public static <T> String getErrorMessage(Response<T> response) {
        if (response == null) {
            return "请求失败，请检查网络连接";
        }
        
        // 尝试解析响应体中的错误信息
        ResponseBody errorBody = response.errorBody();
        if (errorBody != null) {
            try {
                String errorJson = errorBody.string();
                SimpleResponse errorResponse = gson.fromJson(errorJson, SimpleResponse.class);
                
                if (errorResponse != null && errorResponse.getMessage() != null && !errorResponse.getMessage().isEmpty()) {
                    return errorResponse.getMessage();
                }
            } catch (IOException e) {
                Log.e(TAG, "读取错误响应体失败", e);
            } catch (JsonSyntaxException e) {
                Log.e(TAG, "解析错误响应体失败", e);
            }
        }
        
        // 如果无法解析响应体，根据 HTTP 状态码返回默认错误信息
        int statusCode = response.code();
        return getDefaultErrorMessage(statusCode);
    }
    
    /**
     * 根据 HTTP 状态码返回默认错误信息
     * @param statusCode HTTP 状态码
     * @return 错误信息字符串
     */
    private static String getDefaultErrorMessage(int statusCode) {
        switch (statusCode) {
            case 400:
                return "请求参数错误";
            case 401:
                return "未授权，请重新登录";
            case 403:
                return "访问被拒绝";
            case 404:
                return "请求的资源不存在";
            case 500:
                return "服务器内部错误";
            case 502:
                return "网关错误";
            case 503:
                return "服务暂时不可用";
            case 504:
                return "网关超时";
            default:
                return "请求失败，错误代码：" + statusCode;
        }
    }
    
    /**
     * 从异常中提取错误信息
     * @param throwable 异常对象
     * @return 错误信息字符串
     */
    public static String getErrorMessage(Throwable throwable) {
        if (throwable == null) {
            return "未知错误";
        }
        
        String message = throwable.getMessage();
        if (message == null || message.isEmpty()) {
            message = throwable.getClass().getSimpleName();
        }
        
        // 根据异常类型返回更友好的错误信息
        if (throwable instanceof java.net.UnknownHostException) {
            return "无法连接到服务器，请检查网络设置";
        } else if (throwable instanceof java.net.SocketTimeoutException) {
            return "连接超时，请稍后重试";
        } else if (throwable instanceof java.net.ConnectException) {
            return "无法连接到服务器";
        } else if (throwable instanceof IOException) {
            return "网络错误：" + message;
        } else {
            return "请求失败：" + message;
        }
    }
    
    /**
     * 从响应体中提取错误信息（当响应不成功时）
     * @param responseBody 响应体
     * @return 错误信息字符串，如果无法解析则返回 null
     */
    public static String parseErrorResponse(ResponseBody responseBody) {
        if (responseBody == null) {
            return null;
        }
        
        try {
            String errorJson = responseBody.string();
            SimpleResponse errorResponse = gson.fromJson(errorJson, SimpleResponse.class);
            
            if (errorResponse != null && errorResponse.getMessage() != null && !errorResponse.getMessage().isEmpty()) {
                return errorResponse.getMessage();
            }
        } catch (IOException e) {
            Log.e(TAG, "读取错误响应体失败", e);
        } catch (JsonSyntaxException e) {
            Log.e(TAG, "解析错误响应体失败", e);
        }
        
        return null;
    }
}

