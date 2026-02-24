/**
 * 全局通知管理 Composable
 */
import { ref } from 'vue';
import { selfDefineLocalStorage } from '@/utils/localStorage';

const STORAGE_KEY = 'globalNotices';
const CACHE_DURATION = 60 * 60 * 1000; // 1小时（毫秒）

/**
 * 解析时间字符串为时间戳
 */
function parseTimeString(timeString) {
  if (!timeString) return null;
  const date = new Date(timeString.replace(/-/g, '/'));
  return isNaN(date.getTime()) ? null : date.getTime();
}

/**
 * 检查通知是否过期
 */
function isNoticeExpired(notice) {
  if (!notice.expire_time) return false;
  const expireTime = parseTimeString(notice.expire_time);
  if (!expireTime) return false;
  return Date.now() > expireTime;
}

/**
 * 排序通知（按优先级和类型）
 */
function sortNotices(notices) {
  const typePriority = { error: 3, warning: 2, info: 1 };
  return [...notices].sort((a, b) => {
    // 先按优先级排序
    if (b.priority !== a.priority) {
      return (b.priority || 0) - (a.priority || 0);
    }
    // 优先级相同，按类型排序
    return (typePriority[b.type] || 0) - (typePriority[a.type] || 0);
  });
}

/**
 * 获取缓存数据
 */
function getCachedData() {
  try {
    const cached = selfDefineLocalStorage.getItem(STORAGE_KEY);
    if (!cached) return null;
    const data = JSON.parse(cached);
    return data;
  } catch (e) {
    console.error('Failed to get cached notices:', e);
    return null;
  }
}

/**
 * 保存缓存数据
 */
function setCachedData(data) {
  try {
    selfDefineLocalStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save cached notices:', e);
  }
}

/**
 * 检查是否需要重新获取（1小时内不重复获取）
 */
function shouldFetchNotices(cachedData) {
  if (!cachedData || !cachedData.fetchTime) return true;
  const now = Date.now();
  return (now - cachedData.fetchTime) > CACHE_DURATION;
}

/**
 * 过滤有效通知
 */
function filterValidNotices(notices, shownNotices = []) {
  if (!Array.isArray(notices)) return [];
  return notices.filter(notice => {
    // 检查是否过期
    if (isNoticeExpired(notice)) return false;
    // 检查是否已显示过
    if (shownNotices.includes(notice.id)) return false;
    return true;
  });
}

export function useGlobalNotice() {
  const noticeToShow = ref(null);
  const showNoticeDialog = ref(false);
  const isLoading = ref(false);

  /**
   * 从服务器获取通知
   */
  const fetchNotices = async () => {
    try {
      const response = await fetch('/notice/global.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const notices = await response.json();
      return Array.isArray(notices) ? notices : [];
    } catch (e) {
      console.error('Failed to fetch notices:', e);
      return [];
    }
  };

  /**
   * 标记通知为已显示
   */
  const markAsShown = (noticeId) => {
    const cachedData = getCachedData();
    if (!cachedData) return;
    
    if (!cachedData.shownNotices) {
      cachedData.shownNotices = [];
    }
    
    if (!cachedData.shownNotices.includes(noticeId)) {
      cachedData.shownNotices.push(noticeId);
      setCachedData(cachedData);
    }
    
    // 如果当前显示的是这个通知，关闭弹窗
    if (noticeToShow.value?.id === noticeId) {
      closeNoticeDialog();
    }
  };

  /**
   * 关闭通知弹窗
   */
  const closeNoticeDialog = () => {
    showNoticeDialog.value = false;
    noticeToShow.value = null;
  };

  /**
   * 获取应该显示的通知
   */
  const getNoticeToShow = (cachedData) => {
    if (!cachedData || !cachedData.notices) return null;
    
    const validNotices = filterValidNotices(
      cachedData.notices,
      cachedData.shownNotices || []
    );
    
    if (validNotices.length === 0) return null;
    
    const sortedNotices = sortNotices(validNotices);
    return sortedNotices[0]; // 返回优先级最高的通知
  };

  /**
   * 初始化通知检查
   */
  const initNotices = async () => {
    if (isLoading.value) return;
    
    isLoading.value = true;
    try {
      const cachedData = getCachedData();
      let dataToUse = cachedData;
      
      // 如果需要重新获取或没有缓存
      if (shouldFetchNotices(cachedData)) {
        const notices = await fetchNotices();
        dataToUse = {
          notices,
          fetchTime: Date.now(),
          shownNotices: cachedData?.shownNotices || [],
        };
        setCachedData(dataToUse);
      }
      
      // 检查是否有需要显示的通知
      if (dataToUse) {
        const notice = getNoticeToShow(dataToUse);
        if (notice) {
          noticeToShow.value = notice;
          showNoticeDialog.value = true;
        }
      }
    } catch (e) {
      console.error('Failed to init notices:', e);
    } finally {
      isLoading.value = false;
    }
  };

  return {
    noticeToShow,
    showNoticeDialog,
    isLoading,
    initNotices,
    closeNoticeDialog,
    markAsShown,
  };
}
