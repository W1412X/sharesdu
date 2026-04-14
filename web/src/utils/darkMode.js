/**
 * 暗色模式管理工具
 * 使用 DarkReader 库实现白天/黑夜模式切换
 */
import {
  enable as enableDarkReader,
  disable as disableDarkReader,
} from 'darkreader';
import { selfDefineLocalStorage } from './localStorage';

// localStorage 存储键
const DARK_MODE_STORAGE_KEY = 'darkModeEnabled';

// DarkReader 配置选项
const darkReaderOptions = {
  brightness: 100,
  contrast: 90,
  sepia: 10,
};

/**
 * 与 global.css 中 html.sharesdu-dark-mode 骨架段落保持同步（DR 注入顺序常晚于站点样式，可压住其对骨架的改写）。
 */
const darkReaderDynamicFixes = {
  css: `
@keyframes sharesdu-skeleton-slide {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
@media (prefers-reduced-motion: reduce) {
  html.sharesdu-dark-mode .v-skeleton-loader__bone::after {
    animation: none !important;
    transform: translateX(0) !important;
    opacity: 0.9 !important;
  }
}
html.sharesdu-dark-mode .v-skeleton-loader .v-skeleton-loader__avatar,
html.sharesdu-dark-mode .v-skeleton-loader .v-skeleton-loader__button,
html.sharesdu-dark-mode .v-skeleton-loader .v-skeleton-loader__chip,
html.sharesdu-dark-mode .v-skeleton-loader .v-skeleton-loader__divider,
html.sharesdu-dark-mode .v-skeleton-loader .v-skeleton-loader__heading,
html.sharesdu-dark-mode .v-skeleton-loader .v-skeleton-loader__image,
html.sharesdu-dark-mode .v-skeleton-loader .v-skeleton-loader__ossein,
html.sharesdu-dark-mode .v-skeleton-loader .v-skeleton-loader__text {
  background: rgba(255, 255, 255, 0.085) !important;
}
html.sharesdu-dark-mode .v-skeleton-loader__bone::after {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.02) 42%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0.02) 58%,
    rgba(255, 255, 255, 0) 100%
  ) !important;
  animation: sharesdu-skeleton-slide 1.75s ease-in-out infinite !important;
}
html.sharesdu-dark-mode .loading-skeleton__accent {
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.03) 100%) !important;
}
html.sharesdu-dark-mode .loading-skeleton__list-item {
  border-bottom-color: rgba(255, 255, 255, 0.06) !important;
}
html.sharesdu-dark-mode .avatar-placeholder {
  background-color: rgba(255, 255, 255, 0.055) !important;
}
`,
};

/**
 * 与 localStorage 一致，在 <html> 上打标，供全局 CSS 在开启 Dark Reader 时拉高骨架屏等弱对比动效的可见度。
 */
function syncDarkModeRootClassFromStorage() {
  const enabled = selfDefineLocalStorage.getItem(DARK_MODE_STORAGE_KEY) === 'true';
  document.documentElement.classList.toggle('sharesdu-dark-mode', enabled);
}

/**
 * 初始化暗色模式
 * 根据 localStorage 中的设置应用暗色模式
 */
export function initDarkMode() {
  const darkModeStatus = selfDefineLocalStorage.getItem(DARK_MODE_STORAGE_KEY) === 'true';
  
  if (darkModeStatus) {
    enableDarkMode();
  } else {
    disableDarkMode();
  }

  syncDarkModeRootClassFromStorage();
  return darkModeStatus;
}

/**
 * 启用暗色模式
 */
export function enableDarkMode() {
  try {
    enableDarkReader(darkReaderOptions, darkReaderDynamicFixes);
    selfDefineLocalStorage.setItem(DARK_MODE_STORAGE_KEY, 'true');
    syncDarkModeRootClassFromStorage();
    return true;
  } catch (error) {
    console.error('启用暗色模式失败:', error);
    return false;
  }
}

/**
 * 禁用暗色模式
 */
export function disableDarkMode() {
  try {
    disableDarkReader();
    selfDefineLocalStorage.setItem(DARK_MODE_STORAGE_KEY, 'false');
    syncDarkModeRootClassFromStorage();
    return true;
  } catch (error) {
    console.error('禁用暗色模式失败:', error);
    return false;
  }
}

/**
 * 切换暗色模式
 * @returns {Boolean} 切换后的状态（true=暗色模式，false=白天模式）
 */
export function toggleDarkMode() {
  const currentStatus = selfDefineLocalStorage.getItem(DARK_MODE_STORAGE_KEY) === 'true';
  
  if (currentStatus) {
    disableDarkMode();
    return false;
  } else {
    enableDarkMode();
    return true;
  }
}

/**
 * 获取当前暗色模式状态
 * @returns {Boolean} 当前是否为暗色模式
 */
export function isDarkModeEnabled() {
  return selfDefineLocalStorage.getItem(DARK_MODE_STORAGE_KEY) === 'true';
}

/**
 * 设置暗色模式选项
 * @param {Object} options - DarkReader 配置选项
 */
export function setDarkModeOptions(options) {
  const currentStatus = selfDefineLocalStorage.getItem(DARK_MODE_STORAGE_KEY) === 'true';
  
  if (currentStatus) {
    // 如果当前已启用，先禁用再重新启用以应用新配置
    disableDarkReader();
    enableDarkReader({ ...darkReaderOptions, ...options }, darkReaderDynamicFixes);
    syncDarkModeRootClassFromStorage();
  }
  
  // 更新默认选项
  Object.assign(darkReaderOptions, options);
}

