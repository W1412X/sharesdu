package com.sharesdu.android.common.dialog;

import android.text.TextUtils;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.AutoCompleteTextView;
import android.widget.ProgressBar;
import android.widget.Toast;
import androidx.appcompat.app.AlertDialog;
import androidx.fragment.app.FragmentActivity;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;
import com.sharesdu.android.common.R;
import com.sharesdu.android.common.util.CourseConfig;
import com.sharesdu.android.core.network.ApiClient;
import com.sharesdu.android.core.network.CourseService;
import com.sharesdu.android.core.network.response.CreateCourseResponse;
import com.sharesdu.android.core.network.response.SimpleResponse;
import com.sharesdu.android.core.utils.ErrorHandler;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import java.util.HashMap;
import java.util.Map;

/**
 * 课程编辑器对话框
 * 通用组件，可在创建和编辑课程时复用
 */
public class CourseEditorDialog {
    private static final String TAG = "CourseEditorDialog";
    
    private FragmentActivity activity;
    private AlertDialog dialog;
    private View dialogView;
    
    private TextInputEditText etCourseName;
    private TextInputEditText etTeacher;
    private AutoCompleteTextView etCourseType;
    private TextInputEditText etCredit;
    private AutoCompleteTextView etCollege;
    private AutoCompleteTextView etCampus;
    private AutoCompleteTextView etExamineMethod;
    private AutoCompleteTextView etAttendMethod;
    private MaterialButton btnSubmit;
    private MaterialButton btnCancel;
    private ProgressBar progressBar;
    
    private CourseService courseService;
    private boolean isEditMode = false;
    private String courseId = null;
    
    /**
     * 回调接口
     */
    public interface OnCourseCreatedListener {
        void onCourseCreated(String courseId, String courseName);
    }
    
    private OnCourseCreatedListener listener;
    
    public CourseEditorDialog(FragmentActivity activity) {
        this.activity = activity;
        this.courseService = ApiClient.getRetrofit().create(CourseService.class);
    }
    
    /**
     * 显示对话框
     * @param courseId 课程ID（编辑模式，null表示创建模式）
     * @param listener 创建成功的回调
     */
    public void show(@androidx.annotation.Nullable String courseId, @androidx.annotation.Nullable OnCourseCreatedListener listener) {
        this.isEditMode = courseId != null;
        this.courseId = courseId;
        this.listener = listener;
        
        dialogView = LayoutInflater.from(activity).inflate(R.layout.dialog_course_editor, null);
        
        initViews();
        setupSpinners();
        setupListeners();
        
        // 如果是编辑模式，加载课程数据
        if (isEditMode) {
            // TODO: 加载课程数据
        }
        
        dialog = new AlertDialog.Builder(activity)
            .setView(dialogView)
            .setCancelable(false)
            .create();
        
        dialog.show();
    }
    
    private void initViews() {
        etCourseName = dialogView.findViewById(R.id.et_course_name);
        etTeacher = dialogView.findViewById(R.id.et_teacher);
        etCourseType = dialogView.findViewById(R.id.et_course_type);
        etCredit = dialogView.findViewById(R.id.et_credit);
        etCollege = dialogView.findViewById(R.id.et_college);
        etCampus = dialogView.findViewById(R.id.et_campus);
        etExamineMethod = dialogView.findViewById(R.id.et_examine_method);
        etAttendMethod = dialogView.findViewById(R.id.et_attend_method);
        btnSubmit = dialogView.findViewById(R.id.btn_submit);
        btnCancel = dialogView.findViewById(R.id.btn_cancel);
        progressBar = dialogView.findViewById(R.id.progress_bar);
        
        // 更新标题和按钮文本
        if (isEditMode) {
            btnSubmit.setText("提交修改");
        }
    }
    
