package com.sharesdu.android.common.adapter;

import android.content.Context;
import android.content.Intent;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.sharesdu.android.data.model.Article;
import com.sharesdu.android.data.model.Course;
import com.sharesdu.android.data.model.Post;
import com.sharesdu.android.common.view.ArticleItemView;
import com.sharesdu.android.common.view.CourseItemView;
import com.sharesdu.android.common.view.PostItemView;
import java.util.List;

/**
 * 首页列表适配器
 * 支持文章/帖子/课程三种类型
 */
public class IndexListAdapter extends RecyclerView.Adapter<RecyclerView.ViewHolder> {
    private Context context;
    private int itemType; // 0-文章, 1-帖子, 2-课程
    private List<?> dataList;
    
    public IndexListAdapter(Context context, int itemType, List<?> dataList) {
        this.context = context;
        this.itemType = itemType;
        this.dataList = dataList;
    }
    
    public void setItemType(int itemType) {
        if (this.itemType != itemType) {
            this.itemType = itemType;
            // 当itemType改变时，需要通知RecyclerView所有item的viewType都改变了
            // 这会强制RecyclerView重新创建所有ViewHolder
            notifyDataSetChanged();
        }
    }
    
    public void updateData(List<?> dataList) {
        this.dataList = dataList;
        notifyDataSetChanged();
    }
    
    /**
     * 同时更新itemType和数据
     * 用于切换tab时确保数据正确显示
     */
    public void updateItemTypeAndData(int itemType, List<?> dataList) {
        boolean typeChanged = this.itemType != itemType;
        this.itemType = itemType;
        this.dataList = dataList;
        // 当类型改变时，必须调用notifyDataSetChanged()来强制RecyclerView重新创建所有ViewHolder
        notifyDataSetChanged();
    }
    
    @NonNull
    @Override
    public RecyclerView.ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        // 使用viewType而不是itemType，确保RecyclerView能正确创建对应的ViewHolder
        RecyclerView.ViewHolder holder;
        // 设置外边距，保持与原有布局一致
        int margin = (int) (2 * context.getResources().getDisplayMetrics().density);
        int marginVertical = (int) (1 * context.getResources().getDisplayMetrics().density);
        
