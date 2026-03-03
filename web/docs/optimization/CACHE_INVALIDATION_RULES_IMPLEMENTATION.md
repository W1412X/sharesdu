# 缓存失效规则配置实现说明

## 实现概述

已按照要求实现了基于配置规则的缓存失效机制，替代了之前简单的自动失效方案。

## 实现内容

### 1. 创建缓存失效规则配置文件

**文件：** `src/api/cache-invalidation-rules.js`

该文件定义了所有 API 端点的缓存失效规则，每个规则可以包含：

- `invalidateCacheKeys`: URL 数组，指定需要失效的缓存键
- `invalidateCachePredicate`: 自定义函数，精确控制哪些缓存需要失效

**特点：**
- ✅ 支持从请求数据中提取 ID（article_id, course_id, post_id 等）
- ✅ 支持精确的缓存失效匹配
- ✅ 覆盖了所有主要的 API 端点

### 2. 迁移并增强请求实例

**文件：** `src/api/request.js`

已将 `src/axios/axios.js` 的完善实现迁移到 `src/api/request.js`，并集成缓存失效规则配置。

**主要改进：**
- ✅ 使用更稳定的缓存键生成机制（`stableStringify`）
- ✅ 支持并发请求去重（`inFlightRequests`）
- ✅ 集成缓存失效规则配置
- ✅ 支持三级缓存失效优先级：
  1. 手动指定的失效规则（最高优先级）
  2. 配置规则中的失效规则
  3. 默认失效行为（如果没有配置）

## 缓存失效规则配置说明

### 配置格式

```javascript
'/api/endpoint': {
    // 方式一：指定需要失效的 URL 列表
    invalidateCacheKeys: [
        '/article/list',
        '/article/detail',
    ],
    
    // 方式二：使用自定义函数精确控制
    invalidateCachePredicate: (cacheKey, url, data) => {
        // cacheKey: 缓存键
        // url: 请求的 URL
        // data: 请求的数据
        // 返回 true 表示需要失效该缓存
        return cacheKey.includes('/article/list');
    },
}
```

### 已配置的规则示例

#### 文章相关

```javascript
'/article/create': {
    invalidateCacheKeys: [
        '/article/list',  // 创建文章后失效文章列表
    ],
},

'/article/edit': {
    invalidateCachePredicate: (cacheKey, url, data) => {
        const articleId = extractArticleId(data);
        // 失效文章列表、文章详情和该文章相关的所有缓存
        return cacheKey.includes('/article/list') || 
               cacheKey.includes('/article/detail') ||
               (articleId && cacheKey.includes(`article_id=${articleId}`));
    },
},
```

#### 帖子相关

```javascript
'/post/article_post': {
    invalidateCachePredicate: (cacheKey, url, data) => {
        const articleId = extractArticleId(data);
        // 创建帖子后失效帖子列表和文章详情
        return cacheKey.includes('/article/post_list') || 
               cacheKey.includes('/article/detail') ||
               (articleId && cacheKey.includes(`article_id=${articleId}`));
    },
},
```

## 工作原理

### 缓存失效流程

```
写操作（POST/PUT/PATCH/DELETE）
    ↓
_invalidateAfterMutation()
    ↓
┌─────────────────────────────────┐
│ 1. 检查是否有手动指定的规则      │
│    - invalidateCacheKeys        │
│    - invalidateCachePredicate   │
└─────────────────────────────────┘
    ↓ 如果没有手动指定
┌─────────────────────────────────┐
│ 2. 查找配置规则                  │
│    - getCacheInvalidationRule() │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ 3. 应用配置规则                  │
│    - invalidateCacheKeys        │
│    - invalidateCachePredicate   │
└─────────────────────────────────┘
    ↓ 如果没有配置规则
┌─────────────────────────────────┐
│ 4. 使用默认行为                  │
│    - 失效包含该 URL 的缓存       │
└─────────────────────────────────┘
```

### 使用示例

#### 自动使用配置规则（推荐）

```javascript
import axiosInstance from '@/api/request';

// 创建文章 - 自动使用配置规则失效缓存
await axiosInstance.post('/article/create', articleData);
// 会自动失效 '/article/list' 的缓存

// 编辑文章 - 自动使用配置规则失效缓存
await axiosInstance.post('/article/edit', { 
    article_id: 123, 
    title: '新标题' 
});
// 会自动失效文章列表、文章详情和该文章相关的所有缓存
```

#### 手动指定失效规则（覆盖配置）

```javascript
import axiosInstance from '@/api/request';

// 手动指定需要失效的缓存（会覆盖配置规则）
await axiosInstance.post('/article/create', articleData, {
    invalidateCacheKeys: [
        '/article/list',
        '/article/detail',
    ]
});

// 使用自定义谓词函数（会覆盖配置规则）
await axiosInstance.post('/article/edit', articleData, {
    invalidateCachePredicate: (cacheKey) => {
        return cacheKey.includes('/article/');
    }
});
```

