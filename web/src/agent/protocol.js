/**
 * Agent 通信协议（轻量版 / MCP 风格）
 * - 意图类型、事件名、Agent 请求/响应、Tool 返回形状
 * - 采用运行时软校验 + 兜底
 */

export const AGENT_DOMAINS = /** @type {const} */ ([
  'course',
  'article',
  'post',
  'user',
  'search',
]);

export const isAgentDomain = (d) => AGENT_DOMAINS.includes(d);

/** 顶层意图类型（IntentRouter 输出） */
export const INTENT_TYPES = /** @type {const} */ ([
  'site_query',  // 站内信息查询（课程、文章、帖子、用户等）
  'site_docs',   // 本站设计/政策/开发相关
  'off_topic',   // 与本站无关
]);

export const isIntentType = (t) => INTENT_TYPES.includes(t);

/** 事件类型（onEvent payload.type） */
export const EVENT_TYPES = /** @type {const} */ ({
  // 意图层
  intent_router_start: 'intent_router_start',
  intent_router_end: 'intent_router_end',
  intent_router_result: 'intent_router_result',
  // 调度层
  intent_dispatch: 'intent_dispatch',
  orchestrator_route: 'orchestrator_route',
  agent_selected: 'agent_selected',
  agent_merge: 'agent_merge',
  orchestrator_start: 'orchestrator_start',
  orchestrator_done: 'orchestrator_done',
  orchestrator_fallback: 'orchestrator_fallback',
  // Agent 执行层
  agent_run_start: 'agent_run_start',
  agent_run_end: 'agent_run_end',
  // LLM 层
  llm_round_start: 'llm_round_start',
  llm_request_start: 'llm_request_start',
  llm_request_end: 'llm_request_end',
  llm_tool_calls: 'llm_tool_calls',
  llm_final: 'llm_final',
  llm_invalid: 'llm_invalid',
  // 工具层
  tool_start: 'tool_start',
  tool_end: 'tool_end',
});

/**
 * AgentRequest（Orchestrator -> Agent 入参形状）
 * @typedef {{
 *   request_id?: string;
 *   user_text: string;
 *   history?: Array<{ role: 'user'|'assistant'; content: string }>;
 *   constraints?: { read_only?: boolean };
 * }} AgentRequest
 */

/**
 * AgentResponse（Agent -> Orchestrator 出参形状）
 * @typedef {{
 *   domain?: string;
 *   intents?: string[];
 *   assistant_message: { role: 'assistant'; content: string };
 *   tool_logs?: Array<{ name: string; args: object; result: object; tool_call_id?: string }>;
 *   error?: string;
 * }} AgentResponse
 */

/**
 * Tool 统一返回形状：{ ok: boolean, data?: object, error?: string }
 * 批量工具 data 约定：{ results: [...], _meta?: { requested_count, success_count } }
 */

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

/**
 * 解析 IntentRouter 输出，期望 { intents: string[], summary?: string, domain?: string }
 * domain 仅当 intents 含 site_query 时有效，用于选择功能 Agent：course|article|post|user|search
 * @param {string} text LLM 回复文本
 * @returns {{ intents: string[], summary?: string, domain?: string } | null}
 */
export const parseIntentRouterOutput = (text) => {
  const obj = extractJsonObject(text);
  if (!obj || !Array.isArray(obj.intents)) return null;
  const intents = obj.intents.filter(isIntentType);
  if (!intents.length) return null;
  const domain = isAgentDomain(obj.domain) ? obj.domain : undefined;
  return {
    intents,
    summary: typeof obj.summary === 'string' ? obj.summary : undefined,
    domain,
  };
};
