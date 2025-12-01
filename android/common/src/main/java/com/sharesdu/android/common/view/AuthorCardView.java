package com.sharesdu.android.common.view;

import android.content.Context;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.TextView;
import androidx.annotation.Nullable;
import androidx.cardview.widget.CardView;
import com.google.android.material.chip.Chip;
import com.sharesdu.android.common.R;

/**
 * 作者信息卡片组件
 * 显示作者的基本信息：头像、名称、荣誉等级、校区学院专业等
 */
public class AuthorCardView extends CardView {
    private UserAvatarView avatarView;
    private TextView tvReputation;
    private Chip chipReputationLevel;
    private LinearLayout layoutReputation;
    private TextView tvCampus;
    private TextView tvCollege;
    private TextView tvMajor;
    private TextView tvRegisterTime;
    private TextView tvMasterBadge;
    private LinearLayout layoutMaster;
    
    public AuthorCardView(Context context) {
        super(context);
        init();
    }
    
    public AuthorCardView(Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
        init();
    }
    
    public AuthorCardView(Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
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
        setCardElevation(2f);
        setRadius(8f * getResources().getDisplayMetrics().density);
        
        // 加载布局
        LayoutInflater.from(getContext()).inflate(R.layout.view_author_card, this, true);
        
        avatarView = findViewById(R.id.avatar_view);
        tvReputation = findViewById(R.id.tv_reputation);
        chipReputationLevel = findViewById(R.id.chip_reputation_level);
        layoutReputation = findViewById(R.id.layout_reputation);
        tvCampus = findViewById(R.id.tv_campus);
        tvCollege = findViewById(R.id.tv_college);
        tvMajor = findViewById(R.id.tv_major);
        tvRegisterTime = findViewById(R.id.tv_register_time);
        tvMasterBadge = findViewById(R.id.tv_master_badge);
        layoutMaster = findViewById(R.id.layout_master);
    }
    
    /**
     * 绑定作者数据
     * @param data 作者数据（Map类型）
     */
    public void bindAuthorData(Object data) {
        if (data == null) {
            return;
        }
        
        if (!(data instanceof java.util.Map)) {
            return;
        }
        
        @SuppressWarnings("unchecked")
        java.util.Map<String, Object> dataMap = (java.util.Map<String, Object>) data;
        
        // 用户ID和名称
        Object userIdObj = dataMap.get("user_id");
        Object userNameObj = dataMap.get("user_name");
        Integer userId = userIdObj != null ? (userIdObj instanceof Integer ? (Integer) userIdObj : 
            (userIdObj instanceof Number ? ((Number) userIdObj).intValue() : null)) : null;
        String userName = userNameObj != null ? userNameObj.toString() : "";
        
        if (avatarView != null && userId != null) {
            avatarView.setUser(userId, userName);
        }
        
        // 荣誉分和等级
        // 注意：查看他人主页时，API 不返回 reputation 字段，只返回 reputation_level
        Object reputationObj = dataMap.get("reputation");
        if (reputationObj != null && tvReputation != null) {
            int reputation = reputationObj instanceof Number ? 
                ((Number) reputationObj).intValue() : 0;
            tvReputation.setText("LV." + reputation);
            tvReputation.setVisibility(View.VISIBLE);
        } else if (tvReputation != null) {
            // 如果没有 reputation 字段（查看他人主页），隐藏等级显示
            tvReputation.setVisibility(View.GONE);
        }
        
        Object reputationLevelObj = dataMap.get("reputation_level");
        if (reputationLevelObj != null && chipReputationLevel != null) {
            chipReputationLevel.setText(reputationLevelObj.toString());
            chipReputationLevel.setVisibility(View.VISIBLE);
        } else if (chipReputationLevel != null) {
            chipReputationLevel.setVisibility(View.GONE);
        }
        
        // 校区、学院、专业
        Object campusObj = dataMap.get("campus");
        String campus = campusObj != null ? campusObj.toString() : "未知校区";
        if (tvCampus != null) {
            tvCampus.setText(campus);
        }
        
        Object collegeObj = dataMap.get("college");
        String college = collegeObj != null ? collegeObj.toString() : "未知学院";
        if (tvCollege != null) {
            tvCollege.setText(college);
        }
        
        Object majorObj = dataMap.get("major");
        String major = majorObj != null ? majorObj.toString() : "未知专业";
        if (tvMajor != null) {
            tvMajor.setText(major);
        }
        
        // 注册时间
        // 注意：web项目优先使用 registration_year，如果没有则使用 created_at 提取年份
        Object registerYearObj = dataMap.get("registration_year");
        Object registerTimeObj = dataMap.get("created_at");
        if (tvRegisterTime != null) {
            if (registerYearObj != null) {
                // 优先使用 registration_year（整数年份）
                tvRegisterTime.setText(registerYearObj.toString() + "年注册");
            } else if (registerTimeObj != null) {
                // 从 created_at 提取年份（格式：2025-02-09T15:40:01.006600+00:00）
                String timeStr = registerTimeObj.toString();
                if (timeStr.length() >= 4) {
                    tvRegisterTime.setText(timeStr.substring(0, 4) + "年注册");
                } else {
                    tvRegisterTime.setText("注册时间未知");
                }
            } else {
                tvRegisterTime.setText("注册时间未知");
            }
        }
        
        // 管理员标识（右下角）
        // 注意：web项目中使用的是 superMaster，不是 super_master
        Object masterObj = dataMap.get("master");
        Object superMasterObj = dataMap.get("superMaster"); // 注意：是 superMaster，不是 super_master
        boolean isMaster = masterObj instanceof Boolean ? (Boolean) masterObj : false;
        boolean isSuperMaster = superMasterObj instanceof Boolean ? (Boolean) superMasterObj : false;
        
        if (layoutMaster != null) {
            if (isSuperMaster || isMaster) {
                layoutMaster.setVisibility(View.VISIBLE);
                if (tvMasterBadge != null) {
                    tvMasterBadge.setText(isSuperMaster ? "超级管理员" : "管理员");
                }
            } else {
                layoutMaster.setVisibility(View.GONE);
            }
        }
    }
}

