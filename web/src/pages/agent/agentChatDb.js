/**
 * Agent 会话持久化：使用 Dexie(IndexedDB)，与项目已有 sharesdu DB 共用，通过 version(2) 增加表。
 */
import Dexie from 'dexie';

const db = new Dexie('sharesdu');
// 仅新增 version(2) 表，不重写 version(1)；与 utils/history.js 共用 DB，Dexie 升级会保留已有表
db.version(2).stores({
  agent_sessions: '++id,updated_at',
  agent_messages: '++id,session_id,created_at',
});

const SESSIONS = 'agent_sessions';
const MESSAGES = 'agent_messages';
const TITLE_MAX = 30;
const DEFAULT_TITLE = '新对话';

export async function listSessions(limit = 50) {
  return db[SESSIONS].orderBy('updated_at').reverse().limit(limit).toArray();
}

export async function getSession(sessionId) {
  return db[SESSIONS].get(sessionId);
}

export async function getMessages(sessionId) {
  const rows = await db[MESSAGES].where('session_id').equals(sessionId).sortBy('created_at');
  return rows.map((r) => ({
    id: r.id,
    role: r.role,
    content: r.content || '',
    created_at: r.created_at,
  }));
}

export async function createSession(title = DEFAULT_TITLE) {
  const now = Date.now();
  const id = await db[SESSIONS].add({
    title: String(title).slice(0, TITLE_MAX) || DEFAULT_TITLE,
    created_at: now,
    updated_at: now,
  });
  return id;
}

export async function updateSession(sessionId, patch) {
  await db[SESSIONS].update(sessionId, patch);
}

export async function addMessage(sessionId, role, content = '') {
  const now = Date.now();
  const id = await db[MESSAGES].add({
    session_id: sessionId,
    role,
    content: String(content),
    created_at: now,
  });
  await db[SESSIONS].update(sessionId, { updated_at: now });
  return id;
}

export async function updateMessageContent(messageId, content) {
  await db[MESSAGES].update(messageId, { content: String(content) });
}

export async function deleteSession(sessionId) {
  await db[MESSAGES].where('session_id').equals(sessionId).delete();
  await db[SESSIONS].delete(sessionId);
}

export { DEFAULT_TITLE, TITLE_MAX };
