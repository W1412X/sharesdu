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
import com.google.android.material.tabs.TabLayout;
import com.sharesdu.android.feature.self.R;
import com.sharesdu.android.common.adapter.AuthorContentAdapter;
import com.sharesdu.android.core.network.ApiClient;
import com.sharesdu.android.core.network.AccountService;
import com.sharesdu.android.core.network.response.UserContentResponse;
import com.sharesdu.android.core.network.response.UserPreviewResponse;
import com.sharesdu.android.core.utils.ErrorHandler;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 个人创作页面 Fragment
 * 显示用户的文章/帖子/回复列表
 * 初始显示预览（最多5条），支持"加载更多"获取完整列表
 */
public class SelfWriteFragment extends Fragment {
    private static final String TAG = "SelfWriteFragment";
    
    private TabLayout tabLayout;
    private SwipeRefreshLayout swipeRefreshLayout;
    private RecyclerView recyclerView;
    private ProgressBar progressBar;
    private TextView tvEmpty;
    private FrameLayout loadingView;
    
    private AuthorContentAdapter adapter;
    private AccountService accountService;
    
    private String currentTab = "article"; // article, post, reply
    private List<Map<String, Object>> articleList = new ArrayList<>();
    private List<Map<String, Object>> postList = new ArrayList<>();
    private List<Map<String, Object>> replyList = new ArrayList<>();
    
    private int articlePage = 1;
    private int postPage = 1;
    private int replyPage = 1;
    private boolean isLoading = false;
    private boolean allLoaded = false;
    
