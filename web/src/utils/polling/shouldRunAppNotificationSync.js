import { getCookie } from '@/utils/cookie';

/**
 * 决定全局「站内通知列表」轮询本 tick 是否应执行：免登录页、未登录、私聊页不跑，避免无效请求与重复提示。
 * 与 `router` 中 `meta.requiresAuth === false` 的页面语义对齐；私聊有独立 `useChatSync`。
 * @param {import('vue-router').RouteLocationNormalizedLoaded | null | undefined} route
 */
export function shouldRunAppNotificationSync(route) {
  if (!getCookie('userName')) {
    return false;
  }
  if (!route || !route.matched || route.matched.length === 0) {
    return true;
  }
  const m = route.matched[route.matched.length - 1];
  if (m && m.meta && m.meta.requiresAuth === false) {
    return false;
  }
  const base = String(route.name || '').replace(/Debug$/, '');
  if (base === 'ChatPage') {
    return false;
  }
  return true;
}
