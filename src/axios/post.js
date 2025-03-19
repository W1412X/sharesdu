import { dealAxiosError } from "@/utils/other";
import { getaxiosInstance } from "./axios";
import { getResponseFromCache, saveResponseToCache } from "@/utils/session";

/**
 * 
 * @param {String} articleId 
 * @param {String} postTitle 
 * @param {String} postContent 
 * @returns 
 */
export const createPostInArticle = async (articleId, postTitle, postContent) => {
    try {
        console.log('Request Type: POST');
        console.log('Request URL: /post/article_post');
        const response = await getaxiosInstance().post('/post/article_post', { 
            article_id: articleId,
            post_title: postTitle,
            post_content: postContent 
        });
        return response.data;
    } catch (error) {
        console.error('Error creating post in article:', error);
        let dealResult = await dealAxiosError(error);
        if(dealResult.status == 1412){
            return await createPostInArticle(articleId, postTitle, postContent);
        }
        return dealResult;
    }
};
/**
 * @param {String} articleId
 * @param {String} postTitle 
 * @param {String} postContent 
 * @returns 
 */
export const createPostInCourse = async (courseId,postTitle, postContent) => {
    try {
        console.log('Request Type: POST');
        console.log('Request URL: /post/course_post');
        const response = await getaxiosInstance().post('/post/course_post', { 
            course_id:courseId,
            post_title: postTitle,
            post_content: postContent 
        });
        return response.data;
    } catch (error) {
        console.error('Error creating post in course:', error);
        let dealResult = await dealAxiosError(error);
        if(dealResult.status == 1412){
            return await createPostInCourse(postTitle, postContent);
        }
        return dealResult;
    }
};
/**
 * 
 * @param {String} postId 
 * @returns 
 */
export const getPostDetailById = async (postId) => {
    try {
        console.log('Request Type: GET');
        console.log(`Request URL: /post/detail?post_id=${postId}`);
        let cacheResponse=getResponseFromCache(`/post/detail?post_id=${postId}`);
        if(cacheResponse){
            return cacheResponse.data;
        }
        const response = await getaxiosInstance().get('/post/detail', { params: { post_id: postId } });
        saveResponseToCache(`/post/detail?post_id=${postId}`,response);
        return response.data;
    } catch (error) {
        console.error('Error getting post detail by ID:', error);
        let dealResult = await dealAxiosError(error);
        if(dealResult.status == 1412){
            return await getPostDetailById(postId);
        }
        return dealResult;
    }
};
/**
 * 
 * @param {String} postId 
 * @param {int} pageIndex 
 * @param {int} pageSize 
 * @returns 
 */
export const getReplyListByPostId = async (postId, pageIndex = 1, pageSize = 20) => {
    try {
        console.log('Request Type: GET');
        console.log(`Request URL: /post/reply_list?post_id=${postId}&page_index=${pageIndex}&page_size=${pageSize}`);
        let cacheResponse=getResponseFromCache(`/post/reply_list?post_id=${postId}&page_index=${pageIndex}&page_size=${pageSize}`);
        if(cacheResponse){
            return cacheResponse.data;
        }
        const response = await getaxiosInstance().get('/post/reply_list', { params: { post_id: postId, page_index: pageIndex, page_size: pageSize } });
        saveResponseToCache(`/post/reply_list?post_id=${postId}&page_index=${pageIndex}&page_size=${pageSize}`,response);
        return response.data;
    } catch (error) {
        console.error('Error getting reply list by post ID:', error);
        let dealResult = await dealAxiosError(error);
        if(dealResult.status == 1412){
            return await getReplyListByPostId(postId, pageIndex, pageSize);
        }
        return dealResult;
    }
};
/**
 * 
 * @param {string} postId 
 * @returns 
 */
export const deletePostById = async (postId) => {
    try {
        console.log('Request Type: POST');
        console.log('Request URL: /post/delete');
        const response = await getaxiosInstance().post('/post/delete', { post_id: postId });
        return response.data;
    } catch (error) {
        console.error('Error deleting post by ID:', error);
        let dealResult = await dealAxiosError(error);
        if(dealResult.status == 1412){
            return await deletePostById(postId);
        }
        return dealResult;
    }
};
/**
 * 
 * @param {String} postId 
 * @param {String} replyContent 
 * @param {String} parentReplyId 
 * @returns 
 */
export const createReplyUnderPost = async (postId, replyContent, parentReplyId = null) => {
    try {
        console.log('Request Type: POST');
        console.log('Request URL: /reply/create');
        let response=null;
        if(parentReplyId){
            response = await getaxiosInstance().post('/reply/create', { 
                post_id: postId,
                reply_content: replyContent,
                parent_reply_id: parentReplyId 
            });
        }else{
            response = await getaxiosInstance().post('/reply/create', { 
                post_id: postId,
                reply_content: replyContent
            });
        }
        return response.data;
    } catch (error) {
        console.error('Error creating reply under post:', error);
        let dealResult = await dealAxiosError(error);
        if(dealResult.status == 1412){
            return await createReplyUnderPost(postId, replyContent, parentReplyId);
        }
        return dealResult;
    }
};
/**
 * 
 * @param {String} replyId 
 * @returns 
 */
export const deleteReplyById = async (replyId) => {
    try {
        console.log('Request Type: POST');
        console.log('Request URL: /reply/delete');
        const response = await getaxiosInstance().post('/reply/delete', { reply_id: replyId });
        return response.data;
    } catch (error) {
        console.error('Error deleting reply by ID:', error);
        let dealResult = await dealAxiosError(error);
        if(dealResult.status == 1412){
            return await deleteReplyById(replyId);
        }
        return dealResult;
    }
};
/**
 * 
 * @param {String} replyId 
 * @returns 
 */
export const getReplyDetailById = async (replyId) => {
    try {
        console.log('Request Type: GET');
        console.log(`Request URL: /reply/detail?reply_id=${replyId}`);
        let cacheResponse = getResponseFromCache(`/reply/detail?reply_id=${replyId}`);
        if(cacheResponse){
            return cacheResponse.data;
        }
        const response = await getaxiosInstance().get('/reply/detail', { params: { reply_id: replyId } });
        saveResponseToCache(`/reply/detail?reply_id=${replyId}`,response);
        return response.data;
    } catch (error) {
        console.error('Error getting reply detail by ID:', error);
        let dealResult = await dealAxiosError(error);
        if(dealResult.status == 1412){
            return await getReplyDetailById(replyId);
        }
        return dealResult;
    }
};