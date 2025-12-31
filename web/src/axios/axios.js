import axios from 'axios';
import { apiConfig } from '@/config';
import { getCookie } from '@/utils/cookie';
import { ResponseBuffer } from '@/utils/response_cacher';

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
            baseURL: apiConfig.baseURL,
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
        this._invalidateAfterMutation({
            url,
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

    _resolveTTL(_url) {
        return this.defaultTTL;
    }
}

const axiosInstance = new AxiosWithCache();
axiosInstance.axiosInstance.interceptors.request.use(
    (config) => {
        config.headers['Authorization'] = `Bearer ${getCookie('accessToken')}`;
        return config;
    }
);
axiosInstance.axiosInstance.interceptors.response.use(
    (response) => response
);

export default axiosInstance;
export const axiosInstanceNoHeader = axios.create({
    baseURL: apiConfig.baseURL,
});