import { dealAxiosError } from "@/utils/other.js";
import {getaxiosInstance} from "./axios.js";
import { getResponseFromCache, saveResponseToCache } from "@/utils/session.js";
import { waitForLock } from "@/utils/lock.js";
/**
 * Fetch notifications list
 * @param {int} [page_size=10] Number of notifications per page, default is 10
 * @param {int} [page_index=1] The page number to fetch, default is the first page
 * @returns {Promise}
 */
export const fetchNotificationsList = async (page_index = 1,page_size = 10) => {
    try {
      await waitForLock('token');
      let cacheResponse=getResponseFromCache(`/notifications/list?page_size=${page_size}&page_index=${page_index}`);
      if(cacheResponse){
          return cacheResponse.data;
      }
      const response = await getaxiosInstance().get('/notifications/list', {
        params: { page_size, page_index }
      });
      saveResponseToCache(`/notifications/list?page_size=${page_size}&page_index=${page_index}`,response);
      return response.data;
    } catch (error) {
      let dealResult = await dealAxiosError(error);
      if(dealResult.status == 1412){
        return await fetchNotificationsList(page_size, page_index);
      }
      return dealResult;
    }
  };
  
  /**
   * Mark a notification as read
   * @param {int} notification_id The ID of the notification to mark as read
   * @returns {Promise}
   */
  export const markAsReadNotification = async (notification_ids) => {
    try {
      await waitForLock('token');
      const response = await getaxiosInstance().post('/notifications/read', { notification_ids:notification_ids });
      return response.data;
    } catch (error) {
      let dealResult = await dealAxiosError(error);
      if(dealResult.status == 1412){
        return await markAsReadNotification(notification_ids);
      }
      return dealResult;
    }
  };