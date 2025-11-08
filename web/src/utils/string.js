/**
 * 字符串处理相关工具函数
 */

/**
 * 将数组转换为字符串
 * @param {Array} arr 
 * @param {String} split 
 * @returns {String}
 */
export function arrToString(arr, split = ",") {
    let result = "";
    for (let i = 0; i < arr.length; i++) {
        if (i == 0) {
            result += arr[0];
        } else {
            result += split + arr[i];
        }
    }
    return result;
}

/**
 * 将字符串转换为数组
 * @param {String} str 
 * @param {String} split 
 * @returns {Array}
 */
export function stringToArr(str, split = ",") {
    return str.split(split);
}

/**
 * 深拷贝 JSON 对象
 * @param {json} json 
 * @returns {json} 深拷贝后的对象
 */
export function copy(json) {
    return JSON.parse(JSON.stringify(json));
}

/**
 * 数组去重
 * @param {Array} arr 
 * @returns {Array} 去重后的数组
 */
export function uniqueArray(arr) {
    return [...new Set(arr)];
}

