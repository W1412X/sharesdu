// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import { clearCookie, clearTokenCookies, getCookie, setCookie } from './utils/cookie';
import router from './router';
import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import store from './store';
import 'vuetify/dist/vuetify.min.css';
import '@mdi/font/css/materialdesignicons.css';

/**
 * import global css style   
 */
import './style/global.css';
import { getDeviceType } from './utils/device';
import { adjustAlpha } from './utils/color';
import { selfDefinedSessionStorage } from './utils/sessionStorage';
import { selfDefineLocalStorage } from './utils/localStorage';
import config from './config';

const vuetify = createVuetify({
  components,
  directives,
})
const app=createApp(App);
/**
 * LoadingView
 */
//app.component('LoadingView',LoadingView);

/**
 * 从配置文件加载设置
 */
app.config.globalProperties.$apiUrl = config.api.baseURL;
app.config.globalProperties.$colleges = config.colleges;
app.config.globalProperties.$campus = config.campus;
app.config.globalProperties.$courseTypes = config.courseTypes;
app.config.globalProperties.$teachMethods = config.teachMethods;
app.config.globalProperties.$examineMethods = config.examineMethods;

/**
 * lazy load img url
 */
app.config.globalProperties.$imgDict = config.getImageDict();

/**
 * check local storage method 
 */
try{
  selfDefineLocalStorage.setItem("test","test");
  if(selfDefineLocalStorage.getItem("test")!="test"){
    window.alert("由于浏览器的设置，本页面无法使用本地存储，因此部分功能如自动登陆以及带宽优化无法使用");
  }
}catch(e){
  window.alert("由于浏览器的设置，本页面无法使用本地存储，因此部分功能如自动登陆以及带宽优化无法使用");
}finally{
  selfDefineLocalStorage.removeItem("test");
}
/**
 * check cookie
 */
try{
  setCookie("test","test");
  if(getCookie("test")!="test"){
    window.alert("本页面禁用了Cookie，无法使用，请修改浏览器设置或退出网站");
    window.history.go(-1)
  }
}catch(e){
  window.alert("本页面禁用了Cookie，无法使用，请修改浏览器设置或退出网站");
  window.history.go(-1)
}finally{
  clearCookie("test");
}
/**
 * check self session storage
 */
try{
  selfDefinedSessionStorage.setItem("test","test");
  if(selfDefinedSessionStorage.getItem("test")!="test"){
    window.alert("本页面禁用了会话存储，部分功能如页面恢复，浏览记录将无法使用");
  }
}catch(e){
  window.alert("本页面禁用了会话存储，部分功能如页面恢复，浏览记录将无法使用");
}finally{
  selfDefinedSessionStorage.removeItem("test");
}

const deviceType=getDeviceType();
/**
 * mobile/desktop  
 */
app.config.globalProperties.$deviceType=deviceType;
/**
 * Get the current theme color,default from config   
 */
let tmp=selfDefineLocalStorage.getItem("themeColor");
let themeColor=config.theme.defaultColor;
let themeColorTransparent;
try {
  themeColorTransparent = adjustAlpha(themeColor);
} catch (error) {
  console.error('Failed to adjust alpha for theme color:', error);
  // 使用默认透明色作为后备
  themeColorTransparent = adjustAlpha("#9c0c13", 0.1);
}
document.documentElement.style.setProperty('--theme-color', themeColor);
document.documentElement.style.setProperty('--theme-color-transparent', themeColorTransparent);
if(tmp!=null){
  themeColor=tmp;
  document.documentElement.style.setProperty('--theme-color', tmp);
  try {
    document.documentElement.style.setProperty('--theme-color-transparent', adjustAlpha(tmp));
  } catch (error) {
    console.error('Failed to adjust alpha for custom theme color:', error);
    // 使用默认透明色作为后备
    document.documentElement.style.setProperty('--theme-color-transparent', adjustAlpha("#9c0c13", 0.1));
  }
}
/**
 * Set the theme color, personalized theme color storaged in cookies
 */
app.config.globalProperties.$themeColor=themeColor;
/**
 * export global attributes  
 */
export const globalProperties=app.config.globalProperties;

//add version control  
const globalVersion = config.version.globalVersion;
if(selfDefineLocalStorage.getItem("version")!=globalVersion){
  clearTokenCookies();
  selfDefinedSessionStorage.clear();
  selfDefineLocalStorage.clear();
}
selfDefineLocalStorage.setItem("version",globalVersion);

app.provide(store);
app.use(router)
  .use(vuetify)
  .use(store)
  .mount('#app');