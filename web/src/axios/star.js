import { dealAxiosError } from "@/utils/other.js";
import {getaxiosInstance} from "./axios.js";
import { getResponseFromCache, saveResponseToCache } from "@/utils/session.js";
import { waitForLock } from "@/utils/lock.js";

/**
 * 收藏课程、文章或帖子
 * @param {int} content_type 
 * @param {int} content_id 
 * @param {int|null} folder_id 
 * @returns 
 */
export const starContent = async (content_type, content_id, folder_id=null) => {
  try {
    await waitForLock('token');
    const data = {content_type, content_id, folder_id};
    const response = await getaxiosInstance().post('/star', data);
    return response.data;
  } catch (error) {
    let dealResult=await dealAxiosError(error);
    if(dealResult.status==1412){
      return await starContent(content_type, content_id, folder_id);
    }
    return dealResult;
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
    await waitForLock('token');
    const data = {folder_name, description};
    const response = await getaxiosInstance().post('/star/create', data);
    return response.data;
  } catch (error) {
    let dealResult=await dealAxiosError(error);
    if(dealResult.status==1412){
      return await createStarFolder(folder_name, description);
    }
    return dealResult;
  }
};

/**
 * 获取收藏列表
 * @param {int|null} folder_id 
 * @returns 
 */
export const getStarList = async (folder_id=null) => {
  try {
    await waitForLock('token');
    let url = '/star/list';
    if(folder_id !== null) url += `?folder_id=${folder_id}`;
    let cacheResponse=getResponseFromCache(url);
    if(cacheResponse){
      return cacheResponse.data;
    }
    const response = await getaxiosInstance().get(url);
    saveResponseToCache(url,response);
    return response.data;
  } catch (error) {
    let dealResult=await dealAxiosError(error);
    if(dealResult.status==1412){
      return await getStarList(folder_id);
    }
    return dealResult;
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
    await waitForLock('token');
    const data = {content_type, content_id};
    const response = await getaxiosInstance().post('/unstar', data);
    return response.data;
  } catch (error) {
    let dealResult=await dealAxiosError(error);
    if(dealResult.status==1412){
      return await unstarContent(content_type, content_id);
    }
    return dealResult;
  }
};

/**
 * 获取所有收藏夹信息
 * @returns 
 */
export const getStarFolders = async () => {
  try {
    await waitForLock('token');
    let cacheResponse=getResponseFromCache('/star/folder/list');
    if(cacheResponse){
      return cacheResponse.data;
    }
    const response = await getaxiosInstance().get('/star/folder/list');
    saveResponseToCache('/star/folder/list',response);
    return response.data;
  } catch (error) {
    let dealResult=await dealAxiosError(error);
    if(dealResult.status==1412){
      return await getStarFolders();
    }
    return dealResult;
  }
};