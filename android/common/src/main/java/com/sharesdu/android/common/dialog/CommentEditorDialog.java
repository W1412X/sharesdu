package com.sharesdu.android.common.dialog;

import android.app.Activity;
import android.text.TextUtils;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.RatingBar;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AlertDialog;
import androidx.fragment.app.FragmentActivity;
import com.google.android.material.textfield.TextInputEditText;
import com.sharesdu.android.common.R;
import com.sharesdu.android.core.network.ApiClient;
import com.sharesdu.android.core.network.CourseService;
import com.sharesdu.android.core.network.response.SimpleResponse;
import com.sharesdu.android.core.utils.ErrorHandler;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import java.util.HashMap;
import java.util.Map;

/**
 * 课程评价编辑器对话框
 * 用于编辑或创建课程评价
 */
public class CommentEditorDialog {
    private static final String TAG = "CommentEditorDialog";
    
    private FragmentActivity activity;
    private AlertDialog dialog;
    private View dialogView;
    
    private RatingBar ratingBar;
    private TextInputEditText etComment;
    private ProgressBar progressBar;
    private android.widget.Button btnSubmit;
    private android.widget.Button btnCancel;
    
    private CourseService courseService;
    
    private Integer courseId;
    private Integer currentScore;
    private String currentComment;
    private boolean isEditMode; // 是否是编辑模式
    
    // 回调接口
    public interface OnCommentSubmittedListener {
        void onCommentSubmitted(Integer score, String comment);
    }
    
    private OnCommentSubmittedListener listener;
    
    public CommentEditorDialog(FragmentActivity activity) {
        this.activity = activity;
        this.courseService = ApiClient.getRetrofit().create(CourseService.class);
    }
    
    /**
     * 显示对话框
     * @param courseId 课程ID
     * @param score 当前评分（编辑模式时传入）
     * @param comment 当前评价（编辑模式时传入）
     * @param listener 提交成功的回调
     */
    public void show(Integer courseId, @Nullable Integer score, @Nullable String comment, 
                     @Nullable OnCommentSubmittedListener listener) {
        this.courseId = courseId;
        this.currentScore = score;
        this.currentComment = comment;
        this.isEditMode = (score != null && score > 0);
        this.listener = listener;
        
        dialogView = LayoutInflater.from(activity).inflate(R.layout.dialog_comment_editor, null);
        
        initViews();
        setupListeners();
        
        dialog = new AlertDialog.Builder(activity)
            .setView(dialogView)
            .setCancelable(true)
            .create();
        
        dialog.show();
    }
    
    private void initViews() {
        ratingBar = dialogView.findViewById(R.id.rating_bar);
        etComment = dialogView.findViewById(R.id.et_comment);
        progressBar = dialogView.findViewById(R.id.progress_bar);
        btnSubmit = dialogView.findViewById(R.id.btn_submit);
        btnCancel = dialogView.findViewById(R.id.btn_cancel);
        
        // 如果是编辑模式，填充现有数据
        if (isEditMode) {
            if (ratingBar != null && currentScore != null) {
                ratingBar.setRating(currentScore);
            }
            if (etComment != null && currentComment != null) {
                etComment.setText(currentComment);
            }
        }
    }
    
    private void setupListeners() {
        if (btnSubmit != null) {
            btnSubmit.setOnClickListener(v -> submitComment());
        }
        
        if (btnCancel != null) {
            btnCancel.setOnClickListener(v -> dismiss());
        }
    }
    
    /**
     * 提交评价
     */
    private void submitComment() {
        if (ratingBar == null || etComment == null || courseId == null) {
            return;
        }
        
        int score = (int) ratingBar.getRating();
        String comment = etComment.getText() != null ? etComment.getText().toString().trim() : "";
        
        // 验证评分
        if (score <= 0) {
            Toast.makeText(activity, "请选择您的评分", Toast.LENGTH_SHORT).show();
            return;
        }
        
        // 显示加载状态
        setLoading(true);
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("course_id", courseId);
        requestBody.put("score", score);
        if (!comment.isEmpty()) {
            requestBody.put("comment", comment);
        }
        
        Call<SimpleResponse> call;
        if (isEditMode) {
            // 编辑模式：调用编辑接口
            call = courseService.editRating(requestBody);
        } else {
            // 新建模式：调用评分接口
            call = courseService.rateCourse(requestBody);
        }
        
        call.enqueue(new Callback<SimpleResponse>() {
            @Override
            public void onResponse(Call<SimpleResponse> call, Response<SimpleResponse> response) {
                setLoading(false);
                
                if (response.isSuccessful() && response.body() != null) {
                    SimpleResponse simpleResponse = response.body();
                    if (simpleResponse.isSuccess()) {
                        Toast.makeText(activity, "提交成功", Toast.LENGTH_SHORT).show();
                        
                        // 回调
                        if (listener != null) {
                            listener.onCommentSubmitted(score, comment);
                        }
                        
                        dismiss();
                    } else {
                        String errorMsg = simpleResponse.getMessage();
                        if (errorMsg == null || errorMsg.isEmpty()) {
                            errorMsg = "提交失败";
                        }
                        Toast.makeText(activity, errorMsg, Toast.LENGTH_SHORT).show();
                    }
                } else {
                    String errorMsg = ErrorHandler.getErrorMessage(response);
                    Toast.makeText(activity, "提交失败：" + errorMsg, Toast.LENGTH_SHORT).show();
                }
            }
            
            @Override
            public void onFailure(Call<SimpleResponse> call, Throwable t) {
                setLoading(false);
                String errorMsg = ErrorHandler.getErrorMessage(t);
                Toast.makeText(activity, "提交失败：" + errorMsg, Toast.LENGTH_SHORT).show();
                Log.e(TAG, "提交评价失败", t);
            }
        });
    }
    
    private void setLoading(boolean loading) {
        if (progressBar != null) {
            progressBar.setVisibility(loading ? View.VISIBLE : View.GONE);
        }
        if (btnSubmit != null) {
            btnSubmit.setEnabled(!loading);
        }
        if (btnCancel != null) {
            btnCancel.setEnabled(!loading);
        }
        if (ratingBar != null) {
            ratingBar.setEnabled(!loading);
        }
        if (etComment != null) {
            etComment.setEnabled(!loading);
        }
    }
    
    public void dismiss() {
        if (dialog != null && dialog.isShowing()) {
            dialog.dismiss();
        }
    }
}



