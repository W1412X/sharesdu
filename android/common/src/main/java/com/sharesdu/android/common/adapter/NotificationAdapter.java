package com.sharesdu.android.common.adapter;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.sharesdu.android.common.R;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 通知列表适配器
 */
public class NotificationAdapter extends RecyclerView.Adapter<NotificationAdapter.NotificationViewHolder> {
    private Context context;
    private List<Map<String, Object>> notificationList;
    
    public NotificationAdapter(Context context) {
        this.context = context;
        this.notificationList = new ArrayList<>();
    }
    
    public void setData(List<Map<String, Object>> notificationList) {
        this.notificationList = notificationList != null ? notificationList : new ArrayList<>();
        notifyDataSetChanged();
    }
    
    @NonNull
    @Override
    public NotificationViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_notification, parent, false);
        return new NotificationViewHolder(view);
    }
    
    @Override
    public void onBindViewHolder(@NonNull NotificationViewHolder holder, int position) {
        if (position >= notificationList.size()) {
            return;
        }
        
        Map<String, Object> notification = notificationList.get(position);
        holder.bind(notification);
    }
    
    @Override
    public int getItemCount() {
        return notificationList.size();
    }
    
    static class NotificationViewHolder extends RecyclerView.ViewHolder {
        private TextView tvType;
        private TextView tvMessage;
        private TextView tvTime;
        private TextView tvReadStatus;
        
        public NotificationViewHolder(@NonNull View itemView) {
            super(itemView);
            tvType = itemView.findViewById(R.id.tv_type);
            tvMessage = itemView.findViewById(R.id.tv_message);
            tvTime = itemView.findViewById(R.id.tv_time);
            tvReadStatus = itemView.findViewById(R.id.tv_read_status);
        }
        
        public void bind(Map<String, Object> notification) {
            // 通知类型
            Object typeObj = notification.get("type");
            if (typeObj != null && tvType != null) {
                tvType.setText(typeObj.toString());
            }
            
            // 通知内容
            Object messageObj = notification.get("message");
            if (messageObj != null && tvMessage != null) {
                tvMessage.setText(messageObj.toString());
            }
            
            // 创建时间
            Object timeObj = notification.get("created_at");
            if (timeObj != null && tvTime != null) {
                tvTime.setText(timeObj.toString());
            }
            
            // 已读状态
            Object isReadObj = notification.get("is_read");
            if (isReadObj != null && tvReadStatus != null) {
                boolean isRead = isReadObj instanceof Boolean ? (Boolean) isReadObj : false;
                tvReadStatus.setText(isRead ? "已读" : "未读");
                tvReadStatus.setTextColor(isRead ? 
                    itemView.getContext().getColor(R.color.text_color_secondary) :
                    itemView.getContext().getColor(R.color.theme_color));
            }
        }
    }
}

