package com.sharesdu.android.common.view;

import android.content.Context;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.TextView;
import androidx.annotation.Nullable;
import androidx.cardview.widget.CardView;
import com.sharesdu.android.common.R;
import com.sharesdu.android.data.model.Article;

/**
 * 文章列表项组件
 * 独立的组件类，方便扩展
 */
public class ArticleItemView extends CardView {
    private ImageCardView imageCard;
    private TextView tvTitle;
    private TextView tvSummary;
    private TextView tvAuthor;
    private TextView tvStats;
    
    public ArticleItemView(Context context) {
        super(context);
        init();
    }
    
    public ArticleItemView(Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
        init();
    }
    
    public ArticleItemView(Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init();
    }
    
    private void init() {
        // 设置CardView样式属性，保持与原有布局一致
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
            setCardBackgroundColor(getContext().getColor(R.color.background_primary));
        } else {
            setCardBackgroundColor(getResources().getColor(R.color.background_primary));
        }
        setCardElevation(2f);
        setRadius(2f * getResources().getDisplayMetrics().density);
        
        // 设置外边距（在添加到父容器时，父容器会设置LayoutParams，这里只设置margin）
        // 注意：margin需要在父容器设置LayoutParams后通过getLayoutParams()获取并设置
        
        // 加载内容布局
        LayoutInflater.from(getContext()).inflate(R.layout.view_article_item, this, true);
        
        imageCard = findViewById(R.id.iv_cover);
        tvTitle = findViewById(R.id.tv_title);
        tvSummary = findViewById(R.id.tv_summary);
        tvAuthor = findViewById(R.id.tv_author);
        tvStats = findViewById(R.id.tv_stats);
        
        // 文章封面图片不可点击放大
        if (imageCard != null) {
            imageCard.setClickable(false);
            imageCard.setImageSize(100, 100);
        }
    }
    
    /**
     * 绑定文章数据
     * @param article 文章对象
     */
    public void bind(Article article) {
        if (article == null) {
            return;
        }
        
        if (tvTitle != null) {
            tvTitle.setText(article.getTitle() != null ? article.getTitle() : "");
        }
        
        if (tvSummary != null) {
            tvSummary.setText(article.getSummary() != null ? article.getSummary() : "");
        }
        
        if (tvAuthor != null) {
            tvAuthor.setText(article.getAuthorName() != null ? "@" + article.getAuthorName() : "");
        }
        
        if (tvStats != null) {
            StringBuilder stats = new StringBuilder();
            if (article.getViewNum() != null) {
                stats.append("浏览 ").append(article.getViewNum());
            }
            if (article.getStarNum() != null) {
                if (stats.length() > 0) {
                    stats.append(" · ");
                }
                stats.append("收藏 ").append(article.getStarNum());
            }
            if (article.getReplyNum() != null) {
                if (stats.length() > 0) {
                    stats.append(" · ");
                }
                stats.append("回复 ").append(article.getReplyNum());
            }
            tvStats.setText(stats.toString());
        }
        
        // 加载封面图片
        if (imageCard != null) {
            String coverLink = article.getCoverLink();
            imageCard.setImageUrl(coverLink != null ? coverLink : "");
        }
    }
}

