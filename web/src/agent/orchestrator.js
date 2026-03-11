import { createOpenAICompatibleClient } from './llm/openaiCompatible';
import { createDomainAgents } from './agents/domainAgents';

const routeDomain = (text) => {
  const t = String(text || '').toLowerCase();
  const courseIntent = [
    '课程',
    'course',
    '给分',
    '评分',
    '分高',
    '好过',
    '容易',
    '水',
    '老师',
    '学分',
    '选课',
    '考核',
    '点名',
    '期末',
    '平时',
  ];
  if (courseIntent.some((k) => t.includes(k))) return 'course';
  if (t.includes('文章') || t.includes('article')) return 'article';
  if (t.includes('帖子') || t.includes('post') || t.includes('回复') || t.includes('reply')) return 'post';
  if (t.includes('作者') || t.includes('用户') || t.includes('homepage')) return 'user';
  return 'search';
};

export const createOrchestrator = () => {
  const agents = createDomainAgents();

  const handle = async ({
    cfg,
    history,
    userText,
    signal,
    onToolStart,
    onToolResult,
    onEvent,
  }) => {
    onEvent && onEvent({ type: 'orchestrator_start', at: Date.now() });
    const client = createOpenAICompatibleClient({ baseUrl: cfg.baseUrl, apiKey: cfg.apiKey });
    const domain = routeDomain(userText);
    onEvent && onEvent({ type: 'orchestrator_route', domain, at: Date.now() });
    const primary = agents[domain] || agents.search;
    onEvent && onEvent({ type: 'agent_selected', agent: primary.id, domain: primary.domain, at: Date.now() });

    const run = (agent) =>
      agent.run({
        client,
        cfg,
        history,
        userText,
        signal,
        onToolStart,
        onToolResult,
        onEvent,
      });

    let result = null;
    try {
      result = await run(primary);
    } catch (e) {
      // 轻量兜底：如果领域 Agent 出错，回退到 SearchAgent 再尝试一次
      if (primary.id !== 'search') {
        onEvent && onEvent({ type: 'orchestrator_fallback', from: primary.id, to: 'search', at: Date.now() });
        result = await run(agents.search);
      } else {
        throw e;
      }
    }
    onEvent && onEvent({ type: 'orchestrator_done', domain, at: Date.now() });
    return { ...result, domain };
  };

  return { handle };
};
