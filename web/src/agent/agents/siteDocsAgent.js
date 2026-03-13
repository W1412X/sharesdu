import { SITE_DOCS_TOOLSET } from '../tools/siteDocs';
import { runToolLoop } from '../runToolLoop';

const SITE_DOCS_SYSTEM = `你是 ShareSdu 站内助手的【本站说明与政策 Agent】。
你只回答与本站设计、政策、开发相关的问题，例如：隐私政策、入站须知、关于我们、开发者文档、API 说明、如何参与开发等。
你只能通过工具 get_site_doc 获取文档内容，根据用户问题选择合适的 doc_key 拉取文档后作答。

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
2) 仅根据 get_site_doc 返回的内容回答，不编造；若文档未覆盖用户问题，如实说明并建议查看站内对应页面。
3) 可提示用户“更多详见站内 xxx 页面”或文档路径。`;

const toMessages = (history, userText, systemPrompt) => {
  const msgs = [{ role: 'system', content: systemPrompt }];
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
  async run({ client, cfg, history, userText, signal, onToolStart, onToolResult, onEvent }) {
    const messages = toMessages(history, userText, SITE_DOCS_SYSTEM);
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
