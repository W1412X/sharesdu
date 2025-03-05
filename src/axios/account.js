/** 
 * this document provides all interface request for account operations
 * the required input parameter is a json object
 * returns the original response message
 * every function return a json with status code and message
 */
import { dealAxiosError } from "@/utils/other.js";
import {getAxios} from "./axios.js";
/**
 * registe by Email
 * @param {*} data 
 * @returns 
 */
export const registerByEmail = async (data) => {
  try {
    console.log('Request Type: POST');
    console.log('Request URL: /register');
    console.log('Request Data:', data);
    const response = await getAxios().post('/register', data);
    return response.data;
  } catch (error) {
    console.error('Error registering:', error);
    return dealAxiosError(error);
  }
};

/**
 * get the email exmaine code 
 * @param {*} email 
 * @returns 
 */
export const getRegisterEmailCode = async (email) => {
  try {
    console.log('Request Type: GET');
    console.log('Request URL: /register?send_code=1&email=' + email);
    const response = await getAxios().get(`/register?send_code=1&email=${email}`);
    return response.data;
  } catch (error) {
    console.error('Error getting register email code:', error);
    return dealAxiosError(error);
  }
};

/**
 * login with username 
 * @param {*} data 
 * @returns 
 */
export const loginWithPassword = async (data) => {
  try {
    console.log('Request Type: POST');
    console.log('Request URL: /login_passwd');
    console.log('Request Data:', data);
    const response = await getAxios().post('/login_passwd', data);
    return response.data;
  } catch (error) {
    return dealAxiosError(error);
  }
};

/**
 * get login email code 
 * @param {*} email 
 * @returns 
 */
export const getLoginEmailCode = async (email) => {
  try {
    console.log('Request Type: GET');
    console.log('Request URL: /login_email?send_code=1&email=' + email);
    const response = await getAxios().get(`/login_email?send_code=1&email=${email}`);
    return response.data;
  } catch (error) {
    console.error('Error getting login email code:', error);
    return dealAxiosError(error);
  }
};

/**
 * login with email 
 * @param {*} data 
 * @returns 
 */
export const loginWithEmail = async (data) => {
  try {
    console.log('Request Type: POST');
    console.log('Request URL: /login_email');
    console.log('Request Data:', data);
    const response = await getAxios().post('/login_email', data);
    return response.data;
  } catch (error) {
    console.error('Error logging in with email:', error);
    return dealAxiosError(error);
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
    const response = await getAxios().post('/logout');
    return response.data;
  } catch (error) {
    console.error('Error logging out:', error);
    return dealAxiosError(error);
  }
};

/**
 * delete account
 * @param {*} data 
 * @returns 
 */
export const deleteAccount = async (data) => {
  try {
    console.log('Request Type: POST');
    console.log('Request URL: /delete_account');
    console.log('Request Data:', data);
    const response = await getAxios().post('/delete_account', data);
    return response.data;
  } catch (error) {
    console.error('Error deleting account:', error);
    return dealAxiosError(error);
  }
};

/**
 * get email code to delete account 
 * @param {*} email 
 * @returns 
 */
export const getDeleteAccountEmailCode = async (email) => {
  try {
    console.log('Request Type: GET');
    console.log('Request URL: /delete_account?send_code=1&email=' + email);
    const response = await getAxios().get(`/delete_account?send_code=1&email=${email}`);
    return response.data;
  } catch (error) {
    console.error('Error getting delete account email code:', error);
    return dealAxiosError(error);
  }
};

/**
 * reset passwd 
 * @param {*} data 
 * @returns 
 */
export const resetPassword = async (data) => {
  try {
    console.log('Request Type: POST');
    console.log('Request URL: /reset_password');
    console.log('Request Data:', data);
    const response = await getAxios().post('/reset_password', data);
    return response.data;
  } catch (error) {
    console.error('Error resetting password:', error);
    return dealAxiosError(error);
  }
};

/**
 * get the email code to reset passwd
 * @param {*} email 
 * @returns 
 */
export const getResetPasswordEmailCode = async (email) => {
  try {
    console.log('Request Type: GET');
    console.log('Request URL: /reset_password?send_code=1&email=' + email);
    const response = await getAxios().get(`/reset_password?send_code=1&email=${email}`);
    return response.data;
  } catch (error) {
    console.error('Error getting reset password email code:', error);
    return dealAxiosError(error);
  }
};

/**
 * 
 * @param {*} userId 
 * @returns 
 */
export const getAuthorInfo=async(userId)=>{
  try{
    console.log('Request Type: GET');
    console.log('Request URL: /homepage?user_id='+userId);
    const response=await getAxios().get(`/homepage?user_id=${userId}`);
    return response.data;
  }catch(error){
    console.error('Error getting author info:',error);
    return dealAxiosError(error);
  }
}
