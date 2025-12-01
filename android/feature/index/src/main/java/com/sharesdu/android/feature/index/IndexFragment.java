package com.sharesdu.android.feature.index;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ProgressBar;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;
import com.google.android.material.tabs.TabLayout;
import com.sharesdu.android.feature.index.R;
import com.sharesdu.android.common.adapter.IndexListAdapter;
import com.sharesdu.android.data.model.Article;
import com.sharesdu.android.data.model.Course;
import com.sharesdu.android.data.model.Post;
import com.sharesdu.android.core.network.ApiClient;
import com.sharesdu.android.core.network.ArticleService;
import com.sharesdu.android.core.network.response.ArticlePostListResponse;
import com.sharesdu.android.core.network.CourseService;
import com.sharesdu.android.core.network.PostService;
import com.sharesdu.android.core.utils.ErrorHandler;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 主页面 Fragment
 * 包含文章/帖子/课程三个选项卡，支持下拉刷新和无限滚动
 */
public class IndexFragment extends Fragment {
    private static final String TAG = "IndexFragment";
    private static final int PAGE_SIZE = 20;
    
    private TabLayout tabLayout;
    private SwipeRefreshLayout swipeRefresh;
    private RecyclerView recyclerView;
    private ProgressBar loadingMore;
    private View emptyView;
    private View loadingView; // 初始加载视图
    
    private IndexListAdapter adapter;
    private LinearLayoutManager layoutManager;
    
    // 当前选中的选项卡：0-文章, 1-帖子, 2-课程
    private int currentTab = 0;
    
    // 数据列表
    private List<Article> articleList = new ArrayList<>();
    private List<Post> postList = new ArrayList<>();
    private List<Course> courseList = new ArrayList<>();
    
    // 分页信息
    private int articlePage = 1;
    private int postPage = 1;
    private int coursePage = 1;
    
    // 加载状态（每个tab独立的状态）
    private boolean[] isLoadingArray = {false, false, false};
    private boolean[] allLoadedArray = {false, false, false};
    
    // 文章排序方式
    private String articleSort = "time";
    
