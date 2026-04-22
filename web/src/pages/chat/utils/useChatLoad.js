/**
 * ChatPage 加载逻辑：先 IndexedDB 再网络合并；与轮询/全量写库一致。
 */
import { ref } from 'vue';
import { getNormalErrorAlert, formatRelativeTime } from '@/utils/other';
import { normMessageId, normPeerId } from '@/utils/chatIds';
import { getChatHistory, getChatUsers, markMessageAsRead } from '@/api/modules/chat';
import { getHistoryResults, isHistoryResponseOk } from '@/utils/chatApiNormalize';
import {
  ensureSelfUser,
  getMessagesForPeerOrderByTime,
  getNextHistoryPage,
  mapHistoryPartToMessage,
  putMessagesForPeer,
  putSessionFromApiRow,
  rowToMessage,
  sessionRowsToChatUsers,
  setNextHistoryPage,
} from '@/utils/chatLocalDb';

function sortByTime(msgs) {
  return msgs.slice().sort((a, b) => {
    const ta = new Date(a.time).getTime();
    const tb = new Date(b.time).getTime();
    return (Number.isNaN(ta) ? 0 : ta) - (Number.isNaN(tb) ? 0 : tb);
  });
}

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
  loading,
  scrollToBottom,
  alertHandler
) {
  const historyLoadInProgress = ref(false);
  let historyLoadId = 0;

  const loadChatHistory = async () => {
    if (!ifMounted.value || !receiverId.value) {
      return;
    }
    const rid = normPeerId(receiverId.value);
    if (!rid) return;
    const myId = (historyLoadId += 1);
    historyLoadInProgress.value = true;
    if (selfId) {
      try {
        await ensureSelfUser(selfId);
      } catch (e) {
        console.warn('chat ensureSelfUser', e);
      }
    }

    let fromDb = [];
    try {
      if (selfId) {
        fromDb = await getMessagesForPeerOrderByTime(rid);
      }
    } catch (e) {
      console.warn('getMessagesForPeerOrderByTime', e);
    }

    if (fromDb.length) {
      if (myId !== historyLoadId) return;
      setMessages(fromDb.map(rowToMessage));
      const np = await getNextHistoryPage(rid);
      if (myId !== historyLoadId || normPeerId(receiverId.value) !== rid) return;
      setChatPage(rid, np);
      setChatHistory(rid, messages.value);
    } else {
      const history = chatHistoryDict.value[rid];
      if (history != null) {
        if (myId !== historyLoadId) return;
        setMessages(sortByTime(history));
        try {
          const np = await getNextHistoryPage(rid);
          if (myId !== historyLoadId || normPeerId(receiverId.value) !== rid) return;
          setChatPage(rid, np);
        } catch (e) {
          if (myId !== historyLoadId) return;
          setChatPage(rid, 2);
        }
        historyLoadInProgress.value = false;
        scrollToBottom();
        return;
      }
    }

    const needSpinner = fromDb.length === 0;
    if (needSpinner) {
      loading.value.loadHistory = true;
    }
    try {
      if (myId !== historyLoadId || normPeerId(receiverId.value) !== rid) {
        return;
      }
      const response = await getChatHistory(rid, 1, 10);
      if (myId !== historyLoadId || normPeerId(receiverId.value) !== rid) {
        return;
      }
      if (isHistoryResponseOk(response)) {
        const results = getHistoryResults(response);
        const newMessages = [];
        for (const raw of results.slice().reverse()) {
          const msg = mapHistoryPartToMessage(raw, {
            selfName,
            selfId,
            peerName: receiverName.value,
            peerId: rid,
          });
          if (!msg.ifRead && !msg.isSelf) {
            await markMessageAsRead(msg.id);
            msg.ifRead = true;
          }
          if (myId !== historyLoadId || normPeerId(receiverId.value) !== rid) {
            return;
          }
          newMessages.push(msg);
        }
        if (myId !== historyLoadId || normPeerId(receiverId.value) !== rid) {
          return;
        }
        if (fromDb.length) {
          const byId = new Map();
          for (const m of fromDb.map(rowToMessage)) {
            byId.set(normMessageId(m.id), m);
          }
          for (const m of newMessages) {
            byId.set(normMessageId(m.id), m);
          }
          setMessages(sortByTime(Array.from(byId.values())));
        } else {
          setMessages(newMessages);
          setChatPage(rid, 2);
          await setNextHistoryPage(rid, 2);
        }
        setChatHistory(rid, messages.value);
        if (selfId) {
          await putMessagesForPeer(selfId, rid, messages.value, { clearPeer: !fromDb.length });
        }
      } else {
        if (!fromDb.length) {
          setMessages([]);
          alertHandler(getNormalErrorAlert(response.message));
        }
      }
    } catch (error) {
      if (!fromDb.length) {
        setMessages([]);
        alertHandler(getNormalErrorAlert('加载聊天历史失败'));
      }
    } finally {
      if (needSpinner) {
        loading.value.loadHistory = false;
      }
      historyLoadInProgress.value = false;
    }

    if (myId === historyLoadId && normPeerId(receiverId.value) === rid) {
      scrollToBottom();
    }
  };

  const loadChatUsers = async (routeParams) => {
    if (selfId) {
      try {
        await ensureSelfUser(selfId);
        const local = await sessionRowsToChatUsers(formatRelativeTime);
        if (local.length) {
          setChatUsers(local);
        }
      } catch (e) {
        console.warn('sessionRowsToChatUsers', e);
      }
    }

    loading.value.loadUsers = true;
    try {
      const response = await getChatUsers();

      let ifParamIdIn = false;
      const paramId = routeParams?.id;
      const paramName = routeParams?.name;

      if (!paramId) {
        ifParamIdIn = true;
      }

      if (response.status === 200) {
        const rows = response.chat_users || [];
        for (const row of rows) {
          if (row) {
            await putSessionFromApiRow(row);
          }
        }
        const users = [];
        for (let i = 0; i < rows.length; i++) {
          if (String(paramId) === String(rows[i].user_id)) {
            ifParamIdIn = true;
          }
          const lm = rows[i].last_message || {};
          users.push({
            id: String(rows[i].user_id),
            name: rows[i].username,
            msgNum: Number(rows[i].unread_count) || 0,
            lastMsg: {
              content: lm.content,
              time: rows[i].last_message
                ? formatRelativeTime(lm.sent_at)
                : '',
              rawTime: lm.sent_at,
              isSelf: !!lm.is_sender,
            },
          });
        }

        setChatUsers(users);

        if (!ifParamIdIn && paramId && paramName) {
          addChatUser({
            id: String(paramId),
            name: paramName,
            msgNum: 0,
            lastMsg: {
              content: '新的聊天',
              time: formatRelativeTime(new Date().toISOString()),
              rawTime: new Date().toISOString(),
              isSelf: true,
            },
          });
        }
      } else {
        alertHandler(getNormalErrorAlert(response.message));
      }

      if (paramId && paramName) {
        setReceiverId(paramId);
        setReceiverName(paramName);
      }
    } catch (error) {
      alertHandler(getNormalErrorAlert('加载聊天用户列表失败'));
    } finally {
      loading.value.loadUsers = false;
    }
  };

  const initViewSize = () => {
    const messageContainer = document.getElementById('message-container');
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1000;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    if (messageContainer) {
      if (isMobile) {
        const h = Math.max(200, viewportHeight - 90);
        messageContainer.style.maxHeight = `${h}px`;
        messageContainer.style.minHeight = '';
      } else {
        messageContainer.style.maxHeight = '';
        messageContainer.style.minHeight = '';
      }
    }

    const userList = document.getElementById('user-list');
    const desktopMessageEditorContainer = document.getElementById('desktop-message-editor-container');
    if (userList) {
      if (isMobile) {
        const h = Math.max(200, viewportHeight - 40);
        userList.style.maxHeight = `${h}px`;
        userList.style.minHeight = '';
      } else {
        userList.style.maxHeight = '';
        userList.style.minHeight = '';
      }
    }
    if (desktopMessageEditorContainer) {
      if (isMobile) {
        const h = Math.max(200, viewportHeight - 40);
        desktopMessageEditorContainer.style.maxHeight = `${h}px`;
        desktopMessageEditorContainer.style.minHeight = '';
      } else {
        desktopMessageEditorContainer.style.maxHeight = '';
        desktopMessageEditorContainer.style.minHeight = '';
      }
    }
  };

  return {
    loadChatHistory,
    loadChatUsers,
    initViewSize,
    historyLoadInProgress,
  };
}
