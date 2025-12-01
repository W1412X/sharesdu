package com.sharesdu.android.common.adapter;

import android.content.Context;
import android.content.Intent;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.sharesdu.android.common.R;
import java.util.List;
import java.util.Map;

/**
 * 作者内容列表适配器
 * 用于显示作者的文章/帖子/回复预览
 */
public class AuthorContentAdapter extends RecyclerView.Adapter<AuthorContentAdapter.ContentViewHolder> {
    private Context context;
    private List<Map<String, Object>> contentList;
    private String contentType; // article/post/reply
    
    public AuthorContentAdapter(Context context, String contentType) {
        this.context = context;
        this.contentType = contentType;
        this.contentList = new java.util.ArrayList<>(); // 初始化空列表
    }
    
    public void setData(List<Map<String, Object>> contentList) {
        if (contentList == null) {
            this.contentList.clear();
        } else {
            this.contentList = contentList;
        }
        notifyDataSetChanged();
    }
    
    @NonNull
    @Override
    public ContentViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_author_content, parent, false);
        return new ContentViewHolder(view);
    }
    
    @Override
    public void onBindViewHolder(@NonNull ContentViewHolder holder, int position) {
        if (contentList == null || position >= contentList.size()) {
            return;
        }
        
        Map<String, Object> item = contentList.get(position);
        holder.bind(item, contentType);
    }
    
    @Override
    public int getItemCount() {
        return contentList != null ? contentList.size() : 0;
    }
    
    static class ContentViewHolder extends RecyclerView.ViewHolder {
        private TextView tvTitle;
        private TextView tvContent;
        private TextView tvTime;
        private TextView tvStats;
        
        public ContentViewHolder(@NonNull View itemView) {
            super(itemView);
            tvTitle = itemView.findViewById(R.id.tv_title);
            tvContent = itemView.findViewById(R.id.tv_content);
            tvTime = itemView.findViewById(R.id.tv_time);
            tvStats = itemView.findViewById(R.id.tv_stats);
        }
        
        public void bind(Map<String, Object> item, String contentType) {
            // 设置点击监听，如果是帖子类型，跳转到帖子详情页
            if ("post".equals(contentType)) {
                itemView.setOnClickListener(v -> {
                    Object idObj = item.get("id");
                    if (idObj != null) {
                        Integer postId = idObj instanceof Integer ? (Integer) idObj :
                            (idObj instanceof Number ? ((Number) idObj).intValue() : null);
                        if (postId != null) {
                            // 使用 Intent 启动 Activity，避免直接依赖 feature 模块
                            Context context = itemView.getContext();
                            Intent intent = new Intent();
                            intent.setClassName(context, "com.sharesdu.android.feature.index.PostDetailActivity");
                            intent.putExtra("post_id", postId);
                            context.startActivity(intent);
                        }
                    }
                });
            } else {
                itemView.setOnClickListener(null);
            }
            
            // 标题
            Object titleObj = item.get("title");
            if (titleObj != null && tvTitle != null) {
                tvTitle.setText(titleObj.toString());
                tvTitle.setVisibility(View.VISIBLE);
            } else if (tvTitle != null) {
                tvTitle.setVisibility(View.GONE);
            }
            
            // 内容预览
            Object contentObj = item.get("content_preview");
            if (contentObj != null && tvContent != null) {
                String content = contentObj.toString();
                // 限制长度
                if (content.length() > 100) {
                    content = content.substring(0, 100) + "...";
                }
                tvContent.setText(content);
                tvContent.setVisibility(View.VISIBLE);
            } else if (tvContent != null) {
                tvContent.setVisibility(View.GONE);
            }
            
            // 发布时间
            Object timeObj = item.get("publish_time");
            if (timeObj != null && tvTime != null) {
                String timeStr = timeObj.toString();
                // 简单格式化时间（提取日期部分）
                if (timeStr.length() >= 10) {
                    tvTime.setText(timeStr.substring(0, 10));
                } else {
                    tvTime.setText(timeStr);
                }
                tvTime.setVisibility(View.VISIBLE);
            } else if (tvTime != null) {
                tvTime.setVisibility(View.GONE);
            }
            
            // 统计信息（回复数、热度等）
            if (tvStats != null) {
                StringBuilder stats = new StringBuilder();
                
                // 回复数
                Object replyCountObj = item.get("reply_count");
                if (replyCountObj != null) {
                    int replyCount = replyCountObj instanceof Number ? 
                        ((Number) replyCountObj).intValue() : 0;
                    if (replyCount > 0) {
                        stats.append("回复: ").append(replyCount);
                    }
                }
                
                // 热度分（仅文章和帖子）
                if (!contentType.equals("reply")) {
                    Object hotScoreObj = item.get("hot_score");
                    if (hotScoreObj != null) {
                        double hotScore = hotScoreObj instanceof Number ? 
                            ((Number) hotScoreObj).doubleValue() : 0;
                        if (hotScore > 0) {
                            if (stats.length() > 0) {
                                stats.append(" | ");
                            }
                            stats.append("热度: ").append(String.format("%.1f", hotScore));
                        }
                    }
                }
                
                if (stats.length() > 0) {
                    tvStats.setText(stats.toString());
                    tvStats.setVisibility(View.VISIBLE);
                } else {
                    tvStats.setVisibility(View.GONE);
                }
            }
        }
    }
}

