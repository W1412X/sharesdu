/**
 * Agent 通信协议（轻量版）
 * - 仅用于站内信息获取单 Agent 的领域路由与数据传递
 * - 不引入额外依赖，采用运行时软校验 + 兜底
 */

export const AGENT_DOMAINS = /** @type {const} */ ([
  'course',
  'article',
  'post',
  'user',
  'search',
]);

export const isAgentDomain = (d) => AGENT_DOMAINS.includes(d);

const asString = (v, fallback = '') => {
  try {
    if (v == null) return fallback;
    return String(v);
  } catch {
    return fallback;
  }
};

/**
 * 尝试从 LLM 文本中提取 JSON（允许前后有解释性文字）
 */
export const extractJsonObject = (text) => {
  const s = asString(text, '').trim();
  if (!s) return null;
  const first = s.indexOf('{');
  const last = s.lastIndexOf('}');
  if (first === -1 || last === -1 || last <= first) return null;
  const candidate = s.slice(first, last + 1);
  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
};
