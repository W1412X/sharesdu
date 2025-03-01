// src/utils/cookie.js
/**
 * Cookies include the following information:    
 * userName
 * email
 * profileUrl
 *  
 * themeColor
 */
/**
 * 
 * @param {cookie name} name 
 * @param {cookie value} value 
 * @param {expiration hour} hour 
 */
export function setCookie(name, value, hour) {
  let expires = '';
  if (!hour) {
    hour=0.5;
  }
  const date = new Date();
  date.setTime(date.getTime() + (hour * 60 * 60 * 1000));
  expires = `; expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value || ''}${expires}; path=/`;
}
/**
 * 
 * @param {name of message to delete} name 
 */
export function clearCookie(name) {
  setCookie(name, null, -1);
}

/**
 * 
 * @param {name of message to obtain} name 
 * @returns 
 */
export function getCookie(name) {
  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1, cookie.length);
    }
    if (cookie.indexOf(nameEQ) === 0) {
      return cookie.substring(nameEQ.length, cookie.length);
    }
  }
  return null;
}

/**
 * delete all cookie
 */
export function clearAllCookies() {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].split('=')[0].trim();
    setCookie(cookie, '', -1); 
  }
}
