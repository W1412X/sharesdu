import { dealAxiosError } from "@/utils/other.js";
import axiosInstance from "./axios";

function normalizeContentId(content_id) {
  const n = Number(content_id);
  return Number.isNaN(n) ? content_id : n;
}

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
 * 获取收藏列表（与 api/modules/star.js 保持一致）
 */
export const getStarList = async (folder_id = null, page_index, page_size) => {
  try {
    let url = '/star/list';
    const qs = [];
    if (folder_id !== null && folder_id !== undefined) {
      qs.push(`folder_id=${encodeURIComponent(folder_id)}`);
    }
    if (page_index != null) {
      qs.push(`page_index=${encodeURIComponent(page_index)}`);
    }
    if (page_size != null) {
      qs.push(`page_size=${encodeURIComponent(page_size)}`);
    }
    if (qs.length) url += `?${qs.join('&')}`;
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    return dealAxiosError(error);
  }
};

/**
 * 取消收藏（可选 folder_id，与 api/modules/star.js 保持一致）
 */
export const unstarContent = async (content_type, content_id, folder_id = undefined) => {
  try {
    const data = {
      content_type,
      content_id: normalizeContentId(content_id),
    };
    if (folder_id !== undefined && folder_id !== null && folder_id !== '') {
      data.folder_id = Number(folder_id);
    }
    const response = await axiosInstance.post('/unstar', data);
    return response.data;
  } catch (error) {
    return dealAxiosError(error);
  }
};

const STAR_LIST_PAGE_SIZE = 100;
const STAR_LIST_MAX_PAGES = 200;

async function fetchAllStarListEntries() {
  const all = [];
  let page = 1;
  while (page <= STAR_LIST_MAX_PAGES) {
    const res = await getStarList(null, page, STAR_LIST_PAGE_SIZE);
    if (!res || (res.status !== 200 && res.status !== 201)) {
      break;
    }
    const list = res.star_list || [];
    all.push(...list);
    if (list.length < STAR_LIST_PAGE_SIZE) break;
    page += 1;
  }
  return all;
}

export const findFolderIdsForStarredContent = async (content_type, content_id) => {
  const cid = normalizeContentId(content_id);
  const entries = await fetchAllStarListEntries();
  const ids = new Set();
  for (const row of entries) {
    if (row.content_type === content_type && Number(row.content_id) === Number(cid)) {
      if (row.folder_id != null && row.folder_id !== '') {
        ids.add(Number(row.folder_id));
      }
    }
  }
  return [...ids];
};

export const unstarContentSmart = async (content_type, content_id) => {
  const folderIds = await findFolderIdsForStarredContent(content_type, content_id);
  if (folderIds.length === 0) {
    return unstarContent(content_type, content_id);
  }
  let last = { status: -1, message: '' };
  const ok = (s) => s === 200 || s === 201;
  for (const fid of folderIds) {
    last = await unstarContent(content_type, content_id, fid);
    if (!ok(last.status)) {
      return last;
    }
  }
  return last;
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
