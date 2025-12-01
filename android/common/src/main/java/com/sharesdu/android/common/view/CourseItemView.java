package com.sharesdu.android.common.view;

import android.content.Context;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import androidx.annotation.Nullable;
import androidx.cardview.widget.CardView;
import android.widget.TextView;
import com.sharesdu.android.common.R;
import com.sharesdu.android.data.model.Course;

/**
 * 课程列表项组件
 * 独立的组件类，方便扩展
 */
public class CourseItemView extends CardView {
    private TextView tvName;
    private TextView tvType;
    private TextView tvCollege;
    private TextView tvTeacher;
    private TextView tvScore;
    private TextView tvEvaluateNum;
    
    private Course course;
    private OnCourseClickListener onCourseClickListener;
    
    public interface OnCourseClickListener {
        void onCourseClick(Course course);
    }
    
    public CourseItemView(Context context) {
        super(context);
        init();
    }
    
    public CourseItemView(Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
        init();
    }
    
    public CourseItemView(Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init();
    }
    
    private void init() {
        // 设置CardView样式属性，保持与原有布局一致
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
            setCardBackgroundColor(getContext().getColor(R.color.background_primary));
        } else {
            setCardBackgroundColor(getResources().getColor(R.color.background_primary));
        }
        setCardElevation(2f);
        setRadius(1f * getResources().getDisplayMetrics().density);
        
        // 加载内容布局
        LayoutInflater.from(getContext()).inflate(R.layout.view_course_item, this, true);
        
        tvName = findViewById(R.id.tv_name);
        tvType = findViewById(R.id.tv_type);
        tvCollege = findViewById(R.id.tv_college);
        tvTeacher = findViewById(R.id.tv_teacher);
        tvScore = findViewById(R.id.tv_score);
        tvEvaluateNum = findViewById(R.id.tv_evaluate_num);
        
        // 确保CardView可点击
        setClickable(true);
        setFocusable(true);
        setFocusableInTouchMode(true);
        
        // 确保子视图不拦截点击事件
        setDescendantFocusability(FOCUS_BLOCK_DESCENDANTS);
    }
    
    /**
     * 设置课程点击监听
     */
    public void setOnCourseClickListener(OnCourseClickListener listener) {
        this.onCourseClickListener = listener;
        setClickable(listener != null);
        setFocusable(listener != null);
        
        // 重新设置点击事件，确保使用最新的监听器
        if (listener != null) {
            setOnClickListener(v -> {
                android.util.Log.d("CourseItemView", "点击课程，course: " + (course != null ? course.getId() : "null"));
                if (onCourseClickListener != null && course != null) {
                    android.util.Log.d("CourseItemView", "调用 onCourseClick，course_id: " + course.getId());
                    onCourseClickListener.onCourseClick(course);
                } else {
                    android.util.Log.w("CourseItemView", "onCourseClickListener 或 course 为 null");
                }
            });
        } else {
            setOnClickListener(null);
        }
    }
    
    /**
     * 绑定课程数据
     * @param course 课程对象
     */
    public void bind(Course course) {
        this.course = course;
        android.util.Log.d("CourseItemView", "bind 方法被调用，course: " + (course != null ? course.getId() : "null"));
        if (course == null) {
            return;
        }
        
        // 课程名称
        if (tvName != null) {
            tvName.setText(course.getName() != null ? course.getName() : "");
        }
        
        // 课程类型（不显示"类型:"前缀，保持简洁）
        if (tvType != null) {
            String typeText = course.getType() != null ? course.getType() : "";
            tvType.setText(typeText);
        }
        
        // 学院（不显示"学院:"前缀，保持简洁）
        if (tvCollege != null) {
            String collegeText = course.getCollege() != null ? course.getCollege() : "";
            tvCollege.setText(collegeText);
        }
        
        // 教师（不显示"教师:"前缀，保持简洁）
        if (tvTeacher != null) {
            String teacherText = course.getTeacher() != null ? course.getTeacher() : "";
            tvTeacher.setText(teacherText);
        }
        
        // 评分显示：平均评分（总评分/评分人数），下方显示评价数量
        if (tvScore != null && tvEvaluateNum != null) {
            if (course.getScore() != null && course.getScore() > 0 && 
                course.getEvaluateNum() != null && course.getEvaluateNum() > 0) {
                // 计算平均评分
                double avgScore = course.getScore() / course.getEvaluateNum();
                // 显示平均评分（保留一位小数）
                tvScore.setText(String.format("%.1f", avgScore));
                // 显示评价数量（小字）
                tvEvaluateNum.setText(course.getEvaluateNum() + "个评价");
            } else {
                tvScore.setText("--");
                tvEvaluateNum.setText("");
            }
        }
    }
}

