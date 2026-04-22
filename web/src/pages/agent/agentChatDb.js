/**
 * Agent 会话持久化：使用 Dexie(IndexedDB)，与项目已有 sharesdu DB 共用。
 * 聊天消息结构不变，仅给 session row 额外增加可选的 agent_state 字段。
 */
import Dexie from 'dexie';

const db = new Dexie('sharesdu');
db.version(2).stores({
  agent_sessions: '++id,updated_at',
  agent_messages: '++id,session_id,created_at',
});
db.version(3).stores({
  agent_sessions: '++id,updated_at,agent_state_updated_at',
  agent_messages: '++id,session_id,created_at',
});

const SESSIONS = 'agent_sessions';
const MESSAGES = 'agent_messages';
const TITLE_MAX = 30;
const DEFAULT_TITLE = '新对话';

const DEFAULT_AGENT_STATE = {
  version: 2,
  last_route: null,
  last_plan: null,
  last_error: null,
  memory: {
    confirmed_entities: [],
    filters: {},
    notes: [],
    summary: '',
    last_user_text: '',
    last_answer: '',
  },
};

const normalizeAgentState = (value) => {
  const raw = value && typeof value === 'object' ? value : {};
  return {
    ...DEFAULT_AGENT_STATE,
    ...raw,
    version: DEFAULT_AGENT_STATE.version,
    memory: {
      ...DEFAULT_AGENT_STATE.memory,
      ...(raw.memory && typeof raw.memory === 'object' ? raw.memory : {}),
    },
  };
};

export async function listSessions(limit = 50) {
  return db[SESSIONS].orderBy('updated_at').reverse().limit(limit).toArray();
}

export async function getSession(sessionId) {
  const row = await db[SESSIONS].get(sessionId);
  if (!row) return null;
  return {
    ...row,
    agent_state: normalizeAgentState(row.agent_state),
  };
}

export async function getSessionState(sessionId) {
  const session = await getSession(sessionId);
  return session?.agent_state || normalizeAgentState();
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
    agent_state: normalizeAgentState(),
    agent_state_updated_at: now,
  });
  return id;
}

export async function updateSession(sessionId, patch) {
  const next = { ...patch };
  if (Object.prototype.hasOwnProperty.call(next, 'agent_state')) {
    next.agent_state = normalizeAgentState(next.agent_state);
    next.agent_state_updated_at = Date.now();
  }
  await db[SESSIONS].update(sessionId, next);
}

export async function updateSessionState(sessionId, patch) {
  const current = await getSessionState(sessionId);
  const next = normalizeAgentState({
    ...current,
    ...patch,
    memory: {
      ...current.memory,
      ...(patch && typeof patch === 'object' && patch.memory && typeof patch.memory === 'object' ? patch.memory : {}),
    },
  });
  await updateSession(sessionId, { agent_state: next, updated_at: Date.now() });
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

export { DEFAULT_TITLE, TITLE_MAX, DEFAULT_AGENT_STATE, normalizeAgentState };
