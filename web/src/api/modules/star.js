import { dealAxiosError } from "@/utils/other.js";
import axiosInstance from "../request";

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
 * 获取收藏列表
 * @param {int|null} folder_id 指定收藏夹；为 null 时返回全部收藏夹下的条目（含每条目的 folder_id）
 * @param {number} [page_index] 页码，从 1 起；省略则不在 URL 中带该参数（与历史行为一致）
 * @param {number} [page_size] 每页条数；省略则不在 URL 中带该参数
 * @returns 
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
 * 取消收藏内容
 * 新接口：传入 folder_id 时只移除该收藏夹中的记录。
 * 兼容旧后端：不传 folder_id 时请求体仅含 content_type、content_id（与历史一致）。
 *
 * @param {number} content_type 0/1/2 课程、文章、帖子
 * @param {number|string} content_id
 * @param {number|string|null|undefined} [folder_id] 传入则写入请求体
 * @returns 
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

/**
 * 分页拉取当前用户全部收藏条目（用于解析某内容所在收藏夹）
 */
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

/**
 * 查找某内容当前所在的所有收藏夹 ID（同一内容可存在于多个收藏夹）
 * @param {number} content_type
 * @param {number|string} content_id
 * @returns {Promise<number[]>}
 */
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

/**
 * 取消收藏（推荐在未持有 folder_id 时使用）：解析该内容所在全部收藏夹并逐个调用新接口；
 * 若列表中未找到记录，则回退为仅传 content 的旧版请求（兼容旧后端）。
 */
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