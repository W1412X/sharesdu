/**
 * Axios 请求实例配置
 * 提供带缓存的 HTTP 请求客户端
 * baseURL 从配置文件读取，支持环境变量覆盖
 * 集成缓存失效规则配置，自动失效相关缓存
 */
import { getCookie } from '@/utils/cookie';
import { ResponseBuffer } from '@/utils/response_cacher';
import axios from 'axios';
import config from '@/config';
import { getCacheInvalidationRule } from './cache-invalidation-rules';

const JSON_CONTENT_TYPE = 'application/json';
const DEFAULT_CACHE_TTL = 10 * 60 * 1000; // 10 分钟

const isPlainObject = (value) => Object.prototype.toString.call(value) === '[object Object]';

const stableStringify = (value) => {
    if (value === undefined) {
        return 'undefined';
    }
    if (value === null || typeof value === 'number' || typeof value === 'boolean') {
        return JSON.stringify(value);
    }
    if (typeof value === 'string') {
        return JSON.stringify(value);
    }
    if (Array.isArray(value)) {
        return `[${value.map((item) => stableStringify(item)).join(',')}]`;
    }
    if (typeof value === 'function') {
        return '[function]';
    }
    if (value instanceof Date) {
        return `[date:${value.toISOString()}]`;
    }
    if (value instanceof URLSearchParams) {
        return `[params:${value.toString()}]`;
    }
    if (isPlainObject(value)) {
        const sortedKeys = Object.keys(value).sort();
        return `{${sortedKeys.map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
    }
    return JSON.stringify(value);
};

class AxiosWithCache {
    constructor() {
        this.axiosInstance = axios.create({
            baseURL: config.api.baseURL,
            headers: {
                'Authorization': `Bearer ${getCookie('accessToken')}`,
            },
        });
        this.defaultTTL = DEFAULT_CACHE_TTL;
        this.cacher = new ResponseBuffer(200, this.defaultTTL);
        this.inFlightRequests = new Map();
    }

    async get(url, config = {}, useCache = true) {
        const normalizedConfig = config || {};
        const {
            cacheTTL,
            ...axiosConfig
        } = normalizedConfig;
        const cacheKey = this._generateCacheKey('GET', url, axiosConfig);

        if (useCache) {
            const cachedResponse = this.cacher.getResponse(cacheKey);
            if (cachedResponse) {
                return this._cloneCachedResponse(cachedResponse);
            }
            if (this.inFlightRequests.has(cacheKey)) {
                return this.inFlightRequests.get(cacheKey);
            }
        }

        const requestPromise = (async () => {
            try {
                const response = await this.axiosInstance.get(url, axiosConfig);
                if (useCache && this._isCacheableResponse(response)) {
                    const normalized = this._normalizeResponse(response);
                    const ttl = typeof cacheTTL === 'number' ? cacheTTL : this._resolveTTL(url);
                    this.cacher.addResponse(cacheKey, normalized, { ttl });
                    return this._cloneCachedResponse(normalized);
                }
                return response;
            } finally {
                if (useCache) {
                    this.inFlightRequests.delete(cacheKey);
                }
            }
        })();

        if (useCache) {
            this.inFlightRequests.set(cacheKey, requestPromise);
        }

        return requestPromise;
    }

    async post(url, data, config = {}) {
        const {
            invalidateCacheKeys,
            invalidateCachePredicate,
            ...axiosConfig
        } = config || {};
        const response = await this.axiosInstance.post(url, data, axiosConfig);
        this._invalidateAfterMutation({
            url,
            data,
            invalidateCacheKeys,
            invalidateCachePredicate,
        });
        return response;
    }

    async put(url, data, config = {}) {
        const {
            invalidateCacheKeys,
            invalidateCachePredicate,
            ...axiosConfig
        } = config || {};
        const response = await this.axiosInstance.put(url, data, axiosConfig);
        this._invalidateAfterMutation({
            url,
            data,
            invalidateCacheKeys,
            invalidateCachePredicate,
        });
        return response;
    }

    async patch(url, data, config = {}) {
        const {
            invalidateCacheKeys,
            invalidateCachePredicate,
            ...axiosConfig
        } = config || {};
        const response = await this.axiosInstance.patch(url, data, axiosConfig);
        this._invalidateAfterMutation({
            url,
            data,
            invalidateCacheKeys,
            invalidateCachePredicate,
        });
        return response;
    }

    async delete(url, config = {}) {
        const {
            invalidateCacheKeys,
            invalidateCachePredicate,
            ...axiosConfig
        } = config || {};
        const response = await this.axiosInstance.delete(url, axiosConfig);
        // DELETE 请求的 data 在 config 中（axios 的特殊处理）
        const data = axiosConfig.data || (typeof config === 'object' && !Array.isArray(config) ? config.data : undefined);
        this._invalidateAfterMutation({
            url,
            data,
            invalidateCacheKeys,
            invalidateCachePredicate,
        });
        return response;
    }

    async options(url, config = {}) {
        const response = await this.axiosInstance.options(url, config);
        return response;
    }

    async head(url, config = {}) {
        const response = await this.axiosInstance.head(url, config);
        return response;
    }

    invalidateCache(predicate) {
        if (typeof predicate === 'function') {
            this.cacher.invalidateBy((key) => predicate(key));
        }
    }

    invalidateCacheByUrl(url) {
        if (!url) {
            return;
        }
        this.cacher.invalidateBy((key) => key.includes(url));
    }

    clearCache() {
        this.cacher.clear();
    }

    /**
     * 写操作后的缓存失效处理
     * 优先级：手动指定 > 配置规则 > 默认失效
     */
    _invalidateAfterMutation(options = {}) {
        const {
            url,
            data,
            invalidateCacheKeys,
            invalidateCachePredicate,
        } = options;

        // 1. 如果手动指定了失效规则，优先使用手动指定的规则
        if (Array.isArray(invalidateCacheKeys) && invalidateCacheKeys.length > 0) {
            invalidateCacheKeys.forEach((key) => {
                if (key) {
                    this.invalidateCacheByUrl(key);
                }
            });
        }

        if (typeof invalidateCachePredicate === 'function') {
            this.invalidateCache(invalidateCachePredicate);
            return; // 如果手动指定了谓词函数，不再使用配置规则
        }

        // 2. 从配置规则中获取失效规则
        const rule = getCacheInvalidationRule(url);
        if (rule) {
            // 使用配置的 invalidateCacheKeys
            if (Array.isArray(rule.invalidateCacheKeys) && rule.invalidateCacheKeys.length > 0) {
                rule.invalidateCacheKeys.forEach((key) => {
                    if (key) {
                        this.invalidateCacheByUrl(key);
                    }
                });
            }

            // 使用配置的 invalidateCachePredicate
            if (typeof rule.invalidateCachePredicate === 'function') {
                this.invalidateCache((cacheKey) => {
                    return rule.invalidateCachePredicate(cacheKey, url, data);
                });
            }
        } else {
            // 3. 如果没有配置规则，使用默认行为：失效包含该 URL 的缓存
            if (url) {
                this.invalidateCacheByUrl(url);
            }
        }
    }

    _normalizeResponse(response) {
        return {
            data: response.data,
            status: response.status,
            statusText: response.statusText,
            headers: response.headers ? { ...response.headers } : undefined,
            config: response.config ? { ...response.config } : undefined,
        };
    }

    _cloneCachedResponse(cached) {
        return {
            data: cached.data,
            status: cached.status,
            statusText: cached.statusText,
            headers: cached.headers ? { ...cached.headers } : undefined,
            config: cached.config ? { ...cached.config } : undefined,
        };
    }

    _isCacheableResponse(response) {
        if (!response) {
            return false;
        }
        const statusOk = response.status >= 200 && response.status < 300;
        if (!statusOk) {
            return false;
        }
        const contentType = response.headers?.['content-type'];
        if (!contentType) {
            return false;
        }
        return contentType.startsWith(JSON_CONTENT_TYPE);
    }

    _generateCacheKey(method, url, config = {}) {
        const { params, data, headers, ...rest } = config;
        const normalizedHeaders = { ...headers };
        if (normalizedHeaders && normalizedHeaders.Authorization) {
            delete normalizedHeaders.Authorization;
        }
        const keyParts = [
            method.toUpperCase(),
            url,
            `params:${stableStringify(params)}`,
            `data:${stableStringify(data)}`,
            `headers:${stableStringify(normalizedHeaders)}`,
            `rest:${stableStringify(rest)}`,
        ];
        return keyParts.join('|');
    }

    _resolveTTL() {
        return this.defaultTTL;
    }
}

const axiosInstance = new AxiosWithCache();
axiosInstance.axiosInstance.interceptors.request.use(
    (config) => {
        //update token
        config.headers['Authorization'] = `Bearer ${getCookie('accessToken')}`;
        return config;
    }
);
axiosInstance.axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    }
);

export default axiosInstance;
export const axiosInstanceNoHeader = axios.create({
    baseURL: config.api.baseURL,
});
