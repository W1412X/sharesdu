# 缓存系统设计文档

## 一、缓存系统架构

本项目采用多层次的缓存架构，主要包括以下组件：

### 1.1 核心缓存组件

#### LRUCache（`src/utils/lru_cache.js`）
基础的 LRU（Least Recently Used）缓存实现，是所有缓存的基础组件。

**特性：**
- ✅ 支持 TTL（Time To Live）过期时间
- ✅ 支持最大条目数限制（LRU 淘汰策略）
- ✅ 支持自定义回收处理函数（dispose）
- ✅ 支持访问时刷新 TTL（refreshTTLOnGet）
- ✅ 自动过期清理

**关键方法：**
```javascript
get(key)        // 获取缓存值，自动刷新过期时间
set(key, value, options)  // 设置缓存，支持自定义 TTL
delete(key)     // 删除指定缓存
clear()         // 清空所有缓存
has(key)        // 检查缓存是否存在
invalidateBy(predicate)  // 按条件批量失效
```

#### ResponseBuffer（`src/utils/response_cacher.js`）
基于 LRUCache 的 HTTP 响应缓存器。

**配置：**
- 最大容量：默认 200 条（可配置）
- 默认过期时间：10 分钟（可配置）

**关键方法：**
```javascript
addResponse(key, response, options)  // 添加响应缓存
getResponse(key)                     // 获取响应缓存
deleteResponse(key)                  // 删除指定响应缓存
clear()                              // 清空所有响应缓存
invalidateBy(predicate)              // 按条件批量失效
```

#### ImageCacher（`src/utils/global_img_cache.js`）
基于 LRUCache 的图片缓存器，专门用于缓存图片 URL 和 Blob 对象。

**配置：**
- `globalProfileCacher`：用户头像缓存（最大 3000 条，TTL 1 小时）
- `globalImageCacher`：通用图片缓存（最大 200 条，TTL 30 分钟）

**特殊功能：**
- 自动处理 Blob URL 回收（防止内存泄漏）
- 支持并发请求去重（remember 方法）
- 支持图片加载函数的缓存封装

**关键方法：**
```javascript
addImage(imgKey, img, options)       // 添加图片缓存
getImage(imgKey)                     // 获取图片缓存
deleteImage(imgKey)                  // 删除指定图片缓存
clear()                              // 清空所有图片缓存
remember(imgKey, loader, options)    // 并发安全的缓存加载器
```

### 1.2 HTTP 请求缓存层

#### AxiosWithCache（`src/axios/axios.js`）
封装了缓存功能的 HTTP 请求类，提供完善的缓存管理机制。

**特性：**
- ✅ GET 请求自动缓存（默认启用）
- ✅ POST/PUT/PATCH/DELETE 请求后自动失效相关缓存
- ✅ 支持自定义缓存 TTL
- ✅ 支持并发请求去重（inFlightRequests）
- ✅ 智能缓存键生成（基于 method、url、params、data、headers）
- ✅ 仅缓存 JSON 响应（status 200-299，content-type: application/json）

**缓存失效机制：**
支持三种缓存失效方式：

1. **按 URL 失效**：自动失效包含指定 URL 的所有缓存键
2. **按键数组失效**：批量失效指定的缓存键
3. **按谓词函数失效**：使用自定义函数判断哪些缓存需要失效

### 1.3 缓存层级结构

```
┌─────────────────────────────────────┐
│    应用层（API 调用）                │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  AxiosWithCache (HTTP 响应缓存)      │
│  - GET 请求缓存                      │
│  - 写操作后缓存失效                   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  ResponseBuffer (响应缓存管理器)      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  LRUCache (基础缓存实现)              │
│  - TTL 过期管理                       │
│  - LRU 淘汰策略                       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  ImageCacher (图片缓存)              │
│  - 用户头像缓存 (globalProfileCacher)│
│  - 通用图片缓存 (globalImageCacher)  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  LRUCache (基础缓存实现)              │
└─────────────────────────────────────┘
```

