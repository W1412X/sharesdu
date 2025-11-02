/**
 * some token operation
 */

import axiosInstance from "./axios";

/**
 * get the access token through the refresh token  
 * @param {String} refreshToken 
 * @returns 
 */
export const getAccessToken=async (refreshToken)=>{
    try {
        let data={
            refresh:refreshToken,
        }
        const response = await axiosInstance.post('/token/refresh',data);
        /**
         * the status's standard here as same as the other
         * so we don't deal it here   
         */
        return response.data;
    } catch (error) {
        return error.response.data;
    }
}