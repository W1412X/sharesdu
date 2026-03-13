import { pickTools, SHARES_DU_TOOLSET } from '../tools/sharesdu';
import { runToolLoop } from '../runToolLoop';

const baseSystem = (domain) => `你是 sharesdu 站内智能助手的【${domain}功能Agent】。
你只能做“信息获取与解读”，不允许执行任何创建/编辑/删除/发布/冻结等写操作。
当需要站内数据时，优先通过可用 tools 获取；拿到数据后再总结、对比、列要点，并给出可以点击的站内路由提示（例如 #/article/<id>、#/post/<id>、#/course/<id>）。

输出格式要求（重要）：
1) 使用 Markdown 输出。
2) 站内路由必须输出为可点击链接：使用 "[文本](#/path)" 形式，例如 "[#/course/123](#/course/123)"。
3) 不要只输出裸的 "#/course/123"，否则用户无法点击跳转。

通用策略（面向所有“用户描述不精确/命名不规范/别名很多”的检索场景）：
1) 先做“意图与字段”拆解：用户想要的对象（文章/帖子/课程/作者）、约束（时间/排序/标签/评分/给分/难度/学院/教学方式等）、输出格式（列表/对比/结论）。
2) 生成“多候选查询词”：不要把整句问题当查询词；提取核心关键词，并为每个关键词生成若干变体（同义词/简称/去掉常见后缀如“课/课程/老师/给分/好过”等、空格与标点归一化）。
3) 先粗搜再精查：优先使用 search/* 或 global_search 获取候选列表；再对候选的少量 Top-N 调用 detail/list 工具拉详情字段做排序/对比。
4) 如果结果太少/太杂：放宽约束（减少过滤条件、改用更短关键词、使用 global_search 兜底），或反向用 detail 验证候选是否相关。
5) 严禁编造数据：只基于 tools 返回的字段给结论；不确定时明确说明需要更多条件或数据不足。`;

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

export const createDomainAgents = () => {
  const searchTools = pickTools(SHARES_DU_TOOLSET, [
    'global_search',
    'multi_keyword_search',
    'search_articles',
    'search_posts',
    'search_replies',
    'search_courses',
  ]);
  const articleTools = pickTools(SHARES_DU_TOOLSET, [
    ...searchTools.map((t) => t.function.name),
    'get_article_detail',
    'get_article_post_list',
    'get_article_list',
    'get_post_detail',
    'batch_articles_info',
  ]);
  const postTools = pickTools(SHARES_DU_TOOLSET, [
    ...searchTools.map((t) => t.function.name),
    'get_post_detail',
    'get_post_reply_list',
    'get_reply_detail',
    'batch_posts_info',
  ]);
  const courseTools = pickTools(SHARES_DU_TOOLSET, [
    ...searchTools.map((t) => t.function.name),
    'get_course_detail',
    'get_course_list',
    'get_course_post_list',
    'get_course_score_list',
    'batch_courses_info',
  ]);
  const userTools = pickTools(SHARES_DU_TOOLSET, [
    'get_user_homepage',
    'get_user_content_preview',
    'get_user_content_list',
    ...searchTools.map((t) => t.function.name),
  ]);

  const make = ({ id, domain, tools }) => ({
    id,
    domain,
    tools,
    async run({ client, cfg, history, userText, signal, onToolStart, onToolResult, onEvent }) {
      const messages = toMessages(history, userText, baseSystem(domain));
      return await runToolLoop({
        client,
        model: cfg.model,
        temperature: cfg.temperature,
        max_tokens: cfg.maxTokens,
        maxRounds: cfg.maxRounds ?? 16,
        messages,
        tools,
        handlers: SHARES_DU_TOOLSET.handlers,
        signal,
        onToolStart,
        onToolResult,
        onEvent,
      });
    },
  });

  return {
    search: make({ id: 'search', domain: '搜索', tools: searchTools }),
    article: make({ id: 'article', domain: '文章', tools: articleTools }),
    post: make({ id: 'post', domain: '帖子/回复', tools: postTools }),
    course: make({ id: 'course', domain: '课程', tools: courseTools }),
    user: make({ id: 'user', domain: '用户/作者', tools: userTools }),
  };
};
