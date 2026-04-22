/**
 * 全量拉取 + 轮询：与 IndexedDB 一致后，增量对比追加消息。
 *
 * 边界约定：
 * - 侧栏未读/最后一条只信 getChatUsers（refreshSessionListFromServer），与「当前选中的 thread」解耦，避免在拉当前会话或全量同步时整段 poll 不跑、B 有消息时列表不亮。
 * - 仅当前会话拉 history + 合并/写库受 historyLoadInProgress、fullSyncRunning 门控，避免与 loadChatHistory / 全量写 peer 竞态。
 * - 非当前会话的「消息体」在对方发消息、你停留在别会话时，由打开该会话时 loadChatHistory（IDB + 首屏网络）与全量/后续 poll 补全，列表预览仍以 chat_users 为准。
 */
import { ref } from 'vue';
import { getChatUsers, getChatHistory, markMessageAsRead } from '@/api/modules/chat';
import { formatRelativeTime } from '@/utils/other';
import { normMessageId, normPeerId } from '@/utils/chatIds';
import { createIntervalPoll } from '@/utils/polling/intervalPoll';
import { getChatUsersRows, getHistoryResults, isHistoryResponseOk } from '@/utils/chatApiNormalize';
import {
  ensureSelfUser,
  getMessagesForPeerOrderByTime,
  mapHistoryPartToMessage,
  putMessagesForPeer,
  putSessionFromApiRow,
  rowToMessage,
  setNextHistoryPage,
} from '@/utils/chatLocalDb';

const FULL_PAGE_SIZE = 100;
const POLL_PAGE_SIZE = 30;
const POLL_MS = 22_000;

function mapUserRowsToList(rows) {
  const out = [];
  for (const row of rows) {
    if (!row) continue;
    const last = row.last_message || {};
    out.push({
      id: String(row.user_id),
      name: row.username,
      msgNum: Number(row.unread_count) || 0,
      lastMsg: {
        content: last.content,
        time: last.sent_at ? formatRelativeTime(last.sent_at) : '',
        rawTime: last.sent_at,
        isSelf: last.is_sender,
      },
    });
  }
  return out;
}

function sortMessages(list) {
  return list.slice().sort((a, b) => {
    const ta = new Date(a.time).getTime();
    const tb = new Date(b.time).getTime();
    return (Number.isNaN(ta) ? 0 : ta) - (Number.isNaN(tb) ? 0 : tb);
  });
}

