package com.sharesdu.android.core.network;

import com.sharesdu.android.core.network.response.ArticleDetailResponse;
import com.sharesdu.android.core.network.response.ArticleListResponse;
import com.sharesdu.android.core.network.response.ArticlePostListResponse;
import com.sharesdu.android.core.network.response.CreateArticleResponse;
import com.sharesdu.android.core.network.response.SimpleResponse;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Query;
import java.util.Map;

/**
 * 文章板块 API 接口
 */
public interface ArticleService {
    /**
     * 创建文章
     * POST /article/create
     * 
     * @param requestBody 文章信息
     *                    {
     *                      "article_title": "文章标题",
     *                      "content": "文章内容",
     *                      "tags": "标签1,标签2（逗号分隔）",
     *                      "article_type": "original/repost",
     *                      "origin_link": "原文链接（转载时）",
     *                      "resource_link": "资源链接",
     *                      "cover_link": "封面链接",
     *                      "article_summary": "文章简介"
     *                    }
     * @return CreateArticleResponse，成功时包含 article_id
     */
    @POST("article/create")
    Call<CreateArticleResponse> createArticle(@Body Map<String, String> requestBody);
    
    /**
     * 编辑文章
     * POST /article/edit
     * 
     * @param requestBody 文章信息（article_id 必填）
     *                    {
     *                      "article_id": 文章ID,
     *                      "article_title": "文章标题",
     *                      "content": "文章内容",
     *                      "tags": "标签1,标签2",
     *                      "article_type": "original/repost",
     *                      "origin_link": "原文链接",
     *                      "cover_link": "封面链接",
     *                      "article_summary": "文章简介"
     *                    }
     * @return SimpleResponse
     */
    @POST("article/edit")
    Call<SimpleResponse> editArticle(@Body Map<String, Object> requestBody);
    
    /**
     * 删除文章
     * POST /article/delete
     * 
     * @param requestBody 包含 article_id
     *                    {"article_id": 文章ID}
     * @return SimpleResponse
     */
    @POST("article/delete")
    Call<SimpleResponse> deleteArticle(@Body Map<String, Integer> requestBody);
    
    /**
     * 获取文章详细信息
     * GET /article/detail?article_id=article_id
     * 
     * @param article_id 文章ID
     * @return ArticleDetailResponse，包含 article_detail
     */
    @GET("article/detail")
    Call<ArticleDetailResponse> getArticleDetail(@Query("article_id") Integer article_id);
    
    /**
     * 获取文章下的Post列表
     * GET /article/post_list?article_id=article_id&page_index=page_index&page_size=page_size
     * 
     * @param article_id 文章ID
     * @param page_index 页码，默认为1
     * @param page_size 每页数量，默认为20
     * @return ArticlePostListResponse，包含 post_list
     */
    @GET("article/post_list")
    Call<ArticlePostListResponse> getPostListByArticleId(
            @Query("article_id") Integer article_id,
            @Query("page_index") Integer page_index,
            @Query("page_size") Integer page_size
    );
    
    /**
     * 分页获取文章列表
     * GET /article/list?page_index=1&page_size=20&tags=1,2&sort=time
     * 响应格式：status + message + article_list/total_pages/current_page在根级别（不在data中）
     * 
     * @param page_index 页码，默认1
     * @param page_size 每页数量，默认20
     * @param tags 逗号分隔的标签ID
     * @param sort 排序方式：time/star/view/hot
     * @return ArticleListResponse，包含 article_list, total_pages, current_page
     */
    @GET("article/list")
    Call<ArticleListResponse> getArticleList(
            @Query("page_index") Integer page_index,
            @Query("page_size") Integer page_size,
            @Query("tags") String tags,
            @Query("sort") String sort
    );
}

