package com.sharesdu.android.common.adapter;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.PopupMenu;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.sharesdu.android.common.R;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 收藏夹列表适配器
 * 只显示收藏夹名称和时间，点击后通过回调显示弹窗
 */
public class StarFolderAdapter extends RecyclerView.Adapter<StarFolderAdapter.FolderViewHolder> {
    private Context context;
    private List<Map<String, Object>> folderList;
    private OnFolderClickListener onFolderClickListener;
    private OnFolderDeleteListener onFolderDeleteListener;
    
    public interface OnFolderClickListener {
        void onFolderClick(Map<String, Object> folder);
    }
    
    public interface OnFolderDeleteListener {
        void onFolderDelete(Map<String, Object> folder);
    }
    
    public StarFolderAdapter(Context context) {
        this.context = context;
        this.folderList = new ArrayList<>();
    }
    
    public void setOnFolderClickListener(OnFolderClickListener listener) {
        this.onFolderClickListener = listener;
    }
    
    public void setOnFolderDeleteListener(OnFolderDeleteListener listener) {
        this.onFolderDeleteListener = listener;
    }
    
    public void setData(List<Map<String, Object>> folderList) {
        this.folderList = folderList != null ? folderList : new ArrayList<>();
        notifyDataSetChanged();
    }
    
    @NonNull
    @Override
    public FolderViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_star_folder, parent, false);
        return new FolderViewHolder(view);
    }
    
    @Override
    public void onBindViewHolder(@NonNull FolderViewHolder holder, int position) {
        if (position >= folderList.size()) {
            return;
        }
        
        Map<String, Object> folder = folderList.get(position);
        holder.bind(folder);
    }
    
    @Override
    public int getItemCount() {
        return folderList.size();
    }
    
    class FolderViewHolder extends RecyclerView.ViewHolder {
        private TextView tvFolderName;
        private TextView tvCreateTime;
        private ImageView ivMore;
        
        public FolderViewHolder(@NonNull View itemView) {
            super(itemView);
            tvFolderName = itemView.findViewById(R.id.tv_folder_name);
            tvCreateTime = itemView.findViewById(R.id.tv_create_time);
            ivMore = itemView.findViewById(R.id.iv_more);
        }
        
        public void bind(Map<String, Object> folder) {
            // 收藏夹名称（API返回的字段是 name 而不是 folder_name）
            Object nameObj = folder.get("name");
            if (nameObj == null) {
                // 兼容旧字段名
                nameObj = folder.get("folder_name");
            }
            if (nameObj != null && tvFolderName != null) {
                tvFolderName.setText(nameObj.toString());
            }
            
            // 创建时间 - 格式化显示
            Object timeObj = folder.get("created_at");
            if (timeObj != null && tvCreateTime != null) {
                String timeStr = formatTime(timeObj.toString());
                tvCreateTime.setText(timeStr);
            }
            
            // 点击显示弹窗
            itemView.setOnClickListener(v -> {
                if (onFolderClickListener != null) {
                    onFolderClickListener.onFolderClick(folder);
                }
            });
            
            // 更多选项菜单
            if (ivMore != null) {
                ivMore.setOnClickListener(v -> {
                    showPopupMenu(v, folder);
                });
            }
        }
        
        private void showPopupMenu(View anchor, Map<String, Object> folder) {
            PopupMenu popupMenu = new PopupMenu(context, anchor);
            popupMenu.getMenu().add(0, 0, 0, "删除此收藏夹");
            
            popupMenu.setOnMenuItemClickListener(item -> {
                if (item.getItemId() == 0) {
                    // 删除收藏夹
                    if (onFolderDeleteListener != null) {
                        onFolderDeleteListener.onFolderDelete(folder);
                    }
                    return true;
                }
                return false;
            });
            
            popupMenu.show();
        }
    }
    
    /**
     * 格式化时间字符串
     * 将 ISO 8601 格式的时间字符串转换为更易读的格式
     * 例如：2025-02-09T15:40:01.006600+00:00 -> 2025-02-09 15:40
     */
    public static String formatTime(String timeStr) {
        if (timeStr == null || timeStr.isEmpty()) {
            return "";
        }
        try {
            // 处理 ISO 8601 格式：2025-02-09T15:40:01.006600+00:00
            if (timeStr.contains("T")) {
                String[] parts = timeStr.split("T");
                if (parts.length >= 2) {
                    String datePart = parts[0];
                    String timePart = parts[1];
                    // 提取时分秒部分（去掉毫秒和时区）
                    if (timePart.contains(".")) {
                        timePart = timePart.split("\\.")[0];
                    } else if (timePart.contains("+")) {
                        timePart = timePart.split("\\+")[0];
                    } else if (timePart.contains("-") && timePart.length() > 10) {
                        // 处理时区格式：-08:00
                        int timeZoneIndex = timePart.lastIndexOf("-");
                        if (timeZoneIndex > 0) {
                            timePart = timePart.substring(0, timeZoneIndex);
                        }
                    }
                    // 只显示时分
                    if (timePart.length() >= 5) {
                        timePart = timePart.substring(0, 5);
                    }
                    return datePart + " " + timePart;
                }
            }
            return timeStr;
        } catch (Exception e) {
            return timeStr;
        }
    }
}

