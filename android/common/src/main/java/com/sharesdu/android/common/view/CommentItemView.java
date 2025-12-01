package com.sharesdu.android.common.view;

import android.content.Context;
import android.text.SpannableString;
import android.text.Spanned;
import android.text.style.ClickableSpan;
import android.text.style.ForegroundColorSpan;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import android.widget.TextView;
import androidx.annotation.Nullable;
import androidx.cardview.widget.CardView;
import com.sharesdu.android.common.R;
import com.sharesdu.android.data.model.Reply;
import com.sharesdu.android.core.utils.TokenManager;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 评论项组件
 * 参考web项目中的ReplyItem组件
 */
public class CommentItemView extends CardView {
    private UserAvatarView userAvatar;
    private TextView tvContent;
    private TextView tvTime;
    private TextView tvLikeNum;
    private ImageButton btnReply;
    private ImageButton btnDelete;
    private ImageButton btnLike;
    private LinearLayout layoutParentHint;
    private TextView tvParentAuthor;
    private TextView tvParentContent;
    private View divider;
    
    private Reply reply;
    private String currentUserId;
    private OnReplyClickListener onReplyClickListener;
    private OnDeleteClickListener onDeleteClickListener;
    private OnShowParentClickListener onShowParentClickListener;
    private OnLikeClickListener onLikeClickListener;
    private OnLoadParentReplyListener onLoadParentReplyListener;
    
    public interface OnReplyClickListener {
        void onReplyClick(Reply reply);
    }
    
    public interface OnDeleteClickListener {
        void onDeleteClick(Reply reply);
    }
    
    public interface OnShowParentClickListener {
        void onShowParentClick(Integer parentReplyId);
    }
    
    public interface OnLikeClickListener {
        void onLikeClick(Reply reply);
    }
    
    public interface OnLoadParentReplyListener {
        void onLoadParentReply(Integer parentReplyId, OnParentReplyLoadedListener listener);
    }
    
    public interface OnParentReplyLoadedListener {
        void onParentReplyLoaded(Reply parentReply);
    }
    
    public CommentItemView(Context context) {
        super(context);
        init();
    }
    
    public CommentItemView(Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
        init();
    }
    
    public CommentItemView(Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
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
        LayoutInflater.from(getContext()).inflate(R.layout.view_comment_item, this, true);
        
        userAvatar = findViewById(R.id.user_avatar);
        tvContent = findViewById(R.id.tv_content);
        tvTime = findViewById(R.id.tv_time);
        tvLikeNum = findViewById(R.id.tv_like_num);
        btnReply = findViewById(R.id.btn_reply);
        btnDelete = findViewById(R.id.btn_delete);
        btnLike = findViewById(R.id.btn_like);
        layoutParentHint = findViewById(R.id.layout_parent_hint);
        tvParentAuthor = findViewById(R.id.tv_parent_author);
        tvParentContent = findViewById(R.id.tv_parent_content);
        divider = findViewById(R.id.divider);
        
        // 获取当前用户ID
        String userIdStr = TokenManager.getInstance(getContext()).getUserId();
        if (userIdStr != null) {
            try {
                currentUserId = userIdStr;
            } catch (Exception e) {
                currentUserId = null;
            }
        }
        
        // 设置点击事件
        btnReply.setOnClickListener(v -> {
            if (onReplyClickListener != null && reply != null) {
                onReplyClickListener.onReplyClick(reply);
            }
        });
        
        btnDelete.setOnClickListener(v -> {
            if (onDeleteClickListener != null && reply != null) {
                onDeleteClickListener.onDeleteClick(reply);
            }
        });
        
        btnLike.setOnClickListener(v -> {
            if (onLikeClickListener != null && reply != null) {
                onLikeClickListener.onLikeClick(reply);
            }
        });
    }
    
