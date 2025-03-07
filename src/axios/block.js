/** 
 * this document provides all interface request for block operations
 * the required input parameter is a json object
 * returns the original response message
 * every function return a json with status code and message
 */
import { getaxiosInstance } from "./axios.js";
import { getNetworkErrorResponse } from "./statusCodeMessages.js";
/**
 * 
 * @param {block user id} toUserId 
 * @returns 
 */
export const blockUser = async (toUserId) => {
    try {
        console.log('Request Type: POST');
        console.log('Request URL: /block');
        const response = await getaxiosInstance().post('/block', { to_user_id: toUserId });
        return response.data;
    } catch (error) {
        console.error('Error blocking user:', error);
        return getNetworkErrorResponse();
    }
};
/**
 * 
 * @param {unblock user id} toUserId 
 * @returns 
 */
export const unblockUser = async (toUserId) => {
    try {
        console.log('Request Type: POST');
        console.log('Request URL: /unblock');
        const response = await getaxiosInstance().post('/unblock', { to_user_id: toUserId });
        return response.data;
    } catch (error) {
        console.error('Error unblocking user:', error);
        return getNetworkErrorResponse();
    }
};

/**
 * 
 * @param {user id(self)} userId 
 * @returns 
 */
export const getBlockList = async (userId) => {
    try {
        console.log('Request Type: GET');
        console.log('Request URL: /blocklist');
        const response = await getaxiosInstance().get('/blocklist', { params: { user_id: userId } });
        return response.data;
    } catch (error) {
        console.error('Error getting block list:', error);
        return getNetworkErrorResponse();
    }
};
