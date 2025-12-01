package com.sharesdu.android.common.view;

import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.util.AttributeSet;
import android.util.TypedValue;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.ProgressBar;
import androidx.annotation.Nullable;
import com.bumptech.glide.Glide;
import com.bumptech.glide.load.DataSource;
import com.bumptech.glide.load.engine.DiskCacheStrategy;
import com.bumptech.glide.load.engine.GlideException;
import com.bumptech.glide.request.RequestListener;
import com.bumptech.glide.request.RequestOptions;
import com.bumptech.glide.request.target.Target;
import com.sharesdu.android.common.R;
import com.sharesdu.android.core.navigation.NavigationCallback;
import com.sharesdu.android.core.navigation.NavigationManager;
import com.sharesdu.android.common.utils.ImageCache;

/**
 * 图片卡片组件
 * 类似web项目中的ImgCard组件
 * 处理特殊情况：审核中、审核未通过、无图片、默认图片等
 */
public class ImageCardView extends FrameLayout {
    private ImageView ivImage;
    private ProgressBar progressBar;
    private android.widget.ImageButton btnDelete; // 删除按钮（编辑模式）
    private Context context;
    private String imageUrl;
    private boolean clickable = false; // 是否可点击放大
    private boolean editable = false; // 是否可编辑（显示删除按钮）
    private int imageWidth = 120; // 默认宽度（dp）
    private int imageHeight = 120; // 默认高度（dp）
    private Handler mainHandler; // 主线程Handler
    private static final ImageCache imageCache = ImageCache.getGlobalImageCache(); // 图片缓存
    private OnDeleteClickListener onDeleteClickListener; // 删除回调
    private java.util.List<String> allImageUrls; // 所有图片URL列表（用于多图滑动）
    private int imageIndex = 0; // 当前图片在列表中的索引
    
    /**
     * 删除按钮点击回调接口
     */
    public interface OnDeleteClickListener {
        void onDeleteClick(ImageCardView view);
    }
    
    // 图片状态
    private enum ImageState {
        LOADING,
        SUCCESS,
        REVIEWING,      // 审核中
        REVIEW_FAILED,  // 审核未通过
        NOT_FOUND,      // 无图片
        ERROR           // 错误/默认图片
    }
    
    private ImageState currentState = ImageState.LOADING;
    
    public ImageCardView(Context context) {
        super(context);
        this.context = context;
        init();
    }
    
    public ImageCardView(Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
        this.context = context;
        init();
    }
    
    private void init() {
        // 初始化主线程Handler
        mainHandler = new Handler(Looper.getMainLooper());
        
        // 创建ImageView
        ivImage = new ImageView(context);
        FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(
            LayoutParams.MATCH_PARENT,
            LayoutParams.MATCH_PARENT
        );
        ivImage.setLayoutParams(params);
        ivImage.setScaleType(ImageView.ScaleType.CENTER_CROP);
        addView(ivImage);
        
        // 创建进度条
        progressBar = new ProgressBar(context);
        FrameLayout.LayoutParams progressParams = new FrameLayout.LayoutParams(
            LayoutParams.WRAP_CONTENT,
            LayoutParams.WRAP_CONTENT
        );
        progressParams.gravity = android.view.Gravity.CENTER;
        progressBar.setLayoutParams(progressParams);
        progressBar.setVisibility(View.GONE);
        addView(progressBar);
        
        // 创建删除按钮（初始隐藏）
        btnDelete = new android.widget.ImageButton(context);
        FrameLayout.LayoutParams deleteParams = new FrameLayout.LayoutParams(
            (int) (24 * getResources().getDisplayMetrics().density),
            (int) (24 * getResources().getDisplayMetrics().density)
        );
        deleteParams.gravity = android.view.Gravity.TOP | android.view.Gravity.END;
        deleteParams.setMargins(0, (int) (4 * getResources().getDisplayMetrics().density),
            (int) (4 * getResources().getDisplayMetrics().density), 0);
        btnDelete.setLayoutParams(deleteParams);
        btnDelete.setImageResource(R.drawable.ic_close);
        
        // 获取selectableItemBackgroundBorderless属性对应的drawable
        TypedValue typedValue = new TypedValue();
        context.getTheme().resolveAttribute(android.R.attr.selectableItemBackgroundBorderless, typedValue, true);
        if (typedValue.resourceId != 0) {
            btnDelete.setBackgroundResource(typedValue.resourceId);
        }
        
        btnDelete.setContentDescription("删除图片");
        btnDelete.setColorFilter(android.graphics.Color.WHITE);
        btnDelete.setPadding(
            (int) (4 * getResources().getDisplayMetrics().density),
            (int) (4 * getResources().getDisplayMetrics().density),
            (int) (4 * getResources().getDisplayMetrics().density),
            (int) (4 * getResources().getDisplayMetrics().density)
        );
        btnDelete.setVisibility(View.GONE);
        btnDelete.setOnClickListener(v -> {
            // 阻止事件传播
            if (onDeleteClickListener != null) {
                onDeleteClickListener.onDeleteClick(ImageCardView.this);
            }
        });
        // 确保删除按钮在上层（z-index更高）
        btnDelete.setElevation(10f);
        btnDelete.bringToFront();
        // 确保删除按钮不会拦截图片的显示
        btnDelete.setClickable(true);
        btnDelete.setFocusable(true);
        addView(btnDelete);
        
        // 为图片视图设置点击监听（编辑模式下也可以点击放大）
        ivImage.setOnClickListener(v -> {
            if (clickable && currentState == ImageState.SUCCESS && imageUrl != null) {
                openImageViewer();
            }
        });
        
        // 确保图片视图可以接收点击事件
        ivImage.setClickable(true);
        ivImage.setFocusable(false);
        
        // 编辑模式下，阻止整个View接收点击事件（只有图片本身可以点击）
        setClickable(false);
    }
    
