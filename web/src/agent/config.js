import { selfDefineLocalStorage } from '@/utils/localStorage';
import { selfDefinedSessionStorage } from '@/utils/sessionStorage';

export const AGENT_LLM_CONFIG_STORAGE_KEY = 'agent.llm.config';
export const AGENT_LLM_STORAGE_MODE_KEY = 'agent.llm.storageMode';
export const AGENT_LLM_CONFIG_VERSION = 5;
export const AGENT_LLM_LIMITS = Object.freeze({
  maxTokens: 16384,
  maxRounds: 12,
  maxToolCalls: 32,
  maxTotalTokens: 32768,
  maxTotalMs: 180000,
  maxToolResultBytes: 262144,
  toolTimeoutMs: 60000,
  toolConcurrency: 5,
  contextTurns: 16,
  memoryNotesLimit: 64,
  memoryEntityLimit: 64,
});

const clampNumber = (value, min, max, fallback) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  const rounded = Math.round(parsed);
  return Math.min(max, Math.max(min, rounded));
};

const clampFloat = (value, min, max, fallback) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
};

const normalizeBaseConfig = (raw = {}) => {
  const defaults = getDefaultAgentLLMConfig();
  const contextTurns = clampNumber(
    raw.contextTurns ?? raw.contextRounds,
    0,
    AGENT_LLM_LIMITS.contextTurns,
    defaults.contextTurns,
  );

  return {
    ...defaults,
    ...raw,
    version: AGENT_LLM_CONFIG_VERSION,
    provider: String(raw.provider || defaults.provider),
    baseUrl: String(raw.baseUrl || defaults.baseUrl),
    apiKey: String(raw.apiKey || ''),
    model: String(raw.model || defaults.model),
    temperature: clampFloat(raw.temperature, 0, 1, defaults.temperature),
    maxTokens: clampNumber(raw.maxTokens, 64, AGENT_LLM_LIMITS.maxTokens, defaults.maxTokens),
    maxRounds: clampNumber(raw.maxRounds, 1, AGENT_LLM_LIMITS.maxRounds, defaults.maxRounds),
    maxToolCalls: clampNumber(raw.maxToolCalls, 1, AGENT_LLM_LIMITS.maxToolCalls, defaults.maxToolCalls),
    maxTotalTokens: clampNumber(raw.maxTotalTokens, 512, AGENT_LLM_LIMITS.maxTotalTokens, defaults.maxTotalTokens),
    maxTotalMs: clampNumber(raw.maxTotalMs, 10000, AGENT_LLM_LIMITS.maxTotalMs, defaults.maxTotalMs),
    maxToolResultBytes: clampNumber(raw.maxToolResultBytes, 4096, AGENT_LLM_LIMITS.maxToolResultBytes, defaults.maxToolResultBytes),
    toolTimeoutMs: clampNumber(raw.toolTimeoutMs, 1000, AGENT_LLM_LIMITS.toolTimeoutMs, defaults.toolTimeoutMs),
    toolConcurrency: clampNumber(raw.toolConcurrency, 1, AGENT_LLM_LIMITS.toolConcurrency, defaults.toolConcurrency),
    // 默认浏览器持久保存；仅当历史配置显式选择 session 时才用会话存储
    storageMode: raw.storageMode === 'session' ? 'session' : 'local',
    contextTurns,
    contextRounds: contextTurns,
    structuredMemory: raw.structuredMemory !== false,
    memoryNotesLimit: clampNumber(raw.memoryNotesLimit, 0, AGENT_LLM_LIMITS.memoryNotesLimit, defaults.memoryNotesLimit),
    memoryEntityLimit: clampNumber(raw.memoryEntityLimit, 0, AGENT_LLM_LIMITS.memoryEntityLimit, defaults.memoryEntityLimit),
  };
};

export const getDefaultAgentLLMConfig = () => ({
  version: AGENT_LLM_CONFIG_VERSION,
  provider: 'openai_compatible',
  baseUrl: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'gpt-4o',
  temperature: 0.25,
  maxTokens: 4096,
  maxRounds: 8,
  maxToolCalls: 12,
  maxTotalTokens: 24000,
  maxTotalMs: 90000,
  maxToolResultBytes: 65536,
  toolTimeoutMs: 15000,
  toolConcurrency: 3,
  storageMode: 'local',
  /** 上下文记忆轮数：请求时携带最近 n 轮（每轮=1条用户+1条助手）对话，0 表示不携带历史 */
  contextTurns: 8,
  contextRounds: 8,
  structuredMemory: true,
  memoryNotesLimit: 12,
  memoryEntityLimit: 32,
});

export const getAgentLLMConfig = () => {
  try {
    const sessionValue = selfDefinedSessionStorage.getItem(AGENT_LLM_CONFIG_STORAGE_KEY);
    const localValue = selfDefineLocalStorage.getItem(AGENT_LLM_CONFIG_STORAGE_KEY);
    const stored = sessionValue || localValue;
    if (!stored) {
      return getDefaultAgentLLMConfig();
    }
    const parsed = JSON.parse(stored);
    const next = normalizeAgentLLMConfig(parsed);
    if (JSON.stringify(parsed) !== JSON.stringify(next)) {
      const storage = next.storageMode === 'local' ? selfDefineLocalStorage : selfDefinedSessionStorage;
      storage.setItem(AGENT_LLM_CONFIG_STORAGE_KEY, JSON.stringify(next));
    }
    return next;
  } catch {
    return getDefaultAgentLLMConfig();
  }
};

export const normalizeAgentLLMConfig = (raw) => normalizeBaseConfig(raw);

export const setAgentLLMConfig = (patch) => {
  const next = normalizeAgentLLMConfig({ ...getAgentLLMConfig(), ...(patch && typeof patch === 'object' ? patch : {}) });
  selfDefineLocalStorage.removeItem(AGENT_LLM_CONFIG_STORAGE_KEY);
  selfDefinedSessionStorage.removeItem(AGENT_LLM_CONFIG_STORAGE_KEY);
  const storage = next.storageMode === 'local' ? selfDefineLocalStorage : selfDefinedSessionStorage;
  storage.setItem(AGENT_LLM_CONFIG_STORAGE_KEY, JSON.stringify(next));
  selfDefineLocalStorage.setItem(AGENT_LLM_STORAGE_MODE_KEY, next.storageMode);
  return next;
};

export const clearAgentLLMConfig = () => {
  selfDefineLocalStorage.removeItem(AGENT_LLM_CONFIG_STORAGE_KEY);
  selfDefinedSessionStorage.removeItem(AGENT_LLM_CONFIG_STORAGE_KEY);
  selfDefineLocalStorage.removeItem(AGENT_LLM_STORAGE_MODE_KEY);
};

export const validateAgentLLMConfig = (cfg) => {
  if (!cfg) {
    return { ok: false, reason: 'missing_config' };
  }
  if (!cfg.baseUrl || typeof cfg.baseUrl !== 'string') {
    return { ok: false, reason: 'missing_base_url' };
  }
  if (!cfg.apiKey || typeof cfg.apiKey !== 'string') {
    return { ok: false, reason: 'missing_api_key' };
  }
  if (!cfg.model || typeof cfg.model !== 'string') {
    return { ok: false, reason: 'missing_model' };
  }
  return { ok: true };
};