    // 当前正在进行的请求（用于取消）
    private retrofit2.Call<?> currentCall = null;
    
    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_index, container, false);
    }
    
    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        
        initViews(view);
        setupRecyclerView();
        setupTabs();
        setupSwipeRefresh();
        
        // 默认加载文章列表（首次加载时显示加载视图）
        showLoadingView();
        loadData(0, true);
    }
    
    private void initViews(View view) {
        tabLayout = view.findViewById(R.id.tab_layout);
        swipeRefresh = view.findViewById(R.id.swipe_refresh);
        recyclerView = view.findViewById(R.id.recycler_view);
        loadingMore = view.findViewById(R.id.loading_more);
        emptyView = view.findViewById(R.id.empty_view);
        loadingView = view.findViewById(R.id.loading_view);
    }
    
    private void setupRecyclerView() {
        layoutManager = new LinearLayoutManager(getContext());
        recyclerView.setLayoutManager(layoutManager);
        
        adapter = new IndexListAdapter(getContext(), currentTab, new ArrayList<>());
        recyclerView.setAdapter(adapter);
        
        // 无限滚动监听
        recyclerView.addOnScrollListener(new RecyclerView.OnScrollListener() {
            @Override
            public void onScrolled(@NonNull RecyclerView recyclerView, int dx, int dy) {
                super.onScrolled(recyclerView, dx, dy);
                
                // 只在当前tab的数据加载时检查滚动
                if (isLoadingArray[currentTab] || allLoadedArray[currentTab]) {
                    return;
                }
                
                int visibleItemCount = layoutManager.getChildCount();
                int totalItemCount = layoutManager.getItemCount();
                int firstVisibleItemPosition = layoutManager.findFirstVisibleItemPosition();
                
                // 当滚动到底部附近时加载更多
                if (firstVisibleItemPosition + visibleItemCount >= totalItemCount - 3) {
                    loadMore();
                }
            }
        });
    }
    
    private void setupTabs() {
        tabLayout.addOnTabSelectedListener(new TabLayout.OnTabSelectedListener() {
            @Override
            public void onTabSelected(TabLayout.Tab tab) {
                int position = tab.getPosition();
                switchTab(position);
            }
            
            @Override
            public void onTabUnselected(TabLayout.Tab tab) {}
            
            @Override
            public void onTabReselected(TabLayout.Tab tab) {}
        });
    }
    
    private void setupSwipeRefresh() {
        swipeRefresh.setColorSchemeColors(
            getResources().getColor(com.sharesdu.android.common.R.color.primary_theme_color, null)
        );
        swipeRefresh.setOnRefreshListener(() -> {
            loadData(currentTab, true);
        });
    }
    
    private void switchTab(int tab) {
        // 如果切换到相同的tab，不执行任何操作
        if (tab == currentTab) {
            return;
        }
        
        // 取消之前的请求（如果有）
        if (currentCall != null && !currentCall.isCanceled()) {
            currentCall.cancel();
            currentCall = null;
        }
        
        // 更新当前tab
        currentTab = tab;
        
        // 获取当前tab的数据
        List<?> currentData = getCurrentList();
        
        // 更新适配器：同时更新itemType和数据
        // 这会触发notifyDataSetChanged()，强制RecyclerView重新创建所有ViewHolder
        adapter.updateItemTypeAndData(tab, currentData);
        
        // 如果当前列表为空，显示加载视图
        if (currentData.isEmpty()) {
            showLoadingView();
        } else {
            hideLoadingView();
        }
        
        // 更新UI状态（显示/隐藏空视图）
        updateEmptyView();
        
        // 如果当前列表为空且没有正在加载，则加载数据
        if (currentData.isEmpty() && !isLoadingArray[tab]) {
            loadData(tab, true);
        }
    }
    
    private void loadData(int tab, boolean refresh) {
        // 检查当前tab是否正在加载
        if (isLoadingArray[tab]) {
            return;
        }
        
        isLoadingArray[tab] = true;
        
        if (refresh) {
            // 只重置当前tab的分页和状态
            switch (tab) {
                case 0:
                    articlePage = 1;
                    articleList.clear();
                    break;
                case 1:
                    postPage = 1;
                    postList.clear();
                    break;
                case 2:
                    coursePage = 1;
                    courseList.clear();
                    break;
            }
            allLoadedArray[tab] = false;
            
            // 刷新时，清空数据后，如果数据为空，显示加载视图
            // 这确保在loadData被直接调用时（如下拉刷新）也能显示加载视图
            List<?> currentData = getCurrentList();
            if (currentData.isEmpty()) {
                showLoadingView();
            }
        }
        
        switch (tab) {
            case 0:
                loadArticles(refresh);
                break;
            case 1:
                loadPosts(refresh);
                break;
            case 2:
                loadCourses(refresh);
                break;
        }
    }
    
    private void loadArticles(boolean refresh) {
        ArticleService service = ApiClient.getRetrofit().create(ArticleService.class);
        Call<com.sharesdu.android.core.network.response.ArticleListResponse> call = service.getArticleList(
            articlePage, PAGE_SIZE, null, articleSort
        );
        
        // 保存当前请求，用于取消
        currentCall = call;
        
        call.enqueue(new Callback<com.sharesdu.android.core.network.response.ArticleListResponse>() {
            @Override
            public void onResponse(Call<com.sharesdu.android.core.network.response.ArticleListResponse> call, 
                                 Response<com.sharesdu.android.core.network.response.ArticleListResponse> response) {
                // 检查是否还是当前tab，如果不是则忽略响应
                if (currentTab != 0) {
                    return;
                }
                
                isLoadingArray[0] = false;
                swipeRefresh.setRefreshing(false);
                loadingMore.setVisibility(View.GONE);
                hideLoadingView(); // 隐藏加载视图
                
                // 清除当前请求引用
                if (currentCall == call) {
                    currentCall = null;
                }
                
                if (response.isSuccessful() && response.body() != null) {
                    com.sharesdu.android.core.network.response.ArticleListResponse articleResponse = response.body();
                    Log.d(TAG, "Article response status: " + articleResponse.getStatus());
                    if (articleResponse.isSuccess()) {
                        // article_list 在响应根级别，不在 data 中
                        List<Map<String, Object>> list = articleResponse.getArticle_list();
                        Log.d(TAG, "Article list size: " + (list != null ? list.size() : 0));
                        
                        if (list != null && !list.isEmpty()) {
                            List<Article> articles = parseArticleList(list);
                            Log.d(TAG, "Parsed articles count: " + articles.size());
                            
                            // refresh时已经在loadData中清空了，这里直接addAll
                            articleList.addAll(articles);
                            
                            if (articles.size() < PAGE_SIZE) {
                                allLoadedArray[0] = true;
                            } else {
                                articlePage++;
                            }
                            
                            // 检查是否还是当前tab，如果是则更新适配器
                            if (currentTab == 0) {
                                adapter.updateData(articleList);
                                updateEmptyView();
                            }
                            return;
                        }
                        // 如果没有数据，也更新UI
                        Log.d(TAG, "No articles found");
                        // refresh时已经在loadData中清空了
                        if (currentTab == 0) {
                            adapter.updateData(articleList);
                            updateEmptyView();
                        }
                    } else {
                        String errorMsg = articleResponse.getMessage();
                        if (errorMsg == null || errorMsg.isEmpty()) {
                            errorMsg = ErrorHandler.getErrorMessage(response);
                        }
                        Log.e(TAG, "Article load failed: " + errorMsg);
                        if (currentTab == 0) {
                            showError(errorMsg);
                            adapter.updateData(articleList);
                            updateEmptyView();
                        }
                    }
                } else {
                    String errorMsg = ErrorHandler.getErrorMessage(response);
                    Log.e(TAG, "Article request failed: " + errorMsg);
                    if (currentTab == 0) {
                        showError(errorMsg);
                        adapter.updateData(articleList);
                        updateEmptyView();
                    }
                }
            }
            
            @Override
            public void onFailure(Call<com.sharesdu.android.core.network.response.ArticleListResponse> call, Throwable t) {
                // 检查是否还是当前tab，如果不是则忽略
                if (currentTab != 0) {
                    return;
                }
                
                // 如果是取消请求，不显示错误
                if (call.isCanceled()) {
                    isLoadingArray[0] = false;
                    return;
                }
                
                isLoadingArray[0] = false;
                swipeRefresh.setRefreshing(false);
                loadingMore.setVisibility(View.GONE);
                hideLoadingView(); // 隐藏加载视图
                
                // 清除当前请求引用
                if (currentCall == call) {
                    currentCall = null;
                }
                
                String errorMsg = ErrorHandler.getErrorMessage(t);
                if (currentTab == 0) {
                    showError(errorMsg);
                    adapter.updateData(articleList);
                    updateEmptyView();
                }
            }
        });
    }
    
    private void loadPosts(boolean refresh) {
        // 帖子列表需要 article_id，这里使用默认值 20（根据web实现）
        ArticleService service = ApiClient.getRetrofit().create(ArticleService.class);
        Call<ArticlePostListResponse> call = service.getPostListByArticleId(
            20, postPage, PAGE_SIZE
        );
        
        // 保存当前请求，用于取消
        currentCall = call;
        
        call.enqueue(new Callback<ArticlePostListResponse>() {
            @Override
            public void onResponse(Call<ArticlePostListResponse> call, 
                                 Response<ArticlePostListResponse> response) {
                // 检查是否还是当前tab，如果不是则忽略响应
                if (currentTab != 1) {
                    return;
                }
                
                isLoadingArray[1] = false;
                swipeRefresh.setRefreshing(false);
                loadingMore.setVisibility(View.GONE);
                hideLoadingView(); // 隐藏加载视图
                
                // 清除当前请求引用
                if (currentCall == call) {
                    currentCall = null;
                }
                
                if (response.isSuccessful() && response.body() != null) {
                    ArticlePostListResponse postResponse = response.body();
                    if (postResponse.isSuccess()) {
                        // post_list 在响应中
                        List<Map<String, Object>> list = postResponse.getPost_list();
                        if (list != null) {
                            
                            if (list != null && !list.isEmpty()) {
                                List<Post> posts = parsePostList(list);
                                // refresh时已经在loadData中清空了，这里直接addAll
                                postList.addAll(posts);
                                
                                if (posts.size() < PAGE_SIZE) {
                                    allLoadedArray[1] = true;
                                } else {
                                    postPage++;
                                }
                                
                                // 检查是否还是当前tab，如果是则更新适配器
                                if (currentTab == 1) {
                                    adapter.updateData(postList);
                                    updateEmptyView();
                                }
                                return;
                            }
                        }
                        // 如果没有数据，也更新UI
                        // refresh时已经在loadData中清空了
                        if (currentTab == 1) {
                            adapter.updateData(postList);
                            updateEmptyView();
                        }
                    } else {
                        String errorMsg = postResponse.getMessage();
                        if (errorMsg == null || errorMsg.isEmpty()) {
                            errorMsg = ErrorHandler.getErrorMessage(response);
                        }
                        if (currentTab == 1) {
                            showError(errorMsg);
                            adapter.updateData(postList);
                            updateEmptyView();
                        }
                    }
                } else {
                    String errorMsg = ErrorHandler.getErrorMessage(response);
                    if (currentTab == 1) {
                        showError(errorMsg);
                        adapter.updateData(postList);
                        updateEmptyView();
                    }
                }
            }
            
            @Override
            public void onFailure(Call<ArticlePostListResponse> call, Throwable t) {
                // 检查是否还是当前tab，如果不是则忽略
                if (currentTab != 1) {
                    return;
                }
                
                // 如果是取消请求，不显示错误
                if (call.isCanceled()) {
                    isLoadingArray[1] = false;
                    return;
                }
                
                isLoadingArray[1] = false;
                swipeRefresh.setRefreshing(false);
                loadingMore.setVisibility(View.GONE);
                hideLoadingView(); // 隐藏加载视图
                
                // 清除当前请求引用
                if (currentCall == call) {
                    currentCall = null;
                }
                
                String errorMsg = ErrorHandler.getErrorMessage(t);
                showError(errorMsg);
                adapter.updateData(postList);
                updateEmptyView();
            }
        });
    }
    
    private void loadCourses(boolean refresh) {
        CourseService service = ApiClient.getRetrofit().create(CourseService.class);
        Call<com.sharesdu.android.core.network.response.CourseListResponse> call = service.getCourseList(
            coursePage, PAGE_SIZE, null, null
        );
        
        // 保存当前请求，用于取消
        currentCall = call;
        
        call.enqueue(new Callback<com.sharesdu.android.core.network.response.CourseListResponse>() {
            @Override
            public void onResponse(Call<com.sharesdu.android.core.network.response.CourseListResponse> call, 
                                 Response<com.sharesdu.android.core.network.response.CourseListResponse> response) {
                // 检查是否还是当前tab，如果不是则忽略响应
                if (currentTab != 2) {
                    return;
                }
                
                isLoadingArray[2] = false;
                swipeRefresh.setRefreshing(false);
                loadingMore.setVisibility(View.GONE);
                hideLoadingView(); // 隐藏加载视图
                
                // 清除当前请求引用
                if (currentCall == call) {
                    currentCall = null;
                }
                
                if (response.isSuccessful() && response.body() != null) {
                    com.sharesdu.android.core.network.response.CourseListResponse courseResponse = response.body();
                    if (courseResponse.isSuccess()) {
                        // course_list 在响应根级别，不在 data 中
                        List<Map<String, Object>> list = courseResponse.getCourse_list();
                        
                        if (list != null && !list.isEmpty()) {
                            List<Course> courses = parseCourseList(list);
                            // refresh时已经在loadData中清空了，这里直接addAll
                            courseList.addAll(courses);
                            
                            if (courses.size() < PAGE_SIZE) {
                                allLoadedArray[2] = true;
                            } else {
                                coursePage++;
                            }
                            
                            // 检查是否还是当前tab，如果是则更新适配器
                            if (currentTab == 2) {
                                adapter.updateData(courseList);
                                updateEmptyView();
                            }
                            return;
                        }
                        // 如果没有数据，也更新UI
                        // refresh时已经在loadData中清空了
                        if (currentTab == 2) {
                            adapter.updateData(courseList);
                            updateEmptyView();
                        }
                    } else {
                        String errorMsg = courseResponse.getMessage();
                        if (errorMsg == null || errorMsg.isEmpty()) {
                            errorMsg = ErrorHandler.getErrorMessage(response);
                        }
                        if (currentTab == 2) {
                            showError(errorMsg);
                            adapter.updateData(courseList);
                            updateEmptyView();
                        }
                    }
                } else {
                    String errorMsg = ErrorHandler.getErrorMessage(response);
                    if (currentTab == 2) {
                        showError(errorMsg);
                        adapter.updateData(courseList);
                        updateEmptyView();
                    }
                }
            }
            
            @Override
            public void onFailure(Call<com.sharesdu.android.core.network.response.CourseListResponse> call, Throwable t) {
                // 检查是否还是当前tab，如果不是则忽略
                if (currentTab != 2) {
                    return;
                }
                
                // 如果是取消请求，不显示错误
                if (call.isCanceled()) {
                    isLoadingArray[2] = false;
                    return;
                }
                
                isLoadingArray[2] = false;
                swipeRefresh.setRefreshing(false);
                loadingMore.setVisibility(View.GONE);
                hideLoadingView(); // 隐藏加载视图
                
                // 清除当前请求引用
                if (currentCall == call) {
                    currentCall = null;
                }
                
                String errorMsg = ErrorHandler.getErrorMessage(t);
                showError(errorMsg);
                adapter.updateData(courseList);
                updateEmptyView();
            }
        });
    }
    
    private void loadMore() {
        if (isLoadingArray[currentTab] || allLoadedArray[currentTab]) {
            return;
        }
        
        loadingMore.setVisibility(View.VISIBLE);
        loadData(currentTab, false);
    }
    
    private List<Article> parseArticleList(List<Map<String, Object>> list) {
        List<Article> articles = new ArrayList<>();
        for (Map<String, Object> item : list) {
            Article article = new Article();
            if (item.containsKey("id")) article.setId(getIntValue(item.get("id")));
            if (item.containsKey("article_title")) article.setTitle(getStringValue(item.get("article_title")));
            if (item.containsKey("article_summary")) article.setSummary(getStringValue(item.get("article_summary")));
            if (item.containsKey("author_name")) article.setAuthorName(getStringValue(item.get("author_name")));
            if (item.containsKey("author_id")) article.setAuthorId(getIntValue(item.get("author_id")));
            if (item.containsKey("view_count")) article.setViewNum(getIntValue(item.get("view_count")));
            if (item.containsKey("star_count")) article.setStarNum(getIntValue(item.get("star_count")));
            if (item.containsKey("like_count")) article.setLikeNum(getIntValue(item.get("like_count")));
            if (item.containsKey("reply_count")) article.setReplyNum(getIntValue(item.get("reply_count")));
            if (item.containsKey("hot_score")) article.setHotScore(getIntValue(item.get("hot_score")));
            if (item.containsKey("cover_link")) article.setCoverLink(getStringValue(item.get("cover_link")));
            if (item.containsKey("publish_time")) article.setPublishTime(getStringValue(item.get("publish_time")));
            if (item.containsKey("article_tags")) article.setArticleTags(getStringValue(item.get("article_tags")));
            if (item.containsKey("if_top")) article.setIfTop(getBooleanValue(item.get("if_top")));
            if (item.containsKey("article_type")) article.setType(getStringValue(item.get("article_type")));
            articles.add(article);
        }
        return articles;
    }
    
    private List<Post> parsePostList(List<Map<String, Object>> list) {
        List<Post> posts = new ArrayList<>();
        for (Map<String, Object> item : list) {
            Post post = new Post();
            // 检查post_id字段（API可能返回post_id而不是id）
            if (item.containsKey("post_id")) {
                post.setId(getIntValue(item.get("post_id")));
            } else if (item.containsKey("id")) {
                post.setId(getIntValue(item.get("id")));
            }
            if (item.containsKey("post_title")) post.setTitle(getStringValue(item.get("post_title")));
            if (item.containsKey("post_content")) post.setContent(getStringValue(item.get("post_content")));
            
            // API可能返回poster_name/poster_id或author_name/author_id
            if (item.containsKey("poster_name")) {
                post.setAuthorName(getStringValue(item.get("poster_name")));
            } else if (item.containsKey("author_name")) {
                post.setAuthorName(getStringValue(item.get("author_name")));
            }
            if (item.containsKey("poster_id")) {
                post.setAuthorId(getIntValue(item.get("poster_id")));
            } else if (item.containsKey("author_id")) {
                post.setAuthorId(getIntValue(item.get("author_id")));
            }
            
            if (item.containsKey("view_count")) post.setViewNum(getIntValue(item.get("view_count")));
            if (item.containsKey("reply_count")) post.setReplyNum(getIntValue(item.get("reply_count")));
            if (item.containsKey("publish_time")) post.setPublishTime(getStringValue(item.get("publish_time")));
            if (item.containsKey("article_id")) post.setArticleId(getIntValue(item.get("article_id")));
            
            // 调试日志
            Log.d(TAG, "Parsed post - id: " + post.getId() + ", authorId: " + post.getAuthorId() + ", authorName: " + post.getAuthorName());
            Log.d(TAG, "Post item keys: " + item.keySet());
            
            posts.add(post);
        }
        return posts;
    }
    
    private List<Course> parseCourseList(List<Map<String, Object>> list) {
        List<Course> courses = new ArrayList<>();
        for (Map<String, Object> item : list) {
            Course course = new Course();
            // API返回的字段名是 course_id，不是 id
            if (item.containsKey("course_id")) {
                course.setId(getIntValue(item.get("course_id")));
                Log.d(TAG, "解析课程 - course_id: " + course.getId() + ", 所有字段: " + item.keySet());
            } else if (item.containsKey("id")) {
                // 兼容处理：如果API返回的是 id，也支持
                course.setId(getIntValue(item.get("id")));
                Log.d(TAG, "解析课程 - id: " + course.getId() + ", 所有字段: " + item.keySet());
            } else {
                Log.w(TAG, "课程数据中没有找到 id 或 course_id 字段，所有字段: " + item.keySet());
            }
            if (item.containsKey("course_name")) course.setName(getStringValue(item.get("course_name")));
            if (item.containsKey("course_type")) course.setType(getStringValue(item.get("course_type")));
            if (item.containsKey("college")) course.setCollege(getStringValue(item.get("college")));
            if (item.containsKey("campus")) course.setCampus(getStringValue(item.get("campus")));
            if (item.containsKey("credits")) course.setCredit(getIntValue(item.get("credits")));
            if (item.containsKey("course_teacher")) course.setTeacher(getStringValue(item.get("course_teacher")));
            if (item.containsKey("course_method")) course.setAttendMethod(getStringValue(item.get("course_method")));
            if (item.containsKey("assessment_method")) course.setExamineMethod(getStringValue(item.get("assessment_method")));
            if (item.containsKey("all_score")) course.setScore(getDoubleValue(item.get("all_score")));
            if (item.containsKey("all_people")) course.setEvaluateNum(getIntValue(item.get("all_people")));
            if (item.containsKey("publish_time")) course.setPublishTime(getStringValue(item.get("publish_time")));
            courses.add(course);
        }
        return courses;
    }
    
    /**
     * 更新空视图的显示状态
     */
    private void updateEmptyView() {
        List<?> data = getCurrentList();
        boolean isLoading = isLoadingArray[currentTab];
        Log.d(TAG, "Updating empty view, current tab: " + currentTab + ", data size: " + data.size() + ", isLoading: " + isLoading);
        
        // 更新空状态
        if (data.isEmpty() && !isLoading) {
            Log.d(TAG, "Showing empty view");
            emptyView.setVisibility(View.VISIBLE);
            recyclerView.setVisibility(View.GONE);
            hideLoadingView(); // 确保加载视图隐藏
        } else {
            Log.d(TAG, "Showing recycler view with " + data.size() + " items");
            emptyView.setVisibility(View.GONE);
            recyclerView.setVisibility(View.VISIBLE);
        }
    }
    
    /**
     * 显示加载视图
     */
    private void showLoadingView() {
        if (loadingView != null) {
            loadingView.setVisibility(View.VISIBLE);
            recyclerView.setVisibility(View.GONE);
            emptyView.setVisibility(View.GONE);
        }
    }
    
    /**
     * 隐藏加载视图
     */
    private void hideLoadingView() {
        if (loadingView != null) {
            loadingView.setVisibility(View.GONE);
            recyclerView.setVisibility(View.VISIBLE);
        }
    }
    
    private List<?> getCurrentList() {
        switch (currentTab) {
            case 0: return articleList;
            case 1: return postList;
            case 2: return courseList;
            default: return new ArrayList<>();
        }
    }
    
    private int getCurrentListSize() {
        return getCurrentList().size();
    }
    
    private void showError(String message) {
        if (getContext() != null) {
            Toast.makeText(getContext(), message, Toast.LENGTH_LONG).show();
        }
        Log.e(TAG, "Error: " + message);
    }
    
    // 工具方法
    private String getStringValue(Object value) {
        return value != null ? value.toString() : "";
    }
    
    private Integer getIntValue(Object value) {
        if (value == null) return 0;
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        try {
            return Integer.parseInt(value.toString());
        } catch (NumberFormatException e) {
            return 0;
        }
    }
    
    private Double getDoubleValue(Object value) {
        if (value == null) return 0.0;
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        }
        try {
            return Double.parseDouble(value.toString());
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }
    
    private Boolean getBooleanValue(Object value) {
        if (value == null) return false;
        if (value instanceof Boolean) {
            return (Boolean) value;
        }
        return Boolean.parseBoolean(value.toString());
    }
}

