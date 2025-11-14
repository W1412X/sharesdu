/**
 * 异步组件加载配置
 * 使用 defineAsyncComponent 优化大型组件的懒加载
 */
import { defineAsyncComponent } from 'vue';
import AsyncLoading from './components/AsyncLoading.vue';
import AsyncError from './components/AsyncError.vue';

/**
 * 创建异步组件加载器
 * @param {Function} loader - 组件加载函数
 * @param {Object} options - 配置选项
 * @returns {Component} 异步组件
 */
function createAsyncComponent(loader, options = {}) {
  const {
    loadingComponent = AsyncLoading,
    errorComponent = AsyncError,
    delay = 200,
    timeout = 10000,
    suspensible = false,
    onError = null,
    showLoading = true,
    showError = true,
  } = options;

  return defineAsyncComponent({
    loader,
    loadingComponent: showLoading ? loadingComponent : null,
    errorComponent: showError ? errorComponent : null,
    delay,
    timeout,
    suspensible,
    onError: onError || ((error, retry, fail, attempts) => {
      console.error(`组件加载失败 (尝试 ${attempts} 次):`, error);
      if (attempts <= 3) {
        // 最多重试3次
        retry();
      } else {
        fail();
      }
    }),
  });
}

/**
 * 基础懒加载函数（用于小型组件）
 * @param {string} path - 组件路径
 * @returns {Function} 组件加载函数
 */
export const load = (path) => () => import(`@/pages/${path}.vue`);

/**
 * 优化的懒加载函数（用于大型组件）
 * @param {string} path - 组件路径
 * @param {Object} options - 配置选项
 * @returns {Component} 异步组件
 */
export const loadLarge = (path, options = {}) => {
  const loader = () => import(`@/pages/${path}.vue`);
  return createAsyncComponent(loader, {
    delay: 200,
    timeout: 10000,
    ...options,
  });
};

/**
 * 预定义的异步组件
 * 大型组件使用优化的加载方式
 */

// 超大型组件（>1000行）
export const WelcomePage = loadLarge('WelcomePage', {
  delay: 100,
  timeout: 15000,
});

export const SearchPage = loadLarge('search/SearchPage', {
  delay: 100,
  timeout: 12000,
});

export const CoursePage = loadLarge('CoursePage', {
  delay: 100,
  timeout: 12000,
});

// 大型组件（500-1000行）
export const ArticlePage = loadLarge('ArticlePage', {
  delay: 150,
  timeout: 10000,
});

export const PostPage = loadLarge('PostPage', {
  delay: 150,
  timeout: 10000,
});

export const IndexPage = loadLarge('index/IndexPage', {
  delay: 150,
  timeout: 10000,
});

export const LoginPage = loadLarge('LoginPage', {
  delay: 150,
  timeout: 10000,
});

export const ChatPage = loadLarge('ChatPage', {
  delay: 150,
  timeout: 10000,
});

// 中型组件（使用基础懒加载）
export const SelfPage = load('SelfPage');
export const EditorPage = load('EditorPage');
export const ManagePage = load('ManagePage');
export const AuthorPage = load('AuthorPage');
export const DocumentPage = load('DocumentPage');
export const ErrorPage = load('ErrorPage');
export const ServicePage = load('ServicePage');
export const DevPage = load('DevPage');
export const TestPage = load('TestPage');
export const SearchMobilePage = load('search/SearchMobilePage');
export const RagChatPage = load('RagChatPage');

