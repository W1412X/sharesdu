/**
 * 写操作 → GET 缓存失效规则
 * 原则：改/删某条内容时，失效「详情」「可能包含它的列表」「相关搜索」等所有读路径缓存。
 */

const SEARCH = Object.freeze({
    global: '/search/global',
    articles: '/search/articles',
    posts: '/search/posts',
    replies: '/search/replies',
    courses: '/search/courses',
});

const matches = (cacheKey, fragments) => {
    if (!cacheKey || !Array.isArray(fragments) || !fragments.length) return false;
    return fragments.some((f) => cacheKey.includes(f));
};

/** 缓存键 params 段是否包含某 id（stableStringify 后为 "field":id 或 field=id） */
const matchesIdParam = (cacheKey, paramName, id) => {
    if (id == null || id === '') return false;
    const s = String(id);
    return (
        cacheKey.includes(`${paramName}=${s}`)
        || cacheKey.includes(`"${paramName}":${s}`)
        || cacheKey.includes(`"${paramName}":"${s}"`)
    );
};

const extractArticleId = (data) => {
    if (!data) return null;
    return data.article_id ?? data.articleId ?? null;
};

const extractCourseId = (data) => {
    if (!data) return null;
    return data.course_id ?? data.courseId ?? null;
};

const extractPostId = (data) => {
    if (!data) return null;
    return data.post_id ?? data.postId ?? null;
};

const extractReplyId = (data) => {
    if (!data) return null;
    return data.reply_id ?? data.replyId ?? null;
};

const extractUserId = (data) => {
    if (!data) return null;
    return data.user_id ?? data.userId ?? data.to_user_id ?? null;
};

/** 文章相关读缓存（列表 + 详情类 + 搜索 + 用户页/收藏） */
const ARTICLE_READ = [
    '/article/list',
    '/article/detail',
    '/article/post_list',
    SEARCH.articles,
    SEARCH.global,
    '/user/content',
    '/user/preview',
    '/user/homepage',
    '/star/list',
    '/article/sections',
];

/** 课程相关读缓存 */
const COURSE_READ = [
    '/course/list',
    '/course/detail',
    '/course/post_list',
    '/course/score_list',
    '/course/user_evaluation',
    SEARCH.courses,
    SEARCH.global,
    '/user/content',
    '/star/list',
];

/** 帖子相关读缓存 */
const POST_READ = [
    '/post/detail',
    '/post/reply_list',
    '/article/post_list',
    '/course/post_list',
    SEARCH.posts,
    SEARCH.global,
    '/user/content',
];

/** 回复相关读缓存 */
const REPLY_READ = [
    '/reply/detail',
    '/post/reply_list',
    '/post/detail',
    SEARCH.replies,
    SEARCH.global,
];

const invalidateArticleReads = (cacheKey, articleId, { allLists = true } = {}) => {
    if (allLists && matches(cacheKey, ARTICLE_READ)) return true;
    if (articleId && matchesIdParam(cacheKey, 'article_id', articleId)) return true;
    return false;
};

const invalidateCourseReads = (cacheKey, courseId, { allLists = true } = {}) => {
    if (allLists && matches(cacheKey, COURSE_READ)) return true;
    if (courseId && matchesIdParam(cacheKey, 'course_id', courseId)) return true;
    return false;
};

const invalidatePostReads = (cacheKey, postId, { allLists = true } = {}) => {
    if (allLists && matches(cacheKey, POST_READ)) return true;
    if (postId && matchesIdParam(cacheKey, 'post_id', postId)) return true;
    return false;
};

const invalidateReplyReads = (cacheKey, replyId, { allLists = true } = {}) => {
    if (allLists && matches(cacheKey, REPLY_READ)) return true;
    if (replyId && matchesIdParam(cacheKey, 'reply_id', replyId)) return true;
    return false;
};

/**
 * 点赞 content_type：0 文章，1 帖子，2 回复（见 api/modules/like.js）
 */
