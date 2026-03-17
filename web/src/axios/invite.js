import { dealAxiosError } from "@/utils/other.js";
import axiosInstance from "./axios";
/**
 * 创建邀请码
 * @param {number} capacity 邀请码容量（可使用次数），必须为正整数
 * @param {number} [expiresDays] 有效期天数，不传则为永久有效
 * @returns 
 */
export const createInvitationCode = async (capacity, expiresDays) => {
    try {
        const requestData = {
            capacity: capacity,
            ...(expiresDays !== undefined && { expires_days: expiresDays })
        };
        const response = await axiosInstance.post('/admin/invitation-codes', requestData);
        return response.data;
    } catch (error) {
        return dealAxiosError(error);
    }
};

/**
 * 获取邀请码列表
 * @returns 
 */
export const getInvitationCodeList = async () => {
    try {
        const response = await axiosInstance.get('/admin/invitation-codes');
        return response.data;
    } catch (error) {
        return dealAxiosError(error);
    }
};

/**
 * 修改邀请码状态
 * @param {string} code 要修改的邀请码
 * @param {boolean} isActive 是否激活(true/false)
 * @returns 
 */
export const updateInvitationCodeStatus = async (code, isActive) => {
    try {
        const requestData = {
            code: code,
            is_active: isActive
        };
        const response = await axiosInstance.patch('/admin/invitation-codes', requestData);
        return response.data;
    } catch (error) {
        return dealAxiosError(error);
    }
};



