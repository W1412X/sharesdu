package com.sharesdu.android.common.dialog;

import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.DisplayMetrics;
import android.view.KeyEvent;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.widget.ImageButton;
import android.widget.ProgressBar;
import android.widget.Toast;
import androidx.annotation.NonNull;
import android.app.Dialog;
import androidx.fragment.app.FragmentActivity;
import androidx.recyclerview.widget.RecyclerView;
import androidx.viewpager2.widget.ViewPager2;
import com.bumptech.glide.Glide;
import com.bumptech.glide.request.target.SimpleTarget;
import com.bumptech.glide.request.transition.Transition;
import com.github.chrisbanes.photoview.PhotoView;
import com.sharesdu.android.common.R;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;

/**
 * 图片查看器对话框
 * 支持多图滑动查看、特定缩放逻辑、保存功能
 */
public class ImageViewerDialog {
    private FragmentActivity activity;
    private Dialog dialog;
    private View dialogView;
    
    private ViewPager2 viewPager;
    private ImageButton btnClose;
    private ImageButton btnSave;
    private ProgressBar progressBar;
    
    private List<String> imageUrls;
    private int currentPosition = 0;
    private ImagePagerAdapter adapter;
    
    public ImageViewerDialog(FragmentActivity activity) {
        this.activity = activity;
    }
    
    /**
     * 显示单张图片
     * @param imageUrl 图片URL
     */
    public void show(String imageUrl) {
        List<String> urls = new ArrayList<>();
        urls.add(imageUrl);
        show(urls, 0);
    }
    