    /**
     * 绑定评论数据
     */
    public void bind(Reply reply) {
        this.reply = reply;
        if (reply == null) {
            return;
        }
        
        // 设置用户头像和名称
        if (userAvatar != null) {
            userAvatar.setUser(reply.getAuthorId(), reply.getAuthorName());
        }
        
        // 设置时间
        if (tvTime != null) {
            tvTime.setText(reply.getPublishTime() != null ? reply.getPublishTime() : "");
        }
        
        // 设置点赞数
        if (tvLikeNum != null) {
            tvLikeNum.setText(reply.getLikeNum() != null ? String.valueOf(reply.getLikeNum()) : "0");
        }
        
        // 设置点赞按钮状态和颜色
        if (btnLike != null) {
            boolean isLiked = reply.getIfLike() != null && reply.getIfLike();
            btnLike.setSelected(isLiked);
            // 根据点赞状态设置颜色：已点赞为红色，未点赞为灰色
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                int color = isLiked ? getContext().getColor(android.R.color.holo_red_dark) : 
                    getContext().getColor(R.color.text_color_secondary);
                btnLike.setColorFilter(color);
            } else {
                int color = isLiked ? getResources().getColor(android.R.color.holo_red_dark) : 
                    getResources().getColor(R.color.text_color_secondary);
                btnLike.setColorFilter(color);
            }
        }
        
        // 检查是否有父级评论ID，如果有则加载父级评论内容
        if (reply.getParentReplyId() != null && onLoadParentReplyListener != null) {
            loadParentReply(reply.getParentReplyId());
        } else {
            // 没有父级评论ID，解析评论内容（可能包含@格式）
            String content = reply.getContent() != null ? reply.getContent() : "";
            parseAndDisplayContent(content);
        }
        
