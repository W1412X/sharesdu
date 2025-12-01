package com.sharesdu.android.common.dialog;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.google.android.material.bottomsheet.BottomSheetDialog;
import androidx.fragment.app.FragmentActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.google.android.material.button.MaterialButton;
import com.sharesdu.android.common.R;
import com.sharesdu.android.common.view.PostItemView;
import com.sharesdu.android.core.network.ApiClient;
import com.sharesdu.android.core.network.CourseService;
import com.sharesdu.android.core.network.response.CoursePostListResponse;
import com.sharesdu.android.core.utils.ErrorHandler;
import com.sharesdu.android.data.model.Post;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 课程帖子列表对话框
 * 显示课程下的帖子列表
 */
public class PostListDialog {
    private FragmentActivity activity;
    private BottomSheetDialog dialog;
    private View dialogView;
    
    private MaterialButton btnCreatePost;
    private RecyclerView recyclerViewPosts;
    private MaterialButton btnLoadMore;
    private TextView tvEmptyPosts;
    private ProgressBar progressBar;
    
    private CourseService courseService;
    private PostAdapter postAdapter;
    
    private Integer courseId;
    private List<Post> postList = new ArrayList<>();
    private int currentPage = 1;
    private boolean isLoading = false;
    private boolean allLoaded = false;
    private boolean isMaster;
    
    // 回调接口
    public interface OnCreatePostListener {
        void onCreatePost();
    }
    
    public interface OnPostClickListener {
        void onPostClick(Post post);
    }
    
    private OnCreatePostListener onCreatePostListener;
    private OnPostClickListener onPostClickListener;
    
    public PostListDialog(FragmentActivity activity) {
        this.activity = activity;
        this.courseService = ApiClient.getRetrofit().create(CourseService.class);
    }
    
    /**
     * 显示对话框
     * @param courseId 课程ID
     * @param isMaster 是否是管理员
     * @param createPostListener 创建帖子回调
     * @param postClickListener 帖子点击回调
     */
    public void show(Integer courseId, boolean isMaster, 
                     @Nullable OnCreatePostListener createPostListener,
                     @Nullable OnPostClickListener postClickListener) {
        this.courseId = courseId;
        this.isMaster = isMaster;
        this.onCreatePostListener = createPostListener;
        this.onPostClickListener = postClickListener;
        
        dialogView = LayoutInflater.from(activity).inflate(R.layout.dialog_post_list, null);
        
        initViews();
        setupListeners();
        
        dialog = new BottomSheetDialog(activity);
        dialog.setContentView(dialogView);
        dialog.setCancelable(true);
        
        // 设置最大高度为屏幕的60%
        android.view.Window window = dialog.getWindow();
        if (window != null) {
            android.view.WindowManager.LayoutParams params = window.getAttributes();
            params.height = (int) (activity.getResources().getDisplayMetrics().heightPixels * 0.6);
            window.setAttributes(params);
        }
        
        dialog.show();
        
        // 加载帖子列表
        loadPosts(courseId, 1);
    }
    
    private void initViews() {
        btnCreatePost = dialogView.findViewById(R.id.btn_create_post);
        recyclerViewPosts = dialogView.findViewById(R.id.recycler_view_posts);
        btnLoadMore = dialogView.findViewById(R.id.btn_load_more);
        tvEmptyPosts = dialogView.findViewById(R.id.tv_empty_posts);
        progressBar = dialogView.findViewById(R.id.progress_bar);
        
        // 设置帖子列表
        postAdapter = new PostAdapter();
        recyclerViewPosts.setLayoutManager(new LinearLayoutManager(activity));
        recyclerViewPosts.setAdapter(postAdapter);
        
        // 设置无限滚动
        recyclerViewPosts.addOnScrollListener(new RecyclerView.OnScrollListener() {
            @Override
            public void onScrolled(@NonNull RecyclerView recyclerView, int dx, int dy) {
                super.onScrolled(recyclerView, dx, dy);
                LinearLayoutManager layoutManager = (LinearLayoutManager) recyclerView.getLayoutManager();
                if (layoutManager != null) {
                    int visibleItemCount = layoutManager.getChildCount();
                    int totalItemCount = layoutManager.getItemCount();
                    int pastVisibleItems = layoutManager.findFirstVisibleItemPosition();
                    
                    if (!isLoading && !allLoaded && 
                        (visibleItemCount + pastVisibleItems) >= totalItemCount) {
                        // 加载更多
                        loadPosts(courseId, currentPage + 1);
                    }
                }
            }
        });
    }
    
