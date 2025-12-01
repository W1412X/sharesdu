package com.sharesdu.android.common.dialog;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.text.TextUtils;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.Toast;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AlertDialog;
import androidx.fragment.app.FragmentActivity;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;
import com.sharesdu.android.common.R;
import com.sharesdu.android.common.util.ImageUtils;
import com.sharesdu.android.common.util.PostContentHelper;
import com.sharesdu.android.core.network.ApiClient;
import com.sharesdu.android.core.network.ImageService;
import com.sharesdu.android.core.network.PostService;
import com.sharesdu.android.core.network.response.CreateArticlePostResponse;
import com.sharesdu.android.core.network.response.CreateCoursePostResponse;
import com.sharesdu.android.core.network.response.UploadArticleImageResponse;
import com.sharesdu.android.core.network.ApiConfig;
import com.sharesdu.android.core.utils.ErrorHandler;
import com.bumptech.glide.Glide;
import okhttp3.MultipartBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 帖子编辑器对话框
 * 通用组件，可在不同场景复用（普通帖子、文章下帖子、课程下帖子）
 */
public class PostEditorDialog {
    private static final String TAG = "PostEditorDialog";
    
    private FragmentActivity activity;
    private AlertDialog dialog;
    private View dialogView;
    
    private TextInputEditText etTitle;
    private TextInputEditText etContent;
    private LinearLayout layoutImages;
    private MaterialButton btnAddImage;
    private MaterialButton btnSubmit;
    private ProgressBar progressBar;
    
    // 草稿相关
    private String initialTitle = "";
    private String initialContent = "";
    private boolean hasChanges = false;
    
    private PostService postService;
    private ImageService imageService;
    
    private List<ImageItem> imageList = new ArrayList<>();
    private String postType; // "article", "course", or null (普通帖子)
    private String relatedId; // 关联ID（文章ID或课程ID）
    
    // 图片选择回调
    private ActivityResultLauncher<Intent> imagePickerLauncher;
    
    /**
     * 图片项数据类
     */
    private static class ImageItem {
        File file; // 本地文件
        String localUri; // 本地URI（用于显示）
        String remoteUrl; // 远程URL（上传后获得）
        com.sharesdu.android.common.view.ImageCardView imageCardView; // 对应的ImageCardView
    }
    
    /**
     * 回调接口
     */
    public interface OnPostCreatedListener {
        void onPostCreated(String postId, String title, String content);
    }
    
    private OnPostCreatedListener listener;
    
