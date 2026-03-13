import { createOpenAICompatibleClient } from './llm/openaiCompatible';
import { createDomainAgents } from './agents/domainAgents';
import { createSiteDocsAgent } from './agents/siteDocsAgent';
import { runIntentRouter } from './agents/intentRouterAgent';

const OFF_TOPIC_MESSAGE = `我是 ShareSdu 站内助手，主要回答与课程、文章、帖子、学习资料等校园生活相关的问题，以及本站的使用与政策说明。其他方面的问题建议您到通用 AI 平台咨询。`;

export const createOrchestrator = () => {
  const domainAgents = createDomainAgents();
  const siteDocsAgent = createSiteDocsAgent();

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

    const { intents, domain: routerDomain } = await runIntentRouter({
      client,
      cfg,
      userText,
      history,
      signal,
      onEvent,
    });

    const hasOffTopic = intents.includes('off_topic');
    const hasSiteDocs = intents.includes('site_docs');
    const hasSiteQuery = intents.includes('site_query');
    const onlyOffTopic = hasOffTopic && !hasSiteDocs && !hasSiteQuery;

    if (onlyOffTopic) {
      onEvent && onEvent({ type: 'intent_dispatch', intent: 'off_topic', at: Date.now() });
      onEvent && onEvent({ type: 'orchestrator_done', intents, at: Date.now() });
      return {
        final: { role: 'assistant', content: OFF_TOPIC_MESSAGE },
        messages: [],
        toolLogs: [],
        domain: 'off_topic',
        intents,
      };
    }

    const runAgent = (agent) =>
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

    const parts = [];
    let allToolLogs = [];
    let domain = null;

    if (hasSiteDocs) {
      onEvent && onEvent({ type: 'intent_dispatch', intent: 'site_docs', at: Date.now() });
      onEvent && onEvent({ type: 'agent_run_start', agent_id: 'site_docs', domain: '本站说明与政策', at: Date.now() });
      try {
        const res = await runAgent(siteDocsAgent);
        if (res?.final?.content) parts.push({ label: '本站说明与政策', content: res.final.content });
        if (res?.toolLogs?.length) allToolLogs = allToolLogs.concat(res.toolLogs);
      } catch (e) {
        parts.push({ label: '本站说明与政策', content: `处理时出错：${e?.message || '未知错误'}` });
      }
      onEvent && onEvent({ type: 'agent_run_end', agent_id: 'site_docs', at: Date.now() });
    }

    if (hasSiteQuery) {
      onEvent && onEvent({ type: 'intent_dispatch', intent: 'site_query', at: Date.now() });
      domain = routerDomain || 'search';
      onEvent && onEvent({ type: 'orchestrator_route', domain, at: Date.now() });
      const primary = domainAgents[domain] || domainAgents.search;
      onEvent && onEvent({ type: 'agent_selected', agent: primary.id, domain: primary.domain, at: Date.now() });
      onEvent && onEvent({ type: 'agent_run_start', agent_id: primary.id, domain: primary.domain, at: Date.now() });
      let result = null;
      try {
        result = await runAgent(primary);
      } catch (e) {
        if (primary.id !== 'search') {
          onEvent && onEvent({ type: 'orchestrator_fallback', from: primary.id, to: 'search', at: Date.now() });
          result = await runAgent(domainAgents.search);
        } else {
          throw e;
        }
      }
      onEvent && onEvent({ type: 'agent_run_end', agent_id: primary.id, at: Date.now() });
      if (result?.final?.content) parts.push({ label: '站内查询', content: result.final.content });
      if (result?.toolLogs?.length) allToolLogs = allToolLogs.concat(result.toolLogs);
      if (!domain) domain = primary.domain;
    }

    let finalContent = '';
    if (parts.length === 1) {
      finalContent = parts[0].content;
    } else if (parts.length > 1) {
      onEvent && onEvent({ type: 'agent_merge', parts: parts.map((p) => p.label), at: Date.now() });
      finalContent = parts.map((p) => `## ${p.label}\n\n${p.content}`).join('\n\n');
    }

    onEvent && onEvent({ type: 'orchestrator_done', domain, intents, at: Date.now() });

    return {
      final: { role: 'assistant', content: finalContent },
      messages: [],
      toolLogs: allToolLogs,
      domain: domain || (hasSiteDocs ? 'site_docs' : undefined),
      intents,
    };
  };

  return { handle };
};
