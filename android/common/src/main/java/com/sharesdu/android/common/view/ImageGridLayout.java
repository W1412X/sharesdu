package com.sharesdu.android.common.view;

import android.content.Context;
import android.util.AttributeSet;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.bumptech.glide.Glide;
import com.sharesdu.android.common.R;
import com.sharesdu.android.common.dialog.ImageViewerDialog;
import java.util.ArrayList;
import java.util.List;

/**
 * 九宫格图片展示组件
 * 支持1-9张图片的网格布局，超过9张时最后一张显示+n
 */
public class ImageGridLayout extends ViewGroup {
    private static final int MAX_DISPLAY_COUNT = 9;
    private static final int GRID_COLUMNS_1 = 1;  // 1张图片
    private static final int GRID_COLUMNS_2 = 2;  // 2-4张图片
    private static final int GRID_COLUMNS_3 = 3;  // 5-9张图片
    
    private List<String> imageUrls = new ArrayList<>();
    private int itemSpacing = 4; // dp
    private int itemSpacingPx;
    private OnImageClickListener onImageClickListener;
    
    public interface OnImageClickListener {
        void onImageClick(int position, String imageUrl, List<String> allUrls);
    }
    
    public ImageGridLayout(Context context) {
        super(context);
        init();
    }
    
    public ImageGridLayout(Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
        init();
    }
    
    public ImageGridLayout(Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init();
    }
    
    private void init() {
        itemSpacingPx = (int) (itemSpacing * getResources().getDisplayMetrics().density);
    }
    
    /**
     * 设置图片列表
     * @param urls 图片URL列表
     */
    public void setImageUrls(@NonNull List<String> urls) {
        if (urls == null) {
            urls = new ArrayList<>();
        }
        this.imageUrls = new ArrayList<>(urls);
        updateViews();
    }
    
    /**
     * 设置图片点击监听
     */
    public void setOnImageClickListener(OnImageClickListener listener) {
        this.onImageClickListener = listener;
    }
    
    /**
     * 更新视图
     */
    private void updateViews() {
        // 清除所有子视图
        removeAllViews();
        
        if (imageUrls == null || imageUrls.isEmpty()) {
            return;
        }
        
        int count = imageUrls.size();
        int displayCount = Math.min(count, MAX_DISPLAY_COUNT);
        
        // 计算网格列数
        int columns;
        if (count == 1) {
            columns = GRID_COLUMNS_1;
        } else if (count <= 4) {
            columns = GRID_COLUMNS_2;
        } else {
            columns = GRID_COLUMNS_3;
        }
        
        // 创建图片视图
        for (int i = 0; i < displayCount; i++) {
            FrameLayout itemContainer = createImageItem(i, count > MAX_DISPLAY_COUNT && i == displayCount - 1, count - MAX_DISPLAY_COUNT);
            addView(itemContainer);
        }
        
        // 请求重新布局
        requestLayout();
    }
    
    /**
     * 创建图片项
     * @param position 位置索引
     * @param showMore 是否显示"+n"
     * @param moreCount 多出的数量
     */
    private FrameLayout createImageItem(int position, boolean showMore, int moreCount) {
        FrameLayout container = new FrameLayout(getContext());
        
        // 创建图片视图
        ImageView imageView = new ImageView(getContext());
        imageView.setScaleType(ImageView.ScaleType.CENTER_CROP);
        imageView.setBackgroundColor(0xFFE0E0E0);
        
        // 加载图片
        String imageUrl = imageUrls.get(position);
        Glide.with(getContext())
            .load(imageUrl)
            .placeholder(R.drawable.placeholder_image)
            .error(R.drawable.placeholder_image)
            .into(imageView);
        
        container.addView(imageView, new FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        ));
        
        // 如果需要显示"+n"
        if (showMore) {
            // 添加半透明遮罩
            View overlay = new View(getContext());
            overlay.setBackgroundColor(0x80000000);
            container.addView(overlay, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            ));
            
