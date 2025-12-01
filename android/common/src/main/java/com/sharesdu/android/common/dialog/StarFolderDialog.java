package com.sharesdu.android.common.dialog;

import android.text.TextUtils;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.FragmentActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.google.android.material.bottomsheet.BottomSheetDialog;
import com.google.android.material.button.MaterialButton;
import com.sharesdu.android.common.R;
import com.sharesdu.android.core.network.ApiClient;
import com.sharesdu.android.core.network.StarService;
import com.sharesdu.android.core.network.response.CreateStarFolderResponse;
import com.sharesdu.android.core.network.response.SimpleResponse;
import com.sharesdu.android.core.network.response.StarFolderListResponse;
import com.sharesdu.android.core.utils.ErrorHandler;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 收藏夹选择对话框
 * 显示用户所有收藏夹，允许选择收藏夹并添加内容
 */
public class StarFolderDialog {
    private static final String TAG = "StarFolderDialog";
    
    private FragmentActivity activity;
    private BottomSheetDialog dialog;
    private View dialogView;
    
    private MaterialButton btnCreateFolder;
    private RecyclerView recyclerViewFolders;
    private TextView tvEmptyFolders;
    private ProgressBar progressBar;
    
    private StarService starService;
    private FolderAdapter folderAdapter;
    
    private List<StarFolder> folderList = new ArrayList<>();
    private Integer contentType; // 0: 课程, 1: 文章, 2: 帖子
    private Integer contentId;
    
    // 回调接口
    public interface OnStarSuccessListener {
        void onStarSuccess();
    }
    
    private OnStarSuccessListener onStarSuccessListener;
    
    /**
     * 收藏夹数据类
     */
    public static class StarFolder {
        private Integer id;
        private String name;
        private String description;
        private Integer starCount;
        private String createTime;
        
        public StarFolder() {}
        
        public StarFolder(Integer id, String name, String description, Integer starCount, String createTime) {
            this.id = id;
            this.name = name;
            this.description = description;
            this.starCount = starCount;
            this.createTime = createTime;
        }
        
        public Integer getId() { return id; }
        public void setId(Integer id) { this.id = id; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public Integer getStarCount() { return starCount; }
        public void setStarCount(Integer starCount) { this.starCount = starCount; }
        
        public String getCreateTime() { return createTime; }
        public void setCreateTime(String createTime) { this.createTime = createTime; }
    }
    
    public StarFolderDialog(FragmentActivity activity) {
        this.activity = activity;
        this.starService = ApiClient.getRetrofit().create(StarService.class);
    }
    
    /**
     * 显示对话框
     * @param contentType 内容类型：0-课程, 1-文章, 2-帖子
     * @param contentId 内容ID
     * @param listener 收藏成功回调
     */
    public void show(Integer contentType, Integer contentId, @Nullable OnStarSuccessListener listener) {
        this.contentType = contentType;
        this.contentId = contentId;
        this.onStarSuccessListener = listener;
        
        dialogView = LayoutInflater.from(activity).inflate(R.layout.dialog_star_folder, null);
        
        initViews();
        setupListeners();
        
        dialog = new BottomSheetDialog(activity);
        dialog.setContentView(dialogView);
        dialog.setCancelable(true);
        
        // 设置最大高度为屏幕的70%
        Window window = dialog.getWindow();
        if (window != null) {
            WindowManager.LayoutParams params = window.getAttributes();
            params.height = (int) (activity.getResources().getDisplayMetrics().heightPixels * 0.7);
            window.setAttributes(params);
        }
        
        dialog.show();
        
        // 加载收藏夹列表
        loadFolders();
    }
    
