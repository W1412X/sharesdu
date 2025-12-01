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
import com.google.android.material.button.MaterialButton;
import com.sharesdu.android.feature.self.R;
import com.sharesdu.android.common.adapter.StarFolderAdapter;
import com.sharesdu.android.core.network.ApiClient;
import com.sharesdu.android.core.network.StarService;
import com.sharesdu.android.core.network.response.StarFolderListResponse;
import com.sharesdu.android.core.utils.ErrorHandler;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 收藏页面 Fragment
 * 显示收藏夹列表，每个收藏夹可展开显示收藏内容
 */
public class SelfStarFragment extends Fragment {
    private static final String TAG = "SelfStarFragment";
    
    private SwipeRefreshLayout swipeRefreshLayout;
    private RecyclerView recyclerView;
    private MaterialButton btnCreateFolder;
    private ProgressBar progressBar;
    private TextView tvEmpty;
    private FrameLayout loadingView;
    
    private StarFolderAdapter adapter;
    private StarService starService;
    
    private List<Map<String, Object>> folderList = new ArrayList<>();
    
    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_self_star, container, false);
        
        swipeRefreshLayout = view.findViewById(R.id.swipe_refresh);
        recyclerView = view.findViewById(R.id.recycler_view);
        btnCreateFolder = view.findViewById(R.id.btn_create_folder);
        progressBar = view.findViewById(R.id.progress_bar);
        tvEmpty = view.findViewById(R.id.tv_empty);
        loadingView = view.findViewById(R.id.loading_view);
        
        starService = ApiClient.getRetrofit().create(StarService.class);
        
        return view;
    }
    
    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        
        setupRecyclerView();
        setupSwipeRefresh();
        setupCreateButton();
        
        // 初始加载
        loadFolders();
    }
    
    private void setupRecyclerView() {
        adapter = new StarFolderAdapter(getContext());
        adapter.setOnFolderClickListener(folder -> {
            showFolderDetailDialog(folder);
        });
        adapter.setOnFolderDeleteListener(folder -> {
            showDeleteConfirmDialog(folder);
        });
        recyclerView.setLayoutManager(new LinearLayoutManager(getContext()));
        recyclerView.setAdapter(adapter);
    }
    
    private void setupSwipeRefresh() {
        swipeRefreshLayout.setOnRefreshListener(() -> {
            loadFolders();
        });
    }
    
    private void setupCreateButton() {
        btnCreateFolder.setOnClickListener(v -> {
            showCreateFolderDialog();
        });
    }
    
    /**
     * 显示创建收藏夹对话框
     */
    private void showCreateFolderDialog() {
        android.app.AlertDialog.Builder builder = new android.app.AlertDialog.Builder(getContext());
        View dialogView = LayoutInflater.from(getContext()).inflate(R.layout.dialog_create_star_folder, null);
        builder.setView(dialogView);
        
        android.app.AlertDialog dialog = builder.create();
        
        com.google.android.material.textfield.TextInputEditText etFolderName = 
            dialogView.findViewById(R.id.et_folder_name);
        com.google.android.material.textfield.TextInputEditText etDescription = 
            dialogView.findViewById(R.id.et_description);
        com.google.android.material.button.MaterialButton btnCancel = 
            dialogView.findViewById(R.id.btn_cancel);
        com.google.android.material.button.MaterialButton btnCreate = 
            dialogView.findViewById(R.id.btn_create);
        
        btnCancel.setOnClickListener(v -> dialog.dismiss());
        
        btnCreate.setOnClickListener(v -> {
            String folderName = etFolderName.getText().toString().trim();
            String description = etDescription.getText().toString().trim();
            
            if (folderName.isEmpty()) {
                android.widget.Toast.makeText(getContext(), "请输入收藏夹名称", android.widget.Toast.LENGTH_SHORT).show();
                return;
            }
            
            // 禁用按钮，防止重复点击
            btnCreate.setEnabled(false);
            btnCreate.setText("创建中...");
            
            createStarFolder(folderName, description, dialog, btnCreate);
        });
        
        dialog.show();
    }
    
    /**
     * 创建收藏夹
     */
    private void createStarFolder(String folderName, String description, android.app.AlertDialog dialog, 
                                  com.google.android.material.button.MaterialButton btnCreate) {
        java.util.Map<String, String> requestBody = new java.util.HashMap<>();
        requestBody.put("folder_name", folderName);
        if (!description.isEmpty()) {
            requestBody.put("description", description);
        }
        
        Call<com.sharesdu.android.core.network.response.CreateStarFolderResponse> call = 
            starService.createStarFolder(requestBody);
        call.enqueue(new Callback<com.sharesdu.android.core.network.response.CreateStarFolderResponse>() {
            @Override
            public void onResponse(Call<com.sharesdu.android.core.network.response.CreateStarFolderResponse> call,
                                 Response<com.sharesdu.android.core.network.response.CreateStarFolderResponse> response) {
                // 恢复按钮状态
                if (btnCreate != null) {
                    btnCreate.setEnabled(true);
                    btnCreate.setText("创建");
                }
                
                if (response.isSuccessful() && response.body() != null) {
                    com.sharesdu.android.core.network.response.CreateStarFolderResponse folderResponse = response.body();
                    if (folderResponse.isSuccess()) {
                        // 先关闭对话框
                        dialog.dismiss();
                        // 显示成功提示
                        android.widget.Toast.makeText(getContext(), "创建收藏夹成功", android.widget.Toast.LENGTH_SHORT).show();
                        // 重新加载收藏夹列表
                        loadFolders();
                    } else {
                        String errorMsg = folderResponse.getMessage();
                        if (errorMsg == null || errorMsg.isEmpty()) {
                            errorMsg = "创建收藏夹失败";
                        }
                        android.widget.Toast.makeText(getContext(), errorMsg, android.widget.Toast.LENGTH_SHORT).show();
                    }
                } else {
                    String errorMsg = ErrorHandler.getErrorMessage(response);
                    android.widget.Toast.makeText(getContext(), "创建收藏夹失败: " + errorMsg, android.widget.Toast.LENGTH_SHORT).show();
                }
            }
            
            @Override
            public void onFailure(Call<com.sharesdu.android.core.network.response.CreateStarFolderResponse> call, Throwable t) {
                // 恢复按钮状态
                if (btnCreate != null) {
                    btnCreate.setEnabled(true);
                    btnCreate.setText("创建");
                }
                
                String errorMsg = ErrorHandler.getErrorMessage(t);
                android.widget.Toast.makeText(getContext(), "创建收藏夹网络错误: " + errorMsg, android.widget.Toast.LENGTH_SHORT).show();
            }
        });
    }
    
    /**
     * 加载收藏夹列表
     */
    private void loadFolders() {
        showLoadingView();
        
        Call<StarFolderListResponse> call = starService.getStarFolderList();
        call.enqueue(new Callback<StarFolderListResponse>() {
            @Override
            public void onResponse(Call<StarFolderListResponse> call, Response<StarFolderListResponse> response) {
                hideLoadingView();
                swipeRefreshLayout.setRefreshing(false);
                
                if (response.isSuccessful() && response.body() != null) {
                    StarFolderListResponse folderResponse = response.body();
                    if (folderResponse.isSuccess()) {
                        List<Map<String, Object>> folders = folderResponse.getFolders();
                        if (folders != null) {
                            folderList.clear();
                            folderList.addAll(folders);
                            adapter.setData(folderList);
                            updateUI();
                        } else {
                            folderList.clear();
                            adapter.setData(folderList);
                            updateUI();
                        }
                    } else {
                        String errorMsg = folderResponse.getMessage();
                        Log.e(TAG, "加载收藏夹失败: " + errorMsg);
                        showError(errorMsg);
                    }
                } else {
                    String errorMsg = ErrorHandler.getErrorMessage(response);
                    Log.e(TAG, "加载收藏夹失败: " + errorMsg);
                    showError(errorMsg);
                }
            }
            
            @Override
            public void onFailure(Call<StarFolderListResponse> call, Throwable t) {
                hideLoadingView();
                swipeRefreshLayout.setRefreshing(false);
                String errorMsg = ErrorHandler.getErrorMessage(t);
                Log.e(TAG, "加载收藏夹网络错误: " + errorMsg, t);
                showError(errorMsg);
            }
        });
    }
    
    private void updateUI() {
        if (folderList.isEmpty()) {
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
    
    /**
     * 显示收藏夹详情弹窗
     */
    private void showFolderDetailDialog(Map<String, Object> folder) {
        android.app.AlertDialog.Builder builder = new android.app.AlertDialog.Builder(getContext());
        View dialogView = LayoutInflater.from(getContext()).inflate(R.layout.dialog_star_folder_detail, null);
        builder.setView(dialogView);
        
        android.app.AlertDialog dialog = builder.create();
        
        // 获取视图元素
        TextView tvFolderName = dialogView.findViewById(R.id.tv_folder_name);
        TextView tvFolderDescription = dialogView.findViewById(R.id.tv_folder_description);
        TextView tvNoDescription = dialogView.findViewById(R.id.tv_no_description);
        TextView tvFolderCreateTime = dialogView.findViewById(R.id.tv_folder_create_time);
        RecyclerView recyclerViewItems = dialogView.findViewById(R.id.recycler_view_star_items);
        FrameLayout loadingViewItems = dialogView.findViewById(R.id.loading_view_items);
        TextView tvEmptyItems = dialogView.findViewById(R.id.tv_empty_items);
        View btnCloseHeader = dialogView.findViewById(R.id.btn_close_header);
        com.google.android.material.button.MaterialButton btnDeleteFolder = dialogView.findViewById(R.id.btn_delete_folder);
        
        // 设置基本信息（API返回的字段是 name 而不是 folder_name）
        Object nameObj = folder.get("name");
        if (nameObj == null) {
            // 兼容旧字段名
            nameObj = folder.get("folder_name");
        }
        if (nameObj != null && tvFolderName != null) {
            tvFolderName.setText(nameObj.toString());
        }
        
        // 设置描述
        Object descObj = folder.get("description");
        if (descObj != null && !descObj.toString().trim().isEmpty()) {
            if (tvFolderDescription != null) {
                tvFolderDescription.setText(descObj.toString());
                tvFolderDescription.setVisibility(View.VISIBLE);
            }
            if (tvNoDescription != null) {
                tvNoDescription.setVisibility(View.GONE);
            }
        } else {
            if (tvFolderDescription != null) {
                tvFolderDescription.setVisibility(View.GONE);
            }
            if (tvNoDescription != null) {
                tvNoDescription.setVisibility(View.VISIBLE);
            }
        }
        
        // 设置创建时间
        Object timeObj = folder.get("created_at");
        if (timeObj != null && tvFolderCreateTime != null) {
            String timeStr = StarFolderAdapter.formatTime(timeObj.toString());
            tvFolderCreateTime.setText(timeStr);
        }
        
        // 设置 RecyclerView
        StarItemAdapter itemAdapter = new StarItemAdapter(getContext());
        recyclerViewItems.setLayoutManager(new LinearLayoutManager(getContext()));
        recyclerViewItems.setAdapter(itemAdapter);
        
        // 设置取消收藏回调
        itemAdapter.setOnItemUnstarListener((position, starItem) -> {
            showUnstarConfirmDialog(starItem, itemAdapter, position);
        });
        
        // 关闭按钮（标题栏）
        btnCloseHeader.setOnClickListener(v -> dialog.dismiss());
        
        // 删除按钮
        btnDeleteFolder.setOnClickListener(v -> {
            dialog.dismiss();
            showDeleteConfirmDialog(folder);
        });
        
        // 显示弹窗
        dialog.show();
        
        // 加载收藏项目列表
        loadStarItemsInDialog(folder, itemAdapter, recyclerViewItems, loadingViewItems, tvEmptyItems);
    }
    
    /**
     * 在弹窗中加载收藏项目列表
     */
    private void loadStarItemsInDialog(Map<String, Object> folder, StarItemAdapter adapter,
                                       RecyclerView recyclerView, FrameLayout loadingView, TextView tvEmpty) {
        // 获取收藏夹ID（API返回的字段可能是 id 或 folder_id）
        Object folderIdObj = folder.get("id");
        if (folderIdObj == null) {
            // 尝试使用 folder_id 字段
            folderIdObj = folder.get("folder_id");
        }
        
        if (folderIdObj == null) {
            if (tvEmpty != null) {
                tvEmpty.setText("无法获取收藏夹ID");
                tvEmpty.setVisibility(View.VISIBLE);
            }
            if (loadingView != null) {
                loadingView.setVisibility(View.GONE);
            }
            if (recyclerView != null) {
                recyclerView.setVisibility(View.GONE);
            }
            return;
        }
        
        Integer folderId = folderIdObj instanceof Integer ? (Integer) folderIdObj :
            (folderIdObj instanceof Number ? ((Number) folderIdObj).intValue() : null);
        
        if (folderId == null) {
            if (tvEmpty != null) {
                tvEmpty.setText("收藏夹ID无效");
                tvEmpty.setVisibility(View.VISIBLE);
            }
            if (loadingView != null) {
                loadingView.setVisibility(View.GONE);
            }
            if (recyclerView != null) {
                recyclerView.setVisibility(View.GONE);
            }
            return;
        }
        
        // 显示加载视图
        if (loadingView != null) {
            loadingView.setVisibility(View.VISIBLE);
        }
        if (recyclerView != null) {
            recyclerView.setVisibility(View.GONE);
        }
        if (tvEmpty != null) {
            tvEmpty.setVisibility(View.GONE);
        }
        
        // 加载收藏列表
        Call<com.sharesdu.android.core.network.response.StarListResponse> call = 
            starService.getStarList(folderId, 1, 100); // 加载更多，最多100条
        call.enqueue(new Callback<com.sharesdu.android.core.network.response.StarListResponse>() {
            @Override
            public void onResponse(Call<com.sharesdu.android.core.network.response.StarListResponse> call,
                                 Response<com.sharesdu.android.core.network.response.StarListResponse> response) {
                // 隐藏加载视图
                if (loadingView != null) {
                    loadingView.setVisibility(View.GONE);
                }
                
                if (response.isSuccessful() && response.body() != null) {
                    com.sharesdu.android.core.network.response.StarListResponse starResponse = response.body();
                    if (starResponse.isSuccess()) {
                        List<Map<String, Object>> starList = starResponse.getStar_list();
                        if (starList != null && !starList.isEmpty()) {
                            adapter.setData(starList);
                            if (recyclerView != null) {
                                recyclerView.setVisibility(View.VISIBLE);
                            }
                            if (tvEmpty != null) {
                                tvEmpty.setVisibility(View.GONE);
                            }
                        } else {
                            // 没有收藏项目
                            if (recyclerView != null) {
                                recyclerView.setVisibility(View.GONE);
                            }
                            if (tvEmpty != null) {
                                tvEmpty.setText("暂无收藏项目");
                                tvEmpty.setVisibility(View.VISIBLE);
                            }
                        }
                    } else {
                        String errorMsg = starResponse.getMessage();
                        if (errorMsg == null || errorMsg.isEmpty()) {
                            errorMsg = "加载失败";
                        }
                        if (recyclerView != null) {
                            recyclerView.setVisibility(View.GONE);
                        }
                        if (tvEmpty != null) {
                            tvEmpty.setText(errorMsg);
                            tvEmpty.setVisibility(View.VISIBLE);
                        }
                        Log.e(TAG, "加载收藏列表失败: " + errorMsg);
                    }
                } else {
                    String errorMsg = ErrorHandler.getErrorMessage(response);
                    if (recyclerView != null) {
                        recyclerView.setVisibility(View.GONE);
                    }
                    if (tvEmpty != null) {
                        tvEmpty.setText("加载失败: " + errorMsg);
                        tvEmpty.setVisibility(View.VISIBLE);
                    }
                    Log.e(TAG, "加载收藏列表失败: " + errorMsg);
                }
            }
            
            @Override
            public void onFailure(Call<com.sharesdu.android.core.network.response.StarListResponse> call, Throwable t) {
                // 隐藏加载视图
                if (loadingView != null) {
                    loadingView.setVisibility(View.GONE);
                }
                
                String errorMsg = ErrorHandler.getErrorMessage(t);
                if (recyclerView != null) {
                    recyclerView.setVisibility(View.GONE);
                }
                if (tvEmpty != null) {
                    tvEmpty.setText("加载失败: " + errorMsg);
                    tvEmpty.setVisibility(View.VISIBLE);
                }
                Log.e(TAG, "加载收藏列表网络错误: " + errorMsg, t);
            }
        });
    }
    
    /**
     * 显示删除确认对话框
     */
    private void showDeleteConfirmDialog(Map<String, Object> folder) {
        // 获取收藏夹名称
        Object nameObj = folder.get("name");
        if (nameObj == null) {
            nameObj = folder.get("folder_name");
        }
        String folderName = nameObj != null ? nameObj.toString() : "此收藏夹";
        
        new android.app.AlertDialog.Builder(getContext())
            .setTitle("删除收藏夹")
            .setMessage("确定要删除收藏夹 \"" + folderName + "\" 吗？删除后无法恢复。")
            .setPositiveButton("删除", (dialog, which) -> {
                deleteStarFolder(folder);
            })
            .setNegativeButton("取消", null)
            .show();
    }
    
    /**
     * 删除收藏夹
     */
    private void deleteStarFolder(Map<String, Object> folder) {
        // 获取收藏夹ID
        Object folderIdObj = folder.get("id");
        if (folderIdObj == null) {
            folderIdObj = folder.get("folder_id");
        }
        
        if (folderIdObj == null) {
            android.widget.Toast.makeText(getContext(), "无法获取收藏夹ID", android.widget.Toast.LENGTH_SHORT).show();
            return;
        }
        
        Integer folderId = folderIdObj instanceof Integer ? (Integer) folderIdObj :
            (folderIdObj instanceof Number ? ((Number) folderIdObj).intValue() : null);
        
        if (folderId == null) {
            android.widget.Toast.makeText(getContext(), "收藏夹ID无效", android.widget.Toast.LENGTH_SHORT).show();
            return;
        }
        
        // 显示加载状态
        progressBar.setVisibility(View.VISIBLE);
        
        // 调用删除API
        Call<com.sharesdu.android.core.network.response.SimpleResponse> call = 
            starService.deleteStarFolder(folderId);
        call.enqueue(new Callback<com.sharesdu.android.core.network.response.SimpleResponse>() {
            @Override
            public void onResponse(Call<com.sharesdu.android.core.network.response.SimpleResponse> call,
                                 Response<com.sharesdu.android.core.network.response.SimpleResponse> response) {
                progressBar.setVisibility(View.GONE);
                
                if (response.isSuccessful() && response.body() != null) {
                    com.sharesdu.android.core.network.response.SimpleResponse simpleResponse = response.body();
                    if (simpleResponse.isSuccess()) {
                        android.widget.Toast.makeText(getContext(), "删除收藏夹成功", android.widget.Toast.LENGTH_SHORT).show();
                        // 重新加载收藏夹列表
                        loadFolders();
                    } else {
                        String errorMsg = simpleResponse.getMessage();
                        if (errorMsg == null || errorMsg.isEmpty()) {
                            errorMsg = "删除收藏夹失败";
                        }
                        android.widget.Toast.makeText(getContext(), errorMsg, android.widget.Toast.LENGTH_SHORT).show();
                    }
                } else {
                    String errorMsg = ErrorHandler.getErrorMessage(response);
                    android.widget.Toast.makeText(getContext(), "删除收藏夹失败: " + errorMsg, android.widget.Toast.LENGTH_SHORT).show();
                }
            }
            
            @Override
            public void onFailure(Call<com.sharesdu.android.core.network.response.SimpleResponse> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                
                String errorMsg = ErrorHandler.getErrorMessage(t);
                android.widget.Toast.makeText(getContext(), "删除收藏夹网络错误: " + errorMsg, android.widget.Toast.LENGTH_SHORT).show();
            }
        });
    }
    
    /**
     * 显示取消收藏确认对话框
     */
    private void showUnstarConfirmDialog(Map<String, Object> starItem, StarItemAdapter adapter, int position) {
        // 获取内容名称
        Object nameObj = starItem.get("content_name");
        String contentName = nameObj != null ? nameObj.toString() : "此内容";
        
        new android.app.AlertDialog.Builder(getContext())
            .setTitle("取消收藏")
            .setMessage("确定要取消收藏 \"" + contentName + "\" 吗？")
            .setPositiveButton("取消收藏", (dialog, which) -> {
                unstarContent(starItem, adapter, position);
            })
            .setNegativeButton("取消", null)
            .show();
    }
    
    /**
     * 取消收藏
     */
    private void unstarContent(Map<String, Object> starItem, StarItemAdapter adapter, int position) {
        // 获取内容类型和ID
        Object typeObj = starItem.get("content_type");
        Object idObj = starItem.get("content_id");
        
        if (typeObj == null || idObj == null) {
            android.widget.Toast.makeText(getContext(), "无法获取内容信息", android.widget.Toast.LENGTH_SHORT).show();
            return;
        }
        
        Integer contentType = typeObj instanceof Integer ? (Integer) typeObj :
            (typeObj instanceof Number ? ((Number) typeObj).intValue() : null);
        Integer contentId = idObj instanceof Integer ? (Integer) idObj :
            (idObj instanceof Number ? ((Number) idObj).intValue() : null);
        
        if (contentType == null || contentId == null) {
            android.widget.Toast.makeText(getContext(), "内容信息无效", android.widget.Toast.LENGTH_SHORT).show();
            return;
        }
        
        // 构建请求体
        java.util.Map<String, Integer> requestBody = new java.util.HashMap<>();
        requestBody.put("content_type", contentType);
        requestBody.put("content_id", contentId);
        
        // 调用取消收藏API
        Call<com.sharesdu.android.core.network.response.SimpleResponse> call = 
            starService.unstar(requestBody);
        call.enqueue(new Callback<com.sharesdu.android.core.network.response.SimpleResponse>() {
            @Override
            public void onResponse(Call<com.sharesdu.android.core.network.response.SimpleResponse> call,
                                 Response<com.sharesdu.android.core.network.response.SimpleResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    com.sharesdu.android.core.network.response.SimpleResponse simpleResponse = response.body();
                    if (simpleResponse.isSuccess()) {
                        android.widget.Toast.makeText(getContext(), "取消收藏成功", android.widget.Toast.LENGTH_SHORT).show();
                        // 从列表中移除该项目
                        adapter.removeItem(position);
                    } else {
                        String errorMsg = simpleResponse.getMessage();
                        if (errorMsg == null || errorMsg.isEmpty()) {
                            errorMsg = "取消收藏失败";
                        }
                        android.widget.Toast.makeText(getContext(), errorMsg, android.widget.Toast.LENGTH_SHORT).show();
                    }
                } else {
                    String errorMsg = ErrorHandler.getErrorMessage(response);
                    android.widget.Toast.makeText(getContext(), "取消收藏失败: " + errorMsg, android.widget.Toast.LENGTH_SHORT).show();
                }
            }
            
            @Override
            public void onFailure(Call<com.sharesdu.android.core.network.response.SimpleResponse> call, Throwable t) {
                String errorMsg = ErrorHandler.getErrorMessage(t);
                android.widget.Toast.makeText(getContext(), "取消收藏网络错误: " + errorMsg, android.widget.Toast.LENGTH_SHORT).show();
            }
        });
    }
}
