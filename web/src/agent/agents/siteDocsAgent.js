import { SITE_DOCS_TOOLSET } from '../tools/siteDocs';
import { runToolLoop } from '../runToolLoop';

const SITE_DOCS_SYSTEM = `你是 ShareSdu 站内助手的【本站说明与政策 Agent】。
你只回答与本站设计、政策、开发相关的问题，例如：隐私政策、入站须知、关于我们、开发者文档、API 说明、如何参与开发等。
你有两类工具：
1. get_site_doc：获取文档原文内容，用于读取和总结。
2. get_site_doc_link：获取文档的站内直链，用于让用户直接点击访问。
根据用户问题选择合适的 doc_key 调用对应工具，不要自己猜链接，不要自行拼写 URL。

可用文档与 doc_key：
- intro: 项目介绍、功能、目标受众、特点、开发者生态、反馈与联系
- to_know: 入站须知、本站功能、版权与转载、禁止行为、隐私与安全
- privacy: 隐私政策（收集/使用/共享/保护/用户权利/存储/未成年人）
- about_us: 关于我们、开发者、开源仓库、加入方式
- developer/introduction: 开发者文档总览
- developer/platform/introduction、maintenance、adaptation、security、other: 平台开发
- developer/microservice/introduction、authentication、data_sharing、forms: 微服务开发
- developer/agent/introduction、development、guidelines: 自动化脚本（Agent）开发
- developer/other: 其他

要求：
1) 使用 Markdown 输出，引用文档时注明来源（如“根据《入站须知》……”）。
2) 仅根据工具返回的内容回答，不编造；若文档未覆盖用户问题，如实说明并建议查看站内对应页面。
3) 如果工具返回了 site_url，优先给出可点击的站内链接，例如 [打开文档](#/document/to_know) 或 [打开文档](#/developer?doc=introduction)。
4) 如果工具返回了 raw_url，可附上“原文”链接，但不要把 raw_url 当作唯一访问方式。`;

const formatPlanBlock = (plan) => {
  if (!plan || !Array.isArray(plan.doc_focus) || !plan.doc_focus.length) return '';
  return `\n【文档优先级】\n- ${plan.doc_focus.join('\n- ')}`;
};

const toMessages = (history, userText, systemPrompt, memoryMessage) => {
  const msgs = [{ role: 'system', content: systemPrompt }];
  if (memoryMessage && memoryMessage.content) {
    msgs.push(memoryMessage);
  }
  for (const m of history || []) {
    if (!m || !m.role) continue;
    if (m.role === 'tool') continue;
    msgs.push({ role: m.role, content: m.content || '' });
  }
  msgs.push({ role: 'user', content: userText });
  return msgs;
};

export const createSiteDocsAgent = () => ({
  id: 'site_docs',
  domain: '本站说明与政策',
  tools: SITE_DOCS_TOOLSET.tools,
  async run({ client, cfg, history, context, userText, signal, plan, onToolStart, onToolResult, onEvent }) {
    const messages = toMessages(history, userText, `${SITE_DOCS_SYSTEM}${formatPlanBlock(plan)}`, context?.memoryMessage);
    return await runToolLoop({
      client,
      model: cfg.model,
      temperature: cfg.temperature,
      max_tokens: cfg.maxTokens,
      maxRounds: cfg.maxRounds ?? 16,
      messages,
      tools: SITE_DOCS_TOOLSET.tools,
      handlers: SITE_DOCS_TOOLSET.handlers,
      signal,
      onToolStart,
      onToolResult,
      onEvent,
    });
  },
});
