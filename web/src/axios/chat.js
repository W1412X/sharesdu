import { dealAxiosError } from "@/utils/other";
import { waitForLock } from "@/utils/lock";
import axiosInstance from "./axios";

/**
 * 
 * @param {String} receriver_id 
 * @param {String} content 
 * @returns 
 */
export const sendPrivateMessage = async (receriver_id,content) => {
    try {
        await waitForLock('token');
        let data = {
            receiver_id: receriver_id,
            content: content
        };
        const response = await axiosInstance.post('/messages/send', data);
        return response.data;
    } catch (error) {
        let dealResult = await dealAxiosError(error);
        if (dealResult.status == 1412) {
            return await sendPrivateMessage(receriver_id, content);
        }
        return dealResult;
    }
};

/**
 * 
 * @param {Number} page_index 
 * @param {Number} page_size 
 * @returns 
 */
export const getMessageList = async (page_index=1,page_size=10) => {
    try {
        await waitForLock('token');
        const response = await axiosInstance.get('/messages/list', { page_index: page_index, page_size: page_size });
        return response.data;
    } catch (error) {
        let dealResult = await dealAxiosError(error);
        if (dealResult.status == 1412) {
            return await getMessageList(page_index, page_size);
        }
        return dealResult;
    }
};

/**
 * 
 * @param {String} messageId 
 * @returns 
 */
export const markMessageAsRead = async (messageId) => {
    try {
        await waitForLock('token');
        const response = await axiosInstance.post('/messages/read', { message_id: messageId });
        return response.data;
    } catch (error) {
        let dealResult = await dealAxiosError(error);
        if (dealResult.status == 1412) {
            return await markMessageAsRead(messageId);
        }
        return dealResult;
    }
};

/**
 * 
 * @param {String} messageId 
 * @returns 
 */
export const deletePrivateMessage = async (messageId) => {
    try {
        await waitForLock('token');
        const response = await axiosInstance.post('/messages/delete', { message_id: messageId });
        return response.data;
    } catch (error) {
        let dealResult = await dealAxiosError(error);
        if (dealResult.status == 1412) {
            return await deletePrivateMessage(messageId);
        }
        return dealResult;
    }
};

/**
 * 
 * @returns 
 */
export const getChatUsers = async () => {
    try {
        await waitForLock('token');
        const response = await axiosInstance.get('/messages/chat-users');
        return response.data;
    } catch (error) {
        let dealResult = await dealAxiosError(error);
        if (dealResult.status == 1412) {
            return await getChatUsers();
        }
        return dealResult;
    }
};

/**
 * 
 * @param {*} userId 
 * @param {*} params 
 * @returns 
 */
export const getChatHistory = async (userId, page,page_size=10) => {
    try {
        await waitForLock('token');
        let response=null;
        if(page==null||page==undefined||page==1){
            response = await axiosInstance.get(`/messages/history/${userId}`);
        }else{
            response= await axiosInstance.get(`/messages/history/${userId}?page=${page}`);
        }
        return response.data;
    } catch (error) {
        let dealResult = await dealAxiosError(error);
        if (dealResult.status == 1412) {
            return await getChatHistory(userId, page,page_size);
        }
        return dealResult;
    }
};
