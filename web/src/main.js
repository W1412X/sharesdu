// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import { getCookie } from './utils/cookie';
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
import { adjustAlpha } from './utils/other';
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
 * some sdu's settings
 */
app.config.globalProperties.$apiUrl="https://api.sharesdu.com/index/api";
app.config.globalProperties.$colleges =[
  "哲学与社会发展学院",
  "经济学院",
  "文学院",
  "历史学院",
  "考古学院",
  "数学学院",
  "物理学院",
  "化学与化工学院",
  "管理学院",
  "马克思主义学院",
  "国际教育学院",
  "经济研究院",
  "儒学高等研究院（文史哲研究院）",
  "外国语学院（大学外语教学部）",
  "晶体材料研究院",
  "中泰证券金融研究院",
  "新闻传播学院",
  "新一代半导体材料研究院",
  "人工智能学院",
  "艺术学院",
  "基础医学院",
  "公共卫生学院",
  "口腔医学院",
  "护理与康复学院",
  "药学院",
  "第一临床学院",
  "第二临床学院",
  "医学融合与实践中心",
  "材料科学与工程学院",
  "机械工程学院",
  "控制科学与工程学院",
  "能源与动力工程学院",
  "电气工程学院",
  "土建与水利学院",
  "体育学院",
  "软件学院",
  "集成电路学院",
  "中加合作办学项目",
  "人工智能国际联合研究院",
  "智能创新研究院",
  "齐鲁交通学院",
  "未来技术学院",
  "东北亚学院",
  "翻译学院",
  "空间科学与物理学院",
  "商学院",
  "数学与统计学院",
  "法学院",
  "海洋学院",
  "文化传播学院",
  "机电与信息工程学院",
  "山东大学澳国立联合理学院",
  "体育教学部",
  "政治学与公共管理学院",
  "信息科学与工程学院",
  "计算机科学与技术学院",
  "生命科学学院",
  "环境科学与工程学院",
  "国际创新转化学院",
  "网络空间安全学院",
  "前沿交叉科学青岛研究院",
  "人文社会科学青岛研究院",
  "微生物技术研究院",
  "环境研究院",
  "海洋研究院",
  "数学与交叉科学研究中心"
];
app.config.globalProperties.$campus=[
    "中心校区",
    "千佛山校区",
    "兴隆山校区",
    "趵突泉校区",
    "洪家楼校区",
    "威海校区",
    "软件园校区",
    "青岛校区"
]
app.config.globalProperties.$courseTypes=[
  '必修课',
  '限选课',
  '选修课',
]
app.config.globalProperties.$teachMethods=[
'线上', '线下', '混合'
]
app.config.globalProperties.$examineMethods=[
'考试', '论文', '项目展示', '其他']

/**
 * lazy load img url
 */
app.config.globalProperties.$imgDict={
  svg:{
    lazy:window.location.origin+"/resource/default_img.svg",
    reviewing:window.location.origin+"/resource/reviewing.svg",
    empty:window.location.origin+"/resource/no_img.svg",
    notFound:window.location.origin+"/resource/404.svg",
    unreviewed:window.location.origin+"/resource/review_failed.svg",
  },
  png:{
    lazy:window.location.origin+"/resource/default_img.svg",
    reviewing:window.location.origin+"/resource/reviewing.svg",
    empty:window.location.origin+"/resource/no_img.svg",
    notFound:window.location.origin+"/resource/404.svg",
    unreviewed:window.location.origin+"/resource/review_failed.svg",
  },
  test:{
    lazy:window.location.origin+"/resource/default_img.png",
    reviewing:window.location.origin+"/resource/reviewing.png",
    empty:window.location.origin+"/resource/no_img.png",
    notFound:window.location.origin+"/resource/404.png",
    unreviewed:window.location.origin+"/resource/review_failed.png",
  }
}
const deviceType=getDeviceType();
/**
 * mobile/desktop  
 */
app.config.globalProperties.$deviceType=deviceType;
/**
 * Get the current theme color,default #9c0c13   
 */
var tmp=getCookie("themeColor");
var themeColor="#9c0c13";
var themeColorTransparent=adjustAlpha(themeColor);
document.documentElement.style.setProperty('--theme-color', themeColor);
document.documentElement.style.setProperty('--theme-color-transparent', themeColorTransparent);
if(tmp!=null){
  themeColor=tmp;
  document.documentElement.style.setProperty('--theme-color', tmp);
  document.documentElement.style.setProperty('--theme-color-transparent', adjustAlpha(tmp));
}
/**
 * Set the theme color, personalized theme color storaged in cookies
 */
app.config.globalProperties.$themeColor=themeColor;
/**
 * export global attributes  
 */
export const globalProperties=app.config.globalProperties;


app.provide(store);
app.use(router)
  .use(vuetify)
  .use(store)
  .mount('#app');