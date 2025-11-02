/**
 * 
 * @param {String} str 
 * @returns 
 */
export function validateUserName(str) {
    if(str&&(str.includes(';')||str.includes(' ')||str.includes(','))){
        return false;
    }
    if (str && str.length >= 1 && str.length <= 20) {
        const regex = /^[A-Za-z0-9@.+-_一-龥]{1,20}$/;
        return regex.test(str);
    }
    return false;
}
/**
 * password rules
 */
export function validatePassWord(str) {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[*/@#/$/./!])[A-Za-z0-9*/@#/$/./!]{8,16}$/;
    if (regex.test(str)) {
        return true;
    } else {
        return false;
    }
}
/**
 * email rules
 */
export function validateEmail(str) {
    const regex = /^[A-Za-z0-9._%+-]+@mail.sdu\.edu\.cn$/;

    if (regex.test(str)) {
        return true;
    } else {
        return false;
    }
}
/**
 * url rules
 */
export function validateUrl(str) {
    const regex = /^(https?):\/\/([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/;

    if (regex.test(str)) {
        return true;
    } else {
        return false;
    }
}
/**
 * login rules
 */
export const rules={
    userName: value => validateUserName(value) || "用户名应在1到20之间，并且仅包含数字、字母、@.+-_以及汉字",
    password: value => validatePassWord(value) || "密码必须同时包含字母、数字和符号（*/@/#/$/./!），且长度在8到16之间。",
    email: value => validateEmail(value) || '请输入山东大学邮箱',
    url: value => validateUrl(value) || '请输入正确的网址'
}