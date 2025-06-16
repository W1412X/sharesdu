/**
 * define routes
 * pages are imported dynamically  
 */
import { getCookie } from '@/utils/cookie';
import { selfDefinedSessionStorage } from '@/utils/sessionStorage';
import { createRouter, createWebHashHistory } from 'vue-router';
const load = (path) => () => import(`@/pages/${path}.vue`);

const routes = [
  {
    path:"/",
    redirect:"/welcome",
  },
  {
    path:'/welcome',
    name:'WelcomePage',
    component: load('WelcomePage'),
  },
  {
    path:'/index',
    name:'IndexPage',
    component: load('IndexPage'),
    meta: { requiresAuth: true },
  },
  {
    path:'/article/:id/:post?',
    name:'ArticlePage',
    component: load('ArticlePage'),
    meta: { requiresAuth: true },
  },
  {
    path:'/post/:id/:reply?',
    name:'PostPage',
    component: load('PostPage'),
    meta: { requiresAuth: true },
  },
  {
    path:'/manage',
    name:"ManagePage",
    component:load('ManagePage'),
    meta:{requiresAuth:true},
    props: route => ({
      init_id: route.query.init_id || null,
      init_type: route.query.init_type || null,
    }),
  },
  {
    path:'/course/:id/:post?',
    name:'CoursePage',
    component: load('CoursePage'),
    meta: { requiresAuth: true },
  },
  {
    path:'/login',
    name:'LoginPage',
    component:load('LoginPage'),
    meta: { requiresAuth: false },
    props: route => ({
      name: route.query.userName || null,
      passwd: route.query.passwd || null,
    }),
  },
  {
    path:'/error/:reason?',
    name:'ErrorPage',
    component:load('ErrorPage'),
    meta: { requiresAuth: false },
  },
  {
    path:'/editor/:id?',
    name:'EditorPage',
    component:load('EditorPage'),
    meta: { requiresAuth: true },
  },
  {
    path:'/self',//if no id, to the user
    name:'SelfPage',
    component:load('SelfPage'),
    meta: { requiresAuth: true },
  },
  {
    path:'/author/:id',
    name:'AuthorPage',
    component:load('AuthorPage'),
    meta: { requiresAuth: true },
  },
  {
    path:'/document/:name',
    name:'DocumentPage',
    component:load('DocumentPage'),
    meta: { requiresAuth: false },
  },
  {
    path:'/chat/:id?/:name?',//user id
    name:'ChatPage',
    component:load('ChatPage'),
    meta: { requiresAuth: true },
  },
  {
    path: '/search',
    name: 'SearchPage',
    component:load('SearchPage'),
    meta: { requiresAuth: true },
    props: route => ({
      type: route.query.type || 'all',
      sort: route.query.sort || null,
      query: route.query.query ? route.query.query.split(',') : [],
    }),
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
  try{
    if(to.name!="ErrorPage"){
      let tmpTo={
        name: to.name,
        params: to.params,
        query: to.query,
      }
      let tmpFrom={
        name: from.name,
        params: from.params,
        query: from.query,
      }
      selfDefinedSessionStorage.setItem("lastTwoRouter",JSON.stringify({to:tmpTo,from:tmpFrom}));
    }
  }catch(e){
    console.error(e);
  }
  if(to.matched.some(record => record.meta.requiresAuth)){
    //if need login,do nothing here,in the request part will do 
    next();
  }else if(to.path=="/login"){
    /**
     * if login,then to IndexPage
     */
    if(getCookie("refreshToken")||localStorage.getItem('passwd')){
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
