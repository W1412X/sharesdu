// src/utils/cookie.js
/**
 * Cookies include the following information:    
 * userName
 * email
 * profileUrl
 *  
 * themeColor
 */
const noNeedHexKey=['accessToken','refreshToken'];
import { selfDefineLocalStorage } from "./localStorage";

/**
 * 
 * @param {String} str 
 * @returns 
 */
export function unicodeToHex(str) {
  if (typeof str !== 'string' || str === null || str === undefined) {
    return str;
  }
  let result = '';
  for (let i = 0; i < str.length; i++) {
      let code = str.charCodeAt(i);
      // 使用 padStart 确保是4位十六进制
      let hex = code.toString(16).padStart(4, '0');
      result += '\\u' + hex;
  }
  return result;
}

/**
 * 
 * @param {String} str 
 * @returns 
 */
export function hexToUnicode(str) {
  if (typeof str !== 'string' || str === null || str === undefined) {
    return str;
  }
  return str.replace(/\\u([\dA-Fa-f]{4})/g, function(match, p1) {
      return String.fromCharCode(parseInt(p1, 16));
  });
}

/**
 * get the given name's value
 * @param {String} name 
 * @returns 
 */
export function getCookie(name) {
  const nameEQ = `${name}=`;
  const cookies = document.cookie.split('; ');
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    if (cookie.startsWith(nameEQ)) {
      let value = cookie.substring(nameEQ.length);
      if(!noNeedHexKey.includes(name)){
        value=hexToUnicode(value)
      }
      return value;
    }
  }
  return null;
}


/**
 * 
 * @param {String} name 
 * @param {String} value 
 * @param {int} hour 
 */
export function setCookie(name, value, hour) {
  if (value == null || value == "" || value == undefined) {
    hour = -1;
  }
  if(!noNeedHexKey.includes(name)){
    value = unicodeToHex(value);
  }
  let expires = '';
  if (!hour) {
    hour = 0.5;
  }
  const date = new Date();
  date.setTime(date.getTime() + (hour * 60 * 60 * 1000));
  expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value || ''}; ${expires}; path=/; `;

}
/**
 * 
 * @param {String} name 
 */
export function clearCookie(name) {
  setCookie(name, "", -1);
}

/**
 * clear loginState cookies
 */
export function clearTokenCookies() {
  setCookie("accessToken", "", -1);
  setCookie("refreshToken", "", -1);
  setCookie("userId", "", -1);
  setCookie("userName", "", -1);
  setCookie("email", "", -1);
  setCookie("userProfileUrl", "", -1);
  setCookie("ifMaster", "", -1);
  setCookie("ifSuperMaster", "", -1);
  selfDefineLocalStorage.removeItem("passwd");
  selfDefineLocalStorage.removeItem("userName");
}