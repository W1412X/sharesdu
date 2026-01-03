/**
 * 图片处理相关工具函数
 * 包含图片压缩和图片获取处理函数
 */
import { globalProperties } from '@/main';
import config from '@/config';
import { globalImageCacher } from '@/utils/global_img_cache';

/**
 * 压缩图片
 * @param {File|Blob} file - 图片文件
 * @param {Number} maxSizeKB - 最大文件大小（KB）
 * @returns {Promise<Blob>} 压缩后的图片 Blob
 */
export async function compressImage(file, maxSizeKB) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                // 计算压缩比例
                const maxDimension = 1920; // 最大尺寸
                if (width > maxDimension || height > maxDimension) {
                    if (width > height) {
                        height = (height * maxDimension) / width;
                        width = maxDimension;
                    } else {
                        width = (width * maxDimension) / height;
                        height = maxDimension;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // 尝试不同的质量直到满足大小要求
                let quality = 0.9;
                const tryCompress = () => {
                    canvas.toBlob((blob) => {
                        if (!blob) {
                            reject(new Error('压缩失败'));
                            return;
                        }
                        const sizeKB = blob.size / 1024;
                        if (sizeKB <= maxSizeKB || quality <= 0.1) {
                            resolve(blob);
                        } else {
                            quality -= 0.1;
                            canvas.toBlob(tryCompress, 'image/jpeg', quality);
                        }
                    }, 'image/jpeg', quality);
                };
                tryCompress();
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * 获取并处理图片
 * @param {String} url - 图片 URL
 * @returns {Promise<String>} 处理后的图片 URL
 */
const SUCCESS_CACHE_TTL = 45 * 60 * 1000; // 45 分钟
const ERROR_CACHE_TTL = 5 * 60 * 1000; // 5 分钟
const imageInFlightRequests = new Map();

const resolvePlaceholder = (type = 'svg', state = 'empty') => {
    const dict = globalProperties?.$imgDict || {};
    return (
        dict?.[type]?.[state] ||
        dict?.svg?.[state] ||
        globalProperties?.$imgLazy ||
        '/resource/default_img.svg'
    );
};

export async function fetchImgAndDeal(imgUrl, type = 'svg') {
    if (!imgUrl) {
        return resolvePlaceholder(type, 'empty');
    }
    if (imgUrl === resolvePlaceholder(type, 'upload')) {
        return resolvePlaceholder(type, 'empty');
    }

    const cached = globalImageCacher.getImage(imgUrl);
    if (cached) {
        return cached;
    }

    if (imageInFlightRequests.has(imgUrl)) {
        return imageInFlightRequests.get(imgUrl);
    }

    const requestPromise = (async () => {
        try {
            const { url: resultUrl, ttl } = await fetchAndNormalizeImage(imgUrl, type);
            globalImageCacher.addImage(imgUrl, resultUrl, { ttl });
            return resultUrl;
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(`fetchImgAndDeal: 获取图片 ${imgUrl} 失败`, error);
            const fallback = resolvePlaceholder(type, 'empty');
            globalImageCacher.addImage(imgUrl, fallback, { ttl: ERROR_CACHE_TTL });
            return fallback;
        } finally {
            imageInFlightRequests.delete(imgUrl);
        }
    })();

    imageInFlightRequests.set(imgUrl, requestPromise);
    return requestPromise;
}

async function fetchAndNormalizeImage(imgUrl, type) {
    const response = await fetch(imgUrl);
    if (!response.ok) {
        return handleErrorResponse(response, type);
    }

    const contentType = response.headers.get('Content-Type') || '';
    if (contentType.startsWith('image/')) {
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        return { url: blobUrl, ttl: SUCCESS_CACHE_TTL };
    }

    if (contentType.includes('application/json')) {
        return handleJsonResponse(await response.json(), type);
    }

    return { url: resolvePlaceholder(type, 'empty'), ttl: ERROR_CACHE_TTL };
}

async function handleErrorResponse(response, type) {
    if (response.status === 404) {
        return {
            url: resolvePlaceholder(type, 'notFound'),
            ttl: ERROR_CACHE_TTL,
        };
    }
    if (response.status === 403) {
        // 403 状态可能是审核中（FROZEN）或审核未通过
        // 需要检查响应体来判断
        const contentType = response.headers.get('Content-Type') || '';
        if (contentType.includes('application/json')) {
            try {
                const jsonData = await response.json();
                return handleJsonResponse(jsonData, type);
            } catch (error) {
                // 如果 JSON 解析失败，默认返回审核未通过
                return {
                    url: resolvePlaceholder(type, 'unreviewed'),
                    ttl: ERROR_CACHE_TTL,
                };
            }
        }
        // 如果不是 JSON 响应，默认返回审核未通过
        return {
            url: resolvePlaceholder(type, 'unreviewed'),
            ttl: ERROR_CACHE_TTL,
        };
    }
    return {
        url: resolvePlaceholder(type, 'empty'),
        ttl: ERROR_CACHE_TTL,
    };
}

function handleJsonResponse(jsonData, type) {
    if (jsonData?.status === 403) {
        if (jsonData?.message?.includes('FROZEN')) {
            return {
                url: resolvePlaceholder(type, 'reviewing'),
                ttl: ERROR_CACHE_TTL,
            };
        }
        return {
            url: resolvePlaceholder(type, 'unreviewed'),
            ttl: ERROR_CACHE_TTL,
        };
    }
    if (jsonData?.status === 404) {
        return {
            url: resolvePlaceholder(type, 'notFound'),
            ttl: ERROR_CACHE_TTL,
        };
    }
    return {
        url: resolvePlaceholder(type, 'empty'),
        ttl: ERROR_CACHE_TTL,
    };
}

/**
 * 从内容中提取图片链接（方括号格式）
 * @param {String} inputString 
 * @returns {Array} 图片链接数组
 */
export function extractImageLinksInBrackets(inputString) {
    const regex = /\[(https?:\/\/[^\s\]]+\.(jpg|jpeg|png|gif|webp|bmp)(\?[^\s\]]*)?|data:image\/[a-z+]+;base64,[^"\'>\]]+)\]/gi;
    let result = [];
    let match;

    while ((match = regex.exec(inputString)) !== null) {
        result.push(match[1]);
    }

    return result;
}

/**
 * 从内容中移除图片链接（方括号格式）
 * @param {String} inputString 
 * @returns {String}
 */
export function removeImageLinksInBrackets(inputString) {
    const regex = /\[(https?:\/\/[^\s\]]+\.(jpg|jpeg|png|gif|webp|bmp)(\?[^\s\]]*)?|data:image\/[a-z+]+;base64,[^"\'>\]]+)\]/gi;
    return inputString.replace(regex, '');
}

/**
 * 从字符串中提取图片链接
 * @param {String} inputString 
 * @returns {Array} 图片链接数组
 */
export function extractImageLinks(inputString) {
    // 从配置中读取 baseURL，支持不同环境
    const apiBaseUrl = config.api.baseURL;
    // 转义特殊字符用于正则表达式
    const escapedBaseUrl = apiBaseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`${escapedBaseUrl}/image/get[^\\s")]+`, 'g');
    const matches = inputString.match(regex);
    return matches || [];
}

/**
 * 格式化文章中的图片链接
 * @param {String} content 
 * @returns {Promise<String>}
 */
export async function formatImageLinkInArticle(content) {
    let imgs = extractImageLinks(content);
    let formattedImgs = [];
    for (let i = 0; i < imgs.length; i++) {
        try {
            formattedImgs.push(await fetchImgAndDeal(imgs[i]));
        } catch (error) {
            console.error(`Failed to fetch image ${imgs[i]}:`, error);
            // 如果获取失败，使用原始链接
            formattedImgs.push(imgs[i]);
        }
    }
    for (let i = 0; i < imgs.length; i++) {
        content = content.replace(imgs[i], formattedImgs[i]);
    }
    return content;
}

/**
 * 替换内容中的图片 blob URL
 * @param {json} dict a dictionary blob-url
 * @param {String} content a string which represent the content
 * @returns {String}
 */
export function replaceImageBlob(dict, content) {
    const keys = JSON.parse(JSON.stringify(Object.keys(dict)));
    for (let i = 0; i < keys.length; i++) {
        content = content.replace(keys[i], dict[keys[i]]);
    }
    return content;
}