        switch (viewType) {
            case 0: // 文章
                ArticleItemView articleView = new ArticleItemView(context);
                RecyclerView.LayoutParams articleParams = new RecyclerView.LayoutParams(
                    RecyclerView.LayoutParams.MATCH_PARENT,
                    RecyclerView.LayoutParams.WRAP_CONTENT
                );
                articleParams.setMargins(margin, marginVertical, margin, marginVertical);
                articleView.setLayoutParams(articleParams);
                holder = new ArticleViewHolder(articleView);
                break;
            case 1: // 帖子
                PostItemView postView = new PostItemView(context);
                RecyclerView.LayoutParams postParams = new RecyclerView.LayoutParams(
                    RecyclerView.LayoutParams.MATCH_PARENT,
                    RecyclerView.LayoutParams.WRAP_CONTENT
                );
                postParams.setMargins(margin, marginVertical, margin, marginVertical);
                postView.setLayoutParams(postParams);
                holder = new PostViewHolder(postView, context);
                break;
            case 2: // 课程
                CourseItemView courseView = new CourseItemView(context);
                RecyclerView.LayoutParams courseParams = new RecyclerView.LayoutParams(
                    RecyclerView.LayoutParams.MATCH_PARENT,
                    RecyclerView.LayoutParams.WRAP_CONTENT
                );
                courseParams.setMargins(margin, marginVertical, margin, marginVertical);
                courseView.setLayoutParams(courseParams);
                holder = new CourseViewHolder(courseView, context);
                break;
            default:
                ArticleItemView defaultView = new ArticleItemView(context);
                RecyclerView.LayoutParams defaultParams = new RecyclerView.LayoutParams(
                    RecyclerView.LayoutParams.MATCH_PARENT,
                    RecyclerView.LayoutParams.WRAP_CONTENT
                );
                defaultParams.setMargins(margin, marginVertical, margin, marginVertical);
                defaultView.setLayoutParams(defaultParams);
                holder = new ArticleViewHolder(defaultView);
                break;
        }
        return holder;
    }
    
    @Override
    public void onBindViewHolder(@NonNull RecyclerView.ViewHolder holder, int position) {
        if (dataList == null || position >= dataList.size()) {
            return;
        }
        
        Object item = dataList.get(position);
        
        // 根据holder的实际类型来绑定数据，而不是根据itemType
        // 这样可以避免类型不匹配的问题
        if (holder instanceof ArticleViewHolder && item instanceof Article) {
            ((ArticleViewHolder) holder).bind((Article) item);
        } else if (holder instanceof PostViewHolder && item instanceof Post) {
            ((PostViewHolder) holder).bind((Post) item);
        } else if (holder instanceof CourseViewHolder && item instanceof Course) {
            ((CourseViewHolder) holder).bind((Course) item);
        } else {
            // 类型不匹配，记录错误但不崩溃
            android.util.Log.e("IndexListAdapter", 
                "Type mismatch: holder=" + holder.getClass().getSimpleName() + 
                ", item=" + (item != null ? item.getClass().getSimpleName() : "null") +
                ", itemType=" + itemType);
        }
    }
    
    @Override
    public int getItemCount() {
        return dataList != null ? dataList.size() : 0;
    }
    
    @Override
    public int getItemViewType(int position) {
        // 返回当前itemType作为viewType，确保RecyclerView能正确识别ViewHolder类型
        return itemType;
    }
    
    // 文章 ViewHolder
    static class ArticleViewHolder extends RecyclerView.ViewHolder {
        ArticleItemView articleItemView;
        
        ArticleViewHolder(ArticleItemView itemView) {
            super(itemView);
            this.articleItemView = itemView;
        }
        
        void bind(Article article) {
            if (articleItemView != null) {
                articleItemView.bind(article);
            }
        }
    }
    
    // 帖子 ViewHolder
    class PostViewHolder extends RecyclerView.ViewHolder {
        PostItemView postItemView;
        Context viewHolderContext;
        
        PostViewHolder(PostItemView itemView, Context context) {
            super(itemView);
            this.postItemView = itemView;
            this.viewHolderContext = context;
        }
        
        void bind(Post post) {
            if (postItemView != null) {
                postItemView.bind(post);
                // 设置点击监听，跳转到帖子详情页
                postItemView.setOnPostClickListener(postItem -> {
                    if (postItem != null && postItem.getId() != null) {
                        // 使用 Intent 启动 Activity，避免直接依赖 feature 模块
                        Intent intent = new Intent();
                        intent.setClassName(viewHolderContext, "com.sharesdu.android.feature.index.PostDetailActivity");
                        intent.putExtra("post_id", postItem.getId());
                        viewHolderContext.startActivity(intent);
                    }
                });
            }
        }
    }
    
    // 课程 ViewHolder
    class CourseViewHolder extends RecyclerView.ViewHolder {
        CourseItemView courseItemView;
        Context viewHolderContext;
        
        CourseViewHolder(CourseItemView itemView, Context context) {
            super(itemView);
            this.courseItemView = itemView;
            this.viewHolderContext = context;
        }

        void bind(Course course) {
            if (courseItemView != null) {
                courseItemView.bind(course);
                // 设置点击监听，跳转到课程详情页
                courseItemView.setOnCourseClickListener(courseItem -> {
                    if (courseItem != null && courseItem.getId() != null) {
                        // 使用 Intent 启动 Activity，避免直接依赖 feature 模块
                        Intent intent = new Intent();
                        intent.setClassName(viewHolderContext, "com.sharesdu.android.feature.index.CourseDetailActivity");
                        intent.putExtra("course_id", courseItem.getId());
                        android.util.Log.d("IndexListAdapter", "准备跳转到课程详情页，course_id: " + courseItem.getId());
                        try {
                            viewHolderContext.startActivity(intent);
                            android.util.Log.d("IndexListAdapter", "成功启动 CourseDetailActivity");
                        } catch (Exception e) {
                            android.util.Log.e("IndexListAdapter", "启动 CourseDetailActivity 失败", e);
                            android.widget.Toast.makeText(viewHolderContext, "无法打开课程详情页", android.widget.Toast.LENGTH_SHORT).show();
                        }
                    } else {
                        android.util.Log.w("IndexListAdapter", "课程ID为空，无法跳转");
                    }
                });
            }
        }
    }
}

