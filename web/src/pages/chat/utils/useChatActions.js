/**
 * ChatPage 操作管理 Composable
 */
import { getLoadMsg, getCancelLoadMsg, getNormalErrorAlert, getNormalInfoAlert, formatRelativeTime, copy } from '@/utils/other';
import { sendPrivateMessage } from '@/api/modules/chat';

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
      
      if (response.status === 200) {
        incrementChatPage(receiverId.value);
        
        const tmp = [];
        const reversedResults = response.results.reverse();
        
        for (let i = 0; i < reversedResults.length; i++) {
          const msg = {
            id: reversedResults[i].message_id,
            content: reversedResults[i].content,
            time: reversedResults[i].sent_at,
            isSelf: reversedResults[i].is_sender,
            ifRead: reversedResults[i].read,
            userName: reversedResults[i].is_sender ? selfName : receiverName.value,
            userId: reversedResults[i].is_sender ? selfId : receiverId.value,
          };
          
          // 标记未读消息
          if (!msg.ifRead && !msg.isSelf && markMessageAsReadApi) {
            setLoading(getLoadMsg('正在处理信息...'));
            await markMessageAsReadApi(msg.id);
            msg.ifRead = true;
            setLoading(getCancelLoadMsg());
          }
          
          tmp.push(msg);
        }
        
        // 合并消息
        const currentMessages = messages.value.map(msg => copy(msg));
        setMessages([...tmp, ...currentMessages]);
        setChatHistory(receiverId.value, messages.value);
        
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
    if (index >= 0 && index < chatUsersList.length) {
      receiverId.value = chatUsersList[index].id;
      receiverName.value = chatUsersList[index].name;
    }
  };
  
  return {
    send,
    loadFrontier,
    handleRecall,
    selectUser,
  };
}

