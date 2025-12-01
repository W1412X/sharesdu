package com.sharesdu.android.common.adapter;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.sharesdu.android.common.R;
import com.sharesdu.android.common.view.UserAvatarView;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 聊天用户列表适配器
 */
public class ChatUserAdapter extends RecyclerView.Adapter<ChatUserAdapter.ChatUserViewHolder> {
    private Context context;
    private List<Map<String, Object>> chatUserList;
    private OnChatUserClickListener listener;
    
    public interface OnChatUserClickListener {
        void onChatUserClick(Map<String, Object> chatUser);
    }
    
    public ChatUserAdapter(Context context, OnChatUserClickListener listener) {
        this.context = context;
        this.listener = listener;
        this.chatUserList = new ArrayList<>();
    }
    
    public void setData(List<Map<String, Object>> chatUserList) {
        this.chatUserList = chatUserList != null ? chatUserList : new ArrayList<>();
        notifyDataSetChanged();
    }
    
    @NonNull
    @Override
    public ChatUserViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_chat_user, parent, false);
        return new ChatUserViewHolder(view);
    }
    
    @Override
    public void onBindViewHolder(@NonNull ChatUserViewHolder holder, int position) {
        if (position >= chatUserList.size()) {
            return;
        }
        
        Map<String, Object> chatUser = chatUserList.get(position);
        holder.bind(chatUser);
        
        // 点击事件
        holder.itemView.setOnClickListener(v -> {
            if (listener != null) {
                listener.onChatUserClick(chatUser);
            }
        });
    }
    
    @Override
    public int getItemCount() {
        return chatUserList.size();
    }
    
    static class ChatUserViewHolder extends RecyclerView.ViewHolder {
        private UserAvatarView avatarView;
        private TextView tvUserName;
        private TextView tvLastMessage;
        private TextView tvUnreadCount;
        private TextView tvTime;
        
        public ChatUserViewHolder(@NonNull View itemView) {
            super(itemView);
            avatarView = itemView.findViewById(R.id.avatar_view);
            tvUserName = itemView.findViewById(R.id.tv_user_name);
            tvLastMessage = itemView.findViewById(R.id.tv_last_message);
            tvUnreadCount = itemView.findViewById(R.id.tv_unread_count);
            tvTime = itemView.findViewById(R.id.tv_time);
        }
        
        public void bind(Map<String, Object> chatUser) {
            // 用户ID和名称
            Object userIdObj = chatUser.get("user_id");
            Object usernameObj = chatUser.get("username");
            Integer userId = userIdObj instanceof Integer ? (Integer) userIdObj :
                (userIdObj instanceof Number ? ((Number) userIdObj).intValue() : null);
            String username = usernameObj != null ? usernameObj.toString() : "";
            
            if (avatarView != null && userId != null) {
                avatarView.setUser(userId, username);
            }
            
            if (tvUserName != null) {
                tvUserName.setText(username);
            }
            
            // 最后一条消息
            Object lastMessageObj = chatUser.get("last_message");
            if (lastMessageObj instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> lastMessage = (Map<String, Object>) lastMessageObj;
                Object contentObj = lastMessage.get("content");
                if (contentObj != null && tvLastMessage != null) {
                    tvLastMessage.setText(contentObj.toString());
                }
                
                Object timeObj = lastMessage.get("sent_at");
                if (timeObj != null && tvTime != null) {
                    tvTime.setText(timeObj.toString());
                }
            }
            
            // 未读消息数
            Object unreadCountObj = chatUser.get("unread_count");
            if (unreadCountObj != null && tvUnreadCount != null) {
                int unreadCount = unreadCountObj instanceof Number ? 
                    ((Number) unreadCountObj).intValue() : 0;
                if (unreadCount > 0) {
                    tvUnreadCount.setText(String.valueOf(unreadCount));
                    tvUnreadCount.setVisibility(View.VISIBLE);
                } else {
                    tvUnreadCount.setVisibility(View.GONE);
                }
            }
        }
    }
}

