package com.sharesdu.android;

import android.os.Bundle;
import android.view.View;
import android.view.inputmethod.EditorInfo;
import android.widget.ImageButton;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentManager;
import androidx.fragment.app.FragmentTransaction;
import com.google.android.material.bottomnavigation.BottomNavigationView;
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;
import com.sharesdu.android.feature.index.IndexFragment;
import com.sharesdu.android.feature.self.SelfFragment;
import com.sharesdu.android.feature.service.ServiceFragment;
import com.sharesdu.android.core.network.ApiClient;
import com.sharesdu.android.core.network.ErrorHandlerInterceptor;
import com.sharesdu.android.core.network.LoginCallback;
import com.sharesdu.android.core.navigation.NavigationCallback;
import com.sharesdu.android.core.navigation.NavigationManager;
import com.sharesdu.android.core.utils.TokenManager;
import com.sharesdu.android.common.dialog.ImageViewerDialog;
import com.sharesdu.android.feature.author.AuthorActivity;
import com.sharesdu.android.common.dialog.PostEditorDialog;
import com.sharesdu.android.common.dialog.CourseEditorDialog;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.Toast;
import androidx.appcompat.app.AlertDialog;
import androidx.fragment.app.FragmentActivity;
import com.sharesdu.android.R;

/**
 * 主 Activity
 * 包含底部导航和顶部搜索功能
 */
public class MainActivity extends AppCompatActivity {
    
    private BottomNavigationView bottomNavigation;
    private ImageButton btnCreate;
    private ImageButton btnSearch;
    private TextInputLayout searchInputLayout;
    private TextInputEditText etSearch;
    private TextView btnCancelSearch;
    
    private Fragment currentFragment;
    private IndexFragment indexFragment;
    private ServiceFragment serviceFragment;
    private SelfFragment selfFragment;
    
    private PostEditorDialog postEditorDialog;
    private CourseEditorDialog courseEditorDialog;
    private ImageViewerDialog imageViewerDialog;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // 初始化 ApiClient（用于错误处理拦截器）
        ApiClient.init(this);
        
        // 设置登录回调接口
        ErrorHandlerInterceptor.setLoginCallback(new LoginCallback() {
            @Override
            public void navigateToLogin(Context context) {
                Intent intent = new Intent(context, com.sharesdu.android.feature.auth.LoginActivity.class);
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                context.startActivity(intent);
            }
        });
        
        // 设置导航回调接口
        NavigationManager.getInstance().setNavigationCallback(new NavigationCallback() {
            @Override
            public void navigateToImageViewer(Context context, String imageUrl) {
                // 使用对话框组件替代Activity
                if (imageViewerDialog != null && context == MainActivity.this) {
                    imageViewerDialog.show(imageUrl);
                } else if (context instanceof FragmentActivity) {
                    // 如果context是FragmentActivity，创建新的对话框实例
                    ImageViewerDialog dialog = new ImageViewerDialog((FragmentActivity) context);
                    dialog.show(imageUrl);
                }
            }
            
            @Override
            public void navigateToAuthor(Context context, String userId) {
                try {
                    Integer authorId = Integer.parseInt(userId);
                    Intent intent = new Intent();
                    intent.setClassName(context, "com.sharesdu.android.feature.author.AuthorActivity");
                    intent.putExtra("author_id", authorId);
                    context.startActivity(intent);
                } catch (Exception e) {
                    android.util.Log.e("MainActivity", "无法跳转到作者页面", e);
                }
            }
            
            @Override
            public void navigateToArticle(Context context, String articleId) {
                // TODO: 实现文章详情页面导航
                // 目前使用字符串形式避免循环依赖
                try {
                    Intent intent = new Intent();
                    intent.setClassName(context, "com.sharesdu.android.feature.article.ArticleActivity");
                    intent.putExtra("article_id", articleId);
                    context.startActivity(intent);
                } catch (Exception e) {
                    android.util.Log.e("MainActivity", "无法跳转到文章页面（可能尚未实现）: " + articleId, e);
                    // 如果Activity不存在，可以显示Toast提示
                    android.widget.Toast.makeText(context, "文章详情功能开发中", android.widget.Toast.LENGTH_SHORT).show();
                }
            }
            
            @Override
            public void navigateToCourse(Context context, String courseId) {
                // TODO: 实现课程详情页面导航
                try {
                    Intent intent = new Intent();
                    intent.setClassName(context, "com.sharesdu.android.feature.course.CourseActivity");
                    intent.putExtra("course_id", courseId);
                    context.startActivity(intent);
                } catch (Exception e) {
                    android.util.Log.e("MainActivity", "无法跳转到课程页面（可能尚未实现）: " + courseId, e);
                    android.widget.Toast.makeText(context, "课程详情功能开发中", android.widget.Toast.LENGTH_SHORT).show();
                }
            }
            
            @Override
            public void navigateToPost(Context context, String postId) {
                // TODO: 实现帖子详情页面导航
                try {
                    Intent intent = new Intent();
                    intent.setClassName(context, "com.sharesdu.android.feature.post.PostActivity");
                    intent.putExtra("post_id", postId);
                    context.startActivity(intent);
                } catch (Exception e) {
                    android.util.Log.e("MainActivity", "无法跳转到帖子页面（可能尚未实现）: " + postId, e);
                    android.widget.Toast.makeText(context, "帖子详情功能开发中", android.widget.Toast.LENGTH_SHORT).show();
                }
            }
            
            @Override
            public void navigateToExternalLink(Context context, String url) {
                // 使用浏览器打开外部链接
                try {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    context.startActivity(intent);
                } catch (Exception e) {
                    android.util.Log.e("MainActivity", "无法打开外部链接: " + url, e);
                    android.widget.Toast.makeText(context, "无法打开链接", android.widget.Toast.LENGTH_SHORT).show();
                }
            }
        });
        