            // 添加"+n"文字
            TextView textView = new TextView(getContext());
            textView.setText("+" + moreCount);
            textView.setTextColor(0xFFFFFFFF);
            textView.setTextSize(18);
            textView.setGravity(Gravity.CENTER);
            textView.setTypeface(null, android.graphics.Typeface.BOLD);
            
            FrameLayout.LayoutParams textParams = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            );
            textParams.gravity = Gravity.CENTER;
            container.addView(textView, textParams);
        }
        
        // 设置点击事件
        final int finalPosition = position;
        container.setOnClickListener(v -> {
            if (onImageClickListener != null) {
                onImageClickListener.onImageClick(finalPosition, imageUrl, imageUrls);
            }
        });
        
        return container;
    }
    
    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        int width = MeasureSpec.getSize(widthMeasureSpec);
        int paddingLeft = getPaddingLeft();
        int paddingRight = getPaddingRight();
        int paddingTop = getPaddingTop();
        int paddingBottom = getPaddingBottom();
        
        int availableWidth = width - paddingLeft - paddingRight;
        
        if (imageUrls == null || imageUrls.isEmpty()) {
            setMeasuredDimension(width, paddingTop + paddingBottom);
            return;
        }
        
        int count = Math.min(imageUrls.size(), MAX_DISPLAY_COUNT);
        
        // 计算网格列数
        int columns;
        if (count == 1) {
            columns = GRID_COLUMNS_1;
        } else if (count <= 4) {
            columns = GRID_COLUMNS_2;
        } else {
            columns = GRID_COLUMNS_3;
        }
        
        // 计算行数
        int rows = (count + columns - 1) / columns;
        
        // 计算每个item的尺寸
        int totalSpacing = (columns - 1) * itemSpacingPx;
        int itemWidth = (availableWidth - totalSpacing) / columns;
        int itemHeight = itemWidth; // 正方形
        
        // 计算总高度
        int totalSpacingVertical = (rows - 1) * itemSpacingPx;
        int totalHeight = rows * itemHeight + totalSpacingVertical + paddingTop + paddingBottom;
        
        // 测量所有子视图
        int childWidthSpec = MeasureSpec.makeMeasureSpec(itemWidth, MeasureSpec.EXACTLY);
        int childHeightSpec = MeasureSpec.makeMeasureSpec(itemHeight, MeasureSpec.EXACTLY);
        
        for (int i = 0; i < getChildCount(); i++) {
            View child = getChildAt(i);
            if (child != null) {
                child.measure(childWidthSpec, childHeightSpec);
            }
        }
        
        setMeasuredDimension(width, totalHeight);
    }
    
    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
        if (imageUrls == null || imageUrls.isEmpty()) {
            return;
        }
        
        int count = Math.min(imageUrls.size(), MAX_DISPLAY_COUNT);
        
        // 计算网格列数
        int columns;
        if (count == 1) {
            columns = GRID_COLUMNS_1;
        } else if (count <= 4) {
            columns = GRID_COLUMNS_2;
        } else {
            columns = GRID_COLUMNS_3;
        }
        
        int paddingLeft = getPaddingLeft();
        int paddingTop = getPaddingTop();
        
        int availableWidth = getWidth() - paddingLeft - getPaddingRight();
        int totalSpacing = (columns - 1) * itemSpacingPx;
        int itemWidth = (availableWidth - totalSpacing) / columns;
        int itemHeight = itemWidth;
        
        // 布局所有子视图
        for (int i = 0; i < getChildCount() && i < count; i++) {
            View child = getChildAt(i);
            if (child == null) {
                continue;
            }
            
            int row = i / columns;
            int col = i % columns;
            
            int left = paddingLeft + col * (itemWidth + itemSpacingPx);
            int top = paddingTop + row * (itemHeight + itemSpacingPx);
            int right = left + itemWidth;
            int bottom = top + itemHeight;
            
            child.layout(left, top, right, bottom);
        }
    }
}

