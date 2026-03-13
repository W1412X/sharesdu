import { parseIntentRouterOutput } from '../protocol';

const INTENT_ROUTER_SYSTEM = `你是 ShareSdu 站内助手的意图分类器。根据用户输入，判断属于以下哪一类（可多选），并只输出一个 JSON 对象，不要其他解释。

意图类型：
1. site_query：站内信息查询。包括课程、老师、学习、资料、文章、帖子、回复、用户、选课、给分、校园生活等与本站内容检索相关的问题。
2. site_docs：与本站的设计/政策/开发相关。包括隐私政策、入站须知、关于我们、如何参与开发、API、开发者文档、平台规则等。
3. off_topic：与本站无关的话题。如通用知识、写诗、数学题、其他网站或产品等。

当 intents 包含 site_query 时，必须同时输出 domain，表示应派发的功能 Agent（由你根据用户问题语义判断）：
- course：课程、给分、选课、老师、学分、考核等
- article：文章、博客、笔记、资源等
- post：帖子、问答、讨论、回复等
- user：用户、作者、主页等
- search：无法明确归入上述或需跨类检索时用 search

输出格式（仅此 JSON，不要 markdown 包裹或前后文字）：
{"intents": ["site_query"], "domain": "course"}
或
{"intents": ["site_query", "site_docs"], "summary": "用户同时问了选课和隐私政策", "domain": "course"}

规则：
- 若用户问的是站内有什么课、某老师给分、找资料/文章/帖子等，选 site_query，并根据问题主体选择 domain。
- 若用户问的是**本段对话本身**的内容（如：我上一句/上一次问了什么、刚才我说了什么、总结我们聊了什么、你刚才说了啥、上一轮我问了啥），必须选 site_query，domain 填 search。这类问题需结合对话历史回答，不可归为 off_topic。
- 若用户问本站怎么用、政策、隐私、关于、开发文档等，选 site_docs。
- 若明显与本站无关（如“写一首诗”“解方程”），选 off_topic。
- 可多选：例如既问选课又问隐私，则 intents 为 ["site_query", "site_docs"]，且若有 site_query 必须带 domain。
- intents 必须至少包含一项；summary 可选；有 site_query 时 domain 必填且只能为 course|article|post|user|search 之一。`;

/**
 * 调用 LLM 做意图识别，返回 { intents, summary? }
 * @param {{ client: { createChatCompletion }, cfg: object, userText: string, history?: array, signal?: AbortSignal }} opts
 * @returns {Promise<{ intents: string[], summary?: string }>}
 */
export const runIntentRouter = async ({ client, cfg, userText, history = [], signal, onEvent }) => {
  onEvent && onEvent({ type: 'intent_router_start', at: Date.now() });

  const messages = [
    { role: 'system', content: INTENT_ROUTER_SYSTEM },
    ...history.slice(-4).map((m) => ({ role: m.role, content: m.content || '' })),
    { role: 'user', content: userText },
  ];

  let parsed = null;
  try {
    const resp = await client.createChatCompletion({
      model: cfg.model,
      messages,
      temperature: 0.1,
      max_tokens: 256,
      signal,
    });
    const content = resp?.choices?.[0]?.message?.content || '';
    parsed = parseIntentRouterOutput(content);
  } catch (e) {
    onEvent && onEvent({ type: 'intent_router_end', intents: null, error: e?.message, at: Date.now() });
    return { intents: ['site_query'], summary: undefined, domain: 'search' };
  }

  if (!parsed) {
    parsed = { intents: ['site_query'], summary: undefined, domain: 'search' };
  }
  if (parsed.intents.includes('site_query') && !parsed.domain) {
    parsed = { ...parsed, domain: 'search' };
  }

  onEvent && onEvent({
    type: 'intent_router_result',
    intents: parsed.intents,
    summary: parsed.summary,
    domain: parsed.domain,
    at: Date.now(),
  });
  onEvent && onEvent({ type: 'intent_router_end', intents: parsed.intents, at: Date.now() });

  return parsed;
};