## 二、缓存配置详情

### 2.1 HTTP 响应缓存配置

**位置：** `src/axios/axios.js`

```javascript
const DEFAULT_CACHE_TTL = 10 * 60 * 1000; // 10 分钟

this.cacher = new ResponseBuffer(200, this.defaultTTL);  // 最大 200 条
```

**缓存键生成规则：**
```
缓存键 = method + '|' + url + '|params:' + params + '|data:' + data + '|headers:' + headers + '|rest:' + rest
```

### 2.2 图片缓存配置

**位置：** `src/utils/global_img_cache.js`

```javascript
// 用户头像缓存
export const globalProfileCacher = new ImageCacher({
    maxEntries: 3000,           // 最大 3000 条
    ttl: 60 * 60 * 1000,        // TTL 1 小时
});

// 通用图片缓存
export const globalImageCacher = new ImageCacher({
    maxEntries: 200,            // 最大 200 条
    ttl: 30 * 60 * 1000,        // TTL 30 分钟
});
```

## 三、缓存失效机制

### 3.1 写操作后的自动缓存失效

在 `src/axios/axios.js` 中，所有写操作（POST、PUT、PATCH、DELETE）都会自动触发缓存失效机制。

**实现原理：**

```182:202:web/src/axios/axios.js
    _invalidateAfterMutation(options = {}) {
        const {
            url,
            invalidateCacheKeys,
            invalidateCachePredicate,
        } = options;

        if (url) {
            this.invalidateCacheByUrl(url);
        }
        if (Array.isArray(invalidateCacheKeys)) {
            invalidateCacheKeys.forEach((key) => {
                if (key) {
                    this.invalidateCacheByUrl(key);
                }
            });
        }
        if (typeof invalidateCachePredicate === 'function') {
            this.invalidateCache(invalidateCachePredicate);
        }
    }
```

**使用方式：**

#### 方式一：自动失效（默认行为）
默认情况下，写操作会自动失效与请求 URL 相关的所有缓存：

```javascript
// 创建文章后，自动失效 '/article/create' 相关的缓存
await axiosInstance.post('/article/create', data);

// 编辑文章后，自动失效 '/article/edit' 相关的缓存
await axiosInstance.put('/article/edit', data, { article_id: 123 });
```

#### 方式二：指定失效的缓存键
通过 `invalidateCacheKeys` 参数指定需要失效的 URL 列表：

```javascript
// 创建帖子后，失效文章列表和帖子列表的缓存
await axiosInstance.post('/post/article_post', postData, {
    invalidateCacheKeys: [
        '/article/list',           // 失效文章列表
        '/article/post_list',      // 失效帖子列表
        `/article/detail?article_id=${articleId}`,  // 失效文章详情
    ]
});
```

#### 方式三：使用谓词函数精确控制
通过 `invalidateCachePredicate` 参数使用自定义函数判断需要失效的缓存：

```javascript
// 删除文章后，失效所有与该文章相关的缓存
await axiosInstance.delete(`/article/${articleId}`, {
    invalidateCachePredicate: (cacheKey) => {
        // 失效所有包含该文章 ID 的缓存键
        return cacheKey.includes(`article_id=${articleId}`) ||
               cacheKey.includes(`article_id:${articleId}`) ||
               cacheKey.includes(`/article/${articleId}`);
    }
});
```

### 3.2 手动缓存失效

除了在写操作时自动失效，还可以手动调用失效方法：

```javascript
import axiosInstance from '@/axios/axios';

// 方式一：按 URL 失效
axiosInstance.invalidateCacheByUrl('/article/list');

// 方式二：使用谓词函数失效
axiosInstance.invalidateCache((cacheKey) => {
    return cacheKey.includes('/article/');
});

// 方式三：清空所有缓存
axiosInstance.clearCache();
```

### 3.3 图片缓存失效

