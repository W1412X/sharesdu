package com.sharesdu.android.feature.self;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import com.sharesdu.android.feature.self.R;

/**
 * 账户页面 Fragment
 * TODO: 实现用户信息编辑（头像、用户名、邮箱、密码等）
 */
public class SelfAccountFragment extends Fragment {
    
    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_self_account, container, false);
        TextView tvPlaceholder = view.findViewById(R.id.tv_placeholder);
        if (tvPlaceholder != null) {
            tvPlaceholder.setText("账户编辑功能待实现");
        }
        return view;
    }
}

