import { dealAxiosError } from "@/utils/other";
import axiosInstance from "./axios";

/**
 * 
 * @param {String} articleId 
 * @param {String} postTitle 
 * @param {String} postContent 
 * @returns 
 */
export const createPostInArticle = async (articleId, postTitle, postContent) => {
    try {
        const response = await axiosInstance.post('/post/article_post', { 
            article_id: articleId,
            post_title: postTitle,
            post_content: postContent 
        });
        return response.data;
    } catch (error) { return dealAxiosError(error);
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
        const response = await axiosInstance.post('/post/course_post', { 
            course_id:courseId,
            post_title: postTitle,
            post_content: postContent 
        });
        return response.data;
    } catch (error) { return dealAxiosError(error);
    }
};
/**
 * 
 * @param {String} postId 
 * @returns 
 */
export const getPostDetailById = async (postId) => {
    try {
        const response = await axiosInstance.get('/post/detail', { params: { post_id: postId } });
        return response.data;
    } catch (error) { return dealAxiosError(error);
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
        const response = await axiosInstance.get('/post/reply_list', { params: { post_id: postId, page_index: pageIndex, page_size: pageSize } });
        return response.data;
    } catch (error) { return dealAxiosError(error);
    }
};
/**
 * 
 * @param {string} postId 
 * @returns 
 */
export const deletePostById = async (postId) => {
    try {
        const response = await axiosInstance.post('/post/delete', { post_id: postId });
        return response.data;
    } catch (error) { return dealAxiosError(error);
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
        let response=null;
        if(parentReplyId){
            response = await axiosInstance.post('/reply/create', { 
                post_id: postId,
                reply_content: replyContent,
                parent_reply_id: parentReplyId 
            });
        }else{
            response = await axiosInstance.post('/reply/create', { 
                post_id: postId,
                reply_content: replyContent
            });
        }
        return response.data;
    } catch (error) { return dealAxiosError(error);
    }
};
/**
 * 
 * @param {String} replyId 
 * @returns 
 */
export const deleteReplyById = async (replyId) => {
    try {
        const response = await axiosInstance.post('/reply/delete', { reply_id: replyId });
        return response.data;
    } catch (error) { return dealAxiosError(error);
    }
};
/**
 * 
 * @param {String} replyId 
 * @returns 
 */
export const getReplyDetailById = async (replyId) => {
    try {
        const response = await axiosInstance.get('/reply/detail', { params: { reply_id: replyId } });
        return response.data;
    } catch (error) { return dealAxiosError(error);
    }
};