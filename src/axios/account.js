/** 
 * this document provides all interface request for account operations
 * the required input parameter is a json object
 * returns the original response message
 * every function return a json with status code and message
 */
import { dealAxiosError } from "@/utils/other.js";
import {getaxiosInstance} from "./axios.js";
/**
 * registe by Email
 * @param {JSON} data 
 * @returns 
 */
export const registerByEmail = async (data) => {
  try {
    console.log('Request Type: POST');
    console.log('Request URL: /register');
    console.log('Request Data:', data);
    const response = await getaxiosInstance().post('/register', data);
    return response.data;
  } catch (error) {
    console.error('Error registering:', error);
    let dealResult=await dealAxiosError(error);
    //which means the error caused by the token and have refreshed it
    if(dealResult.status==1412){
      return await registerByEmail(data);
    }
    return dealResult;
  }
};

/**
 * get the email exmaine code 
 * @param {String} email 
 * @returns 
 */
export const getRegisterEmailCode = async (email) => {
  try {
    console.log('Request Type: GET');
    console.log('Request URL: /register?send_code=1&email=' + email);
    const response = await getaxiosInstance().get(`/register?send_code=1&email=${email}`);
    return response.data;
  } catch (error) {
    console.error('Error getting register email code:', error);
    let dealResult=await dealAxiosError(error);
    if(dealResult.status==1412){
      return await getRegisterEmailCode(email);
    }
    return dealResult;
  }
};

/**
 * login with username 
 * @param {JSON} data 
 * @returns 
 */
export const loginWithPassword = async (data) => {
  try {
    console.log('Request Type: POST');
    console.log('Request URL: /login_passwd');
    console.log('Request Data:', data);
    const response = await getaxiosInstance().post('/login_passwd', data);
    return response.data;
  } catch (error) {
    console.log('Error logging in:',error);
    let dealResult = await dealAxiosError(error);
    if(dealResult.code==1412){
      return await loginWithPassword(data);
    }
    return dealResult;
  }
};

/**
 * get login email code 
 * @param {String} email 
 * @returns 
 */
export const getLoginEmailCode = async (email) => {
  try {
    console.log('Request Type: GET');
    console.log('Request URL: /login_email?send_code=1&email=' + email);
    const response = await getaxiosInstance().get(`/login_email?send_code=1&email=${email}`);
    return response.data;
  } catch (error) {
    console.error('Error getting login email code:', error);
    let dealResult = await dealAxiosError(error);
    if(dealResult.code==1412){
      return await getLoginEmailCode(email);
    }
    return dealResult;
  }
};

/**
 * login with email 
 * @param {JSON} data 
 * @returns 
 */
export const loginWithEmail = async (data) => {
  try {
    console.log('Request Type: POST');
    console.log('Request URL: /login_email');
    console.log('Request Data:', data);
    const response = await getaxiosInstance().post('/login_email', data);
    return response.data;
  } catch (error) {
    console.error('Error logging in with email:', error);
    let dealResult = await dealAxiosError(error);
    if(dealResult.code==1412){
      return await loginWithEmail(data);
    }
    return dealResult;
  }
};

/**
 * logout
 * @returns 
 */
export const logout = async () => {
  try {
    console.log('Request Type: POST');
    console.log('Request URL: /logout');
    const response = await getaxiosInstance().post('/logout');
    return response.data;
  } catch (error) {
    console.error('Error logging out:', error);
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
    console.log('Request Type: POST');
    console.log('Request URL: /delete_account');
    console.log('Request Data:', data);
    const response = await getaxiosInstance().post('/delete_account', data);
    return response.data;
  } catch (error) {
    console.error('Error deleting account:', error);
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
    console.log('Request Type: GET');
    console.log('Request URL: /delete_account?send_code=1&email=' + email);
    const response = await getaxiosInstance().get(`/delete_account?send_code=1&email=${email}`);
    return response.data;
  } catch (error) {
    console.error('Error getting delete account email code:', error);
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
    console.log('Request Type: POST');
    console.log('Request URL: /reset_password');
    console.log('Request Data:', data);
    const response = await getaxiosInstance().post('/reset_password', data);
    return response.data;
  } catch (error) {
    console.error('Error resetting password:', error);
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
    console.log('Request Type: GET');
    console.log('Request URL: /reset_password?send_code=1&email=' + email);
    const response = await getaxiosInstance().get(`/reset_password?send_code=1&email=${email}`);
    return response.data;
  } catch (error) {
    console.error('Error getting reset password email code:', error);
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
    console.log('Request Type: GET');
    console.log('Request URL: /homepage?user_id='+userId);
    const response=await getaxiosInstance().get(`/homepage?user_id=${userId}`);
    return response.data;
  }catch(error){
    console.error('Error getting author info:',error);
    let dealResult = await dealAxiosError(error);
    if(dealResult.code==1412){
      return await getAuthorInfo(userId);
    }
    return dealResult;
  }
}
