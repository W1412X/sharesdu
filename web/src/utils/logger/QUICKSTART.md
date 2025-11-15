# Logger 快速开始

## 1. 基础导入

```javascript
// 方式 1: 使用默认 logger
import logger from '@/utils/logger';

// 方式 2: 创建分类 logger
import { createLogger } from '@/utils/logger';
const apiLogger = createLogger('API');
```

## 2. 基本使用

```javascript
// 四个日志级别
logger.debug('调试信息', { data: 'test' });
logger.info('普通信息');
logger.warn('警告信息');
logger.error('错误信息', error);
```

## 3. 在现有代码中集成

### IndexPage.vue 示例

```javascript
import { createLogger } from '@/utils/logger';

const indexLogger = createLogger('IndexPage');

export default {
    beforeRouteLeave(to, from, next) {
        indexLogger.group('保存页面状态', () => {
            indexLogger.debug('itemType', this.itemType);
            indexLogger.debug('scrollPosition', document.scrollingElement.scrollTop);
        });
        // ... 原有逻辑
        next();
    },
    async mounted() {
        indexLogger.info('页面已挂载');
        // ... 原有逻辑
    },
    async loadMore(itemType) {
        indexLogger.groupCollapsed(`加载更多: ${itemType}`, () => {
            indexLogger.time('加载耗时');
            // ... 原有逻辑
            indexLogger.timeEnd('加载耗时');
        });
    }
}
```

### SearchPage.vue 示例

```javascript
import { createLogger } from '@/utils/logger';

const searchLogger = createLogger('SearchPage');

export default {
    async load() {
        searchLogger.groupCollapsed('执行搜索', () => {
            searchLogger.debug('搜索类型', this.searchType);
            searchLogger.debug('排序方式', this.sortType);
            searchLogger.time('搜索耗时');
            // ... 原有逻辑
            searchLogger.timeEnd('搜索耗时');
        });
    }
}
```

### API 调用示例

```javascript
import { createLogger } from '@/utils/logger';

const apiLogger = createLogger('API');

async function fetchData(url) {
    apiLogger.groupCollapsed(`GET ${url}`, () => {
        apiLogger.time('请求耗时');
        try {
            const response = await axios.get(url);
            apiLogger.info('请求成功', { status: response.status });
            return response.data;
        } catch (error) {
            apiLogger.error('请求失败', error);
            throw error;
        } finally {
            apiLogger.timeEnd('请求耗时');
        }
    });
}
```

## 4. 配置（可选）

```javascript
import { configureLogger, LogLevel } from '@/utils/logger';

// 只在开发模式显示 WARN 及以上
configureLogger({
    minLevel: LogLevel.WARN,
});
```

## 5. 查看输出

在浏览器控制台中，你会看到：
- 带时间戳的日志
- 带分类标签的日志
- 不同颜色标识的日志级别
- 可折叠的分组日志

## 注意事项

- ✅ 生产环境自动禁用，无需担心性能
- ✅ 仅在开发模式下生效
- ✅ 可以安全地在代码中大量使用
- ⚠️ 避免输出敏感信息（密码、token 等）

