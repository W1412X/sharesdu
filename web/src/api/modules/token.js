/**
 * some token operation
 * 使用独立 axios 实例，避免 request -> auth -> token -> request 循环依赖
 */

import axios from "axios";
import config from "@/config";

const refreshClient = axios.create({ baseURL: config.api.baseURL });

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
        const response = await refreshClient.post('/token/refresh',data);
        /**
         * the status's standard here as same as the other
         * so we don't deal it here   
         */
        return response.data;
    } catch (error) {
        return error.response.data;
    }
}