/**
 * 私信会话与消息本地持久化（IndexedDB + Dexie）
 *
 * 维护说明：
 * - 按 `selfUserId` 分区：换账号登录时 `ensureSelfUser` 会清空表，避免串数据。
 * - 会话表 `ChatSession`：侧栏列表、最后一条预览。
 * - 消息表 `ChatMessage`：按 message id 主键、peerId 索引，便于按会话拉取/增量写入。
 * - 发消息/轮询/全量拉取后调用 `putMessage` / `putMessagesForPeer` 即可；无需手动维护版本号。
 * - `meta` 键 `nextHistoryPage:{peerId}`：与「向上翻更早消息」的下一页 `page` 参数对齐；全量/翻页后由 `setNextHistoryPage` 写入。
 */
import Dexie from 'dexie';
import { normMessageId, normPeerId } from '@/utils/chatIds';

const db = new Dexie('sharesduChatV1');

db.version(1).stores({
  meta: 'key',
  sessions: 'id, lastMsgAt',
  messages: 'id, peerId, sentAt',
});

function nowIso() {
  return new Date().toISOString();
}

export async function ensureSelfUser(selfUserId) {
  if (selfUserId == null || selfUserId === '') return;
  const id = String(selfUserId);
  const cur = await db.meta.get('selfUserId');
  if (cur && cur.value === id) return;
  await db.transaction('rw', db.sessions, db.messages, async () => {
    await db.sessions.clear();
    await db.messages.clear();
  });
  await db.meta.put({ key: 'selfUserId', value: id });
  await db.meta.put({ key: 'updatedAt', value: nowIso() });
}

/**
 * 会话行（id = 对端 userId）
 * @param {Object} row
 */
export async function putSessionRow(row) {
  await db.sessions.put({
    id: String(row.id),
    name: row.name,
    lastContent: row.lastContent,
    lastAt: row.lastAt,
    lastIsSelf: !!row.lastIsSelf,
    unread: Number(row.unread) || 0,
    lastMsgAt: row.lastMsgAt || row.lastAt,
    updatedAt: nowIso(),
  });
}

export async function putSessionRowsFromUi(users) {
  for (const u of users) {
    await putSessionRow({
      id: u.id,
      name: u.name,
      lastContent: u.lastMsg?.content,
      lastAt: u.lastMsg?.rawTime || u.lastMsg?.time,
      lastIsSelf: u.lastMsg?.isSelf,
      unread: u.msgNum,
      lastMsgAt: u.lastMsg?.rawTime,
    });
  }
}

/**
 * 与 API 行一致（chat_users 元素）
 */
export async function putSessionFromApiRow(r) {
  if (!r) return;
  const last = r.last_message || {};
  await putSessionRow({
    id: r.user_id,
    name: r.username,
    lastContent: last.content,
    lastAt: last.sent_at,
    lastIsSelf: !!last.is_sender,
    unread: Number(r.unread_count) || 0,
    lastMsgAt: last.sent_at,
  });
}

/**
 * 单条消息（展示结构 + 存库）
 * peerId: 对端 user id
 */
export async function putMessage(selfUserId, peerId, msg) {
  await ensureSelfUser(selfUserId);
  const p = String(peerId);
  await db.messages.put({
    id: String(msg.id),
    peerId: p,
    content: msg.content,
    sentAt: msg.time || msg.sentAt,
    isSelf: !!msg.isSelf,
    ifRead: msg.ifRead != null ? !!msg.ifRead : true,
    userName: msg.userName,
    userId: String(msg.userId),
    updatedAt: nowIso(),
  });
}

export async function putMessagesForPeer(selfUserId, peerId, messages, { clearPeer = false } = {}) {
  await ensureSelfUser(selfUserId);
  const p = String(peerId);
  if (clearPeer) {
    await db.messages.where('peerId').equals(p).delete();
  }
  const rows = (messages || []).map((m) => ({
    id: String(m.id),
    peerId: p,
    content: m.content,
    sentAt: m.time,
    isSelf: !!m.isSelf,
    ifRead: m.ifRead != null ? !!m.ifRead : true,
    userName: m.userName,
    userId: String(m.userId),
    updatedAt: nowIso(),
  }));
  if (rows.length) await db.messages.bulkPut(rows);
}

/**
 * 按时间正序
 */
export async function getMessagesForPeerOrderByTime(peerId) {
  const p = String(peerId);
  return db.messages.where('peerId').equals(p).sortBy('sentAt');
}

export async function getSessionListSorted() {
  return db.sessions
    .orderBy('lastMsgAt')
    .reverse()
    .toArray();
}

export async function sessionRowsToChatUsers(formatRelativeTime) {
  const rows = await getSessionListSorted();
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    msgNum: r.unread,
    lastMsg: {
      content: r.lastContent,
      time: r.lastAt ? (formatRelativeTime ? formatRelativeTime(r.lastAt) : r.lastAt) : '',
      rawTime: r.lastAt,
      isSelf: r.lastIsSelf,
    },
  }));
}

/**
 * 将本地库消息行转为与页面一致的 message 对象
 */
export function rowToMessage(row) {
  return {
    id: normMessageId(row.id),
    content: row.content,
    time: row.sentAt,
    isSelf: row.isSelf,
    ifRead: row.ifRead,
    userName: row.userName,
    userId: row.userId == null ? row.userId : String(row.userId),
  };
}

/**
 * 从 history API 的 result 行生成页面消息
 */
export function mapHistoryPartToMessage(
  part,
  { selfName, selfId, peerName, peerId }
) {
  const isSelf = !!part.is_sender;
  return {
    id: normMessageId(part.message_id),
    content: part.content,
    time: part.sent_at,
    isSelf,
    ifRead: part.read != null ? !!part.read : false,
    userName: isSelf ? selfName : peerName,
    userId: normPeerId(isSelf ? selfId : peerId),
  };
}

/** loadFrontier 下一页（与 getChatHistory 的 page 一致，首次从网络拉完第一页后为 2） */
export async function getNextHistoryPage(peerId) {
  if (peerId == null || peerId === '') return 2;
  const r = await db.meta.get(`nextHistoryPage:${String(peerId)}`);
  if (!r) return 2;
  const n = parseInt(r.value, 10);
  return Number.isFinite(n) && n > 0 ? n : 2;
}

export async function setNextHistoryPage(peerId, page) {
  if (peerId == null || peerId === '') return;
  const p = Math.max(1, parseInt(page, 10) || 1);
  await db.meta.put({
    key: `nextHistoryPage:${String(peerId)}`,
    value: String(p),
  });
}

export { db as chatLocalDb };
