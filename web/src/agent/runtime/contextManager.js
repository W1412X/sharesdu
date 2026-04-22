import { AGENT_LLM_LIMITS } from '../config';

const DEFAULT_CONTEXT_LIMITS = {
  contextTurns: 8,
  memoryNotesLimit: 12,
  memoryEntityLimit: 32,
};

const clampInt = (value, min, max, fallback) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
};

const clip = (text, maxLen = 180) => {
  const value = String(text || '').trim().replace(/\s+/g, ' ');
  if (!value) return '';
  if (value.length <= maxLen) return value;
  return `${value.slice(0, Math.max(0, maxLen - 1)).trimEnd()}…`;
};

const extractState = (sessionState) => {
  if (!sessionState) return null;
  if (typeof sessionState.toJSON === 'function') return sessionState.toJSON();
  if (sessionState.state && typeof sessionState.state === 'object') return sessionState.state;
  return sessionState;
};

const stringifyEntity = (entity) => {
  if (entity == null) return '';
  if (typeof entity === 'string') return clip(entity, 48);
  if (typeof entity !== 'object') return clip(String(entity), 48);
  return clip(entity.name || entity.title || entity.text || entity.value || entity.label || entity.id || '', 48);
};

const stringifyFilterValue = (value) => {
  if (Array.isArray(value)) return value.map((item) => stringifyFilterValue(item)).filter(Boolean).join('、');
  if (value && typeof value === 'object') return Object.entries(value).map(([k, v]) => `${k}:${stringifyFilterValue(v)}`).filter(Boolean).join('；');
  return clip(value, 48);
};

const buildMemoryLines = (state, cfg) => {
  const memory = state?.memory && typeof state.memory === 'object' ? state.memory : {};
  const lines = [];
  if (state?.last_route?.domain || state?.last_route?.intents) {
    const intents = Array.isArray(state.last_route?.intents) ? state.last_route.intents.join(',') : '';
    const routeText = [state.last_route?.domain ? `领域=${state.last_route.domain}` : '', intents ? `意图=${intents}` : '']
      .filter(Boolean)
      .join('；');
    if (routeText) lines.push(`- 最近路由：${routeText}`);
  }
  if (state?.last_plan?.objective) {
    lines.push(`- 最近计划：${clip(state.last_plan.objective, 120)}`);
  }
  if (state?.last_error?.message) {
    lines.push(`- 最近错误：${clip(state.last_error.message, 120)}`);
  }
  if (memory.summary) {
    lines.push(`- 当前摘要：${clip(memory.summary, 180)}`);
  }
  if (memory.last_user_text) {
    lines.push(`- 最近提问：${clip(memory.last_user_text, 120)}`);
  }
  if (memory.last_answer) {
    lines.push(`- 最近回答：${clip(memory.last_answer, 120)}`);
  }
  const confirmedEntities = Array.isArray(memory.confirmed_entities)
    ? memory.confirmed_entities.map((item) => stringifyEntity(item)).filter(Boolean).slice(0, cfg.memoryEntityLimit)
    : [];
  if (confirmedEntities.length) {
    lines.push(`- 已确认实体：${confirmedEntities.join('、')}`);
  }
  const filters = memory.filters && typeof memory.filters === 'object' ? memory.filters : {};
  const filterPairs = Object.entries(filters)
    .map(([key, value]) => `${key}=${stringifyFilterValue(value)}`)
    .filter((item) => !item.endsWith('='));
  if (filterPairs.length) {
    lines.push(`- 已知筛选：${filterPairs.join('；')}`);
  }
  const notes = Array.isArray(memory.notes) ? memory.notes : [];
  const noteLines = notes
    .slice(0, cfg.memoryNotesLimit)
    .map((item) => clip(item?.text || item?.note || item, 120))
    .filter(Boolean);
  if (noteLines.length) {
    lines.push(`- 最近备注：${noteLines.join(' | ')}`);
  }
  return lines;
};

export class AgentContextManager {
  constructor(limits = {}) {
    this.limits = {
      ...DEFAULT_CONTEXT_LIMITS,
      ...(limits && typeof limits === 'object' ? limits : {}),
    };
  }

  normalizeConfig(cfg = {}) {
    const contextTurns = clampInt(
      cfg.contextTurns ?? cfg.contextRounds,
      0,
      AGENT_LLM_LIMITS.contextTurns,
      this.limits.contextTurns,
    );
    return {
      contextTurns,
      structuredMemory: cfg.structuredMemory !== false,
      memoryNotesLimit: clampInt(cfg.memoryNotesLimit, 0, AGENT_LLM_LIMITS.memoryNotesLimit, this.limits.memoryNotesLimit),
      memoryEntityLimit: clampInt(cfg.memoryEntityLimit, 0, AGENT_LLM_LIMITS.memoryEntityLimit, this.limits.memoryEntityLimit),
    };
  }

  buildHistory(messages = [], cfg = {}) {
    const normalized = this.normalizeConfig(cfg);
    const chatMessages = (Array.isArray(messages) ? messages : [])
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant'))
      .map((m) => ({
        role: m.role,
        content: String(m.content || '').trim(),
      }))
      .filter((m) => m.content);

    const limit = normalized.contextTurns * 2;
    if (!limit) return [];
    return chatMessages.slice(-limit);
  }

  buildMemoryMessage(sessionState, cfg = {}) {
    const normalized = this.normalizeConfig(cfg);
    if (!normalized.structuredMemory) return null;
    const state = extractState(sessionState);
    const lines = buildMemoryLines(state, normalized);
    if (!lines.length) return null;
    return {
      role: 'system',
      content: [
        '【结构化会话记忆】',
        ...lines,
        '说明：如果历史中已经包含这些信息，优先直接复用；只有用户明确要求重新检索，或信息明显过期时再查新数据。',
      ].join('\n'),
    };
  }

  buildInputContext({ messages = [], sessionState, cfg = {} } = {}) {
    const normalized = this.normalizeConfig(cfg);
    const history = this.buildHistory(messages, normalized);
    const memoryMessage = this.buildMemoryMessage(sessionState, normalized);
    return {
      history,
      memoryMessage,
      config: normalized,
      summary: memoryMessage?.content || '',
    };
  }

  updateSessionState(sessionState, { cfg = {}, userText = '', assistantText = '', plan, intents, domain } = {}) {
    if (!sessionState) return sessionState;
    const normalized = this.normalizeConfig(cfg);
    const state = sessionState;
    const summaryParts = [];
    if (domain) summaryParts.push(`领域=${domain}`);
    if (Array.isArray(intents) && intents.length) summaryParts.push(`意图=${intents.join(',')}`);
    if (plan?.objective) summaryParts.push(`计划=${plan.objective}`);
    const answer = clip(assistantText, 180);
    if (answer) summaryParts.push(`结论=${answer}`);
    const summary = summaryParts.join('；');
    if (summary) {
      state.setMemorySummary(summary);
      state.bumpNotes(summary, normalized.memoryNotesLimit);
    }
    const trimmedUser = clip(userText, 160);
    if (trimmedUser) {
      state.mergeMemory({ last_user_text: trimmedUser });
    }
    if (answer) {
      state.mergeMemory({ last_answer: answer });
    }
    if (domain || Array.isArray(intents) || plan) {
      const nextConfirmed = Array.isArray(state.state?.memory?.confirmed_entities)
        ? [...state.state.memory.confirmed_entities]
        : [];
      state.mergeMemory({
        confirmed_entities: nextConfirmed.slice(0, normalized.memoryEntityLimit),
      });
    }
    return state;
  }
}

export const createAgentContextManager = (limits) => new AgentContextManager(limits);
