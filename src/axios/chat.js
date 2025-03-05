/**
 * this file is used to define the api of chat 
 */ 
import { getAxios } from "./axios.js";
import { getNetworkErrorResponse } from "./statusCodeMessages.js";
/**
 * 
 * @param {receiverId,content} data
 * @returns 
 */
export const chatSend = async (data) => {
    try {
        console.log('Request Type: GET');
        console.log('Request URL: /blocklist');
        const response = await getAxios().get('/blocklist', { params: { user_id: userId } });
        return response.data;
    } catch (error) {
        console.error('Error getting block list:', error);
        return getNetworkErrorResponse();
    }
};
