/**
 * ChatPage 数据管理 Composable
 */
import { ref } from 'vue';
import { normMessageId, normPeerId } from '@/utils/chatIds';

export function useChatData() {
  const messages = ref([]);
  const chatUsers = ref([]);
  const chatHistoryDict = ref({});
  const chatPageDict = ref({});
  const editingMessage = ref(null);
  
  const addMessage = (message) => {
    if (!message) return;
    messages.value.push({
      ...message,
      id: normMessageId(message.id),
      userId: message.userId == null ? message.userId : String(message.userId),
    });
  };
  
  const setMessages = (newMessages) => {
    const list = newMessages || [];
    messages.value = list.map((m) => ({
      ...m,
      id: normMessageId(m.id),
      userId: m.userId == null ? m.userId : String(m.userId),
    }));
  };
  
  const removeMessage = (id) => {
    const k = normMessageId(id);
    const index = messages.value.findIndex((msg) => normMessageId(msg.id) === k);
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
    const k = normPeerId(userId);
    const index = chatUsers.value.findIndex((u) => normPeerId(u.id) === k);
    if (index !== -1) {
      chatUsers.value[index] = { ...chatUsers.value[index], ...updates };
    }
  };
  
  const setChatHistory = (userId, history) => {
    const k = normPeerId(userId);
    if (k) chatHistoryDict.value[k] = history;
  };
  
  const getChatHistory = (userId) => {
    const k = normPeerId(userId);
    return k ? (chatHistoryDict.value[k] ?? null) : null;
  };
  
  const setChatPage = (userId, page) => {
    const k = normPeerId(userId);
    if (k) chatPageDict.value[k] = page;
  };
  
  const getChatPage = (userId) => {
    const k = normPeerId(userId);
    return k ? (chatPageDict.value[k] ?? null) : null;
  };
  
  const incrementChatPage = (userId) => {
    const k = normPeerId(userId);
    if (!k) return;
    if (chatPageDict.value[k]) {
      chatPageDict.value[k]++;
    } else {
      chatPageDict.value[k] = 2;
    }
  };
  
  const setEditingMessage = (value) => {
    editingMessage.value = value;
  };

  /**
   * 仅追加在内存中尚不存在的消息（按 time 正序整表重排，用于轮询/增量拉取）
   */
  const appendNewMessages = (incoming) => {
    if (!incoming || !incoming.length) return 0;
    const byId = new Map();
    for (const m of messages.value) {
      byId.set(normMessageId(m.id), m);
    }
    let added = 0;
    for (const m of incoming) {
      if (m == null || m.id == null) continue;
      const idk = normMessageId(m.id);
      if (!byId.has(idk)) {
        byId.set(idk, { ...m, id: idk, userId: m.userId == null ? m.userId : String(m.userId) });
        added += 1;
      }
    }
    const next = Array.from(byId.values());
    next.sort((a, b) => {
      const ta = new Date(a.time).getTime();
      const tb = new Date(b.time).getTime();
      return (Number.isNaN(ta) ? 0 : ta) - (Number.isNaN(tb) ? 0 : tb);
    });
    messages.value = next;
    return added;
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
    appendNewMessages,
  };
}

