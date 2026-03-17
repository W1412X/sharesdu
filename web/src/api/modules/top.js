import { dealAxiosError } from "@/utils/other";
import axiosInstance from "../request";

/**
 * Set or cancel the article top status.
 * Only administrators or super administrators can operate.
 * 
 * @param {int} articleId - The ID of the article.
 * @param {boolean} top - Whether to set the article to top (true/false).
 * @returns {object} - The response data with status code and message.
 */
export const setArticleTop = async (articleId, top) => {
    try {
        const response = await axiosInstance.post(`/articles/${articleId}/top`, { top });
        return response.data;
    } catch (error) {
        return dealAxiosError(error);
    }
};

/**
 * Set or cancel the post top status in an article.
 * Article authors, post authors, or administrators can operate.
 * 
 * @param {int} postId - The ID of the post.
 * @param {boolean} top - Whether to set the post to top (true/false).
 * @returns {object} - The response data with status code and message.
 */
export const setPostTopInArticle = async (postId, top) => {
    try {
        const response = await axiosInstance.post(`/article-posts/${postId}/top`, { top });
        return response.data;
    } catch (error) {
        return dealAxiosError(error);
    }
};
/**
 * Set or cancel the post top status in a course.
 * Only administrators or super administrators can operate.
 * 
 * @param {int} postId - The ID of the post.
 * @param {boolean} top - Whether to set the post to top (true/false).
 * @returns {object} - The response data with status code and message.
 */
export const setPostTopInCourse = async (postId, top) => {
    try {
        const response = await axiosInstance.post(`/course-posts/${postId}/top`, { top });
        return response.data;
    } catch (error) {
        return dealAxiosError(error);
    }
};

