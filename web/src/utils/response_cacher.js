export class ResponseBuffer {
    constructor(maxCapacity, expirationTime) {
        this.maxCapacity = maxCapacity;
        this.expirationTime = expirationTime;//ms
        this.cache = new Map();
        this.timeouts = new Map();
    }
    addResponse(key, response) {
        if (this.cache.size >= this.maxCapacity) {
            const oldestKey = this.cache.keys().next().value;
            this._removeCache(oldestKey);
        }

        const expirationTimeout = setTimeout(() => {
            this._removeCache(key);
        }, this.expirationTime);
        this.cache.set(key, response);
        this.timeouts.set(key, expirationTimeout);
    }

    getResponse(key) {
        const cachedResponse = this.cache.get(key);
        if (!cachedResponse) {
            return null;
        }
        clearTimeout(this.timeouts.get(key));
        const expirationTimeout = setTimeout(() => {
            this._removeCache(key);
        }, this.expirationTime);
        this.timeouts.set(key, expirationTimeout);
        return cachedResponse;
    }
    _removeCache(key) {
        this.cache.delete(key);
        clearTimeout(this.timeouts.get(key));
        this.timeouts.delete(key);
    }
}
export const responseCacheUrls=[
    
]