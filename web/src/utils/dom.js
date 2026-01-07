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

/**
 * 重置路由容器的滚动位置
 * 用于解决全局共享滚动容器导致的滚动位置残留问题
 * 应该在页面的 onMounted 中调用，如果没有恢复状态，则重置为0
 * @param {Boolean} shouldReset - 是否应该重置（通常是没有恢复状态时）
 */
export function resetRouterScrollPosition(shouldReset = true) {
    if (!shouldReset) {
        return;
    }
    
    // 使用 nextTick 和 requestAnimationFrame 确保在 DOM 更新后执行
    setTimeout(() => {
        const scrollElement = document.getElementById('router-view-container');
        if (scrollElement) {
            scrollElement.scrollTop = 0;
        }
    }, 0);
}

