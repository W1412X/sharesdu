/**
 * 提示消息相关工具函数
 */

/**
 * 获取错误提示消息
 * @param {String} content - which always the response.message 
 * @returns {Object}
 */
export function getNormalErrorAlert(content) {
    return {
        state: true,
        color: 'error',
        title: '请求错误',
        content: content
    }
}

/**
 * 获取成功提示消息
 * @param {String} title 
 * @returns {Object}
 */
export function getNormalSuccessAlert(title) {
    return {
        state: true,
        color: 'success',
        title: title,
        content: '',
    }
}

/**
 * 获取信息提示消息
 * @param {String} title 
 * @returns {Object}
 */
export function getNormalInfoAlert(title) {
    return {
        state: true,
        color: 'info',
        title: title,
        content: '',
    }
}

/**
 * 获取警告提示消息
 * @param {String} title 
 * @returns {Object}
 */
export function getNormalWarnAlert(title) {
    return {
        state: true,
        color: 'warning',
        title: title,
        content: '',
    }
}

/**
 * 获取消息通知提示（可点击跳转到消息页面）
 * @param {String} title - 通知标题
 * @returns {Object}
 */
export function getNormalNotificationAlert(title) {
    return {
        state: true,
        color: 'notification',
        title: title,
        content: '',
        clickable: true, // 标记为可点击
        targetUrl: '#/self?tab=notification', // 跳转目标
    }
}

