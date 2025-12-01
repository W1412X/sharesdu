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
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;
import com.sharesdu.android.feature.self.R;
import com.sharesdu.android.common.adapter.NotificationAdapter;
import com.sharesdu.android.core.network.ApiClient;
import com.sharesdu.android.core.network.NotificationService;
import com.sharesdu.android.core.network.response.NotificationListResponse;
import com.sharesdu.android.core.utils.ErrorHandler;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 通知页面 Fragment
 * 显示通知列表，支持下拉刷新和分页加载
 */
public class SelfNotificationFragment extends Fragment {
    private static final String TAG = "SelfNotificationFragment";
    private static final int PAGE_SIZE = 10;
    
    private SwipeRefreshLayout swipeRefreshLayout;
    private RecyclerView recyclerView;
    private ProgressBar progressBar;
    private TextView tvEmpty;
    private FrameLayout loadingView;
    
    private NotificationAdapter adapter;
    private NotificationService notificationService;
    
    private List<Map<String, Object>> notificationList = new ArrayList<>();
    private int currentPage = 1;
    private boolean isLoading = false;
    private boolean allLoaded = false;
    
    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_self_notification, container, false);
        
        swipeRefreshLayout = view.findViewById(R.id.swipe_refresh);
        recyclerView = view.findViewById(R.id.recycler_view);
        progressBar = view.findViewById(R.id.progress_bar);
        tvEmpty = view.findViewById(R.id.tv_empty);
        loadingView = view.findViewById(R.id.loading_view);
        
        notificationService = ApiClient.getRetrofit().create(NotificationService.class);
        
        return view;
    }
    
    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        
        setupRecyclerView();
        setupSwipeRefresh();
        
        // 初始加载
        loadNotifications(true);
    }
    
    private void setupRecyclerView() {
        adapter = new NotificationAdapter(getContext());
        recyclerView.setLayoutManager(new LinearLayoutManager(getContext()));
        recyclerView.setAdapter(adapter);
        
        // 无限滚动加载
        recyclerView.addOnScrollListener(new RecyclerView.OnScrollListener() {
            @Override
            public void onScrolled(@NonNull RecyclerView recyclerView, int dx, int dy) {
                super.onScrolled(recyclerView, dx, dy);
                
                LinearLayoutManager layoutManager = (LinearLayoutManager) recyclerView.getLayoutManager();
                if (layoutManager != null) {
                    int visibleItemCount = layoutManager.getChildCount();
                    int totalItemCount = layoutManager.getItemCount();
                    int firstVisibleItemPosition = layoutManager.findFirstVisibleItemPosition();
                    
                    if (!isLoading && !allLoaded) {
                        if ((visibleItemCount + firstVisibleItemPosition) >= totalItemCount
                                && firstVisibleItemPosition >= 0) {
                            loadNotifications(false);
                        }
                    }
                }
            }
        });
    }
    
    private void setupSwipeRefresh() {
        swipeRefreshLayout.setOnRefreshListener(() -> {
            refresh();
        });
    }
    
    /**
     * 加载通知列表
     */
    private void loadNotifications(boolean isFirstLoad) {
        if (isLoading) {
            return;
        }
        
        isLoading = true;
        
        if (isFirstLoad) {
            showLoadingView();
        } else {
            progressBar.setVisibility(View.VISIBLE);
        }
        
        Call<NotificationListResponse> call = notificationService.getNotificationList(PAGE_SIZE, currentPage);
        call.enqueue(new Callback<NotificationListResponse>() {
            @Override
            public void onResponse(Call<NotificationListResponse> call, Response<NotificationListResponse> response) {
                isLoading = false;
                hideLoadingView();
                progressBar.setVisibility(View.GONE);
                swipeRefreshLayout.setRefreshing(false);
                
                if (response.isSuccessful() && response.body() != null) {
                    NotificationListResponse notificationResponse = response.body();
                    if (notificationResponse.isSuccess()) {
                        List<Map<String, Object>> newNotifications = notificationResponse.getNotification_list();
                        if (newNotifications != null && !newNotifications.isEmpty()) {
                            if (isFirstLoad) {
                                notificationList.clear();
                            }
                            notificationList.addAll(newNotifications);
                            currentPage++;
                            adapter.setData(notificationList);
                            updateUI();
                        } else {
                            allLoaded = true;
                            if (isFirstLoad) {
                                updateUI();
                            }
                        }
                    } else {
                        String errorMsg = notificationResponse.getMessage();
                        Log.e(TAG, "加载通知失败: " + errorMsg);
                        showError(errorMsg);
                    }
                } else {
                    String errorMsg = ErrorHandler.getErrorMessage(response);
                    Log.e(TAG, "加载通知失败: " + errorMsg);
                    showError(errorMsg);
                }
            }
            
            @Override
            public void onFailure(Call<NotificationListResponse> call, Throwable t) {
                isLoading = false;
                hideLoadingView();
                progressBar.setVisibility(View.GONE);
                swipeRefreshLayout.setRefreshing(false);
                String errorMsg = ErrorHandler.getErrorMessage(t);
                Log.e(TAG, "加载通知网络错误: " + errorMsg, t);
                showError(errorMsg);
            }
        });
    }
    
    /**
     * 刷新数据
     */
    private void refresh() {
        currentPage = 1;
        allLoaded = false;
        loadNotifications(true);
    }
    
    private void updateUI() {
        if (notificationList.isEmpty()) {
            recyclerView.setVisibility(View.GONE);
            tvEmpty.setVisibility(View.VISIBLE);
        } else {
            recyclerView.setVisibility(View.VISIBLE);
            tvEmpty.setVisibility(View.GONE);
        }
    }
    
    private void showLoadingView() {
        if (loadingView != null) {
            loadingView.setVisibility(View.VISIBLE);
        }
        if (recyclerView != null) {
            recyclerView.setVisibility(View.GONE);
        }
        if (tvEmpty != null) {
            tvEmpty.setVisibility(View.GONE);
        }
    }
    
    private void hideLoadingView() {
        if (loadingView != null) {
            loadingView.setVisibility(View.GONE);
        }
    }
    
    private void showError(String errorMsg) {
        // TODO: 显示错误提示
        if (tvEmpty != null) {
            tvEmpty.setText("加载失败: " + errorMsg);
            tvEmpty.setVisibility(View.VISIBLE);
        }
    }
}

