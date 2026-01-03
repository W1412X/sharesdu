# 缓存失效实现说明

## 实现方案：第一种 - 自动失效（默认行为）

### 实现概述

已在 `src/api/request.js` 中实现了缓存失效的第一种方案：**自动失效（默认行为）**。

### 实现原理

在所有的写操作（POST、PUT、PATCH、DELETE）执行后，自动失效包含该请求 URL 的所有缓存键。

### 核心代码

```44:66:web/src/api/request.js
    async post(url, data, config = {}) {
        const response = await this.axiosInstance.post(url, data, config);
        // 自动失效与该 URL 相关的缓存
        this._invalidateCacheByUrl(url);
        return response;
    }
    async put(url, data, config = {}) {
        const response = await this.axiosInstance.put(url, data, config);
        // 自动失效与该 URL 相关的缓存
        this._invalidateCacheByUrl(url);
        return response;
    }
    async patch(url, data, config = {}) {
        const response = await this.axiosInstance.patch(url, data, config);
        // 自动失效与该 URL 相关的缓存
        this._invalidateCacheByUrl(url);
        return response;
    }
    async delete(url, config = {}) {
        const response = await this.axiosInstance.delete(url, config);
        // 自动失效与该 URL 相关的缓存
        this._invalidateCacheByUrl(url);
        return response;
    }
```

### 失效方法实现

```78:108:web/src/api/request.js
    /**
     * 失效包含指定 URL 的所有缓存键
     * 这是缓存失效的第一种方案：自动失效（默认行为）
     * @param {string} url - 需要失效的 URL 路径
     */
    _invalidateCacheByUrl(url) {
        if (!url) {
            return;
        }
        // 使用 ResponseBuffer 的 invalidateBy 方法批量失效
        this.cacher.invalidateBy((key) => {
            // 缓存键格式：url + JSON.stringify(config)
            // 检查缓存键是否包含该 URL
            return key.includes(url);
        });
    }

    /**
     * 手动失效指定 URL 的缓存（公开方法，供外部调用）
     * @param {string} url - 需要失效的 URL 路径
     */
    invalidateCacheByUrl(url) {
        this._invalidateCacheByUrl(url);
    }

    /**
     * 清空所有缓存
     */
    clearCache() {
        this.cacher.clear();
    }
```

### 工作原理

1. **缓存键格式**：当前实现的缓存键格式为 `url + JSON.stringify(config)`
2. **失效逻辑**：当执行写操作时，会查找所有包含该 URL 的缓存键并失效
3. **自动触发**：所有 POST/PUT/PATCH/DELETE 请求都会自动触发缓存失效

### 使用示例

#### 自动失效示例

```javascript
import axiosInstance from '@/api/request';

// 创建文章后，自动失效包含 '/article/create' 的缓存
await axiosInstance.post('/article/create', articleData);

// 编辑文章后，自动失效包含 '/article/edit' 的缓存
await axiosInstance.post('/article/edit', articleData);

// 删除文章后，自动失效包含 '/article/delete' 的缓存
await axiosInstance.post('/article/delete', { article_id: articleId });
```

#### 手动失效示例

如果需要手动失效特定 URL 的缓存：

```javascript
import axiosInstance from '@/api/request';

// 手动失效文章列表的缓存
axiosInstance.invalidateCacheByUrl('/article/list');

// 清空所有缓存
axiosInstance.clearCache();
```

### 方案特点

#### 优点
1. ✅ **简单易用**：无需额外配置，自动生效
2. ✅ **零侵入**：不需要修改现有的 API 调用代码
3. ✅ **自动化**：所有写操作自动触发缓存失效

#### 局限性
1. ⚠️ **精度有限**：只能失效包含相同 URL 的缓存键
2. ⚠️ **关联失效不足**：无法失效关联资源的缓存（如创建文章后失效文章列表缓存）
3. ⚠️ **URL 匹配简单**：使用字符串包含匹配，可能误失效

### 适用场景

这种方案适用于以下场景：
- 写操作和读操作使用相同或相似的 URL 路径
- 需要快速实现缓存失效功能
- 缓存失效的精确度要求不高

### 注意事项

1. **URL 匹配规则**：当前使用 `key.includes(url)` 进行匹配，这意味着：
   - `/article/list` 会匹配 `/article/list` 和 `/article/list?page=1`
   - 但也可能误匹配 `/article/list_item` 等类似 URL

2. **缓存键格式依赖**：失效逻辑依赖于缓存键的格式（`url + JSON.stringify(config)`），如果缓存键格式改变，失效逻辑也需要相应调整

3. **性能考虑**：批量失效时需要遍历所有缓存键，如果缓存条目很多，可能影响性能

### 后续优化建议

如果需要更精确的缓存失效控制，可以考虑：

1. **方案二：指定失效的缓存键**
   - 在写操作时显式指定需要失效的 URL 列表
   - 支持失效关联资源的缓存

2. **方案三：使用谓词函数精确控制**
   - 通过自定义函数精确判断哪些缓存需要失效
   - 支持复杂的失效逻辑

3. **改进缓存键格式**
   - 使用更结构化的缓存键格式（如 `method|url|hash(params)`）
   - 便于精确匹配和失效

### 测试建议

建议测试以下场景：

1. **基本失效测试**：
   ```javascript
   // 1. GET 请求缓存数据
   await axiosInstance.get('/article/list');
   
   // 2. POST 请求后，相关缓存应该被失效
   await axiosInstance.post('/article/create', data);
   
   // 3. 再次 GET 应该重新请求，不使用缓存
   await axiosInstance.get('/article/list');
   ```

2. **边界情况测试**：
   - URL 为空的写操作
   - 缓存为空时的失效操作
   - 大量缓存条目时的性能测试

### 总结

第一种方案实现了最基本的缓存失效功能，通过自动失效与请求 URL 相关的缓存来保证数据的实时性。虽然精度有限，但实现简单，适用于大多数基础场景。如果后续需要更精细的缓存控制，可以在此基础上扩展实现方案二或方案三。

