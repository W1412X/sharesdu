import { dealAxiosError } from "@/utils/other";
import axiosInstance from "./axios";

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
        const params = { q: query, tag: tag, type: type, sort: sort, page: page, page_size: page_size };
        const response = await axiosInstance.get('/search/articles', { params });
        return response.data;
    } catch (error) {
        return dealAxiosError(error);
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
        const params = { q: query, sort: sort, page: page, page_size: page_size };
        const response = await axiosInstance.get('/search/posts', { params });
        return response.data;
    } catch (error) {
        return dealAxiosError(error);
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
        const params = { q: query, page: page, page_size: page_size };
        const response = await axiosInstance.get('/search/replies', { params });
        return response.data;
    } catch (error) {
        return dealAxiosError(error);
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
        const params = { q: query, type: type, college: college, method: method, sort: sort, page: page, page_size: page_size };
        const response = await axiosInstance.get('/search/courses', { params });
        return response.data;
    } catch (error) {
        return dealAxiosError(error);
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
        const params = { q: query, page: page, page_size: page_size };
        const response = await axiosInstance.get('/search', { params });
        return response.data;
    } catch (error) {
        return dealAxiosError(error);
    }
};
