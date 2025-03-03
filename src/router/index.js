/**
 * define routes
 * pages are imported dynamically  
 */
import { setCookie } from '@/utils/cookie';
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
    meta: { requiresAuth: true },
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
router.beforeEach((to, from, next) => {
  //test 
  setCookie("userId","000000");
  setCookie("userName","test");
  setCookie("email","20220013208@sdu.edu.cn");
  //check the prioprity
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // eslint-disable-next-line
    if(true){//if store the user's message
      console.log(to.path);
      if(to.path=="/login"){
        router.push('/index');
        return;
      }
      next();
    }else{//visit set content need login 
      window.alert('访问站内内容需要登陆');
      router.push('/login');
    }
  }else{//page public
    next();
  }
});
export default router;
