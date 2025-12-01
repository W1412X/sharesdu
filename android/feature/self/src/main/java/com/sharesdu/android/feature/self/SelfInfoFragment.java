package com.sharesdu.android.feature.self;

import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import com.sharesdu.android.feature.self.R;
import com.sharesdu.android.core.network.ApiClient;
import com.sharesdu.android.core.network.AccountService;
import com.sharesdu.android.core.network.response.GetUserHomepageResponse;
import com.sharesdu.android.core.utils.ErrorHandler;
import com.sharesdu.android.core.utils.TokenManager;
import com.sharesdu.android.common.view.AuthorCardView;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * 个人资料页面 Fragment
 * 显示用户个人信息卡片（type='self'）
 */
public class SelfInfoFragment extends Fragment {
    private static final String TAG = "SelfInfoFragment";
    
    private AuthorCardView authorCardView;
    private FrameLayout loadingView;
    private ProgressBar progressBar;
    private TextView tvLoading;
    
    private AccountService accountService;
    private TokenManager tokenManager;
    
    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_self_info, container, false);
        
        authorCardView = view.findViewById(R.id.author_card);
        loadingView = view.findViewById(R.id.loading_view);
        progressBar = view.findViewById(R.id.progress_bar);
        tvLoading = view.findViewById(R.id.tv_loading);
        
        accountService = ApiClient.getRetrofit().create(AccountService.class);
        tokenManager = TokenManager.getInstance(getContext());
        
        return view;
    }
    
    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        loadUserInfo();
    }
    
    /**
     * 加载用户信息
     * 调用 getUserHomepage()，user_id 为空表示获取当前登录用户的主页
     */
    private void loadUserInfo() {
        showLoadingView();
        
        // user_id 为 null 表示获取当前登录用户的主页
        Call<GetUserHomepageResponse> call = accountService.getUserHomepage(null);
        call.enqueue(new Callback<GetUserHomepageResponse>() {
            @Override
            public void onResponse(Call<GetUserHomepageResponse> call, Response<GetUserHomepageResponse> response) {
                hideLoadingView();
                
                if (response.isSuccessful() && response.body() != null) {
                    GetUserHomepageResponse homeResponse = response.body();
                    if (homeResponse.isSuccess()) {
                        // 绑定用户数据到 AuthorCardView（type='self'）
                        authorCardView.bindAuthorData(homeResponse.getData());
                        Log.d(TAG, "用户信息加载成功");
                    } else {
                        String errorMsg = ErrorHandler.getErrorMessage(response);
                        Log.e(TAG, "加载用户信息失败: " + errorMsg);
                        showError(errorMsg);
                    }
                } else {
                    String errorMsg = ErrorHandler.getErrorMessage(response);
                    Log.e(TAG, "加载用户信息失败: " + errorMsg);
                    showError(errorMsg);
                }
            }
            
            @Override
            public void onFailure(Call<GetUserHomepageResponse> call, Throwable t) {
                hideLoadingView();
                String errorMsg = ErrorHandler.getErrorMessage(t);
                Log.e(TAG, "加载用户信息网络错误: " + errorMsg, t);
                showError(errorMsg);
            }
        });
    }
    
    private void showLoadingView() {
        if (loadingView != null) {
            loadingView.setVisibility(View.VISIBLE);
        }
        // 不隐藏 authorCardView，让它显示（即使数据还没加载）
    }
    
    private void hideLoadingView() {
        if (loadingView != null) {
            loadingView.setVisibility(View.GONE);
        }
        // authorCardView 始终可见
    }
    
    private void showError(String errorMsg) {
        // TODO: 显示错误提示（可以使用 Toast 或 Snackbar）
        if (tvLoading != null) {
            tvLoading.setText("加载失败: " + errorMsg);
        }
    }
}

