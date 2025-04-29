import { dealAxiosError } from "@/utils/other";
import { getaxiosInstance } from "./axios";
import { waitForLock } from "@/utils/lock";

/**
 * 
 * @param {String} articleId 
 * @param {String} postTitle 
 * @param {String} postContent 
 * @returns 
 */
export const createPostInArticle = async (articleId, postTitle, postContent) => {
    try {
        await waitForLock('token');
        const response = await getaxiosInstance().post('/post/article_post', { 
            article_id: articleId,
            post_title: postTitle,
            post_content: postContent 
        });
        return response.data;
    } catch (error) {
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
        await waitForLock('token');
        const response = await getaxiosInstance().post('/post/course_post', { 
            course_id:courseId,
            post_title: postTitle,
            post_content: postContent 
        });
        return response.data;
    } catch (error) {
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
        await waitForLock('token');
        const response = await getaxiosInstance().get('/post/detail', { params: { post_id: postId } });
        return response.data;
    } catch (error) {
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
        await waitForLock('token');
        const response = await getaxiosInstance().get('/post/reply_list', { params: { post_id: postId, page_index: pageIndex, page_size: pageSize } });
        return response.data;
    } catch (error) {
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
        await waitForLock('token');
        const response = await getaxiosInstance().post('/post/delete', { post_id: postId });
        return response.data;
    } catch (error) {
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
        await waitForLock('token');
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
        await waitForLock('token');
        const response = await getaxiosInstance().post('/reply/delete', { reply_id: replyId });
        return response.data;
    } catch (error) {
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
        await waitForLock('token');
        const response = await getaxiosInstance().get('/reply/detail', { params: { reply_id: replyId } });
        return response.data;
    } catch (error) {
        let dealResult = await dealAxiosError(error);
        if(dealResult.status == 1412){
            return await getReplyDetailById(replyId);
        }
        return dealResult;
    }
};