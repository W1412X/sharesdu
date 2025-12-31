import { LRUCache } from '@/utils/lru_cache';

const DEFAULT_IMAGE_TTL = 30 * 60 * 1000; // 30 分钟

export class ImageCacher {
    /**
     * @param {number|Object} options
     * @param {number} options.maxEntries 最大缓存条数
     * @param {number} [options.ttl] 每张图片的默认 TTL（毫秒）
     */
    constructor(options) {
        let config = options;
        if (typeof options === 'number') {
            config = { maxEntries: options };
        }
        const {
            maxEntries = 100,
            ttl = DEFAULT_IMAGE_TTL,
        } = config || {};

        this.cache = new LRUCache({
            maxEntries,
            ttl,
            dispose: this._handleDispose.bind(this),
        });
        this.inFlight = new Map();
        this.defaultTTL = ttl;
    }

    addImage(imgKey, img, options = {}) {
        const ttl = typeof options.ttl === 'number' ? options.ttl : this.defaultTTL;
        this.cache.set(imgKey, img, { ttl });
        return img;
    }

    getImage(imgKey) {
        return this.cache.get(imgKey);
    }

    deleteImage(imgKey) {
        this.cache.delete(imgKey);
    }

    clear() {
        this.cache.clear();
    }

    /**
     * 并发去重工具：传入加载函数，自动返回缓存结果。
     * @param {string} imgKey
     * @param {() => Promise<any>} loader
     * @param {Object} options
     */
    async remember(imgKey, loader, options = {}) {
        const cached = this.getImage(imgKey);
        if (cached != null) {
            return cached;
        }
        if (this.inFlight.has(imgKey)) {
            return this.inFlight.get(imgKey);
        }
        const promise = (async () => {
            try {
                const result = await loader();
                if (result != null) {
                    this.addImage(imgKey, result, options);
                }
                return result;
            } finally {
                this.inFlight.delete(imgKey);
            }
        })();
        this.inFlight.set(imgKey, promise);
        return promise;
    }

    _handleDispose(_key, value) {
        if (typeof value === 'string' && value.startsWith('blob:')) {
            URL.revokeObjectURL(value);
        }
    }
}

export const globalProfileCacher = new ImageCacher({
    maxEntries: 3000,
    ttl: 60 * 60 * 1000, // 1 小时
});

export const globalImageCacher = new ImageCacher({
    maxEntries: 200,
    ttl: DEFAULT_IMAGE_TTL,
});