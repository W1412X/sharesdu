package com.sharesdu.android.feature.index;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.FrameLayout;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import com.sharesdu.android.common.dialog.CourseEditorDialog;

/**
 * 课程编辑器 Activity
 */
public class CourseEditorActivity extends AppCompatActivity {
    public static final String EXTRA_COURSE_ID = "course_id";
    
    private CourseEditorDialog courseEditorDialog;
    private FrameLayout editorContainer;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_course_editor);
        
        initViews();
        initEditor();
    }
    
    private void initViews() {
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setTitle("创建课程");
        }
        toolbar.setNavigationOnClickListener(v -> finish());
        
        editorContainer = findViewById(R.id.editor_container);
    }
    
    private void initEditor() {
        // 获取传入的参数（编辑模式时使用）
        String courseId = getIntent().getStringExtra(EXTRA_COURSE_ID);
        
        // 创建编辑器（在 Activity 中使用，不显示对话框）
        courseEditorDialog = new CourseEditorDialog(this);
        View editorView = courseEditorDialog.setupForActivity(courseId, (courseIdResult, courseName) -> {
            // 课程创建成功回调
            Toast.makeText(this, "课程创建成功", Toast.LENGTH_SHORT).show();
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
    protected void onDestroy() {
        super.onDestroy();
        if (courseEditorDialog != null) {
            courseEditorDialog.dismiss();
        }
    }
    
    /**
     * 启动 CourseEditorActivity 的静态方法
     */
    public static void start(Context context, String courseId) {
        Intent intent = new Intent(context, CourseEditorActivity.class);
        intent.putExtra(EXTRA_COURSE_ID, courseId);
        context.startActivity(intent);
    }
}