const invalidateLikeTarget = (cacheKey, contentType, contentId) => {
    const id = contentId;
    if (contentType === 0 || contentType === '0' || contentType === 'article') {
        return invalidateArticleReads(cacheKey, id, { allLists: false })
            || matches(cacheKey, ['/article/detail', '/like/count', '/like/user'])
            || (id && matchesIdParam(cacheKey, 'article_id', id));
    }
    if (contentType === 1 || contentType === '1' || contentType === 'post') {
        return invalidatePostReads(cacheKey, id, { allLists: false })
            || matches(cacheKey, ['/like/count', '/like/user'])
            || (id && matchesIdParam(cacheKey, 'post_id', id));
    }
    if (contentType === 2 || contentType === '2' || contentType === 'reply') {
        return invalidateReplyReads(cacheKey, id, { allLists: false })
            || matches(cacheKey, ['/like/count', '/like/user'])
            || (id && matchesIdParam(cacheKey, 'reply_id', id));
    }
    return false;
};

/**
 * 收藏 content_type：0 课程，1 文章，2 帖子（见 api/modules/star.js）
 */
const invalidateStarTarget = (cacheKey, contentType, contentId) => {
    const id = contentId;
    if (contentType === 0 || contentType === '0' || contentType === 'course') {
        return invalidateCourseReads(cacheKey, id);
    }
    if (contentType === 1 || contentType === '1' || contentType === 'article') {
        return invalidateArticleReads(cacheKey, id);
    }
    if (contentType === 2 || contentType === '2' || contentType === 'post') {
        return invalidatePostReads(cacheKey, id);
    }
    return matches(cacheKey, ['/star/list', '/star/folder/list']);
};

