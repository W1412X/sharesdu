import { dealAxiosError } from "@/utils/other";
import { getaxiosInstance } from "./axios";
import { waitForLock } from "@/utils/lock";

/**
 * Like content (article/post/reply)
 * @param {int} content_type Type of content: 0 for article, 1 for post, 2 for reply
 * @param {int} content_id ID of the content to be liked
 * @returns {Promise}
 */
export const likeContent = async (content_type, content_id) => {
    try {
      await waitForLock('token');
      console.log('Request Type: POST');
      console.log('Request URL: /like');
      console.log('Request Data:', { content_type, content_id });
      const response = await getaxiosInstance().post('/like', { content_type, content_id });
      return response.data;
    } catch (error) {
      console.error('Error liking content:', error);
      let dealResult = await dealAxiosError(error);
      if(dealResult.status == 1412){
        return await likeContent(content_type, content_id);
      }
      return dealResult;
    }
  };
  
  /**
   * Unlike content (article/post/reply)
   * @param {int} content_type Type of content: 0 for article, 1 for post, 2 for reply
   * @param {int} content_id ID of the content to be unliked
   * @returns {Promise}
   */
  export const unlikeContent = async (content_type, content_id) => {
    try {
      await waitForLock('token');
      console.log('Request Type: POST');
      console.log('Request URL: /unlike');
      console.log('Request Data:', { content_type, content_id });
      const response = await getaxiosInstance().post('/unlike', { content_type, content_id });
      return response.data;
    } catch (error) {
      console.error('Error unliking content:', error);
      let dealResult = await dealAxiosError(error);
      if(dealResult.status == 1412){
        return await unlikeContent(content_type, content_id);
      }
      return dealResult;
    }
  };
  
  /**
   * Get the like count of a piece of content
   * @param {int} content_type Type of content: 0 for article, 1 for post, 2 for reply
   * @param {int} content_id ID of the content
   * @returns {Promise}
   */
  export const getContentLikeCount = async (content_type, content_id) => {
    try {
      await waitForLock('token');
      console.log('Request Type: GET');
      console.log(`Request URL: /like/count?content_type=${content_type}&content_id=${content_id}`);
      const response = await getaxiosInstance().get('/like/count', {
        params: { content_type, content_id }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting like count:', error);
      let dealResult = await dealAxiosError(error);
      if(dealResult.status == 1412){
        return await getContentLikeCount(content_type, content_id);
      }
      return dealResult;
    }
  };
  
  /**
   * Fetch a list of liked contents by a user
   * @param {int} user_id The ID of the user whose liked contents are fetched
   * @param {int} [page_size=20] Number of items per page, default is 20
   * @param {int} [page_index=1] The page number to fetch, default is the first page
   * @returns {Promise}
   */
  export const fetchUserLikedContents = async (user_id, page_size = 20, page_index = 1) => {
    try {
      await waitForLock('token');
      console.log('Request Type: GET');
      console.log(`Request URL: /like/user?user_id=${user_id}&page_size=${page_size}&page_index=${page_index}`);
      const response = await getaxiosInstance().get('/like/user', {
        params: { user_id, page_size, page_index }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user liked contents:', error);
      let dealResult = await dealAxiosError(error);
      if(dealResult.status == 1412){
        return await fetchUserLikedContents(user_id, page_size, page_index);
      }
      return dealResult;
    }
  };