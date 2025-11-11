/**
 * 轻量 LRU 缓存，支持 TTL 与自定义回收处理。
 */
export class LRUCache {
    /**
     * @param {Object} options
     * @param {number} options.maxEntries 最大缓存数量
     * @param {number} [options.ttl=0] 默认过期时间（毫秒），0 表示不过期
     * @param {(key: string, value: any) => void} [options.dispose] 淘汰回调
     * @param {boolean} [options.refreshTTLOnGet=true] 命中时是否刷新过期时间
     */
    constructor(options = {}) {
        const {
            maxEntries = 100,
            ttl = 0,
            dispose = null,
            refreshTTLOnGet = true,
        } = options;

        if (maxEntries <= 0) {
            throw new Error('LRUCache: maxEntries 必须大于 0');
        }

        this.maxEntries = maxEntries;
        this.ttl = ttl;
        this.dispose = typeof dispose === 'function' ? dispose : null;
        this.refreshTTLOnGet = refreshTTLOnGet;
        this.cache = new Map();
    }

    /**
     * @param {any} key 
     * @returns {any|null}
     */
    get(key) {
        if (!this.cache.has(key)) {
            return null;
        }
        const entry = this.cache.get(key);
        if (this._isExpired(entry)) {
            this._removeEntry(key, entry.value);
            return null;
        }
        if (this.refreshTTLOnGet) {
            entry.expiresAt = this._computeExpiration(entry.customTTL);
        }
        this.cache.delete(key);
        this.cache.set(key, entry);
        return entry.value;
    }

    /**
     * @param {any} key 
     * @param {any} value 
     * @param {Object} [options]
     * @param {number} [options.ttl] 指定该条目的 TTL（毫秒）
     */
    set(key, value, options = {}) {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        }
        const customTTL = typeof options.ttl === 'number' ? Math.max(options.ttl, 0) : undefined;
        const entry = {
            value,
            createdAt: Date.now(),
            customTTL,
            expiresAt: this._computeExpiration(customTTL),
        };
        this.cache.set(key, entry);
        this._evictIfNeeded();
        return value;
    }

    /**
     * @param {any} key 
     * @returns {boolean}
     */
    has(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return false;
        }
        if (this._isExpired(entry)) {
            this._removeEntry(key, entry.value);
            return false;
        }
        return true;
    }

    /**
     * @param {any} key 
     * @returns {boolean}
     */
    delete(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return false;
        }
        this._removeEntry(key, entry.value);
        return true;
    }

    clear() {
        if (this.dispose) {
            for (const [key, entry] of this.cache.entries()) {
                this.dispose(key, entry.value);
            }
        }
        this.cache.clear();
    }

    /**
     * @returns {number}
     */
    size() {
        return this.cache.size;
    }

    /**
     * @returns {IterableIterator<any>}
     */
    keys() {
        return this.cache.keys();
    }

    /**
     * @param {(value: any, key: any, cache: Map<any, any>) => void} callback 
     */
    forEach(callback) {
        this.cache.forEach((entry, key) => {
            if (!this._isExpired(entry)) {
                callback(entry.value, key, this);
            } else {
                this._removeEntry(key, entry.value);
            }
        });
    }

    _evictIfNeeded() {
        while (this.cache.size > this.maxEntries) {
            const oldestKey = this.cache.keys().next().value;
            if (oldestKey === undefined) {
                break;
            }
            const entry = this.cache.get(oldestKey);
            this._removeEntry(oldestKey, entry.value);
        }
    }

    _computeExpiration(customTTL) {
        const ttl = typeof customTTL === 'number' ? customTTL : this.ttl;
        if (!ttl || ttl <= 0) {
            return null;
        }
        return Date.now() + ttl;
    }

    _isExpired(entry) {
        if (!entry || entry.expiresAt == null) {
            return false;
        }
        return entry.expiresAt <= Date.now();
    }

    _removeEntry(key, value) {
        this.cache.delete(key);
        if (this.dispose) {
            try {
                this.dispose(key, value);
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error('LRUCache dispose 回调执行失败:', error);
            }
        }
    }
}

export default LRUCache;

