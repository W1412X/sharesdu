/** 
 * this document provides all interface request for block operations
 * the required input parameter is a json object
 * returns the original response message
 * every function return a json with status code and message
 */
import { dealAxiosError } from "@/utils/other.js";
import axiosInstance from "../request";
/**
 * 
 * @param {block user id} toUserId 
 * @returns 
 */
export const blockUser = async (toUserId) => {
    try {
        const response = await axiosInstance.post('/block', { to_user_id: toUserId });
        return response.data;
    } catch (error) {
        return dealAxiosError(error);
    }
};
/**
 * 
 * @param {unblock user id} toUserId 
 * @returns 
 */
export const unblockUser = async (toUserId) => {
    try {
        const response = await axiosInstance.post('/unblock', { to_user_id: toUserId });
        return response.data;
    } catch (error) {
        return dealAxiosError(error);
    }
};

/**
 * 
 * @param {user id(self)} userId 
 * @returns 
 */
export const getBlockList = async (userId) => {
    try {
        const response = await axiosInstance.get('/blocklist', { params: { user_id: userId } });
        return response.data;
    } catch (error) {
        return dealAxiosError(error);
    }
};