    /**
     * 显示多张图片（支持滑动）
     * @param imageUrls 图片URL列表
     * @param initialPosition 初始显示位置
     */
    public void show(List<String> imageUrls, int initialPosition) {
        if (imageUrls == null || imageUrls.isEmpty()) {
            Toast.makeText(activity, "图片地址无效", Toast.LENGTH_SHORT).show();
            return;
        }
        
        this.imageUrls = new ArrayList<>(imageUrls);
        this.currentPosition = Math.max(0, Math.min(initialPosition, imageUrls.size() - 1));
        
        dialogView = LayoutInflater.from(activity).inflate(R.layout.dialog_image_viewer, null);
        
        initViews();
        setupViewPager();
        
        // 使用 Dialog 而不是 AlertDialog，以便更好地控制全屏
        dialog = new Dialog(activity, android.R.style.Theme_Black_NoTitleBar_Fullscreen);
        dialog.setContentView(dialogView);
        dialog.setCancelable(true);
        dialog.setOnKeyListener((dialog, keyCode, event) -> {
            if (keyCode == KeyEvent.KEYCODE_BACK && event.getAction() == KeyEvent.ACTION_UP) {
                dismiss();
                return true;
            }
            return false;
        });
        
        // 在显示前设置窗口参数
        android.view.Window window = dialog.getWindow();
        if (window != null) {
            // 设置全屏标志
            window.setFlags(
                WindowManager.LayoutParams.FLAG_FULLSCREEN,
                WindowManager.LayoutParams.FLAG_FULLSCREEN
            );
            
            // 设置窗口布局参数为全屏
            WindowManager.LayoutParams params = window.getAttributes();
            params.width = WindowManager.LayoutParams.MATCH_PARENT;
            params.height = WindowManager.LayoutParams.MATCH_PARENT;
            params.x = 0;
            params.y = 0;
            window.setAttributes(params);
            
            // 隐藏系统UI（状态栏和导航栏）
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.KITKAT) {
                window.getDecorView().setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                    | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                );
            }
        }
        
        dialog.show();
        
        // 显示后再次确保全屏（防止被系统覆盖）
        if (window != null) {
            window.getDecorView().post(() -> {
                WindowManager.LayoutParams params = window.getAttributes();
                params.width = WindowManager.LayoutParams.MATCH_PARENT;
                params.height = WindowManager.LayoutParams.MATCH_PARENT;
                window.setAttributes(params);
                
                // 确保内容视图填满整个窗口
                View contentView = window.getDecorView().findViewById(android.R.id.content);
                if (contentView != null) {
                    contentView.setPadding(0, 0, 0, 0);
                }
            });
        }
    }
    
    private void initViews() {
        viewPager = dialogView.findViewById(R.id.view_pager);
        btnClose = dialogView.findViewById(R.id.btn_close);
        btnSave = dialogView.findViewById(R.id.btn_save);
        progressBar = dialogView.findViewById(R.id.progress_bar);
        
        // 关闭按钮
        btnClose.setOnClickListener(v -> dismiss());
        
        // 保存按钮
        btnSave.setOnClickListener(v -> saveCurrentImage());
    }
    
    private void setupViewPager() {
        adapter = new ImagePagerAdapter();
        viewPager.setAdapter(adapter);
        viewPager.setCurrentItem(currentPosition, false);
        
        // 监听页面变化，更新保存按钮对应的图片
        viewPager.registerOnPageChangeCallback(new ViewPager2.OnPageChangeCallback() {
                    @Override
            public void onPageSelected(int position) {
                currentPosition = position;
            }
        });
    }
    
    /**
     * 保存当前显示的图片
     */
    private void saveCurrentImage() {
        if (currentPosition < 0 || currentPosition >= imageUrls.size()) {
            return;
        }
        
        String imageUrl = imageUrls.get(currentPosition);
        progressBar.setVisibility(View.VISIBLE);
        btnSave.setEnabled(false);
        
        // 获取图片Bitmap
        Glide.with(activity)
            .asBitmap()
            .load(imageUrl)
            .into(new SimpleTarget<Bitmap>() {
                @Override
                public void onResourceReady(Bitmap bitmap, Transition<? super Bitmap> transition) {
                    progressBar.setVisibility(View.GONE);
                    btnSave.setEnabled(true);
                    
                    if (bitmap == null) {
                        Toast.makeText(activity, "图片数据无效", Toast.LENGTH_SHORT).show();
                        return;
                    }
                    
                    // 保存图片
                    boolean success = saveBitmapToGallery(bitmap);
                    if (success) {
                        Toast.makeText(activity, "图片已保存到相册", Toast.LENGTH_SHORT).show();
                    } else {
                        Toast.makeText(activity, "保存失败，请检查权限", Toast.LENGTH_SHORT).show();
                    }
                }
                
                @Override
                public void onLoadFailed(android.graphics.drawable.Drawable errorDrawable) {
                    super.onLoadFailed(errorDrawable);
                    progressBar.setVisibility(View.GONE);
                    btnSave.setEnabled(true);
                    Toast.makeText(activity, "保存失败", Toast.LENGTH_SHORT).show();
                }
            });
    }
    
    /**
     * 保存Bitmap到相册
     */
    private boolean saveBitmapToGallery(Bitmap bitmap) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            // Android 10+ 使用MediaStore
            ContentValues values = new ContentValues();
            values.put(MediaStore.Images.Media.DISPLAY_NAME, "ShareSDU_" + System.currentTimeMillis() + ".jpg");
            values.put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg");
            values.put(MediaStore.Images.Media.RELATIVE_PATH, Environment.DIRECTORY_PICTURES + "/ShareSDU");
            
            try {
                android.net.Uri uri = activity.getContentResolver().insert(
                    MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
                    values
                );
                
                if (uri != null) {
                    OutputStream outputStream = activity.getContentResolver().openOutputStream(uri);
                    if (outputStream != null) {
                        bitmap.compress(Bitmap.CompressFormat.JPEG, 100, outputStream);
                        outputStream.close();
                        
                        // 通知系统相册更新
                        Intent mediaScanIntent = new Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE);
                        mediaScanIntent.setData(uri);
                        activity.sendBroadcast(mediaScanIntent);
                        
                        return true;
                    }
                }
            } catch (IOException e) {
                android.util.Log.e("ImageViewerDialog", "保存图片失败", e);
                return false;
            }
        } else {
            // Android 9及以下使用传统方式
            try {
                String fileName = "ShareSDU_" + System.currentTimeMillis() + ".jpg";
                File picturesDir = Environment.getExternalStoragePublicDirectory(
                    Environment.DIRECTORY_PICTURES
                );
                File file = new File(picturesDir, "ShareSDU");
                if (!file.exists()) {
                    file.mkdirs();
                }
                
                File imageFile = new File(file, fileName);
                FileOutputStream fos = new FileOutputStream(imageFile);
                bitmap.compress(Bitmap.CompressFormat.JPEG, 100, fos);
                fos.flush();
                fos.close();
                
                // 通知系统相册更新
                Intent mediaScanIntent = new Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE);
                mediaScanIntent.setData(android.net.Uri.fromFile(imageFile));
                activity.sendBroadcast(mediaScanIntent);
                
                return true;
            } catch (IOException e) {
                android.util.Log.e("ImageViewerDialog", "保存图片失败", e);
                return false;
            }
        }
        
        return false;
    }
    
    public void dismiss() {
        if (dialog != null && dialog.isShowing()) {
            dialog.dismiss();
        }
    }
    
    /**
     * ViewPager2 适配器
     */
    private class ImagePagerAdapter extends RecyclerView.Adapter<ImagePagerAdapter.ImageViewHolder> {
        
        @NonNull
        @Override
        public ImageViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_image_viewer, parent, false);
            return new ImageViewHolder(view);
        }
        
        @Override
        public void onBindViewHolder(@NonNull ImageViewHolder holder, int position) {
            String imageUrl = imageUrls.get(position);
            holder.loadImage(imageUrl);
        }
        
        @Override
        public int getItemCount() {
            return imageUrls.size();
        }
        
        /**
         * 图片ViewHolder
         */
        class ImageViewHolder extends RecyclerView.ViewHolder {
            private PhotoView photoView;
            private ProgressBar progressBar;
            
            ImageViewHolder(@NonNull View itemView) {
                super(itemView);
                photoView = itemView.findViewById(R.id.photo_view);
                progressBar = itemView.findViewById(R.id.progress_bar);
                
                // 设置初始缩放类型为 FIT_CENTER
                // PhotoView 会自动处理缩放和居中，无需手动计算
                photoView.setScaleType(android.widget.ImageView.ScaleType.FIT_CENTER);
            }
            
            void loadImage(String imageUrl) {
                progressBar.setVisibility(View.VISIBLE);
                photoView.setVisibility(View.GONE);
                
                // 判断是本地文件还是网络URL
                if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
                    // 网络URL
                    Glide.with(activity)
                        .asBitmap()
                        .load(imageUrl)
                        .into(new SimpleTarget<Bitmap>() {
                            @Override
                            public void onResourceReady(Bitmap bitmap, Transition<? super Bitmap> transition) {
                                setImageWithCustomScale(bitmap);
                            }
                            
                            @Override
                            public void onLoadFailed(android.graphics.drawable.Drawable errorDrawable) {
                                super.onLoadFailed(errorDrawable);
                                progressBar.setVisibility(View.GONE);
                                Toast.makeText(activity, "图片加载失败", Toast.LENGTH_SHORT).show();
                            }
                        });
                } else {
                    // 本地文件路径
                    File imageFile = new File(imageUrl);
                    if (imageFile.exists()) {
                        Glide.with(activity)
                            .asBitmap()
                            .load(imageFile)
                            .into(new SimpleTarget<Bitmap>() {
                                @Override
                                public void onResourceReady(Bitmap bitmap, Transition<? super Bitmap> transition) {
                                    setImageWithCustomScale(bitmap);
                                }
                                
                                @Override
                                public void onLoadFailed(android.graphics.drawable.Drawable errorDrawable) {
                                    super.onLoadFailed(errorDrawable);
                                    progressBar.setVisibility(View.GONE);
                                    Toast.makeText(activity, "图片加载失败", Toast.LENGTH_SHORT).show();
                                }
                            });
                    } else {
                        // 尝试作为URI加载
                        Glide.with(activity)
                            .asBitmap()
                            .load(imageUrl)
                            .into(new SimpleTarget<Bitmap>() {
                                @Override
                                public void onResourceReady(Bitmap bitmap, Transition<? super Bitmap> transition) {
                                    setImageWithCustomScale(bitmap);
                                }
                                
                                @Override
                                public void onLoadFailed(android.graphics.drawable.Drawable errorDrawable) {
                                    super.onLoadFailed(errorDrawable);
                                    progressBar.setVisibility(View.GONE);
                                    Toast.makeText(activity, "图片加载失败", Toast.LENGTH_SHORT).show();
                                }
                            });
                    }
                }
            }
            
            /**
             * 设置图片 - 使用 PhotoView 的默认 FIT_CENTER 行为
             * PhotoView 会自动处理缩放和居中，无需手动计算
             */
            private void setImageWithCustomScale(Bitmap bitmap) {
                if (bitmap == null) {
                    progressBar.setVisibility(View.GONE);
                    return;
                }
                
                // 设置图片 - PhotoView 的 FIT_CENTER 会自动处理缩放和居中
                photoView.setImageBitmap(bitmap);
                
                // 设置缩放范围（允许用户进一步缩放）
                photoView.setMaximumScale(5.0f);
                photoView.setMediumScale(2.0f);
                photoView.setMinimumScale(0.5f);
                
                progressBar.setVisibility(View.GONE);
                photoView.setVisibility(View.VISIBLE);
            }
        }
    }
}
