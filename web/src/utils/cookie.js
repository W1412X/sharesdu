// src/utils/cookie.js
/**
 * Cookies include the following information:    
 * userName
 * email
 * profileUrl
 *  
 * themeColor
 */

import { decrypt, encrypt } from "./encrypt";
import { selfDefineLocalStorage } from "./localStorage";

/**
 * get the given name's value
 * @param {String} name 
 * @returns 
 */
export function getCookie(name) {
  if(name.includes("|FH|")){
    name=name.replaceAll("|FH|", ";");
  }else if(name.includes("|DH|")){
    name=name.replaceAll("|DH|", ",");
  }else if(name.includes("|KG|")){
    name=name.replaceAll("|KG|", " ");
  }
  name=encrypt(name);
  const nameEQ = `${name}=`;
  const cookies = document.cookie.split('; ');
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    if(cookie.startsWith(nameEQ)){
      let value=cookie.substring(nameEQ.length);
      if(value.includes("|FH|")){
        value=value.replaceAll("|FH|", ";");
      }else if(value.includes("|DH|")){
        value=value.replaceAll("|DH|", ",");
      }else if(value.includes("|KG|")){
        value=value.replaceAll("|KG|", " ");
      }
      
      return decrypt(value);
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
  if(value==null||value==""||value==undefined){
    hour=-1;
  }
  value=value.toString();
  name=encrypt(name);
  if(name.includes(";")){
    name=name.replaceAll(";", "|FH|");
  }else if(name.includes(",")){
    name=name.replaceAll(",", "|DH|");
  }else if(name.includes(" ")){
    name=name.replaceAll(" ", "|KG|");
  }
  value=encrypt(value);
  //deal with unsupport code
  if(value.includes(";")){
    value=value.replaceAll(";","|FH|");
  }else if(value.includes(",")){
    value=value.replaceAll(",","|DH|");
  }else if(value.includes(" ")){
    value=value.replaceAll(" ","|KG|");
  }
  let expires = '';
  if (!hour) {
    hour=0.5;
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
  name=encrypt(name);
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
  setCookie("userProfileUrl","",-1);
  setCookie("ifMaster","",-1);
  setCookie("ifSuperMaster","",-1);
  selfDefineLocalStorage.removeItem("passwd");
  selfDefineLocalStorage.removeItem("userName");
}