package com.sharesdu.android.feature.index;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.sharesdu.android.common.view.CommentItemView;
import com.sharesdu.android.common.view.PostItemView;
import com.sharesdu.android.common.view.UserAvatarView;
import com.sharesdu.android.core.network.ApiClient;
import com.sharesdu.android.core.network.LikeService;
import com.sharesdu.android.core.network.PostService;
import com.sharesdu.android.core.network.response.CreateReplyResponse;
import com.sharesdu.android.core.network.response.SimpleResponse;
import com.sharesdu.android.core.network.response.DeletePostResponse;
import com.sharesdu.android.core.network.response.DeleteReplyResponse;
import com.sharesdu.android.core.network.response.PostDetailResponse;
import com.sharesdu.android.core.network.response.ReplyDetailResponse;
import com.sharesdu.android.core.network.response.ReplyListResponse;
import com.sharesdu.android.core.utils.ErrorHandler;
import com.sharesdu.android.core.utils.TokenManager;
import com.sharesdu.android.data.model.Post;
import com.sharesdu.android.data.model.Reply;
import com.sharesdu.android.feature.index.R;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 帖子详情页面
 */
public class PostDetailActivity extends AppCompatActivity {
    public static final String EXTRA_POST_ID = "post_id";
    
    private PostItemView postItemView;
    private RecyclerView recyclerViewComments;
    private CommentAdapter commentAdapter;
    private LinearLayout layoutCommentInput;
    private LinearLayout layoutBottomBar;
    private UserAvatarView userAvatar;
    private EditText etComment;
    private android.widget.ImageButton btnSend;
    private android.widget.ImageButton btnCancel;
    private android.widget.ImageButton btnDeletePost;
    private android.widget.ImageButton btnLikePost;
    private android.widget.ImageButton btnComment;
    private ProgressBar progressBar;
    private TextView tvEmptyComments;
    
