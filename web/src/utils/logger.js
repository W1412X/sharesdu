/**
 * 统一的调试日志工具
 * 仅在开发模式下生效，生产环境自动禁用
 */

// 日志级别枚举
export const LogLevel = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    NONE: 4,
};

// 日志级别名称映射
const LEVEL_NAMES = {
    [LogLevel.DEBUG]: 'DEBUG',
    [LogLevel.INFO]: 'INFO',
    [LogLevel.WARN]: 'WARN',
    [LogLevel.ERROR]: 'ERROR',
};

// 日志级别颜色映射（用于控制台输出）
const LEVEL_COLORS = {
    [LogLevel.DEBUG]: '#6c757d',
    [LogLevel.INFO]: '#0dcaf0',
    [LogLevel.WARN]: '#ffc107',
    [LogLevel.ERROR]: '#dc3545',
};

/**
 * 检测是否为开发模式
 */
function isDevelopment() {
    // 检查 process.env（在构建时会被 webpack DefinePlugin 替换）
    if (typeof process !== 'undefined' && process.env) {
        if (process.env.NODE_ENV === 'production') {
            return false;
        }
        if (process.env.NODE_ENV === 'development') {
            return true;
        }
    }
    
    // 检查 hostname（开发服务器通常使用 localhost）
    if (typeof window !== 'undefined' && window.location) {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || 
            hostname === '127.0.0.1' || 
            hostname === '0.0.0.0' ||
            hostname.includes('localhost')) {
            return true;
        }
    }
    
    // 默认在生产环境禁用
    return false;
}

/**
 * 格式化时间戳
 */
function formatTimestamp() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
}

/**
 * 格式化日志消息
 */
function formatMessage(level, category, message, ...args) {
    const timestamp = formatTimestamp();
    const levelName = LEVEL_NAMES[level] || 'LOG';
    const prefix = `[${timestamp}] [${levelName}]`;
    const categoryPrefix = category ? `[${category}]` : '';
    
    return {
        prefix: `${prefix} ${categoryPrefix}`,
        message,
        args,
        level,
        timestamp,
        category,
    };
}

/**
 * 创建带样式的控制台输出
 */
function createStyledLog(level, formatted) {
    const color = LEVEL_COLORS[level] || '#000000';
    const style = `color: ${color}; font-weight: bold;`;
    return [formatted.prefix, style, formatted.message, ...formatted.args];
}

/**
 * 日志配置
 */
class LoggerConfig {
    constructor() {
        this.enabled = isDevelopment();
        this.minLevel = LogLevel.DEBUG;
        this.showTimestamp = true;
        this.showCategory = true;
        this.enableGrouping = true;
        this.maxDepth = 5; // 对象深度限制
    }

    setMinLevel(level) {
        this.minLevel = level;
    }

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
    }
}

// 全局配置实例
const config = new LoggerConfig();

/**
 * 深度限制的对象序列化（避免循环引用和过深嵌套）
 */
function safeStringify(obj, depth = 0) {
    if (depth > config.maxDepth) {
        return '[Max Depth Reached]';
    }
    
    if (obj === null || obj === undefined) {
        return String(obj);
    }
    
    if (typeof obj === 'function') {
        return `[Function: ${obj.name || 'anonymous'}]`;
    }
    
    if (typeof obj !== 'object') {
        return obj;
    }
    
    if (obj instanceof Error) {
        return {
            name: obj.name,
            message: obj.message,
            stack: obj.stack,
        };
    }
    
    if (Array.isArray(obj)) {
        return obj.map(item => safeStringify(item, depth + 1));
    }
    
    try {
        const result = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                try {
                    result[key] = safeStringify(obj[key], depth + 1);
                } catch (e) {
                    result[key] = '[Circular or Error]';
                }
            }
        }
        return result;
    } catch (e) {
        return '[Stringify Error]';
    }
}

/**
 * 主日志类
 */
class Logger {
    constructor(category = 'App') {
        this.category = category;
    }

    /**
     * 检查是否应该输出日志
     */
    shouldLog(level) {
        return config.enabled && level >= config.minLevel;
    }

    /**
     * 核心日志方法
     */
    _log(level, message, ...args) {
        if (!this.shouldLog(level)) {
            return;
        }

        const formatted = formatMessage(level, this.category, message, ...args);
        const styledArgs = createStyledLog(level, formatted);
        
        // 根据级别选择对应的控制台方法
        const consoleMethod = this.getConsoleMethod(level);
        
        // 输出日志
        consoleMethod(...styledArgs);
        
        // 如果有额外参数，格式化输出
        if (args.length > 0) {
            args.forEach((arg, index) => {
                try {
                    const stringified = safeStringify(arg);
                    if (typeof stringified === 'object') {
                    } else {
                    }
                } catch (e) {
                }
            });
        }
    }

