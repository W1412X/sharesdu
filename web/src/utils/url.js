/**
 * URL 处理相关工具函数
 */

/**
 * 从 URL 字符串中提取域名
 * @param {String} urlString 
 * @returns {String|null} 域名
 */
export function extractDomain(urlString) {
    try {
        let normalizedUrl = urlString.trim();
        if (!/^https?:\/\//i.test(normalizedUrl)) {
            normalizedUrl = 'https://' + normalizedUrl;
        }
        const url = new URL(normalizedUrl);
        return url.hostname;
    } catch (e) {
        console.error('Invalid URL:', urlString);
        return null;
    }
}

/**
 * 检查 URL 是否同源
 * @param {String} url 
 * @returns {Boolean}
 */
export function isExactlySameOrigin(url) {
    try {
        if (extractDomain(url) == extractDomain(window.location.href)) {
            return true;
        }
        return false;
    } catch (e) {
        console.error('Invalid URL:', url);
        return false;
    }
}

/**
 * 从文本中提取链接
 * @param {String} text 
 * @returns {Array} 链接数组
 */
export function extractLinks(text) {
    const pattern = /https?:\/\/\S+|www\.\S+/gi;
    return (text || '').match(pattern) || [];
}

