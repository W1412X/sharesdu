/**
 * Agent 通信协议（轻量版）
 * - 仅用于站内信息获取 multi-agent 的编排与数据传递
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

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

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
 * 规划输出格式（Orchestrator Plan）
 * @typedef {Object} OrchestratorPlan
 * @property {string} intent
 * @property {Array<{id:string,domain:string,goal:string,query_hints?:string[]}>} subtasks
 * @property {string} merge_goal
 */

/**
 * 将 LLM 的规划输出软校验成可用 plan；失败则返回 null
 * @returns {OrchestratorPlan|null}
 */
export const safeParsePlan = (maybePlan) => {
  if (!maybePlan || typeof maybePlan !== 'object') return null;
  const intent = asString(maybePlan.intent, '').trim();
  const merge_goal = asString(maybePlan.merge_goal, '').trim();
  const subtasksRaw = Array.isArray(maybePlan.subtasks) ? maybePlan.subtasks : null;
  if (!subtasksRaw || !subtasksRaw.length) return null;

  const subtasks = subtasksRaw
    .map((t, idx) => {
      const domain = asString(t.domain, '').trim();
      const goal = asString(t.goal, '').trim();
      const id = asString(t.id, `t${idx + 1}`).trim() || `t${idx + 1}`;
      const query_hints = Array.isArray(t.query_hints)
        ? t.query_hints.map((x) => asString(x, '').trim()).filter(Boolean).slice(0, 6)
        : undefined;
      if (!isAgentDomain(domain) || !goal) return null;
      return { id, domain, goal, query_hints };
    })
    .filter(Boolean);

  if (!subtasks.length) return null;

  // 限制子任务数量，避免过长链路导致体验变差
  const limited = subtasks.slice(0, clamp(subtasks.length, 1, 4));
  return {
    intent: intent || 'info_lookup',
    subtasks: limited,
    merge_goal: merge_goal || '把各子任务结果综合成最终回答，并给出可点击站内链接。',
  };
};

/**
 * 领域 Agent 执行结果包（AgentPacket）
 * @typedef {Object} AgentPacket
 * @property {string} id
 * @property {string} domain
 * @property {string} goal
 * @property {{role:'assistant', content:string}} final
 * @property {Array<any>} toolLogs
 * @property {number} started_at
 * @property {number} ended_at
 */

export const makeAgentPacket = ({ id, domain, goal, result, started_at, ended_at }) => {
  const content = asString(result?.final?.content, '(无输出)');
  return {
    id: asString(id, ''),
    domain: asString(domain, 'search'),
    goal: asString(goal, ''),
    final: { role: 'assistant', content },
    toolLogs: Array.isArray(result?.toolLogs) ? result.toolLogs : [],
    started_at: typeof started_at === 'number' ? started_at : Date.now(),
    ended_at: typeof ended_at === 'number' ? ended_at : Date.now(),
  };
};

/**
 * 将多个 AgentPacket 压缩成可用于“后续 Agent 手递手”的摘要文本
 * 目标：短、可读、能让下一个 Agent 继续检索/纠错
 */
export const packetsToHandoffText = (packets) => {
  const list = Array.isArray(packets) ? packets : [];
  if (!list.length) return '';
  const lines = [];
  for (const p of list) {
    const title = `- [${asString(p.domain)}] ${asString(p.goal)}`.trim();
    const body = asString(p?.final?.content, '').trim();
    lines.push(title);
    if (body) {
      // 截断，避免上下文爆炸（保留可点击路由）
      lines.push(body.slice(0, 900));
    }
  }
  return lines.join('\n');
};

