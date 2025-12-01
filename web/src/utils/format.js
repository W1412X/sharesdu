/**
 * 格式化相关工具函数
 */

/**
 * 从字符串中提取时间并格式化
 * @param {String} str 
 * @returns {String} 格式化后的时间字符串
 */
export function extractTime(str) {
    try {
        const regex = /.*(\d{4})-(\d{2})-(\d{2}).*(\d{2}):(\d{2}):(\d{2}).*/;
        const match = str.match(regex);

        if (match && match.length === 7) {
            const formattedTime = `${match[1]}-${match[2]}-${match[3]} ${match[4]}:${match[5]}:${match[6]}`;
            return formattedTime;
        } else {
            return "time ungot";
        }
    } catch (e) {
        return "";
    }
}

/**
 * 获取当前时间并格式化为 YYYY-MM-DD HH:mm:ss 字符串
 * @returns {string} 格式化后的时间字符串
 */
export function getCurrentFormattedTime() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需+1
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 解析各种时间格式为 Date 对象
 * @param {String|Number|Date} timeInput - 时间输入，支持多种格式
 * @returns {Date|null} 解析后的 Date 对象，失败返回 null
 */
function parseTime(timeInput) {
    if (!timeInput) {
        return null;
    }

    // 如果已经是Date对象，直接返回
    if (timeInput instanceof Date) {
        return isNaN(timeInput.getTime()) ? null : timeInput;
    }

    // 如果是数字，可能是时间戳
    if (typeof timeInput === 'number') {
        // 判断是秒级时间戳还是毫秒级时间戳
        // 通常毫秒级时间戳大于 946684800000 (2000-01-01)，秒级时间戳小于这个值
        const timestamp = timeInput < 946684800000 ? timeInput * 1000 : timeInput;
        const date = new Date(timestamp);
        return isNaN(date.getTime()) ? null : date;
    }

    // 转换为字符串进行处理
    const timeStr = String(timeInput).trim();
    if (!timeStr) {
        return null;
    }

    // 尝试方法1: 直接使用 Date 构造函数（支持 ISO 8601 格式）
    // 例如: 2025-07-01T15:06:06.622488+00:00, 2025-07-01T15:06:06Z, 2025-07-01T15:06:06+08:00
    // Date 构造函数原生支持 ISO 8601 格式，包括带时区的格式
    let date = new Date(timeStr);
    if (!isNaN(date.getTime())) {
        // 验证解析结果是否合理（避免解析为无效日期）
        const year = date.getFullYear();
        if (year >= 1970 && year <= 2100) {
            return date;
        }
    }

    // 尝试方法2: 如果是纯数字字符串，可能是时间戳
    if (/^\d+$/.test(timeStr)) {
        const num = Number(timeStr);
        const timestamp = num < 946684800000 ? num * 1000 : num;
        date = new Date(timestamp);
        if (!isNaN(date.getTime())) {
            return date;
        }
    }

    // 尝试方法3: 使用 extractTime 提取标准格式
    // 例如: 2025-07-01 15:06:06 或包含日期的字符串
    const extractedTime = extractTime(timeStr);
    if (extractedTime && extractedTime !== "time ungot" && extractedTime !== "") {
        date = new Date(extractedTime);
        if (!isNaN(date.getTime())) {
            return date;
        }
    }

    // 尝试方法4: 处理 ISO 8601 格式的变体
    // 例如: 2025-07-01T15:06:06.622488, 2025-07-01T15:06:06.622488+00:00
    // 匹配更宽松的 ISO 8601 格式
    const isoPatterns = [
        // 标准 ISO 8601: 2025-07-01T15:06:06.622488+00:00
        /^(\d{4}-\d{2}-\d{2})[T\s](\d{2}):(\d{2}):(\d{2})(\.\d+)?([\+\-]\d{2}:?\d{2}|Z)?$/,
        // 简化格式: 2025-07-01T15:06:06
        /^(\d{4}-\d{2}-\d{2})[T\s](\d{2}):(\d{2}):(\d{2})$/,
        // 带空格: 2025-07-01 15:06:06.622488
        /^(\d{4}-\d{2}-\d{2})\s+(\d{2}):(\d{2}):(\d{2})(\.\d+)?$/,
    ];
    
    for (const pattern of isoPatterns) {
        const match = timeStr.match(pattern);
        if (match) {
            const datePart = match[1];
            const hour = match[2];
            const minute = match[3];
            const second = match[4];
            // 尝试不同的组合
            const formats = [
                `${datePart} ${hour}:${minute}:${second}`,
                `${datePart}T${hour}:${minute}:${second}`,
            ];
            for (const fmt of formats) {
                date = new Date(fmt);
                if (!isNaN(date.getTime())) {
                    const year = date.getFullYear();
                    if (year >= 1970 && year <= 2100) {
                        return date;
                    }
                }
            }
        }
    }

    // 尝试方法5: 处理其他常见格式
    // 例如: 2025/07/01 15:06:06, 07/01/2025 15:06:06
    const commonFormats = [
        /(\d{4})[\/\-](\d{2})[\/\-](\d{2})[\sT](\d{2}):(\d{2}):(\d{2})/, // YYYY-MM-DD HH:mm:ss
        /(\d{2})[\/\-](\d{2})[\/\-](\d{4})[\sT](\d{2}):(\d{2}):(\d{2})/, // MM-DD-YYYY HH:mm:ss
        /(\d{4})[\/\-](\d{2})[\/\-](\d{2})[\sT](\d{2}):(\d{2})/, // YYYY-MM-DD HH:mm
        /(\d{2}):(\d{2}):(\d{2})[\sT](\d{4})[\/\-](\d{2})[\/\-](\d{2})/, // HH:mm:ss YYYY-MM-DD
    ];

    for (const pattern of commonFormats) {
        const match = timeStr.match(pattern);
        if (match) {
            if (match[1].length === 4) {
                // YYYY-MM-DD 格式
                date = new Date(`${match[1]}-${match[2]}-${match[3]} ${match[4]}:${match[5]}:${match[6] || '00'}`);
            } else if (match.length >= 7 && match[4] && match[4].length === 4) {
                // HH:mm:ss YYYY-MM-DD 格式
                date = new Date(`${match[4]}-${match[5]}-${match[6]} ${match[1]}:${match[2]}:${match[3]}`);
            } else {
                // MM-DD-YYYY 格式
                date = new Date(`${match[3]}-${match[1]}-${match[2]} ${match[4]}:${match[5]}:${match[6] || '00'}`);
            }
            if (!isNaN(date.getTime())) {
                const year = date.getFullYear();
                if (year >= 1970 && year <= 2100) {
                    return date;
                }
            }
        }
    }

    // 尝试方法6: 更宽松的日期时间提取
    // 尝试提取任何看起来像日期时间的部分
    const loosePatterns = [
        // 提取 YYYY-MM-DD HH:mm:ss 格式（允许前后有其他字符）
        /(\d{4}[-/]\d{1,2}[-/]\d{1,2})[\sT]?(\d{1,2}:\d{1,2}:\d{1,2})/,
        // 提取 YYYY-MM-DD 格式（只有日期）
        /(\d{4}[-/]\d{1,2}[-/]\d{1,2})/,
    ];

    for (const pattern of loosePatterns) {
        const match = timeStr.match(pattern);
        if (match) {
            const datePart = match[1].replace(/\//g, '-');
            const timePart = match[2] || '00:00:00';
            // 标准化日期部分（确保月份和日期是两位数）
            const dateParts = datePart.split('-');
            if (dateParts.length === 3) {
                const normalizedDate = `${dateParts[0]}-${dateParts[1].padStart(2, '0')}-${dateParts[2].padStart(2, '0')}`;
                date = new Date(`${normalizedDate} ${timePart}`);
                if (!isNaN(date.getTime())) {
                    const year = date.getFullYear();
                    if (year >= 1970 && year <= 2100) {
                        return date;
                    }
                }
            }
        }
    }

    // 尝试方法7: 最后的兜底策略 - 尝试提取任何数字并组合
    // 如果前面所有方法都失败，尝试从字符串中提取所有数字并尝试组合
    const allNumbers = timeStr.match(/\d+/g);
    if (allNumbers && allNumbers.length >= 6) {
        // 尝试组合为 YYYY-MM-DD HH:mm:ss
        try {
            const year = allNumbers[0].length === 4 ? allNumbers[0] : 
                        (allNumbers.find(n => n.length === 4) || allNumbers[0]);
            const month = allNumbers.find(n => n.length <= 2 && parseInt(n) >= 1 && parseInt(n) <= 12) || allNumbers[1];
            const day = allNumbers.find(n => n.length <= 2 && parseInt(n) >= 1 && parseInt(n) <= 31) || allNumbers[2];
            const hour = allNumbers.find(n => n.length <= 2 && parseInt(n) >= 0 && parseInt(n) <= 23) || allNumbers[3];
            const minute = allNumbers.find(n => n.length <= 2 && parseInt(n) >= 0 && parseInt(n) <= 59) || allNumbers[4];
            const second = allNumbers.find(n => n.length <= 2 && parseInt(n) >= 0 && parseInt(n) <= 59) || allNumbers[5];
            
            if (year && month && day && hour !== undefined && minute !== undefined && second !== undefined) {
                date = new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`);
                if (!isNaN(date.getTime())) {
                    const yearNum = date.getFullYear();
                    if (yearNum >= 1970 && yearNum <= 2100) {
                        return date;
                    }
                }
            }
        } catch (e) {
            // 忽略错误，继续返回 null
        }
    }

    return null;
}

/**
 * 将时间字符串转换为相对时间显示（如：刚刚、几分钟前、几小时前等）
 * @param {String|Number|Date} timeStr - 时间字符串、时间戳或Date对象，支持多种格式：
 *   - ISO 8601: 2025-07-01T15:06:06.622488+00:00, 2025-07-01T15:06:06Z
 *   - 标准格式: 2025-07-01 15:06:06
 *   - 时间戳: 1720000000000 (毫秒) 或 1720000000 (秒)
 *   - Date 对象
 *   - 其他常见格式: 2025/07/01 15:06:06
 * @returns {String} 格式化后的相对时间字符串
 */
export function formatRelativeTime(timeStr) {
    if (!timeStr) {
        return "时间未知";
    }

    // 使用增强的解析函数
    const targetDate = parseTime(timeStr);
    
    if (!targetDate) {
        // 如果解析失败，返回原始字符串
        // 在开发环境下输出调试信息
        if (typeof window !== 'undefined' && (window.location?.hostname === 'localhost' || window.location?.hostname === '127.0.0.1')) {
            console.warn('时间解析失败，显示原始值:', {
                input: timeStr,
                type: typeof timeStr,
                value: String(timeStr)
            });
        }
        return String(timeStr);
    }

    const now = new Date();
    const diffMs = now.getTime() - targetDate.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    // 未来时间
    if (diffMs < 0) {
        return "刚刚";
    }

    // 刚刚（1分钟内）
    if (diffSeconds < 60) {
        return "刚刚";
    }

    // 几分钟前
    if (diffMinutes < 60) {
        return `${diffMinutes}分钟前`;
    }

    // 几小时前
    if (diffHours < 24) {
        return `${diffHours}小时前`;
    }

    // 几天前
    if (diffDays < 7) {
        return `${diffDays}天前`;
    }

    // 几周前
    if (diffWeeks < 4) {
        return `${diffWeeks}周前`;
    }

    // 几个月前
    if (diffMonths < 12) {
        return `${diffMonths}个月前`;
    }

    // 几年前
    if (diffYears >= 1 && diffYears < 2) {
        return "1年前";
    }

    // 超过一年，显示具体日期
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    const hours = String(targetDate.getHours()).padStart(2, '0');
    const minutes = String(targetDate.getMinutes()).padStart(2, '0');

    // 如果是今年，不显示年份
    if (year === now.getFullYear()) {
        return `${month}-${day} ${hours}:${minutes}`;
    }

    // 超过一年，显示完整日期
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

