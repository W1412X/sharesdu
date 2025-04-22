import { waitForLock } from "@/utils/lock";
import { getaxiosInstance } from "./axios";
import { dealAxiosError } from "@/utils/other";

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
        await waitForLock('token');
        const response = await getaxiosInstance().post(`/articles/${articleId}/top`, { top });
        return response.data;
    } catch (error) {
        let dealResult = await dealAxiosError(error);
        // Retry if token is refreshed.
        if (dealResult.status == 1412) {
            return await setArticleTop(articleId, top);
        }
        return dealResult;
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
        await waitForLock('token');
        const response = await getaxiosInstance().post(`/article-posts/${postId}/top`, { top });
        return response.data;
    } catch (error) {
        let dealResult = await dealAxiosError(error);
        // Retry if token is refreshed.
        if (dealResult.status == 1412) {
            return await setPostTopInArticle(postId, top);
        }
        return dealResult;
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
        await waitForLock('token');
        const response = await getaxiosInstance().post(`/course-posts/${postId}/top`, { top });
        return response.data;
    } catch (error) {
        let dealResult = await dealAxiosError(error);
        // Retry if token is refreshed.
        if (dealResult.status == 1412) {
            return await setPostTopInCourse(postId, top);
        }
        return dealResult;
    }
};

