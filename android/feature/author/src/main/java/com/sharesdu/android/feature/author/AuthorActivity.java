package com.sharesdu.android.feature.author;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentManager;
import androidx.fragment.app.FragmentTransaction;
import com.google.android.material.tabs.TabLayout;
import com.sharesdu.android.feature.author.R;
import com.sharesdu.android.feature.author.AuthorContentFragment;
import com.sharesdu.android.core.network.AccountService;
import com.sharesdu.android.core.network.ApiClient;
import com.sharesdu.android.core.network.response.GetUserHomepageResponse;
import com.sharesdu.android.core.utils.ErrorHandler;
import com.sharesdu.android.core.utils.TokenManager;
import com.sharesdu.android.common.view.AuthorCardView;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * 作者页面 Activity
 * 显示作者信息和创作内容（文章/帖子/回复）
 */
public class AuthorActivity extends AppCompatActivity {
    public static final String EXTRA_AUTHOR_ID = "author_id";
    
    private Toolbar toolbar;
    private AuthorCardView authorCardView;
    private TabLayout tabLayout;
    private ProgressBar progressBar;
    private TextView tvLoading;
    private View loadingView;
    
    private Integer authorId;
    private AccountService accountService;
    private String currentTab = "article"; // article/post/reply
    private Object previewData; // 保存预览数据，以便在 Fragment 创建后传递
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_author);
        
        // 获取传入的 authorId
        authorId = getIntent().getIntExtra(EXTRA_AUTHOR_ID, -1);
        if (authorId == -1) {
            Toast.makeText(this, "无效的作者ID", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }
        
        // 检查是否是自己的页面，如果是则跳转到个人页面（后续实现）
        String currentUserIdStr = TokenManager.getInstance(this).getUserId();
        if (currentUserIdStr != null) {
            try {
                Integer currentUserId = Integer.parseInt(currentUserIdStr);
                if (currentUserId.equals(authorId)) {
                    // TODO: 跳转到个人页面
                    Toast.makeText(this, "这是您自己的页面，将跳转到个人页面", Toast.LENGTH_SHORT).show();
                    finish();
                    return;
                }
            } catch (NumberFormatException e) {
                // 用户ID格式错误，忽略
            }
        }
        
        initViews();
        initNetwork();
        loadAuthorInfo();
        setupTabs();
    }
    
    private void initViews() {
        toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setTitle("作者");
        }
        toolbar.setNavigationOnClickListener(v -> finish());
        
        authorCardView = findViewById(R.id.author_card);
        tabLayout = findViewById(R.id.tab_layout);
        progressBar = findViewById(R.id.progress_bar);
        tvLoading = findViewById(R.id.tv_loading);
        loadingView = findViewById(R.id.loading_view);
    }
    
    private void initNetwork() {
        accountService = ApiClient.getRetrofit().create(AccountService.class);
    }
    
    private void loadAuthorInfo() {
        showLoadingView();
        
        Call<GetUserHomepageResponse> call = accountService.getUserHomepage(authorId);
        call.enqueue(new Callback<GetUserHomepageResponse>() {
            @Override
            public void onResponse(Call<GetUserHomepageResponse> call, Response<GetUserHomepageResponse> response) {
                hideLoadingView();
                
                if (response.isSuccessful() && response.body() != null) {
                    GetUserHomepageResponse homeResponse = response.body();
                    if (homeResponse.isSuccess()) {
                        // 解析并显示作者信息
                        authorCardView.bindAuthorData(homeResponse.getData());
                        // 设置标题
                        if (getSupportActionBar() != null) {
                            String authorName = extractAuthorName(homeResponse.getData());
                            if (authorName != null) {
                                getSupportActionBar().setTitle(authorName);
                            }
                        }
                        // 加载预览数据
                        loadPreview();
                    } else {
                        String errorMsg = ErrorHandler.getErrorMessage(response);
                        Toast.makeText(AuthorActivity.this, errorMsg, Toast.LENGTH_SHORT).show();
                        finish();
                    }
                } else {
                    String errorMsg = ErrorHandler.getErrorMessage(response);
                    Toast.makeText(AuthorActivity.this, errorMsg, Toast.LENGTH_SHORT).show();
                    finish();
                }
            }
            
            @Override
            public void onFailure(Call<GetUserHomepageResponse> call, Throwable t) {
                hideLoadingView();
                String errorMsg = ErrorHandler.getErrorMessage(t);
                Toast.makeText(AuthorActivity.this, errorMsg, Toast.LENGTH_SHORT).show();
                finish();
            }
        });
    }
    
    private void loadPreview() {
        Call<com.sharesdu.android.core.network.response.UserPreviewResponse> call = accountService.getUserPreview(authorId);
        call.enqueue(new Callback<com.sharesdu.android.core.network.response.UserPreviewResponse>() {
            @Override
            public void onResponse(Call<com.sharesdu.android.core.network.response.UserPreviewResponse> call, Response<com.sharesdu.android.core.network.response.UserPreviewResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    com.sharesdu.android.core.network.response.UserPreviewResponse previewResponse = response.body();
                    if (previewResponse.isSuccess()) {
                        // 构建预览数据Map，包含articles, posts, replies
                        java.util.Map<String, Object> previewDataMap = new java.util.HashMap<>();
                        if (previewResponse.getArticles() != null) {
                            previewDataMap.put("articles", previewResponse.getArticles());
                        }
                        if (previewResponse.getPosts() != null) {
                            previewDataMap.put("posts", previewResponse.getPosts());
                        }
                        if (previewResponse.getReplies() != null) {
                            previewDataMap.put("replies", previewResponse.getReplies());
                        }
                        previewData = previewDataMap;
                        
                        // 将预览数据传递给所有 Fragment
                        FragmentManager fragmentManager = getSupportFragmentManager();
                        for (String tabType : new String[]{"article", "post", "reply"}) {
                            Fragment fragment = fragmentManager.findFragmentByTag("content_" + tabType);
                            if (fragment instanceof AuthorContentFragment) {
                                ((AuthorContentFragment) fragment).setPreviewData(previewData);
                            }
                        }
                    }
                }
            }
            
            @Override
            public void onFailure(Call<com.sharesdu.android.core.network.response.UserPreviewResponse> call, Throwable t) {
                // 预览加载失败不影响页面显示
            }
        });
    }
    
    private void setupTabs() {
        // 添加标签
        tabLayout.addTab(tabLayout.newTab().setText("文章"));
        tabLayout.addTab(tabLayout.newTab().setText("帖子"));
        tabLayout.addTab(tabLayout.newTab().setText("回复"));
        
        // 默认显示文章标签
        switchToTab("article");
        
        // 标签切换监听
        tabLayout.addOnTabSelectedListener(new TabLayout.OnTabSelectedListener() {
            @Override
            public void onTabSelected(TabLayout.Tab tab) {
                int position = tab.getPosition();
                switch (position) {
                    case 0:
                        switchToTab("article");
                        break;
                    case 1:
                        switchToTab("post");
                        break;
                    case 2:
                        switchToTab("reply");
                        break;
                }
            }
            
            @Override
            public void onTabUnselected(TabLayout.Tab tab) {
            }
            
            @Override
            public void onTabReselected(TabLayout.Tab tab) {
            }
        });
    }
    
    private void switchToTab(String tabType) {
        currentTab = tabType;
        
        FragmentManager fragmentManager = getSupportFragmentManager();
        FragmentTransaction transaction = fragmentManager.beginTransaction();
        
        // 查找或创建 Fragment
        String tag = "content_" + tabType;
        Fragment fragment = fragmentManager.findFragmentByTag(tag);
        
        if (fragment == null) {
            fragment = AuthorContentFragment.newInstance(authorId, tabType);
            transaction.add(R.id.fragment_container, fragment, tag);
        } else {
            transaction.show(fragment);
        }
        
        // 隐藏其他 Fragment
        for (String otherTab : new String[]{"article", "post", "reply"}) {
            if (!otherTab.equals(tabType)) {
                Fragment otherFragment = fragmentManager.findFragmentByTag("content_" + otherTab);
                if (otherFragment != null) {
                    transaction.hide(otherFragment);
                }
            }
        }
        
        transaction.commitAllowingStateLoss(); // 使用 commitAllowingStateLoss 避免状态丢失异常
        
        // 如果已有预览数据，在 Fragment 视图创建后传递（延迟执行）
        // 将 fragment 保存为 final 变量，以便在 lambda 中使用
        final Fragment finalFragment = fragment;
        final Object finalPreviewData = previewData;
        if (finalPreviewData != null && finalFragment instanceof AuthorContentFragment) {
            // 使用 Handler 延迟执行，确保 Fragment 视图已创建
            new android.os.Handler(android.os.Looper.getMainLooper()).post(() -> {
                if (finalFragment.isAdded() && finalFragment.getView() != null) {
                    ((AuthorContentFragment) finalFragment).setPreviewData(finalPreviewData);
                }
            });
        }
    }
    
    private void showLoadingView() {
        if (loadingView != null) {
            loadingView.setVisibility(View.VISIBLE);
        }
    }
    
    private void hideLoadingView() {
        if (loadingView != null) {
            loadingView.setVisibility(View.GONE);
        }
    }
    
    private String extractAuthorName(Object data) {
        if (data instanceof java.util.Map) {
            @SuppressWarnings("unchecked")
            java.util.Map<String, Object> dataMap = (java.util.Map<String, Object>) data;
            Object userName = dataMap.get("user_name");
            if (userName != null) {
                return userName.toString();
            }
        }
        return null;
    }
    
    /**
     * 启动 AuthorActivity 的静态方法
     */
    public static void start(Context context, Integer authorId) {
        Intent intent = new Intent(context, AuthorActivity.class);
        intent.putExtra(EXTRA_AUTHOR_ID, authorId);
        context.startActivity(intent);
    }
}

