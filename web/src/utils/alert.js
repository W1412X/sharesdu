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

