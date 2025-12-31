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
export const WelcomePage = loadLarge('welcome/index', {
  delay: 100,
  timeout: 15000,
});

export const SearchPage = loadLarge('search/index', {
  delay: 100,
  timeout: 12000,
});

// 大型组件（500-1000行）
export const ArticlePage = loadLarge('article/index', {
  delay: 150,
  timeout: 10000,
});

export const PostPage = loadLarge('post/index', {
  delay: 150,
  timeout: 10000,
});

export const IndexPage = loadLarge('index/index', {
  delay: 150,
  timeout: 10000,
});

export const LoginPage = loadLarge('login/index', {
  delay: 150,
  timeout: 10000,
});

export const ChatPage = loadLarge('chat/index', {
  delay: 150,
  timeout: 10000,
});

export const CoursePage = loadLarge('course/index', {
  delay: 150,
  timeout: 10000,
});

// 中型组件（使用基础懒加载）
export const SelfPage = load('self/index');
export const EditorPage = load('editor/index');
export const ManagePage = load('manage/index');
export const AuthorPage = load('author/index');
export const DocumentPage = load('DocumentPage');
export const ErrorPage = load('ErrorPage');
export const ServicePage = load('ServicePage');
export const DevPage = load('DevPage');
export const TestPage = load('TestPage');
export const SearchMobilePage = load('search/SearchMobilePage');
export const RagChatPage = load('RagChatPage');
export const SectionEditorPage = load('section_editor/index');
export const SectionPage = loadLarge('section/index', {
  delay: 150,
  timeout: 10000,
});

