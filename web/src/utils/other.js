/**
 * 向后兼容文件
 * 此文件重新导出所有从 other.js 拆分出来的函数
 * 建议逐步迁移到新的模块化文件
 * 
 * @deprecated 请使用新的模块化文件：
 * - format.js - 格式化相关
 * - color.js - 颜色处理
 * - string.js - 字符串处理
 * - url.js - URL处理
 * - dom.js - DOM操作
 * - editor.js - 编辑器相关
 * - post.js - 帖子相关
 * - imageUtils.js - 图片链接处理
 * - auth.js - 认证相关
 * - navigation.js - 导航相关
 * - alert.js - 提示消息
 * - loading.js - 加载状态
 * - common.js - 通用工具
 */

// 格式化相关
export { extractTime, getCurrentFormattedTime, formatRelativeTime } from './format';

// 颜色处理
export { adjustAlpha, hexToRgba } from './color';

// 字符串处理
export { arrToString, stringToArr, copy, uniqueArray } from './string';

// URL处理
export { extractDomain, isExactlySameOrigin, extractLinks } from './url';

// DOM操作
export { isElementAtBottom, isScrollToBottom, debounce, isClickInsideElement, resetRouterScrollPosition } from './dom';

// 编辑器相关
export { 
    extractEditorType, 
    addEditorType, 
    getContentWithoutEditorType,
    setDictString,
    getHeadString,
    addDictFromString
} from './editor';

// 帖子相关
export {
    getLinkInPost,
    addLinkToPost,
    getPostWithoutLink,
    addHeaderToReply,
    getReplyContentWithoutHeader,
    getAuthorNameFromReply,
    getParentReplyIdFromReply
} from './post';

// 图片链接处理
export {
    extractImageLinks,
    extractImageLinksInBrackets,
    removeImageLinksInBrackets,
    formatImageLinkInArticle,
    replaceImageBlob
} from './imageUtils';

// 认证相关
export { setLogin, dealAxiosError } from './auth';

// 导航相关
export { openPage, isDebugHashPath, addDebugToPath } from './navigation';

// 提示消息
export {
    getNormalErrorAlert,
    getNormalSuccessAlert,
    getNormalInfoAlert,
    getNormalWarnAlert,
    getNormalNotificationAlert
} from './alert';

// 加载状态
export { getLoadMsg, getCancelLoadMsg } from './loading';

// 通用工具
export { waitSecond, roundNumber, responseToArticle } from './common';

// 以下函数需要特殊处理或已移动到其他文件
import { globalProperties } from '@/main';

/**
 * 获取用户头像 URL
 * @param {String} userId 
 * @returns {String}
 */
export function getProfileUrl(userId) {
    return globalProperties.$apiUrl + "/image/user?user_id=" + userId;
}