    /**
     * 设置下拉选择器
     */
    private void setupSpinners() {
        // 课程类型
        ArrayAdapter<String> courseTypeAdapter = new ArrayAdapter<>(
            activity,
            android.R.layout.simple_dropdown_item_1line,
            CourseConfig.COURSE_TYPES
        );
        etCourseType.setAdapter(courseTypeAdapter);
        etCourseType.setThreshold(0); // 输入0个字符就显示下拉列表
        etCourseType.setOnItemClickListener((parent, view, position, id) -> {
            etCourseType.setText(CourseConfig.COURSE_TYPES.get(position), false);
            etCourseType.dismissDropDown();
        });
        etCourseType.setOnClickListener(v -> {
            if (etCourseType.getAdapter() != null) {
                etCourseType.showDropDown();
            }
        });
        
        // 学院
        ArrayAdapter<String> collegeAdapter = new ArrayAdapter<>(
            activity,
            android.R.layout.simple_dropdown_item_1line,
            CourseConfig.COLLEGE_LIST
        );
        etCollege.setAdapter(collegeAdapter);
        etCollege.setThreshold(0);
        etCollege.setOnItemClickListener((parent, view, position, id) -> {
            etCollege.setText(CourseConfig.COLLEGE_LIST.get(position), false);
            etCollege.dismissDropDown();
        });
        etCollege.setOnClickListener(v -> {
            if (etCollege.getAdapter() != null) {
                etCollege.showDropDown();
            }
        });
        
        // 校区
        ArrayAdapter<String> campusAdapter = new ArrayAdapter<>(
            activity,
            android.R.layout.simple_dropdown_item_1line,
            CourseConfig.CAMPUS_LIST
        );
        etCampus.setAdapter(campusAdapter);
        etCampus.setThreshold(0);
        etCampus.setOnItemClickListener((parent, view, position, id) -> {
            etCampus.setText(CourseConfig.CAMPUS_LIST.get(position), false);
            etCampus.dismissDropDown();
        });
        etCampus.setOnClickListener(v -> {
            if (etCampus.getAdapter() != null) {
                etCampus.showDropDown();
            }
        });
        
        // 考核方式
        ArrayAdapter<String> examineMethodAdapter = new ArrayAdapter<>(
            activity,
            android.R.layout.simple_dropdown_item_1line,
            CourseConfig.EXAMINE_METHODS
        );
        etExamineMethod.setAdapter(examineMethodAdapter);
        etExamineMethod.setThreshold(0);
        etExamineMethod.setOnItemClickListener((parent, view, position, id) -> {
            etExamineMethod.setText(CourseConfig.EXAMINE_METHODS.get(position), false);
            etExamineMethod.dismissDropDown();
        });
        etExamineMethod.setOnClickListener(v -> {
            if (etExamineMethod.getAdapter() != null) {
                etExamineMethod.showDropDown();
            }
        });
        
        // 上课方式
        ArrayAdapter<String> attendMethodAdapter = new ArrayAdapter<>(
            activity,
            android.R.layout.simple_dropdown_item_1line,
            CourseConfig.TEACH_METHODS
        );
        etAttendMethod.setAdapter(attendMethodAdapter);
        etAttendMethod.setThreshold(0);
        etAttendMethod.setOnItemClickListener((parent, view, position, id) -> {
            etAttendMethod.setText(CourseConfig.TEACH_METHODS.get(position), false);
            etAttendMethod.dismissDropDown();
        });
        etAttendMethod.setOnClickListener(v -> {
            if (etAttendMethod.getAdapter() != null) {
                etAttendMethod.showDropDown();
            }
        });
    }
    
    private void setupListeners() {
        btnSubmit.setOnClickListener(v -> submitCourse());
        btnCancel.setOnClickListener(v -> {
            // 如果在 Activity 中使用，关闭 Activity；否则关闭对话框
            if (activity instanceof androidx.appcompat.app.AppCompatActivity && dialog == null) {
                ((androidx.appcompat.app.AppCompatActivity) activity).finish();
            } else {
                dismiss();
            }
        });
    }
    
    /**
     * 提交课程
     */
    private void submitCourse() {
        String courseName = etCourseName.getText() != null ? etCourseName.getText().toString().trim() : "";
        String teacher = etTeacher.getText() != null ? etTeacher.getText().toString().trim() : "";
        String courseType = etCourseType.getText() != null ? etCourseType.getText().toString().trim() : "";
        String creditStr = etCredit.getText() != null ? etCredit.getText().toString().trim() : "";
        String college = etCollege.getText() != null ? etCollege.getText().toString().trim() : "";
        String campus = etCampus.getText() != null ? etCampus.getText().toString().trim() : "";
        String examineMethod = etExamineMethod.getText() != null ? etExamineMethod.getText().toString().trim() : "";
        String attendMethod = etAttendMethod.getText() != null ? etAttendMethod.getText().toString().trim() : "";
        
        // 验证必填字段
        if (TextUtils.isEmpty(courseName)) {
            showError("请输入课程名称");
            return;
        }
        
        // 验证学分
        double credit = 0;
        if (!TextUtils.isEmpty(creditStr)) {
            try {
                credit = Double.parseDouble(creditStr);
            } catch (NumberFormatException e) {
                showError("学分格式不正确");
                return;
            }
        }
        
        // 显示加载状态
        setLoading(true);
        
        // 构建请求数据
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("course_name", courseName);
        requestBody.put("course_type", CourseConfig.courseTypeToApi(courseType));
        requestBody.put("college", college);
        requestBody.put("campus", campus);
        requestBody.put("course_teacher", teacher);
        requestBody.put("course_method", CourseConfig.attendMethodToApi(attendMethod));
        requestBody.put("assessment_method", examineMethod);
        requestBody.put("credits", credit);
        
        // 提交课程
        if (isEditMode) {
            requestBody.put("id", Integer.parseInt(courseId));
            editCourse(requestBody);
        } else {
            createCourse(requestBody);
        }
    }
    
