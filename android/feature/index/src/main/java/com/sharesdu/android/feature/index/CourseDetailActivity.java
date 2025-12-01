package com.sharesdu.android.feature.index;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.sharesdu.android.common.view.UserAvatarView;
import com.sharesdu.android.common.view.CourseHeaderView;
import com.sharesdu.android.common.view.SelfCommentCardView;
import com.sharesdu.android.common.view.CourseCommentItemView;
import com.sharesdu.android.core.network.ApiClient;
import com.sharesdu.android.core.network.CourseService;
import com.sharesdu.android.core.network.response.CourseDetailResponse;
import com.sharesdu.android.core.network.response.CourseScoreListResponse;
import com.sharesdu.android.core.network.response.UserEvaluationResponse;
import com.sharesdu.android.common.dialog.CommentEditorDialog;
import com.sharesdu.android.common.dialog.PostListDialog;
import com.sharesdu.android.common.dialog.PostEditorDialog;
import com.sharesdu.android.core.utils.ErrorHandler;
import com.sharesdu.android.core.utils.TokenManager;
import com.sharesdu.android.data.model.Course;
import com.sharesdu.android.feature.index.R;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 课程详情页面
 * 参考 PostDetailActivity 的实现风格
 */
public class CourseDetailActivity extends AppCompatActivity {
    public static final String EXTRA_COURSE_ID = "course_id";
    
    // 视图组件
    private Toolbar toolbar;
    private CourseHeaderView courseHeaderView;
    private SelfCommentCardView selfCommentCardView;
    private RecyclerView recyclerViewComments;
    private LinearLayout layoutBottomBar;
    private UserAvatarView userAvatar;
    private ImageButton btnReportCourse;
    private ImageButton btnViewPosts;
    private ProgressBar progressBar;
    private TextView tvEmptyComments;
    
    // 网络服务
    private CourseService courseService;
    
    // 数据
    private Course course;
    private List<Map<String, Object>> commentList = new ArrayList<>();
    private CommentAdapter commentAdapter;
    
    // 用户评价数据
    private Integer selfScore;
    private String selfComment;
    private boolean isRated;
    
    // 状态
    private int currentCommentPage = 1;
    private boolean isLoadingComments = false;
    private boolean allCommentsLoaded = false;
    private String currentUserId;
    private boolean isMaster;
    