    /**
     * 设置图片URL
     * @param url 图片URL
     */
    public void setImageUrl(String url) {
        // 如果URL相同且正在加载或已加载成功，不重复加载
        if (url != null && url.equals(this.imageUrl) && 
            (currentState == ImageState.SUCCESS || currentState == ImageState.LOADING)) {
            return;
        }
        
        // 清除之前的Glide请求，防止显示错误的图片（这是解决图片错乱的关键）
        Glide.with(context).clear(ivImage);
        
        // 重置状态
        currentState = ImageState.LOADING;
        progressBar.setVisibility(View.VISIBLE);
        ivImage.setImageResource(R.drawable.placeholder_image);
        
        this.imageUrl = url;
        
        // 如果URL为空，直接显示占位符
        if (url == null || url.isEmpty()) {
            showPlaceholder(ImageState.NOT_FOUND);
            return;
        }
        
        // 先检查缓存
        String cachedUrl = imageCache.getImage(url);
        if (cachedUrl != null) {
            // 使用缓存的URL加载
            loadImageWithGlide(cachedUrl);
        } else {
            // 直接加载，加载成功后缓存
            loadImageWithGlide(url);
        }
    }
    
    /**
     * 设置是否可点击放大
     * @param clickable true表示可点击放大
     */
    public void setClickable(boolean clickable) {
        this.clickable = clickable;
        if (ivImage != null) {
            ivImage.setClickable(clickable);
        }
        // 编辑模式下，整个View不接收点击事件
        if (!editable) {
            super.setClickable(clickable);
        } else {
            super.setClickable(false);
        }
    }
    
    /**
     * 设置是否可编辑（显示删除按钮）
     * @param editable true表示可编辑，显示删除按钮
     */
    public void setEditable(boolean editable) {
        this.editable = editable;
        if (btnDelete != null) {
            btnDelete.setVisibility(editable ? View.VISIBLE : View.GONE);
        }
        // 更新点击逻辑：编辑模式下，整个View不接收点击事件（只有图片本身可以点击）
        if (ivImage != null) {
            ivImage.setClickable(clickable);
        }
        if (!editable) {
            super.setClickable(clickable);
        } else {
            super.setClickable(false);
        }
    }
    
    /**
     * 设置删除按钮点击回调
     * @param listener 删除回调
     */
    public void setOnDeleteClickListener(OnDeleteClickListener listener) {
        this.onDeleteClickListener = listener;
    }
    
    /**
     * 设置图片尺寸
     * @param width 宽度（dp）
     * @param height 高度（dp）
     */
    public void setImageSize(int width, int height) {
        this.imageWidth = width;
        this.imageHeight = height;
        
        int widthPx = (int) (width * getResources().getDisplayMetrics().density);
        int heightPx = (int) (height * getResources().getDisplayMetrics().density);
        
        // 使用 ViewGroup.LayoutParams 而不是 FrameLayout.LayoutParams
        // 因为 ImageCardView 可能被放在不同类型的父容器中（LinearLayout、FrameLayout等）
        ViewGroup.LayoutParams params = getLayoutParams();
        if (params != null) {
            params.width = widthPx;
            params.height = heightPx;
            setLayoutParams(params);
        } else {
            // 如果没有 LayoutParams，创建一个新的
            params = new ViewGroup.LayoutParams(widthPx, heightPx);
            setLayoutParams(params);
        }
    }
    
    
    
