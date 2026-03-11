import {
  globalSearch,
  searchArticles,
  searchPosts,
  searchReplies,
  searchCourses,
} from '@/api/modules/search';
import { getArticleDetail, getPostListByArticleId, getArticleList } from '@/api/modules/article';
import { getPostDetailById, getReplyListByPostId, getReplyDetailById } from '@/api/modules/post';
import { getCourseDetail, getCourseList, getCoursePostList, getCourseScoreList } from '@/api/modules/course';
import { getAuthorInfo, getUserPreview, getUserContent } from '@/api/modules/account';

const ok = (data) => ({ ok: true, data });
const fail = (error) => ({
  ok: false,
  error: typeof error === 'string' ? error : (error?.message || 'unknown_error'),
});

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
        name: 'global_search',
        description: '站内全局搜索（文章/帖子/回复/课程等）',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: '搜索关键词' },
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
        name: 'search_articles',
        description: '搜索文章',
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
        description: '搜索帖子',
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
        description: '搜索回复',
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
        description: '搜索课程',
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
  ],
  handlers: {
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
  },
};

export const pickTools = (toolset, names) => {
  const nameSet = new Set(names);
  return toolset.tools.filter((t) => nameSet.has(t.function?.name));
};