    /**
     * 获取对应的控制台方法
     */
    getConsoleMethod(level) {
        switch (level) {
            case LogLevel.DEBUG:
            case LogLevel.INFO:
            case LogLevel.WARN:
            case LogLevel.ERROR:
            default:
        }
    }

    /**
     * Debug 级别日志
     */
    debug(message, ...args) {
        this._log(LogLevel.DEBUG, message, ...args);
    }

    /**
     * Info 级别日志
     */
    info(message, ...args) {
        this._log(LogLevel.INFO, message, ...args);
    }

    /**
     * Warn 级别日志
     */
    warn(message, ...args) {
        this._log(LogLevel.WARN, message, ...args);
    }

    /**
     * Error 级别日志
     */
    error(message, ...args) {
        this._log(LogLevel.ERROR, message, ...args);
    }

    /**
     * 分组日志（折叠）
     */
    group(label, callback) {
        if (!this.shouldLog(LogLevel.DEBUG) || !config.enableGrouping) {
            if (callback) callback();
            return;
        }
        
        console.group(`%c[${this.category}] ${label}`, `color: ${LEVEL_COLORS[LogLevel.INFO]}; font-weight: bold;`);
        try {
            if (callback) callback();
        } finally {
            console.groupEnd();
        }
    }

    /**
     * 分组折叠日志
     */
    groupCollapsed(label, callback) {
        if (!this.shouldLog(LogLevel.DEBUG) || !config.enableGrouping) {
            if (callback) callback();
            return;
        }
        
        console.groupCollapsed(`%c[${this.category}] ${label}`, `color: ${LEVEL_COLORS[LogLevel.INFO]}; font-weight: bold;`);
        try {
            if (callback) callback();
        } finally {
            console.groupEnd();
        }
    }

    /**
     * 表格输出
     */
    table(data, columns) {
        if (!this.shouldLog(LogLevel.DEBUG)) {
            return;
        }
        if (columns) {
            console.table(data, columns);
        } else {
            console.table(data);
        }
    }

    /**
     * 性能计时
     */
    time(label) {
        if (!this.shouldLog(LogLevel.DEBUG)) {
            return;
        }
        const fullLabel = `[${this.category}] ${label}`;
        console.time(fullLabel);
    }

    timeEnd(label) {
        if (!this.shouldLog(LogLevel.DEBUG)) {
            return;
        }
        const fullLabel = `[${this.category}] ${label}`;
        console.timeEnd(fullLabel);
    }

    /**
     * 断言
     */
    assert(condition, message) {
        if (!this.shouldLog(LogLevel.ERROR)) {
            return;
        }
        if (!condition) {
            this.error(`Assertion failed: ${message}`);
            console.assert(condition, `[${this.category}] ${message}`);
        }
    }

    /**
     * 追踪调用栈
     */
    trace(message) {
        if (!this.shouldLog(LogLevel.DEBUG)) {
            return;
        }
        console.trace();
    }
}

/**
 * 创建指定分类的 Logger 实例
 */
export function createLogger(category) {
    return new Logger(category);
}

/**
 * 默认 Logger 实例
 */
export const logger = createLogger('App');

/**
 * 配置 Logger
 */
export function configureLogger(options = {}) {
    if (options.minLevel !== undefined) {
        config.setMinLevel(options.minLevel);
    }
    if (options.enabled !== undefined) {
        if (options.enabled) {
            config.enable();
        } else {
            config.disable();
        }
    }
    if (options.showTimestamp !== undefined) {
        config.showTimestamp = options.showTimestamp;
    }
    if (options.showCategory !== undefined) {
        config.showCategory = options.showCategory;
    }
    if (options.enableGrouping !== undefined) {
        config.enableGrouping = options.enableGrouping;
    }
    if (options.maxDepth !== undefined) {
        config.maxDepth = options.maxDepth;
    }
}

/**
 * 获取当前配置
 */
export function getLoggerConfig() {
    return {
        enabled: config.enabled,
        minLevel: config.minLevel,
        showTimestamp: config.showTimestamp,
        showCategory: config.showCategory,
        enableGrouping: config.enableGrouping,
        maxDepth: config.maxDepth,
        isDevelopment: isDevelopment(),
    };
}

// 导出默认实例和工具函数
export default logger;

