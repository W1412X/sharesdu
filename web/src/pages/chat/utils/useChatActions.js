/**
 * ChatPage 操作管理 Composable
 */
import { getLoadMsg, getCancelLoadMsg, getNormalErrorAlert, getNormalInfoAlert, formatRelativeTime, copy } from '@/utils/other';
import { sendPrivateMessage } from '@/api/modules/chat';
import { getHistoryResults, isHistoryResponseOk } from '@/utils/chatApiNormalize';
import { normMessageId, normPeerId } from '@/utils/chatIds';
import {
  putMessage,
  putMessagesForPeer,
  putSessionRow,
  mapHistoryPartToMessage,
  setNextHistoryPage,
} from '@/utils/chatLocalDb';

export function useChatActions(
  receiverId,
  receiverName,
  selfId,
  selfName,
  editingMessage,
  messages,
  chatUsers,
  chatHistoryDict,
  chatPageDict,
  setMessages,
  addMessage,
  removeMessage,
  updateChatUser,
  setChatHistory,
  getChatHistory,
  setChatPage,
  getChatPage,
  incrementChatPage,
  setEditingMessage,
  setLoading,
  loading,
  scrollToBottom,
  scrollToTop,
  alertHandler
) {
  /**
   * 发送消息
   */
  const send = async () => {
    if (!editingMessage.value) {
      alertHandler(getNormalInfoAlert('发送信息不可为空'));
      return;
    }
    
    setLoading('send', true);
    try {
      const response = await sendPrivateMessage(receiverId.value, editingMessage.value);
      setLoading('send', false);
      
      if (response.status === 200) {
        const newMessage = {
          id: response.message_id,
          content: editingMessage.value,
          time: new Date().toISOString(),
          isSelf: true,
          ifRead: false,
          userName: selfName,
          userId: selfId,
        };
        
        addMessage(newMessage);
        if (selfId) {
          try {
            await putMessage(selfId, receiverId.value, newMessage);
            await putSessionRow({
              id: receiverId.value,
              name: receiverName.value,
              lastContent: newMessage.content,
              lastAt: newMessage.time,
              lastIsSelf: true,
              unread: 0,
              lastMsgAt: newMessage.time,
            });
          } catch (e) {
            console.warn('chat persist send', e);
          }
        }
        
        // 更新用户列表中的最后一条消息
        updateChatUser(receiverId.value, {
          lastMsg: {
            content: editingMessage.value,
            time: formatRelativeTime(new Date().toISOString()),
            isSelf: true,
          },
        });
        
        setEditingMessage('');
        scrollToBottom();
      } else {
        alertHandler(getNormalErrorAlert(response.message));
      }
    } catch (error) {
      setLoading('send', false);
      alertHandler(getNormalErrorAlert('发送失败'));
    }
  };
  
  /**
   * 加载更早的消息
   */
  const loadFrontier = async (getChatHistoryApi, markMessageAsReadApi) => {
    setLoading('loadFrontier', true);
    try {
      const currentPage = getChatPage(receiverId.value) || 1;
      const response = await getChatHistoryApi(receiverId.value, currentPage);
      setLoading('loadFrontier', false);
      
      if (isHistoryResponseOk(response)) {
        const part = getHistoryResults(response);
        if (part.length === 0) {
          alertHandler(getNormalInfoAlert('无更多信息'));
          return;
        }
        incrementChatPage(receiverId.value);
        
        const ctx = {
          selfName,
          selfId,
          peerName: receiverName.value,
          peerId: receiverId.value,
        };
        const tmp = part
          .slice()
          .reverse()
          .map((row) => mapHistoryPartToMessage(row, ctx));
        for (const msg of tmp) {
          if (!msg.ifRead && !msg.isSelf && markMessageAsReadApi) {
            setLoading(getLoadMsg('正在处理信息...'));
            await markMessageAsReadApi(msg.id);
            msg.ifRead = true;
            setLoading(getCancelLoadMsg());
          }
        }
        const existingIds = new Set(messages.value.map((m) => normMessageId(m.id)));
        const older = tmp.filter((m) => !existingIds.has(normMessageId(m.id)));
        const currentMessages = messages.value.map((msg) => copy(msg));
        setMessages([...older, ...currentMessages]);
        setChatHistory(receiverId.value, messages.value);
        if (selfId) {
          try {
            await putMessagesForPeer(selfId, receiverId.value, messages.value, { clearPeer: false });
            await setNextHistoryPage(receiverId.value, getChatPage(receiverId.value) || 2);
          } catch (e) {
            console.warn('chat persist loadFrontier', e);
          }
        }
        scrollToTop();
      } else {
        alertHandler(getNormalInfoAlert('无更多信息'));
      }
    } catch (error) {
      setLoading('loadFrontier', false);
      alertHandler(getNormalErrorAlert('加载失败'));
    }
  };
  
  /**
   * 处理消息撤回
   */
  const handleRecall = (id) => {
    removeMessage(id);
  };
  
  /**
   * 选择用户
   */
  const selectUser = (index, chatUsersList) => {
    if (index < 0 || index >= chatUsersList.length) return;
    const nextId = normPeerId(chatUsersList[index].id);
    if (nextId && normPeerId(receiverId.value) === nextId) {
      return;
    }
    receiverId.value = nextId;
    receiverName.value = chatUsersList[index].name;
  };
  
  return {
    send,
    loadFrontier,
    handleRecall,
    selectUser,
  };
}

