import { LRUCache } from '@/utils/lru_cache';

export class ResponseBuffer {
    /**
     * @param {number} maxCapacity
     * @param {number} expirationTime 毫秒
     */
    constructor(maxCapacity, expirationTime) {
        this.cache = new LRUCache({
            maxEntries: maxCapacity,
            ttl: expirationTime,
        });
    }

    addResponse(key, response, options = {}) {
        this.cache.set(key, response, options);
    }

    getResponse(key) {
        return this.cache.get(key);
    }

    deleteResponse(key) {
        this.cache.delete(key);
    }

    clear() {
        this.cache.clear();
    }

    /**
     * 批量失效
     * @param {(key: string) => boolean} predicate
     */
    invalidateBy(predicate) {
        const keysToDelete = [];
        for (const key of this.cache.keys()) {
            if (predicate(key)) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach((key) => this.cache.delete(key));
    }
}

export const responseCacheUrls = [];