    private void initViews() {
        btnCreateFolder = dialogView.findViewById(R.id.btn_create_folder);
        recyclerViewFolders = dialogView.findViewById(R.id.recycler_view_folders);
        tvEmptyFolders = dialogView.findViewById(R.id.tv_empty_folders);
        progressBar = dialogView.findViewById(R.id.progress_bar);
        
        // 设置收藏夹列表
        folderAdapter = new FolderAdapter();
        recyclerViewFolders.setLayoutManager(new LinearLayoutManager(activity));
        recyclerViewFolders.setAdapter(folderAdapter);
    }
    
    private void setupListeners() {
        if (btnCreateFolder != null) {
            btnCreateFolder.setOnClickListener(v -> showCreateFolderDialog());
        }
    }
    
    /**
     * 加载收藏夹列表
     */
    private void loadFolders() {
        progressBar.setVisibility(View.VISIBLE);
        tvEmptyFolders.setVisibility(View.GONE);
        
        Call<StarFolderListResponse> call = starService.getStarFolderList();
        call.enqueue(new Callback<StarFolderListResponse>() {
            @Override
            public void onResponse(Call<StarFolderListResponse> call, Response<StarFolderListResponse> response) {
                progressBar.setVisibility(View.GONE);
                
                if (response.isSuccessful() && response.body() != null) {
                    StarFolderListResponse folderResponse = response.body();
                    if (folderResponse.isSuccess()) {
                        List<Map<String, Object>> folders = folderResponse.getFolders();
                        if (folders != null && !folders.isEmpty()) {
                            folderList.clear();
                            for (Map<String, Object> folderMap : folders) {
                                StarFolder folder = parseFolderFromMap(folderMap);
                                if (folder != null) {
                                    folderList.add(folder);
                                }
                            }
                            folderAdapter.notifyDataSetChanged();
                            updateEmptyState();
                        } else {
                            folderList.clear();
                            folderAdapter.notifyDataSetChanged();
                            updateEmptyState();
                        }
                    } else {
                        String errorMsg = folderResponse.getMessage();
                        if (errorMsg == null || errorMsg.isEmpty()) {
                            errorMsg = "加载收藏夹失败";
                        }
                        Toast.makeText(activity, errorMsg, Toast.LENGTH_SHORT).show();
                        updateEmptyState();
                    }
                } else {
                    String errorMsg = ErrorHandler.getErrorMessage(response);
                    Toast.makeText(activity, "加载收藏夹失败：" + errorMsg, Toast.LENGTH_SHORT).show();
                    updateEmptyState();
                }
            }
            
            @Override
            public void onFailure(Call<StarFolderListResponse> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                String errorMsg = ErrorHandler.getErrorMessage(t);
                Toast.makeText(activity, "加载收藏夹失败：" + errorMsg, Toast.LENGTH_SHORT).show();
                Log.e(TAG, "加载收藏夹失败", t);
                updateEmptyState();
            }
        });
    }
    
    /**
     * 从Map解析StarFolder对象
     */
    private StarFolder parseFolderFromMap(Map<String, Object> map) {
        if (map == null) {
            return null;
        }
        
        StarFolder folder = new StarFolder();
        
        // ID
        if (map.containsKey("id")) {
            Object idObj = map.get("id");
            if (idObj instanceof Number) {
                folder.setId(((Number) idObj).intValue());
            }
        }
        
        // 名称
        if (map.containsKey("name")) {
            Object nameObj = map.get("name");
            if (nameObj != null) {
                folder.setName(nameObj.toString());
            }
        }
        
        // 描述
        if (map.containsKey("description")) {
            Object descObj = map.get("description");
            if (descObj != null) {
                folder.setDescription(descObj.toString());
            }
        }
        
        // 收藏数量
        if (map.containsKey("star_count")) {
            Object countObj = map.get("star_count");
            if (countObj instanceof Number) {
                folder.setStarCount(((Number) countObj).intValue());
            }
        }
        
        // 创建时间
        if (map.containsKey("created_at")) {
            Object timeObj = map.get("created_at");
            if (timeObj != null) {
                folder.setCreateTime(timeObj.toString());
            }
        }
        
        return folder;
    }
    
