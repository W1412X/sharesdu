/**
 * 颜色处理相关工具函数
 */

/**
 * 调整颜色的透明度
 * @param {String} hexColor 
 * @param {Float} alpha 
 * @returns {String} 带透明度的颜色值
 */
export function adjustAlpha(hexColor, alpha = 0.1) {
    hexColor = hexColor.replace('#', '');
    if (hexColor.length === 8) {
        let r = hexColor.slice(0, 2);
        let g = hexColor.slice(2, 4);
        let b = hexColor.slice(4, 6);
        // eslint-disable-next-line
        let a = hexColor.slice(6);
        let newAlpha = Math.round(alpha * 255);
        let newAlphaHex = newAlpha.toString(16).padStart(2, '0');
        return `#${r}${g}${b}${newAlphaHex}`;
    } else if (hexColor.length === 6) {
        let newAlpha = Math.round(alpha * 255);
        let newAlphaHex = newAlpha.toString(16).padStart(2, '0');
        return `#${hexColor}${newAlphaHex}`;
    } else {
        throw new Error('Invalid hex color format');
    }
}

/**
 * 将十六进制颜色转换为 RGBA 格式
 * @param {String} hex 
 * @param {Float} opacity 
 * @returns {String} RGBA 颜色字符串
 */
export function hexToRgba(hex, opacity) {
    // 如果 hex 为 undefined 或 null，使用默认颜色
    if (!hex || typeof hex !== 'string') {
        return hexToRgba("#9c0c13", opacity !== undefined ? opacity : 0.1);
    }
    
    hex = hex.replace('#', '');
    if (hex.length === 8) {
        let r = parseInt(hex.substr(0, 2), 16);
        let g = parseInt(hex.substr(2, 2), 16);
        let b = parseInt(hex.substr(4, 2), 16);
        let a = parseInt(hex.substr(6, 2), 16) / 255;
        if (opacity !== undefined) {
            a = opacity;
        }
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
    else if (hex.length === 6) {
        let r = parseInt(hex.substr(0, 2), 16);
        let g = parseInt(hex.substr(2, 2), 16);
        let b = parseInt(hex.substr(4, 2), 16);
        let a = (opacity !== undefined) ? opacity : 1;
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
    else {
        return hexToRgba("#9c0c13", opacity !== undefined ? opacity : 0.1);
    }
}

