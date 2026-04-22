import {
  globalSearch,
  searchArticles,
  searchPosts,
  searchReplies,
  searchCourses,
} from '@/api/modules/search';
import {
  agentCourseSearch,
  agentCourseContext,
  agentContentSearch,
  agentThreadContext,
  agentStatsAggregate,
} from '@/api/modules/agent';
import { getArticleDetail, getPostListByArticleId, getArticleList } from '@/api/modules/article';
import { getPostDetailById, getReplyListByPostId, getReplyDetailById } from '@/api/modules/post';
import { getCourseDetail, getCourseList, getCoursePostList, getCourseScoreList } from '@/api/modules/course';
import { getAuthorInfo, getUserPreview, getUserContent } from '@/api/modules/account';
import { toAgentCourseSearchArgs } from '../enumNormalizer';

const BATCH_MAX = 20;

const ok = (data) => ({ ok: true, data });
const fail = (error) => ({
  ok: false,
  error: typeof error === 'string' ? error : (error?.message || 'unknown_error'),
});

const wrapAgentResponse = (response) => {
  if (!response || typeof response !== 'object') return response;
  const meta = response.meta && typeof response.meta === 'object' ? response.meta : {};
  const data = response.data && typeof response.data === 'object' ? response.data : {};
  const items = Array.isArray(data.items) ? data.items : [];
  return ok({
    ...response,
    _agent_meta: {
      tool: meta.tool,
      total: meta.total,
      returned: meta.returned,
      truncated: meta.truncated,
      applied_filters: meta.applied_filters,
      items_len: items.length,
    },
  });
};

const parseIdList = (v) => {
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean).slice(0, BATCH_MAX);
  if (typeof v === 'string') return v.split(/[,，\s]+/).map((s) => s.trim()).filter(Boolean).slice(0, BATCH_MAX);
  return [];
};

