import { dealAxiosError } from "@/utils/other.js";
import axiosInstance from "./axios";

/**
 * 收藏课程、文章或帖子
 * @param {int} content_type 
 * @param {int} content_id 
 * @param {int|null} folder_id 
 * @returns 
 */
export const starContent = async (content_type, content_id, folder_id=null) => {
  try {
    const data = {content_type, content_id, folder_id};
    const response = await axiosInstance.post('/star', data);
    return response.data;
  } catch (error) {
    return dealAxiosError(error);
  }
};

/**
 * 创建新的收藏夹
 * @param {string} folder_name 
 * @param {string|null} description 
 * @returns 
 */
export const createStarFolder = async (folder_name, description=null) => {
  try {
    const data = {folder_name, description};
    const response = await axiosInstance.post('/star/create', data);
    return response.data;
  } catch (error) {
    return dealAxiosError(error);
  }
};

/**
 * 获取收藏列表
 * @param {int|null} folder_id 
 * @returns 
 */
export const getStarList = async (folder_id=null) => {
  try {
    let url = '/star/list';
    if(folder_id !== null) url += `?folder_id=${folder_id}`;
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    return dealAxiosError(error);
  }
};

/**
 * 取消收藏内容
 * @param {int} content_type 
 * @param {int} content_id 
 * @returns 
 */
export const unstarContent = async (content_type, content_id) => {
  try {
    const data = {content_type, content_id};
    const response = await axiosInstance.post('/unstar', data);
    return response.data;
  } catch (error) {
    return dealAxiosError(error);
  }
};

/**
 * 获取所有收藏夹信息
 * @returns 
 */
export const getStarFolders = async () => {
  try {
    const response = await axiosInstance.get('/star/folder/list');
    return response.data;
  } catch (error) {
    return dealAxiosError(error);
  }
};