export function useChatSync(
  selfId,
  selfName,
  receiverId,
  receiverName,
  ifMounted,
  messages,
  setChatUsers,
  setMessages,
  setChatHistory,
  scrollToBottom,
  historyLoadInProgress
) {
  const fullSyncRunning = ref(false);
  const poll = createIntervalPoll({
    intervalMs: POLL_MS,
    shouldRun: () => ifMounted.value && !!selfId,
    tick: () => pollOnce(),
    immediate: false,
  });

  async function fetchAllMessagesForPeer(peerId, peerName) {
    const ctx = { selfName, selfId, peerName, peerId };
    const allChrono = [];
    let lastPageWithData = 0;
    for (let page = 1; page <= 500; page += 1) {
      const res = await getChatHistory(peerId, page, FULL_PAGE_SIZE);
      if (!isHistoryResponseOk(res)) break;
      const part = getHistoryResults(res);
      if (part.length === 0) break;
      lastPageWithData = page;
      const chrono = part
        .slice()
        .reverse()
        .map((p) => mapHistoryPartToMessage(p, ctx));
      allChrono.unshift(...chrono);
      if (part.length < FULL_PAGE_SIZE) {
        break;
      }
    }
    await putMessagesForPeer(selfId, peerId, allChrono, { clearPeer: true });
    if (lastPageWithData) {
      await setNextHistoryPage(peerId, lastPageWithData + 1);
    }
  }

  /**
   * 会话列表 + 每会话 meta（未读、最后一条）：仅依赖 getChatUsers，与当前打开哪条 thread 无关。
   * 必须与其他逻辑解耦，否则在「全量拉消息」或「正在 load 当前会话历史」时侧栏会长期不更新。
   */
  async function refreshSessionListFromServer() {
    if (!ifMounted.value || !selfId) return;
    const res = await getChatUsers();
    if (res?.status !== 200) {
      return;
    }
    const userRows = getChatUsersRows(res);
    for (const row of userRows) {
      await putSessionFromApiRow(row);
    }
    setChatUsers(mapUserRowsToList(userRows));
  }

  async function runFullSync() {
    if (!selfId || !ifMounted.value) return;
    if (fullSyncRunning.value) return;
    fullSyncRunning.value = true;
    try {
      await ensureSelfUser(selfId);
      const res = await getChatUsers();
      if (res?.status !== 200) {
        return;
      }
      const userRows = getChatUsersRows(res);
      if (ifMounted.value) {
        for (const row of userRows) {
          await putSessionFromApiRow(row);
        }
        setChatUsers(mapUserRowsToList(userRows));
      }
      for (const row of userRows) {
        if (!ifMounted.value) return;
        const peerId = row.user_id;
        const peerName = row.username;
        try {
          await fetchAllMessagesForPeer(peerId, peerName);
        } catch (e) {
          console.warn('full sync peer', peerId, e);
        }
      }
      const cur = normPeerId(receiverId.value);
      if (cur) {
        const fresh = await getMessagesForPeerOrderByTime(cur);
        if (fresh.length && ifMounted.value) {
          if (!historyLoadInProgress || !historyLoadInProgress.value) {
            setMessages(fresh.map(rowToMessage));
            setChatHistory(cur, messages.value);
          }
        }
      }
    } catch (e) {
      console.warn('full sync', e);
    } finally {
      fullSyncRunning.value = false;
    }
  }

  async function pollOnce() {
    if (!ifMounted.value || !selfId) return;
    try {
      await ensureSelfUser(selfId);
      await refreshSessionListFromServer();
      if (fullSyncRunning.value) {
        return;
      }
      if (historyLoadInProgress && historyLoadInProgress.value) {
        return;
      }
      const rid = normPeerId(receiverId.value);
      if (!rid) {
        return;
      }
      const hRes = await getChatHistory(rid, 1, POLL_PAGE_SIZE);
      if (!isHistoryResponseOk(hRes)) return;
      const part = getHistoryResults(hRes);
      if (part.length === 0) return;
      const ctx = {
        selfName,
        selfId,
        peerName: receiverName.value,
        peerId: rid,
      };
      const incoming = part
        .slice()
        .reverse()
        .map((p) => mapHistoryPartToMessage(p, ctx));
      for (const m of incoming) {
        if (!m.isSelf && m.ifRead === false) {
          const ok = await markMessageAsRead(m.id);
          if (ok && ok.status === 200) {
            m.ifRead = true;
          }
        }
      }
      const byId = new Map(
        messages.value.map((m) => [normMessageId(m.id), { ...m, id: normMessageId(m.id) }])
      );
      let changed = false;
      for (const inc of incoming) {
        const ik = normMessageId(inc.id);
        const prev = byId.get(ik);
        const next = prev ? { ...prev, ...inc, id: ik } : { ...inc, id: ik };
        if (!prev) {
          changed = true;
        } else if (
          next.ifRead !== prev.ifRead ||
          (next.content != null && next.content !== prev.content)
        ) {
          changed = true;
        }
        byId.set(ik, next);
      }
      if (!changed) return;
      const next = sortMessages(Array.from(byId.values()));
      const hadNew =
        next.length > messages.value.length ||
        incoming.some(
          (inc) => !messages.value.some((m) => normMessageId(m.id) === normMessageId(inc.id))
        );
      messages.value = next;
      setChatHistory(rid, messages.value);
      await putMessagesForPeer(selfId, rid, messages.value, { clearPeer: false });
      if (hadNew) {
        scrollToBottom();
      }
    } catch (e) {
      console.warn('chat poll', e);
    }
  }

  function start() {
    stop();
    if (!selfId) return;
    void runFullSync();
    poll.start();
  }

  function stop() {
    poll.stop();
  }

  return { start, stop, runFullSync, pollOnce, refreshSessionListFromServer };
}
