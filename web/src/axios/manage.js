
import { dealAxiosError } from "@/utils/other";
import axiosInstance from "./axios";

/**
 * 获取用户列表
 * @returns 
 */
export const getUserList = async (page_index=1,page_size=20) => {
    try {
        const response = await axiosInstance.get('/user/list',{ params: { page_index: page_index, page_size: page_size } });
        return response.data;
    } catch (error) {
        return dealAxiosError(error);
    }
};


/**
 * 封禁用户
 * @param {*} userId 要封禁的用户ID
 * @param {*} days 封禁天数
 * @returns 
 */
export const blockUser = async (userId, days) => {
    try {
        const response = await axiosInstance.post('/admin/block/user', { user_id: userId, days: days });
        return response.data;
    } catch (error) {
        return dealAxiosError(error);
    }
};

/**
 * 解禁用户
 * @param {*} userId 要解禁的用户ID
 * @returns 
 */
export const unblockUser = async (userId) => {
    try {
        const response = await axiosInstance.post('/admin/unblock/user', { user_id: userId });
        return response.data;
    } catch (error) {
        return dealAxiosError(error);
    }
};


/**
 * 屏蔽文章
 * @param {*} articleId 操作的文章ID
 * @param {*} reason 屏蔽原因
 * @returns 
 */
export const blockArticle = async (articleId, reason) => {
    try {
        const response = await axiosInstance.post('/admin/block/article', { article_id: articleId, reason: reason });
        return response.data;
    } catch (error) {
        return dealAxiosError(error);
    }
};

/**
 * 解除屏蔽文章
 * @param {*} articleId 操作的文章ID
 * @param {*} reason 解除屏蔽原因
 * @returns 
 */
export const unblockArticle = async (articleId, reason) => {
    try {
        const response = await axiosInstance.post('/admin/unblock/article', { article_id: articleId, reason: reason });
        return response.data;
    } catch (error) {
        return dealAxiosError(error);
    }
};


/**
 * 获取封禁用户列表
 * @param {*} pageIndex 页码
 * @param {*} pageSize 每页数量
 * @returns 
 */
export const getBlockedUserList = async (pageIndex = 1, pageSize = 20) => {
    try {
        const response = await axiosInstance.get('/admin/blocked-users', { params: { page_index: pageIndex, page_size: pageSize } });
        return response.data;
    } catch (error) {
        return dealAxiosError(error);
    }
};