export const cacheInvalidationRules = {
    // ==================== 文章 ====================
    '/article/create': {
        invalidateCachePredicate: (cacheKey) =>
            matches(cacheKey, ['/article/list', SEARCH.articles, SEARCH.global, '/article/sections']),
    },

    '/article/edit': {
        invalidateCachePredicate: (cacheKey, _url, data) =>
            invalidateArticleReads(cacheKey, extractArticleId(data)),
    },

    '/article/delete': {
        invalidateCachePredicate: (cacheKey, _url, data) =>
            invalidateArticleReads(cacheKey, extractArticleId(data)),
    },

    // ==================== 帖子 ====================
    '/post/article_post': {
        invalidateCachePredicate: (cacheKey, _url, data) => {
            const articleId = extractArticleId(data);
            return invalidatePostReads(cacheKey, extractPostId(data))
                || invalidateArticleReads(cacheKey, articleId, { allLists: false })
                || (articleId && matchesIdParam(cacheKey, 'article_id', articleId));
        },
    },

    '/post/course_post': {
        invalidateCachePredicate: (cacheKey, _url, data) => {
            const courseId = extractCourseId(data);
            return invalidatePostReads(cacheKey, extractPostId(data))
                || invalidateCourseReads(cacheKey, courseId, { allLists: false })
                || (courseId && matchesIdParam(cacheKey, 'course_id', courseId));
        },
    },

    '/post/delete': {
        invalidateCachePredicate: (cacheKey, _url, data) =>
            invalidatePostReads(cacheKey, extractPostId(data)),
    },

    '/article-posts/{id}/top': {
        invalidateCachePredicate: (cacheKey, url) => {
            const match = url.match(/^\/article-posts\/(\d+)\/top$/);
            const postId = match ? match[1] : null;
            return invalidatePostReads(cacheKey, postId);
        },
    },

    '/course-posts/{id}/top': {
        invalidateCachePredicate: (cacheKey, url) => {
            const match = url.match(/^\/course-posts\/(\d+)\/top$/);
            const postId = match ? match[1] : null;
            return invalidatePostReads(cacheKey, postId);
        },
    },

    '/articles/{id}/top': {
        invalidateCachePredicate: (cacheKey, url) => {
            const match = url.match(/^\/articles\/(\d+)\/top$/);
            const articleId = match ? match[1] : null;
            return invalidateArticleReads(cacheKey, articleId);
        },
    },

    // ==================== 回复 ====================
    '/reply/create': {
        invalidateCachePredicate: (cacheKey, _url, data) => {
            const postId = extractPostId(data);
            return invalidateReplyReads(cacheKey, null)
                || invalidatePostReads(cacheKey, postId, { allLists: false })
                || (postId && matchesIdParam(cacheKey, 'post_id', postId));
        },
    },

    '/reply/delete': {
        invalidateCachePredicate: (cacheKey, _url, data) =>
            invalidateReplyReads(cacheKey, extractReplyId(data)),
    },

    // ==================== 课程 ====================
    '/course/create': {
        invalidateCachePredicate: (cacheKey) =>
            matches(cacheKey, ['/course/list', SEARCH.courses, SEARCH.global]),
    },

    '/course/edit': {
        invalidateCachePredicate: (cacheKey, _url, data) =>
            invalidateCourseReads(cacheKey, extractCourseId(data)),
    },

    '/course/delete': {
        invalidateCachePredicate: (cacheKey, _url, data) =>
            invalidateCourseReads(cacheKey, extractCourseId(data)),
    },

    '/course/rate': {
        invalidateCachePredicate: (cacheKey, _url, data) =>
            invalidateCourseReads(cacheKey, extractCourseId(data)),
    },

    '/course/edit_rating': {
        invalidateCachePredicate: (cacheKey, _url, data) =>
            invalidateCourseReads(cacheKey, extractCourseId(data)),
    },

    '/course/user_evaluation': {
        invalidateCachePredicate: () => false,
    },

    '/admin/courses/freeze': {
        invalidateCachePredicate: (cacheKey, _url, data) =>
            invalidateCourseReads(cacheKey, extractCourseId(data)),
    },

    '/admin/courses/rollback': {
        invalidateCachePredicate: (cacheKey, _url, data) => {
            const courseId = extractCourseId(data);
            return matches(cacheKey, [`/admin/courses/${courseId}/history`, '/course/detail'])
                || invalidateCourseReads(cacheKey, courseId, { allLists: false });
        },
    },

    // ==================== 点赞 / 收藏 ====================
    '/like': {
        invalidateCachePredicate: (cacheKey, _url, data) => {
            if (!data) return false;
            return invalidateLikeTarget(cacheKey, data.content_type, data.content_id);
        },
    },

    '/unlike': {
        invalidateCachePredicate: (cacheKey, _url, data) => {
            if (!data) return false;
            return invalidateLikeTarget(cacheKey, data.content_type, data.content_id);
        },
    },

    '/star': {
        invalidateCachePredicate: (cacheKey, _url, data) => {
            if (!data) return false;
            return invalidateStarTarget(cacheKey, data.content_type, data.content_id);
        },
    },

    '/star/create': {
        invalidateCachePredicate: (cacheKey, _url, data) => {
            if (data?.folder_name != null) {
                return matches(cacheKey, ['/star/folder/list', '/star/list']);
            }
            if (data?.content_type != null) {
                return invalidateStarTarget(cacheKey, data.content_type, data.content_id);
            }
            return matches(cacheKey, ['/star/folder/list', '/star/list']);
        },
    },

    '/unstar': {
        invalidateCachePredicate: (cacheKey, _url, data) => {
            if (!data) return false;
            return invalidateStarTarget(cacheKey, data.content_type, data.content_id);
        },
    },

    // ==================== 图片 / 资源 ====================
    '/image/profile': {
        invalidateCachePredicate: (cacheKey) =>
            matches(cacheKey, ['/image/user', '/user/homepage', '/user/preview', '/user/content']),
    },

    '/image/article': {
        invalidateCachePredicate: () => false,
    },

    '/resource/upload': {
        invalidateCachePredicate: (cacheKey, _url, data) =>
            invalidateArticleReads(cacheKey, extractArticleId(data), { allLists: false }),
    },

    // ==================== 用户 ====================
    '/user/profile/update': {
        invalidateCachePredicate: (cacheKey) =>
            matches(cacheKey, ['/user/homepage', '/user/preview', '/user/content']),
    },

    '/block': {
        invalidateCachePredicate: (cacheKey) =>
            matches(cacheKey, ['/user/homepage', '/user/preview', '/blocklist', '/user/list']),
    },

    '/unblock': {
        invalidateCachePredicate: (cacheKey) =>
            matches(cacheKey, ['/user/homepage', '/user/preview', '/blocklist', '/user/list']),
    },

    // ==================== 通知 / 消息 ====================
    '/notifications/read': {
        invalidateCachePredicate: (cacheKey) =>
            matches(cacheKey, ['/notifications/list', '/notification/list']),
    },

    '/messages/send': {
        invalidateCachePredicate: (cacheKey) =>
            matches(cacheKey, ['/messages/list', '/messages/chat-users', '/messages/history']),
    },

    '/messages/read': {
        invalidateCachePredicate: (cacheKey) =>
            matches(cacheKey, ['/messages/list', '/messages/chat-users', '/messages/history']),
    },

    '/messages/delete': {
        invalidateCachePredicate: (cacheKey) =>
            matches(cacheKey, ['/messages/list', '/messages/chat-users', '/messages/history']),
    },

    // ==================== 管理 ====================
    '/admin/block/user': {
        invalidateCachePredicate: (cacheKey, _url, data) => {
            const userId = extractUserId(data);
            return matches(cacheKey, ['/admin/blocked-users', '/user/list'])
                || (userId && matchesIdParam(cacheKey, 'user_id', userId));
        },
    },

    '/admin/unblock/user': {
        invalidateCachePredicate: (cacheKey, _url, data) => {
            const userId = extractUserId(data);
            return matches(cacheKey, ['/admin/blocked-users', '/user/list'])
                || (userId && matchesIdParam(cacheKey, 'user_id', userId));
        },
    },

    '/admin/block/article': {
        invalidateCachePredicate: (cacheKey, _url, data) =>
            matches(cacheKey, ['/admin/manage/list'])
            || invalidateArticleReads(cacheKey, extractArticleId(data)),
    },

    '/admin/unblock/article': {
        invalidateCachePredicate: (cacheKey, _url, data) =>
            matches(cacheKey, ['/admin/manage/list'])
            || invalidateArticleReads(cacheKey, extractArticleId(data)),
    },

    '/admin/invitation-codes': {
        invalidateCachePredicate: (cacheKey) =>
            matches(cacheKey, ['/admin/invitation-codes', '/invite/list']),
    },

    // ==================== 会话 ====================
    '/logout': {
        invalidateCachePredicate: () => true,
    },

    '/delete_account': {
        invalidateCachePredicate: () => true,
    },

    '/reset_password': {
        invalidateCachePredicate: () => false,
    },

    '/token/refresh': {
        invalidateCachePredicate: () => false,
    },
};

/**
 * @param {string} url
 * @returns {Object|null}
 */
export const getCacheInvalidationRule = (url) => {
    if (!url) return null;

    if (cacheInvalidationRules[url]) {
        return cacheInvalidationRules[url];
    }

    if (/^\/articles\/\d+\/top$/.test(url)) {
        return cacheInvalidationRules['/articles/{id}/top'] || null;
    }

    if (/^\/article-posts\/\d+\/top$/.test(url)) {
        return cacheInvalidationRules['/article-posts/{id}/top'] || null;
    }

    if (/^\/course-posts\/\d+\/top$/.test(url)) {
        return cacheInvalidationRules['/course-posts/{id}/top'] || null;
    }

    if (/^\/admin\/courses\/\d+\/history$/.test(url)) {
        return null;
    }

    if (url.startsWith('/admin/invitation-codes')) {
        return cacheInvalidationRules['/admin/invitation-codes'] || null;
    }

    return null;
};
