package com.sharesdu.android.common.view;

import android.content.Context;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.RatingBar;
import android.widget.TextView;
import androidx.annotation.Nullable;
import androidx.cardview.widget.CardView;
import com.sharesdu.android.common.R;

/**
 * 用户自己的评价卡片组件
 * 显示用户对课程的评价和评分
 */
public class SelfCommentCardView extends CardView {
    private ProgressBar progressLoading;
    private LinearLayout layoutContent;
    private RatingBar ratingBar;
    private TextView tvTitle;
    private TextView tvComment;
    private android.widget.Button btnEditComment;
    
    private OnEditCommentListener onEditCommentListener;
    
    public interface OnEditCommentListener {
        void onEditComment();
    }
    
    // 数据
    private Integer score;
    private String comment;
    private boolean isRated;
    
    public SelfCommentCardView(Context context) {
        super(context);
        init();
    }
    
    public SelfCommentCardView(Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
        init();
    }
    
    public SelfCommentCardView(Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init();
    }
    
    private void init() {
        // 设置CardView样式
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
            setCardBackgroundColor(getContext().getColor(R.color.background_secondary));
        } else {
            setCardBackgroundColor(getResources().getColor(R.color.background_secondary));
        }
        setCardElevation(0f);
        setRadius(8f * getResources().getDisplayMetrics().density);
        
        // 加载布局
        LayoutInflater.from(getContext()).inflate(R.layout.view_self_comment_card, this, true);
        
        // 初始化视图
        progressLoading = findViewById(R.id.progress_loading);
        layoutContent = findViewById(R.id.layout_content);
        ratingBar = findViewById(R.id.rating_bar);
        tvTitle = findViewById(R.id.tv_title);
        tvComment = findViewById(R.id.tv_comment);
        btnEditComment = findViewById(R.id.btn_edit_comment);
        
        // 设置按钮点击事件
        if (btnEditComment != null) {
            btnEditComment.setOnClickListener(v -> {
                if (onEditCommentListener != null) {
                    onEditCommentListener.onEditComment();
                }
            });
        }
    }
    
    /**
     * 设置编辑评论监听器
     */
    public void setOnEditCommentListener(OnEditCommentListener listener) {
        this.onEditCommentListener = listener;
    }
    
    /**
     * 设置加载状态
     */
    public void setLoading(boolean loading) {
        if (progressLoading != null) {
            progressLoading.setVisibility(loading ? View.VISIBLE : View.GONE);
        }
        if (layoutContent != null) {
            layoutContent.setVisibility(loading ? View.GONE : View.VISIBLE);
        }
    }
    
    /**
     * 绑定评价数据
     */
    public void bind(Integer score, String comment, boolean isRated) {
        this.score = score;
        this.comment = comment;
        this.isRated = isRated;
        
        setLoading(false);
        
        // 显示评分
        if (ratingBar != null) {
            if (score != null && score > 0) {
                ratingBar.setRating(score);
                // 设置评分颜色
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                    ratingBar.setProgressTintList(android.content.res.ColorStateList.valueOf(
                        getContext().getColor(R.color.theme_color)));
                }
            } else {
                ratingBar.setRating(0);
                // 设置灰色
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                    ratingBar.setProgressTintList(android.content.res.ColorStateList.valueOf(
                        getContext().getColor(R.color.text_color_secondary)));
                }
            }
        }
        
        // 显示标题
        if (tvTitle != null) {
            if (isRated) {
                tvTitle.setText("我的评论");
            } else {
                tvTitle.setText("暂未评价此课程");
            }
        }
        
        // 显示评价内容
        if (tvComment != null) {
            if (isRated && comment != null && !comment.isEmpty()) {
                tvComment.setText(comment);
                tvComment.setVisibility(View.VISIBLE);
            } else {
                tvComment.setVisibility(View.GONE);
            }
        }
        
        // 更新按钮文本
        if (btnEditComment != null) {
            if (isRated) {
                btnEditComment.setText("修改我的评价");
            } else {
                btnEditComment.setText("评价此课程");
            }
        }
    }
    
    /**
     * 清空数据
     */
    public void clear() {
        bind(null, null, false);
    }
}

