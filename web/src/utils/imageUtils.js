/**
 * 图片处理相关工具函数
 * 包含图片压缩和图片获取处理函数
 */
import config from '@/config';

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
 * @param {String} format - 图片格式（可选）
 * @returns {Promise<String>} 处理后的图片 URL
 */
export async function fetchImgAndDeal(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch (error) {
        console.error('Error fetching image:', error);
        throw error;
    }
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

