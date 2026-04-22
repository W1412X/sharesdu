/**
 * 私聊对端/消息 id 与路由、接口中的 number | string 统一为 string，避免 Map 去重、watch 因类型变化误触发。
 */
export function normPeerId(v) {
  if (v == null || v === '') return null;
  return String(v);
}

export function normMessageId(v) {
  if (v == null || v === '') return '';
  return String(v);
}
