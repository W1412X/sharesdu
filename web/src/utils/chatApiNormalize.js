/**
 * 私信接口响应兼容：与 README 中 data/results 等字段可能不一致时统一取值。
 */

export function getChatUsersRows(response) {
  if (!response || response.status !== 200) return [];
  if (Array.isArray(response.chat_users)) return response.chat_users;
  if (Array.isArray(response.data)) return response.data;
  return [];
}

/**
 * 历史消息 results，兼容 { results } 与 { data: { results } }
 */
export function getHistoryResults(response) {
  if (!response) return [];
  if (Array.isArray(response.results)) return response.results;
  if (response.data && Array.isArray(response.data.results)) return response.data.results;
  return [];
}

export function isHistoryResponseOk(response) {
  return response && response.status === 200;
}

/**
 * 是否还有下一页：若接口返回带 next 的 data，则以 next 为准，否则以本页条数 < pageSize 为结束
 */
export function hasHistoryNextPage(response, partLength, pageSize) {
  if (!response) return false;
  const data = response.data != null ? response.data : response;
  if (data && data.next) return true;
  return partLength >= pageSize;
}
