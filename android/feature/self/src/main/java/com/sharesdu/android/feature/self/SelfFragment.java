package com.sharesdu.android.feature.self;

import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentTransaction;
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
 * 个人页面 Fragment
 * 显示用户信息卡片和功能入口
 */
public class SelfFragment extends Fragment {
    private static final String TAG = "SelfFragment";
    
    private AuthorCardView authorCardView;
    private View cardStar;
    private View cardChat;
    private View cardNotification;
    private View cardWrite;
    private View cardSetting;
    private View cardEditProfile;
    private View contentContainer;
    private View scrollView;
    private View loadingView;
    
    private AccountService accountService;
    private TokenManager tokenManager;
    
    private String currentMenu = null; // 当前选中的菜单项
    private boolean isUserInfoLoaded = false; // 是否已加载用户信息
    
    // Fragment 实例
    private SelfInfoFragment infoFragment;
    private SelfWriteFragment writeFragment;
    private SelfStarFragment starFragment;
    private SelfNotificationFragment notificationFragment;
    private SelfChatFragment chatFragment;
    private SelfAccountFragment accountFragment;
    private SelfSettingFragment settingFragment;
    
    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_self, container, false);
        
        authorCardView = view.findViewById(R.id.author_card);
        cardStar = view.findViewById(R.id.card_star);
        cardChat = view.findViewById(R.id.card_chat);
        cardNotification = view.findViewById(R.id.card_notification);
        cardWrite = view.findViewById(R.id.card_write);
        cardSetting = view.findViewById(R.id.card_setting);
        cardEditProfile = view.findViewById(R.id.card_edit_profile);
        contentContainer = view.findViewById(R.id.content_container);
        scrollView = view.findViewById(R.id.scroll_view);
        loadingView = view.findViewById(R.id.loading_view);
        
        accountService = ApiClient.getRetrofit().create(AccountService.class);
        tokenManager = TokenManager.getInstance(getContext());
        
        return view;
    }
    
    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        
        setupClickListeners();
        // 初始化时加载用户信息
        if (!isUserInfoLoaded) {
            loadUserInfo();
        }
    }
    
    @Override
    public void onResume() {
        super.onResume();
        // Fragment可见时，如果还没有加载过用户信息，则加载（作为备用机制）
        if (!isUserInfoLoaded && getView() != null) {
            loadUserInfo();
        }
    }
    
    /**
     * 设置点击监听器
     */
    private void setupClickListeners() {
        // 我的收藏
        if (cardStar != null) {
            cardStar.setOnClickListener(v -> switchToMenu("star"));
        }
        
        // 我的聊天
        if (cardChat != null) {
            cardChat.setOnClickListener(v -> switchToMenu("chat"));
        }
        
        // 我的通知
        if (cardNotification != null) {
            cardNotification.setOnClickListener(v -> switchToMenu("notification"));
        }
        
        // 创作中心
        if (cardWrite != null) {
            cardWrite.setOnClickListener(v -> switchToMenu("write"));
        }
        
        // App设置
        if (cardSetting != null) {
            cardSetting.setOnClickListener(v -> switchToMenu("setting"));
        }
        
        // 编辑个人信息
        if (cardEditProfile != null) {
            cardEditProfile.setOnClickListener(v -> switchToMenu("account"));
        }
    }
    
    /**
     * 加载用户信息
     */
    private void loadUserInfo() {
        // 显示加载视图
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
                        // 绑定用户数据到 AuthorCardView
                        if (authorCardView != null) {
                            authorCardView.bindAuthorData(homeResponse.getData());
                        }
                        isUserInfoLoaded = true;
                        Log.d(TAG, "用户信息加载成功");
                    } else {
                        String errorMsg = ErrorHandler.getErrorMessage(response);
                        Log.e(TAG, "加载用户信息失败: " + errorMsg);
                        showErrorView(errorMsg);
                    }
                } else {
                    String errorMsg = ErrorHandler.getErrorMessage(response);
                    Log.e(TAG, "加载用户信息失败: " + errorMsg);
                    showErrorView(errorMsg);
                }
            }
            
            @Override
            public void onFailure(Call<GetUserHomepageResponse> call, Throwable t) {
                hideLoadingView();
                String errorMsg = ErrorHandler.getErrorMessage(t);
                Log.e(TAG, "加载用户信息网络错误: " + errorMsg, t);
                showErrorView(errorMsg);
            }
        });
    }
    
    /**
     * 显示加载视图
     */
    private void showLoadingView() {
        if (loadingView != null) {
            loadingView.setVisibility(View.VISIBLE);
        }
        if (scrollView != null) {
            scrollView.setVisibility(View.GONE);
        }
    }
    
    /**
     * 隐藏加载视图
     */
    private void hideLoadingView() {
        if (loadingView != null) {
            loadingView.setVisibility(View.GONE);
        }
        if (scrollView != null) {
            scrollView.setVisibility(View.VISIBLE);
        }
    }
    
    /**
     * 显示错误视图
     */
    private void showErrorView(String errorMsg) {
        hideLoadingView();
        // 可以在这里显示错误信息，比如Toast或错误提示视图
        if (getContext() != null) {
            android.widget.Toast.makeText(getContext(), "加载失败: " + errorMsg, android.widget.Toast.LENGTH_SHORT).show();
        }
    }
    
    /**
     * 切换到指定的菜单项
     */
    private void switchToMenu(String menu) {
        if (menu.equals(currentMenu)) {
            return; // 已经是当前菜单，不切换
        }
        
        currentMenu = menu;
        
        // 隐藏主界面，显示内容区域
        hideMainContent();
        showContentContainer();
        
        FragmentTransaction transaction = getChildFragmentManager().beginTransaction();
        
        // 隐藏所有 Fragment
        hideAllFragments(transaction);
        
        // 显示或创建对应的 Fragment
        Fragment fragment = null;
        String tag = "self_" + menu;
        
        switch (menu) {
            case "write":
                if (writeFragment == null) {
                    writeFragment = new SelfWriteFragment();
                    transaction.add(R.id.content_container, writeFragment, tag);
                } else {
                    transaction.show(writeFragment);
                }
                fragment = writeFragment;
                break;
            case "star":
                if (starFragment == null) {
                    starFragment = new SelfStarFragment();
                    transaction.add(R.id.content_container, starFragment, tag);
                } else {
                    transaction.show(starFragment);
                }
                fragment = starFragment;
                break;
            case "notification":
                if (notificationFragment == null) {
                    notificationFragment = new SelfNotificationFragment();
                    transaction.add(R.id.content_container, notificationFragment, tag);
                } else {
                    transaction.show(notificationFragment);
                }
                fragment = notificationFragment;
                break;
            case "chat":
                if (chatFragment == null) {
                    chatFragment = new SelfChatFragment();
                    transaction.add(R.id.content_container, chatFragment, tag);
                } else {
                    transaction.show(chatFragment);
                }
                fragment = chatFragment;
                break;
            case "account":
                if (accountFragment == null) {
                    accountFragment = new SelfAccountFragment();
                    transaction.add(R.id.content_container, accountFragment, tag);
                } else {
                    transaction.show(accountFragment);
                }
                fragment = accountFragment;
                break;
            case "setting":
                if (settingFragment == null) {
                    settingFragment = new SelfSettingFragment();
                    transaction.add(R.id.content_container, settingFragment, tag);
                } else {
                    transaction.show(settingFragment);
                }
                fragment = settingFragment;
                break;
        }
        
        if (fragment != null) {
            transaction.commitAllowingStateLoss();
        }
    }
    
    /**
     * 隐藏主内容（卡片和按钮）
     */
    private void hideMainContent() {
        // 隐藏滚动视图（包含所有主内容）
        if (scrollView != null) {
            scrollView.setVisibility(View.GONE);
        }
    }
    
    /**
     * 显示内容容器
     */
    private void showContentContainer() {
        if (contentContainer != null) {
            contentContainer.setVisibility(View.VISIBLE);
            // 设置高度为 match_parent
            ViewGroup.LayoutParams params = contentContainer.getLayoutParams();
            params.height = ViewGroup.LayoutParams.MATCH_PARENT;
            contentContainer.setLayoutParams(params);
        }
    }
    
    /**
     * 返回主菜单（显示主内容，隐藏内容区域）
     */
    public void backToMenu() {
        // 显示滚动视图（包含所有主内容）
        if (scrollView != null) {
            scrollView.setVisibility(View.VISIBLE);
        }
        
        // 隐藏内容容器
        if (contentContainer != null) {
            contentContainer.setVisibility(View.GONE);
        }
        
        currentMenu = null;
    }
    
    /**
     * 隐藏所有 Fragment
     */
    private void hideAllFragments(FragmentTransaction transaction) {
        if (writeFragment != null) {
            transaction.hide(writeFragment);
        }
        if (starFragment != null) {
            transaction.hide(starFragment);
        }
        if (notificationFragment != null) {
            transaction.hide(notificationFragment);
        }
        if (chatFragment != null) {
            transaction.hide(chatFragment);
        }
        if (accountFragment != null) {
            transaction.hide(accountFragment);
        }
        if (settingFragment != null) {
            transaction.hide(settingFragment);
        }
    }
    
    /**
     * 处理返回键
     */
    public boolean onBackPressed() {
        if (currentMenu != null) {
            // 如果正在显示子页面，返回主菜单
            backToMenu();
            return true;
        }
        return false;
    }
}
