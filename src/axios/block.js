/** 
 * this document provides all interface request for block operations
 * the required input parameter is a json object
 * returns the original response message
 * every function return a json with status code and message
 */
import { waitForLock } from "@/utils/lock.js";
import { getaxiosInstance } from "./axios.js";
import { dealAxiosError } from "@/utils/other.js";
/**
 * 
 * @param {block user id} toUserId 
 * @returns 
 */
export const blockUser = async (toUserId) => {
    try {
        await waitForLock('token');
        const response = await getaxiosInstance().post('/block', { to_user_id: toUserId });
        return response.data;
    } catch (error) {
        let dealResult=await dealAxiosError(error);
        //which means the error caused by the token and have refreshed it
        if(dealResult.status==1412){
          return await blockUser(toUserId);
        }
        return dealResult;
    }
};
/**
 * 
 * @param {unblock user id} toUserId 
 * @returns 
 */
export const unblockUser = async (toUserId) => {
    try {
        await waitForLock('token');
        const response = await getaxiosInstance().post('/unblock', { to_user_id: toUserId });
        return response.data;
    } catch (error) {
        let dealResult=await dealAxiosError(error);
        //which means the error caused by the token and have refreshed it
        if(dealResult.status==1412){
          return await unblockUser(toUserId);
        }
        return dealResult;
    }
};

/**
 * 
 * @param {user id(self)} userId 
 * @returns 
 */
export const getBlockList = async (userId) => {
    try {
        await waitForLock('token');
        const response = await getaxiosInstance().get('/blocklist', { params: { user_id: userId } });
        return response.data;
    } catch (error) {
        let dealResult=await dealAxiosError(error);
        //which means the error caused by the token and have refreshed it
        if(dealResult.status==1412){
          return await getBlockList(userId);
        }
        return dealResult;
    }
};