图片缓存失效通常由以下情况触发：

1. **手动删除图片缓存：**
```javascript
import { globalImageCacher, globalProfileCacher } from '@/utils/global_img_cache';

// 删除指定图片缓存
globalImageCacher.deleteImage(imageUrl);
globalProfileCacher.deleteImage(userAvatarUrl);

// 清空所有图片缓存
globalImageCacher.clear();
globalProfileCacher.clear();
```

2. **用户头像更新后失效：**
```javascript
// 上传新头像后，失效旧的头像缓存
await uploadProfileImage(file);
globalProfileCacher.deleteImage(`${apiUrl}/image/user?user_id=${userId}`);
```

## 四、数据修改场景的缓存失效实践

### 4.1 文章相关操作

#### 创建文章
```javascript
// 创建文章后，需要失效文章列表缓存
await axiosInstance.post('/article/create', articleData, {
    invalidateCacheKeys: [
        '/article/list',  // 失效文章列表（所有排序和标签的列表）
    ]
});
```

#### 编辑文章
```javascript
// 编辑文章后，需要失效文章详情和文章列表缓存
await axiosInstance.post('/article/edit', articleData, {
    invalidateCacheKeys: [
        `/article/detail?article_id=${articleId}`,  // 失效文章详情
        '/article/list',                            // 失效文章列表
    ]
});
```

#### 删除文章
```javascript
// 删除文章后，需要失效文章详情、文章列表和帖子列表缓存
await axiosInstance.post('/article/delete', { article_id: articleId }, {
    invalidateCachePredicate: (cacheKey) => {
        return cacheKey.includes(`article_id=${articleId}`) ||
               cacheKey.includes(`article_id:${articleId}`) ||
               cacheKey.includes('/article/list');
    }
});
```

### 4.2 帖子相关操作

#### 创建帖子
```javascript
// 创建帖子后，需要失效帖子列表和文章详情缓存
await axiosInstance.post('/post/article_post', postData, {
    invalidateCacheKeys: [
        `/article/post_list?article_id=${articleId}`,  // 失效帖子列表
        `/article/detail?article_id=${articleId}`,     // 失效文章详情（可能包含帖子数量）
    ]
});
```

#### 删除帖子
```javascript
// 删除帖子后，需要失效帖子列表缓存
await axiosInstance.post('/post/delete', { post_id: postId }, {
    invalidateCacheKeys: [
        `/article/post_list?article_id=${articleId}`,  // 失效帖子列表
    ]
});
```

### 4.3 用户信息相关操作

#### 更新用户资料
```javascript
import { globalProfileCacher } from '@/utils/global_img_cache';

// 更新用户资料后，需要失效用户信息缓存和头像缓存
await axiosInstance.post('/user/update_profile', profileData, {
    invalidateCacheKeys: [
        `/user/info?user_id=${userId}`,  // 失效用户信息缓存
    ]
});

// 如果更新了头像，还需要失效头像缓存
globalProfileCacher.deleteImage(`${apiUrl}/image/user?user_id=${userId}`);
```

### 4.4 课程相关操作

#### 创建课程
```javascript
// 创建课程后，需要失效课程列表缓存
await axiosInstance.post('/course/create', courseData, {
    invalidateCacheKeys: [
        '/course/list',  // 失效课程列表
    ]
});
```

#### 编辑课程
```javascript
// 编辑课程后，需要失效课程详情和课程列表缓存
await axiosInstance.post('/course/edit', courseData, {
    invalidateCacheKeys: [
        `/course/detail?course_id=${courseId}`,  // 失效课程详情
        '/course/list',                          // 失效课程列表
    ]
});
```

### 4.5 点赞和收藏操作

#### 点赞/取消点赞
```javascript
// 点赞操作后，需要失效文章详情缓存（包含点赞状态）
await axiosInstance.post('/like/article', { article_id: articleId }, {
    invalidateCacheKeys: [
        `/article/detail?article_id=${articleId}`,  // 失效文章详情
    ]
});
```