    // 滚动加载节流（防止频繁触发）
    private long lastLoadMoreTime = 0;
    private boolean isLoadMorePending = false; // 标记是否有加载请求正在进行
    private static final long LOAD_MORE_THROTTLE_MS = 1500; // 1.5秒内只触发一次（更长的节流时间）
    private static final int LOAD_MORE_THRESHOLD = 5; // 距离底部5个项目时开始加载（更宽松的阈值）
    
    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_self_write, container, false);
        
        tabLayout = view.findViewById(R.id.tab_layout);
        swipeRefreshLayout = view.findViewById(R.id.swipe_refresh);
        recyclerView = view.findViewById(R.id.recycler_view);
        progressBar = view.findViewById(R.id.progress_bar);
        tvEmpty = view.findViewById(R.id.tv_empty);
        loadingView = view.findViewById(R.id.loading_view);
        
        accountService = ApiClient.getRetrofit().create(AccountService.class);
        
        return view;
    }
    
    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        
        setupTabs();
        setupRecyclerView();
        setupSwipeRefresh();
        
        // 初始加载预览数据
        loadPreview();
    }
    
    private void setupTabs() {
        tabLayout.addTab(tabLayout.newTab().setText("文章"));
        tabLayout.addTab(tabLayout.newTab().setText("帖子"));
        tabLayout.addTab(tabLayout.newTab().setText("回复"));
        
        tabLayout.addOnTabSelectedListener(new TabLayout.OnTabSelectedListener() {
            @Override
            public void onTabSelected(TabLayout.Tab tab) {
                switchTab(tab.getPosition());
            }
            
            @Override
            public void onTabUnselected(TabLayout.Tab tab) {
            }
            
            @Override
            public void onTabReselected(TabLayout.Tab tab) {
            }
        });
    }
    
    private void setupRecyclerView() {
        adapter = new AuthorContentAdapter(getContext(), currentTab);
        recyclerView.setLayoutManager(new LinearLayoutManager(getContext()));
        recyclerView.setAdapter(adapter);
        
        // 无限滚动加载（优化版：添加更强的节流和更严格的触发条件）
        recyclerView.addOnScrollListener(new RecyclerView.OnScrollListener() {
            @Override
            public void onScrolled(@NonNull RecyclerView recyclerView, int dx, int dy) {
                super.onScrolled(recyclerView, dx, dy);
                
                // 只在下滑时检查（dy > 0）
                if (dy <= 0) {
                    return;
                }
                
                // 快速检查状态，避免不必要的计算
                if (isLoading || allLoaded || isLoadMorePending) {
                    return;
                }
                
                // 节流：防止频繁触发（更严格的节流）
                long currentTime = System.currentTimeMillis();
                if (currentTime - lastLoadMoreTime < LOAD_MORE_THROTTLE_MS) {
                    return;
                }
                
                LinearLayoutManager layoutManager = (LinearLayoutManager) recyclerView.getLayoutManager();
                if (layoutManager == null) {
                    return;
                }
                
                int totalItemCount = layoutManager.getItemCount();
                int lastVisibleItemPosition = layoutManager.findLastVisibleItemPosition();
                int firstVisibleItemPosition = layoutManager.findFirstVisibleItemPosition();
                
                // 确保位置有效
                if (firstVisibleItemPosition < 0 || totalItemCount == 0) {
                    return;
                }
                
                // 确保列表有足够的项目，避免在列表很短时频繁触发
                if (totalItemCount < LOAD_MORE_THRESHOLD + 2) {
                    return;
                }
                
                // 更严格的触发条件：真正接近底部时才触发
                // 计算距离底部的项目数
                int itemsFromBottom = totalItemCount - 1 - lastVisibleItemPosition;
                
                // 只有在真正接近底部时才触发（距离底部还有 LOAD_MORE_THRESHOLD 个项目）
                boolean shouldLoadMore = itemsFromBottom <= LOAD_MORE_THRESHOLD;
                
                if (shouldLoadMore) {
                    lastLoadMoreTime = currentTime;
                    isLoadMorePending = true; // 设置标记，防止重复触发
                    loadMore();
                }
            }
        });
    }
    
    private void setupSwipeRefresh() {
        swipeRefreshLayout.setOnRefreshListener(() -> {
            refresh();
        });
    }
    
    private void switchTab(int position) {
        String[] tabs = {"article", "post", "reply"};
        currentTab = tabs[position];
        
        // 更新适配器类型
        adapter = new AuthorContentAdapter(getContext(), currentTab);
        recyclerView.setAdapter(adapter);
        
        // 显示对应列表
        List<Map<String, Object>> currentData = getCurrentData();
        if (currentData.isEmpty()) {
            showLoadingView();
            loadPreview(); // 如果列表为空，重新加载预览
        } else {
            adapter.setData(currentData);
            updateUI();
        }
    }
    
    private List<Map<String, Object>> getCurrentData() {
        switch (currentTab) {
            case "article":
                return articleList;
            case "post":
                return postList;
            case "reply":
                return replyList;
            default:
                return new ArrayList<>();
        }
    }
    
    /**
     * 加载预览数据（最多5条）
     */
    private void loadPreview() {
        showLoadingView();
        
        // user_id 为 null 表示获取当前登录用户的数据
        Call<UserPreviewResponse> call = accountService.getUserPreview(null);
        call.enqueue(new Callback<UserPreviewResponse>() {
            @Override
            public void onResponse(Call<UserPreviewResponse> call, Response<UserPreviewResponse> response) {
                hideLoadingView();
                swipeRefreshLayout.setRefreshing(false);
                
                if (response.isSuccessful() && response.body() != null) {
                    UserPreviewResponse previewResponse = response.body();
                    if (previewResponse.isSuccess()) {
                        parsePreviewData(previewResponse);
                        updateUI();
                    } else {
                        String errorMsg = previewResponse.getMessage();
                        Log.e(TAG, "加载预览失败: " + errorMsg);
                        showError(errorMsg);
                    }
                } else {
                    String errorMsg = ErrorHandler.getErrorMessage(response);
                    Log.e(TAG, "加载预览失败: " + errorMsg);
                    showError(errorMsg);
                }
            }
            
            @Override
            public void onFailure(Call<UserPreviewResponse> call, Throwable t) {
                hideLoadingView();
                swipeRefreshLayout.setRefreshing(false);
                String errorMsg = ErrorHandler.getErrorMessage(t);
                Log.e(TAG, "加载预览网络错误: " + errorMsg, t);
                showError(errorMsg);
            }
        });
    }
    
    /**
     * 解析预览数据
     */
    private void parsePreviewData(UserPreviewResponse previewResponse) {
        if (previewResponse.getArticles() != null) {
            articleList.clear();
            articleList.addAll(previewResponse.getArticles());
        }
        if (previewResponse.getPosts() != null) {
            postList.clear();
            postList.addAll(previewResponse.getPosts());
        }
        if (previewResponse.getReplies() != null) {
            replyList.clear();
            replyList.addAll(previewResponse.getReplies());
        }
        
        // 重置分页
        articlePage = 1;
        postPage = 1;
        replyPage = 1;
        allLoaded = false;
        isLoadMorePending = false;
        lastLoadMoreTime = 0; // 重置节流时间
    }
    
    /**
     * 刷新数据
     */
    private void refresh() {
        // 清空当前列表
        getCurrentData().clear();
        allLoaded = false;
        isLoadMorePending = false;
        lastLoadMoreTime = 0; // 重置节流时间
        
        // 重新加载预览
        loadPreview();
    }
    
    /**
     * 加载更多数据（优化版：添加双重检查和状态标记）
     */
    private void loadMore() {
        // 三重检查，确保不会重复加载
        if (isLoading || allLoaded || isLoadMorePending) {
            Log.d(TAG, "跳过加载：isLoading=" + isLoading + ", allLoaded=" + allLoaded + ", isLoadMorePending=" + isLoadMorePending);
            return;
        }
        
        isLoading = true;
        isLoadMorePending = true; // 设置标记，防止重复触发
        progressBar.setVisibility(View.VISIBLE);
        
        int currentPage = getCurrentPage();
        final int nextPage = currentPage + 1; // 使用 final 变量，以便在内部类中使用
        
        Log.d(TAG, "开始加载更多：类型=" + currentTab + ", 页码=" + nextPage);
        
        // user_id 为 null 表示获取当前登录用户的数据
        Call<UserContentResponse> call = accountService.getUserContent(
                currentTab, null, nextPage, 10
        );
        call.enqueue(new Callback<UserContentResponse>() {
            @Override
            public void onResponse(Call<UserContentResponse> call, Response<UserContentResponse> response) {
                isLoading = false;
                isLoadMorePending = false; // 清除标记，允许下次加载
                progressBar.setVisibility(View.GONE);
                
                // 更新节流时间，避免立即再次触发
                lastLoadMoreTime = System.currentTimeMillis();
                
                if (response.isSuccessful() && response.body() != null) {
                    UserContentResponse contentResponse = response.body();
                    if (contentResponse.isSuccess()) {
                        List<Map<String, Object>> results = contentResponse.getResults();
                        if (results != null && !results.isEmpty()) {
                            // 检查是否还有更多数据（如果返回的数据少于请求的数量，说明已经加载完）
                            if (results.size() < 10) {
                                allLoaded = true;
                                Log.d(TAG, "数据已全部加载完成");
                            }
                            
                            getCurrentData().addAll(results);
                            setCurrentPage(nextPage);
                            adapter.setData(getCurrentData());
                            updateUI();
                            Log.d(TAG, "加载更多成功：新增" + results.size() + "条数据");
                        } else {
                            allLoaded = true;
                            Log.d(TAG, "没有更多数据了");
                        }
                    } else {
                        String errorMsg = contentResponse.getMessage();
                        Log.e(TAG, "加载更多失败: " + errorMsg);
                    }
                } else {
                    String errorMsg = ErrorHandler.getErrorMessage(response);
                    Log.e(TAG, "加载更多失败: " + errorMsg);
                }
            }
            
            @Override
            public void onFailure(Call<UserContentResponse> call, Throwable t) {
                isLoading = false;
                isLoadMorePending = false; // 清除标记，允许下次加载
                progressBar.setVisibility(View.GONE);
                
                // 更新节流时间，避免立即再次触发
                lastLoadMoreTime = System.currentTimeMillis();
                
                // 如果是取消请求，不显示错误
                if (call.isCanceled()) {
                    Log.d(TAG, "加载更多请求已取消");
                    return;
                }
                
                String errorMsg = ErrorHandler.getErrorMessage(t);
                Log.e(TAG, "加载更多网络错误: " + errorMsg, t);
            }
        });
    }
    
    private int getCurrentPage() {
        switch (currentTab) {
            case "article":
                return articlePage;
            case "post":
                return postPage;
            case "reply":
                return replyPage;
            default:
                return 1;
        }
    }
    
    private void setCurrentPage(int page) {
        switch (currentTab) {
            case "article":
                articlePage = page;
                break;
            case "post":
                postPage = page;
                break;
            case "reply":
                replyPage = page;
                break;
        }
    }
    
    private void updateUI() {
        List<Map<String, Object>> currentData = getCurrentData();
        if (currentData.isEmpty()) {
            recyclerView.setVisibility(View.GONE);
            tvEmpty.setVisibility(View.VISIBLE);
        } else {
            recyclerView.setVisibility(View.VISIBLE);
            tvEmpty.setVisibility(View.GONE);
            adapter.setData(currentData);
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

