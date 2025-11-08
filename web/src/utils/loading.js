/**
 * 加载状态相关工具函数
 */

/**
 * 获取加载消息
 * @param {String} text load message
 * @param {int} progress always -1 if there's no progress requirement 
 * @returns {Object}
 */
export function getLoadMsg(text, progress = -1) {
    return {
        state: true,
        text: text,
        progress: progress
    }
}

/**
 * 取消加载视图
 * @returns {Object}
 */
export function getCancelLoadMsg() {
    return {
        state: false,
        text: '加载中...',
        progress: -1
    }
}

