# Logger 使用文档

统一的调试日志工具，仅在开发模式下生效。

## 特性

- ✅ **自动环境检测**：仅在开发模式下输出日志，生产环境自动禁用
- ✅ **多级别日志**：支持 DEBUG、INFO、WARN、ERROR 四个级别
- ✅ **分类管理**：可以为不同模块创建独立的 Logger 实例
- ✅ **格式化输出**：自动添加时间戳、分类标签和颜色标识
- ✅ **分组功能**：支持 console.group 和 console.groupCollapsed
- ✅ **性能计时**：内置 time/timeEnd 方法
- ✅ **安全序列化**：自动处理循环引用和过深嵌套
- ✅ **可配置**：支持自定义日志级别、启用/禁用等

## 快速开始

### 基础使用

```javascript
import logger from '@/utils/logger';

// 不同级别的日志
logger.debug('这是调试信息', { data: 'test' });
logger.info('这是普通信息');
logger.warn('这是警告信息');
logger.error('这是错误信息', new Error('示例错误'));
```

### 创建分类 Logger

```javascript
import { createLogger } from '@/utils/logger';

// 为不同模块创建独立的 Logger
const apiLogger = createLogger('API');
const cacheLogger = createLogger('Cache');
const componentLogger = createLogger('Component');

// 使用
apiLogger.info('发送请求', { url: '/api/users' });
cacheLogger.debug('缓存命中', { key: 'user:123' });
componentLogger.warn('组件状态异常');
```

## API 参考

### 日志级别

```javascript
import { LogLevel } from '@/utils/logger';

// 级别从低到高：DEBUG < INFO < WARN < ERROR
logger.debug('调试信息');    // LogLevel.DEBUG (0)
logger.info('普通信息');     // LogLevel.INFO (1)
logger.warn('警告信息');     // LogLevel.WARN (2)
logger.error('错误信息');     // LogLevel.ERROR (3)
```

### 分组日志

```javascript
// 展开的分组
logger.group('用户操作', () => {
    logger.info('点击按钮');
    logger.info('提交表单');
    logger.debug('表单数据', formData);
});

// 折叠的分组
logger.groupCollapsed('API 请求详情', () => {
    logger.debug('请求 URL', url);
    logger.debug('请求参数', params);
    logger.debug('响应数据', response);
});
```

### 表格输出

```javascript
const users = [
    { id: 1, name: 'Alice', age: 25 },
    { id: 2, name: 'Bob', age: 30 },
];

logger.table(users);
logger.table(users, ['name', 'age']); // 只显示指定列
```

### 性能计时

```javascript
logger.time('数据加载');
// ... 执行一些操作
await loadData();
logger.timeEnd('数据加载'); // 输出: [App] 数据加载: 123.456ms
```

### 断言

```javascript
logger.assert(user !== null, '用户不能为空');
// 如果 condition 为 false，会输出错误日志
```

### 调用栈追踪

```javascript
logger.trace('检查调用栈');
// 会输出当前调用栈信息
```

## 配置

### 全局配置

```javascript
import { configureLogger, LogLevel } from '@/utils/logger';

// 设置最小日志级别（只显示 WARN 及以上）
configureLogger({
    minLevel: LogLevel.WARN,
});

// 禁用日志（即使在开发模式）
configureLogger({
    enabled: false,
});

// 禁用分组功能
configureLogger({
    enableGrouping: false,
});

// 设置对象序列化最大深度
configureLogger({
    maxDepth: 3,
});
```

### 查看当前配置

```javascript
import { getLoggerConfig } from '@/utils/logger';

const config = getLoggerConfig();
console.log(config);
// {
//   enabled: true,
//   minLevel: 0,
//   showTimestamp: true,
//   showCategory: true,
//   enableGrouping: true,
//   maxDepth: 5,
//   isDevelopment: true
// }
```

## 使用场景示例

### 1. API 请求日志

```javascript
import { createLogger } from '@/utils/logger';

const apiLogger = createLogger('API');

async function fetchUser(id) {
    apiLogger.groupCollapsed(`GET /api/users/${id}`, () => {
        apiLogger.debug('请求参数', { id });
        apiLogger.time('请求耗时');
    });
    
    try {
        const response = await axios.get(`/api/users/${id}`);
        apiLogger.info('请求成功', { status: response.status });
        apiLogger.debug('响应数据', response.data);
        return response.data;
    } catch (error) {
        apiLogger.error('请求失败', error);
        throw error;
    } finally {
        apiLogger.timeEnd('请求耗时');
    }
}
```

### 2. 组件生命周期日志

```javascript
import { createLogger } from '@/utils/logger';

const componentLogger = createLogger('UserProfile');

export default {
    mounted() {
        componentLogger.info('组件已挂载', { userId: this.userId });
    },
    watch: {
        userId(newVal, oldVal) {
            componentLogger.debug('userId 变化', { from: oldVal, to: newVal });
        }
    }
}
```

### 3. 缓存操作日志

```javascript
import { createLogger } from '@/utils/logger';

const cacheLogger = createLogger('Cache');

class CacheManager {
    get(key) {
        const value = this.cache.get(key);
        if (value) {
            cacheLogger.debug('缓存命中', { key });
        } else {
            cacheLogger.debug('缓存未命中', { key });
        }
        return value;
    }
    
    set(key, value) {
        cacheLogger.info('设置缓存', { key, size: JSON.stringify(value).length });
        this.cache.set(key, value);
    }
}
```

### 4. 状态管理日志

```javascript
import { createLogger } from '@/utils/logger';

const storeLogger = createLogger('Store');

// 在 Vuex/Pinia store 中使用
const store = {
    mutations: {
        SET_USER(state, user) {
            storeLogger.debug('更新用户状态', { userId: user.id });
            state.user = user;
        }
    },
    actions: {
        async fetchUser({ commit }, id) {
            storeLogger.group('获取用户', () => {
                storeLogger.info('开始获取用户', { id });
                const user = await api.getUser(id);
                storeLogger.debug('用户数据', user);
                commit('SET_USER', user);
                storeLogger.info('用户获取完成');
            });
        }
    }
}
```

## 环境检测

Logger 会自动检测以下条件来判断是否为开发模式：

1. `process.env.NODE_ENV === 'development'`
2. `process.env.NODE_ENV !== 'production'`
3. `window.location.hostname === 'localhost'`
4. `window.location.hostname === '127.0.0.1'`

满足任一条件即视为开发模式。

## 注意事项

1. **生产环境自动禁用**：在生产构建中，所有日志调用都会被优化掉（如果使用 tree-shaking）
2. **性能影响**：虽然生产环境会禁用，但建议不要在热路径（频繁调用的代码）中使用过多日志
3. **敏感信息**：避免在日志中输出敏感信息（密码、token 等）
4. **对象序列化**：大对象或循环引用会被安全处理，但可能影响可读性

## 最佳实践

1. **使用分类 Logger**：为不同模块创建独立的 Logger，便于过滤和查找
2. **合理使用级别**：
   - DEBUG：详细的调试信息
   - INFO：重要的业务流程信息
   - WARN：潜在问题或异常情况
   - ERROR：错误和异常
3. **使用分组**：将相关的日志放在同一个分组中，便于查看
4. **性能计时**：使用 time/timeEnd 来测量关键操作的性能

