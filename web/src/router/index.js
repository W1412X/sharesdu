import { getCookie } from '@/utils/cookie';
import { startDebug } from '@/utils/debug';
import { selfDefineLocalStorage } from '@/utils/localStorage';
import { selfDefinedSessionStorage } from '@/utils/sessionStorage';
import { createRouter, createWebHashHistory } from 'vue-router';

const load = (path) => () => import(`@/pages/${path}.vue`);

// 原始路由配置
const originalRoutes = [
  {
    path: '/',
    redirect: '/welcome',
  },
  {
    path: '/welcome',
    name: 'WelcomePage',
    component: load('WelcomePage'),
  },
  {
    path: '/index',
    name: 'IndexPage',
    component: load('IndexPage'),
    meta: { requiresAuth: true },
  },
  {
    path: '/article/:id/:post?',
    name: 'ArticlePage',
    component: load('ArticlePage'),
    meta: { requiresAuth: true },
  },
  {
    path: '/post/:id/:reply?',
    name: 'PostPage',
    component: load('PostPage'),
    meta: { requiresAuth: true },
  },
  {
    path: '/manage',
    name: 'ManagePage',
    component: load('ManagePage'),
    meta: { requiresAuth: true },
    props: route => ({
      init_id: route.query.init_id || null,
      init_type: route.query.init_type || null,
    }),
  },
  {
    path: '/course/:id/:post?',
    name: 'CoursePage',
    component: load('CoursePage'),
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    name: 'LoginPage',
    component: load('LoginPage'),
    meta: { requiresAuth: false },
    props: route => ({
      name: route.query.userName || null,
      passwd: route.query.passwd || null,
    }),
  },
  {
    path: '/error/:reason?',
    name: 'ErrorPage',
    component: load('ErrorPage'),
    meta: { requiresAuth: false },
  },
  {
    path: '/editor/:id?',
    name: 'EditorPage',
    component: load('EditorPage'),
    meta: { requiresAuth: true },
  },
  {
    path: '/self',
    name: 'SelfPage',
    component: load('SelfPage'),
    meta: { requiresAuth: true },
  },
  {
    path: '/author/:id',
    name: 'AuthorPage',
    component: load('AuthorPage'),
    meta: { requiresAuth: true },
  },
  {
    path: '/document/:name',
    name: 'DocumentPage',
    component: load('DocumentPage'),
    meta: { requiresAuth: false },
  },
  {
    path: '/chat/:id?/:name?',
    name: 'ChatPage',
    component: load('ChatPage'),
    meta: { requiresAuth: true },
  },
  {
    path: '/search',
    name: 'SearchPage',
    component: load('SearchPage'),
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

const devRoutes = originalRoutes.map(route => ({
  ...route,
  path: '/debug' + route.path,
  name: `${route.name}Debug`,
}));

const routes = [...originalRoutes, ...devRoutes];

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes,
});

// beforeEach 中逻辑不变
router.beforeEach((to, from, next) => {
  if(to.name.endsWith("Debug")&&(!from.name||!from.name.endsWith("Debug"))){
    startDebug();
    window.alert("本页面处于调试模式");
  }
  try {
    if (to.name !== "ErrorPage"&&to.name !="ErrorPageDebug") {
      let tmpTo = {
        name: to.name,
        params: to.params,
        query: to.query,
      };
      let tmpFrom = {
        name: from.name,
        params: from.params,
        query: from.query,
      };
      selfDefinedSessionStorage.setItem("lastTwoRouter", JSON.stringify({ to: tmpTo, from: tmpFrom }));
    }
  } catch (e) {
    console.error(e);
  }
  if (to.matched.some(record => record.meta.requiresAuth)) {
    next();
  } else if (to.path === "/login"||to.path ==="/debug/login") {
    if (getCookie("refreshToken") || selfDefineLocalStorage.getItem('passwd')) {
      window.alert("您已经登录");
      if(to.path==="/login"){
        router.push({ name: "IndexPage" });
      }else if(to.path==="/debug/login"){
        router.push({ name: "IndexPageDebug" });
      }
      return;
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;