    public PostEditorDialog(FragmentActivity activity) {
        this.activity = activity;
        this.postService = ApiClient.getRetrofit().create(PostService.class);
        this.imageService = ApiClient.getRetrofit().create(ImageService.class);
        
        // 初始化图片选择器
        imagePickerLauncher = activity.registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(),
            result -> {
                if (result.getResultCode() == Activity.RESULT_OK && result.getData() != null) {
                    Uri imageUri = result.getData().getData();
                    if (imageUri != null) {
                        handleImageSelected(imageUri);
                    }
                }
            }
        );
    }
    
    /**
     * 显示对话框
     * @param type 类型（article/course/null）
     * @param id 关联ID
     * @param listener 创建成功的回调
     */
    public void show(@Nullable String type, @Nullable String id, @Nullable OnPostCreatedListener listener) {
        this.postType = type;
        this.relatedId = id;
        this.listener = listener;
        
        dialogView = LayoutInflater.from(activity).inflate(R.layout.dialog_post_editor, null);
        
        initViews();
        setupListeners();
        
        dialog = new AlertDialog.Builder(activity)
            .setView(dialogView)
            .setCancelable(false)
            .create();
        
        dialog.show();
    }
    
    private void initViews() {
        etTitle = dialogView.findViewById(R.id.et_post_title);
        etContent = dialogView.findViewById(R.id.et_post_content);
        layoutImages = dialogView.findViewById(R.id.layout_images);
        btnAddImage = dialogView.findViewById(R.id.btn_add_image);
        btnSubmit = dialogView.findViewById(R.id.btn_submit);
        progressBar = dialogView.findViewById(R.id.progress_bar);
        
        // 监听内容变化，检测是否有编辑
        etTitle.addTextChangedListener(new android.text.TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            
            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                checkForChanges();
            }
            
            @Override
            public void afterTextChanged(android.text.Editable s) {}
        });
        
        etContent.addTextChangedListener(new android.text.TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            
            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                checkForChanges();
            }
            
            @Override
            public void afterTextChanged(android.text.Editable s) {}
        });
        
        // 尝试加载草稿
        loadDraft();
    }
    
    /**
     * 检查内容是否有变化
     */
    private void checkForChanges() {
        String currentTitle = etTitle.getText() != null ? etTitle.getText().toString() : "";
        String currentContent = etContent.getText() != null ? etContent.getText().toString() : "";
        hasChanges = !currentTitle.equals(initialTitle) || !currentContent.equals(initialContent) || !imageList.isEmpty();
    }
    
    /**
     * 加载草稿
     */
    private void loadDraft() {
        try {
            android.content.SharedPreferences prefs = activity.getSharedPreferences("post_draft", Context.MODE_PRIVATE);
            String draftTitle = prefs.getString("draft_title", "");
            String draftContent = prefs.getString("draft_content", "");
            String draftImagesJson = prefs.getString("draft_images", "");
            
            if (!draftTitle.isEmpty() || !draftContent.isEmpty()) {
                etTitle.setText(draftTitle);
                etContent.setText(draftContent);
                initialTitle = draftTitle;
                initialContent = draftContent;
            }
            
            // 加载图片草稿
            if (!draftImagesJson.isEmpty()) {
                try {
                    android.util.JsonReader reader = new android.util.JsonReader(new java.io.StringReader(draftImagesJson));
                    reader.beginArray();
                    while (reader.hasNext()) {
                        reader.beginObject();
                        String filePath = null;
                        String localUri = null;
                        while (reader.hasNext()) {
                            String name = reader.nextName();
                            if (name.equals("file_path")) {
                                filePath = reader.nextString();
                            } else if (name.equals("local_uri")) {
                                localUri = reader.nextString();
                            } else {
                                reader.skipValue();
                            }
                        }
                        reader.endObject();
                        
                        if (filePath != null) {
                            File imageFile = new File(filePath);
                            if (imageFile.exists()) {
                                ImageItem imageItem = new ImageItem();
                                imageItem.file = imageFile;
                                imageItem.localUri = localUri != null ? localUri : "";
                                
                                imageList.add(imageItem);
                                
                                // 创建图片视图
                                com.sharesdu.android.common.view.ImageCardView imageCardView = createImageView(imageItem);
                                imageItem.imageCardView = imageCardView;
                                imageCardView.setVisibility(View.VISIBLE);
                                layoutImages.addView(imageCardView);
                            }
                        }
                    }
                    reader.endArray();
                    reader.close();
                    
                    // 更新所有图片卡片的图片列表
                    updateAllImageCardsList();
                } catch (Exception e) {
                    Log.e(TAG, "加载图片草稿失败", e);
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "加载草稿失败", e);
        }
    }
    
    /**
     * 保存草稿
     */
    private void saveDraft() {
        try {
            String title = etTitle.getText() != null ? etTitle.getText().toString() : "";
            String content = etContent.getText() != null ? etContent.getText().toString() : "";
            
            // 保存图片路径
            java.io.StringWriter stringWriter = new java.io.StringWriter();
            android.util.JsonWriter writer = new android.util.JsonWriter(stringWriter);
            writer.beginArray();
            for (ImageItem item : imageList) {
                if (item.file != null && item.file.exists()) {
                    writer.beginObject();
                    writer.name("file_path").value(item.file.getAbsolutePath());
                    writer.name("local_uri").value(item.localUri != null ? item.localUri : "");
                    writer.endObject();
                }
            }
            writer.endArray();
            writer.close();
            String imagesJson = stringWriter.toString();
            
            android.content.SharedPreferences prefs = activity.getSharedPreferences("post_draft", Context.MODE_PRIVATE);
            android.content.SharedPreferences.Editor editor = prefs.edit();
            editor.putString("draft_title", title);
            editor.putString("draft_content", content);
            editor.putString("draft_images", imagesJson);
            editor.apply();
        } catch (Exception e) {
            Log.e(TAG, "保存草稿失败", e);
        }
    }
    
    /**
     * 清除草稿
     */
    private void clearDraft() {
        try {
            android.content.SharedPreferences prefs = activity.getSharedPreferences("post_draft", Context.MODE_PRIVATE);
            android.content.SharedPreferences.Editor editor = prefs.edit();
            editor.clear();
            editor.apply();
        } catch (Exception e) {
            Log.e(TAG, "清除草稿失败", e);
        }
    }
    
    private void setupListeners() {
        btnAddImage.setOnClickListener(v -> selectImage());
        btnSubmit.setOnClickListener(v -> submitPost());
    }
    
    /**
     * 检查是否需要保存草稿（在退出时调用）
     */
    public void checkAndSaveDraftOnExit() {
        checkForChanges();
        if (hasChanges) {
            // 询问是否保存草稿
            new androidx.appcompat.app.AlertDialog.Builder(activity)
                .setTitle("保存草稿")
                .setMessage("您有未保存的内容，是否保存为草稿？")
                .setPositiveButton("保存", (dialog, which) -> {
                    saveDraft();
                    finishActivity();
                })
                .setNegativeButton("不保存", (dialog, which) -> {
                    clearDraft();
                    finishActivity();
                })
                .setNeutralButton("取消", null)
                .show();
        } else {
            finishActivity();
        }
    }
    
    /**
     * 完成 Activity（关闭 Activity 或对话框）
     */
    private void finishActivity() {
        if (activity instanceof androidx.appcompat.app.AppCompatActivity && dialog == null) {
            ((androidx.appcompat.app.AppCompatActivity) activity).finish();
        } else {
            dismiss();
        }
    }
    
    /**
     * 选择图片
     */
    private void selectImage() {
        Intent intent = new Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
        intent.setType("image/*");
        imagePickerLauncher.launch(intent);
    }
    
    /**
     * 处理选中的图片
     */
    private void handleImageSelected(Uri imageUri) {
        try {
            // 将URI转换为File
            File imageFile = uriToFile(imageUri);
            if (imageFile == null) {
                showError("无法读取图片");
                return;
            }
            
            // 创建ImageItem
            ImageItem imageItem = new ImageItem();
            imageItem.file = imageFile;
            imageItem.localUri = imageUri.toString();
            
            // 创建图片视图（使用ImageCardView）
            imageList.add(imageItem);
            
            // 创建图片视图（需要在添加到列表后创建，以便设置正确的索引）
            com.sharesdu.android.common.view.ImageCardView imageCardView = createImageView(imageItem);
            imageItem.imageCardView = imageCardView;
            
            // 确保 ImageCardView 可见
            imageCardView.setVisibility(View.VISIBLE);
            
            // 添加到布局
            layoutImages.addView(imageCardView);
            
            // 更新所有图片卡片的图片列表（因为列表已更新）
            updateAllImageCardsList();
            
            // 标记有变化（添加图片也算编辑）
            checkForChanges();
            
        } catch (Exception e) {
            Log.e(TAG, "处理图片失败", e);
            showError("图片处理失败：" + e.getMessage());
        }
    }
    
    /**
     * 将URI转换为File
     */
    private File uriToFile(Uri uri) {
        try {
            InputStream inputStream = activity.getContentResolver().openInputStream(uri);
            if (inputStream == null) {
                return null;
            }
            
            File tempFile = new File(activity.getCacheDir(), "temp_image_" + System.currentTimeMillis() + ".jpg");
            FileOutputStream outputStream = new FileOutputStream(tempFile);
            
            byte[] buffer = new byte[4096];
            int bytesRead;
            while ((bytesRead = inputStream.read(buffer)) != -1) {
                outputStream.write(buffer, 0, bytesRead);
            }
            
            outputStream.close();
            inputStream.close();
            
            return tempFile;
        } catch (Exception e) {
            Log.e(TAG, "URI转File失败", e);
            return null;
        }
    }
    
    /**
     * 创建图片视图（使用ImageCardView）
     */
    private com.sharesdu.android.common.view.ImageCardView createImageView(ImageItem imageItem) {
        com.sharesdu.android.common.view.ImageCardView imageCardView = 
            new com.sharesdu.android.common.view.ImageCardView(activity);
        
        // 先设置 LayoutParams，确保视图有正确的尺寸
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.WRAP_CONTENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        );
        params.setMargins(0, 0, (int) (8 * activity.getResources().getDisplayMetrics().density), 0);
        imageCardView.setLayoutParams(params);
        
        // 设置图片尺寸
        imageCardView.setImageSize(100, 100);
        
        // 设置为可编辑模式（显示删除按钮）
        imageCardView.setEditable(true);
        
        // 设置为可点击放大查看
        imageCardView.setClickable(true);
        
        // 确保视图可见
        imageCardView.setVisibility(View.VISIBLE);
        
        // 设置图片文件
        imageCardView.setImageFile(imageItem.file);
        
        // 设置图片列表和索引，支持多图滑动查看
        java.util.List<String> imageUrls = new java.util.ArrayList<>();
        for (ImageItem item : imageList) {
            if (item.file != null && item.file.exists()) {
                imageUrls.add(item.file.getAbsolutePath());
            }
        }
        int index = imageList.indexOf(imageItem);
        if (index >= 0) {
            imageCardView.setImageList(imageUrls, index);
        }
        
        // 设置删除按钮回调
        imageCardView.setOnDeleteClickListener(view -> removeImage(imageItem));
        
        return imageCardView;
    }
    
    /**
     * 移除图片
     */
    private void removeImage(ImageItem imageItem) {
        imageList.remove(imageItem);
        if (imageItem.imageCardView != null) {
            layoutImages.removeView(imageItem.imageCardView);
        }
        
        // 删除临时文件
        if (imageItem.file != null && imageItem.file.exists()) {
            imageItem.file.delete();
        }
        
        // 更新所有图片卡片的图片列表（因为列表已更新）
        updateAllImageCardsList();
    }
    
    /**
     * 更新所有图片卡片的图片列表
     */
    private void updateAllImageCardsList() {
        java.util.List<String> imageUrls = new java.util.ArrayList<>();
        for (ImageItem item : imageList) {
            if (item.file != null && item.file.exists()) {
                imageUrls.add(item.file.getAbsolutePath());
            }
        }
        
        for (int i = 0; i < imageList.size(); i++) {
            ImageItem item = imageList.get(i);
            if (item.imageCardView != null) {
                item.imageCardView.setImageList(imageUrls, i);
            }
        }
    }
    
    /**
     * 提交帖子
     */
    private void submitPost() {
        String title = etTitle.getText() != null ? etTitle.getText().toString().trim() : "";
        String content = etContent.getText() != null ? etContent.getText().toString().trim() : "";
        
        // 验证标题
        if (TextUtils.isEmpty(title) || title.length() <= 2) {
            showError("标题过短，至少需要3个字符");
            return;
        }
        
        // 验证内容
        if (TextUtils.isEmpty(content) || content.length() <= 2) {
            showError("内容过短，至少需要3个字符");
            return;
        }
        
        // 显示加载状态
        setLoading(true);
        
        // 先上传所有图片
        uploadImagesAndSubmit(title, content);
    }
    
    /**
     * 上传图片并提交帖子
     */
    private void uploadImagesAndSubmit(String title, String content) {
        if (imageList.isEmpty()) {
            // 没有图片，直接提交
            submitPostContent(title, content);
            return;
        }
        
        // 上传图片（异步）
        uploadImagesSequentially(0, title, content);
    }
    
    /**
     * 依次上传图片
     */
    private void uploadImagesSequentially(int index, String title, String content) {
        if (index >= imageList.size()) {
            // 所有图片上传完成，提交帖子
            submitPostContent(title, content);
            return;
        }
        
        final ImageItem imageItem = imageList.get(index);
        final String currentContent = content; // 创建final副本
        
        // 压缩图片
        try {
            final File compressedFile = ImageUtils.compressImage(imageItem.file, 4 * 1024);
            
            // 准备上传
            okhttp3.RequestBody requestBody = okhttp3.RequestBody.create(
                okhttp3.MediaType.parse("image/jpeg"),
                compressedFile
            );
            MultipartBody.Part imagePart = MultipartBody.Part.createFormData(
                "image",
                compressedFile.getName(),
                requestBody
            );
            
            // 上传图片
            Call<UploadArticleImageResponse> call = imageService.uploadArticleImage(imagePart);
            call.enqueue(new Callback<UploadArticleImageResponse>() {
                @Override
                public void onResponse(Call<UploadArticleImageResponse> call, Response<UploadArticleImageResponse> response) {
                    if (response.isSuccessful() && response.body() != null) {
                        UploadArticleImageResponse uploadResponse = response.body();
                        if (uploadResponse.isSuccess()) {
                            String imageUrl = uploadResponse.getImage_url();
                            if (imageUrl != null && !imageUrl.isEmpty()) {
                                imageItem.remoteUrl = imageUrl;
                                
                                // 将图片URL嵌入到内容中
                                String imageUrlString = PostContentHelper.buildImageUrl(imageUrl);
                                String newContent = currentContent + imageUrlString;
                                
                                // 继续上传下一张图片
                                uploadImagesSequentially(index + 1, title, newContent);
                            } else {
                                setLoading(false);
                                showError("图片上传失败：响应数据格式错误");
                            }
                        } else {
                            setLoading(false);
                            String errorMsg = ErrorHandler.getErrorMessage(response);
                            showError("图片上传失败：" + errorMsg);
                        }
                    } else {
                        setLoading(false);
                        String errorMsg = ErrorHandler.getErrorMessage(response);
                        showError("图片上传失败：" + errorMsg);
                    }
                    
                    // 删除压缩后的临时文件
                    if (compressedFile.exists() && !compressedFile.equals(imageItem.file)) {
                        compressedFile.delete();
                    }
                }
                
                @Override
                public void onFailure(Call<UploadArticleImageResponse> call, Throwable t) {
                    setLoading(false);
                    String errorMsg = ErrorHandler.getErrorMessage(t);
                    showError("图片上传失败：" + errorMsg);
                    Log.e(TAG, "图片上传失败", t);
                    
                    // 删除压缩后的临时文件
                    try {
                        if (compressedFile.exists() && !compressedFile.equals(imageItem.file)) {
                            compressedFile.delete();
                        }
                    } catch (Exception e) {
                        // 忽略删除失败
                    }
                }
            });
            
        } catch (Exception e) {
            setLoading(false);
            showError("图片压缩失败：" + e.getMessage());
            Log.e(TAG, "图片压缩失败", e);
        }
    }
    
    /**
     * 提交帖子内容
     */
    private void submitPostContent(String title, String content) {
        // 处理内容链接（如果是关联帖子）
        if (postType != null && relatedId != null) {
            content = PostContentHelper.addLinkToPost(content, postType, relatedId);
        }
        
        Map<String, Object> requestBody = new HashMap<>();
        
        if ("article".equals(postType)) {
            requestBody.put("article_id", Integer.parseInt(relatedId));
            requestBody.put("post_title", title);
            requestBody.put("post_content", content);
            
            Call<CreateArticlePostResponse> call = postService.createArticlePost(requestBody);
            call.enqueue(createArticlePostCallback(title, content));
            
        } else if ("course".equals(postType)) {
            requestBody.put("course_id", Integer.parseInt(relatedId));
            requestBody.put("post_title", title);
            requestBody.put("post_content", content);
            
            Call<CreateCoursePostResponse> call = postService.createCoursePost(requestBody);
            call.enqueue(createCoursePostCallback(title, content));
            
        } else {
            // 普通帖子（在默认文章下发布）
            requestBody.put("article_id", 20);
            requestBody.put("post_title", title);
            requestBody.put("post_content", content);
            
            Call<CreateArticlePostResponse> call = postService.createArticlePost(requestBody);
            call.enqueue(createArticlePostCallback(title, content));
        }
    }
    
    /**
     * 创建文章帖子回调
     */
    private Callback<CreateArticlePostResponse> createArticlePostCallback(String title, String content) {
        return new Callback<CreateArticlePostResponse>() {
            @Override
            public void onResponse(Call<CreateArticlePostResponse> call, Response<CreateArticlePostResponse> response) {
                setLoading(false);
                
                if (response.isSuccessful() && response.body() != null) {
                    CreateArticlePostResponse postResponse = response.body();
                    if (postResponse.isSuccess()) {
                        String postId = null;
                        if (postResponse.getPost_id() != null) {
                            postId = postResponse.getPost_id().toString();
                        }
                        
                        showSuccess("帖子发布成功");
                        
                        // 清除草稿（发布成功后）
                        clearDraft();
                        
                        // 回调
                        if (listener != null && postId != null) {
                            listener.onPostCreated(postId, title, content);
                        }
                        
                        // 如果在 Activity 中使用，不调用 dismiss（让回调处理关闭）
                        // 如果在对话框中，关闭对话框
                        if (dialog != null && dialog.isShowing()) {
                            dismiss();
                        }
                    } else {
                        String errorMsg = ErrorHandler.getErrorMessage(response);
                        showError("发布失败：" + errorMsg);
                    }
                } else {
                    String errorMsg = ErrorHandler.getErrorMessage(response);
                    showError("发布失败：" + errorMsg);
                }
            }
            
            @Override
            public void onFailure(Call<CreateArticlePostResponse> call, Throwable t) {
                setLoading(false);
                String errorMsg = ErrorHandler.getErrorMessage(t);
                showError("发布失败：" + errorMsg);
                Log.e(TAG, "发布帖子失败", t);
            }
        };
    }
    
    /**
     * 创建课程帖子回调
     */
    private Callback<CreateCoursePostResponse> createCoursePostCallback(String title, String content) {
        return new Callback<CreateCoursePostResponse>() {
            @Override
            public void onResponse(Call<CreateCoursePostResponse> call, Response<CreateCoursePostResponse> response) {
                setLoading(false);
                
                if (response.isSuccessful() && response.body() != null) {
                    CreateCoursePostResponse postResponse = response.body();
                    if (postResponse.isSuccess()) {
                        String postId = null;
                        if (postResponse.getPost_id() != null) {
                            postId = postResponse.getPost_id().toString();
                        }
                        
                        showSuccess("帖子发布成功");
                        
                        // 清除草稿（发布成功后）
                        clearDraft();
                        
                        // 回调
                        if (listener != null && postId != null) {
                            listener.onPostCreated(postId, title, content);
                        }
                        
                        // 如果在 Activity 中使用，不调用 dismiss（让回调处理关闭）
                        // 如果在对话框中，关闭对话框
                        if (dialog != null && dialog.isShowing()) {
                            dismiss();
                        }
                    } else {
                        String errorMsg = ErrorHandler.getErrorMessage(response);
                        showError("发布失败：" + errorMsg);
                    }
                } else {
                    String errorMsg = ErrorHandler.getErrorMessage(response);
                    showError("发布失败：" + errorMsg);
                }
            }
            
            @Override
            public void onFailure(Call<CreateCoursePostResponse> call, Throwable t) {
                setLoading(false);
                String errorMsg = ErrorHandler.getErrorMessage(t);
                showError("发布失败：" + errorMsg);
                Log.e(TAG, "发布帖子失败", t);
            }
        };
    }
    
    private void setLoading(boolean loading) {
        progressBar.setVisibility(loading ? View.VISIBLE : View.GONE);
        btnSubmit.setEnabled(!loading);
        btnAddImage.setEnabled(!loading);
        etTitle.setEnabled(!loading);
        etContent.setEnabled(!loading);
    }
    
    private void showError(String message) {
        Toast.makeText(activity, message, Toast.LENGTH_SHORT).show();
    }
    
    private void showSuccess(String message) {
        Toast.makeText(activity, message, Toast.LENGTH_SHORT).show();
    }
    
    public void dismiss() {
        if (dialog != null && dialog.isShowing()) {
            dialog.dismiss();
        } else if (activity instanceof androidx.appcompat.app.AppCompatActivity) {
            // 如果在 Activity 中使用，关闭 Activity
            ((androidx.appcompat.app.AppCompatActivity) activity).finish();
        }
        
        // 清理临时文件
        for (ImageItem imageItem : imageList) {
            if (imageItem.file != null && imageItem.file.exists()) {
                imageItem.file.delete();
            }
        }
        imageList.clear();
    }
    
    /**
     * 获取对话框视图（用于在 Activity 中显示）
     * @return 对话框视图
     */
    public View getDialogView() {
        return dialogView;
    }
    
    /**
     * 在 Activity 中使用（不显示对话框）
     * @param type 类型（article/course/null）
     * @param id 关联ID
     * @param listener 创建成功的回调
     * @return 编辑器视图
     */
    public View setupForActivity(@Nullable String type, @Nullable String id, @Nullable OnPostCreatedListener listener) {
        this.postType = type;
        this.relatedId = id;
        this.listener = listener;
        
        dialogView = LayoutInflater.from(activity).inflate(R.layout.dialog_post_editor, null);
        
        initViews();
        setupListeners();
        
        return dialogView;
    }
}

