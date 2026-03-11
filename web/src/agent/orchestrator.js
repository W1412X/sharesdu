import { createOpenAICompatibleClient } from './llm/openaiCompatible';
import { createDomainAgents } from './agents/domainAgents';
import { extractJsonObject, makeAgentPacket, packetsToHandoffText, safeParsePlan } from './protocol';

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

const buildPlanSystem = () => `你是 sharesdu 站内多 Agent 编排器（Orchestrator）。
目标：把用户请求分解为 1~4 个“信息获取子任务”，分别交给最合适的领域 Agent（course/article/post/user/search）执行，然后由你综合输出最终答案。

注意：
1) 只允许信息获取与解读，不允许创建/编辑/删除/发布等写操作。
2) 规划要面向“用户描述不精确/命名不规范/别名多”的现实：子任务里可以给出 query_hints 的多个候选关键词（尽量短）。
3) 领域选择规则：
   - 课程/给分/老师/考核/点名/选课：course
   - 文章内容/专栏：article
   - 帖子讨论/回复口碑：post
   - 作者主页/用户内容：user
   - 不确定或跨域兜底：search

你必须只输出 JSON（不要包含多余解释），格式如下：
{
  "intent": "info_lookup",
  "subtasks": [
    {"id":"t1","domain":"course","goal":"...","query_hints":["...","..."] }
  ],
  "merge_goal": "..."
}`;

const planSubtasks = async ({ client, cfg, history, userText, signal, onEvent }) => {
  onEvent && onEvent({ type: 'orchestrator_plan_start', at: Date.now() });
  const messages = [
    { role: 'system', content: buildPlanSystem() },
    ...(history || []).filter((m) => m && m.role && m.role !== 'tool').slice(-8),
    { role: 'user', content: `用户问题：${String(userText || '').trim()}` },
  ];
  const resp = await client.createChatCompletion({
    model: cfg.model,
    messages,
    temperature: 0.2,
    max_tokens: Math.min(800, cfg.maxTokens || 800),
    signal,
  });
  const content = resp?.choices?.[0]?.message?.content || '';
  const obj = extractJsonObject(content);
  const plan = safeParsePlan(obj);
  onEvent && onEvent({ type: 'orchestrator_plan_end', ok: !!plan, at: Date.now() });
  return plan;
};

const buildSubtaskUserText = ({ userText, subtask, handoffText }) => {
  const hints = Array.isArray(subtask?.query_hints) && subtask.query_hints.length
    ? `\nquery_hints=${subtask.query_hints.join(' | ')}`
    : '';
  const prev = String(handoffText || '').trim();
  return `你正在处理一个 Orchestrator 分配的子任务。
子任务目标：${subtask.goal}${hints}

原始用户问题：${String(userText || '').trim()}

已完成子任务的发现（供参考，可纠错/补充）：
${prev ? prev : '(无)'}

请你：优先调用 tools 获取站内数据，再总结成要点，并提供可点击站内路由链接。`;
};

const buildMergeSystem = () => `你是 sharesdu 站内多 Agent 的“最终整合器”。
你会收到多个子任务 Agent 的输出，请：
1) 合并去重，给出清晰结论与条目列表（必要时按重要性排序）。
2) 严禁编造：只基于子任务输出内容总结；不确定时说明信息不足与建议补充的条件。
3) 使用 Markdown 输出。
4) 站内路由必须是可点击链接，使用 "[#/path](#/path)" 形式。`;

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

    // 1) 先尝试规划子任务（多 Agent）
    let plan = null;
    try {
      plan = await planSubtasks({ client, cfg, history, userText, signal, onEvent });
    } catch (e) {
      // 规划失败不影响：回退到单领域路由
      onEvent && onEvent({ type: 'orchestrator_plan_error', message: e?.message || String(e), at: Date.now() });
    }

    // 2) 无有效 plan：沿用旧单领域逻辑
    if (!plan) {
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
        if (primary.id !== 'search') {
          onEvent && onEvent({ type: 'orchestrator_fallback', from: primary.id, to: 'search', at: Date.now() });
          result = await run(agents.search);
        } else {
          throw e;
        }
      }
      onEvent && onEvent({ type: 'orchestrator_done', mode: 'single', domain, at: Date.now() });
      return { ...result, domain };
    }

    // 3) 有 plan：按子任务顺序串行执行（信息获取类通常依赖前序发现）
    onEvent && onEvent({ type: 'orchestrator_route', domain: 'multi', at: Date.now() });
    onEvent && onEvent({ type: 'orchestrator_plan', plan, at: Date.now() });

    const packets = [];
    for (const subtask of plan.subtasks) {
      const agent = agents[subtask.domain] || agents.search;
      onEvent && onEvent({ type: 'agent_selected', agent: agent.id, domain: agent.domain, at: Date.now(), subtask });
      onEvent && onEvent({ type: 'subtask_start', id: subtask.id, domain: subtask.domain, goal: subtask.goal, at: Date.now() });

      const handoffText = packetsToHandoffText(packets);
      const subUserText = buildSubtaskUserText({ userText, subtask, handoffText });

      const started_at = Date.now();
      let result = null;
      try {
        result = await agent.run({
          client,
          cfg,
          history,
          userText: subUserText,
          signal,
          onToolStart,
          onToolResult,
          onEvent,
        });
      } catch (e) {
        // 子任务失败：回退一次 search
        if (agent.id !== 'search') {
          onEvent && onEvent({ type: 'orchestrator_fallback', from: agent.id, to: 'search', at: Date.now(), subtask });
          result = await agents.search.run({
            client,
            cfg,
            history,
            userText: subUserText,
            signal,
            onToolStart,
            onToolResult,
            onEvent,
          });
        } else {
          throw e;
        }
      }
      const ended_at = Date.now();
      const packet = makeAgentPacket({
        id: subtask.id,
        domain: subtask.domain,
        goal: subtask.goal,
        result,
        started_at,
        ended_at,
      });
      packets.push(packet);
      onEvent && onEvent({ type: 'subtask_end', id: subtask.id, domain: subtask.domain, ok: true, at: Date.now() });
    }

    // 4) 最终综合（不再调用 tools）
    onEvent && onEvent({ type: 'orchestrator_merge_start', at: Date.now() });
    const mergeMessages = [
      { role: 'system', content: buildMergeSystem() },
      { role: 'user', content: `原始用户问题：${String(userText || '').trim()}` },
      {
        role: 'user',
        content: `子任务输出（请综合）：\n\n${packets
          .map((p) => `## ${p.id} (${p.domain})\n目标：${p.goal}\n\n${p.final.content}`)
          .join('\n\n')}`,
      },
      { role: 'user', content: `综合目标：${plan.merge_goal}` },
    ];
    const mergeResp = await client.createChatCompletion({
      model: cfg.model,
      messages: mergeMessages,
      temperature: Math.max(0.2, Math.min(0.6, cfg.temperature ?? 0.4)),
      max_tokens: cfg.maxTokens,
      signal,
    });
    const finalMsg = mergeResp?.choices?.[0]?.message || { role: 'assistant', content: '(无输出)' };
    onEvent && onEvent({ type: 'orchestrator_merge_end', at: Date.now() });
    onEvent && onEvent({ type: 'orchestrator_done', mode: 'multi', at: Date.now() });
    return { final: finalMsg, messages: [], toolLogs: packets.flatMap((p) => p.toolLogs || []), packets, domain: 'multi' };
  };

  return { handle };
};
