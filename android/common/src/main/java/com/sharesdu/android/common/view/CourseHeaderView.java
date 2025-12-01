package com.sharesdu.android.common.view;

import android.content.Context;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.RatingBar;
import android.widget.TextView;
import androidx.annotation.Nullable;
import androidx.cardview.widget.CardView;
import com.sharesdu.android.common.R;
import com.sharesdu.android.common.dialog.StarFolderDialog;
import com.sharesdu.android.data.model.Course;
import java.util.List;

/**
 * 课程头部组件
 * 显示课程名称、基本信息、评分信息等
 */
public class CourseHeaderView extends CardView {
    // 文本视图
    private TextView tvCourseName;
    private TextView tvType;
    private TextView tvTeacher;
    private TextView tvMethod;
    private TextView tvCredit;
    private TextView tvCampus;
    private TextView tvCollege;
    private TextView tvAssessment;
    private TextView tvPublishTime;
    private TextView tvAvgScore;
    private TextView tvScoreBase;
    private TextView tvEvaluateNum;
    
    // 评分相关
    private RatingBar ratingBar;
    private LinearLayout layoutScoreCard;
    private LinearLayout layoutScoreDistribution;
    private ProgressBar[] progressBars;
    private LinearLayout[] scoreLayouts;
    
    // 按钮
    private ImageButton btnStar;
    
    // 加载状态
    private ProgressBar progressLoading;
    
    // 收藏对话框
    private StarFolderDialog starFolderDialog;
    
    // 保存当前课程对象
    private Course currentCourse;
    
    // 回调接口
    private OnActionListener onActionListener;
    
    public interface OnActionListener {
        void onStarClick();
    }
    
    // 获取Activity的辅助方法
    private android.app.Activity getActivity() {
        android.content.Context context = getContext();
        while (context instanceof android.content.ContextWrapper) {
            if (context instanceof android.app.Activity) {
                return (android.app.Activity) context;
            }
            context = ((android.content.ContextWrapper) context).getBaseContext();
        }
        return null;
    }
    
    public CourseHeaderView(Context context) {
        super(context);
        init();
    }
    
    public CourseHeaderView(Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
        init();
    }
    
    public CourseHeaderView(Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
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
        LayoutInflater.from(getContext()).inflate(R.layout.view_course_header, this, true);
        
        // 初始化视图
        tvCourseName = findViewById(R.id.tv_course_name);
        tvType = findViewById(R.id.tv_type);
        tvTeacher = findViewById(R.id.tv_teacher);
        tvMethod = findViewById(R.id.tv_method);
        tvCredit = findViewById(R.id.tv_credit);
        tvCampus = findViewById(R.id.tv_campus);
        tvCollege = findViewById(R.id.tv_college);
        tvAssessment = findViewById(R.id.tv_assessment);
        tvPublishTime = findViewById(R.id.tv_publish_time);
        tvAvgScore = findViewById(R.id.tv_avg_score);
        tvScoreBase = findViewById(R.id.tv_score_base);
        tvEvaluateNum = findViewById(R.id.tv_evaluate_num);
        
        ratingBar = findViewById(R.id.rating_bar);
        layoutScoreCard = findViewById(R.id.layout_score_card);
        layoutScoreDistribution = findViewById(R.id.layout_score_distribution);
        
        btnStar = findViewById(R.id.btn_star);
        
        progressLoading = findViewById(R.id.progress_loading);
        
        // 初始化评分分布布局和进度条
        scoreLayouts = new LinearLayout[5];
        progressBars = new ProgressBar[5];
        int[] layoutIds = {R.id.layout_score_5, R.id.layout_score_4, R.id.layout_score_3, 
                          R.id.layout_score_2, R.id.layout_score_1};
        int[] progressIds = {R.id.progress_score_5, R.id.progress_score_4, R.id.progress_score_3,
                            R.id.progress_score_2, R.id.progress_score_1};
        
        for (int i = 0; i < 5; i++) {
            scoreLayouts[i] = findViewById(layoutIds[i]);
            progressBars[i] = findViewById(progressIds[i]);
        }
        
        // 设置按钮点击事件
        if (btnStar != null) {
            btnStar.setOnClickListener(v -> {
                showStarFolderDialog();
            });
        }
    }
    
    /**
     * 设置操作监听器
     */
    public void setOnActionListener(OnActionListener listener) {
        this.onActionListener = listener;
    }
    
    /**
     * 显示收藏夹对话框
     */
    private void showStarFolderDialog() {
        if (currentCourse == null || currentCourse.getId() == null) {
            return;
        }
        
        android.app.Activity activity = getActivity();
        if (activity == null || !(activity instanceof androidx.fragment.app.FragmentActivity)) {
            return;
        }
        
        if (starFolderDialog == null) {
            starFolderDialog = new StarFolderDialog((androidx.fragment.app.FragmentActivity) activity);
        }
        
        starFolderDialog.show(
            0, // 课程类型：0-课程, 1-文章, 2-帖子
            currentCourse.getId(),
            () -> {
                // 收藏成功，更新按钮状态
                if (currentCourse != null) {
                    currentCourse.setIfStar(true);
                    updateStarButton(true);
                }
                if (onActionListener != null) {
                    onActionListener.onStarClick();
                }
            }
        );
    }
    
    /**
     * 设置加载状态
     */
    public void setLoading(boolean loading) {
        if (progressLoading != null) {
            progressLoading.setVisibility(loading ? View.VISIBLE : View.GONE);
        }
        if (layoutScoreCard != null) {
            layoutScoreCard.setVisibility(loading ? View.GONE : View.VISIBLE);
        }
    }
    