    // 对话框
    private CommentEditorDialog commentEditorDialog;
    private PostListDialog postListDialog;
    private PostEditorDialog postEditorDialog;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_course_detail);
        
        Integer courseId = getIntent().getIntExtra(EXTRA_COURSE_ID, -1);
        if (courseId == -1) {
            Toast.makeText(this, "无效的课程ID", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }
        
        initViews();
        initNetwork();
        loadCourseDetail(courseId);
    }
    
    /**
     * 初始化视图
     */
    private void initViews() {
        // Toolbar
        toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setTitle("课程详情");
            toolbar.setTitleTextAppearance(this, android.R.style.TextAppearance_Material_Widget_ActionBar_Title);
        }
        toolbar.setTitleTextColor(android.graphics.Color.WHITE);
        toolbar.setNavigationOnClickListener(v -> finish());
        
        // 课程头部组件
        courseHeaderView = findViewById(R.id.course_header_view);
        if (courseHeaderView != null) {
            // 设置操作监听器（收藏功能已在CourseHeaderView内部实现）
            courseHeaderView.setOnActionListener(() -> {
                // 收藏成功后的回调，可以在这里刷新课程数据
                if (course != null) {
                    loadCourseDetail(course.getId());
                }
            });
        }
        
        // 用户评价卡片
        selfCommentCardView = findViewById(R.id.self_comment_card);
        if (selfCommentCardView != null) {
            selfCommentCardView.setOnEditCommentListener(() -> {
                // TODO: 打开评价编辑器对话框
                showCommentEditorDialog();
            });
        }
        
        // 评论列表
        recyclerViewComments = findViewById(R.id.recycler_view_comments);
        commentAdapter = new CommentAdapter();
        recyclerViewComments.setLayoutManager(new LinearLayoutManager(this));
        recyclerViewComments.setAdapter(commentAdapter);
        
        // 设置无限滚动
        recyclerViewComments.addOnScrollListener(new RecyclerView.OnScrollListener() {
            @Override
            public void onScrolled(RecyclerView recyclerView, int dx, int dy) {
                super.onScrolled(recyclerView, dx, dy);
                LinearLayoutManager layoutManager = (LinearLayoutManager) recyclerView.getLayoutManager();
                if (layoutManager != null) {
                    int visibleItemCount = layoutManager.getChildCount();
                    int totalItemCount = layoutManager.getItemCount();
                    int pastVisibleItems = layoutManager.findFirstVisibleItemPosition();
                    
                    if (!isLoadingComments && !allCommentsLoaded && 
                        (visibleItemCount + pastVisibleItems) >= totalItemCount) {
                        // 加载更多评论
                        if (course != null) {
                            loadMoreComments(course.getId(), currentCommentPage + 1);
                        }
                    }
                }
            }
        });
        
        // 底部操作栏
        layoutBottomBar = findViewById(R.id.layout_bottom_bar);
        userAvatar = findViewById(R.id.user_avatar);
        btnReportCourse = findViewById(R.id.btn_report_course);
        btnViewPosts = findViewById(R.id.btn_view_posts);
        
        // 进度条和空状态
        progressBar = findViewById(R.id.progress_bar);
        tvEmptyComments = findViewById(R.id.tv_empty_comments);
        
        // 获取当前用户信息
        TokenManager tokenManager = TokenManager.getInstance(this);
        currentUserId = tokenManager.getUserId();
        isMaster = tokenManager.isMaster();
        
        // 设置用户头像
        if (currentUserId != null && !currentUserId.isEmpty()) {
            try {
                Integer userId = Integer.parseInt(currentUserId);
                if (userAvatar != null) {
                    userAvatar.setUser(userId, null);
                }
            } catch (NumberFormatException e) {
                android.util.Log.e("CourseDetailActivity", "用户ID格式错误: " + currentUserId, e);
            }
        }
        
        // 设置底部操作按钮
        setupBottomBarButtons();
        
        // 设置查看帖子按钮
        if (btnViewPosts != null) {
            btnViewPosts.setOnClickListener(v -> showPostListDialog());
        }
    }
    
    /**
     * 设置底部操作栏按钮
     */
    private void setupBottomBarButtons() {
        // 非管理员显示举报按钮
        if (btnReportCourse != null) {
            if (isMaster) {
                btnReportCourse.setVisibility(View.GONE);
            } else {
                btnReportCourse.setVisibility(View.VISIBLE);
                btnReportCourse.setOnClickListener(v -> showReportDialog());
            }
        }
    }
    
    /**
     * 初始化网络服务
     */
    private void initNetwork() {
        courseService = ApiClient.getRetrofit().create(CourseService.class);
    }
    
    /**
     * 加载课程详情
     */
    private void loadCourseDetail(Integer courseId) {
        progressBar.setVisibility(View.VISIBLE);
        Call<CourseDetailResponse> call = courseService.getCourseDetail(courseId);
        call.enqueue(new Callback<CourseDetailResponse>() {
            @Override
            public void onResponse(Call<CourseDetailResponse> call, Response<CourseDetailResponse> response) {
                progressBar.setVisibility(View.GONE);
                
                if (response.isSuccessful() && response.body() != null) {
                    CourseDetailResponse courseResponse = response.body();
                    if (courseResponse.isSuccess()) {
                        Map<String, Object> courseDetail = courseResponse.getCourse_detail();
                        if (courseDetail != null) {
                            course = parseCourseFromMap(courseDetail);
                            
                            // 更新标题
                            if (course != null && course.getName() != null) {
                                if (getSupportActionBar() != null) {
                                    getSupportActionBar().setTitle(course.getName());
                                }
                            }
                            
                            // 更新课程头部组件
                            if (courseHeaderView != null && course != null) {
                                courseHeaderView.bind(course);
                            }
                            
                            // 加载用户自己的评价
                            loadSelfComment(courseId);
                            
                            // 加载评论列表（第一页）
                            loadMoreComments(courseId, 1);
                        } else {
                            android.util.Log.e("CourseDetailActivity", "API response course_detail is null");
                            Toast.makeText(CourseDetailActivity.this, "课程数据格式错误", Toast.LENGTH_SHORT).show();
                        }
                    } else {
                        String errorMsg = courseResponse.getMessage();
                        if (errorMsg == null || errorMsg.isEmpty()) {
                            errorMsg = "加载课程失败";
                        }
                        Toast.makeText(CourseDetailActivity.this, errorMsg, Toast.LENGTH_SHORT).show();
                    }
                } else {
                    String errorMsg = ErrorHandler.getErrorMessage(response);
                    Toast.makeText(CourseDetailActivity.this, "加载失败：" + errorMsg, Toast.LENGTH_SHORT).show();
                }
            }
            
            @Override
            public void onFailure(Call<CourseDetailResponse> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                String errorMsg = ErrorHandler.getErrorMessage(t);
                android.util.Log.e("CourseDetailActivity", "加载课程失败", t);
                Toast.makeText(CourseDetailActivity.this, "加载失败：" + errorMsg, Toast.LENGTH_SHORT).show();
            }
        });
    }
    
    /**
     * 从Map解析Course对象
     */
    private Course parseCourseFromMap(Map<String, Object> map) {
        Course course = new Course();
        
        // 课程ID
        if (map.containsKey("course_id")) {
            Object idObj = map.get("course_id");
            if (idObj instanceof Number) {
                course.setId(((Number) idObj).intValue());
            }
        }
        
        // 课程名称
        if (map.containsKey("course_name")) {
            Object nameObj = map.get("course_name");
            if (nameObj != null) {
                course.setName(nameObj.toString());
            }
        }
        
        // 课程类型
        if (map.containsKey("course_type")) {
            Object typeObj = map.get("course_type");
            if (typeObj != null) {
                course.setType(typeObj.toString());
            }
        }
        
        // 学院
        if (map.containsKey("college")) {
            Object collegeObj = map.get("college");
            if (collegeObj != null) {
                course.setCollege(collegeObj.toString());
            }
        }
        
        // 校区
        if (map.containsKey("campus")) {
            Object campusObj = map.get("campus");
            if (campusObj != null) {
                course.setCampus(campusObj.toString());
            }
        }
        
        // 学分
        if (map.containsKey("credits")) {
            Object creditsObj = map.get("credits");
            if (creditsObj instanceof Number) {
                course.setCredit(((Number) creditsObj).intValue());
            }
        }
        
        // 教师
        if (map.containsKey("course_teacher")) {
            Object teacherObj = map.get("course_teacher");
            if (teacherObj != null) {
                course.setTeacher(teacherObj.toString());
            }
        }
        
        // 教学方式
        if (map.containsKey("course_method")) {
            Object methodObj = map.get("course_method");
            if (methodObj != null) {
                course.setAttendMethod(methodObj.toString());
            }
        }
        
        // 考核方式
        if (map.containsKey("assessment_method")) {
            Object assessmentObj = map.get("assessment_method");
            if (assessmentObj != null) {
                course.setExamineMethod(assessmentObj.toString());
            }
        }
        
        // 总评分
        if (map.containsKey("all_score")) {
            Object scoreObj = map.get("all_score");
            if (scoreObj instanceof Number) {
                course.setScore(((Number) scoreObj).doubleValue());
            }
        }
        
        // 评价人数
        if (map.containsKey("all_people")) {
            Object peopleObj = map.get("all_people");
            if (peopleObj instanceof Number) {
                course.setEvaluateNum(((Number) peopleObj).intValue());
            }
        }
        
        // 发布时间
        if (map.containsKey("publish_time")) {
            Object timeObj = map.get("publish_time");
            if (timeObj != null) {
                course.setPublishTime(timeObj.toString());
            }
        }
        
        // 点赞数
        if (map.containsKey("like_count")) {
            Object likeCountObj = map.get("like_count");
            if (likeCountObj instanceof Number) {
                course.setLikeNum(((Number) likeCountObj).intValue());
            }
        }
        
        // 是否已点赞
        if (map.containsKey("if_like")) {
            Object ifLikeObj = map.get("if_like");
            if (ifLikeObj instanceof Boolean) {
                course.setIfLike((Boolean) ifLikeObj);
            } else if (ifLikeObj instanceof Number) {
                course.setIfLike(((Number) ifLikeObj).intValue() != 0);
            }
        }
        
        // 是否已收藏
        if (map.containsKey("if_star")) {
            Object ifStarObj = map.get("if_star");
            if (ifStarObj instanceof Boolean) {
                course.setIfStar((Boolean) ifStarObj);
            } else if (ifStarObj instanceof Number) {
                course.setIfStar(((Number) ifStarObj).intValue() != 0);
            }
        }
        
        // 评分分布
        if (map.containsKey("score_distribution")) {
            Object distributionObj = map.get("score_distribution");
            if (distributionObj instanceof List) {
                @SuppressWarnings("unchecked")
                List<Object> distributionList = (List<Object>) distributionObj;
                java.util.List<Integer> scoreDistribution = new java.util.ArrayList<>();
                for (Object item : distributionList) {
                    if (item instanceof Number) {
                        scoreDistribution.add(((Number) item).intValue());
                    }
                }
                if (scoreDistribution.size() == 5) {
                    course.setScoreDistribution(scoreDistribution);
                }
            }
        }
        
        android.util.Log.d("CourseDetailActivity", "解析课程数据完成 - ID: " + course.getId() + 
            ", 名称: " + course.getName());
        
        return course;
    }
    
    /**
     * 加载更多评论
     */
    private void loadMoreComments(Integer courseId, int page) {
        if (isLoadingComments || allCommentsLoaded) {
            return;
        }
        
        isLoadingComments = true;
        if (page == 1) {
            progressBar.setVisibility(View.VISIBLE);
        }
        
        Call<CourseScoreListResponse> call = courseService.getCourseScoreList(courseId, page, 20);
        call.enqueue(new Callback<CourseScoreListResponse>() {
            @Override
            public void onResponse(Call<CourseScoreListResponse> call, Response<CourseScoreListResponse> response) {
                isLoadingComments = false;
                progressBar.setVisibility(View.GONE);
                
                if (response.isSuccessful() && response.body() != null) {
                    CourseScoreListResponse scoreResponse = response.body();
                    if (scoreResponse.isSuccess()) {
                        List<Map<String, Object>> scoreList = scoreResponse.getScore_list();
                        
                        if (scoreList != null && !scoreList.isEmpty()) {
                            // 过滤掉当前用户的评价
                            List<Map<String, Object>> filteredList = new ArrayList<>();
                            for (Map<String, Object> item : scoreList) {
                                Object scorerId = item.get("scorer_id");
                                if (scorerId != null && !scorerId.toString().equals(currentUserId)) {
                                    filteredList.add(item);
                                }
                            }
                            
                            if (page == 1) {
                                commentList.clear();
                            }
                            commentList.addAll(filteredList);
                            commentAdapter.notifyDataSetChanged();
                            currentCommentPage = page;
                            
                            // 判断是否加载完成
                            if (scoreList.size() < 20) {
                                allCommentsLoaded = true;
                            }
                            
                            // 更新空状态显示
                            updateEmptyState();
                        } else {
                            if (page == 1) {
                                commentList.clear();
                                commentAdapter.notifyDataSetChanged();
                                updateEmptyState();
                            }
                            allCommentsLoaded = true;
                        }
                    } else {
                        String errorMsg = scoreResponse.getMessage();
                        if (errorMsg == null || errorMsg.isEmpty()) {
                            errorMsg = "加载评论失败";
                        }
                        android.util.Log.e("CourseDetailActivity", "加载评论失败: " + errorMsg);
                        if (page == 1) {
                            Toast.makeText(CourseDetailActivity.this, errorMsg, Toast.LENGTH_SHORT).show();
                        }
                    }
                } else {
                    String errorMsg = ErrorHandler.getErrorMessage(response);
                    android.util.Log.e("CourseDetailActivity", "加载评论失败: " + errorMsg);
                    if (page == 1) {
                        Toast.makeText(CourseDetailActivity.this, "加载评论失败：" + errorMsg, Toast.LENGTH_SHORT).show();
                    }
                }
            }
            
            @Override
            public void onFailure(Call<CourseScoreListResponse> call, Throwable t) {
                isLoadingComments = false;
                progressBar.setVisibility(View.GONE);
                String errorMsg = ErrorHandler.getErrorMessage(t);
                android.util.Log.e("CourseDetailActivity", "加载评论失败", t);
                if (page == 1) {
                    Toast.makeText(CourseDetailActivity.this, "加载评论失败：" + errorMsg, Toast.LENGTH_SHORT).show();
                }
            }
        });
    }
    
    /**
     * 更新空状态显示
     */
    private void updateEmptyState() {
        if (tvEmptyComments != null) {
            tvEmptyComments.setVisibility(commentList.isEmpty() ? View.VISIBLE : View.GONE);
        }
    }
    
    /**
     * 显示举报对话框
     */
    private void showReportDialog() {
        // TODO: 实现举报功能
        Toast.makeText(this, "举报功能开发中", Toast.LENGTH_SHORT).show();
    }
    
    /**
     * 加载用户自己的评价
     */
    private void loadSelfComment(Integer courseId) {
        if (currentUserId == null || currentUserId.isEmpty()) {
            // 未登录，显示未评价状态
            if (selfCommentCardView != null) {
                selfCommentCardView.bind(null, null, false);
            }
            return;
        }
        
        if (selfCommentCardView != null) {
            selfCommentCardView.setLoading(true);
        }
        
        Map<String, Integer> requestBody = new java.util.HashMap<>();
        try {
            requestBody.put("course_id", courseId);
            requestBody.put("user_id", Integer.parseInt(currentUserId));
        } catch (NumberFormatException e) {
            android.util.Log.e("CourseDetailActivity", "用户ID格式错误: " + currentUserId, e);
            if (selfCommentCardView != null) {
                selfCommentCardView.setLoading(false);
                selfCommentCardView.bind(null, null, false);
            }
            return;
        }
        
        Call<UserEvaluationResponse> call = courseService.getUserEvaluation(requestBody);
        call.enqueue(new Callback<UserEvaluationResponse>() {
            @Override
            public void onResponse(Call<UserEvaluationResponse> call, Response<UserEvaluationResponse> response) {
                if (selfCommentCardView != null) {
                    selfCommentCardView.setLoading(false);
                }
                
                if (response.isSuccessful() && response.body() != null) {
                    UserEvaluationResponse evalResponse = response.body();
                    if (evalResponse.getStatus() == 200) {
                        // 有评价数据
                        Double scoreDouble = evalResponse.getScore();
                        Integer score = null;
                        if (scoreDouble != null) {
                            score = scoreDouble.intValue();
                        }
                        String comment = evalResponse.getComment();
                        
                        // 保存到成员变量
                        selfScore = score;
                        selfComment = comment;
                        isRated = true;
                        
                        if (selfCommentCardView != null) {
                            selfCommentCardView.bind(score, comment, true);
                        }
                    } else {
                        // 没有评价数据
                        selfScore = null;
                        selfComment = null;
                        isRated = false;
                        
                        if (selfCommentCardView != null) {
                            selfCommentCardView.bind(null, null, false);
                        }
                    }
                } else {
                    // 请求失败，显示未评价状态
                    if (selfCommentCardView != null) {
                        selfCommentCardView.bind(null, null, false);
                    }
                }
            }
            
            @Override
            public void onFailure(Call<UserEvaluationResponse> call, Throwable t) {
                if (selfCommentCardView != null) {
                    selfCommentCardView.setLoading(false);
                    selfCommentCardView.bind(null, null, false);
                }
                android.util.Log.e("CourseDetailActivity", "加载用户评价失败", t);
            }
        });
    }
    
    /**
     * 显示评价编辑器对话框
     */
    private void showCommentEditorDialog() {
        if (course == null || course.getId() == null) {
            return;
        }
        
        if (commentEditorDialog == null) {
            commentEditorDialog = new CommentEditorDialog(this);
        }
        
        commentEditorDialog.show(
            course.getId(),
            selfScore,
            selfComment,
            (score, comment) -> {
                // 评价提交成功，更新UI
                selfScore = score;
                selfComment = comment;
                isRated = true;
                
                if (selfCommentCardView != null) {
                    selfCommentCardView.bind(score, comment, true);
                }
                
                // 重新加载课程详情以更新评分
                loadCourseDetail(course.getId());
            }
        );
    }
    
    /**
     * 显示帖子列表对话框
     */
    private void showPostListDialog() {
        if (course == null || course.getId() == null) {
            return;
        }
        
        if (postListDialog == null) {
            postListDialog = new PostListDialog(this);
        }
        
        postListDialog.show(
            course.getId(),
            isMaster,
            () -> {
                // 打开帖子编辑器
                showPostEditorDialog();
            },
            (post) -> {
                // 点击帖子，跳转到帖子详情页
                if (post != null && post.getId() != null) {
                    PostDetailActivity.start(CourseDetailActivity.this, post.getId());
                }
            }
        );
    }
    
    /**
     * 显示帖子编辑器对话框
     */
    private void showPostEditorDialog() {
        if (course == null || course.getId() == null) {
            return;
        }
        
        if (postEditorDialog == null) {
            postEditorDialog = new PostEditorDialog(this);
        }
        
        postEditorDialog.show(
            "course",
            course.getId().toString(),
            (postId, title, content) -> {
                // 帖子创建成功，刷新帖子列表
                if (postListDialog != null) {
                    postListDialog.refresh();
                }
            }
        );
    }
    
    /**
     * 评论列表适配器
     */
    private class CommentAdapter extends RecyclerView.Adapter<CommentAdapter.CommentViewHolder> {
        @Override
        public CommentViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
            CourseCommentItemView itemView = new CourseCommentItemView(CourseDetailActivity.this);
            return new CommentViewHolder(itemView);
        }
        
        @Override
        public void onBindViewHolder(CommentViewHolder holder, int position) {
            Map<String, Object> comment = commentList.get(position);
            if (holder.commentItemView != null) {
                holder.commentItemView.bind(comment);
            }
        }
        
        @Override
        public int getItemCount() {
            return commentList.size();
        }
        
        class CommentViewHolder extends RecyclerView.ViewHolder {
            CourseCommentItemView commentItemView;
            
            CommentViewHolder(CourseCommentItemView itemView) {
                super(itemView);
                this.commentItemView = itemView;
            }
        }
    }
    
    /**
     * 启动CourseDetailActivity的静态方法
     */
    public static void start(Context context, Integer courseId) {
        Intent intent = new Intent(context, CourseDetailActivity.class);
        intent.putExtra(EXTRA_COURSE_ID, courseId);
        context.startActivity(intent);
    }
}

