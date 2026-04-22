import { createOpenAICompatibleClient } from '../llm/openaiCompatible';
import { createDomainAgents } from '../agents/domainAgents';
import { createSiteDocsAgent } from '../agents/siteDocsAgent';
import { runIntentRouter } from '../agents/intentRouterAgent';
import { AgentPlanBuilder } from './planBuilder';
import { AgentErrorPolicy } from './errorPolicy';
import { AgentContextManager } from './contextManager';

const OFF_TOPIC_MESSAGE = `我是 ShareSdu 站内助手，主要回答与课程、文章、帖子、学习资料等校园生活相关的问题，以及本站的使用与政策说明。其他方面的问题建议您到通用 AI 平台咨询。`;

export class AgentRuntime {
  constructor({
    domainAgents = createDomainAgents(),
    siteDocsAgent = createSiteDocsAgent(),
    planBuilder = new AgentPlanBuilder(),
    errorPolicy = new AgentErrorPolicy(),
    contextManager = new AgentContextManager(),
  } = {}) {
    this.domainAgents = domainAgents;
    this.siteDocsAgent = siteDocsAgent;
    this.planBuilder = planBuilder;
    this.errorPolicy = errorPolicy;
    this.contextManager = contextManager;
  }

  async handle({
    cfg,
    history,
    userText,
    signal,
    onToolStart,
    onToolResult,
    onEvent,
    sessionState,
  }) {
    onEvent && onEvent({ type: 'orchestrator_start', at: Date.now() });
    const client = createOpenAICompatibleClient({ baseUrl: cfg.baseUrl, apiKey: cfg.apiKey });
    const context = this.contextManager.buildInputContext({
      messages: history,
      sessionState,
      cfg,
    });

    const { intents, domain: routerDomain } = await runIntentRouter({
      client,
      cfg,
      userText,
      history: context.history,
      signal,
      onEvent,
    });

    const plan = this.planBuilder.build({ intents, domain: routerDomain || 'search', userText, history: context.history });
    onEvent && onEvent({ type: 'plan_ready', plan, at: Date.now() });
    onEvent && onEvent({ type: 'checkpoint', label: 'router_complete', at: Date.now() });
    sessionState && sessionState.recordRoute({ domain: plan.domain, intents });
    sessionState && sessionState.recordPlan(plan);

    const hasOffTopic = intents.includes('off_topic');
    const hasSiteDocs = intents.includes('site_docs');
    const hasSiteQuery = intents.includes('site_query');
    const onlyOffTopic = hasOffTopic && !hasSiteDocs && !hasSiteQuery;

    if (onlyOffTopic) {
      onEvent && onEvent({ type: 'intent_dispatch', intent: 'off_topic', at: Date.now() });
      this.contextManager.updateSessionState(sessionState, {
        cfg,
        userText,
        assistantText: OFF_TOPIC_MESSAGE,
        plan,
        intents,
        domain: 'off_topic',
      });
      onEvent && onEvent({ type: 'orchestrator_done', intents, plan, at: Date.now() });
      return {
        final: { role: 'assistant', content: OFF_TOPIC_MESSAGE },
        messages: [],
        toolLogs: [],
        domain: 'off_topic',
        intents,
        plan,
      };
    }

    const runAgent = (agent) =>
      agent.run({
        client,
        cfg,
        history: context.history,
        context,
        userText,
        signal,
        plan,
        onToolStart,
        onToolResult,
        onEvent,
      });

    const parts = [];
    let allToolLogs = [];
    let domain = null;
    let lastError = null;

    if (hasSiteDocs) {
      onEvent && onEvent({ type: 'intent_dispatch', intent: 'site_docs', at: Date.now() });
      onEvent && onEvent({ type: 'agent_run_start', agent_id: 'site_docs', domain: '本站说明与政策', at: Date.now() });
      try {
        const res = await runAgent(this.siteDocsAgent);
        if (res?.final?.content) parts.push({ label: '本站说明与政策', content: res.final.content });
        if (res?.toolLogs?.length) allToolLogs = allToolLogs.concat(res.toolLogs);
      } catch (error) {
        lastError = error;
        const classification = this.errorPolicy.classify(error);
        sessionState && sessionState.recordError(classification.text);
        parts.push({ label: '本站说明与政策', content: `处理时出错：${this.errorPolicy.buildUserMessage(classification, 'site_docs')}` });
        onEvent && onEvent({ type: 'error_routed', stage: 'site_docs', kind: classification.kind, retryable: classification.retryable, at: Date.now() });
      }
      onEvent && onEvent({ type: 'agent_run_end', agent_id: 'site_docs', at: Date.now() });
    }

    if (hasSiteQuery) {
      onEvent && onEvent({ type: 'intent_dispatch', intent: 'site_query', at: Date.now() });
      domain = plan.domain || 'search';
      onEvent && onEvent({ type: 'orchestrator_route', domain, at: Date.now() });
      const primary = this.domainAgents[domain] || this.domainAgents.search;
      onEvent && onEvent({ type: 'agent_selected', agent: primary.id, domain: primary.domain, at: Date.now() });
      onEvent && onEvent({ type: 'agent_run_start', agent_id: primary.id, domain: primary.domain, at: Date.now() });
      let result = null;
      try {
        result = await runAgent(primary);
      } catch (error) {
        lastError = error;
        if (this.errorPolicy.shouldFallbackToSearch(primary.id)) {
          onEvent && onEvent({ type: 'orchestrator_fallback', from: primary.id, to: 'search', at: Date.now() });
          try {
            result = await runAgent(this.domainAgents.search);
          } catch (fallbackError) {
            lastError = fallbackError;
            const classification = this.errorPolicy.classify(fallbackError);
            sessionState && sessionState.recordError(classification.text);
            parts.push({
              label: '站内查询',
              content: `处理时出错：${this.errorPolicy.buildUserMessage(classification, domain || primary.id)}`,
            });
            onEvent && onEvent({ type: 'error_routed', stage: primary.id, kind: classification.kind, retryable: classification.retryable, at: Date.now() });
          }
        } else {
          const classification = this.errorPolicy.classify(error);
          sessionState && sessionState.recordError(classification.text);
          parts.push({
            label: '站内查询',
            content: `处理时出错：${this.errorPolicy.buildUserMessage(classification, domain || primary.id)}`,
          });
          onEvent && onEvent({ type: 'error_routed', stage: primary.id, kind: classification.kind, retryable: classification.retryable, at: Date.now() });
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

    if (!finalContent && lastError) {
      const classification = this.errorPolicy.classify(lastError);
      finalContent = this.errorPolicy.buildUserMessage(classification, domain || plan.domain);
    }

    this.contextManager.updateSessionState(sessionState, {
      cfg,
      userText,
      assistantText: finalContent,
      plan,
      intents,
      domain: domain || plan.domain,
    });
    onEvent && onEvent({ type: 'checkpoint', label: 'finalize', at: Date.now() });
    onEvent && onEvent({ type: 'orchestrator_done', domain, intents, plan, at: Date.now() });

    return {
      final: { role: 'assistant', content: finalContent },
      messages: [],
      toolLogs: allToolLogs,
      domain: domain || (hasSiteDocs ? 'site_docs' : undefined),
      intents,
      plan,
    };
  }
}
