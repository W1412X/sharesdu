package com.sharesdu.android.common.view;

import android.content.Context;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import android.widget.LinearLayout;
import android.widget.RatingBar;
import android.widget.TextView;
import androidx.annotation.Nullable;
import androidx.cardview.widget.CardView;
import com.sharesdu.android.common.R;
import java.util.Map;

/**
 * 课程评论项组件
 * 用于显示课程评价列表中的单个评价项
 */
public class CourseCommentItemView extends CardView {
    private UserAvatarView userAvatar;
    private TextView tvAuthorName;
    private RatingBar ratingBar;
    private TextView tvTime;
    private TextView tvComment;
    
    public CourseCommentItemView(Context context) {
        super(context);
        init();
    }
    
    public CourseCommentItemView(Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
        init();
    }
    
    public CourseCommentItemView(Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init();
    }
    
    private void init() {
        // 设置CardView样式
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
            setCardBackgroundColor(getContext().getColor(R.color.background_primary));
        } else {
            setCardBackgroundColor(getResources().getColor(R.color.background_primary));
        }
        setCardElevation(0f);
        setRadius(2f * getResources().getDisplayMetrics().density);
        
        // 加载布局
        LayoutInflater.from(getContext()).inflate(R.layout.view_course_comment_item, this, true);
        
        // 初始化视图
        userAvatar = findViewById(R.id.user_avatar);
        tvAuthorName = findViewById(R.id.tv_author_name);
        ratingBar = findViewById(R.id.rating_bar);
        tvTime = findViewById(R.id.tv_time);
        tvComment = findViewById(R.id.tv_comment);
    }
    
    /**
     * 绑定评论数据
     * @param commentData Map包含：scorer_id, scorer_name, score, comment, publish_time
     */
    public void bind(Map<String, Object> commentData) {
        if (commentData == null) {
            return;
        }
        
        // 用户头像和名称
        Object scorerIdObj = commentData.get("scorer_id");
        Object scorerNameObj = commentData.get("scorer_name");
        
        if (scorerIdObj != null && userAvatar != null) {
            try {
                Integer scorerId = ((Number) scorerIdObj).intValue();
                userAvatar.setUser(scorerId, null);
            } catch (Exception e) {
                android.util.Log.e("CourseCommentItemView", "设置用户头像失败", e);
            }
        }
        
        if (tvAuthorName != null) {
            String authorName = scorerNameObj != null ? scorerNameObj.toString() : "匿名";
            tvAuthorName.setText(authorName);
        }
        
        // 评分
        if (ratingBar != null) {
            Object scoreObj = commentData.get("score");
            if (scoreObj instanceof Number) {
                int score = ((Number) scoreObj).intValue();
                ratingBar.setRating(score);
                // 设置评分颜色
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                    ratingBar.setProgressTintList(android.content.res.ColorStateList.valueOf(
                        getContext().getColor(R.color.theme_color)));
                }
            } else {
                ratingBar.setRating(0);
            }
        }
        
        // 评价内容
        if (tvComment != null) {
            Object commentObj = commentData.get("comment");
            String comment = commentObj != null ? commentObj.toString() : "";
            tvComment.setText(comment);
        }
        
        // 发布时间
        if (tvTime != null) {
            Object timeObj = commentData.get("publish_time");
            String time = timeObj != null ? timeObj.toString() : "";
            tvTime.setText(time);
        }
    }
}



