/**
 * DOM 操作相关工具函数
 */

/**
 * 检查元素是否在底部
 * @param {Object} element
 * @returns {Boolean}
 */
export function isElementAtBottom(element) {
    if (!element) {
        console.error('Element not found');
        return false;
    }
    let rect = element.getBoundingClientRect();
    let windowHeight = window.innerHeight;

    // Check if the bottom of the target element is within the viewport
    if (rect.bottom <= windowHeight && rect.bottom >= 0) {
        return true;
    } else {
        return false;
    }
}

/**
 * 检查是否滚动到底部
 * @param {Object} element 
 * @returns {Boolean}
 */
export function isScrollToBottom(element) {
    return element.scrollHeight - element.scrollTop === element.clientHeight;
}

/**
 * 防抖实现  
 * @param {Function} func 
 * @param {int} delay ms 
 * @returns {Function}
 */
export function debounce(func, delay) {
    let timeout = null;
    return function (...args) {
        //清除上一次的延时器
        if (timeout) {
            clearTimeout(timeout);
        }
        //设置新的延时器
        timeout = setTimeout(() => {
            func.apply(this, args);  //执行传入的函数
        }, delay);
    };
}

/**
 * 检查点击是否在元素内部
 * @param {*} event 
 * @param {*} element 
 * @returns {Boolean}
 */
export function isClickInsideElement(event, element) {
    const rect = element.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

