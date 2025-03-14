// src/utils/cookie.js
/**
 * Cookies include the following information:    
 * userName
 * email
 * profileUrl
 *  
 * themeColor
 */

import { base64Decode, base64Encode } from "./other";

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
    if(cookie.startsWith(nameEQ)){
      return base64Decode(cookie.substring(nameEQ.length));
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
  let expires = '';
  if (!hour) {
    hour=0.5;
  }
  value=base64Encode(value);
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
 * clear all cookies
 */
export function clearAllCookies() {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].split('=')[0].trim();
    setCookie(cookie, '', -1); 
  }
}
