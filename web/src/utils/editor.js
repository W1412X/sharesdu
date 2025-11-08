/**
 * 编辑器相关工具函数
 */

/**
 * 从内容中提取编辑器类型
 * @param {String} content 
 * @returns {String} 'html' 或 'md'
 */
export function extractEditorType(content) {
    let editor = content.substring(0, 4);
    if (editor == "html") {
        return "html";
    } else {
        return "md";
    }
}

/**
 * 向内容添加编辑器类型前缀
 * @param {String} content 
 * @param {String} editorType 
 * @returns {String}
 */
export function addEditorType(content, editorType) {
    return editorType + content;
}

/**
 * 移除内容中的编辑器类型前缀
 * @param {String} content 
 * @returns {String}
 */
export function getContentWithoutEditorType(content) {
    let editorType = extractEditorType(content);
    if (editorType == "html") {
        return content.substring(4);
    } else {
        return content.substring(2);
    }
}

/**
 * 设置字典字符串（用于编辑器类型标记）
 * @param {String} key 
 * @param {String} value 
 * @returns {String}
 */
export function setDictString(key, value) {
    if (value === 'html') {
        return 'html';
    } else {
        return 'md';
    }
}

/**
 * 从字符串中获取头部信息
 * @param {String} content 
 * @returns {Object}
 */
export function getHeadString(content) {
    const editorType = extractEditorType(content);
    return {
        editor: editorType
    };
}

/**
 * 从字典字符串添加到内容
 * @param {Object} dict 
 * @returns {String}
 */
export function addDictFromString(dict) {
    if (dict && dict.editor) {
        return dict.editor;
    }
    return 'md';
}