const normalizeQuery = (q) =>
  String(q || '')
    .replace(/[，。！？、]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const buildQueryVariants = (q) => {
  const raw = normalizeQuery(q);
  if (!raw) return [];

  const stopPhrases = [
    '哪个',
    '哪些',
    '有没有',
    '推荐',
    '比较',
    '怎么样',
    '如何',
    '给分',
    '评分',
    '分高',
    '高分',
    '好过',
    '容易',
    '难不难',
    '水不水',
    '水',
    '老师',
    '选课',
    '想找',
    '我要找',
    '帮我找',
  ];

  let stripped = raw;
  for (const p of stopPhrases) {
    stripped = stripped.replaceAll(p, ' ');
  }
  stripped = normalizeQuery(stripped);

  const removeCourseSuffix = (s) =>
    normalizeQuery(
      s
        .replaceAll('课程', ' ')
        .replaceAll('课', ' ')
    );

  const v = [];
  v.push(raw);
  if (stripped && stripped !== raw) v.push(stripped);

  const noSuffixRaw = removeCourseSuffix(raw);
  if (noSuffixRaw && noSuffixRaw !== raw) v.push(noSuffixRaw);

  const noSuffixStripped = removeCourseSuffix(stripped);
  if (noSuffixStripped && noSuffixStripped !== stripped) v.push(noSuffixStripped);

  // 再追加 token 级别候选（取最长的 1~2 个词）
  const tokens = Array.from(
    new Set(
      normalizeQuery(noSuffixStripped || noSuffixRaw || stripped || raw)
        .split(' ')
        .map((t) => t.trim())
        .filter((t) => t.length >= 2)
    )
  ).sort((a, b) => b.length - a.length);
  v.push(...tokens.slice(0, 2));

  return Array.from(new Set(v)).filter(Boolean);
};

const isSearchHit = (resp) => {
  try {
    return resp && resp.status === 200 && Array.isArray(resp.results) && resp.results.length > 0;
  } catch {
    return false;
  }
};

const trySearchWithVariants = async ({ query, doCall }) => {
  const variants = buildQueryVariants(query);
  const tried = [];
  let last = null;
  for (const q of variants) {
    // eslint-disable-next-line no-await-in-loop
    last = await doCall(q);
    tried.push({ query: q, status: last?.status, count: last?.count, results_len: last?.results?.length });
    if (isSearchHit(last)) {
      return { response: last, meta: { used_query: q, tried, variants } };
    }
  }
  return { response: last, meta: { used_query: variants[variants.length - 1] || query, tried, variants } };
};

export const SHARES_DU_TOOLSET = {
  tools: [
    {
      type: 'function',
      function: {
        name: 'agent_course_search',
        description: '使用内部 Agent 课程搜索接口。优先用于课程筛选、推荐、排序与多条件检索；支持中文枚举值与英文代码。',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: '课程关键词，可为空字符串' },
            course_type: {
              type: 'string',
              description: '课程类型：compulsory/elective/restricted_elective，也可写成 必修课/选修课/限选课',
            },
            course_method: {
              type: 'string',
              description: '教学方式：online/offline/hybrid，也可写成 线上/线下/混合',
            },
            campus: { type: 'string', description: '校区，优先使用配置中的校区名称' },
            college: { type: 'string', description: '学院，优先使用配置中的学院名称' },
            teacher: { type: 'string', description: '教师名（可选）' },
            min_score: { type: 'number', minimum: 0, maximum: 5 },
            min_review_count: { type: 'integer', minimum: 0 },
            sort: { type: 'string', description: 'score_desc/reviews_desc/stars_desc/recent_desc' },
            limit: { type: 'integer', minimum: 1, maximum: 20, default: 10 },
          },
          required: [],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'agent_course_context',
        description: '使用内部 Agent 课程上下文接口，获取课程基础信息、评分汇总、评论摘要、相关帖子与文章。',
        parameters: {
          type: 'object',
          properties: {
            course_id: { type: 'integer', minimum: 1 },
            review_limit: { type: 'integer', minimum: 1, maximum: 5, default: 5 },
            post_limit: { type: 'integer', minimum: 1, maximum: 5, default: 5 },
            article_limit: { type: 'integer', minimum: 1, maximum: 3, default: 3 },
          },
          required: ['course_id'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'agent_content_search',
        description: '使用内部 Agent 跨内容搜索接口，检索文章、帖子、回复、课程与课程评价。',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string' },
            types: {
              type: 'array',
              items: { type: 'string' },
              description: 'article/post/reply/course/course_review',
            },
            sort: { type: 'string', description: 'relevance_desc/recent_desc' },
            limit: { type: 'integer', minimum: 1, maximum: 20, default: 10 },
          },
          required: ['query'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'agent_thread_context',
        description: '使用内部 Agent 讨论串上下文接口，按文章、课程或帖子锚点聚合上下文。',
        parameters: {
          type: 'object',
          properties: {
            root_type: { type: 'string', description: 'article/course/post' },
            root_id: { type: 'integer', minimum: 1 },
            post_limit: { type: 'integer', minimum: 1, maximum: 5, default: 5 },
            replies_per_post: { type: 'integer', minimum: 1, maximum: 3, default: 3 },
          },
          required: ['root_type', 'root_id'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'agent_stats_aggregate',
        description: '使用内部 Agent 聚合统计接口，获取课程/帖子/文章/标签的受控统计结果。',
        parameters: {
          type: 'object',
          properties: {
            report_type: { type: 'string' },
            filters: { type: 'object' },
            limit: { type: 'integer', minimum: 1, maximum: 20, default: 10 },
          },
          required: ['report_type'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'global_search',
        description: '站内全局搜索（文章/帖子/回复/课程等）。query 可填多个关键词，用空格分隔，后端按多关键词检索。',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: '搜索关键词，多个词用空格分隔' },
            page: { type: 'integer', minimum: 1, default: 1 },
            page_size: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
          },
          required: ['query'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'multi_keyword_search',
        description: '多关键词全局搜索：传入关键词数组，内部会拼接为空格分隔的 query 调用全局搜索。适合同时用多个词检索。',
        parameters: {
          type: 'object',
          properties: {
            keywords: {
              type: 'array',
              items: { type: 'string' },
              description: '关键词列表，如 ["数据结构", "期末"]',
            },
            page: { type: 'integer', minimum: 1, default: 1 },
            page_size: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
          },
          required: ['keywords'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'search_articles',
        description: '搜索文章。query 可填多个关键词，用空格分隔。',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string' },
            tag: { type: 'string', description: '标签（可选）' },
            type: { type: 'string', description: 'original/repost（可选）' },
            sort: { type: 'string', description: '排序（可选）' },
            page: { type: 'integer', minimum: 1, default: 1 },
            page_size: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
          },
          required: ['query'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'search_posts',
        description: '搜索帖子。query 可填多个关键词，用空格分隔。',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string' },
            sort: { type: 'string', description: '排序（可选）' },
            page: { type: 'integer', minimum: 1, default: 1 },
            page_size: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
          },
          required: ['query'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'search_replies',
        description: '搜索回复。query 可填多个关键词，用空格分隔。',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string' },
            page: { type: 'integer', minimum: 1, default: 1 },
            page_size: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
          },
          required: ['query'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'search_courses',
        description: '搜索课程。query 可填多个关键词，用空格分隔。',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string' },
            type: { type: 'string', description: 'compulsory/elective/restricted_elective（可选）' },
            college: { type: 'string', description: '学院（可选）' },
            method: { type: 'string', description: 'online/offline/hybrid（可选）' },
            sort: { type: 'string', description: '排序（可选）' },
            page: { type: 'integer', minimum: 1, default: 1 },
            page_size: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
          },
          required: ['query'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_article_detail',
        description: '通过文章ID获取文章详情',
        parameters: {
          type: 'object',
          properties: { article_id: { type: 'string' } },
          required: ['article_id'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_article_post_list',
        description: '分页获取文章下的帖子列表',
        parameters: {
          type: 'object',
          properties: {
            article_id: { type: 'string' },
            page_index: { type: 'integer', minimum: 1, default: 1 },
            page_size: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
          },
          required: ['article_id'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_article_list',
        description: '分页获取文章列表（支持sort/tags）',
        parameters: {
          type: 'object',
          properties: {
            sort: { type: 'string', default: 'time' },
            tags: { type: 'string', description: '逗号分隔tag id（可选）' },
            page_index: { type: 'integer', minimum: 1, default: 1 },
            page_size: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
          },
          required: [],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_post_detail',
        description: '通过帖子ID获取帖子详情',
        parameters: {
          type: 'object',
          properties: { post_id: { type: 'string' } },
          required: ['post_id'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_post_reply_list',
        description: '分页获取帖子下的回复列表',
        parameters: {
          type: 'object',
          properties: {
            post_id: { type: 'string' },
            page_index: { type: 'integer', minimum: 1, default: 1 },
            page_size: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
          },
          required: ['post_id'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_reply_detail',
        description: '通过回复ID获取回复详情',
        parameters: {
          type: 'object',
          properties: { reply_id: { type: 'string' } },
          required: ['reply_id'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_course_detail',
        description: '通过课程ID获取课程详情',
        parameters: {
          type: 'object',
          properties: { course_id: { type: 'string' } },
          required: ['course_id'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_course_list',
        description: '分页获取课程列表',
        parameters: {
          type: 'object',
          properties: {
            page_index: { type: 'integer', minimum: 1, default: 1 },
            page_size: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
          },
          required: [],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_course_post_list',
        description: '分页获取课程下的帖子列表',
        parameters: {
          type: 'object',
          properties: {
            course_id: { type: 'string' },
            page_index: { type: 'integer', minimum: 1, default: 1 },
            page_size: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
          },
          required: ['course_id'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_course_score_list',
        description: '分页获取课程评分/评价列表',
        parameters: {
          type: 'object',
          properties: {
            course_id: { type: 'string' },
            page_index: { type: 'integer', minimum: 1, default: 1 },
            page_size: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
          },
          required: ['course_id'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_user_homepage',
        description: '获取用户主页信息（作者页）',
        parameters: {
          type: 'object',
          properties: { user_id: { type: 'string' } },
          required: ['user_id'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_user_content_preview',
        description: '获取用户创作内容预览（聚合预览：文章/帖子/回复等）',
        parameters: {
          type: 'object',
          properties: {
            user_id: { type: 'string' },
            type: { type: 'string', description: '兼容字段：可不填（当前接口不需要）' },
          },
          required: ['user_id'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_user_content_list',
        description: '分页获取用户创作内容列表（article/post/reply）',
        parameters: {
          type: 'object',
          properties: {
            user_id: { type: 'string' },
            type: { type: 'string', description: 'article/post/reply' },
            page: { type: 'integer', minimum: 1, default: 1 },
            page_size: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
          },
          required: ['user_id', 'type'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'batch_courses_info',
        description: '批量获取课程详情及可选评价：传入课程 id 列表，一次返回多门课的详情与评价，减少多次调用。',
        parameters: {
          type: 'object',
          properties: {
            course_ids: {
              type: 'array',
              items: { type: 'string' },
              description: '课程 ID 列表，最多 20 个',
            },
            include_reviews: { type: 'boolean', description: '是否包含课程评价列表', default: true },
            review_page_size: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
          },
          required: ['course_ids'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'batch_posts_info',
        description: '批量获取帖子详情及可选回复：传入帖子 id 列表，一次返回多条帖子的详情与回复。',
        parameters: {
          type: 'object',
          properties: {
            post_ids: {
              type: 'array',
              items: { type: 'string' },
              description: '帖子 ID 列表，最多 20 个',
            },
            include_replies: { type: 'boolean', description: '是否包含回复列表', default: true },
            reply_page_size: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
          },
          required: ['post_ids'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'batch_articles_info',
        description: '批量获取文章详情及可选帖子列表：传入文章 id 列表，一次返回多篇文章的详情与文章下帖子。',
        parameters: {
          type: 'object',
          properties: {
            article_ids: {
              type: 'array',
              items: { type: 'string' },
              description: '文章 ID 列表，最多 20 个',
            },
            include_posts: { type: 'boolean', description: '是否包含文章下帖子列表', default: true },
            post_page_size: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
          },
          required: ['article_ids'],
        },
      },
    },
  ],
  handlers: {
    agent_course_search: async (args) => {
      try {
        const response = await agentCourseSearch(toAgentCourseSearchArgs(args));
        return wrapAgentResponse(response);
      } catch (e) {
        return fail(e);
      }
    },
    agent_course_context: async (args) => {
      try {
        return wrapAgentResponse(await agentCourseContext(args));
      } catch (e) {
        return fail(e);
      }
    },
    agent_content_search: async (args) => {
      try {
        return wrapAgentResponse(await agentContentSearch(args));
      } catch (e) {
        return fail(e);
      }
    },
    agent_thread_context: async (args) => {
      try {
        return wrapAgentResponse(await agentThreadContext(args));
      } catch (e) {
        return fail(e);
      }
    },
    agent_stats_aggregate: async (args) => {
      try {
        return wrapAgentResponse(await agentStatsAggregate(args));
      } catch (e) {
        return fail(e);
      }
    },
    global_search: async ({ query, page = 1, page_size = 10 }) => {
      try {
        const { response, meta } = await trySearchWithVariants({
          query,
          doCall: (q) => globalSearch(q, page, page_size),
        });
        return ok({ ...response, _agent_meta: meta });
      } catch (e) {
        return fail(e);
      }
    },
    multi_keyword_search: async ({ keywords, page = 1, page_size = 10 }) => {
      try {
        const query = Array.isArray(keywords)
          ? keywords.map((k) => String(k || '').trim()).filter(Boolean).join(' ')
          : String(keywords || '').trim();
        if (!query) return fail('keywords 不能为空');
        const { response, meta } = await trySearchWithVariants({
          query,
          doCall: (q) => globalSearch(q, page, page_size),
        });
        return ok({ ...response, _agent_meta: meta });
      } catch (e) {
        return fail(e);
      }
    },
    search_articles: async ({ query, tag, type, sort, page = 1, page_size = 10 }) => {
      try {
        const { response, meta } = await trySearchWithVariants({
          query,
          doCall: (q) => searchArticles(q, tag, type, sort, page, page_size),
        });
        return ok({ ...response, _agent_meta: meta });
      } catch (e) {
        return fail(e);
      }
    },
    search_posts: async ({ query, sort, page = 1, page_size = 10 }) => {
      try {
        const { response, meta } = await trySearchWithVariants({
          query,
          doCall: (q) => searchPosts(q, sort, page, page_size),
        });
        return ok({ ...response, _agent_meta: meta });
      } catch (e) {
        return fail(e);
      }
    },
    search_replies: async ({ query, page = 1, page_size = 10 }) => {
      try {
        const { response, meta } = await trySearchWithVariants({
          query,
          doCall: (q) => searchReplies(q, page, page_size),
        });
        return ok({ ...response, _agent_meta: meta });
      } catch (e) {
        return fail(e);
      }
    },
    search_courses: async ({ query, type, college, method, sort, page = 1, page_size = 10 }) => {
      try {
        const { response, meta } = await trySearchWithVariants({
          query,
          doCall: (q) => searchCourses(q, type, college, method, sort, page, page_size),
        });
        return ok({ ...response, _agent_meta: meta });
      } catch (e) {
        return fail(e);
      }
    },
    get_article_detail: async ({ article_id }) => {
      try {
        return ok(await getArticleDetail(article_id));
      } catch (e) {
        return fail(e);
      }
    },
    get_article_post_list: async ({ article_id, page_index = 1, page_size = 20 }) => {
      try {
        return ok(await getPostListByArticleId(article_id, page_index, true, page_size));
      } catch (e) {
        return fail(e);
      }
    },
    get_article_list: async ({ sort = 'time', tags = null, page_index = 1, page_size = 20 }) => {
      try {
        return ok(await getArticleList(sort, tags, page_index, true, page_size));
      } catch (e) {
        return fail(e);
      }
    },
    get_post_detail: async ({ post_id }) => {
      try {
        return ok(await getPostDetailById(post_id));
      } catch (e) {
        return fail(e);
      }
    },
    get_post_reply_list: async ({ post_id, page_index = 1, page_size = 20 }) => {
      try {
        return ok(await getReplyListByPostId(post_id, page_index, page_size));
      } catch (e) {
        return fail(e);
      }
    },
    get_reply_detail: async ({ reply_id }) => {
      try {
        return ok(await getReplyDetailById(reply_id));
      } catch (e) {
        return fail(e);
      }
    },
    get_course_detail: async ({ course_id }) => {
      try {
        return ok(await getCourseDetail(course_id));
      } catch (e) {
        return fail(e);
      }
    },
    get_course_list: async ({ page_index = 1, page_size = 20 }) => {
      try {
        return ok(await getCourseList(page_index, true, page_size));
      } catch (e) {
        return fail(e);
      }
    },
    get_course_post_list: async ({ course_id, page_index = 1, page_size = 20 }) => {
      try {
        return ok(await getCoursePostList(course_id, page_index, page_size));
      } catch (e) {
        return fail(e);
      }
    },
    get_course_score_list: async ({ course_id, page_index = 1, page_size = 20 }) => {
      try {
        return ok(await getCourseScoreList(course_id, page_index, page_size));
      } catch (e) {
        return fail(e);
      }
    },
    get_user_homepage: async ({ user_id }) => {
      try {
        return ok(await getAuthorInfo(user_id));
      } catch (e) {
        return fail(e);
      }
    },
    get_user_content_preview: async ({ user_id }) => {
      try {
        return ok(await getUserPreview(user_id));
      } catch (e) {
        return fail(e);
      }
    },
    get_user_content_list: async ({ user_id, type, page = 1, page_size = 10 }) => {
      try {
        return ok(await getUserContent(type, user_id, page, page_size));
      } catch (e) {
        return fail(e);
      }
    },
    batch_courses_info: async ({
      course_ids,
      include_reviews = true,
      review_page_size = 20,
    }) => {
      const ids = parseIdList(course_ids);
      if (!ids.length) return fail('course_ids 不能为空');
      const results = await Promise.allSettled(
        ids.map(async (course_id) => {
          const course_detail = await getCourseDetail(course_id).catch((e) => ({ error: e?.message }));
          let reviews = null;
          if (include_reviews && course_detail && !course_detail.error) {
            const rev = await getCourseScoreList(course_id, 1, review_page_size).catch(() => null);
            if (rev && rev.results) reviews = rev.results;
          }
          return { course_id, course_detail, reviews };
        })
      );
      const out = results.map((r) =>
        r.status === 'fulfilled' ? r.value : { error: r.reason?.message }
      );
      let success_count = 0;
      out.forEach((x) => {
        if (x.course_detail && !x.course_detail.error) success_count += 1;
      });
      return ok({
        results: out,
        _meta: { requested_count: ids.length, success_count },
      });
    },
    batch_posts_info: async ({
      post_ids,
      include_replies = true,
      reply_page_size = 20,
    }) => {
      const ids = parseIdList(post_ids);
      if (!ids.length) return fail('post_ids 不能为空');
      const results = await Promise.allSettled(
        ids.map(async (post_id) => {
          const post_detail = await getPostDetailById(post_id).catch((e) => ({ error: e?.message }));
          let replies = null;
          if (include_replies && post_detail && !post_detail.error) {
            const rep = await getReplyListByPostId(post_id, 1, reply_page_size).catch(() => null);
            if (rep && rep.results) replies = rep.results;
          }
          return { post_id, post_detail, replies };
        })
      );
      const out = results.map((r) =>
        r.status === 'fulfilled' ? r.value : { error: r.reason?.message }
      );
      let success_count = 0;
      out.forEach((x) => {
        if (x.post_detail && !x.post_detail.error) success_count += 1;
      });
      return ok({
        results: out,
        _meta: { requested_count: ids.length, success_count },
      });
    },
    batch_articles_info: async ({
      article_ids,
      include_posts = true,
      post_page_size = 20,
    }) => {
      const ids = parseIdList(article_ids);
      if (!ids.length) return fail('article_ids 不能为空');
      const results = await Promise.allSettled(
        ids.map(async (article_id) => {
          const article_detail = await getArticleDetail(article_id).catch((e) => ({ error: e?.message }));
          let posts = null;
          if (include_posts && article_detail && !article_detail.error) {
            const pl = await getPostListByArticleId(article_id, 1, true, post_page_size).catch(() => null);
            if (pl && pl.results) posts = pl.results;
          }
          return { article_id, article_detail, posts };
        })
      );
      const out = results.map((r) =>
        r.status === 'fulfilled' ? r.value : { error: r.reason?.message }
      );
      let success_count = 0;
      out.forEach((x) => {
        if (x.article_detail && !x.article_detail.error) success_count += 1;
      });
      return ok({
        results: out,
        _meta: { requested_count: ids.length, success_count },
      });
    },
  },
};

export const pickTools = (toolset, names) => {
  const nameSet = new Set(names);
  return toolset.tools.filter((t) => nameSet.has(t.function?.name));
};
