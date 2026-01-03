/**
 * 消息通知轮询 Composable
 * 用于全局轮询获取新消息并通知用户
 */
import { ref } from 'vue';
import { fetchNotificationsList } from '@/api/modules/notification';
import { selfDefinedSessionStorage } from '@/utils/sessionStorage';
import { getNormalNotificationAlert } from '@/utils/alert';

const STORAGE_KEY = 'notification-polling-notified-ids';
const POLLING_INTERVAL = 60000; // 1 分钟

/**
 * 获取已通知的消息 ID 列表
 * @returns {Array<Number>} 已通知的消息 ID 列表
 */
function getNotifiedIds() {
  try {
    const stored = selfDefinedSessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('[NotificationPolling] 读取已通知消息 ID 失败:', e);
  }
  return [];
}

/**
 * 保存已通知的消息 ID 列表
 * @param {Array<Number>} ids - 消息 ID 列表
 */
function saveNotifiedIds(ids) {
  try {
    selfDefinedSessionStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch (e) {
    console.error('[NotificationPolling] 保存已通知消息 ID 失败:', e);
  }
}

/**
 * 添加已通知的消息 ID
 * @param {Array<Number>} newIds - 新的消息 ID 列表
 */
function addNotifiedIds(newIds) {
  const existingIds = getNotifiedIds();
  const allIds = [...new Set([...existingIds, ...newIds])];
  saveNotifiedIds(allIds);
}

/**
 * 消息通知轮询 Composable
 * @param {Function} alert - 消息提示函数
 * @param {Object} options - 配置选项
 * @param {Number} options.interval - 轮询间隔（毫秒），默认 60000（1分钟）
 * @returns {Object} 返回控制函数 { startPolling, stopPolling, isPolling }
 */
export function useNotificationPolling(alert, options = {}) {
  const {
    interval = POLLING_INTERVAL,
  } = options;

  const pollingTimer = ref(null);
  const isPolling = ref(false);

  /**
   * 执行轮询，获取新消息
   */
  const pollForNewNotifications = async () => {
    try {
      
      // 获取第一页消息（只获取未读消息）
      const response = await fetchNotificationsList(1, 10);
      
      if (response.status !== 200) {
        console.warn('[NotificationPolling] 获取消息列表失败:', response.message);
        return;
      }

      const notificationList = response.notification_list || [];
      
      if (notificationList.length === 0) {
        return;
      }

      // 获取已通知的消息 ID
      const notifiedIds = getNotifiedIds();
      
      // 筛选出未通知的新消息
      const newNotifications = notificationList.filter(
        (notification) => !notification.state && !notifiedIds.includes(notification.id)
      );

      if (newNotifications.length === 0) {
        return;
      }

      // 记录已通知的消息 ID
      const newNotificationIds = newNotifications.map((n) => n.id);
      addNotifiedIds(newNotificationIds);

      // 显示通知
      const message = newNotifications.length === 1
        ? `您有 1 条新消息`
        : `您有 ${newNotifications.length} 条新消息`;
      
      
      // 使用消息通知类型的 alert
      alert(getNormalNotificationAlert(message));
    } catch (error) {
      console.error('[NotificationPolling] 轮询消息失败:', error);
    }
  };

  /**
   * 开始轮询
   */
  const startPolling = () => {
    if (isPolling.value) {
      return;
    }

    isPolling.value = true;

    // 立即执行一次
    pollForNewNotifications();

    // 设置定时器
    pollingTimer.value = setInterval(() => {
      pollForNewNotifications();
    }, interval);
  };

  /**
   * 停止轮询
   */
  const stopPolling = () => {
    
    // 先清除定时器，避免内存泄漏
    if (pollingTimer.value) {
      clearInterval(pollingTimer.value);
      pollingTimer.value = null;
    }
    
    isPolling.value = false;
  };

  /**
   * 重置已通知的消息 ID（用于测试或手动重置）
   */
  const resetNotifiedIds = () => {
    try {
      selfDefinedSessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('[NotificationPolling] 重置已通知消息 ID 失败:', e);
    }
  };

  return {
    startPolling,
    stopPolling,
    resetNotifiedIds,
    isPolling,
  };
}

