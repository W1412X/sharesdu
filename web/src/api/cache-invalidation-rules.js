/**
 * 缓存失效规则配置
 * 定义每个 API 端点修改后需要失效的缓存键模式
 */

/**
 * 从请求数据中提取文章ID
 */
const extractArticleId = (data) => {
    if (!data) return null;
    return data.article_id || data.articleId || null;
};

/**
 * 从请求数据中提取课程ID
 */
const extractCourseId = (data) => {
    if (!data) return null;
    return data.course_id || data.courseId || null;
};

/**
 * 从请求数据中提取帖子ID
 */
const extractPostId = (data) => {
    if (!data) return null;
    return data.post_id || data.postId || null;
};

/**
 * 从请求数据中提取用户ID
 */
const extractUserId = (data) => {
    if (!data) return null;
    return data.user_id || data.userId || data.to_user_id || null;
};

/**
 * 缓存失效规则配置
 * 每个规则可以包含：
 * - invalidateCacheKeys: 需要失效的 URL 列表
 * - invalidateCachePredicate: 自定义失效函数，接收 (cacheKey, url, data) 参数
 */
export const cacheInvalidationRules = {
    // ==================== 文章相关 ====================
    '/article/create': {
        invalidateCacheKeys: [
            '/article/list',
        ],
        invalidateCachePredicate: (cacheKey) => {
            return cacheKey.includes('/article/list');
        },
    },

    '/article/edit': {
        invalidateCachePredicate: (cacheKey, url, data) => {
            const articleId = extractArticleId(data);
            const patterns = [
                '/article/list',  // 文章列表
                '/article/detail', // 文章详情
            ];
            
            // 如果有 articleId，失效该文章相关的缓存
            if (articleId) {
                patterns.push(`article_id=${articleId}`, `article_id:${articleId}`);
            }
            
            return patterns.some(pattern => cacheKey.includes(pattern));
        },
    },

    '/article/delete': {
        invalidateCachePredicate: (cacheKey, url, data) => {
            const articleId = extractArticleId(data);
            const patterns = [
                '/article/list',  // 文章列表
            ];
            
            // 失效该文章相关的所有缓存
            if (articleId) {
                patterns.push(`article_id=${articleId}`, `article_id:${articleId}`, '/article/detail', '/article/post_list');
            }
            
            return patterns.some(pattern => cacheKey.includes(pattern));
        },
    },

    // ==================== 帖子相关 ====================
    '/post/article_post': {
        invalidateCachePredicate: (cacheKey, url, data) => {
            const articleId = extractArticleId(data);
            const patterns = [
                '/article/post_list',  // 帖子列表
                '/article/detail',     // 文章详情（可能包含帖子数量）
            ];
            
            if (articleId) {
                patterns.push(`article_id=${articleId}`, `article_id:${articleId}`);
            }
            
            return patterns.some(pattern => cacheKey.includes(pattern));
        },
    },

    '/post/course_post': {
        invalidateCachePredicate: (cacheKey, url, data) => {
            const courseId = extractCourseId(data);
            const patterns = [
                '/course/post_list',  // 课程帖子列表
                '/course/detail',     // 课程详情（可能包含帖子数量）
            ];
            
            if (courseId) {
                patterns.push(`course_id=${courseId}`, `course_id:${courseId}`);
            }
            
            return patterns.some(pattern => cacheKey.includes(pattern));
        },
    },

    '/post/delete': {
        invalidateCachePredicate: (cacheKey, url, data) => {
            const postId = extractPostId(data);
            const patterns = [
                '/article/post_list',  // 文章帖子列表
                '/course/post_list',   // 课程帖子列表
                '/post/detail',        // 帖子详情
                '/post/reply_list',    // 回复列表
            ];
            
            if (postId) {
                patterns.push(`post_id=${postId}`, `post_id:${postId}`);
            }
            
            return patterns.some(pattern => cacheKey.includes(pattern));
        },
    },

    // 动态路径：设置文章帖子置顶 /article-posts/{postId}/top
    '/article-posts/{id}/top': {
        invalidateCachePredicate: (cacheKey, url) => {
            // 从 URL 中提取 postId
            const match = url.match(/^\/article-posts\/(\d+)\/top$/);
            const postId = match ? match[1] : null;
            const patterns = [
                '/article/post_list',  // 帖子列表（置顶状态变化）
            ];
            
            if (postId) {
                patterns.push(`post_id=${postId}`, `post_id:${postId}`, '/post/detail');
            }
            
            return patterns.some(pattern => cacheKey.includes(pattern));
        },
    },

    // 动态路径：设置课程帖子置顶 /course-posts/{postId}/top
    '/course-posts/{id}/top': {
        invalidateCachePredicate: (cacheKey, url) => {
            // 从 URL 中提取 postId
            const match = url.match(/^\/course-posts\/(\d+)\/top$/);
            const postId = match ? match[1] : null;
            const patterns = [
                '/course/post_list',  // 帖子列表（置顶状态变化）
            ];
            
            if (postId) {
                patterns.push(`post_id=${postId}`, `post_id:${postId}`, '/post/detail');
            }
            
            return patterns.some(pattern => cacheKey.includes(pattern));
        },
    },

    // ==================== 回复相关 ====================
    '/reply/create': {
        invalidateCachePredicate: (cacheKey, url, data) => {
            const postId = extractPostId(data);
            const patterns = [
                '/post/reply_list',  // 回复列表
                '/post/detail',      // 帖子详情（可能包含回复数量）
            ];
            
            if (postId) {
                patterns.push(`post_id=${postId}`, `post_id:${postId}`);
            }
            
            return patterns.some(pattern => cacheKey.includes(pattern));
        },
    },

    '/reply/delete': {
        invalidateCachePredicate: (cacheKey, url, data) => {
            const replyId = data?.reply_id || data?.replyId;
            const patterns = [
                '/post/reply_list',  // 回复列表
                '/reply/detail',     // 回复详情
            ];
            
            if (replyId) {
                patterns.push(`reply_id=${replyId}`, `reply_id:${replyId}`);
            }
            
            return patterns.some(pattern => cacheKey.includes(pattern));
        },
    },

    // ==================== 课程相关 ====================
    '/course/create': {
        invalidateCacheKeys: [
            '/course/list',
        ],
        invalidateCachePredicate: (cacheKey) => {
            return cacheKey.includes('/course/list');
        },
    },

    '/course/edit': {
        invalidateCachePredicate: (cacheKey, url, data) => {
            const courseId = extractCourseId(data);
            const patterns = [
                '/course/list',   // 课程列表
                '/course/detail', // 课程详情
            ];
            
            if (courseId) {
                patterns.push(`course_id=${courseId}`, `course_id:${courseId}`);
            }
            
            return patterns.some(pattern => cacheKey.includes(pattern));
        },
    },

    '/course/delete': {
        invalidateCachePredicate: (cacheKey, url, data) => {
            const courseId = extractCourseId(data);
            const patterns = [
                '/course/list',   // 课程列表
            ];
            
            if (courseId) {
                patterns.push(`course_id=${courseId}`, `course_id:${courseId}`, '/course/detail', '/course/post_list', '/course/score_list');
            }
            
            return patterns.some(pattern => cacheKey.includes(pattern));
        },
    },

    '/course/rate': {
        invalidateCachePredicate: (cacheKey, url, data) => {
            const courseId = extractCourseId(data);
            const patterns = [
                '/course/detail',    // 课程详情（评分变化）
                '/course/score_list', // 评分列表
                '/course/user_evaluation', // 用户评价
            ];
            
            if (courseId) {
                patterns.push(`course_id=${courseId}`, `course_id:${courseId}`);
            }
            
            return patterns.some(pattern => cacheKey.includes(pattern));
        },
    },

    '/course/edit_rating': {
        invalidateCachePredicate: (cacheKey, url, data) => {
            const courseId = extractCourseId(data);
            const patterns = [
                '/course/detail',    // 课程详情
                '/course/score_list', // 评分列表
                '/course/user_evaluation', // 用户评价
            ];
            
            if (courseId) {
                patterns.push(`course_id=${courseId}`, `course_id:${courseId}`);
            }
            
            return patterns.some(pattern => cacheKey.includes(pattern));
        },
    },

    // 注意：/course/user_evaluation 是 POST 请求但用于查询，不需要失效缓存
    '/course/user_evaluation': {
        invalidateCachePredicate: () => false,
    },

    '/admin/courses/freeze': {
        invalidateCachePredicate: (cacheKey, url, data) => {
            const courseId = extractCourseId(data);
            const patterns = [
                '/course/list',   // 课程列表（冻结状态变化）
                '/course/detail', // 课程详情
            ];
            
            if (courseId) {
                patterns.push(`course_id=${courseId}`, `course_id:${courseId}`);
            }
            
            return patterns.some(pattern => cacheKey.includes(pattern));
        },
    },

    '/admin/courses/rollback': {
        invalidateCachePredicate: (cacheKey, url, data) => {
            const courseId = extractCourseId(data);
            const patterns = [
                '/course/detail',    // 课程详情
                '/course/history',   // 课程历史
            ];
            
            if (courseId) {
                patterns.push(`course_id=${courseId}`, `course_id:${courseId}`);
            }
            
            return patterns.some(pattern => cacheKey.includes(pattern));
        },
    },

    // ==================== 点赞相关 ====================
    '/like': {
        invalidateCachePredicate: (cacheKey, url, data) => {
            if (!data) return false;
            const contentType = data.content_type;
            const contentId = data.content_id;
            
            if (contentType === 'article' && contentId) {
                return cacheKey.includes('/article/detail') || 
                       cacheKey.includes(`article_id=${contentId}`) ||
                       cacheKey.includes(`article_id:${contentId}`);
            }
            
            return false;
        },
    },

    '/unlike': {
        invalidateCachePredicate: (cacheKey, url, data) => {
            if (!data) return false;
            const contentType = data.content_type;
            const contentId = data.content_id;
            
            if (contentType === 'article' && contentId) {
                return cacheKey.includes('/article/detail') || 
                       cacheKey.includes(`article_id=${contentId}`) ||
                       cacheKey.includes(`article_id:${contentId}`);
            }
            
            return false;
        },
    },

    // ==================== 收藏相关 ====================
    '/star': {
        invalidateCachePredicate: (cacheKey, url, data) => {
            if (!data) return false;
            const articleId = extractArticleId(data);
            
            if (articleId) {
                return cacheKey.includes('/article/detail') || 
                       cacheKey.includes(`article_id=${articleId}`) ||
                       cacheKey.includes(`article_id:${articleId}`) ||
                       cacheKey.includes('/star/list');
            }
            
            return false;
        },
    },

    '/star/create': {
        invalidateCachePredicate: (cacheKey, url, data) => {
            if (!data) return false;
            const articleId = extractArticleId(data);
            
            if (articleId) {
                return cacheKey.includes('/article/detail') || 
                       cacheKey.includes(`article_id=${articleId}`) ||
                       cacheKey.includes(`article_id:${articleId}`) ||
                       cacheKey.includes('/star/list');
            }
            
            return false;
        },
    },

    '/unstar': {
        invalidateCachePredicate: (cacheKey, url, data) => {
            if (!data) return false;
            const articleId = extractArticleId(data);
            
            if (articleId) {
                return cacheKey.includes('/article/detail') || 
                       cacheKey.includes(`article_id=${articleId}`) ||
                       cacheKey.includes(`article_id:${articleId}`) ||
                       cacheKey.includes('/star/list');
            }
            
            return false;
        },
    },

    // ==================== 图片相关 ====================
    '/image/profile': {
        invalidateCachePredicate: (cacheKey) => {
            // 用户头像更新后，失效用户信息相关缓存
            return cacheKey.includes('/image/user') || 
                   cacheKey.includes('/user/info') ||
                   cacheKey.includes('/user/profile');
        },
    },

    '/image/article': {
        // 文章图片上传不影响缓存，因为图片URL已经变化
        invalidateCachePredicate: () => false,
    },

    // ==================== 资源相关 ====================
    '/resource/upload': {
        invalidateCachePredicate: (cacheKey, url, data) => {
            const articleId = extractArticleId(data);
            const patterns = [
                '/article/detail',  // 文章详情（资源列表变化）
            ];
            
            if (articleId) {
                patterns.push(`article_id=${articleId}`, `article_id:${articleId}`);
            }
            
            return patterns.some(pattern => cacheKey.includes(pattern));
        },
    },

    // ==================== 用户相关 ====================
    '/block': {
        invalidateCachePredicate: (cacheKey) => {
            // 屏蔽用户后，失效用户信息缓存
            return cacheKey.includes('/user/info') || 
                   cacheKey.includes('/block/list');
        },
    },

    '/unblock': {
        invalidateCachePredicate: (cacheKey) => {
            // 取消屏蔽后，失效用户信息缓存
            return cacheKey.includes('/user/info') || 
                   cacheKey.includes('/block/list');
        },
    },

    // ==================== 通知相关 ====================
    '/notifications/read': {
        invalidateCachePredicate: (cacheKey) => {
            // 标记通知已读后，失效通知列表缓存
            return cacheKey.includes('/notifications/list') ||
                   cacheKey.includes('/notification/list');
        },
    },

    // ==================== 消息相关 ====================
    '/messages/send': {
        invalidateCachePredicate: (cacheKey) => {
            // 发送消息后，失效消息列表缓存
            return cacheKey.includes('/messages/list') ||
                   cacheKey.includes('/messages/chat');
        },
    },

    '/messages/read': {
        invalidateCachePredicate: (cacheKey) => {
            // 标记消息已读后，失效消息列表缓存
            return cacheKey.includes('/messages/list') ||
                   cacheKey.includes('/messages/chat');
        },
    },

    '/messages/delete': {
        invalidateCachePredicate: (cacheKey) => {
            // 删除消息后，失效消息列表缓存
            return cacheKey.includes('/messages/list') ||
                   cacheKey.includes('/messages/chat');
        },
    },

    // ==================== 管理相关 ====================
    '/admin/block/user': {
        invalidateCachePredicate: (cacheKey, url, data) => {
            const userId = extractUserId(data);
            const patterns = ['/admin/manage/list'];
            
            if (userId) {
                patterns.push(`user_id=${userId}`, `/user/info`);
            }
            
            return patterns.some(pattern => cacheKey.includes(pattern));
        },
    },

    '/admin/unblock/user': {
        invalidateCachePredicate: (cacheKey, url, data) => {
            const userId = extractUserId(data);
            const patterns = ['/admin/manage/list'];
            
            if (userId) {
                patterns.push(`user_id=${userId}`, `/user/info`);
            }
            
            return patterns.some(pattern => cacheKey.includes(pattern));
        },
    },

    '/admin/block/article': {
        invalidateCachePredicate: (cacheKey, url, data) => {
            const articleId = extractArticleId(data);
            const patterns = ['/admin/manage/list', '/article/list'];
            
            if (articleId) {
                patterns.push(`article_id=${articleId}`, `/article/detail`);
            }
            
            return patterns.some(pattern => cacheKey.includes(pattern));
        },
    },

    '/admin/unblock/article': {
        invalidateCachePredicate: (cacheKey, url, data) => {
            const articleId = extractArticleId(data);
            const patterns = ['/admin/manage/list', '/article/list'];
            
            if (articleId) {
                patterns.push(`article_id=${articleId}`, `/article/detail`);
            }
            
            return patterns.some(pattern => cacheKey.includes(pattern));
        },
    },

    '/admin/invitation-codes': {
        invalidateCachePredicate: (cacheKey) => {
            // 创建邀请码后，失效邀请码列表缓存
            return cacheKey.includes('/admin/invitation-codes') ||
                   cacheKey.includes('/invite/list');
        },
    },

    // ==================== 其他操作 ====================
    '/logout': {
        // 登出后清空所有缓存
        invalidateCachePredicate: () => true,
    },

    '/delete_account': {
        // 删除账号后清空所有缓存
        invalidateCachePredicate: () => true,
    },

    '/reset_password': {
        // 重置密码不影响缓存
        invalidateCachePredicate: () => false,
    },

    '/token/refresh': {
        // Token 刷新不影响缓存
        invalidateCachePredicate: () => false,
    },
};

/**
 * 获取指定 URL 的缓存失效规则
 * 支持精确匹配和动态路径模式匹配
 * @param {string} url - API 端点 URL（如 '/articles/123/top'）
 * @returns {Object|null} 缓存失效规则
 */
export const getCacheInvalidationRule = (url) => {
    if (!url) return null;
    
    // 1. 精确匹配
    if (cacheInvalidationRules[url]) {
        return cacheInvalidationRules[url];
    }
    
    // 2. 动态路径模式匹配
    // 匹配 /articles/{id}/top 模式
    if (/^\/articles\/\d+\/top$/.test(url)) {
        return cacheInvalidationRules['/articles/{id}/top'] || null;
    }
    
    // 匹配 /article-posts/{id}/top 模式
    if (/^\/article-posts\/\d+\/top$/.test(url)) {
        return cacheInvalidationRules['/article-posts/{id}/top'] || null;
    }
    
    // 匹配 /course-posts/{id}/top 模式
    if (/^\/course-posts\/\d+\/top$/.test(url)) {
        return cacheInvalidationRules['/course-posts/{id}/top'] || null;
    }
    
    return null;
};

