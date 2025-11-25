/**
 * ChatPage 数据管理 Composable
 */
import { ref } from 'vue';

export function useChatData() {
  const messages = ref([]);
  const chatUsers = ref([]);
  const chatHistoryDict = ref({});
  const chatPageDict = ref({});
  const editingMessage = ref(null);
  
  const addMessage = (message) => {
    messages.value.push(message);
  };
  
  const setMessages = (newMessages) => {
    messages.value = newMessages;
  };
  
  const removeMessage = (id) => {
    const index = messages.value.findIndex(msg => msg.id === id);
    if (index !== -1) {
      messages.value.splice(index, 1);
    }
  };
  
  const addChatUser = (user) => {
    chatUsers.value.push(user);
  };
  
  const setChatUsers = (users) => {
    chatUsers.value = users;
  };
  
  const updateChatUser = (userId, updates) => {
    const index = chatUsers.value.findIndex(user => user.id === userId);
    if (index !== -1) {
      chatUsers.value[index] = { ...chatUsers.value[index], ...updates };
    }
  };
  
  const setChatHistory = (userId, history) => {
    chatHistoryDict.value[userId] = history;
  };
  
  const getChatHistory = (userId) => {
    return chatHistoryDict.value[userId] || null;
  };
  
  const setChatPage = (userId, page) => {
    chatPageDict.value[userId] = page;
  };
  
  const getChatPage = (userId) => {
    return chatPageDict.value[userId] || null;
  };
  
  const incrementChatPage = (userId) => {
    if (chatPageDict.value[userId]) {
      chatPageDict.value[userId]++;
    } else {
      chatPageDict.value[userId] = 2;
    }
  };
  
  const setEditingMessage = (value) => {
    editingMessage.value = value;
  };
  
  return {
    messages,
    chatUsers,
    chatHistoryDict,
    chatPageDict,
    editingMessage,
    addMessage,
    setMessages,
    removeMessage,
    addChatUser,
    setChatUsers,
    updateChatUser,
    setChatHistory,
    getChatHistory,
    setChatPage,
    getChatPage,
    incrementChatPage,
    setEditingMessage,
  };
}