    /**
     * 更新空状态显示
     */
    private void updateEmptyState() {
        if (tvEmptyFolders != null) {
            tvEmptyFolders.setVisibility(folderList.isEmpty() ? View.VISIBLE : View.GONE);
        }
    }
    
    /**
     * 显示创建收藏夹对话框
     */
    private void showCreateFolderDialog() {
        View createDialogView = LayoutInflater.from(activity).inflate(R.layout.dialog_create_star_folder, null);
        
        com.google.android.material.textfield.TextInputEditText etFolderName = 
            createDialogView.findViewById(R.id.et_folder_name);
        com.google.android.material.textfield.TextInputEditText etFolderDescription = 
            createDialogView.findViewById(R.id.et_folder_description);
        MaterialButton btnCancel = createDialogView.findViewById(R.id.btn_cancel);
        MaterialButton btnCreate = createDialogView.findViewById(R.id.btn_create);
        ProgressBar progressBar = createDialogView.findViewById(R.id.progress_bar);
        
        BottomSheetDialog createDialog = new BottomSheetDialog(activity);
        createDialog.setContentView(createDialogView);
        createDialog.setCancelable(true);
        
        btnCancel.setOnClickListener(v -> createDialog.dismiss());
        
        btnCreate.setOnClickListener(v -> {
            String folderName = etFolderName.getText() != null ? 
                etFolderName.getText().toString().trim() : "";
            String folderDescription = etFolderDescription.getText() != null ? 
                etFolderDescription.getText().toString().trim() : "";
            
            if (TextUtils.isEmpty(folderName)) {
                Toast.makeText(activity, "请输入收藏夹名称", Toast.LENGTH_SHORT).show();
                return;
            }
            
            progressBar.setVisibility(View.VISIBLE);
            btnCreate.setEnabled(false);
            btnCancel.setEnabled(false);
            
            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("folder_name", folderName);
            if (!folderDescription.isEmpty()) {
                requestBody.put("description", folderDescription);
            }
            
            Call<CreateStarFolderResponse> call = starService.createStarFolder(requestBody);
            call.enqueue(new Callback<CreateStarFolderResponse>() {
                @Override
                public void onResponse(Call<CreateStarFolderResponse> call, Response<CreateStarFolderResponse> response) {
                    progressBar.setVisibility(View.GONE);
                    btnCreate.setEnabled(true);
                    btnCancel.setEnabled(true);
                    
                    if (response.isSuccessful() && response.body() != null) {
                        CreateStarFolderResponse createResponse = response.body();
                        if (createResponse.isSuccess()) {
                            Toast.makeText(activity, "创建成功", Toast.LENGTH_SHORT).show();
                            createDialog.dismiss();
                            // 重新加载收藏夹列表
                            loadFolders();
                        } else {
                            String errorMsg = createResponse.getMessage();
                            if (errorMsg == null || errorMsg.isEmpty()) {
                                errorMsg = "创建失败";
                            }
                            Toast.makeText(activity, errorMsg, Toast.LENGTH_SHORT).show();
                        }
                    } else {
                        String errorMsg = ErrorHandler.getErrorMessage(response);
                        Toast.makeText(activity, "创建失败：" + errorMsg, Toast.LENGTH_SHORT).show();
                    }
                }
                
                @Override
                public void onFailure(Call<CreateStarFolderResponse> call, Throwable t) {
                    progressBar.setVisibility(View.GONE);
                    btnCreate.setEnabled(true);
                    btnCancel.setEnabled(true);
                    String errorMsg = ErrorHandler.getErrorMessage(t);
                    Toast.makeText(activity, "创建失败：" + errorMsg, Toast.LENGTH_SHORT).show();
                    Log.e(TAG, "创建收藏夹失败", t);
                }
            });
        });
        
        createDialog.show();
    }
    