## 配置规则覆盖范围

已为以下 API 端点配置了缓存失效规则：

### 文章相关
- ✅ `/article/create` - 创建文章
- ✅ `/article/edit` - 编辑文章
- ✅ `/article/delete` - 删除文章

### 帖子相关
- ✅ `/post/article_post` - 在文章中创建帖子
- ✅ `/post/course_post` - 在课程中创建帖子
- ✅ `/post/delete` - 删除帖子

### 回复相关
- ✅ `/reply/create` - 创建回复
- ✅ `/reply/delete` - 删除回复

### 课程相关
- ✅ `/course/create` - 创建课程
- ✅ `/course/edit` - 编辑课程
- ✅ `/course/delete` - 删除课程
- ✅ `/course/rate` - 评分课程
- ✅ `/course/edit_rating` - 编辑评分
- ✅ `/admin/courses/freeze` - 冻结/解冻课程
- ✅ `/admin/courses/rollback` - 回滚课程

### 点赞和收藏
- ✅ `/like` - 点赞
- ✅ `/unlike` - 取消点赞
- ✅ `/star` - 收藏
- ✅ `/star/create` - 收藏（创建）
- ✅ `/unstar` - 取消收藏

### 用户相关
- ✅ `/image/profile` - 上传头像
- ✅ `/block` - 屏蔽用户
- ✅ `/unblock` - 取消屏蔽

### 通知和消息
- ✅ `/notifications/read` - 标记通知已读
- ✅ `/messages/send` - 发送消息
- ✅ `/messages/read` - 标记消息已读
- ✅ `/messages/delete` - 删除消息

### 管理相关
- ✅ `/admin/block/user` - 管理员屏蔽用户
- ✅ `/admin/unblock/user` - 管理员取消屏蔽用户
- ✅ `/admin/block/article` - 管理员屏蔽文章
- ✅ `/admin/unblock/article` - 管理员取消屏蔽文章
- ✅ `/admin/invitation-codes` - 创建邀请码

### 其他
- ✅ `/logout` - 登出（清空所有缓存）
- ✅ `/delete_account` - 删除账号（清空所有缓存）

## 优势

### 相比之前的简单实现

1. **精确控制**：可以精确指定哪些缓存需要失效，而不是简单匹配 URL
2. **可配置**：所有失效规则集中管理，易于维护和修改
3. **灵活性**：支持从请求数据中提取参数，实现动态失效
4. **可扩展**：添加新的失效规则只需修改配置文件
5. **向后兼容**：如果没有配置规则，仍然使用默认行为

### 技术优势

1. **稳定的缓存键生成**：使用 `stableStringify` 确保相同参数生成相同缓存键
2. **并发请求去重**：避免重复请求
3. **三级优先级**：手动指定 > 配置规则 > 默认行为
4. **类型安全**：配置规则有明确的格式和参数

## 使用建议

### 1. 默认使用配置规则

对于大多数情况，直接使用 API 即可，配置规则会自动生效：

```javascript
// 无需额外配置，自动失效相关缓存
await axiosInstance.post('/article/create', articleData);
```

### 2. 特殊场景手动指定

如果某个操作有特殊的缓存失效需求，可以手动指定：

```javascript
// 特殊场景：创建文章后需要失效更多缓存
await axiosInstance.post('/article/create', articleData, {
    invalidateCacheKeys: [
        '/article/list',
        '/article/detail',
        '/user/articles',
    ]
});
```

### 3. 添加新规则

如果需要为新的 API 端点添加失效规则，只需在 `cache-invalidation-rules.js` 中添加：

```javascript
'/new/endpoint': {
    invalidateCachePredicate: (cacheKey, url, data) => {
        // 自定义失效逻辑
        return cacheKey.includes('/related/endpoint');
    },
},
```

## 注意事项

1. **缓存键格式**：失效规则需要匹配实际的缓存键格式（`method|url|params:...|data:...|headers:...|rest:...`）

2. **参数提取**：配置规则中的 `extractArticleId`、`extractCourseId` 等函数从请求数据中提取 ID，确保数据结构匹配

3. **性能考虑**：`invalidateCachePredicate` 会对所有缓存键执行，如果缓存条目很多，注意性能

4. **测试建议**：添加新的失效规则后，建议测试确保缓存正确失效

## 总结

通过配置规则的方式实现缓存失效，提供了更精确、更灵活、更易维护的缓存管理方案。所有失效规则集中管理，便于理解和修改，同时保持了向后兼容性。

