package com.sharesdu.android.common.view;

import android.content.Context;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.HorizontalScrollView;
import android.widget.LinearLayout;
import android.widget.TextView;
import androidx.annotation.Nullable;
import androidx.cardview.widget.CardView;
import com.bumptech.glide.Glide;
import com.sharesdu.android.common.R;
import com.sharesdu.android.common.dialog.ImageViewerDialog;
import com.sharesdu.android.data.model.Post;
import com.sharesdu.android.common.utils.PostContentParser;
import java.util.List;

/**
 * 帖子列表项组件
 * 独立的组件类，方便扩展
 */
public class PostItemView extends CardView {
    private UserAvatarView userAvatar;
    private TextView tvTitle;
    private PostContentTextView postContentView;
    private TextView tvStats;
    private HorizontalScrollView hsvImages;
    private LinearLayout llImages;
    private TextView htmlHintView; // HTML帖子提示视图
    
    public PostItemView(Context context) {
        super(context);
        init();
    }
    
    public PostItemView(Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
        init();
    }
    
    public PostItemView(Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
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
        setCardElevation(0f);
        setRadius(2f * getResources().getDisplayMetrics().density);
        
        // 加载内容布局
        LayoutInflater.from(getContext()).inflate(R.layout.view_post_item, this, true);
        
        userAvatar = findViewById(R.id.user_avatar);
        tvTitle = findViewById(R.id.tv_title);
        postContentView = findViewById(R.id.post_content_view);
        tvStats = findViewById(R.id.tv_stats);
        hsvImages = findViewById(R.id.hsv_images);
        llImages = findViewById(R.id.ll_images);
    }
    
    private OnPostClickListener onPostClickListener;
    
    public interface OnPostClickListener {
        void onPostClick(Post post);
    }
    
    /**
     * 设置帖子点击监听
     */
    public void setOnPostClickListener(OnPostClickListener listener) {
        this.onPostClickListener = listener;
        setClickable(listener != null);
        setOnClickListener(v -> {
            if (onPostClickListener != null && post != null) {
                onPostClickListener.onPostClick(post);
            }
        });
    }
    
    private Post post; // 保存当前帖子对象
    
    /**
     * 设置文字颜色为白色（用于帖子详情页面）
     */
    public void setTextColorWhite() {
        if (tvTitle != null) {
            tvTitle.setTextColor(android.graphics.Color.WHITE);
        }
        if (tvStats != null) {
            tvStats.setTextColor(android.graphics.Color.WHITE);
        }
        if (postContentView != null) {
            postContentView.setTextColorWhite();
        }
    }
    