#### 收藏/取消收藏
```javascript
// 收藏操作后，需要失效文章详情和收藏列表缓存
await axiosInstance.post('/star/article', { article_id: articleId }, {
    invalidateCacheKeys: [
        `/article/detail?article_id=${articleId}`,  // 失效文章详情
        `/star/list?user_id=${userId}`,             // 失效收藏列表
    ]
});
```

## 五、最佳实践建议

### 5.1 缓存失效策略

1. **精确失效原则**：只失效真正需要失效的缓存，避免过度失效导致性能下降

2. **分层失效策略**：
   - 列表操作失效列表缓存
   - 详情操作失效详情缓存
   - 关联操作失效关联数据缓存

3. **批量失效优化**：对于影响多个缓存的操作，使用 `invalidateCacheKeys` 数组批量失效

4. **复杂失效场景**：使用 `invalidateCachePredicate` 处理复杂的失效逻辑

### 5.2 缓存键设计建议

1. **保持一致性**：缓存键的生成规则要保持一致，便于失效操作

2. **包含关键参数**：缓存键应包含影响结果的所有关键参数（如 article_id、page、sort 等）

3. **避免过度细化**：不要为每个微小差异创建不同的缓存键，合理聚合相似请求

### 5.3 性能优化建议

1. **合理设置 TTL**：
   - 频繁变化的数据：较短的 TTL（如 5-10 分钟）
   - 相对稳定的数据：较长的 TTL（如 30 分钟-1 小时）
   - 用户相关数据：考虑用户行为，设置合适的 TTL

2. **控制缓存容量**：
   - 根据实际使用情况调整 `maxEntries`
   - 监控缓存命中率和内存使用情况

3. **并发请求去重**：
   - 利用 `inFlightRequests` 机制避免重复请求
   - 对于图片加载，使用 `remember` 方法实现并发安全

### 5.4 调试和维护

1. **缓存监控**：
   - 可以通过 `cache.size()` 查看缓存条目数
   - 在开发环境可以添加缓存日志

2. **缓存调试**：
   ```javascript
   // 开发环境下，可以添加缓存调试代码
   if (process.env.NODE_ENV === 'development') {
       console.log('Cache size:', axiosInstance.cacher.cache.size());
       console.log('Cache keys:', Array.from(axiosInstance.cacher.cache.keys()));
   }
   ```

3. **清理策略**：
   - 用户退出登录时，可以考虑清理部分缓存
   - 内存紧张时，可以主动清理部分缓存

## 六、注意事项

1. **缓存一致性**：确保写操作后正确失效相关缓存，避免数据不一致

2. **内存管理**：
   - 图片缓存中的 Blob URL 会自动回收，无需手动管理
   - 注意控制缓存容量，避免内存溢出

3. **缓存键稳定性**：
   - 缓存键生成逻辑要保持稳定，避免因参数顺序变化导致缓存失效

4. **错误处理**：
   - 缓存失效失败不应影响主要业务逻辑
   - 缓存失效的回调函数应该做好错误处理

5. **跨实例问题**：
   - 注意 `src/api/request.js` 和 `src/axios/axios.js` 是两个不同的实例
   - 确保使用一致的实例进行缓存操作

## 七、总结

本项目的缓存系统采用分层设计，从基础的 LRU 缓存到应用层的 HTTP 响应缓存和图片缓存，形成了完整的缓存体系。通过合理的缓存失效机制，确保了数据的实时性，同时通过缓存机制提升了应用性能。

关键要点：
- ✅ 使用 LRU 策略和 TTL 机制管理缓存生命周期
- ✅ GET 请求自动缓存，写操作自动失效相关缓存
- ✅ 支持多种缓存失效方式，灵活处理各种场景
- ✅ 图片缓存独立管理，支持并发安全和资源回收
- ✅ 通过合理的配置和策略，平衡性能和数据一致性

