/**
 * SelfPage 操作管理 Composable
 */
import { getBlockList, unblockUser } from '@/api/modules/block';
import { getChatUsers } from '@/api/modules/chat';
import { fetchNotificationsList, markAsReadNotification } from '@/api/modules/notification';
import { getNetworkErrorResponse } from '@/api/modules/statusCodeMessages';
import { extractTime, getCancelLoadMsg, getLoadMsg, getNormalErrorAlert, getNormalSuccessAlert, getNormalWarnAlert, openPage } from '@/utils/other';

export function useSelfActions(
  user,
  notificationList,
  notificationPageNum,
  blockList,
  chatList,
  loading,
  loadState,
  setBlockListState,
  setColorSelectorCardState,
  alertHandler,
  setLoadingHandler
) {
  /**
   * 获取黑名单列表
   */
  const getBlockListAction = async () => {
    loading.value.loadBlock = true;
    const response = await getBlockList();
    loading.value.loadBlock = false;
    
    if (response.status === 200) {
      blockList.value = [];
      for (let i = 0; i < response.block_list.length; i++) {
        blockList.value.push({
          id: response.block_list[i].to_user_id,
          name: response.block_list[i].to_user_name,
        });
      }
      alertHandler(getNormalSuccessAlert('加载成功'));
      setBlockListState(true);
    } else {
      alertHandler(getNormalErrorAlert(response.message));
    }
  };
  
  /**
   * 取消拉黑
   * @param {Number} index - 黑名单索引
   */
  const cancelBlock = async (index) => {
    const blockUser = blockList.value[index];
    let response = getNetworkErrorResponse();
    setLoadingHandler(getLoadMsg('正在处理', -1));
    response = await unblockUser(blockUser.id);
    
    if (response.status === 200) {
      blockList.value.splice(index, 1);
      alertHandler({
        state: true,
        color: 'success',
        title: '取消成功',
        content: '已取消拉黑用户' + String(blockUser.name),
      });
    } else {
      alertHandler({
        state: true,
        color: 'error',
        title: '请求失败',
        content: response.message,
      });
    }
    setLoadingHandler(getCancelLoadMsg());
  };
  
  /**
   * 设置颜色
   */
  const setColor = () => {
    setColorSelectorCardState(false);
    window.location.reload();
  };
  
  /**
   * 获取聊天列表
   */
  const getChatList = async () => {
    loadState.value.message = false;
    const response = await getChatUsers();
    loadState.value.message = true;
    
    if (response.status === 200) {
      chatList.value = [];
      for (let i = 0; i < response.chat_users.length; i++) {
        chatList.value.push({
          id: response.chat_users[i].user_id,
          name: response.chat_users[i].username,
          msgNum: response.chat_users[i].unread_count,
          lastMsg: {
            content: response.chat_users[i].last_message.content,
            time: extractTime(response.chat_users[i].last_message.sent_at),
            isSelf: response.chat_users[i].last_message.is_sender,
          },
        });
      }
    }
  };
  
  /**
   * 关闭对话框
   */
  const closeDialog = () => {
    setBlockListState(false);
  };
  
  /**
   * 跳转URL
   * @param {String} url - URL地址
   */
  const toUrl = (url) => {
    openPage('url', { url: url });
  };
  
  /**
   * 清空通知
   */
  const clearNotification = async () => {
    if (notificationList.value.length === 0) {
      alertHandler(getNormalWarnAlert('无通知'));
      return;
    }
    
    const ids = notificationList.value.map(item => item.id);
    loading.value.clearNotification = true;
    const response = await markAsReadNotification(ids);
    loading.value.clearNotification = false;
    
    if (response.status === 200) {
      notificationList.value = [];
    } else {
      alertHandler(getNormalErrorAlert(response.message));
    }
  };
  
  /**
   * 获取通知列表
   */
  const getNotificationList = async () => {
    loading.value.loadNotification = true;
    const response = await fetchNotificationsList(notificationPageNum.value);
    loading.value.loadNotification = false;
    
    if (response.status === 200) {
      for (let i = 0; i < response.notification_list.length; i++) {
        notificationList.value.push({
          id: response.notification_list[i].notification_id,
          type: response.notification_list[i].type,
          message: response.notification_list[i].message,
          time: response.notification_list[i].created_at,
          state: response.notification_list[i].is_read,
          relatedItem: response.notification_list[i].related_object,
        });
      }
      notificationPageNum.value++;
      alertHandler(getNormalSuccessAlert('获取成功'));
    } else {
      alertHandler(getNormalErrorAlert(response.message));
    }
  };
  
  return {
    getBlockListAction,
    cancelBlock,
    setColor,
    getChatList,
    closeDialog,
    toUrl,
    clearNotification,
    getNotificationList,
  };
}