    /**
     * 绑定帖子数据
     * @param post 帖子对象
     */
    public void bind(Post post) {
        this.post = post;
        if (post == null) {
            return;
        }
        
        // 设置用户头像和名称
        if (userAvatar != null) {
            Integer authorId = post.getAuthorId();
            String authorName = post.getAuthorName();
            android.util.Log.d("PostItemView", "Binding post - authorId: " + authorId + ", authorName: " + authorName);
            userAvatar.setUser(authorId, authorName);
        } else {
            android.util.Log.e("PostItemView", "userAvatar is null!");
        }
        
        // 设置标题
        if (tvTitle != null) {
            tvTitle.setText(post.getTitle() != null ? post.getTitle() : "");
        }
        
        // 解析并显示帖子内容（使用PostContentTextView）
        String rawContent = post.getContent() != null ? post.getContent() : "";
        PostContentParser.ParsedPostContent parsedContent = PostContentParser.parse(rawContent);
        
        // 清理之前可能存在的HTML提示视图
        if (htmlHintView != null && htmlHintView.getParent() != null) {
            ((android.view.ViewGroup) htmlHintView.getParent()).removeView(htmlHintView);
            htmlHintView = null;
        }
        
        // 检查是否为HTML帖子
        if (parsedContent.isHtml()) {
            // HTML帖子：显示提示文本，点击后跳转到WebView页面
            if (postContentView != null) {
                // 隐藏原来的内容视图
                postContentView.setVisibility(View.GONE);
                
                // 创建HTML帖子提示视图（只创建一次，避免重复）
                if (htmlHintView == null) {
                    htmlHintView = new TextView(getContext());
                    htmlHintView.setText("[HTML帖子，点击查看]");
                    htmlHintView.setTextSize(16);
                    htmlHintView.setPadding(
                        (int) (16 * getResources().getDisplayMetrics().density),
                        (int) (12 * getResources().getDisplayMetrics().density),
                        (int) (16 * getResources().getDisplayMetrics().density),
                        (int) (12 * getResources().getDisplayMetrics().density)
                    );
                    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                        htmlHintView.setTextColor(getContext().getColor(R.color.theme_color));
                    } else {
                        htmlHintView.setTextColor(getResources().getColor(R.color.theme_color));
                    }
                    htmlHintView.setClickable(true);
                    htmlHintView.setFocusable(true);
                    htmlHintView.setBackgroundResource(android.R.drawable.list_selector_background);
                }
                
                // 更新点击事件（使用最新的数据）
                htmlHintView.setOnClickListener(v -> {
                    String htmlContent = parsedContent.getHtmlContent();
                    String postTitle = post.getTitle() != null ? post.getTitle() : "";
                    
                    // 使用Intent启动Activity，使用字符串类名避免直接依赖feature模块
                    android.content.Intent intent = new android.content.Intent();
                    intent.setClassName(getContext(), "com.sharesdu.android.feature.index.PostHtmlWebViewActivity");
                    intent.putExtra("html_content", htmlContent);
                    intent.putExtra("post_title", postTitle);
                    getContext().startActivity(intent);
                });
                
                // 将HTML提示视图添加到布局中（在postContentView的位置）
                android.view.ViewGroup parent = (android.view.ViewGroup) postContentView.getParent();
                if (parent != null && htmlHintView.getParent() == null) {
                    int index = parent.indexOfChild(postContentView);
                    parent.addView(htmlHintView, index + 1);
                }
            }
        } else {
            // 普通帖子：正常显示内容
            if (postContentView != null) {
                postContentView.setVisibility(View.VISIBLE);
                postContentView.setContent(rawContent);
                // 设置主题颜色（链接颜色）
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                    int themeColor = getContext().getColor(R.color.theme_color);
                    postContentView.setLinkColor(themeColor);
                } else {
                    int themeColor = getResources().getColor(R.color.theme_color);
                    postContentView.setLinkColor(themeColor);
                }
            }
        }
        
        // 显示图片（使用九宫格布局）
        if (hsvImages != null && llImages != null) {
            // 先清除所有子视图，释放资源
            llImages.removeAllViews();
            
            List<String> imageUrls = parsedContent.getImageUrls();
            
            if (imageUrls != null && !imageUrls.isEmpty()) {
                hsvImages.setVisibility(View.VISIBLE);
                
                // 使用九宫格布局
                ImageGridLayout imageGrid = new ImageGridLayout(getContext());
                imageGrid.setImageUrls(imageUrls);
                imageGrid.setOnImageClickListener((position, imageUrl, allUrls) -> {
                    // 点击图片时打开图片查看器
                    // 需要FragmentActivity，尝试从Context获取
                    Context context = getContext();
                    if (context instanceof androidx.fragment.app.FragmentActivity) {
                        ImageViewerDialog dialog = new ImageViewerDialog((androidx.fragment.app.FragmentActivity) context);
                        dialog.show(allUrls, position);
                    } else {
                        // 如果Context不是FragmentActivity，尝试获取Activity
                        android.app.Activity activity = null;
                        while (context instanceof android.content.ContextWrapper) {
                            if (context instanceof android.app.Activity) {
                                activity = (android.app.Activity) context;
                                break;
                            }
                            context = ((android.content.ContextWrapper) context).getBaseContext();
                        }
                        if (activity instanceof androidx.fragment.app.FragmentActivity) {
                            ImageViewerDialog dialog = new ImageViewerDialog((androidx.fragment.app.FragmentActivity) activity);
                            dialog.show(allUrls, position);
                        } else {
                            android.util.Log.e("PostItemView", "无法获取FragmentActivity，无法显示图片查看器");
                        }
                    }
                });
                
                // 设置布局参数
                LinearLayout.LayoutParams gridParams = new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                );
                imageGrid.setLayoutParams(gridParams);
                
                llImages.addView(imageGrid);
            } else {
                hsvImages.setVisibility(View.GONE);
            }
        }
        
        // 设置统计信息
        if (tvStats != null) {
            StringBuilder stats = new StringBuilder();
            if (post.getViewNum() != null) {
                stats.append("浏览 ").append(post.getViewNum());
            }
            if (post.getReplyNum() != null) {
                if (stats.length() > 0) {
                    stats.append(" · ");
                }
                stats.append("回复 ").append(post.getReplyNum());
            }
            tvStats.setText(stats.toString());
        }
    }
}

