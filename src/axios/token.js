/**
 * some token operation
 */
import { getaxiosInstance } from "./axios";
/**
 * get the access token through the refresh token  
 * @param {String} refreshToken 
 * @returns 
 */
export const getAccessToken=async (refreshToken)=>{
    try {
        console.log('Request Type: POST');
        console.log('Request URL: /token/refresh');
        console.log('Request Data:', data);
        var data={
            refresh:refreshToken,
        }
        const response = await getaxiosInstance().post('/token/refresh',data);
        /**
         * the status's standard here as same as the other
         * so we don't deal it here   
         */
        return response.data;
    } catch (error) {
        console.error('Error refreshing token:', error);
        return error.response.data;
    }
}