package com.sharesdu.android.common.utils;

import android.graphics.Bitmap;
import android.util.LruCache;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Future;

/**
 * 图片缓存类
 * 类似web项目中的ImageCacher
 * 支持LRU缓存、TTL、并发去重
 */
public class ImageCache {
    private static final long DEFAULT_IMAGE_TTL = 30 * 60 * 1000; // 30分钟
    
    // 单例实例
    private static ImageCache globalImageCache;
    private static ImageCache globalProfileCache;
    
    private final LruCache<String, CacheEntry> cache;
    private final Map<String, Future<?>> inFlight; // 正在进行的请求
    private final long defaultTTL;
    private final int maxSize;
    
    /**
     * 缓存条目
     */
    private static class CacheEntry {
        final String url; // 处理后的URL或原始URL
        final long createdAt;
        final long expiresAt;
        final Long customTTL;
        
        CacheEntry(String url, long createdAt, long expiresAt, Long customTTL) {
            this.url = url;
            this.createdAt = createdAt;
            this.expiresAt = expiresAt;
            this.customTTL = customTTL;
        }
        
        boolean isExpired() {
            return expiresAt > 0 && System.currentTimeMillis() >= expiresAt;
        }
    }
    
    /**
     * 构造函数
     * @param maxSize 最大缓存条目数
     * @param ttl 默认TTL（毫秒），0表示不过期
     */
    public ImageCache(int maxSize, long ttl) {
        this.maxSize = maxSize;
        this.defaultTTL = ttl;
        this.inFlight = new ConcurrentHashMap<>();
        
        // 创建LRU缓存
        this.cache = new LruCache<String, CacheEntry>(maxSize) {
            @Override
            protected int sizeOf(String key, CacheEntry entry) {
                // 每个条目占用1个单位
                return 1;
            }
            
            @Override
            protected void entryRemoved(boolean evicted, String key, CacheEntry oldValue, CacheEntry newValue) {
                // 缓存条目被移除时的回调
                // 可以在这里进行资源清理
            }
        };
    }
    
    /**
     * 添加图片到缓存
     * @param imgKey 图片key（通常是原始URL）
     * @param url 处理后的URL或原始URL
     * @param ttl 自定义TTL（毫秒），null使用默认TTL
     * @return 缓存的URL
     */
    public String addImage(String imgKey, String url, Long ttl) {
        if (imgKey == null || url == null) {
            return url;
        }
        
        long expiresAt = computeExpiration(ttl);
        CacheEntry entry = new CacheEntry(url, System.currentTimeMillis(), expiresAt, ttl);
        cache.put(imgKey, entry);
        return url;
    }
    
    /**
     * 添加图片到缓存（使用默认TTL）
     */
    public String addImage(String imgKey, String url) {
        return addImage(imgKey, url, null);
    }
    
    /**
     * 获取缓存的图片URL
     * @param imgKey 图片key
     * @return 缓存的URL，如果不存在或已过期返回null
     */
    public String getImage(String imgKey) {
        if (imgKey == null) {
            return null;
        }
        
        CacheEntry entry = cache.get(imgKey);
        if (entry == null) {
            return null;
        }
        
        // 检查是否过期
        if (entry.isExpired()) {
            cache.remove(imgKey);
            return null;
        }
        
        // 如果命中时刷新TTL（可选，这里不实现，因为LruCache会自动调整顺序）
        return entry.url;
    }
    
    /**
     * 删除缓存的图片
     */
    public void deleteImage(String imgKey) {
        if (imgKey != null) {
            cache.remove(imgKey);
        }
    }
    
    /**
     * 清空所有缓存
     */
    public void clear() {
        cache.evictAll();
        inFlight.clear();
    }
    
    /**
     * 检查是否有正在进行的请求
     */
    public boolean isInFlight(String imgKey) {
        return imgKey != null && inFlight.containsKey(imgKey);
    }
    
    /**
     * 添加正在进行的请求
     */
    public void addInFlight(String imgKey, Future<?> future) {
        if (imgKey != null && future != null) {
            inFlight.put(imgKey, future);
        }
    }
    
    /**
     * 移除正在进行的请求
     */
    public void removeInFlight(String imgKey) {
        if (imgKey != null) {
            inFlight.remove(imgKey);
        }
    }
    
    /**
     * 获取正在进行的请求
     */
    public Future<?> getInFlight(String imgKey) {
        return imgKey != null ? inFlight.get(imgKey) : null;
    }
    
    /**
     * 获取缓存大小
     */
    public int size() {
        return cache.size();
    }
    
    /**
     * 计算过期时间
     */
    private long computeExpiration(Long customTTL) {
        long ttl = (customTTL != null && customTTL > 0) ? customTTL : defaultTTL;
        if (ttl <= 0) {
            return 0; // 不过期
        }
        return System.currentTimeMillis() + ttl;
    }
    
    /**
     * 获取全局图片缓存实例（用于普通图片）
     */
    public static ImageCache getGlobalImageCache() {
        if (globalImageCache == null) {
            synchronized (ImageCache.class) {
                if (globalImageCache == null) {
                    globalImageCache = new ImageCache(200, DEFAULT_IMAGE_TTL);
                }
            }
        }
        return globalImageCache;
    }
    
    /**
     * 获取全局头像缓存实例（用于用户头像）
     */
    public static ImageCache getGlobalProfileCache() {
        if (globalProfileCache == null) {
            synchronized (ImageCache.class) {
                if (globalProfileCache == null) {
                    globalProfileCache = new ImageCache(3000, 60 * 60 * 1000); // 1小时
                }
            }
        }
        return globalProfileCache;
    }
}

