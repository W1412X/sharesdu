package com.sharesdu.android.common.adapter;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.sharesdu.android.common.R;
import java.util.List;

/**
 * 个人页面菜单列表适配器
 */
public class SelfMenuAdapter extends RecyclerView.Adapter<SelfMenuAdapter.MenuViewHolder> {
    private Context context;
    private List<MenuItem> menuItems;
    private OnMenuItemClickListener listener;
    
    public interface OnMenuItemClickListener {
        void onMenuItemClick(String menuId);
    }
    
    public static class MenuItem {
        private String title;
        private int iconResId;
        private String menuId;
        
        public MenuItem(String title, int iconResId, String menuId) {
            this.title = title;
            this.iconResId = iconResId;
            this.menuId = menuId;
        }
        
        public String getTitle() {
            return title;
        }
        
        public int getIconResId() {
            return iconResId;
        }
        
        public String getMenuId() {
            return menuId;
        }
    }
    
    public SelfMenuAdapter(Context context, List<MenuItem> menuItems, OnMenuItemClickListener listener) {
        this.context = context;
        this.menuItems = menuItems;
        this.listener = listener;
    }
    
    @NonNull
    @Override
    public MenuViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_self_menu, parent, false);
        return new MenuViewHolder(view);
    }
    
    @Override
    public void onBindViewHolder(@NonNull MenuViewHolder holder, int position) {
        MenuItem item = menuItems.get(position);
        holder.bind(item);
        
        holder.itemView.setOnClickListener(v -> {
            if (listener != null) {
                listener.onMenuItemClick(item.getMenuId());
            }
        });
    }
    
    @Override
    public int getItemCount() {
        return menuItems.size();
    }
    
    static class MenuViewHolder extends RecyclerView.ViewHolder {
        private ImageView ivIcon;
        private TextView tvTitle;
        private ImageView ivArrow;
        
        public MenuViewHolder(@NonNull View itemView) {
            super(itemView);
            ivIcon = itemView.findViewById(R.id.iv_icon);
            tvTitle = itemView.findViewById(R.id.tv_title);
            ivArrow = itemView.findViewById(R.id.iv_arrow);
        }
        
        public void bind(MenuItem item) {
            if (ivIcon != null) {
                ivIcon.setImageResource(item.getIconResId());
            }
            if (tvTitle != null) {
                tvTitle.setText(item.getTitle());
            }
        }
    }
}

