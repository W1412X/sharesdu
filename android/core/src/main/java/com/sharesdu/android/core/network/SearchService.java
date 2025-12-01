package com.sharesdu.android.core.network;

import com.sharesdu.android.core.network.response.SearchResponse;
import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Query;

/**
 * 搜索板块 API 接口
 */
public interface SearchService {
    /**
     * 文章搜索
     * GET /search/articles?q=query&tag=tag&type=type&sort=sort&page=page&page_size=page_size
     * 
     * @param q 搜索关键词
     * @param tag 标签筛选（多个用逗号分隔）
     * @param type 文章类型（original/repost）
     * @param sort 排序方式：-publish_time/-hot_score/-likes_count
     * @param page 页码，默认1
     * @param page_size 每页数量，默认10
     * @return SearchResponse，包含 results, count, page, page_size
     */
    @GET("search/articles")
    Call<SearchResponse> searchArticles(
            @Query("q") String q,
            @Query("tag") String tag,
            @Query("type") String type,
            @Query("sort") String sort,
            @Query("page") Integer page,
            @Query("page_size") Integer page_size
    );
    
    /**
     * 帖子搜索
     * GET /search/posts?q=query&sort=sort&page=page&page_size=page_size
     * 
     * @param q 搜索关键词
     * @param sort 排序方式：-publish_time/-hot_score/-views/top
     * @param page 页码，默认1
     * @param page_size 每页数量，默认10
     * @return SearchResponse
     */
    @GET("search/posts")
    Call<SearchResponse> searchPosts(
            @Query("q") String q,
            @Query("sort") String sort,
            @Query("page") Integer page,
            @Query("page_size") Integer page_size
    );
    
    /**
     * 回复搜索
     * GET /search/replies?q=query&page=page&page_size=page_size
     * 
     * @param q 搜索关键词
     * @param page 页码，默认1
     * @param page_size 每页数量，默认10
     * @return SearchResponse
     */
    @GET("search/replies")
    Call<SearchResponse> searchReplies(
            @Query("q") String q,
            @Query("page") Integer page,
            @Query("page_size") Integer page_size
    );
    
    /**
     * 课程搜索
     * GET /search/courses?q=query&college=college&type=type&sort=sort&page=page&page_size=page_size
     * 
     * @param q 搜索关键词
     * @param college 学院筛选
     * @param type 课程类型筛选
     * @param sort 排序方式
     * @param page 页码，默认1
     * @param page_size 每页数量，默认10
     * @return SearchResponse
     */
    @GET("search/courses")
    Call<SearchResponse> searchCourses(
            @Query("q") String q,
            @Query("college") String college,
            @Query("type") String type,
            @Query("sort") String sort,
            @Query("page") Integer page,
            @Query("page_size") Integer page_size
    );
    
    /**
     * 全局搜索
     * GET /search/global?q=query&types=types&page=page&page_size=page_size
     * 
     * @param q 搜索关键词
     * @param types 内容类型筛选（article,post,reply,course，逗号分隔）
     * @param page 页码，默认1
     * @param page_size 每页数量，默认10
     * @return SearchResponse
     */
    @GET("search/global")
    Call<SearchResponse> globalSearch(
            @Query("q") String q,
            @Query("types") String types,
            @Query("page") Integer page,
            @Query("page_size") Integer page_size
    );
}