    /**
     * 添加收藏
     */
    private void addToFolder(Integer folderId) {
        if (contentType == null || contentId == null) {
            return;
        }
        
        Map<String, Integer> requestBody = new HashMap<>();
        requestBody.put("content_type", contentType);
        requestBody.put("content_id", contentId);
        if (folderId != null) {
            requestBody.put("folder_id", folderId);
        }
        
        Call<SimpleResponse> call = starService.star(requestBody);
        call.enqueue(new Callback<SimpleResponse>() {
            @Override
            public void onResponse(Call<SimpleResponse> call, Response<SimpleResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    SimpleResponse simpleResponse = response.body();
                    if (simpleResponse.isSuccess()) {
                        Toast.makeText(activity, "收藏成功", Toast.LENGTH_SHORT).show();
                        dismiss();
                        if (onStarSuccessListener != null) {
                            onStarSuccessListener.onStarSuccess();
                        }
                    } else {
                        String errorMsg = simpleResponse.getMessage();
                        if (errorMsg == null || errorMsg.isEmpty()) {
                            errorMsg = "收藏失败";
                        }
                        Toast.makeText(activity, errorMsg, Toast.LENGTH_SHORT).show();
                    }
                } else {
                    String errorMsg = ErrorHandler.getErrorMessage(response);
                    Toast.makeText(activity, "收藏失败：" + errorMsg, Toast.LENGTH_SHORT).show();
                }
            }
            
            @Override
            public void onFailure(Call<SimpleResponse> call, Throwable t) {
                String errorMsg = ErrorHandler.getErrorMessage(t);
                Toast.makeText(activity, "收藏失败：" + errorMsg, Toast.LENGTH_SHORT).show();
                Log.e(TAG, "收藏失败", t);
            }
        });
    }
    
    /**
     * 收藏夹列表适配器
     */
    private class FolderAdapter extends RecyclerView.Adapter<FolderAdapter.FolderViewHolder> {
        @Override
        public FolderViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
            View itemView = LayoutInflater.from(activity).inflate(R.layout.item_star_folder_dialog, parent, false);
            return new FolderViewHolder(itemView);
        }
        
        @Override
        public void onBindViewHolder(FolderViewHolder holder, int position) {
            StarFolder folder = folderList.get(position);
            
            holder.tvFolderName.setText(folder.getName() != null ? folder.getName() : "");
            
            if (folder.getDescription() != null && !folder.getDescription().isEmpty()) {
                holder.tvFolderDescription.setText(folder.getDescription());
                holder.tvFolderDescription.setVisibility(View.VISIBLE);
            } else {
                holder.tvFolderDescription.setVisibility(View.GONE);
            }
            
            holder.tvCreateTime.setText(folder.getCreateTime() != null ? folder.getCreateTime() : "");
            holder.tvStarCount.setText((folder.getStarCount() != null ? folder.getStarCount() : 0) + "");
            
            holder.btnAdd.setOnClickListener(v -> addToFolder(folder.getId()));
        }
        
        @Override
        public int getItemCount() {
            return folderList.size();
        }
        
        class FolderViewHolder extends RecyclerView.ViewHolder {
            TextView tvFolderName;
            TextView tvFolderDescription;
            TextView tvCreateTime;
            TextView tvStarCount;
            MaterialButton btnAdd;
            
            FolderViewHolder(View itemView) {
                super(itemView);
                tvFolderName = itemView.findViewById(R.id.tv_folder_name);
                tvFolderDescription = itemView.findViewById(R.id.tv_folder_description);
                tvCreateTime = itemView.findViewById(R.id.tv_create_time);
                tvStarCount = itemView.findViewById(R.id.tv_star_count);
                btnAdd = itemView.findViewById(R.id.btn_add);
            }
        }
    }
    
    public void dismiss() {
        if (dialog != null && dialog.isShowing()) {
            dialog.dismiss();
        }
    }
}