    private PostService postService;
    private LikeService likeService;
    private Post post;
    private List<Reply> commentList = new ArrayList<>();
    private Reply replyingToReply; // 当前正在回复的评论
    private int currentPage = 1;
    private boolean isLoading = false;
    private boolean allLoaded = false;
    private String currentUserId;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_post_detail);
        
        Integer postId = getIntent().getIntExtra(EXTRA_POST_ID, -1);
        if (postId == -1) {
            Toast.makeText(this, "无效的帖子ID", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }
        
        initViews();
        initNetwork();
        loadPostDetail(postId);
        loadComments(postId, 1);
    }
    
    private void initViews() {
        Toolbar         toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setTitle("帖子详情");
            // 设置标题字体大小
            toolbar.setTitleTextAppearance(this, android.R.style.TextAppearance_Material_Widget_ActionBar_Title);
        }
        // 设置Toolbar标题文字颜色为白色
        toolbar.setTitleTextColor(android.graphics.Color.WHITE);
        toolbar.setNavigationOnClickListener(v -> finish());
        
        postItemView = findViewById(R.id.post_item_view);
        recyclerViewComments = findViewById(R.id.recycler_view_comments);
        layoutCommentInput = findViewById(R.id.layout_comment_input);
        layoutBottomBar = findViewById(R.id.layout_bottom_bar);
        userAvatar = findViewById(R.id.user_avatar);
        etComment = findViewById(R.id.et_comment);
        btnSend = findViewById(R.id.btn_send);
        btnCancel = findViewById(R.id.btn_cancel);
        btnDeletePost = findViewById(R.id.btn_delete_post);
        btnLikePost = findViewById(R.id.btn_like_post);
        btnComment = findViewById(R.id.btn_comment);
        progressBar = findViewById(R.id.progress_bar);
        tvEmptyComments = findViewById(R.id.tv_empty_comments);
        
        // 设置评论列表
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
                    
                    if (!isLoading && !allLoaded && (visibleItemCount + pastVisibleItems) >= totalItemCount) {
                        // 加载更多
                        if (post != null) {
                            loadComments(post.getId(), currentPage + 1);
                        }
                    }
                }
            }
        });
        
        // 设置发送按钮
        btnSend.setOnClickListener(v -> submitComment());
        
        // 设置取消按钮
        btnCancel.setOnClickListener(v -> hideCommentInput());
        
        // 设置评论按钮
        btnComment.setOnClickListener(v -> showCommentInput());
        
        // 设置点赞按钮
        btnLikePost.setOnClickListener(v -> toggleLikePost());
        
        // 获取当前用户信息
        TokenManager tokenManager = TokenManager.getInstance(this);
        currentUserId = tokenManager.getUserId();
        String userName = tokenManager.getUserName();
        
        // 设置用户头像（只在底部控制栏显示，输入框不显示头像）
        if (currentUserId != null && !currentUserId.isEmpty()) {
            try {
                Integer userId = Integer.parseInt(currentUserId);
                if (userAvatar != null) {
                    // 底部控制栏只显示头像，不显示用户名
                    userAvatar.setUser(userId, null);
                    android.util.Log.d("PostDetailActivity", "设置底部控制栏头像 - userId: " + userId);
                }
                // 输入框不显示头像，所以不需要设置userAvatarInput
            } catch (NumberFormatException e) {
                android.util.Log.e("PostDetailActivity", "用户ID格式错误: " + currentUserId, e);
            }
        } else {
            android.util.Log.w("PostDetailActivity", "当前用户ID为空，无法设置头像");
        }
    }
    
    private void initNetwork() {
        postService = ApiClient.getRetrofit().create(PostService.class);
        likeService = ApiClient.getRetrofit().create(LikeService.class);
    }
    
    /**
     * 加载帖子详情
     */
    private void loadPostDetail(Integer postId) {
        progressBar.setVisibility(View.VISIBLE);
        Call<PostDetailResponse> call = postService.getPostDetail(postId);
        call.enqueue(new Callback<PostDetailResponse>() {
            @Override
            public void onResponse(Call<PostDetailResponse> call, Response<PostDetailResponse> response) {
                progressBar.setVisibility(View.GONE);
                
                if (response.isSuccessful() && response.body() != null) {
                    PostDetailResponse postResponse = response.body();
                    if (postResponse.isSuccess()) {
                        Map<String, Object> postDetail = postResponse.getPost_detail();
                        if (postDetail != null) {
                            post = parsePostFromMap(postDetail);
                            
                            // 显示帖子
                            if (postItemView != null && post != null) {
                                postItemView.bind(post);
                            } else {
                                android.util.Log.e("PostDetailActivity", "postItemView is null or post is null");
                            }
                            
                            // 检查是否是自己的帖子，显示删除按钮
                            if (post != null && post.getAuthorId() != null && currentUserId != null) {
                                try {
                                    Integer authorId = post.getAuthorId();
                                    Integer userId = Integer.parseInt(currentUserId);
                                    if (authorId.equals(userId)) {
                                        if (btnDeletePost != null) {
                                            btnDeletePost.setVisibility(View.VISIBLE);
                                            btnDeletePost.setOnClickListener(v -> showDeletePostDialog());
                                        }
                                    }
                                } catch (NumberFormatException e) {
                                    // 忽略
                                }
                            }
                            
                            // 初始化点赞按钮状态
                            updateLikeButtonState();
                        } else {
                            android.util.Log.e("PostDetailActivity", "API response post_detail is null");
                            Toast.makeText(PostDetailActivity.this, "帖子数据格式错误", Toast.LENGTH_SHORT).show();
                        }
                    } else {
                        String errorMsg = postResponse.getMessage();
                        if (errorMsg == null || errorMsg.isEmpty()) {
                            errorMsg = "加载帖子失败";
                        }
                        Toast.makeText(PostDetailActivity.this, errorMsg, Toast.LENGTH_SHORT).show();
                    }
                } else {
                    String errorMsg = ErrorHandler.getErrorMessage(response);
                    Toast.makeText(PostDetailActivity.this, "加载失败：" + errorMsg, Toast.LENGTH_SHORT).show();
                }
            }
            
            @Override
            public void onFailure(Call<PostDetailResponse> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                String errorMsg = ErrorHandler.getErrorMessage(t);
                android.util.Log.e("PostDetailActivity", "加载帖子失败", t);
                Toast.makeText(PostDetailActivity.this, "加载失败：" + errorMsg, Toast.LENGTH_SHORT).show();
            }
        });
    }
    
    /**
     * 从Map解析Post对象
     * 根据web项目，字段名是 poster_id 和 poster_name
     */
    private Post parsePostFromMap(Map<String, Object> map) {
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
        // 根据web项目，字段名是 poster_name 和 poster_id
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
        return post;
    }
    
    /**
     * 加载评论列表
     */
    private void loadComments(Integer postId, int page) {
        if (isLoading || allLoaded) {
            return;
        }
        
        isLoading = true;
        if (page == 1) {
            progressBar.setVisibility(View.VISIBLE);
        }
        
        Call<ReplyListResponse> call = postService.getReplyList(postId, page, 20);
        call.enqueue(new Callback<ReplyListResponse>() {
            @Override
            public void onResponse(Call<ReplyListResponse> call, Response<ReplyListResponse> response) {
                isLoading = false;
                progressBar.setVisibility(View.GONE);
                
                if (response.isSuccessful() && response.body() != null) {
                    ReplyListResponse replyResponse = response.body();
                    if (replyResponse.isSuccess()) {
                        List<Map<String, Object>> replyList = replyResponse.getReply_list();
                        
                        if (replyList != null) {
                            if (!replyList.isEmpty()) {
                                List<Reply> newReplies = parseRepliesFromList(replyList);
                                if (page == 1) {
                                    commentList.clear();
                                }
                                commentList.addAll(newReplies);
                                commentAdapter.notifyDataSetChanged();
                                currentPage = page;
                                
                                // 使用 total_pages 和 current_page 判断是否加载完成
                                Integer totalPages = replyResponse.getTotal_pages();
                                Integer currentPageNum = replyResponse.getCurrent_page();
                                if (totalPages != null && currentPageNum != null) {
                                    if (totalPages > 0 && currentPageNum >= totalPages) {
                                        allLoaded = true;
                                    }
                                } else {
                                    // 如果没有分页信息，使用列表大小判断
                                    if (replyList.size() < 20) {
                                        allLoaded = true;
                                    }
                                }
                            } else {
                                if (page == 1) {
                                    commentList.clear();
                                    commentAdapter.notifyDataSetChanged();
                                }
                                allLoaded = true;
                            }
                            
                            // 更新空状态显示
                            updateEmptyState();
                        } else {
                            android.util.Log.e("PostDetailActivity", "API response reply_list is null");
                            if (page == 1) {
                                commentList.clear();
                                commentAdapter.notifyDataSetChanged();
                                updateEmptyState();
                            }
                        }
                    } else {
                        String errorMsg = replyResponse.getMessage();
                        if (errorMsg == null || errorMsg.isEmpty()) {
                            errorMsg = "加载评论失败";
                        }
                        android.util.Log.e("PostDetailActivity", "加载评论失败: " + errorMsg);
                        if (page == 1) {
                            Toast.makeText(PostDetailActivity.this, errorMsg, Toast.LENGTH_SHORT).show();
                        }
                    }
                } else {
                    String errorMsg = ErrorHandler.getErrorMessage(response);
                    android.util.Log.e("PostDetailActivity", "加载评论失败: " + errorMsg);
                    if (page == 1) {
                        Toast.makeText(PostDetailActivity.this, "加载评论失败：" + errorMsg, Toast.LENGTH_SHORT).show();
                    }
                }
            }
            
            @Override
            public void onFailure(Call<ReplyListResponse> call, Throwable t) {
                isLoading = false;
                progressBar.setVisibility(View.GONE);
                String errorMsg = ErrorHandler.getErrorMessage(t);
                android.util.Log.e("PostDetailActivity", "加载评论失败", t);
                Toast.makeText(PostDetailActivity.this, "加载评论失败：" + errorMsg, Toast.LENGTH_SHORT).show();
            }
        });
    }
    
    /**
     * 从List解析Reply对象列表
     */
    private List<Reply> parseRepliesFromList(List<Map<String, Object>> list) {
        List<Reply> replies = new ArrayList<>();
        for (Map<String, Object> map : list) {
            Reply reply = new Reply();
            if (map.containsKey("reply_id")) {
                reply.setId(((Number) map.get("reply_id")).intValue());
            }
            if (map.containsKey("reply_content")) {
                reply.setContent((String) map.get("reply_content"));
            }
            if (map.containsKey("replier_name")) {
                reply.setAuthorName((String) map.get("replier_name"));
            }
            if (map.containsKey("replier_id")) {
                reply.setAuthorId(((Number) map.get("replier_id")).intValue());
            }
            if (map.containsKey("like_count")) {
                reply.setLikeNum(((Number) map.get("like_count")).intValue());
            }
            if (map.containsKey("reply_time")) {
                reply.setPublishTime((String) map.get("reply_time"));
            }
            if (map.containsKey("if_like")) {
                reply.setIfLike((Boolean) map.get("if_like"));
            }
            if (map.containsKey("parent_reply_id")) {
                Object parentId = map.get("parent_reply_id");
                if (parentId != null) {
                    reply.setParentReplyId(((Number) parentId).intValue());
                }
            }
            replies.add(reply);
        }
        return replies;
    }
    
    /**
     * 提交评论
     */
    private void submitComment() {
        if (post == null) {
            return;
        }
        
        String originalContent = etComment.getText() != null ? etComment.getText().toString().trim() : "";
        if (TextUtils.isEmpty(originalContent)) {
            Toast.makeText(this, "请输入评论内容", Toast.LENGTH_SHORT).show();
            return;
        }
        
        if (originalContent.length() < 5) {
            Toast.makeText(this, "评论内容过短", Toast.LENGTH_SHORT).show();
            return;
        }
        
        // 根据web项目，如果正在回复某个评论，使用addHeaderToReply格式
        // 格式：@authorName\nparentReplyId\ncontent
        final String content;
        if (replyingToReply != null) {
            content = "@" + replyingToReply.getAuthorName() + "\n" + replyingToReply.getId() + "\n" + originalContent;
        } else {
            content = originalContent;
        }
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("post_id", post.getId());
        requestBody.put("reply_content", content);
        if (replyingToReply != null) {
            requestBody.put("parent_reply_id", replyingToReply.getId());
        }
        
        progressBar.setVisibility(View.VISIBLE);
        Call<CreateReplyResponse> call = postService.createReply(requestBody);
        call.enqueue(new Callback<CreateReplyResponse>() {
            @Override
            public void onResponse(Call<CreateReplyResponse> call, Response<CreateReplyResponse> response) {
                progressBar.setVisibility(View.GONE);
                
                if (response.isSuccessful() && response.body() != null) {
                    CreateReplyResponse replyResponse = response.body();
                    if (replyResponse.isSuccess()) {
                        Integer replyId = replyResponse.getReply_id();
                        
                        if (replyId != null) {
                            // 创建本地评论对象
                            Reply newReply = new Reply();
                            newReply.setId(replyId);
                            // 根据web项目，保存的内容应该是包含@格式的完整内容
                            newReply.setContent(content);
                            TokenManager tokenManager = TokenManager.getInstance(PostDetailActivity.this);
                            newReply.setAuthorName(tokenManager.getUserName());
                            if (currentUserId != null) {
                                try {
                                    newReply.setAuthorId(Integer.parseInt(currentUserId));
                                } catch (NumberFormatException e) {
                                    // 忽略
                                }
                            }
                            newReply.setLikeNum(0);
                            newReply.setIfLike(false);
                            newReply.setPublishTime(new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss", java.util.Locale.getDefault()).format(new java.util.Date()));
                            if (replyingToReply != null) {
                                newReply.setParentReplyId(replyingToReply.getId());
                            }
                            
                            // 添加到列表顶部
                            commentList.add(0, newReply);
                            commentAdapter.notifyItemInserted(0);
                            recyclerViewComments.scrollToPosition(0);
                            
                            // 清空输入框并隐藏输入栏
                            hideCommentInput();
                            
                            // 更新帖子回复数
                            if (post != null && post.getReplyNum() != null) {
                                post.setReplyNum(post.getReplyNum() + 1);
                                postItemView.bind(post);
                            }
                            
                            Toast.makeText(PostDetailActivity.this, "评论成功", Toast.LENGTH_SHORT).show();
                            updateEmptyState();
                        }
                    } else {
                        String errorMsg = ErrorHandler.getErrorMessage(response);
                        Toast.makeText(PostDetailActivity.this, "评论失败：" + errorMsg, Toast.LENGTH_SHORT).show();
                    }
                } else {
                    String errorMsg = ErrorHandler.getErrorMessage(response);
                    Toast.makeText(PostDetailActivity.this, "评论失败：" + errorMsg, Toast.LENGTH_SHORT).show();
                }
            }
            
            @Override
            public void onFailure(Call<CreateReplyResponse> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                String errorMsg = ErrorHandler.getErrorMessage(t);
                Toast.makeText(PostDetailActivity.this, "评论失败：" + errorMsg, Toast.LENGTH_SHORT).show();
            }
        });
    }
    
    /**
     * 为评论加载父级评论内容
     */
    private void loadParentReplyForComment(Integer parentReplyId, CommentItemView.OnParentReplyLoadedListener listener) {
        Call<ReplyDetailResponse> call = postService.getReplyDetail(parentReplyId);
        call.enqueue(new Callback<ReplyDetailResponse>() {
            @Override
            public void onResponse(Call<ReplyDetailResponse> call, Response<ReplyDetailResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    ReplyDetailResponse replyResponse = response.body();
                    if (replyResponse.isSuccess()) {
                        Map<String, Object> replyDetail = replyResponse.getReply_detail();
                        
                        if (replyDetail != null) {
                            Reply parentReply = parseReplyFromMap(replyDetail);
                            if (listener != null) {
                                listener.onParentReplyLoaded(parentReply);
                            }
                        } else {
                            android.util.Log.e("PostDetailActivity", "API response reply_detail is null");
                            if (listener != null) {
                                listener.onParentReplyLoaded(null);
                            }
                        }
                    } else {
                        android.util.Log.e("PostDetailActivity", "加载父级评论失败: " + replyResponse.getMessage());
                        if (listener != null) {
                            listener.onParentReplyLoaded(null);
                        }
                    }
                } else {
                    android.util.Log.e("PostDetailActivity", "加载父级评论失败: " + ErrorHandler.getErrorMessage(response));
                    if (listener != null) {
                        listener.onParentReplyLoaded(null);
                    }
                }
            }
            
            @Override
            public void onFailure(Call<ReplyDetailResponse> call, Throwable t) {
                android.util.Log.e("PostDetailActivity", "加载父级评论失败", t);
                if (listener != null) {
                    listener.onParentReplyLoaded(null);
                }
            }
        });
    }
    
    /**
     * 显示父级评论对话框
     */
    private void showParentReplyDialog(Integer parentReplyId) {
        loadParentReplyForComment(parentReplyId, parentReply -> {
            if (parentReply != null) {
                // 显示父级评论对话框
                showReplyDialog(parentReply);
            } else {
                Toast.makeText(PostDetailActivity.this, "加载父级评论失败", Toast.LENGTH_SHORT).show();
            }
        });
    }
    
    /**
     * 从Map解析Reply对象
     */
    private Reply parseReplyFromMap(Map<String, Object> map) {
        Reply reply = new Reply();
        if (map.containsKey("reply_id")) {
            reply.setId(((Number) map.get("reply_id")).intValue());
        }
        if (map.containsKey("reply_content")) {
            reply.setContent((String) map.get("reply_content"));
        }
        if (map.containsKey("replier_name")) {
            reply.setAuthorName((String) map.get("replier_name"));
        }
        if (map.containsKey("replier_id")) {
            reply.setAuthorId(((Number) map.get("replier_id")).intValue());
        }
        if (map.containsKey("like_count")) {
            reply.setLikeNum(((Number) map.get("like_count")).intValue());
        }
        if (map.containsKey("reply_time")) {
            reply.setPublishTime((String) map.get("reply_time"));
        }
        if (map.containsKey("if_like")) {
            reply.setIfLike((Boolean) map.get("if_like"));
        }
        if (map.containsKey("parent_reply_id")) {
            Object parentReplyIdObj = map.get("parent_reply_id");
            if (parentReplyIdObj != null) {
                if (parentReplyIdObj instanceof Number) {
                    reply.setParentReplyId(((Number) parentReplyIdObj).intValue());
                }
            }
        }
        return reply;
    }
    
    /**
     * 显示评论对话框
     */
    private void showReplyDialog(Reply reply) {
        View dialogView = getLayoutInflater().inflate(R.layout.dialog_parent_reply, null);
        CommentItemView commentView = dialogView.findViewById(R.id.comment_item_view);
        commentView.bind(reply);
        commentView.setOnShowParentClickListener(parentId -> {
            // 递归显示父级评论
            showParentReplyDialog(parentId);
        });
        
        new AlertDialog.Builder(this)
            .setView(dialogView)
            .setPositiveButton("关闭", null)
            .show();
    }
    
    /**
     * 显示删除帖子对话框
     */
    private void showDeletePostDialog() {
        new AlertDialog.Builder(this)
            .setTitle("删除帖子")
            .setMessage("确定要删除这个帖子吗？")
            .setPositiveButton("删除", (dialog, which) -> deletePost())
            .setNegativeButton("取消", null)
            .show();
    }
    
    /**
     * 删除帖子
     */
    private void deletePost() {
        if (post == null) {
            return;
        }
        
        progressBar.setVisibility(View.VISIBLE);
        Map<String, Integer> requestBody = new HashMap<>();
        requestBody.put("post_id", post.getId());
        
        Call<DeletePostResponse> call = postService.deletePost(requestBody);
        call.enqueue(new Callback<DeletePostResponse>() {
            @Override
            public void onResponse(Call<DeletePostResponse> call, Response<DeletePostResponse> response) {
                progressBar.setVisibility(View.GONE);
                
                if (response.isSuccessful() && response.body() != null) {
                    DeletePostResponse deleteResponse = response.body();
                    if (deleteResponse.isSuccess()) {
                        Toast.makeText(PostDetailActivity.this, "删除成功", Toast.LENGTH_SHORT).show();
                        setResult(RESULT_OK);
                        finish();
                    } else {
                        String errorMsg = deleteResponse.getMessage();
                        if (errorMsg == null || errorMsg.isEmpty()) {
                            errorMsg = "删除失败";
                        }
                        Toast.makeText(PostDetailActivity.this, errorMsg, Toast.LENGTH_SHORT).show();
                    }
                } else {
                    String errorMsg = ErrorHandler.getErrorMessage(response);
                    Toast.makeText(PostDetailActivity.this, "删除失败：" + errorMsg, Toast.LENGTH_SHORT).show();
                }
            }
            
            @Override
            public void onFailure(Call<DeletePostResponse> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                String errorMsg = ErrorHandler.getErrorMessage(t);
                Toast.makeText(PostDetailActivity.this, "删除失败：" + errorMsg, Toast.LENGTH_SHORT).show();
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
     * 更新点赞按钮状态
     */
    private void updateLikeButtonState() {
        if (btnLikePost == null || post == null) {
            return;
        }
        
        boolean isLiked = post.getIfLike() != null && post.getIfLike();
        btnLikePost.setSelected(isLiked);
        
        // 根据点赞状态设置颜色：已点赞为红色，未点赞为灰色
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
            int color = isLiked ? getColor(android.R.color.holo_red_dark) : 
                getColor(com.sharesdu.android.common.R.color.text_color_secondary);
            btnLikePost.setColorFilter(color);
        } else {
            int color = isLiked ? getResources().getColor(android.R.color.holo_red_dark) : 
                getResources().getColor(com.sharesdu.android.common.R.color.text_color_secondary);
            btnLikePost.setColorFilter(color);
        }
    }
    
    /**
     * 切换帖子点赞状态
     */
    private void toggleLikePost() {
        if (post == null || post.getId() == null) {
            return;
        }
        
        // 获取当前点赞状态
        boolean isLiked = post.getIfLike() != null && post.getIfLike();
        
        // 创建请求体
        Map<String, Integer> requestBody = new HashMap<>();
        requestBody.put("content_type", 1); // 1 表示 post（帖子）
        requestBody.put("content_id", post.getId());
        
        // 根据当前状态调用不同的接口
        Call<SimpleResponse> call;
        if (isLiked) {
            // 当前已点赞，调用取消点赞接口
            call = likeService.unlike(requestBody);
            android.util.Log.d("PostDetailActivity", "取消点赞帖子 ID: " + post.getId());
        } else {
            // 当前未点赞，调用点赞接口
            call = likeService.like(requestBody);
            android.util.Log.d("PostDetailActivity", "点赞帖子 ID: " + post.getId());
        }
        
        // 乐观更新UI（立即更新，如果失败再回滚）
        boolean newLikeState = !isLiked;
        Integer currentLikeNum = post.getLikeNum() != null ? post.getLikeNum() : 0;
        post.setIfLike(newLikeState);
        post.setLikeNum(newLikeState ? currentLikeNum + 1 : Math.max(0, currentLikeNum - 1));
        
        // 更新UI
        updateLikeButtonState();
        
        // 保存原始状态用于回滚
        final boolean originalLikeState = isLiked;
        final Integer originalLikeNum = currentLikeNum;
        
        // 发送请求
        call.enqueue(new Callback<SimpleResponse>() {
            @Override
            public void onResponse(Call<SimpleResponse> call, Response<SimpleResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    SimpleResponse likeResponse = response.body();
                    if (likeResponse.isSuccess()) {
                        // 成功，UI已经通过乐观更新提前更新，无需额外操作
                        android.util.Log.d("PostDetailActivity", 
                            (originalLikeState ? "取消点赞" : "点赞") + "成功，帖子 ID: " + post.getId());
                    } else {
                        // 失败，回滚UI状态
                        post.setIfLike(originalLikeState);
                        post.setLikeNum(originalLikeNum);
                        updateLikeButtonState();
                        
                        String errorMsg = likeResponse.getMessage();
                        if (errorMsg == null || errorMsg.isEmpty()) {
                            errorMsg = "操作失败";
                        }
                        Toast.makeText(PostDetailActivity.this, errorMsg, Toast.LENGTH_SHORT).show();
                    }
                } else {
                    // 失败，回滚UI状态
                    post.setIfLike(originalLikeState);
                    post.setLikeNum(originalLikeNum);
                    updateLikeButtonState();
                    
                    String errorMsg = ErrorHandler.getErrorMessage(response);
                    Toast.makeText(PostDetailActivity.this, "操作失败：" + errorMsg, Toast.LENGTH_SHORT).show();
                }
            }
            
            @Override
            public void onFailure(Call<SimpleResponse> call, Throwable t) {
                // 失败，回滚UI状态
                post.setIfLike(originalLikeState);
                post.setLikeNum(originalLikeNum);
                updateLikeButtonState();
                
                String errorMsg = ErrorHandler.getErrorMessage(t);
                android.util.Log.e("PostDetailActivity", "点赞/取消点赞失败", t);
                Toast.makeText(PostDetailActivity.this, "操作失败：" + errorMsg, Toast.LENGTH_SHORT).show();
            }
        });
    }
    
    /**
     * 显示评论输入框
     */
    private void showCommentInput() {
        if (layoutCommentInput != null) {
            layoutCommentInput.setVisibility(View.VISIBLE);
        }
        if (layoutBottomBar != null) {
            layoutBottomBar.setVisibility(View.GONE);
        }
        if (etComment != null) {
            // 如果之前没有回复某个评论，清除回复状态
            if (replyingToReply == null) {
                etComment.setHint("写评论...");
            }
            etComment.requestFocus();
            // 显示软键盘
            android.view.inputmethod.InputMethodManager imm = 
                (android.view.inputmethod.InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
            if (imm != null) {
                imm.showSoftInput(etComment, android.view.inputmethod.InputMethodManager.SHOW_IMPLICIT);
            }
        }
    }
    
    /**
     * 隐藏评论输入框
     */
    private void hideCommentInput() {
        if (layoutCommentInput != null) {
            layoutCommentInput.setVisibility(View.GONE);
        }
        if (layoutBottomBar != null) {
            layoutBottomBar.setVisibility(View.VISIBLE);
        }
        if (etComment != null) {
            etComment.setText("");
            etComment.setHint("写评论...");
            replyingToReply = null;
            // 隐藏软键盘
            android.view.inputmethod.InputMethodManager imm = 
                (android.view.inputmethod.InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
            if (imm != null) {
                imm.hideSoftInputFromWindow(etComment.getWindowToken(), 0);
            }
        }
    }
    
    /**
     * 评论列表适配器
     */
    private class CommentAdapter extends RecyclerView.Adapter<CommentAdapter.CommentViewHolder> {
        @Override
        public CommentViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
            CommentItemView itemView = new CommentItemView(PostDetailActivity.this);
            return new CommentViewHolder(itemView);
        }
        
        @Override
        public void onBindViewHolder(CommentViewHolder holder, int position) {
            Reply reply = commentList.get(position);
            // 最后一个item不显示分隔线
            holder.commentItemView.setDividerVisible(position < getItemCount() - 1);
            
            // 设置加载父级评论监听
            holder.commentItemView.setOnLoadParentReplyListener((parentReplyId, listener) -> {
                loadParentReplyForComment(parentReplyId, listener);
            });
            
            // 绑定评论数据（会自动加载父级评论）
            holder.commentItemView.bind(reply);
            
            // 设置点击事件
            holder.commentItemView.setOnReplyClickListener(replyItem -> {
                replyingToReply = replyItem;
                showCommentInput();
                if (etComment != null) {
                    etComment.setHint("回复 @" + replyItem.getAuthorName() + "：");
                }
            });
            
            holder.commentItemView.setOnDeleteClickListener(replyItem -> {
                showDeleteCommentDialog(replyItem);
            });
            
            holder.commentItemView.setOnShowParentClickListener(parentReplyId -> {
                showParentReplyDialog(parentReplyId);
            });
            
            holder.commentItemView.setOnLikeClickListener(replyItem -> {
                toggleLikeReply(replyItem, position);
            });
        }
        
        @Override
        public int getItemCount() {
            return commentList.size();
        }
        
        class CommentViewHolder extends RecyclerView.ViewHolder {
            CommentItemView commentItemView;
            
            CommentViewHolder(CommentItemView itemView) {
                super(itemView);
                this.commentItemView = itemView;
            }
        }
    }
    
    /**
     * 显示删除评论对话框
     */
    private void showDeleteCommentDialog(Reply reply) {
        new AlertDialog.Builder(this)
            .setTitle("删除评论")
            .setMessage("确定要删除这条评论吗？")
            .setPositiveButton("删除", (dialog, which) -> deleteComment(reply))
            .setNegativeButton("取消", null)
            .show();
    }
    
    /**
     * 删除评论
     */
    private void deleteComment(Reply reply) {
        if (reply == null || reply.getId() == null) {
            return;
        }
        
        progressBar.setVisibility(View.VISIBLE);
        Map<String, Integer> requestBody = new HashMap<>();
        requestBody.put("reply_id", reply.getId());
        
        Call<DeleteReplyResponse> call = postService.deleteReply(requestBody);
        call.enqueue(new Callback<DeleteReplyResponse>() {
            @Override
            public void onResponse(Call<DeleteReplyResponse> call, Response<DeleteReplyResponse> response) {
                progressBar.setVisibility(View.GONE);
                
                if (response.isSuccessful() && response.body() != null) {
                    DeleteReplyResponse deleteResponse = response.body();
                    if (deleteResponse.isSuccess()) {
                        // 从列表中移除
                        int position = commentList.indexOf(reply);
                        if (position >= 0) {
                            commentList.remove(position);
                            commentAdapter.notifyItemRemoved(position);
                            updateEmptyState();
                            
                            // 更新帖子回复数
                            if (post != null && post.getReplyNum() != null && post.getReplyNum() > 0) {
                                post.setReplyNum(post.getReplyNum() - 1);
                                postItemView.bind(post);
                            }
                        }
                        Toast.makeText(PostDetailActivity.this, "删除成功", Toast.LENGTH_SHORT).show();
                    } else {
                        String errorMsg = deleteResponse.getMessage();
                        if (errorMsg == null || errorMsg.isEmpty()) {
                            errorMsg = "删除失败";
                        }
                        Toast.makeText(PostDetailActivity.this, errorMsg, Toast.LENGTH_SHORT).show();
                    }
                } else {
                    String errorMsg = ErrorHandler.getErrorMessage(response);
                    Toast.makeText(PostDetailActivity.this, "删除失败：" + errorMsg, Toast.LENGTH_SHORT).show();
                }
            }
            
            @Override
            public void onFailure(Call<DeleteReplyResponse> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                String errorMsg = ErrorHandler.getErrorMessage(t);
                Toast.makeText(PostDetailActivity.this, "删除失败：" + errorMsg, Toast.LENGTH_SHORT).show();
            }
        });
    }
    
    /**
     * 切换评论点赞状态
     * 实现点赞和取消点赞功能：
     * - 如果当前已点赞，则取消点赞（调用 unlike 接口）
     * - 如果当前未点赞，则点赞（调用 like 接口）
     */
    private void toggleLikeReply(Reply reply, int position) {
        if (reply == null || reply.getId() == null) {
            return;
        }
        
        // 获取当前点赞状态
        boolean isLiked = reply.getIfLike() != null && reply.getIfLike();
        
        // 创建请求体
        Map<String, Integer> requestBody = new HashMap<>();
        requestBody.put("content_type", 2); // 2 表示 reply（评论）
        requestBody.put("content_id", reply.getId());
        
        // 根据当前状态调用不同的接口
        Call<SimpleResponse> call;
        if (isLiked) {
            // 当前已点赞，调用取消点赞接口
            call = likeService.unlike(requestBody);
            android.util.Log.d("PostDetailActivity", "取消点赞评论 ID: " + reply.getId());
        } else {
            // 当前未点赞，调用点赞接口
            call = likeService.like(requestBody);
            android.util.Log.d("PostDetailActivity", "点赞评论 ID: " + reply.getId());
        }
        
        // 乐观更新UI（立即更新，如果失败再回滚）
        boolean newLikeState = !isLiked;
        Integer currentLikeNum = reply.getLikeNum() != null ? reply.getLikeNum() : 0;
        reply.setIfLike(newLikeState);
        reply.setLikeNum(newLikeState ? currentLikeNum + 1 : Math.max(0, currentLikeNum - 1));
        
        // 更新UI
        commentAdapter.notifyItemChanged(position);
        
        // 保存原始状态用于回滚
        final boolean originalLikeState = isLiked;
        final Integer originalLikeNum = currentLikeNum;
        
        // 发送请求
        call.enqueue(new Callback<SimpleResponse>() {
            @Override
            public void onResponse(Call<SimpleResponse> call, Response<SimpleResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    SimpleResponse likeResponse = response.body();
                    if (likeResponse.isSuccess()) {
                        // 成功，UI已经通过乐观更新提前更新，无需额外操作
                        android.util.Log.d("PostDetailActivity", 
                            (originalLikeState ? "取消点赞" : "点赞") + "成功，评论 ID: " + reply.getId());
                    } else {
                        // 失败，回滚UI状态
                        reply.setIfLike(originalLikeState);
                        reply.setLikeNum(originalLikeNum);
                        commentAdapter.notifyItemChanged(position);
                        
                        String errorMsg = likeResponse.getMessage();
                        if (errorMsg == null || errorMsg.isEmpty()) {
                            errorMsg = "操作失败";
                        }
                        Toast.makeText(PostDetailActivity.this, errorMsg, Toast.LENGTH_SHORT).show();
                    }
                } else {
                    // 失败，回滚UI状态
                    reply.setIfLike(originalLikeState);
                    reply.setLikeNum(originalLikeNum);
                    commentAdapter.notifyItemChanged(position);
                    
                    String errorMsg = ErrorHandler.getErrorMessage(response);
                    Toast.makeText(PostDetailActivity.this, "操作失败：" + errorMsg, Toast.LENGTH_SHORT).show();
                }
            }
            
            @Override
            public void onFailure(Call<SimpleResponse> call, Throwable t) {
                // 失败，回滚UI状态
                reply.setIfLike(originalLikeState);
                reply.setLikeNum(originalLikeNum);
                commentAdapter.notifyItemChanged(position);
                
                String errorMsg = ErrorHandler.getErrorMessage(t);
                android.util.Log.e("PostDetailActivity", "点赞/取消点赞失败", t);
                Toast.makeText(PostDetailActivity.this, "操作失败：" + errorMsg, Toast.LENGTH_SHORT).show();
            }
        });
    }
    
    /**
     * 启动PostDetailActivity的静态方法
     */
    public static void start(Context context, Integer postId) {
        Intent intent = new Intent(context, PostDetailActivity.class);
        intent.putExtra(EXTRA_POST_ID, postId);
        context.startActivity(intent);
    }
}

