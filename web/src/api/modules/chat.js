import { dealAxiosError } from "@/utils/other";
import axiosInstance from "../request";

/**
 * 
 * @param {String} receriver_id 
 * @param {String} content 
 * @returns 
 */
export const sendPrivateMessage = async (receriver_id,content) => {
    try {
        let data = {
            receiver_id: receriver_id,
            content: content
        };
        const response = await axiosInstance.post('/messages/send', data);
        return response.data;
    } catch (error) {
        return dealAxiosError(error);
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
        const response = await axiosInstance.get('/messages/list', { page_index: page_index, page_size: page_size });
        return response.data;
    } catch (error) {
        return dealAxiosError(error);
    }
};

/**
 * 
 * @param {String} messageId 
 * @returns 
 */
export const markMessageAsRead = async (messageId) => {
    try {
        const response = await axiosInstance.post('/messages/read', { message_id: messageId });
        return response.data;
    } catch (error) {
        return dealAxiosError(error);
    }
};

/**
 * 
 * @param {String} messageId 
 * @returns 
 */
export const deletePrivateMessage = async (messageId) => {
    try {
        const response = await axiosInstance.post('/messages/delete', { message_id: messageId });
        return response.data;
    } catch (error) {
        return dealAxiosError(error);
    }
};

/**
 * 
 * @returns 
 */
export const getChatUsers = async () => {
    try {
        const response = await axiosInstance.get('/messages/chat-users');
        return response.data;
    } catch (error) {
        return dealAxiosError(error);
    }
};

/**
 * 
 * @param {*} userId 
 * @param {*} params 
 * @returns 
 */
// eslint-disable-next-line no-unused-vars
export const getChatHistory = async (userId, page,page_size=10) => {
    try {
        let response=null;
        if(page==null||page==undefined||page==1){
            response = await axiosInstance.get(`/messages/history/${userId}`);
        }else{
            response= await axiosInstance.get(`/messages/history/${userId}?page=${page}`);
        }
        return response.data;
    } catch (error) {
        return dealAxiosError(error);
    }
};
