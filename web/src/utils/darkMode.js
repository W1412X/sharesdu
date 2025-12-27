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
  
  return darkModeStatus;
}

/**
 * 启用暗色模式
 */
export function enableDarkMode() {
  try {
    enableDarkReader(darkReaderOptions);
    selfDefineLocalStorage.setItem(DARK_MODE_STORAGE_KEY, 'true');
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
    enableDarkReader({ ...darkReaderOptions, ...options });
  }
  
  // 更新默认选项
  Object.assign(darkReaderOptions, options);
}

