import { selfDefineLocalStorage } from '@/utils/localStorage';

const STORAGE_KEY = 'agent.llm.config';

export const getDefaultAgentLLMConfig = () => ({
  provider: 'openai_compatible',
  baseUrl: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'gpt-4o-mini',
  temperature: 0.2,
  maxTokens: 800,
});

export const getAgentLLMConfig = () => {
  try {
    const stored = selfDefineLocalStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return getDefaultAgentLLMConfig();
    }
    const parsed = JSON.parse(stored);
    return { ...getDefaultAgentLLMConfig(), ...parsed };
  } catch {
    return getDefaultAgentLLMConfig();
  }
};

export const setAgentLLMConfig = (patch) => {
  const next = { ...getAgentLLMConfig(), ...patch };
  selfDefineLocalStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
};

export const clearAgentLLMConfig = () => {
  selfDefineLocalStorage.removeItem(STORAGE_KEY);
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