    /**
     * 创建课程
     */
    private void createCourse(Map<String, Object> requestBody) {
        Call<CreateCourseResponse> call = courseService.createCourse(requestBody);
        call.enqueue(new Callback<CreateCourseResponse>() {
            @Override
            public void onResponse(Call<CreateCourseResponse> call, Response<CreateCourseResponse> response) {
                setLoading(false);
                
                if (response.isSuccessful() && response.body() != null) {
                    CreateCourseResponse courseResponse = response.body();
                    if (courseResponse.isSuccess()) {
                        String createdCourseId = null;
                        if (courseResponse.getCourse_id() != null) {
                            createdCourseId = courseResponse.getCourse_id().toString();
                        }
                        
                        String courseName = requestBody.get("course_name").toString();
                        showSuccess("课程创建成功");
                        
                        // 回调
                        if (listener != null && createdCourseId != null) {
                            listener.onCourseCreated(createdCourseId, courseName);
                        }
                        
                        // 如果在 Activity 中使用，不调用 dismiss（让回调处理关闭）
                        // 如果在对话框中，关闭对话框
                        if (dialog != null && dialog.isShowing()) {
                            dismiss();
                        }
                    } else {
                        String errorMsg = ErrorHandler.getErrorMessage(response);
                        showError("创建失败：" + errorMsg);
                    }
                } else {
                    String errorMsg = ErrorHandler.getErrorMessage(response);
                    showError("创建失败：" + errorMsg);
                }
            }
            
            @Override
            public void onFailure(Call<CreateCourseResponse> call, Throwable t) {
                setLoading(false);
                String errorMsg = ErrorHandler.getErrorMessage(t);
                showError("创建失败：" + errorMsg);
                Log.e(TAG, "创建课程失败", t);
            }
        });
    }
    
    /**
     * 编辑课程
     */
    private void editCourse(Map<String, Object> requestBody) {
        Call<SimpleResponse> call = courseService.editCourse(requestBody);
        call.enqueue(new Callback<SimpleResponse>() {
            @Override
            public void onResponse(Call<SimpleResponse> call, Response<SimpleResponse> response) {
                setLoading(false);
                
                if (response.isSuccessful() && response.body() != null) {
                    SimpleResponse simpleResponse = response.body();
                    if (simpleResponse.isSuccess()) {
                        String courseName = requestBody.get("course_name").toString();
                        showSuccess("课程修改成功");
                        
                        // 回调
                        if (listener != null) {
                            listener.onCourseCreated(courseId, courseName);
                        }
                        
                        // 如果在 Activity 中使用，不调用 dismiss（让回调处理关闭）
                        // 如果在对话框中，关闭对话框
                        if (dialog != null && dialog.isShowing()) {
                            dismiss();
                        }
                    } else {
                        String errorMsg = ErrorHandler.getErrorMessage(response);
                        showError("修改失败：" + errorMsg);
                    }
                } else {
                    String errorMsg = ErrorHandler.getErrorMessage(response);
                    showError("修改失败：" + errorMsg);
                }
            }
            
            @Override
            public void onFailure(Call<SimpleResponse> call, Throwable t) {
                setLoading(false);
                String errorMsg = ErrorHandler.getErrorMessage(t);
                showError("修改失败：" + errorMsg);
                Log.e(TAG, "修改课程失败", t);
            }
        });
    }
    
    private void setLoading(boolean loading) {
        progressBar.setVisibility(loading ? View.VISIBLE : View.GONE);
        btnSubmit.setEnabled(!loading);
        btnCancel.setEnabled(!loading);
        etCourseName.setEnabled(!loading);
        etTeacher.setEnabled(!loading);
        etCourseType.setEnabled(!loading);
        etCredit.setEnabled(!loading);
        etCollege.setEnabled(!loading);
        etCampus.setEnabled(!loading);
        etExamineMethod.setEnabled(!loading);
        etAttendMethod.setEnabled(!loading);
    }
    
    private void showError(String message) {
        Toast.makeText(activity, message, Toast.LENGTH_SHORT).show();
    }
    
    private void showSuccess(String message) {
        Toast.makeText(activity, message, Toast.LENGTH_SHORT).show();
    }
    
    public void dismiss() {
        if (dialog != null && dialog.isShowing()) {
            dialog.dismiss();
        } else if (activity instanceof androidx.appcompat.app.AppCompatActivity) {
            // 如果在 Activity 中使用，关闭 Activity
            ((androidx.appcompat.app.AppCompatActivity) activity).finish();
        }
    }
    
    /**
     * 获取对话框视图（用于在 Activity 中显示）
     * @return 对话框视图
     */
    public View getDialogView() {
        return dialogView;
    }
    
    /**
     * 在 Activity 中使用（不显示对话框）
     * @param courseId 课程ID（编辑模式，null表示创建模式）
     * @param listener 创建成功的回调
     * @return 编辑器视图
     */
    public View setupForActivity(@androidx.annotation.Nullable String courseId, @androidx.annotation.Nullable OnCourseCreatedListener listener) {
        this.isEditMode = courseId != null;
        this.courseId = courseId;
        this.listener = listener;
        
        dialogView = LayoutInflater.from(activity).inflate(R.layout.dialog_course_editor, null);
        
        initViews();
        setupSpinners();
        setupListeners();
        
        // 如果是编辑模式，加载课程数据
        if (isEditMode) {
            // TODO: 加载课程数据
        }
        
        return dialogView;
    }
}