    /**
     * 绑定课程数据
     */
    public void bind(Course course) {
        if (course == null) {
            return;
        }
        
        // 保存当前课程对象
        this.currentCourse = course;
        
        setLoading(false);
        
        // 课程名称
        if (tvCourseName != null) {
            tvCourseName.setText(course.getName() != null ? course.getName() : "");
        }
        
        // 课程类型
        if (tvType != null) {
            String type = course.getType() != null ? course.getType() : "";
            type = convertCourseType(type);
            tvType.setText("课程类型: " + type);
        }
        
        // 教师
        if (tvTeacher != null) {
            tvTeacher.setText("授课教师: " + (course.getTeacher() != null ? course.getTeacher() : ""));
        }
        
        // 教学方式
        if (tvMethod != null) {
            String method = course.getAttendMethod() != null ? course.getAttendMethod() : "";
            method = convertAttendMethod(method);
            tvMethod.setText("教学方式: " + method);
        }
        
        // 学分
        if (tvCredit != null) {
            tvCredit.setText("学分: " + (course.getCredit() != null ? course.getCredit() : ""));
        }
        
        // 校区
        if (tvCampus != null) {
            tvCampus.setText("开设校区: " + (course.getCampus() != null ? course.getCampus() : ""));
        }
        
        // 学院
        if (tvCollege != null) {
            tvCollege.setText("开设学院: " + (course.getCollege() != null ? course.getCollege() : ""));
        }
        
        // 考核方式
        if (tvAssessment != null) {
            tvAssessment.setText("考核方式: " + (course.getExamineMethod() != null ? course.getExamineMethod() : ""));
        }
        
        // 发布时间
        if (tvPublishTime != null) {
            tvPublishTime.setText(course.getPublishTime() != null ? course.getPublishTime() : "");
        }
        
        // 评分信息
        updateScoreInfo(course);
        
        // 收藏状态
        if (btnStar != null) {
            Boolean ifStar = course.getIfStar();
            updateStarButton(ifStar != null && ifStar);
        }
    }
    
    /**
     * 更新评分信息
     */
    private void updateScoreInfo(Course course) {
        if (course == null) {
            return;
        }
        
        // 计算平均分
        double avgScore = 0.0;
        Integer evaluateNum = course.getEvaluateNum();
        Double totalScore = course.getScore();
        
        if (evaluateNum != null && evaluateNum > 0 && totalScore != null) {
            avgScore = totalScore / evaluateNum;
        }
        
        // 显示平均分
        if (tvAvgScore != null) {
            tvAvgScore.setText(String.format("%.1f", avgScore));
        }
        
        // 显示星级评分
        if (ratingBar != null) {
            ratingBar.setRating((float) avgScore);
        }
        
        // 显示评价数量
        if (tvEvaluateNum != null) {
            tvEvaluateNum.setText((evaluateNum != null ? evaluateNum : 0) + " 个评分");
        }
        
        // 显示评分分布
        updateScoreDistribution(course, evaluateNum);
    }
    
    /**
     * 更新收藏按钮状态
     */
    private void updateStarButton(boolean isStarred) {
        if (btnStar != null) {
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                int color = isStarred ? getContext().getColor(R.color.theme_color) : 
                    getContext().getColor(R.color.text_color_secondary);
                btnStar.setColorFilter(color);
            } else {
                int color = isStarred ? getResources().getColor(R.color.theme_color) : 
                    getResources().getColor(R.color.text_color_secondary);
                btnStar.setColorFilter(color);
            }
        }
    }
    
    /**
     * 转换课程类型为中文
     */
    private String convertCourseType(String type) {
        if (type == null) {
            return "";
        }
        switch (type) {
            case "compulsory":
                return "必修";
            case "elective":
                return "选修";
            case "restricted_elective":
                return "限选";
            default:
                return type;
        }
    }
    
    /**
     * 转换教学方式为中文
     */
    private String convertAttendMethod(String method) {
        if (method == null) {
            return "";
        }
        switch (method) {
            case "online":
                return "线上";
            case "offline":
                return "线下";
            case "hybrid":
                return "混合";
            default:
                return method;
        }
    }
    
    /**
     * 更新评分分布
     */
    private void updateScoreDistribution(Course course, Integer evaluateNum) {
        if (layoutScoreDistribution == null || course == null || evaluateNum == null || evaluateNum == 0) {
            if (layoutScoreDistribution != null) {
                layoutScoreDistribution.setVisibility(View.GONE);
            }
            return;
        }
        
        List<Integer> distribution = course.getScoreDistribution();
        if (distribution == null || distribution.size() != 5) {
            layoutScoreDistribution.setVisibility(View.GONE);
            return;
        }
        
        layoutScoreDistribution.setVisibility(View.VISIBLE);
        
        // 更新每个评分的进度条（从5分到1分，倒序显示）
        for (int i = 0; i < 5; i++) {
            int scoreIndex = 4 - i; // 5分对应索引4，1分对应索引0
            int count = distribution.get(scoreIndex);
            
            if (scoreLayouts[i] != null && progressBars[i] != null) {
                if (count > 0) {
                    scoreLayouts[i].setVisibility(View.VISIBLE);
                    // 计算百分比
                    int percentage = (int) (100.0 * count / evaluateNum);
                    progressBars[i].setProgress(percentage);
                } else {
                    scoreLayouts[i].setVisibility(View.GONE);
                }
            }
        }
    }
}

