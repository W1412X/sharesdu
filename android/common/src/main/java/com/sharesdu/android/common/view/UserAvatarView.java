package com.sharesdu.android.common.view;

import android.content.Context;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import androidx.annotation.Nullable;
import com.sharesdu.android.core.navigation.NavigationCallback;
import com.sharesdu.android.core.navigation.NavigationManager;
import com.bumptech.glide.Glide;
import com.bumptech.glide.load.DataSource;
import com.bumptech.glide.load.engine.DiskCacheStrategy;
import com.bumptech.glide.load.engine.GlideException;
import com.bumptech.glide.request.RequestListener;
import com.bumptech.glide.request.RequestOptions;
import com.bumptech.glide.request.target.Target;
import com.sharesdu.android.common.R;
import com.sharesdu.android.core.network.ApiConfig;
import com.sharesdu.android.common.utils.ImageCache;

/**
 * 用户头像组件
 * 类似web项目中的AvatarName组件
 */
public class UserAvatarView extends LinearLayout {
    private ImageView ivAvatar;
    private TextView tvName;
    private Context context;
    private Integer userId;
    private static final ImageCache profileCache = ImageCache.getGlobalProfileCache(); // 头像缓存
    
    public UserAvatarView(Context context) {
        super(context);
        this.context = context;
        init();
    }
    
    public UserAvatarView(Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
        this.context = context;
        init();
    }
    
    private void init() {
        LayoutInflater.from(context).inflate(R.layout.view_user_avatar, this, true);
        
        ivAvatar = findViewById(R.id.iv_avatar);
        tvName = findViewById(R.id.tv_name);
        
        // 设置点击监听，跳转到作者页面
        setOnClickListener(v -> {
            if (userId != null) {
                NavigationCallback callback = NavigationManager.getInstance().getNavigationCallback();
                if (callback != null) {
                    callback.navigateToAuthor(context, String.valueOf(userId));
                }
            }
        });
    }
    
    /**
     * 设置用户信息
     * @param userId 用户ID
     * @param userName 用户名称
     */
    public void setUser(Integer userId, String userName) {
        this.userId = userId;
        android.util.Log.d("UserAvatarView", "setUser called - userId: " + userId + ", userName: " + userName);
        
        // 设置用户名（如果userName为null或空，则隐藏TextView）
        if (tvName != null) {
            if (userName != null && !userName.isEmpty()) {
                tvName.setText(userName);
                tvName.setVisibility(View.VISIBLE);
            } else {
                tvName.setVisibility(View.GONE);
            }
            android.util.Log.d("UserAvatarView", "TextView set to: " + (userName != null ? userName : "") + ", visibility: " + tvName.getVisibility());
        } else {
            android.util.Log.e("UserAvatarView", "tvName is null!");
        }
        
        if (ivAvatar != null && userId != null) {
            // 构建头像URL（与web项目保持一致）
            String avatarUrl = ApiConfig.BASE_URL + "/image/user?user_id=" + userId;
            
            // 先检查缓存
            String cachedUrl = profileCache.getImage(avatarUrl);
            final String loadUrl = cachedUrl != null ? cachedUrl : avatarUrl;
            
            // 创建圆形裁剪的RequestOptions
            RequestOptions options = new RequestOptions()
                .placeholder(R.drawable.placeholder_image) // 默认占位符
                .error(R.drawable.placeholder_image) // 加载失败时显示占位符
                .diskCacheStrategy(DiskCacheStrategy.ALL)
                .circleCrop(); // 圆形头像（关键：使用circleCrop实现圆形裁剪）
            
            Glide.with(context)
                .load(loadUrl)
                .apply(options)
                .listener(new RequestListener<android.graphics.drawable.Drawable>() {
                    @Override
                    public boolean onLoadFailed(@Nullable GlideException e, Object model, Target<android.graphics.drawable.Drawable> target, boolean isFirstResource) {
                        return false;
                    }
                    
                    @Override
                    public boolean onResourceReady(android.graphics.drawable.Drawable resource, Object model, Target<android.graphics.drawable.Drawable> target, DataSource dataSource, boolean isFirstResource) {
                        // 加载成功，缓存URL
                        if (avatarUrl != null && loadUrl != null) {
                            profileCache.addImage(avatarUrl, loadUrl);
                        }
                        return false;
                    }
                })
                .into(ivAvatar);
        } else {
            // 如果没有用户ID，显示默认图标（也使用圆形裁剪）
            if (ivAvatar != null) {
                RequestOptions defaultOptions = new RequestOptions()
                    .placeholder(R.drawable.placeholder_image)
                    .error(R.drawable.placeholder_image)
                    .circleCrop();
                Glide.with(context)
                    .load(R.drawable.placeholder_image)
                    .apply(defaultOptions)
                    .into(ivAvatar);
            }
        }
    }
    
    /**
     * 设置头像大小
     * @param size 大小（dp）
     */
    public void setAvatarSize(int size) {
        if (ivAvatar != null) {
            int sizePx = (int) (size * getResources().getDisplayMetrics().density);
            LayoutParams params = (LayoutParams) ivAvatar.getLayoutParams();
            params.width = sizePx;
            params.height = sizePx;
            ivAvatar.setLayoutParams(params);
        }
    }
    
    /**
     * 设置名称文字大小
     * @param size 大小（sp）
     */
    public void setNameTextSize(float size) {
        if (tvName != null) {
            tvName.setTextSize(size);
        }
    }
}

