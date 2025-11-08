import { dealAxiosError } from "@/utils/other";
import { waitForLock } from "@/utils/lock";
import axiosInstance from "../request";

/**
 * 文章搜索
 * 
 * @param {String} query 搜索关键词
 * @param {String} tag 标签筛选
 * @param {String} type 文章类型筛选 ('original' 或 'repost')
 * @param {String} sort 排序方式
 * @param {Number} page 页码
 * @param {Number} page_size 每页数量
 * @returns
 */
export const searchArticles = async (query, tag, type, sort, page = 1, page_size = 10) => {
    try {
        await waitForLock('token');
        const params = { q: query, tag: tag, type: type, sort: sort, page: page, page_size: page_size };
        const response = await axiosInstance.get('/search/articles', { params });
        return response.data;
    } catch (error) {
        let dealResult = await dealAxiosError(error);
        if (dealResult.status == 1412) {
            return await searchArticles(query, tag, type, sort, page, page_size);
        }
        return dealResult;
    }
};

/**
 * 帖子搜索
 * 
 * @param {String} query 搜索关键词
 * @param {String} sort 排序方式
 * @param {Number} page 页码
 * @param {Number} page_size 每页数量
 * @returns
 */
export const searchPosts = async (query, sort, page = 1, page_size = 10) => {
    try {
        await waitForLock('token');
        const params = { q: query, sort: sort, page: page, page_size: page_size };
        const response = await axiosInstance.get('/search/posts', { params });
        return response.data;
    } catch (error) {
        let dealResult = await dealAxiosError(error);
        if (dealResult.status == 1412) {
            return await searchPosts(query, sort, page, page_size);
        }
        return dealResult;
    }
};

/**
 * 回复搜索
 * 
 * @param {String} query 搜索关键词
 * @param {Number} page 页码
 * @param {Number} page_size 每页数量
 * @returns
 */
export const searchReplies = async (query, page = 1, page_size = 10) => {
    try {
        await waitForLock('token');
        const params = { q: query, page: page, page_size: page_size };
        const response = await axiosInstance.get('/search/replies', { params });
        return response.data;
    } catch (error) {
        let dealResult = await dealAxiosError(error);
        if (dealResult.status == 1412) {
            return await searchReplies(query, page, page_size);
        }
        return dealResult;
    }
};

/**
 * 课程搜索
 * 
 * @param {String} query 搜索关键词
 * @param {String} type 课程类型筛选 ('compulsory', 'elective', 'restricted_elective')
 * @param {String} college 学院筛选
 * @param {String} method 教学方式筛选 ('online', 'offline', 'hybrid')
 * @param {String} sort 排序方式
 * @param {Number} page 页码
 * @param {Number} page_size 每页数量
 * @returns
 */
export const searchCourses = async (query, type, college, method, sort, page = 1, page_size = 10) => {
    try {
        await waitForLock('token');
        const params = { q: query, type: type, college: college, method: method, sort: sort, page: page, page_size: page_size };
        const response = await axiosInstance.get('/search/courses', { params });
        return response.data;
    } catch (error) {
        let dealResult = await dealAxiosError(error);
        if (dealResult.status == 1412) {
            return await searchCourses(query, type, college, method, sort, page, page_size);
        }
        return dealResult;
    }
};

/**
 * 全局搜索
 * 
 * @param {String} query 搜索关键词
 * @param {Number} page 页码
 * @param {Number} page_size 每页数量
 * @returns
 */
export const globalSearch = async (query, page = 1, page_size = 10) => {
    try {
        await waitForLock('token');
        const params = { q: query, page: page, page_size: page_size };
        const response = await axiosInstance.get('/search', { params });
        return response.data;
    } catch (error) {
        let dealResult = await dealAxiosError(error);
        if (dealResult.status == 1412) {
            return await globalSearch(query, page, page_size);
        }
        return dealResult;
    }
};
