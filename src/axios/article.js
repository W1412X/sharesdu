/*
 * 本文件提供所有有关文章操作的接口请求
 * 要求输入的参数为对象，且对象中包含所有请求参数
 * 返回响应信息原文
 * 由各自的页面处理后续逻辑  
 * 对于请求的异常，本模块会统一处理，返回状态码-1  
 * 在请求函数中将异常转换为状态码-1(表明为网络问题/未知错误)
 * 同时在控制台输出错误信息  
 */
import axiosInstance from "./axios.js";
import { getNetworkErrorResponse } from "./statusCodeMessages.js";

// 创建文章函数
export const createArticle = async (data) => {
    try {
        console.log('Request Type: POST');
        console.log('Request URL: /index/article/create');
        console.log('Request Data:', data);
        const response = await axiosInstance.post('/index/article/create', data);
        return response.data;
    } catch (error) {
        console.error('Error creating article:', error);
        return getNetworkErrorResponse();
    }
};

// 编辑文章函数
export const editArticle = async (data) => {
    try {
        console.log('Request Type: POST');
        console.log('Request URL: /index/article/edit');
        console.log('Request Data:', data);
        const response = await axiosInstance.post('/index/article/edit', data);
        return response.data;
    } catch (error) {
        console.error('Error editing article:', error);
        return getNetworkErrorResponse();
    }
};


// 删除文章函数
export const deleteArticle = async (data) => {
    try {
        console.log('Request Type: POST');
        console.log('Request URL: /index/article/delete');
        console.log('Request Data:', data);
        const response = await axiosInstance.post('/index/article/delete', data);
        return response.data;
    } catch (error) {
        console.error('Error deleting article:', error);
        return getNetworkErrorResponse();
    }
};

// 获取文章详细信息函数
export const getArticleDetail = async (id) => {
    try {
        console.log('Request Type: GET');
        console.log('Request URL: /index/article/detail?id=' + id);
        const response = await axiosInstance.get('/index/article/detail', { params: { id } });
        return response.data;
    } catch (error) {
        console.error('Error getting article detail:', error);
        return getNetworkErrorResponse();
    }
};

// 获取文章下的Post列表函数
export const getPostListByArticleId = async (id, pageIndex = 1, pageSize = 20) => {
    try {
        console.log('Request Type: GET');
        console.log('Request URL: /index/article/post_list?id=' + id + '&page_index=' + pageIndex + '&page_size=' + pageSize);
        const response = await axiosInstance.get('/index/article/post_list', { params: { id, page_index: pageIndex, page_size: pageSize } });
        return response.data;
    } catch (error) {
        console.error('Error getting post list by article ID:', error);
        return getNetworkErrorResponse();
    }
};

// 获取文章列表函数
export const getArticleList = async (pageIndex = 1, pageSize = 20) => {
    try {
        console.log('Request Type: GET');
        console.log('Request URL: /index/article/list?page_index=' + pageIndex + '&page_size=' + pageSize);
        const response = await axiosInstance.get('/index/article/list', { params: { page_index: pageIndex, page_size: pageSize } });
        return response.data;
    } catch (error) {
        console.error('Error getting article list:', error);
        return getNetworkErrorResponse();
    }
};