    private void setupListeners() {
        if (btnCreatePost != null) {
            btnCreatePost.setOnClickListener(v -> {
                if (onCreatePostListener != null) {
                    onCreatePostListener.onCreatePost();
                }
            });
        }
        
        if (btnLoadMore != null) {
            btnLoadMore.setOnClickListener(v -> {
                if (!isLoading && !allLoaded && courseId != null) {
                    loadPosts(courseId, currentPage + 1);
                }
            });
        }
    }
    
    /**
     * 加载帖子列表
     */
    private void loadPosts(Integer courseId, int page) {
        if (isLoading || allLoaded || courseId == null) {
            return;
        }
        
        isLoading = true;
        if (page == 1) {
            progressBar.setVisibility(View.VISIBLE);
        } else {
            btnLoadMore.setEnabled(false);
        }
        
        Call<CoursePostListResponse> call = courseService.getCoursePostList(courseId, page, 20);
        call.enqueue(new Callback<CoursePostListResponse>() {
            @Override
            public void onResponse(Call<CoursePostListResponse> call, Response<CoursePostListResponse> response) {
                isLoading = false;
                progressBar.setVisibility(View.GONE);
                btnLoadMore.setEnabled(true);
                
                if (response.isSuccessful() && response.body() != null) {
                    CoursePostListResponse postResponse = response.body();
                    if (postResponse.isSuccess()) {
                        List<Map<String, Object>> postListData = postResponse.getPost_list();
                        
                        if (postListData != null && !postListData.isEmpty()) {
                            List<Post> newPosts = parsePostsFromList(postListData);
                            if (page == 1) {
                                postList.clear();
                            }
                            postList.addAll(newPosts);
                            postAdapter.notifyDataSetChanged();
                            currentPage = page;
                            
                            // 判断是否加载完成
                            if (postListData.size() < 20) {
                                allLoaded = true;
                                if (btnLoadMore != null) {
                                    btnLoadMore.setVisibility(View.GONE);
                                }
                            } else {
                                if (btnLoadMore != null) {
                                    btnLoadMore.setVisibility(View.VISIBLE);
                                }
                            }
                            
                            // 更新空状态显示
                            updateEmptyState();
                        } else {
                            if (page == 1) {
                                postList.clear();
                                postAdapter.notifyDataSetChanged();
                                updateEmptyState();
                            }
                            allLoaded = true;
                            if (btnLoadMore != null) {
                                btnLoadMore.setVisibility(View.GONE);
                            }
                        }
                    } else {
                        String errorMsg = postResponse.getMessage();
                        if (errorMsg == null || errorMsg.isEmpty()) {
                            errorMsg = "加载帖子失败";
                        }
                        android.util.Log.e("PostListDialog", "加载帖子失败: " + errorMsg);
                        if (page == 1) {
                            Toast.makeText(activity, errorMsg, Toast.LENGTH_SHORT).show();
                        }
                    }
                } else {
                    String errorMsg = ErrorHandler.getErrorMessage(response);
                    android.util.Log.e("PostListDialog", "加载帖子失败: " + errorMsg);
                    if (page == 1) {
                        Toast.makeText(activity, "加载帖子失败：" + errorMsg, Toast.LENGTH_SHORT).show();
                    }
                }
            }
            
            @Override
            public void onFailure(Call<CoursePostListResponse> call, Throwable t) {
                isLoading = false;
                progressBar.setVisibility(View.GONE);
                btnLoadMore.setEnabled(true);
                String errorMsg = ErrorHandler.getErrorMessage(t);
                android.util.Log.e("PostListDialog", "加载帖子失败", t);
                if (page == 1) {
                    Toast.makeText(activity, "加载帖子失败：" + errorMsg, Toast.LENGTH_SHORT).show();
                }
            }
        });
    }
    
