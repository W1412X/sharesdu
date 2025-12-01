/**
 * ChatPage 加载逻辑 Composable
 */
import { getLoadMsg, getCancelLoadMsg, getNormalErrorAlert, formatRelativeTime } from '@/utils/other';
import { getChatHistory, getChatUsers, markMessageAsRead } from '@/api/modules/chat';

export function useChatLoad(
  receiverId,
  receiverName,
  selfId,
  selfName,
  ifMounted,
  messages,
  chatUsers,
  chatHistoryDict,
  chatPageDict,
  setMessages,
  setChatHistory,
  setChatPage,
  addChatUser,
  setChatUsers,
  setReceiverId,
  setReceiverName,
  setIfMounted,
  setLoading,
  scrollToBottom,
  alertHandler
) {
  /**
   * 加载聊天历史
   */
  const loadChatHistory = async () => {
    if (!ifMounted.value || !receiverId.value) {
      return;
    }
    
    const history = chatHistoryDict.value[receiverId.value];
    
    if (history == null) {
      // 获取历史记录
      setLoading(getLoadMsg('正在获取用户列表...'));
      try {
        const response = await getChatHistory(receiverId.value);
        setLoading(getCancelLoadMsg());
        
        if (response.status === 200) {
          const newMessages = [];
          const reversedResults = response.results.reverse();
          setChatPage(receiverId.value, 2);
          
          for (let i = 0; i < reversedResults.length; i++) {
            const msg = {
              id: reversedResults[i].message_id,
              content: reversedResults[i].content,
              time: reversedResults[i].sent_at,
              isSelf: reversedResults[i].is_sender,
              ifRead: reversedResults[i].read,
            };
            
            // 标记未读消息
            if (!msg.ifRead && !msg.isSelf) {
              setLoading(getLoadMsg('正在处理信息...'));
              await markMessageAsRead(msg.id);
              msg.ifRead = true;
              setLoading(getCancelLoadMsg());
            }
            
            // 添加用户信息
            if (reversedResults[i].is_sender) {
              msg.userName = selfName;
              msg.userId = selfId;
            } else {
              msg.userName = receiverName.value;
              msg.userId = receiverId.value;
            }
            
            newMessages.push(msg);
          }
          
          setMessages(newMessages);
          setChatHistory(receiverId.value, newMessages);
        } else {
          setMessages([]);
          alertHandler(getNormalErrorAlert(response.message));
        }
      } catch (error) {
        setLoading(getCancelLoadMsg());
        setMessages([]);
        alertHandler(getNormalErrorAlert('加载聊天历史失败'));
      }
    } else {
      // 使用缓存的历史记录
      setMessages([]);
      setMessages(history);
    }
    
    scrollToBottom();
  };
  
  /**
   * 初始化聊天用户列表
   */
  const loadChatUsers = async (routeParams) => {
    setLoading(getLoadMsg('正在获取聊天信息...', -1));
    
    try {
      const response = await getChatUsers();
      setLoading(getCancelLoadMsg());
      
      let ifParamIdIn = false;
      const paramId = routeParams?.id;
      const paramName = routeParams?.name;
      
      if (!paramId) {
        ifParamIdIn = true;
      }
      
      if (response.status === 200) {
        const users = [];
        
        for (let i = 0; i < response.chat_users.length; i++) {
          if (paramId === response.chat_users[i].user_id) {
            ifParamIdIn = true;
          }
          
          users.push({
            id: response.chat_users[i].user_id,
            name: response.chat_users[i].username,
            msgNum: response.chat_users[i].unread_count,
            lastMsg: {
              content: response.chat_users[i].last_message.content,
              time: formatRelativeTime(response.chat_users[i].last_message.sent_at),
              isSelf: response.chat_users[i].last_message.is_sender,
            },
          });
        }
        
        setChatUsers(users);
        
        // 如果路由参数中的用户不在列表中，添加它
        if (!ifParamIdIn && paramId && paramName) {
          addChatUser({
            id: paramId,
            name: paramName,
            msgNum: 0,
            lastMsg: {
              content: '新的聊天',
              time: formatRelativeTime(new Date().toISOString()),
              isSelf: true,
            },
          });
        }
      } else {
        alertHandler(getNormalErrorAlert(response.message));
      }
      
      // 设置接收者
      if (paramId && paramName) {
        setReceiverId(paramId);
        setReceiverName(paramName);
      }
    } catch (error) {
      setLoading(getCancelLoadMsg());
      alertHandler(getNormalErrorAlert('加载聊天用户列表失败'));
    }
  };
  
  /**
   * 初始化视图尺寸
   */
  const initViewSize = () => {
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const messageContainer = document.getElementById('message-container');
    
    if (messageContainer) {
      messageContainer.style.maxHeight = `${viewportHeight - 90}px`;
      messageContainer.style.minHeight = `${viewportHeight - 90}px`;
    }
    
    const userList = document.getElementById('user-list');
    const desktopMessageEditorContainer = document.getElementById('desktop-message-editor-container');
    
    if (userList && desktopMessageEditorContainer) {
      userList.style.maxHeight = `${viewportHeight - 40}px`;
      userList.style.minHeight = `${viewportHeight - 40}px`;
      desktopMessageEditorContainer.style.maxHeight = `${viewportHeight - 40}px`;
      desktopMessageEditorContainer.style.minHeight = `${viewportHeight - 40}px`;
    }
  };
  
  return {
    loadChatHistory,
    loadChatUsers,
    initViewSize,
  };
}