        setContentView(R.layout.activity_main);
        
        initViews();
        setupToolbar();
        setupBottomNavigation();
        setupSearch();
        
        // 初始化对话框
        postEditorDialog = new PostEditorDialog(this);
        courseEditorDialog = new CourseEditorDialog(this);
        imageViewerDialog = new ImageViewerDialog(this);
        
        // 默认显示首页
        showFragment(0);
    }
    
    private void initViews() {
        bottomNavigation = findViewById(R.id.bottom_navigation);
        btnCreate = findViewById(R.id.btn_create);
        btnSearch = findViewById(R.id.btn_search);
        searchInputLayout = findViewById(R.id.search_input_layout);
        etSearch = findViewById(R.id.et_search);
        btnCancelSearch = findViewById(R.id.btn_cancel_search);
        
        // 初始化 Fragment
        indexFragment = new IndexFragment();
        serviceFragment = new ServiceFragment();
        selfFragment = new SelfFragment();
    }
    
    private void setupToolbar() {
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayShowTitleEnabled(false);
        }
    }
    
    private void setupBottomNavigation() {
        bottomNavigation.setOnItemSelectedListener(item -> {
            int itemId = item.getItemId();
            if (itemId == R.id.nav_index) {
                showFragment(0);
                return true;
            } else if (itemId == R.id.nav_service) {
                showFragment(1);
                return true;
            } else if (itemId == R.id.nav_self) {
                showFragment(2);
                return true;
            }
            return false;
        });
    }
    
    private void setupSearch() {
        // 创作按钮点击事件
        btnCreate.setOnClickListener(v -> {
            showCreateChoiceDialog();
        });
        
        // 搜索按钮点击事件
        btnSearch.setOnClickListener(v -> showSearchBar());
        
        // 取消搜索按钮点击事件
        btnCancelSearch.setOnClickListener(v -> hideSearchBar());
        
        // 搜索输入框回车事件
        etSearch.setOnEditorActionListener((v, actionId, event) -> {
            if (actionId == EditorInfo.IME_ACTION_SEARCH) {
                performSearch();
                return true;
            }
            return false;
        });
    }
    
    /**
     * 显示搜索栏
     */
    private void showSearchBar() {
        btnCreate.setVisibility(View.GONE);
        btnSearch.setVisibility(View.GONE);
        searchInputLayout.setVisibility(View.VISIBLE);
        btnCancelSearch.setVisibility(View.VISIBLE);
        
        // 聚焦到搜索输入框
        etSearch.requestFocus();
        // 显示软键盘
        android.view.inputmethod.InputMethodManager imm = 
            (android.view.inputmethod.InputMethodManager) getSystemService(android.content.Context.INPUT_METHOD_SERVICE);
        if (imm != null) {
            imm.showSoftInput(etSearch, android.view.inputmethod.InputMethodManager.SHOW_IMPLICIT);
        }
    }
    
    /**
     * 隐藏搜索栏
     */
    private void hideSearchBar() {
        btnCreate.setVisibility(View.VISIBLE);
        btnSearch.setVisibility(View.VISIBLE);
        searchInputLayout.setVisibility(View.GONE);
        btnCancelSearch.setVisibility(View.GONE);
        
        // 清空搜索内容
        etSearch.setText("");
        
        // 隐藏软键盘
        android.view.inputmethod.InputMethodManager imm = 
            (android.view.inputmethod.InputMethodManager) getSystemService(android.content.Context.INPUT_METHOD_SERVICE);
        if (imm != null) {
            imm.hideSoftInputFromWindow(etSearch.getWindowToken(), 0);
        }
    }
    
    /**
     * 执行搜索
     */
    private void performSearch() {
        String query = etSearch.getText().toString().trim();
        if (!query.isEmpty()) {
            // TODO: 实现搜索逻辑
            // 暂时隐藏搜索栏
            hideSearchBar();
        }
    }
    
    /**
     * 显示指定的 Fragment
     * @param position 0: 首页, 1: 服务, 2: 我的
     */
    private void showFragment(int position) {
        Fragment fragment = null;
        
        switch (position) {
            case 0:
                fragment = indexFragment;
                break;
            case 1:
                fragment = serviceFragment;
                break;
            case 2:
                fragment = selfFragment;
                break;
        }
        
        if (fragment == null || fragment == currentFragment) {
            return;
        }
        
        FragmentManager fragmentManager = getSupportFragmentManager();
        FragmentTransaction transaction = fragmentManager.beginTransaction();
        
        if (currentFragment != null) {
            transaction.hide(currentFragment);
        }
        
        if (fragment.isAdded()) {
            transaction.show(fragment);
        } else {
            transaction.add(R.id.fragment_container, fragment);
        }
        
        transaction.commit();
        currentFragment = fragment;
    }
    
    @Override
    public void onBackPressed() {
        // 如果搜索栏显示，先隐藏搜索栏
        if (searchInputLayout.getVisibility() == View.VISIBLE) {
            hideSearchBar();
            return;
        }
        
        // 如果 SelfFragment 正在显示子页面，先返回主菜单
        if (selfFragment != null && selfFragment.isAdded()) {
            if (selfFragment.onBackPressed()) {
                return; // SelfFragment 已处理返回键
            }
        }
        
        // 否则执行默认返回操作
        super.onBackPressed();
    }
    
    /**
     * 显示创作选择对话框
     */
    private void showCreateChoiceDialog() {
        View dialogView = LayoutInflater.from(this).inflate(R.layout.dialog_create_choice, null);
        
        AlertDialog dialog = new AlertDialog.Builder(this)
            .setView(dialogView)
            .create();
        
        // 发布帖子
        View cardPost = dialogView.findViewById(R.id.card_post);
        cardPost.setOnClickListener(v -> {
            dialog.dismiss();
            // 跳转到帖子编辑器页面
            com.sharesdu.android.feature.index.PostEditorActivity.start(this, null, null);
        });
        
        // 创建课程
        View cardCourse = dialogView.findViewById(R.id.card_course);
        cardCourse.setOnClickListener(v -> {
            dialog.dismiss();
            // 跳转到课程编辑器页面
            com.sharesdu.android.feature.index.CourseEditorActivity.start(this, null);
        });
        
        // 取消按钮
        View btnCancel = dialogView.findViewById(R.id.btn_cancel);
        btnCancel.setOnClickListener(v -> dialog.dismiss());
        
        dialog.show();
    }
    
    /**
     * 显示帖子编辑器对话框
     * @param type 类型（article/course/null表示普通帖子）
     * @param id 关联ID（如果type不为null）
     */
    private void showPostEditorDialog(String type, String id) {
        if (postEditorDialog != null) {
            postEditorDialog.show(type, id, (postId, title, content) -> {
                // 帖子创建成功回调
                Toast.makeText(this, "帖子发布成功", Toast.LENGTH_SHORT).show();
                // TODO: 可以刷新页面或显示新帖子
            });
        }
    }
    
    /**
     * 显示课程编辑器对话框
     */
    private void showCourseEditorDialog() {
        if (courseEditorDialog != null) {
            courseEditorDialog.show(null, (courseId, courseName) -> {
                // 课程创建成功回调
                Toast.makeText(this, "课程创建成功", Toast.LENGTH_SHORT).show();
                // TODO: 可以刷新页面或显示新课程
            });
        }
    }
}
