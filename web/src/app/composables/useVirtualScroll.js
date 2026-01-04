/**
 * 虚拟滚动 Composable
 * 用于优化长列表性能，只渲染可见区域和缓冲区内的项
 */
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';

/**
 * 虚拟滚动配置
 * @typedef {Object} VirtualScrollConfig
 * @property {number} itemHeight - 每个列表项的预估高度（px）
 * @property {number} bufferSize - 缓冲区大小（上下各保留多少个可见项）
 * @property {number} maxRenderItems - 最大渲染项数（防止DOM节点过多）
 * @property {string} containerSelector - 滚动容器的选择器
 */

/**
 * 使用虚拟滚动
 * @param {import('vue').Ref<Array>} items - 完整列表数据
 * @param {VirtualScrollConfig} config - 配置选项
 * @returns {Object} 虚拟滚动相关的响应式数据和方法
 */
export function useVirtualScroll(items, config = {}) {
  // 支持响应式 config（如果是 computed 或 ref）
  const configValue = computed(() => {
    if (config && typeof config === 'object' && 'value' in config) {
      return config.value;
    }
    return config;
  });

  const itemHeight = computed(() => configValue.value?.itemHeight ?? 200);
  const bufferSize = computed(() => configValue.value?.bufferSize ?? 5);
  const maxRenderItems = computed(() => configValue.value?.maxRenderItems ?? 300);
  const containerSelector = computed(() => configValue.value?.containerSelector ?? '#router-view-container');

  // 滚动位置
  const scrollTop = ref(0);
  
  // 容器高度
  const containerHeight = ref(0);
  
  // 是否已挂载
  const isMounted = ref(false);
  
  // 滚动容器引用
  let scrollContainer = null;
  
  // 使用 requestAnimationFrame 优化滚动性能
  let rafId = null;
  let lastScrollTop = 0;

  /**
   * 计算可见区域的起始和结束索引
   */
  const visibleRange = computed(() => {
    if (!isMounted.value || items.value.length === 0) {
      return { start: 0, end: 0 };
    }

    const itemH = itemHeight.value;
    const buffer = bufferSize.value;
    const maxItems = maxRenderItems.value;

    // 计算可见区域（向下取整和向上取整，确保覆盖完整）
    const visibleStart = Math.max(0, Math.floor(scrollTop.value / itemH));
    const visibleEnd = Math.min(
      items.value.length,
      Math.ceil((scrollTop.value + containerHeight.value) / itemH)
    );

    // 添加缓冲区（增大缓冲区，确保快速滚动时也能覆盖）
    // 缓冲区大小根据容器高度动态调整，至少保证能覆盖一屏的内容
    const screenItems = Math.ceil(containerHeight.value / itemH);
    const dynamicBuffer = Math.max(
      buffer,
      screenItems + 3 // 至少多渲染一屏+3个项，确保快速滚动时也有足够缓冲
    );
    const start = Math.max(0, visibleStart - dynamicBuffer);
    const end = Math.min(
      items.value.length,
      visibleEnd + dynamicBuffer
    );

    // 如果项数超过最大渲染数，使用窗口滑动策略
    if (items.value.length > maxItems) {
      // 计算当前窗口中心（基于可见区域的中心）
      const visibleCenter = Math.floor((visibleStart + visibleEnd) / 2);
      const windowStart = Math.max(0, visibleCenter - Math.floor(maxItems / 2));
      const windowEnd = Math.min(items.value.length, windowStart + maxItems);
      
      return {
        start: windowStart,
        end: windowEnd,
        offset: windowStart * itemH, // 偏移量用于占位
      };
    }

    return { start, end, offset: 0 };
  });

  /**
   * 可见的列表项
   */
  const visibleItems = computed(() => {
    // 如果不需要虚拟滚动（maxRenderItems 为 Infinity），返回所有项
    if (config.maxRenderItems === Infinity || config.itemHeight === 0) {
      return items.value;
    }
    
    const { start, end } = visibleRange.value;
    return items.value.slice(start, end).map((item, index) => ({
      ...item,
      _virtualIndex: start + index, // 保存原始索引
    }));
  });

  /**
   * 顶部占位高度（用于保持滚动位置）
   */
  const topSpacerHeight = computed(() => {
    const maxItems = maxRenderItems.value;
    const itemH = itemHeight.value;
    
    // 如果不需要虚拟滚动，返回0
    if (maxItems === Infinity || itemH === 0) {
      return 0;
    }
    
    if (items.value.length <= maxItems) {
      return visibleRange.value.start * itemH;
    }
    return visibleRange.value.offset;
  });

  /**
   * 底部占位高度（用于保持总高度）
   */
  const bottomSpacerHeight = computed(() => {
    const maxItems = maxRenderItems.value;
    const itemH = itemHeight.value;
    
    // 如果不需要虚拟滚动，返回0
    if (maxItems === Infinity || itemH === 0) {
      return 0;
    }
    
    const totalHeight = items.value.length * itemH;
    const renderedHeight = visibleItems.value.length * itemH;
    return Math.max(0, totalHeight - topSpacerHeight.value - renderedHeight);
  });

  /**
   * 处理滚动事件（使用 requestAnimationFrame 优化）
   */
  const handleScroll = () => {
    if (!scrollContainer) return;

    const currentScrollTop = scrollContainer.scrollTop;
    const scrollDelta = Math.abs(currentScrollTop - lastScrollTop);
    
    // 如果滚动距离变化很小，跳过更新（阈值降低到3px，更敏感）
    if (scrollDelta < 3) {
      return;
    }

    // 快速滚动时（滚动距离超过2个项高度），立即同步更新，不等待 requestAnimationFrame
    // 这样可以确保快速滚动时也能及时响应，避免底部内容未渲染的问题
    const itemH = itemHeight.value;
    if (scrollDelta > itemH * 2) {
      // 快速滚动，立即同步更新
      scrollTop.value = currentScrollTop;
      lastScrollTop = currentScrollTop;
      // 取消待执行的 requestAnimationFrame
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      // 快速滚动后，再使用 requestAnimationFrame 进行一次平滑更新
      rafId = requestAnimationFrame(() => {
        scrollTop.value = scrollContainer.scrollTop;
        lastScrollTop = scrollContainer.scrollTop;
        rafId = null;
      });
      return;
    }

    // 正常滚动，使用 requestAnimationFrame 优化
    if (rafId) {
      cancelAnimationFrame(rafId);
    }

    rafId = requestAnimationFrame(() => {
      scrollTop.value = currentScrollTop;
      lastScrollTop = currentScrollTop;
      rafId = null;
    });
  };

  /**
   * 初始化滚动容器
   */
  const initScrollContainer = async () => {
    await nextTick();
    
    scrollContainer = document.querySelector(containerSelector.value);
    if (!scrollContainer) {
      console.warn(`Scroll container not found: ${containerSelector.value}`);
      return;
    }

    // 获取容器高度
    containerHeight.value = scrollContainer.clientHeight || window.innerHeight;
    
    // 监听滚动事件
    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    
    // 监听窗口大小变化
    const resizeObserver = new ResizeObserver(() => {
      containerHeight.value = scrollContainer.clientHeight || window.innerHeight;
    });
    resizeObserver.observe(scrollContainer);
    
    isMounted.value = true;
  };

  /**
   * 滚动到指定索引
   */
  const scrollToIndex = (index) => {
    if (!scrollContainer) return;
    const targetScrollTop = index * itemHeight.value;
    scrollContainer.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth',
    });
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
    
    isMounted.value = false;
  };

  // 监听 items 变化，重置滚动位置（可选）
  watch(
    () => items.value.length,
    (newLength, oldLength) => {
      // 如果列表被清空或重置，重置滚动位置
      if (newLength === 0 || (oldLength > 0 && newLength < oldLength / 2)) {
        scrollTop.value = 0;
        if (scrollContainer) {
          scrollContainer.scrollTop = 0;
        }
      }
    }
  );

  // 只在需要时初始化（当 maxRenderItems 不是 Infinity 时）
  watch(
    () => maxRenderItems.value,
    (maxItems) => {
      if (maxItems !== Infinity && itemHeight.value > 0 && !isMounted.value) {
        initScrollContainer();
      }
    },
    { immediate: true }
  );

  onMounted(() => {
    if (maxRenderItems.value !== Infinity && itemHeight.value > 0) {
      initScrollContainer();
    }
  });

  onUnmounted(() => {
    cleanup();
  });

  return {
    visibleItems,
    topSpacerHeight,
    bottomSpacerHeight,
    scrollTop,
    containerHeight,
    isMounted,
    scrollToIndex,
    initScrollContainer,
  };
}

