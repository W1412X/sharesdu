package com.sharesdu.android.feature.author;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.sharesdu.android.feature.author.R;
import com.sharesdu.android.common.adapter.AuthorContentAdapter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 作者内容 Fragment
 * 显示作者的文章/帖子/回复列表（预览模式）
 */
public class AuthorContentFragment extends Fragment {
    private static final String ARG_AUTHOR_ID = "author_id";
    private static final String ARG_CONTENT_TYPE = "content_type";
    
    private RecyclerView recyclerView;
    private TextView tvEmpty;
    private Integer authorId;
    private String contentType; // article/post/reply
    private List<Map<String, Object>> contentList;
    private AuthorContentAdapter adapter;
    private Object pendingPreviewData; // 待设置的预览数据（视图未创建时）
    
    public static AuthorContentFragment newInstance(Integer authorId, String contentType) {
        AuthorContentFragment fragment = new AuthorContentFragment();
        Bundle args = new Bundle();
        args.putInt(ARG_AUTHOR_ID, authorId);
        args.putString(ARG_CONTENT_TYPE, contentType);
        fragment.setArguments(args);
        return fragment;
    }
    
    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getArguments() != null) {
            authorId = getArguments().getInt(ARG_AUTHOR_ID);
            contentType = getArguments().getString(ARG_CONTENT_TYPE);
        }
        contentList = new ArrayList<>();
    }
    
    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_author_content, container, false);
        
        recyclerView = view.findViewById(R.id.recycler_view);
        tvEmpty = view.findViewById(R.id.tv_empty);
        
        recyclerView.setLayoutManager(new LinearLayoutManager(getContext()));
        adapter = new AuthorContentAdapter(getContext(), contentType);
        recyclerView.setAdapter(adapter);
        
        // 如果有待设置的数据，现在设置
        if (pendingPreviewData != null) {
            setPreviewData(pendingPreviewData);
            pendingPreviewData = null;
        } else {
            // 初始显示空状态
            updateUI();
        }
        
        return view;
    }
    
    /**
     * 设置预览数据
     * @param data API 返回的数据
     */
    public void setPreviewData(Object data) {
        if (data == null || !(data instanceof Map)) {
            return;
        }
        
        // 确保视图和适配器已创建
        if (getView() == null || adapter == null) {
            // 如果视图或适配器还没创建，先保存数据，等视图创建后再设置
            pendingPreviewData = data;
            return;
        }
        
        @SuppressWarnings("unchecked")
        Map<String, Object> dataMap = (Map<String, Object>) data;
        
        List<Map<String, Object>> list = new ArrayList<>();
        
        // 根据 contentType 获取对应的列表
        switch (contentType) {
            case "article":
                Object articlesObj = dataMap.get("articles");
                if (articlesObj instanceof List) {
                    @SuppressWarnings("unchecked")
                    List<Object> articles = (List<Object>) articlesObj;
                    for (Object item : articles) {
                        if (item instanceof Map) {
                            @SuppressWarnings("unchecked")
                            Map<String, Object> itemMap = (Map<String, Object>) item;
                            list.add(itemMap);
                        }
                    }
                }
                break;
            case "post":
                Object postsObj = dataMap.get("posts");
                if (postsObj instanceof List) {
                    @SuppressWarnings("unchecked")
                    List<Object> posts = (List<Object>) postsObj;
                    for (Object item : posts) {
                        if (item instanceof Map) {
                            @SuppressWarnings("unchecked")
                            Map<String, Object> itemMap = (Map<String, Object>) item;
                            list.add(itemMap);
                        }
                    }
                }
                break;
            case "reply":
                Object repliesObj = dataMap.get("replies");
                if (repliesObj instanceof List) {
                    @SuppressWarnings("unchecked")
                    List<Object> replies = (List<Object>) repliesObj;
                    for (Object item : replies) {
                        if (item instanceof Map) {
                            @SuppressWarnings("unchecked")
                            Map<String, Object> itemMap = (Map<String, Object>) item;
                            list.add(itemMap);
                        }
                    }
                }
                break;
        }
        
        if (contentList == null) {
            contentList = new ArrayList<>();
        }
        contentList.clear();
        contentList.addAll(list);
        
        // 更新 UI（确保在主线程）
        if (getActivity() != null) {
            getActivity().runOnUiThread(() -> updateUI());
        } else {
            updateUI();
        }
    }
    
    private void updateUI() {
        if (contentList.isEmpty()) {
            if (recyclerView != null) {
                recyclerView.setVisibility(View.GONE);
            }
            if (tvEmpty != null) {
                tvEmpty.setVisibility(View.VISIBLE);
                String emptyText = "暂无" + (contentType.equals("article") ? "文章" : 
                    contentType.equals("post") ? "帖子" : "回复");
                tvEmpty.setText(emptyText);
            }
        } else {
            if (recyclerView != null) {
                recyclerView.setVisibility(View.VISIBLE);
            }
            if (tvEmpty != null) {
                tvEmpty.setVisibility(View.GONE);
            }
            // 更新适配器
            if (adapter != null) {
                adapter.setData(contentList);
            }
        }
    }
}