    /**
     * 从List解析Post对象列表
     */
    private List<Post> parsePostsFromList(List<Map<String, Object>> list) {
        List<Post> posts = new ArrayList<>();
        for (Map<String, Object> map : list) {
            Post post = new Post();
            if (map.containsKey("post_id")) {
                post.setId(((Number) map.get("post_id")).intValue());
            }
            if (map.containsKey("post_title")) {
                post.setTitle((String) map.get("post_title"));
            }
            if (map.containsKey("post_content")) {
                post.setContent((String) map.get("post_content"));
            }
            if (map.containsKey("poster_name")) {
                post.setAuthorName((String) map.get("poster_name"));
            } else if (map.containsKey("author_name")) {
                post.setAuthorName((String) map.get("author_name"));
            }
            if (map.containsKey("poster_id")) {
                post.setAuthorId(((Number) map.get("poster_id")).intValue());
            } else if (map.containsKey("author_id")) {
                post.setAuthorId(((Number) map.get("author_id")).intValue());
            }
            if (map.containsKey("view_count")) {
                post.setViewNum(((Number) map.get("view_count")).intValue());
            }
            if (map.containsKey("reply_count")) {
                post.setReplyNum(((Number) map.get("reply_count")).intValue());
            }
            if (map.containsKey("publish_time")) {
                post.setPublishTime((String) map.get("publish_time"));
            }
            if (map.containsKey("like_count")) {
                post.setLikeNum(((Number) map.get("like_count")).intValue());
            }
            if (map.containsKey("if_like")) {
                Object ifLikeObj = map.get("if_like");
                if (ifLikeObj instanceof Boolean) {
                    post.setIfLike((Boolean) ifLikeObj);
                } else if (ifLikeObj instanceof Number) {
                    post.setIfLike(((Number) ifLikeObj).intValue() != 0);
                }
            }
            if (map.containsKey("if_top")) {
                Object ifTopObj = map.get("if_top");
                if (ifTopObj instanceof Boolean) {
                    post.setIfTop((Boolean) ifTopObj);
                } else if (ifTopObj instanceof Number) {
                    post.setIfTop(((Number) ifTopObj).intValue() != 0);
                }
            }
            posts.add(post);
        }
        return posts;
    }
    
    /**
     * 更新空状态显示
     */
    private void updateEmptyState() {
        if (tvEmptyPosts != null) {
            tvEmptyPosts.setVisibility(postList.isEmpty() && !isLoading ? View.VISIBLE : View.GONE);
        }
    }
    
    /**
     * 刷新帖子列表
     */
    public void refresh() {
        if (courseId != null) {
            postList.clear();
            allLoaded = false;
            currentPage = 1;
            loadPosts(courseId, 1);
        }
    }
    
    /**
     * 帖子列表适配器
     */
    private class PostAdapter extends RecyclerView.Adapter<PostAdapter.PostViewHolder> {
        @Override
        public PostViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
            PostItemView itemView = new PostItemView(activity);
            return new PostViewHolder(itemView);
        }
        
        @Override
        public void onBindViewHolder(PostViewHolder holder, int position) {
            Post post = postList.get(position);
            
            // 绑定帖子数据
            holder.postItemView.bind(post);
            
            // 设置点击事件
            holder.postItemView.setOnPostClickListener(postItem -> {
                if (onPostClickListener != null && postItem != null) {
                    onPostClickListener.onPostClick(postItem);
                }
            });
        }
        
        @Override
        public int getItemCount() {
            return postList.size();
        }
        
        class PostViewHolder extends RecyclerView.ViewHolder {
            PostItemView postItemView;
            
            PostViewHolder(PostItemView itemView) {
                super(itemView);
                this.postItemView = itemView;
            }
        }
    }
    
    public void dismiss() {
        if (dialog != null && dialog.isShowing()) {
            dialog.dismiss();
        }
    }
}

