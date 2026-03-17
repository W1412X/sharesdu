/** 
 * this document provides all interface request for account operations
 * the required input parameter is a json object
 * returns the original response message
 * every function return a json with status code and message
 */
import { dealAxiosError } from "@/utils/other.js";
import axiosInstance, { axiosInstanceNoHeader } from "../request";
/**
 * registe by Email
 * @param {JSON} data 
 * @returns 
 */
export const registerByEmail = async (data) => {
  try {
    const response = await axiosInstanceNoHeader.post('/register', data);
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

/**
 * get the email exmaine code 
 * @param {String} email 
 * @returns 
 */
export const getRegisterEmailCode = async (email,inviteCode) => {
  try {
    const response = await axiosInstanceNoHeader.get(`/register?send_code=1&email=${email}&invitation_code=${inviteCode}`);
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

/**
 * login with username 
 * @param {JSON} data 
 * @returns 
 */
export const loginWithPassword = async (data) => {
  try {
    const response = await axiosInstanceNoHeader.post('/login_passwd', data);
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

/**
 * get login email code 
 * @param {String} email 
 * @returns 
 */
export const getLoginEmailCode = async (email) => {
  try {
    const response = await axiosInstanceNoHeader.get(`/login_email?send_code=1&email=${email}`);
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

/**
 * login with email 
 * @param {JSON} data 
 * @returns 
 */
export const loginWithEmail = async (data) => {
  try {
    const response = await axiosInstanceNoHeader.post('/login_email', data);
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

/**
 * logout
 * @returns 
 */
export const logout = async () => {
  try {
    const response = await axiosInstance.post('/logout');
    return response.data;
  } catch (error) {
    return dealAxiosError(error);
  }
};

/**
 * delete account
 * @param {JSON} data 
 * @returns 
 */
export const deleteAccount = async (data) => {
  try {
    const response = await axiosInstance.post('/delete_account', data);
    return response.data;
  } catch (error) {
    return dealAxiosError(error);
  }
};

/**
 * get email code to delete account 
 * @param {String} email 
 * @returns 
 */
export const getDeleteAccountEmailCode = async (email) => {
  try {
    const response = await axiosInstance.get(`/delete_account?send_code=1&email=${email}`);
    return response.data;
  } catch (error) {
    return dealAxiosError(error);
  }
};

/**
 * reset passwd 
 * @param {JSON} data 
 * @returns 
 */
export const resetPassword = async (data) => {
  try {
    const response = await axiosInstance.post('/reset_password', data);
    return response.data;
  } catch (error) {
    return dealAxiosError(error);
  }
};

/**
 * get the email code to reset passwd
 * @param {String} email 
 * @returns 
 */
export const getResetPasswordEmailCode = async (email) => {
  try {
    const response = await axiosInstance.get(`/reset_password?send_code=1&email=${email}`);
    return response.data;
  } catch (error) {
    return dealAxiosError(error);
  }
};

/**
 * 
 * @param {String} userId 
 * @returns 
 */
export const getAuthorInfo=async(userId)=>{
  try{
    const response=await axiosInstance.get(`/user/homepage?user_id=${userId}`);
    return response.data;
  } catch (error) {
    return dealAxiosError(error);
  }
}

/**
 * 获取用户创作内容预览
 * @param {*} userId 
 * @returns 
 */
export const getUserPreview = async (userId) => {
  try {
      const response = await axiosInstance.get(`/user/preview?user_id=${userId}`);
      return response.data;
  } catch (error) {
    return dealAxiosError(error);
  }
};

/**
 * 获取用户创作详情
 * @param {*} contentType 内容类型：article/post/reply
 * @param {*} userId 目标用户的user_id
 * @param {*} page 页码
 * @param {*} pageSize 每页数量
 * @returns 
 */
export const getUserContent = async (contentType, userId, page = 1, pageSize = 10) => {
  try {
      const response = await axiosInstance.get(`/user/content?type=${contentType}&user_id=${userId}&page=${page}&page_size=${pageSize}`);
      return response.data;
  } catch (error) {
    return dealAxiosError(error);
  }
};
