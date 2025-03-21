/** 
 * this document provides all interface request for account operations
 * the required input parameter is a json object
 * returns the original response message
 * every function return a json with status code and message
 */
import { dealAxiosError } from "@/utils/other.js";
import {getaxiosInstance, getNoHeaderAxiosInstance} from "./axios.js";
import { waitForLock } from "@/utils/lock.js";
/**
 * registe by Email
 * @param {JSON} data 
 * @returns 
 */
export const registerByEmail = async (data) => {
  try {
    await waitForLock('token');
    const response = await getNoHeaderAxiosInstance().post('/register', data);
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
export const getRegisterEmailCode = async (email) => {
  try {
    await waitForLock('token');
    const response = await getNoHeaderAxiosInstance().get(`/register?send_code=1&email=${email}`);
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
    await waitForLock('token');
    const response = await getNoHeaderAxiosInstance().post('/login_passwd', data);
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
    await waitForLock('token');
    const response = await getNoHeaderAxiosInstance().get(`/login_email?send_code=1&email=${email}`);
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
    await waitForLock('token');
    const response = await getNoHeaderAxiosInstance().post('/login_email', data);
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
    await waitForLock('token');
    const response = await getaxiosInstance().post('/logout');
    return response.data;
  } catch (error) {
    let dealResult = await dealAxiosError(error);
    if(dealResult.code==1412){
      return await logout();
    }
    return dealResult;
  }
};

/**
 * delete account
 * @param {JSON} data 
 * @returns 
 */
export const deleteAccount = async (data) => {
  try {
    await waitForLock('token');
    const response = await getaxiosInstance().post('/delete_account', data);
    return response.data;
  } catch (error) {
    let dealResult = await dealAxiosError(error);
    if(dealResult.code==1412){
      return await deleteAccount(data);
    }
    return dealResult;
  }
};

/**
 * get email code to delete account 
 * @param {String} email 
 * @returns 
 */
export const getDeleteAccountEmailCode = async (email) => {
  try {
    await waitForLock('token');
    const response = await getaxiosInstance().get(`/delete_account?send_code=1&email=${email}`);
    return response.data;
  } catch (error) {
    let dealResult = await dealAxiosError(error);
    if(dealResult.code==1412){
      return await getDeleteAccountEmailCode(email);
    }
    return dealResult;
  }
};

/**
 * reset passwd 
 * @param {JSON} data 
 * @returns 
 */
export const resetPassword = async (data) => {
  try {
    await waitForLock('token');
    const response = await getaxiosInstance().post('/reset_password', data);
    return response.data;
  } catch (error) {
    let dealResult = await dealAxiosError(error);
    if(dealResult.code==1412){
      return await resetPassword(data);
    }
    return dealResult;
  }
};

/**
 * get the email code to reset passwd
 * @param {String} email 
 * @returns 
 */
export const getResetPasswordEmailCode = async (email) => {
  try {
    await waitForLock('token');
    const response = await getaxiosInstance().get(`/reset_password?send_code=1&email=${email}`);
    return response.data;
  } catch (error) {
    let dealResult = await dealAxiosError(error);
    if(dealResult.code==1412){
      return await getResetPasswordEmailCode(email);
    }
    return dealResult;
  }
};

/**
 * 
 * @param {String} userId 
 * @returns 
 */
export const getAuthorInfo=async(userId)=>{
  try{
    await waitForLock('token');
    const response=await getaxiosInstance().get(`/user/homepage?user_id=${userId}`);
    return response.data;
  }catch(error){
    let dealResult = await dealAxiosError(error);
    if(dealResult.code==1412){
      return await getAuthorInfo(userId);
    }
    return dealResult;
  }
}
