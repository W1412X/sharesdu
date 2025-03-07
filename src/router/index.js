/**
 * define routes
 * pages are imported dynamically  
 */
import { getCookie } from '@/utils/cookie';
import { createRouter, createWebHashHistory } from 'vue-router';
const routes = [
  {
    path:"/",
    redirect:"/welcome",
  },
  {
    path:'/welcome',
    name:'WelcomePage',
    component: (()=>import('@/pages/WelcomePage.vue')),
  },
  {
    path:'/index',
    name:'IndexPage',
    component: (()=>import('@/pages/IndexPage.vue')),
    meta: { requiresAuth: true },
  },
  {
    path:'/article/:id',
    name:'ArticlePage',
    component: (()=>import('@/pages/ArticlePage.vue')),
    meta: { requiresAuth: true },
  },
  {
    path:'/post/:id',
    name:'PostPage',
    component: (()=>import('@/pages/PostPage.vue')),
    meta: { requiresAuth: true },
  },
  {
    path:'/course/:id',
    name:'CoursePage',
    component: (()=>import('@/pages/CoursePage.vue')),
    meta: { requiresAuth: true },
  },
  {
    path:'/login',
    name:'LoginPage',
    component: (()=>import('@/pages/LoginPage.vue')),
    meta: { requiresAuth: false },
  },
  {
    path:'/error/:reason?',
    name:'ErrorPage',
    component: (()=>import('@/pages/ErrorPage.vue')),
    meta: { requiresAuth: false },
  },
  {
    path:'/editor',
    name:'EditorPage',
    component: (()=>import('@/pages/EditorPage.vue')),
    meta: { requiresAuth: false },
  },
  {
    path:'/self/:id',
    name:'SelfPage',
    component: (()=>import('@/pages/SelfPage.vue')),
    meta: { requiresAuth: true },
  },
  {
    path:'/author/:id',
    name:'AuthorPage',
    component: (()=>import('@/pages/AuthorPage.vue')),
    meta: { requiresAuth: true },
  },
  {
    path:'/document/:name',
    name:'DocumentPage',
    component: (()=>import('@/pages/DocumentPage.vue')),
    meta: { requiresAuth: false },
  },
  {
    path:'/chat/:id',//user id
    name:'ChatPage',
    component: (()=>import('@/pages/ChatPage.vue')),
    meta: { requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/error/找不到此资源',
    meta: { requiresAuth: false },
  },
];

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes,
});
/**
 * it seems like that it's unneccessary to check the token here  
 * when request is made,the token will be checked in @/utils/others/dealAxiosError
 * so we just check if the cookie exsits here  
 */
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    /**
     * we just judge if refreshToken here
     * and about the accessToken obtain deal in the api  
     */
    if(getCookie("refreshToken")){
      next();
    }else{
      window.alert("令牌已过期，请重新登录");
      router.push({name:"LoginPage"});
    }
  }else if(to.path=="/login"){
    /**
     * if login,then to IndexPage
     */
    console.log("login");
    if(getCookie("refreshToken")){
      window.alert("您已经登录");
      router.push({name:"IndexPage"});
      return;
    }else{
      //to login page  
      next();
    }
  }else{//page public
    next();
  }
});
export default router;
