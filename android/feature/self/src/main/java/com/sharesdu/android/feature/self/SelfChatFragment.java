package com.sharesdu.android.feature.self;

import android.content.Intent;
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
import com.sharesdu.android.common.adapter.ChatUserAdapter;
import com.sharesdu.android.core.network.ApiClient;
import com.sharesdu.android.core.network.MessageService;
import com.sharesdu.android.core.network.response.ChatUsersResponse;
import com.sharesdu.android.core.utils.ErrorHandler;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 私信页面 Fragment
 * 显示聊天用户列表
 */
public class SelfChatFragment extends Fragment {
    private static final String TAG = "SelfChatFragment";
    
    private SwipeRefreshLayout swipeRefreshLayout;
    private RecyclerView recyclerView;
    private ProgressBar progressBar;
    private TextView tvEmpty;
    private FrameLayout loadingView;
    
    private ChatUserAdapter adapter;
    private MessageService messageService;
    
    private List<Map<String, Object>> chatUserList = new ArrayList<>();
    
    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_self_chat, container, false);
        
        swipeRefreshLayout = view.findViewById(R.id.swipe_refresh);
        recyclerView = view.findViewById(R.id.recycler_view);
        progressBar = view.findViewById(R.id.progress_bar);
        tvEmpty = view.findViewById(R.id.tv_empty);
        loadingView = view.findViewById(R.id.loading_view);
        
        messageService = ApiClient.getRetrofit().create(MessageService.class);
        
        return view;
    }
    
    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        
        setupRecyclerView();
        setupSwipeRefresh();
        
        // 初始加载
        loadChatUsers();
    }
    
    private void setupRecyclerView() {
        adapter = new ChatUserAdapter(getContext(), new ChatUserAdapter.OnChatUserClickListener() {
            @Override
            public void onChatUserClick(Map<String, Object> chatUser) {
                // TODO: 打开聊天详情页面
                // Intent intent = new Intent(getContext(), ChatDetailActivity.class);
                // Object userIdObj = chatUser.get("user_id");
                // if (userIdObj != null) {
                //     Integer userId = userIdObj instanceof Integer ? (Integer) userIdObj :
                //         (userIdObj instanceof Number ? ((Number) userIdObj).intValue() : null);
                //     if (userId != null) {
                //         intent.putExtra("user_id", userId);
                //         startActivity(intent);
                //     }
                // }
            }
        });
        recyclerView.setLayoutManager(new LinearLayoutManager(getContext()));
        recyclerView.setAdapter(adapter);
    }
    
    private void setupSwipeRefresh() {
        swipeRefreshLayout.setOnRefreshListener(() -> {
            loadChatUsers();
        });
    }
    
    /**
     * 加载聊天用户列表
     */
    private void loadChatUsers() {
        showLoadingView();
        
        Call<ChatUsersResponse> call = messageService.getChatUsers();
        call.enqueue(new Callback<ChatUsersResponse>() {
            @Override
            public void onResponse(Call<ChatUsersResponse> call, Response<ChatUsersResponse> response) {
                hideLoadingView();
                swipeRefreshLayout.setRefreshing(false);
                
                if (response.isSuccessful() && response.body() != null) {
                    ChatUsersResponse chatResponse = response.body();
                    if (chatResponse.isSuccess()) {
                        List<Map<String, Object>> users = chatResponse.getData();
                        if (users != null) {
                            chatUserList.clear();
                            chatUserList.addAll(users);
                            adapter.setData(chatUserList);
                            updateUI();
                        } else {
                            chatUserList.clear();
                            adapter.setData(chatUserList);
                            updateUI();
                        }
                    } else {
                        String errorMsg = chatResponse.getMessage();
                        Log.e(TAG, "加载聊天用户失败: " + errorMsg);
                        showError(errorMsg);
                    }
                } else {
                    String errorMsg = ErrorHandler.getErrorMessage(response);
                    Log.e(TAG, "加载聊天用户失败: " + errorMsg);
                    showError(errorMsg);
                }
            }
            
            @Override
            public void onFailure(Call<ChatUsersResponse> call, Throwable t) {
                hideLoadingView();
                swipeRefreshLayout.setRefreshing(false);
                String errorMsg = ErrorHandler.getErrorMessage(t);
                Log.e(TAG, "加载聊天用户网络错误: " + errorMsg, t);
                showError(errorMsg);
            }
        });
    }
    
    private void updateUI() {
        if (chatUserList.isEmpty()) {
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
        if (tvEmpty != null) {
            tvEmpty.setText("加载失败: " + errorMsg);
            tvEmpty.setVisibility(View.VISIBLE);
        }
    }
}
