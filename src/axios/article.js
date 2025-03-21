/*
 * 本文件提供所有有关文章操作的接口请求
 * 要求输入的参数为对象，且对象中包含所有请求参数
 * 返回响应信息原文
 * 由各自的页面处理后续逻辑  
 * 对于请求的异常，本模块会统一处理，返回状态码-1  
 * 在请求函数中将异常转换为状态码-1(表明为网络问题/未知错误)
 * 同时在控制台输出错误信息  
 */
import { dealAxiosError } from "@/utils/other.js";
import {getaxiosInstance} from "./axios.js";
import { getResponseFromCache, saveResponseToCache } from "@/utils/session.js";
import { waitForLock } from "@/utils/lock.js";

// 创建文章函数
export const createArticle = async (data) => {
    try {
        await waitForLock('token');
        console.log('Request Type: POST');
        console.log('Request URL: /article/create');
        console.log('Request Data:', data);
        const response = await getaxiosInstance().post('/article/create', data);
        return response.data;
    } catch (error) {
        console.error('Error creating article:', error);
        let dealResult=await dealAxiosError(error);
        //which means the error caused by the token and have refreshed it
        if(dealResult.status==1412){
          return await createArticle(data);
        }
        return dealResult;
    }
};

// 编辑文章函数
export const editArticle = async (data) => {
    try {
        await waitForLock('token');
        console.log('Request Type: POST');
        console.log('Request URL: /article/edit');
        console.log('Request Data:', data);
        const response = await getaxiosInstance().post('/article/edit', data);
        return response.data;
    } catch (error) {
        console.error('Error editing article:', error);
        let dealResult=await dealAxiosError(error);
        //which means the error caused by the token and have refreshed it
        if(dealResult.status==1412){
          return await editArticle(data);
        }
        return dealResult;
    }
};


// 删除文章函数
export const deleteArticle = async (articleId) => {
    try {
        await waitForLock('token');
        console.log('Request Type: POST');
        console.log('Request URL: /article/delete');
        console.log('Request Data:', {
            article_id: articleId,
        });
        const response = await getaxiosInstance().post('/article/delete', {article_id: articleId});
        return response.data;
    } catch (error) {
        console.error('Error deleting article:', error);
        let dealResult=await dealAxiosError(error);
        //which means the error caused by the token and have refreshed it
        if(dealResult.status==1412){
          return await deleteArticle(articleId);
        }
        return dealResult;
    }
};

// 获取文章详细信息函数
export const getArticleDetail = async (id) => {
    try {
        await waitForLock('token');
        console.log('Request Type: GET');
        console.log('Request URL: /article/detail?id=' + id);
        let cacheResponse=getResponseFromCache('/article/detail?id=' + id);
        if(cacheResponse){
            return cacheResponse.data;
        }
        const response = await getaxiosInstance().get('/article/detail', { params: { article_id:id } });
        saveResponseToCache('/article/detail?id=' + id,response);
        console.log('Response Data:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting article detail:', error);
        let dealResult=await dealAxiosError(error);
        //which means the error caused by the token and have refreshed it
        if(dealResult.status==1412){
          return await getArticleDetail(id);
        }
        return dealResult;
    }
};

// 获取文章下的Post列表函数
export const getPostListByArticleId = async (id, pageIndex = 1, pageSize = 20) => {
    try {
        await waitForLock('token');
        console.log('Request Type: GET');
        console.log('Request URL: /article/post_list?id=' + id + '&page_index=' + pageIndex + '&page_size=' + pageSize);
        let cacheResponse=getResponseFromCache('/article/post_list?id=' + id + '&page_index=' + pageIndex + '&page_size=' + pageSize);
        if(cacheResponse){
            return cacheResponse.data;
        }
        const response = await getaxiosInstance().get('/article/post_list', { params: { article_id:id, page_index: pageIndex, page_size: pageSize } });
        saveResponseToCache('/article/post_list?id=' + id + '&page_index=' + pageIndex + '&page_size=' + pageSize,response);
        return response.data;
    } catch (error) {
        console.error('Error getting post list by article ID:', error);
        let dealResult=await dealAxiosError(error);
        //which means the error caused by the token and have refreshed it
        if(dealResult.status==1412){
          return await getPostListByArticleId(id,pageIndex,pageSize);
        }
        return dealResult;
    }
};

// 获取文章列表函数
export const getArticleList = async (sort='time',tags=null,pageIndex = 1, pageSize = 20) => {
    try {
        await waitForLock('token');
        console.log('Request Type: GET');
        console.log('Request URL: /article/list?page_index=' + pageIndex + '&page_size=' + pageSize);
        let cacheResponse=getResponseFromCache('/article/list?page_index=' + pageIndex + '&page_size=' + pageSize);
        if(cacheResponse){
            return cacheResponse.data;
        }
        const response = await getaxiosInstance().get('/article/list', { params: { page_index: pageIndex, page_size: pageSize,tags:tags,sort:sort } });
        saveResponseToCache('/article/list?page_index=' + pageIndex + '&page_size=' + pageSize,response);
        return response.data;
    } catch (error) {
        console.error('Error getting article list:', error);
        let dealResult=await dealAxiosError(error);
        //which means the error caused by the token and have refreshed it
        if(dealResult.status==1412){
          return await getArticleList(pageIndex,pageSize);
        }
        return dealResult;
    }
};

