/**
 * 帖子相关工具函数
 */

/**
 * 从帖子内容中提取链接
 * @param {String} content 
 * @returns {String|null} 链接或 null
 */
export function getLinkInPost(content) {
    let begin = content.split("\n")[0];
    if (begin.startsWith("#/")) {
        return begin;
    } else {
        return null;
    }
}

/**
 * 向帖子内容添加链接
 * @param {String} content 
 * @param {String} type 
 * @param {String} id 
 * @returns {String}
 */
export function addLinkToPost(content, type, id) {
    let link = "#/" + type + "/" + id;
    return link + "\n" + content;
}

/**
 * 获取帖子内容（移除链接部分）
 * @param {String} content 
 * @returns {String}
 */
export function getPostWithoutLink(content) {
    if (content.startsWith("#/")) {
        return content.substring(content.indexOf("\n") + 1);
    } else {
        return content;
    }
}

/**
 * 向回复内容添加头部信息
 * @param {String} content 
 * @param {String} authorName 
 * @param {String} parentReplyId 
 * @returns {String}
 */
export function addHeaderToReply(content, authorName, parentReplyId) {
    return "@" + authorName + "\n" + parentReplyId + "\n" + content;
}

/**
 * 获取回复内容（移除头部信息）
 * @param {String} content 
 * @returns {String}
 */
export function getReplyContentWithoutHeader(content) {
    let tmp = content.substring(content.indexOf("\n") + 1);
    tmp = tmp.substring(tmp.indexOf("\n") + 1);
    return tmp;
}

/**
 * 从回复内容中提取作者名称
 * @param {String} content 
 * @returns {String}
 */
export function getAuthorNameFromReply(content) {
    return content.substring(0, content.indexOf("\n"));
}

/**
 * 从回复内容中提取父回复 ID
 * @param {String} content 
 * @returns {String}
 */
export function getParentReplyIdFromReply(content) {
    let tmp = content.substring(content.indexOf("\n") + 1);
    return tmp.substring(0, tmp.indexOf("\n"));
}

