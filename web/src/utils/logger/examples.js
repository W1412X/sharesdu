/**
 * Logger 使用示例
 * 这些示例展示了如何在实际项目中使用 logger
 */

import logger, { createLogger, LogLevel, configureLogger, getLoggerConfig } from '@/utils/logger';

// ==================== 示例 1: 基础使用 ====================
export function exampleBasicUsage() {
    logger.debug('这是调试信息');
    logger.info('这是普通信息');
    logger.warn('这是警告信息');
    logger.error('这是错误信息');
}

// ==================== 示例 2: 在 API 调用中使用 ====================
const apiLogger = createLogger('API');

export async function exampleApiCall() {
    apiLogger.groupCollapsed('API 请求', () => {
        apiLogger.debug('请求 URL', '/api/users');
        apiLogger.debug('请求方法', 'GET');
        apiLogger.time('请求耗时');
    });

    try {
        // 模拟 API 调用
        const response = await fetch('/api/users');
        apiLogger.info('请求成功', { status: response.status });
        apiLogger.timeEnd('请求耗时');
        return response;
    } catch (error) {
        apiLogger.error('请求失败', error);
        throw error;
    }
}

// ==================== 示例 3: 在组件中使用 ====================
const componentLogger = createLogger('Component');

export const exampleComponent = {
    data() {
        return {
            userId: null,
        };
    },
    mounted() {
        componentLogger.info('组件已挂载', { componentName: 'UserProfile' });
    },
    watch: {
        userId(newVal, oldVal) {
            componentLogger.debug('userId 变化', { from: oldVal, to: newVal });
        }
    },
    methods: {
        async loadUser() {
            componentLogger.group('加载用户', () => {
                componentLogger.info('开始加载', { userId: this.userId });
                // ... 加载逻辑
                componentLogger.info('加载完成');
            });
        }
    }
};

// ==================== 示例 4: 在缓存管理中使用 ====================
const cacheLogger = createLogger('Cache');

export class ExampleCacheManager {
    constructor() {
        this.cache = new Map();
    }

    get(key) {
        const value = this.cache.get(key);
        if (value) {
            cacheLogger.debug('缓存命中', { key, value });
        } else {
            cacheLogger.debug('缓存未命中', { key });
        }
        return value;
    }

    set(key, value) {
        cacheLogger.info('设置缓存', { key, size: JSON.stringify(value).length });
        this.cache.set(key, value);
    }

    clear() {
        cacheLogger.warn('清空缓存', { size: this.cache.size });
        this.cache.clear();
    }
}

// ==================== 示例 5: 在路由守卫中使用 ====================
const routerLogger = createLogger('Router');

export function exampleRouteGuard(to, from, next) {
    routerLogger.group('路由导航', () => {
        routerLogger.info('从', from.path, '导航到', to.path);
        routerLogger.debug('路由参数', to.params);
        routerLogger.debug('查询参数', to.query);
    });
    next();
}

// ==================== 示例 6: 在状态管理中使用 ====================
const storeLogger = createLogger('Store');

export const exampleStore = {
    state: {
        user: null,
    },
    mutations: {
        SET_USER(state, user) {
            storeLogger.debug('更新用户状态', { userId: user?.id });
            state.user = user;
        }
    },
    actions: {
        async fetchUser({ commit }, id) {
            storeLogger.group('获取用户', () => {
                storeLogger.info('开始获取用户', { id });
                storeLogger.time('获取耗时');
                
                try {
                    const user = await api.getUser(id);
                    storeLogger.debug('用户数据', user);
                    commit('SET_USER', user);
                    storeLogger.info('用户获取完成');
                } catch (error) {
                    storeLogger.error('获取用户失败', error);
                    throw error;
                } finally {
                    storeLogger.timeEnd('获取耗时');
                }
            });
        }
    }
};

// ==================== 示例 7: 性能监控 ====================
const perfLogger = createLogger('Performance');

export async function examplePerformanceMonitoring() {
    perfLogger.time('总耗时');
    
    perfLogger.time('步骤1');
    await step1();
    perfLogger.timeEnd('步骤1');
    
    perfLogger.time('步骤2');
    await step2();
    perfLogger.timeEnd('步骤2');
    
    perfLogger.timeEnd('总耗时');
}

// ==================== 示例 8: 错误处理 ====================
const errorLogger = createLogger('ErrorHandler');

export function exampleErrorHandling(error, context) {
    errorLogger.group('错误处理', () => {
        errorLogger.error('错误信息', error.message);
        errorLogger.error('错误堆栈', error.stack);
        errorLogger.debug('错误上下文', context);
        errorLogger.table(context); // 以表格形式显示上下文
    });
}

// ==================== 示例 9: 配置示例 ====================
export function exampleConfiguration() {
    // 只在开发模式下显示 WARN 及以上级别
    if (process.env.NODE_ENV === 'development') {
        configureLogger({
            minLevel: LogLevel.WARN,
        });
    }

    // 禁用分组功能
    configureLogger({
        enableGrouping: false,
    });

    // 查看当前配置
    const config = getLoggerConfig();
    logger.info('Logger 配置', config);
}

// ==================== 示例 10: 在 IndexPage 中使用 ====================
const indexPageLogger = createLogger('IndexPage');

export function exampleIndexPageIntegration() {
    // 在 beforeRouteLeave 中记录状态
    function beforeRouteLeave(to, from, next) {
        indexPageLogger.group('保存页面状态', () => {
            indexPageLogger.debug('当前 itemType', this.itemType);
            indexPageLogger.debug('滚动位置', document.scrollingElement.scrollTop);
            indexPageLogger.debug('页码信息', this.articlePageNum);
        });
        // ... 保存逻辑
        next();
    }

    // 在 mounted 中恢复状态
    async function mounted() {
        indexPageLogger.group('恢复页面状态', () => {
            const savedState = getSavedState();
            if (savedState) {
                indexPageLogger.info('找到保存的状态', savedState);
                this.itemType = savedState.itemType;
                // ... 恢复逻辑
            } else {
                indexPageLogger.info('未找到保存的状态，使用默认值');
            }
        });
    }

    // 在 loadMore 中记录加载过程
    async function loadMore(itemType) {
        indexPageLogger.groupCollapsed(`加载更多: ${itemType}`, () => {
            indexPageLogger.debug('当前页码', this.articlePageNum[itemType]);
            indexPageLogger.time('加载耗时');
            
            try {
                const response = await fetchData();
                indexPageLogger.info('加载成功', { count: response.length });
                indexPageLogger.debug('响应数据', response);
            } catch (error) {
                indexPageLogger.error('加载失败', error);
            } finally {
                indexPageLogger.timeEnd('加载耗时');
            }
        });
    }
}

// ==================== 示例 11: 在 SearchPage 中使用 ====================
const searchLogger = createLogger('SearchPage');

export function exampleSearchPageIntegration() {
    // 记录搜索操作
    function performSearch(query) {
        searchLogger.group('执行搜索', () => {
            searchLogger.info('搜索关键词', query);
            searchLogger.debug('搜索类型', this.searchType);
            searchLogger.debug('排序方式', this.sortType);
            searchLogger.time('搜索耗时');
        });
    }

    // 记录筛选操作
    function applyFilter(filterType, filterValue) {
        searchLogger.info('应用筛选', { type: filterType, value: filterValue });
        searchLogger.debug('筛选前结果数', this.searchResultNum);
    }
}

