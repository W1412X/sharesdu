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