    /**
     * 使用Glide加载图片
     * 简化版本：直接加载，通过错误处理来判断状态
     */
    private void loadImageWithGlide(String url) {
        // 保存当前URL的引用，用于回调时检查
        final String currentUrl = this.imageUrl;
        
        // 再次检查URL是否匹配（防止在异步过程中URL已改变）
        if (currentUrl == null || !url.equals(currentUrl)) {
            return; // URL已改变，取消加载
        }
        
        RequestOptions options = new RequestOptions()
            .placeholder(R.drawable.placeholder_image)
            .error(R.drawable.default_img)
            .diskCacheStrategy(DiskCacheStrategy.ALL)
            .centerCrop()
            .skipMemoryCache(false) // 使用内存缓存提升性能
            .dontAnimate(); // 禁用动画，减少卡顿
        
        Glide.with(context)
            .load(url)
            .apply(options)
            .listener(new RequestListener<android.graphics.drawable.Drawable>() {
                @Override
                public boolean onLoadFailed(@Nullable GlideException e, Object model, Target<android.graphics.drawable.Drawable> target, boolean isFirstResource) {
                    // 检查URL是否仍然匹配
                    if (!url.equals(currentUrl)) {
                        return true; // URL已改变，忽略此回调
                    }
                    
                    mainHandler.post(() -> {
                        currentState = ImageState.ERROR;
                        progressBar.setVisibility(View.GONE);
                        // 根据错误类型显示不同的占位符
                        if (e != null && e.getMessage() != null) {
                            String errorMsg = e.getMessage();
                            if (errorMsg.contains("403") || errorMsg.contains("FROZEN")) {
                                showPlaceholder(ImageState.REVIEWING);
                            } else if (errorMsg.contains("404")) {
                                showPlaceholder(ImageState.NOT_FOUND);
                            } else {
                                showPlaceholder(ImageState.ERROR);
                            }
                        } else {
                            showPlaceholder(ImageState.ERROR);
                        }
                    });
                    return false;
                }
                
                @Override
                public boolean onResourceReady(android.graphics.drawable.Drawable resource, Object model, Target<android.graphics.drawable.Drawable> target, DataSource dataSource, boolean isFirstResource) {
                    // 检查URL是否仍然匹配
                    if (!url.equals(currentUrl)) {
                        return true; // URL已改变，忽略此回调
                    }
                    
                    mainHandler.post(() -> {
                        currentState = ImageState.SUCCESS;
                        progressBar.setVisibility(View.GONE);
                        
                        // 加载成功，缓存URL（如果URL是原始URL，缓存它；如果是处理后的URL，也缓存原始URL）
                        if (currentUrl != null) {
                            imageCache.addImage(currentUrl, url);
                        }
                    });
                    return false;
                }
            })
            .into(ivImage);
    }
    
    /**
     * 显示占位符
     */
    private void showPlaceholder(ImageState state) {
        int placeholderResId;
        switch (state) {
            case REVIEWING:
                placeholderResId = R.drawable.reviewing;
                break;
            case REVIEW_FAILED:
                placeholderResId = R.drawable.review_failed;
                break;
            case NOT_FOUND:
                placeholderResId = R.drawable.no_img;
                break;
            default:
                placeholderResId = R.drawable.default_img;
                break;
        }
        
        ivImage.setImageResource(placeholderResId);
        ivImage.setScaleType(ImageView.ScaleType.CENTER_INSIDE);
    }
    
    /**
     * 设置所有图片URL列表和当前索引（用于多图滑动查看）
     * @param allUrls 所有图片URL列表
     * @param index 当前图片在列表中的索引
     */
    public void setImageList(java.util.List<String> allUrls, int index) {
        this.allImageUrls = allUrls != null ? new java.util.ArrayList<>(allUrls) : null;
        this.imageIndex = index;
    }
    
    /**
     * 打开图片查看器
     */
    private void openImageViewer() {
        if (imageUrl != null && currentState == ImageState.SUCCESS) {
            // 检查context是否是FragmentActivity
            if (context instanceof androidx.fragment.app.FragmentActivity) {
                androidx.fragment.app.FragmentActivity fragmentActivity = 
                    (androidx.fragment.app.FragmentActivity) context;
                com.sharesdu.android.common.dialog.ImageViewerDialog dialog = 
                    new com.sharesdu.android.common.dialog.ImageViewerDialog(fragmentActivity);
                
                // 如果有图片列表，使用多图模式；否则使用单图模式
                if (allImageUrls != null && !allImageUrls.isEmpty()) {
                    dialog.show(allImageUrls, imageIndex);
                } else {
                    dialog.show(imageUrl);
                }
            } else {
                // 降级处理：使用NavigationCallback（如果存在）
                NavigationCallback callback = NavigationManager.getInstance().getNavigationCallback();
                if (callback != null) {
                    callback.navigateToImageViewer(context, imageUrl);
                }
            }
        }
    }
    
    /**
     * 设置图片文件（用于本地文件路径）
     * @param file 图片文件
     */
    public void setImageFile(java.io.File file) {
        if (file != null && file.exists()) {
            setImageUrl(file.getAbsolutePath());
            // 确保视图可见
            setVisibility(View.VISIBLE);
        } else {
            // 文件不存在时显示占位符
            showPlaceholder(ImageState.NOT_FOUND);
        }
    }
    
}

