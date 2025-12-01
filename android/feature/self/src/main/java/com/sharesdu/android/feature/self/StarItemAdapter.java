package com.sharesdu.android.feature.self;

import android.content.Context;
import android.content.Intent;
import android.view.LayoutInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.PopupMenu;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.sharesdu.android.feature.self.R;
import com.sharesdu.android.common.adapter.StarFolderAdapter;
import com.sharesdu.android.core.navigation.LinkNavigator;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 收藏项适配器
 * 用于在弹窗中显示收藏项目列表
 */
public class StarItemAdapter extends RecyclerView.Adapter<StarItemAdapter.StarItemViewHolder> {
    private Context context;
    private List<Map<String, Object>> starList;
    private OnItemUnstarListener onItemUnstarListener;
    
    public interface OnItemUnstarListener {
        void onItemUnstar(int position, Map<String, Object> starItem);
    }
    
    public StarItemAdapter(Context context) {
        this.context = context;
        this.starList = new ArrayList<>();
    }
    
    public void setOnItemUnstarListener(OnItemUnstarListener listener) {
        this.onItemUnstarListener = listener;
    }
    
    public void setData(List<Map<String, Object>> starList) {
        this.starList = starList != null ? starList : new ArrayList<>();
        notifyDataSetChanged();
    }
    
    /**
     * 移除指定位置的项目
     */
    public void removeItem(int position) {
        if (position >= 0 && position < starList.size()) {
            starList.remove(position);
            notifyItemRemoved(position);
            notifyItemRangeChanged(position, starList.size() - position);
        }
    }
    
    @NonNull
    @Override
    public StarItemViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_star_item_dialog, parent, false);
        return new StarItemViewHolder(view);
    }
    
    @Override
    public void onBindViewHolder(@NonNull StarItemViewHolder holder, int position) {
        if (position >= starList.size()) {
            return;
        }
        Map<String, Object> star = starList.get(position);
        holder.bind(star, position);
    }
    
    @Override
    public int getItemCount() {
        return starList.size();
    }
    
    class StarItemViewHolder extends RecyclerView.ViewHolder {
        private TextView tvContentName;
        private TextView tvContentType;
        private TextView tvCreateTime;
        private ImageView ivMore;
        
        public StarItemViewHolder(@NonNull View itemView) {
            super(itemView);
            tvContentName = itemView.findViewById(R.id.tv_content_name);
            tvContentType = itemView.findViewById(R.id.tv_content_type);
            tvCreateTime = itemView.findViewById(R.id.tv_create_time);
            ivMore = itemView.findViewById(R.id.iv_more);
        }
        
        public void bind(Map<String, Object> star, int position) {
            // 内容名称
            Object nameObj = star.get("content_name");
            if (nameObj != null && tvContentName != null) {
                tvContentName.setText(nameObj.toString());
            }
            
            // 内容类型：0/1/2 分别表示课程、文章、帖子
            Object typeObj = star.get("content_type");
            String contentType = "";
            if (typeObj != null && tvContentType != null) {
                int type = typeObj instanceof Number ? ((Number) typeObj).intValue() : -1;
                switch (type) {
                    case 0:
                        contentType = "课程";
                        break;
                    case 1:
                        contentType = "文章";
                        break;
                    case 2:
                        contentType = "帖子";
                        break;
                }
                tvContentType.setText(contentType);
            }
            
            // 收藏时间 - 格式化显示
            Object timeObj = star.get("created_at");
            if (timeObj != null && tvCreateTime != null) {
                String timeStr = StarFolderAdapter.formatTime(timeObj.toString());
                tvCreateTime.setText(timeStr);
            }
            
            // 点击跳转
            itemView.setOnClickListener(v -> {
                Object contentIdObj = star.get("content_id");
                if (contentIdObj == null) {
                    return;
                }
                
                // 根据类型构建链接
                int type = typeObj instanceof Number ? ((Number) typeObj).intValue() : -1;
                Integer contentId = contentIdObj instanceof Integer ? (Integer) contentIdObj :
                    (contentIdObj instanceof Number ? ((Number) contentIdObj).intValue() : null);
                
                if (contentId == null) {
                    return;
                }
                
                switch (type) {
                    case 0: // 课程 - 使用 Intent 启动 Activity，避免直接依赖 feature/index 模块
                        Intent courseIntent = new Intent();
                        courseIntent.setClassName(context, "com.sharesdu.android.feature.index.CourseDetailActivity");
                        courseIntent.putExtra("course_id", contentId);
                        context.startActivity(courseIntent);
                        break;
                    case 1: // 文章
                        String articleLink = "#/article/" + contentId;
                        LinkNavigator.navigate(context, articleLink);
                        break;
                    case 2: // 帖子 - 使用 Intent 启动 Activity，避免直接依赖 feature/index 模块
                        Intent intent = new Intent();
                        intent.setClassName(context, "com.sharesdu.android.feature.index.PostDetailActivity");
                        intent.putExtra("post_id", contentId);
                        context.startActivity(intent);
                        break;
                }
            });
            
            // 更多选项菜单
            if (ivMore != null) {
                ivMore.setOnClickListener(v -> {
                    showPopupMenu(v, star, position);
                });
            }
        }
        
        private void showPopupMenu(View anchor, Map<String, Object> star, int position) {
            PopupMenu popupMenu = new PopupMenu(context, anchor);
            popupMenu.getMenu().add(0, 0, 0, "取消收藏");
            
            popupMenu.setOnMenuItemClickListener(item -> {
                if (item.getItemId() == 0) {
                    // 取消收藏
                    if (onItemUnstarListener != null) {
                        onItemUnstarListener.onItemUnstar(position, star);
                    }
                    return true;
                }
                return false;
            });
            
            popupMenu.show();
        }
    }
}

