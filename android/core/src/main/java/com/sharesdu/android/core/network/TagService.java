package com.sharesdu.android.core.network;

import com.sharesdu.android.core.network.response.GetTagListResponse;
import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Query;

/**
 * Tag 板块 API 接口
 */
public interface TagService {
    /**
     * 分页获取 tag 列表（管理员权限）
     * GET /tag/list?page_size=page_size&page_index=page_index&sort=sort
     * 
     * @param page_size 每页数量，默认20
     * @param page_index 页码，默认1
     * @param sort 排序方式，默认热度，可选按时间倒序（time）
     * @return GetTagListResponse，包含 tag_list 和 total_items
     */
    @GET("tag/list")
    Call<GetTagListResponse> getTagList(
            @Query("page_size") Integer page_size,
            @Query("page_index") Integer page_index,
            @Query("sort") String sort
    );
}

