import { selfDefineLocalStorage } from '@/utils/localStorage';

export const AGENT_LLM_CONFIG_STORAGE_KEY = 'agent.llm.config';
export const AGENT_LLM_CONFIG_VERSION = 2;

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
    20,
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
    maxTokens: clampNumber(raw.maxTokens, 64, 8192, defaults.maxTokens),
    maxRounds: clampNumber(raw.maxRounds, 1, 32, defaults.maxRounds),
    contextTurns,
    contextRounds: contextTurns,
    structuredMemory: raw.structuredMemory !== false,
    memoryNotesLimit: clampNumber(raw.memoryNotesLimit, 0, 50, defaults.memoryNotesLimit),
    memoryEntityLimit: clampNumber(raw.memoryEntityLimit, 0, 50, defaults.memoryEntityLimit),
  };
};

export const getDefaultAgentLLMConfig = () => ({
  version: AGENT_LLM_CONFIG_VERSION,
  provider: 'openai_compatible',
  baseUrl: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'gpt-4o-mini',
  temperature: 0.2,
  maxTokens: 800,
  maxRounds: 16,
  /** 上下文记忆轮数：请求时携带最近 n 轮（每轮=1条用户+1条助手）对话，0 表示不携带历史 */
  contextTurns: 6,
  contextRounds: 6,
  structuredMemory: true,
  memoryNotesLimit: 10,
  memoryEntityLimit: 8,
});

export const getAgentLLMConfig = () => {
  try {
    const stored = selfDefineLocalStorage.getItem(AGENT_LLM_CONFIG_STORAGE_KEY);
    if (!stored) {
      return getDefaultAgentLLMConfig();
    }
    const parsed = JSON.parse(stored);
    const next = normalizeAgentLLMConfig(parsed);
    if (JSON.stringify(parsed) !== JSON.stringify(next)) {
      selfDefineLocalStorage.setItem(AGENT_LLM_CONFIG_STORAGE_KEY, JSON.stringify(next));
    }
    return next;
  } catch {
    return getDefaultAgentLLMConfig();
  }
};

export const normalizeAgentLLMConfig = (raw) => normalizeBaseConfig(raw);

export const setAgentLLMConfig = (patch) => {
  const next = normalizeAgentLLMConfig({ ...getAgentLLMConfig(), ...(patch && typeof patch === 'object' ? patch : {}) });
  selfDefineLocalStorage.setItem(AGENT_LLM_CONFIG_STORAGE_KEY, JSON.stringify(next));
  return next;
};

export const clearAgentLLMConfig = () => {
  selfDefineLocalStorage.removeItem(AGENT_LLM_CONFIG_STORAGE_KEY);
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