        // 显示/隐藏删除按钮（只有自己的评论才显示）
        if (btnDelete != null) {
            boolean isOwnComment = currentUserId != null && 
                reply.getAuthorId() != null && 
                currentUserId.equals(String.valueOf(reply.getAuthorId()));
            btnDelete.setVisibility(isOwnComment ? View.VISIBLE : View.GONE);
        }
    }
    
    /**
     * 加载父级评论内容
     */
    private void loadParentReply(Integer parentReplyId) {
        if (onLoadParentReplyListener != null) {
            onLoadParentReplyListener.onLoadParentReply(parentReplyId, parentReply -> {
                if (parentReply != null && layoutParentHint != null) {
                    // 显示父级评论
                    layoutParentHint.setVisibility(View.VISIBLE);
                    
                    // 设置父级评论作者
                    if (tvParentAuthor != null) {
                        String authorName = parentReply.getAuthorName() != null ? parentReply.getAuthorName() : "未知用户";
                        tvParentAuthor.setText("@" + authorName);
                        
                        // 设置点击事件，显示父级评论详情
                        tvParentAuthor.setOnClickListener(v -> {
                            if (onShowParentClickListener != null) {
                                onShowParentClickListener.onShowParentClick(parentReplyId);
                            }
                        });
                    }
                    
                    // 设置父级评论内容
                    if (tvParentContent != null) {
                        String parentContent = parentReply.getContent() != null ? parentReply.getContent() : "";
                        // 如果父级评论内容也包含@格式，需要解析
                        if (parentContent.startsWith("@")) {
                            int firstNewline = parentContent.indexOf("\n");
                            if (firstNewline > 0) {
                                String remaining = parentContent.substring(firstNewline + 1);
                                int secondNewline = remaining.indexOf("\n");
                                if (secondNewline > 0) {
                                    parentContent = remaining.substring(secondNewline + 1);
                                }
                            }
                        }
                        tvParentContent.setText(parentContent);
                    }
                } else {
                    // 加载失败，隐藏父级评论提示
                    if (layoutParentHint != null) {
                        layoutParentHint.setVisibility(View.GONE);
                    }
                }
                
                // 解析并显示当前评论内容（去掉@格式）
                String content = reply.getContent() != null ? reply.getContent() : "";
                if (content.startsWith("@")) {
                    int firstNewline = content.indexOf("\n");
                    if (firstNewline > 0) {
                        String remaining = content.substring(firstNewline + 1);
                        int secondNewline = remaining.indexOf("\n");
                        if (secondNewline > 0) {
                            content = remaining.substring(secondNewline + 1);
                        }
                    }
                }
                if (tvContent != null) {
                    tvContent.setText(content);
                }
            });
        } else {
            // 没有监听器，使用旧的解析方式
            String content = reply.getContent() != null ? reply.getContent() : "";
            parseAndDisplayContent(content);
        }
    }
    
    /**
     * 解析并显示评论内容，处理@父级评论（兼容旧格式）
     * 根据web项目，格式是：@authorName\nparentReplyId\ncontent
     */
    private void parseAndDisplayContent(String content) {
        if (tvContent == null) {
            return;
        }
        
        // 检查是否包含@父级评论的格式：@authorName\nparentReplyId\ncontent
        if (content != null && content.startsWith("@")) {
            int firstNewline = content.indexOf("\n");
            if (firstNewline > 0) {
                String authorNamePart = content.substring(1, firstNewline); // 去掉@符号
                String remaining = content.substring(firstNewline + 1);
                int secondNewline = remaining.indexOf("\n");
                
                if (secondNewline > 0) {
                    String parentReplyIdStr = remaining.substring(0, secondNewline);
                    String actualContent = remaining.substring(secondNewline + 1);
                    
                    // 如果有父级评论ID，尝试加载
                    try {
                        final Integer parentReplyId = Integer.parseInt(parentReplyIdStr);
                        if (onLoadParentReplyListener != null) {
                            loadParentReply(parentReplyId);
                            return;
                        }
                    } catch (NumberFormatException e) {
                        // 忽略
                    }
                    
                    // 无法加载父级评论，只显示@作者名
                    if (layoutParentHint != null && tvParentAuthor != null) {
                        layoutParentHint.setVisibility(View.VISIBLE);
                        tvParentAuthor.setText("@" + authorNamePart);
                        if (tvParentContent != null) {
                            tvParentContent.setVisibility(View.GONE);
                        }
                        
                        // 设置点击事件
                        tvParentAuthor.setOnClickListener(v -> {
                            if (onShowParentClickListener != null) {
                                try {
                                    Integer parentReplyId = Integer.parseInt(parentReplyIdStr);
                                    onShowParentClickListener.onShowParentClick(parentReplyId);
                                } catch (NumberFormatException e) {
                                    // 忽略
                                }
                            }
                        });
                    }
                    
                    // 显示实际内容
                    tvContent.setText(actualContent);
                    return;
                }
            }
        }
        
        // 没有@父级评论，直接显示内容
        if (layoutParentHint != null) {
            layoutParentHint.setVisibility(View.GONE);
        }
        tvContent.setText(content);
    }
    
    /**
     * 设置回复点击监听
     */
    public void setOnReplyClickListener(OnReplyClickListener listener) {
        this.onReplyClickListener = listener;
    }
    
    /**
     * 设置删除点击监听
     */
    public void setOnDeleteClickListener(OnDeleteClickListener listener) {
        this.onDeleteClickListener = listener;
    }
    
    /**
     * 设置显示父级评论点击监听
     */
    public void setOnShowParentClickListener(OnShowParentClickListener listener) {
        this.onShowParentClickListener = listener;
    }
    
    /**
     * 设置加载父级评论监听
     */
    public void setOnLoadParentReplyListener(OnLoadParentReplyListener listener) {
        this.onLoadParentReplyListener = listener;
    }
    
    /**
     * 设置点赞点击监听
     */
    public void setOnLikeClickListener(OnLikeClickListener listener) {
        this.onLikeClickListener = listener;
    }
    
    /**
     * 设置分隔线可见性
     */
    public void setDividerVisible(boolean visible) {
        if (divider != null) {
            divider.setVisibility(visible ? View.VISIBLE : View.GONE);
        }
    }
}

