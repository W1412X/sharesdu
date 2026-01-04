/**
 * 优化的滚动监听 Composable
 * 使用 requestAnimationFrame + 节流 + IntersectionObserver 优化性能
 */
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { debounce } from '@/utils/dom';

/**
 * 使用优化的滚动监听
 * @param {Object} options - 配置选项
 * @param {Function} options.onScroll - 滚动回调函数
 * @param {Function} options.onReachBottom - 到达底部回调函数
 * @param {string} options.containerSelector - 滚动容器选择器
 * @param {number} options.threshold - 距离底部多少像素时触发加载（默认200px）
 * @param {number} options.throttleDelay - 节流延迟（默认100ms）
 * @returns {Object} 控制方法
 */
export function useOptimizedScroll(options = {}) {
  const {
    onScroll = null,
    onReachBottom = null,
    containerSelector = '#router-view-container',
    threshold = 200,
    throttleDelay = 100,
  } = options;

  const isEnabled = ref(true);
  let scrollContainer = null;
  let rafId = null;
  let lastScrollTop = 0;

  /**
   * 使用 requestAnimationFrame 优化的滚动处理
   */
  const handleScroll = () => {
    if (!isEnabled.value || !scrollContainer) return;

    const currentScrollTop = scrollContainer.scrollTop;

    // 如果滚动距离变化很小，跳过更新
    if (Math.abs(currentScrollTop - lastScrollTop) < 5) {
      return;
    }

    if (rafId) {
      cancelAnimationFrame(rafId);
    }

    rafId = requestAnimationFrame(() => {
      lastScrollTop = currentScrollTop;

      // 调用滚动回调
      if (onScroll) {
        onScroll(currentScrollTop);
      }

      // 检查是否到达底部
      if (onReachBottom) {
        const scrollHeight = scrollContainer.scrollHeight;
        const clientHeight = scrollContainer.clientHeight;
        const distanceToBottom = scrollHeight - currentScrollTop - clientHeight;

        if (distanceToBottom <= threshold) {
          onReachBottom();
        }
      }

      rafId = null;
    });
  };

  /**
   * 初始化
   */
  const init = () => {
    scrollContainer = document.querySelector(containerSelector);
    
    if (!scrollContainer) {
      console.warn(`Scroll container not found: ${containerSelector}`);
      // 延迟重试，确保 DOM 已准备好
      setTimeout(() => {
        init();
      }, 100);
      return;
    }

    // 始终使用滚动事件 + requestAnimationFrame（更可靠）
    // IntersectionObserver 在动态内容场景下可能不够可靠
    const throttledHandleScroll = debounce(handleScroll, throttleDelay);
    scrollContainer.addEventListener('scroll', throttledHandleScroll, { passive: true });
  };

  /**
   * 启用/禁用
   */
  const enable = () => {
    isEnabled.value = true;
  };

  const disable = () => {
    isEnabled.value = false;
  };

  /**
   * 清理
   */
  const cleanup = () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    if (scrollContainer) {
      scrollContainer.removeEventListener('scroll', handleScroll);
      scrollContainer = null;
    }
  };

  onMounted(async () => {
    // 等待 DOM 完全渲染后再初始化
    await nextTick();
    // 再等待一帧确保容器已准备好
    requestAnimationFrame(() => {
      init();
    });
  });

  onUnmounted(() => {
    cleanup();
  });

  return {
    enable,
    disable,
    isEnabled,
    cleanup, // 返回 cleanup 函数，用于手动清理
  };
}

/**
 * 创建优化的滚动监听实例（用于动态添加/移除）
 * @param {Object} options - 配置选项（与 useOptimizedScroll 相同）
 * @returns {Object} 包含 cleanup 方法的对象
 */
export function createOptimizedScroll(options = {}) {
  // 注意：此函数中的 isEnabled 是普通变量，不是 ref，所以使用 isEnabled 而不是 isEnabled.value
  const {
    onScroll = null,
    onReachBottom = null,
    containerSelector = '#router-view-container',
    threshold = 200,
    throttleDelay = 100,
  } = options;

  let isEnabled = true;
  let scrollContainer = null;
  let rafId = null;
  let lastScrollTop = 0;

  /**
   * 使用 requestAnimationFrame 优化的滚动处理
   */
  const handleScroll = () => {
    if (!isEnabled || !scrollContainer) return;

    const currentScrollTop = scrollContainer.scrollTop;

    // 如果滚动距离变化很小，跳过更新
    if (Math.abs(currentScrollTop - lastScrollTop) < 5) {
      return;
    }

    if (rafId) {
      cancelAnimationFrame(rafId);
    }

    rafId = requestAnimationFrame(() => {
      lastScrollTop = currentScrollTop;

      // 调用滚动回调
      if (onScroll) {
        onScroll(currentScrollTop);
      }

      // 检查是否到达底部
      if (onReachBottom) {
        const scrollHeight = scrollContainer.scrollHeight;
        const clientHeight = scrollContainer.clientHeight;
        const distanceToBottom = scrollHeight - currentScrollTop - clientHeight;

        if (distanceToBottom <= threshold) {
          onReachBottom();
        }
      }

      rafId = null;
    });
  };

  /**
   * 初始化
   */
  const init = () => {
    scrollContainer = document.querySelector(containerSelector);
    
    if (!scrollContainer) {
      console.warn(`Scroll container not found: ${containerSelector}`);
      // 延迟重试，确保 DOM 已准备好
      setTimeout(() => {
        init();
      }, 100);
      return;
    }

    // 使用滚动事件 + requestAnimationFrame（更可靠）
    // IntersectionObserver 在动态内容场景下可能不够可靠
    const throttledHandleScroll = debounce(handleScroll, throttleDelay);
    scrollContainer.addEventListener('scroll', throttledHandleScroll, { passive: true });
  };

  /**
   * 清理
   */
  const cleanup = () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    if (scrollContainer) {
      scrollContainer.removeEventListener('scroll', handleScroll);
      scrollContainer = null;
    }
  };

  // 延迟初始化，确保 DOM 已准备好
  setTimeout(() => {
    init();
  }, 0);

  return {
    cleanup,
  };
}

