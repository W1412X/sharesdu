/**
 * user name rules
 */
export function validateUserName(str) {
    const regex = /^[A-Za-z\u4e00-\u9fa50-9]{3,20}$/;
    if (regex.test(str)) {
        return true;
    } else {
        return false;
    }
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
    userName: value => validateUserName(value) || "用户名仅能包含中文字符/英文字符/数字，且长度在3到20之间。",
    password: value => validatePassWord(value) || "密码必须同时包含字母、数字和符号（*/@/#/$/./!），且长度在8到16之间。",
    email: value => validateEmail(value) || '请输入山东大学邮箱',
    url: value => validateUrl(value) || '请输入正确的网址'
}