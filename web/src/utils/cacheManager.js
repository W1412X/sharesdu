/**
 * 运行时缓存统一入口：API 响应、图片 blob、页面恢复状态等。
 * 目标：及时清理过期与不再使用的缓存，登出/封禁时避免跨用户残留。
 */
import stateStorage from '@/utils/stateStorage';
import { globalImageCacher, globalProfileCacher } from '@/utils/global_img_cache';

/** @type {{ clearCache?: () => void, pruneStaleCache?: () => void } | null} */
let apiClient = null;

/** 页面恢复状态默认最长保留（与各 use*Restore 的 30min 一致） */
const PAGE_STATE_MAX_AGE_MS = 30 * 60 * 1000;

/** 路由切换后节流执行 prune，避免频繁遍历 */
let pruneScheduled = false;

export const registerApiCacheClient = (client) => {
    if (client && typeof client === 'object') {
        apiClient = client;
    }
};

/**
 * 登出、封禁、删号等场景：清空与用户相关的内存缓存。
 */
export const clearAllRuntimeCaches = () => {
    if (apiClient?.clearCache) {
        apiClient.clearCache();
    }
    globalImageCacher.clear();
    globalProfileCacher.clear();
    stateStorage.clear();
};

/**
 * 清理已过期但仍占位的缓存（不整表清空）。
 */
export const pruneStaleCaches = () => {
    if (apiClient?.pruneStaleCache) {
        apiClient.pruneStaleCache();
    } else if (apiClient?.cacher?.pruneExpired) {
        apiClient.cacher.pruneExpired();
    }
    if (typeof globalImageCacher.cache?.pruneExpired === 'function') {
        globalImageCacher.cache.pruneExpired();
    }
    if (typeof globalProfileCacher.cache?.pruneExpired === 'function') {
        globalProfileCacher.cache.pruneExpired();
    }
    stateStorage.pruneExpiredEntries(PAGE_STATE_MAX_AGE_MS);
};

/**
 * 在下一帧合并多次 prune 请求（如连续路由跳转）。
 */
export const schedulePruneStaleCaches = () => {
    if (pruneScheduled || typeof window === 'undefined') return;
    pruneScheduled = true;
    const run = () => {
        pruneScheduled = false;
        pruneStaleCaches();
    };
    if (typeof window.requestAnimationFrame === 'function') {
        window.requestAnimationFrame(run);
    } else {
        setTimeout(run, 0);
    }
};

/**
 * 用户头像更新后，失效该用户的头像 blob 缓存。
 * @param {string|number} userId
 */
export const invalidateProfileImageCache = (userId) => {
    const id = String(userId || '').trim();
    if (!id) return;
    const matchUser = (key) => key.includes(`user_id=${id}`) || key.includes(`user_id:${id}`);
    globalProfileCacher.invalidateMatching(matchUser);
    globalImageCacher.invalidateMatching(matchUser);
};
