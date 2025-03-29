import { dealAxiosError } from "@/utils/other";
import { getaxiosInstance } from "./axios";
import { waitForLock } from "@/utils/lock";

/**
 * 发送私信
 * @param {Number} receiverId - 接收者用户ID
 * @param {String} content - 私信内容
 * @returns {Object} - 返回响应数据
 */
export const sendPrivateMessage = async (receiverId, content) => {
    try {
        await waitForLock('token');
        const response = await getaxiosInstance().post('/messages/send', { 
            receiver_id: receiverId,
            content: content
        });
        return response.data;
    } catch (error) {
        let dealResult = await dealAxiosError(error);
        if(dealResult.status == 1412){
            return await sendPrivateMessage(receiverId, content);
        }
        return dealResult;
    }
};

/**
 * 获取私信列表
 * @param {Number} pageSize - 每页返回的消息数量，默认10条
 * @param {Number} pageIndex - 第几页，默认第一页
 * @returns {Object} - 返回私信列表信息
 */
export const getPrivateMessageList = async (pageSize = 10, pageIndex = 1) => {
    try {
        await waitForLock('token');
        const response = await getaxiosInstance().get('/messages/list', { 
            params: { page_size: pageSize, page_index: pageIndex }
        });
        return response.data;
    } catch (error) {
        let dealResult = await dealAxiosError(error);
        if(dealResult.status == 1412){
            return await getPrivateMessageList(pageSize, pageIndex);
        }
        return dealResult;
    }
};

/**
 * 标记私信为已读
 * @param {Number} messageId - 消息ID
 * @returns {Object} - 返回响应数据
 */
export const markMessageAsRead = async (messageId) => {
    try {
        await waitForLock('token');
        const response = await getaxiosInstance().post('/messages/read', { 
            message_id: messageId
        });
        return response.data;
    } catch (error) {
        let dealResult = await dealAxiosError(error);
        if(dealResult.status == 1412){
            return await markMessageAsRead(messageId);
        }
        return dealResult;
    }
};

/**
 * 撤回私信
 * @param {Number} messageId - 消息ID
 * @returns {Object} - 返回响应数据
 */
export const deletePrivateMessage = async (messageId) => {
    try {
        await waitForLock('token');
        const response = await getaxiosInstance().post('/messages/delete', { 
            message_id: messageId
        });
        return response.data;
    } catch (error) {
        let dealResult = await dealAxiosError(error);
        if(dealResult.status == 1412){
            return await deletePrivateMessage(messageId);
        }
        return dealResult;
    }
};
