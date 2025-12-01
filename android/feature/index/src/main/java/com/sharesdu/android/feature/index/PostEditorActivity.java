package com.sharesdu.android.feature.index;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.FrameLayout;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.fragment.app.FragmentActivity;
import com.sharesdu.android.common.dialog.PostEditorDialog;

/**
 * 帖子编辑器 Activity
 */
public class PostEditorActivity extends AppCompatActivity {
    public static final String EXTRA_POST_TYPE = "post_type";
    public static final String EXTRA_RELATED_ID = "related_id";
    
    private PostEditorDialog postEditorDialog;
    private FrameLayout editorContainer;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_post_editor);
        
        initViews();
        initEditor();
    }
    
    private void initViews() {
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setTitle("发布帖子");
        }
        toolbar.setNavigationOnClickListener(v -> finish());
        
        editorContainer = findViewById(R.id.editor_container);
    }
    
    private void initEditor() {
        // 获取传入的参数
        String postType = getIntent().getStringExtra(EXTRA_POST_TYPE);
        String relatedId = getIntent().getStringExtra(EXTRA_RELATED_ID);
        
        // 创建编辑器（在 Activity 中使用，不显示对话框）
        postEditorDialog = new PostEditorDialog(this);
        View editorView = postEditorDialog.setupForActivity(postType, relatedId, (postId, title, content) -> {
            // 帖子创建成功回调
            Toast.makeText(this, "帖子发布成功", Toast.LENGTH_SHORT).show();
            setResult(RESULT_OK);
            finish();
        });
        
        // 将编辑器视图添加到 Activity 中
        if (editorView != null) {
            editorContainer.removeAllViews();
            editorContainer.addView(editorView);
        }
    }
    
    @Override
    public void onBackPressed() {
        // 检查是否需要保存草稿
        if (postEditorDialog != null) {
            postEditorDialog.checkAndSaveDraftOnExit();
        } else {
            super.onBackPressed();
        }
    }
    
    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (postEditorDialog != null) {
            postEditorDialog.dismiss();
        }
    }
    
    /**
     * 启动 PostEditorActivity 的静态方法
     */
    public static void start(Context context, String postType, String relatedId) {
        Intent intent = new Intent(context, PostEditorActivity.class);
        intent.putExtra(EXTRA_POST_TYPE, postType);
        intent.putExtra(EXTRA_RELATED_ID, relatedId);
        context.startActivity(intent);
    }
}

