/**
 * 页面恢复状态（内存 Map）。各页面的 use*Restore 在 value JSON 内带 timestamp；
 * pruneExpiredEntries 会移除超时未再访问的条目，避免长期占用。
 */
class StateStorage {
    constructor() {
        this.stateStorage = new Map();
    }

    getItem(key) {
        const value = this.stateStorage.get(key);
        if (value == null) return null;
        try {
            const parsed = JSON.parse(value);
            if (parsed?.timestamp && this._isExpired(parsed.timestamp)) {
                this.stateStorage.delete(key);
                return null;
            }
        } catch {
            // 非 JSON 条目原样返回
        }
        return value;
    }

    setItem(key, value) {
        this.stateStorage.set(key, value);
    }

    removeItem(key) {
        this.stateStorage.delete(key);
    }

    clear() {
        this.stateStorage.clear();
    }

    /**
     * 移除带 timestamp 且已超过 maxAgeMs 的页面状态。
     * @param {number} maxAgeMs
     * @returns {number} 删除条数
     */
    pruneExpiredEntries(maxAgeMs = 30 * 60 * 1000) {
        const limit = Number(maxAgeMs);
        if (!Number.isFinite(limit) || limit <= 0) return 0;
        const now = Date.now();
        let removed = 0;
        for (const [key, value] of this.stateStorage.entries()) {
            try {
                const parsed = JSON.parse(value);
                if (parsed?.timestamp && now - parsed.timestamp > limit) {
                    this.stateStorage.delete(key);
                    removed += 1;
                }
            } catch {
                // 忽略无法解析的条目
            }
        }
        return removed;
    }

    _isExpired(timestamp) {
        const ts = Number(timestamp);
        if (!Number.isFinite(ts)) return false;
        return Date.now() - ts > 30 * 60 * 1000;
    }
}

const stateStorage = new StateStorage();
export default stateStorage;