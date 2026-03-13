<template>
  <div class="agent-layout" :class="{ 'agent-layout--mobile': isMobile }">
    <!-- 左侧：会话列表（PC 常驻，移动端可隐藏） -->
    <aside
      class="agent-sidebar"
      :class="{
        'agent-sidebar--open': isMobile ? sidebarOpen : true,
        'agent-sidebar--mobile': isMobile,
      }"
    >
      <div class="sidebar-header">
        <span class="sidebar-title">对话</span>
        <v-btn
          icon="mdi-plus"
          variant="text"
          size="small"
          :color="themeColor"
          @click="startNewChat"
        />
      </div>
      <div class="sidebar-list">
        <div
          v-for="s in sessions"
          :key="s.id"
          class="sidebar-item"
          :class="{ 'sidebar-item--active': currentSessionId === s.id }"
          @click="selectSession(s.id)"
        >
          <span class="sidebar-item-title">{{ s.title || '新对话' }}</span>
          <span class="sidebar-item-time">{{ formatSessionTime(s.updated_at) }}</span>
          <v-btn
            v-if="currentSessionId === s.id"
            icon="mdi-close"
            variant="text"
            size="x-small"
            class="sidebar-item-delete"
            @click.stop="deleteSession(s.id)"
          />
        </div>
      </div>
      <div class="sidebar-footer">
        <span class="sidebar-footer-hint">聊天记录保存在本地</span>
        <v-btn
          icon="mdi-cog-outline"
          variant="text"
          size="small"
          class="sidebar-footer-btn"
          color="grey"
          @click="showAgentConfigDialog = true"
        />
      </div>
    </aside>
    <v-dialog
      v-model="showAgentConfigDialog"
      max-width="500"
      persistent
      content-class="agent-config-dialog"
      @after-enter="onAgentConfigDialogOpen"
    >
      <v-card class="pa-4">
        <v-card-title class="d-flex align-center">
          <v-icon icon="mdi-robot-outline" class="mr-2" />
          Agent 模型配置（本地存储）
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" size="small" @click="showAgentConfigDialog = false" />
        </v-card-title>
        <v-card-text>
          <div class="text-small mb-3" style="color: #6b6b6b;">
            网站不提供 Key；请自行填写。配置仅保存在浏览器本地（LocalStorage）。
          </div>
          <v-text-field
            v-model="agentCfg.baseUrl"
            label="Base URL（OpenAI兼容）"
            density="compact"
            variant="outlined"
            placeholder="https://api.openai.com/v1"
          />
          <v-text-field
            v-model="agentCfg.model"
            label="Model"
            density="compact"
            variant="outlined"
            placeholder="gpt-4o-mini"
          />
          <v-text-field
            v-model="agentCfg.apiKey"
            :type="showApiKey ? 'text' : 'password'"
            label="API Key"
            density="compact"
            variant="outlined"
            placeholder="sk-..."
            :append-inner-icon="showApiKey ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showApiKey = !showApiKey"
          />
          <div class="text-small mt-1 mb-1" style="color: #6b6b6b;">Temperature: {{ agentCfg.temperature }}</div>
          <v-slider
            v-model="agentCfg.temperature"
            :min="0"
            :max="1"
            :step="0.05"
            density="compact"
            color="var(--theme-color)"
          />
          <v-text-field
            v-model.number="agentCfg.maxTokens"
            label="Max Tokens"
            density="compact"
            variant="outlined"
            type="number"
            :min="64"
            :max="4096"
          />
          <v-text-field
            v-model.number="agentCfg.maxRounds"
            label="Max Rounds（工具调用最大轮数）"
            density="compact"
            variant="outlined"
            type="number"
            :min="1"
            :max="32"
            hint="单次对话中 LLM 可进行工具调用的最大轮数"
            persistent-hint
          />
          <v-text-field
            v-model.number="agentCfg.contextRounds"
            label="上下文记忆轮数"
            density="compact"
            variant="outlined"
            type="number"
            :min="0"
            :max="20"
            hint="请求时携带最近 n 轮（用户+助手）对话；0 表示不携带历史"
            persistent-hint
          />
          <div class="row-actions mt-3">
            <v-btn color="var(--theme-color)" variant="flat" @click="saveAgentCfg">保存</v-btn>
            <v-btn color="grey" variant="outlined" @click="resetAgentCfg">重置为默认</v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
    <div v-if="isMobile && sidebarOpen" class="sidebar-overlay" @click="sidebarOpen = false" />
    <div class="agent-main">
      <div class="agent-shell">
        <div class="agent-top" :class="{ 'agent-top--mobile': isMobile }">
          <v-btn
            v-if="isMobile"
            icon="mdi-menu"
            variant="text"
            :color="themeColor"
            @click="sidebarOpen = true"
          />
          <div v-if="isMobile" class="page-title-bold">AI问答</div>
          <v-spacer></v-spacer>
          <v-btn
            variant="outlined"
            color="grey"
            :prepend-icon="'mdi-plus'"
            size="small"
            @click="startNewChat"
          >
            {{ '新对话' }}
          </v-btn>
          <v-btn
            variant="outlined"
            color="grey"
            :prepend-icon="'mdi-broom'"
            size="small"
            @click="clearChat"
          >
            {{ '清空' }}
          </v-btn>
        </div>

      <v-alert
        v-if="!configOk"
        type="warning"
        variant="tonal"
        class="mb-3 agent-config-alert"
      >
        未配置 Agent 模型参数或 API Key。请到「Self → 设置」填写本地配置后再使用。
        <template #append>
          <v-btn variant="text" :color="themeColor" @click="toSelfSetting">去设置</v-btn>
        </template>
      </v-alert>

      <div id="agent-message-container" class="message-container" :class="{ 'message-container--mobile': isMobile }">
        <div
          v-for="m in messages"
          :key="m.id"
          class="message-row"
          :class="m.role === 'user' ? 'row-user' : 'row-assistant'"
        >
          <div v-if="m.role === 'assistant'" class="message-avatar message-avatar--bot">
            <v-avatar size="32" color="grey-lighten-2">
              <v-icon icon="mdi-robot-outline" size="20" color="grey-darken-1" />
            </v-avatar>
          </div>
          <v-card
            class="message-bubble"
            :color="m.role === 'user' ? 'var(--theme-color)' : undefined"
            :variant="m.role === 'user' ? 'flat' : 'flat'"
          >
            <template v-if="m.role === 'assistant'">
              <div class="assistant-content">
                <div
                  v-if="m.process && m.process.root"
                  class="process-header"
                  @click="m.process.expanded = !m.process.expanded"
                >
                  <v-icon icon="mdi-lightbulb-outline" size="18" color="#8a8a8a" />
                  <div class="text-tiny process-header-text">
                    {{ m.generating ? '正在思考' : '已完成思考' }}
                  </div>
                  <v-icon
                    :icon="m.process.expanded ? 'mdi-chevron-down' : 'mdi-chevron-right'"
                    size="20"
                    color="#8a8a8a"
                    class="process-header-chevron"
                  />
                </div>
                <div v-if="m.process && m.process.summary" class="process-summary text-tiny">
                  {{ m.process.summary }}
                </div>
                <Transition name="process-panel">
                  <div
                    v-if="m.process && m.process.expanded"
                    class="process-panel"
                    :data-process-panel="m.id"
                  >
                    <div
                      v-for="(row, idx) in flattenProcess(m.process.root)"
                      :key="row.id"
                      class="process-row"
                      :style="{ paddingLeft: `${10 + row.depth * 14}px`, animationDelay: `${idx * 0.03}s` }"
                    >
                      <div class="process-dot" :class="`process-dot-${row.status}`"></div>
                      <div class="text-tiny process-text">{{ row.title }}</div>
                      <div v-if="row.meta" class="text-tiny process-meta">{{ row.meta }}</div>
                    </div>
                  </div>
                </Transition>
                <MdPreview
                  v-if="mdReady && m.content"
                  :id="`agent_${m.id}`"
                  :modelValue="m.content"
                  style="border:none;"
                />
                <div v-else-if="m.content" class="support-line-feed">
                  {{ m.content }}
                </div>
              </div>
            </template>
            <template v-else>
              <div class="support-line-feed" :style="{ color: '#ffffff' }">
                {{ m.content }}
              </div>
            </template>
          </v-card>
          <div v-if="m.role === 'user'" class="message-avatar message-avatar--user">
            <avatar-name
              v-if="userAvatarData.id"
              :init-data="userAvatarData"
              :if-show-name="false"
              size="32"
              :clickable="false"
            />
            <v-avatar v-else size="32" color="grey-lighten-2">
              <v-icon icon="mdi-account" size="20" color="grey-darken-1" />
            </v-avatar>
          </div>
        </div>
      </div>

      <div class="editor" :class="{ 'editor--mobile': isMobile }">
        <div class="editor-row">
          <v-textarea
            v-model="input"
            auto-grow
            rows="1"
            max-rows="6"
            density="compact"
            variant="outlined"
            class="editor-input"
            :placeholder="configOk ? '输入你的问题…' : '请先在设置中配置 API Key'"
            :disabled="loading || !configOk"
            hide-details
          />
          <v-btn
            class="send-btn"
            :color="themeColor"
            variant="flat"
            :loading="loading"
            :disabled="loading || !configOk || !input.trim()"
            @click="send"
          >
            发送
          </v-btn>
          <v-btn
            v-if="loading"
            color="grey"
            variant="outlined"
            prepend-icon="mdi-stop"
            @click="cancel"
          >
            停止
          </v-btn>
        </div>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { openPage } from '@/utils/other';
import { getDeviceType } from '@/utils/device';
import {
  getAgentLLMConfig,
  getDefaultAgentLLMConfig,
  setAgentLLMConfig,
  clearAgentLLMConfig,
  validateAgentLLMConfig,
} from '@/agent/config';
import { createOrchestrator } from '@/agent/orchestrator';
import { MdPreview } from 'md-editor-v3';
import 'md-editor-v3/lib/preview.css';
import {
  listSessions,
  getMessages,
  createSession,
  addMessage,
  updateMessageContent,
  deleteSession as deleteSessionDb,
  DEFAULT_TITLE,
  TITLE_MAX,
} from './agentChatDb';
import { selfDefineLocalStorage } from '@/utils/localStorage';
import { getCookie } from '@/utils/cookie';
import AvatarName from '@/components/common/AvatarName/index.vue';

const LAST_SESSION_KEY = 'agent.lastSessionId';

defineOptions({ name: 'AgentPage' });

const isMobile = computed(() => getDeviceType() === 'mobile');
const emit = defineEmits(['alert', 'set_loading']);

const themeColor = ref('#9c0c13');
const mdReady = ref(false);
const sessions = ref([]);
const currentSessionId = ref(null);
const sidebarOpen = ref(false);
const loadingSessions = ref(false);
const showAgentConfigDialog = ref(false);
const showApiKey = ref(false);
const agentCfg = ref({ ...getDefaultAgentLLMConfig() });

const welcomeMessage = () => ({
  id: `m_${Date.now()}`,
  role: 'assistant',
  content: '我可以帮你在站内查文章/帖子/回复/课程，并把结果整理成要点。\n\n- 先在 **Self → 设置** 配置模型参数与 API Key\n- 然后在这里提问（仅信息获取，不做发布/修改）',
});

const messages = ref([welcomeMessage()]);

const input = ref('');
const loading = ref(false);
let abortController = null;

const cfg = computed(() => getAgentLLMConfig());
const configOk = computed(() => validateAgentLLMConfig(cfg.value).ok);

const userAvatarData = computed(() => ({
  id: getCookie('userId') || '',
  name: getCookie('userName') || '',
}));

const orchestrator = createOrchestrator();

const getScrollContainer = () => {
  const el = document.getElementById('agent-message-container');
  if (el && typeof el.scrollTo === 'function') return el;
  return document.scrollingElement || document.documentElement;
};

const scrollToBottom = () => {
  setTimeout(() => {
    const container = getScrollContainer();
    if (!container) return;
    container.scrollTo(0, container.scrollHeight);
  }, 50);
};

const scrollProcessPanelToBottom = (msgId) => {
  requestAnimationFrame(() => {
    try {
      const el = document.querySelector(`[data-process-panel="${msgId}"]`);
      if (!el) return;
      el.scrollTop = el.scrollHeight;
    } catch {
      // ignore
    }
  });
};

// 某些浏览器/构建下，深层 reactive 变更在长 async 流程中可能不够及时刷新视图；
// 这里用 rAF 轻量触发一次列表引用更新，确保事件流在执行过程中持续可见更新。
let rafPending = false;
const scheduleRender = () => {
  if (rafPending) return;
  rafPending = true;
  requestAnimationFrame(() => {
    rafPending = false;
    messages.value = messages.value.slice();
  });
};

const newProcNode = ({ type, title, status = 'doing', meta = '' }) =>
  reactive({
    id: `${type}_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    type,
    title,
    status,
    meta,
    children: [],
  });

const flattenProcess = (root) => {
  const rows = [];
  const walk = (node, depth) => {
    rows.push({
      id: node.id,
      depth,
      title: node.title,
      status: node.status || 'pending',
      meta: node.meta || '',
    });
    for (const child of node.children || []) {
      walk(child, depth + 1);
    }
  };
  if (root) walk(root, 0);
  return rows;
};

const toSelfSetting = () => {
  openPage('router', { name: 'SelfPage' });
};

function formatSessionTime(ts) {
  if (ts == null) return '';
  const d = new Date(ts);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const t = d.getTime();
  if (t >= today.getTime()) return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  if (t >= today.getTime() - 86400000) return '昨天';
  if (t >= today.getTime() - 86400000 * 7) return `${Math.floor((today - t) / 86400000)}天前`;
  return d.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
}

async function loadSessions() {
  loadingSessions.value = true;
  try {
    sessions.value = await listSessions();
  } finally {
    loadingSessions.value = false;
  }
}

async function loadSession(sessionId) {
  const list = await getMessages(sessionId);
  messages.value = list.length
    ? list.map((r) => ({ id: `m_${r.id}`, role: r.role, content: r.content || '' }))
    : [welcomeMessage()];
  currentSessionId.value = sessionId;
  if (isMobile.value) sidebarOpen.value = false;
}

function selectSession(sessionId) {
  if (currentSessionId.value === sessionId) return;
  loadSession(sessionId);
  selfDefineLocalStorage.setItem(LAST_SESSION_KEY, String(sessionId));
}

async function startNewChat() {
  const title = DEFAULT_TITLE;
  const id = await createSession(title);
  await loadSessions();
  currentSessionId.value = id;
  messages.value = [welcomeMessage()];
  selfDefineLocalStorage.setItem(LAST_SESSION_KEY, String(id));
  if (isMobile.value) sidebarOpen.value = false;
}

async function deleteSession(sessionId) {
  await deleteSessionDb(sessionId);
  await loadSessions();
  if (currentSessionId.value === sessionId) {
    currentSessionId.value = sessions.value[0]?.id ?? null;
    if (currentSessionId.value) loadSession(currentSessionId.value);
    else messages.value = [welcomeMessage()];
    selfDefineLocalStorage.setItem(LAST_SESSION_KEY, currentSessionId.value ? String(currentSessionId.value) : '');
  }
}

const onAgentConfigDialogOpen = () => {
  agentCfg.value = { ...getAgentLLMConfig() };
};

const saveAgentCfg = () => {
  setAgentLLMConfig(agentCfg.value);
  showAgentConfigDialog.value = false;
};

const resetAgentCfg = () => {
  clearAgentLLMConfig();
  agentCfg.value = { ...getDefaultAgentLLMConfig() };
};

const clearChat = () => {
  messages.value = [
    {
      id: `m_${Date.now()}`,
      role: 'assistant',
      content: '已清空对话。你可以继续提问（仅支持信息获取）。',
    },
  ];
};

const cancel = () => {
  if (abortController) {
    abortController.abort();
  }
};

const send = async () => {
  if (!configOk.value) {
    emit('alert', { state: true, color: 'warning', title: '未配置', content: '请先在 Self → 设置中配置 API Key/模型参数' });
    return;
  }
  const text = input.value.trim();
  if (!text) return;

  input.value = '';
  loading.value = true;
  abortController = new AbortController();

  if (!currentSessionId.value) {
    const title = String(text).slice(0, TITLE_MAX).trim() || DEFAULT_TITLE;
    currentSessionId.value = await createSession(title);
    await loadSessions();
    selfDefineLocalStorage.setItem(LAST_SESSION_KEY, String(currentSessionId.value));
  }
  await addMessage(currentSessionId.value, 'user', text);

  const userMsg = { id: `u_${Date.now()}`, role: 'user', content: text };
  messages.value.push(userMsg);

  const contextRounds = Math.max(0, Math.min(20, Number(cfg.value.contextRounds) ?? 6));
  const historySize = contextRounds * 2;
  const history = messages.value
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .slice(-historySize)
    .map((m) => ({ role: m.role, content: m.content || '' }));

  const assistantDbId = await addMessage(currentSessionId.value, 'assistant', '');
  const assistantMsg = reactive({
    id: `a_${Date.now()}`,
    _dbId: assistantDbId,
    role: 'assistant',
    content: '',
    generating: true,
    process: {
      // 执行中默认展开；执行完成后默认收起（见 finally）
      expanded: true,
      summary: '理解问题中…',
      root: newProcNode({ type: 'root', title: 'Agent 流程', status: 'doing' }),
      currentAgent: null,
      currentRound: null,
      currentLLMCall: null,
      toolCallNodes: {},
    },
  });
    messages.value.push(assistantMsg);
    scrollToBottom();

  let pendingToolCalls = 0;
  const proc = assistantMsg.process;

  const setSummary = (text) => {
    proc.summary = String(text || '').trim();
    scheduleRender();
    scrollToBottom();
  };

  try {
    const result = await orchestrator.handle({
      cfg: cfg.value,
      history,
      userText: text,
      signal: abortController.signal,
      onEvent: (e) => {
        if (e?.type === 'intent_router_start') {
          setSummary('识别意图中…');
        } else if (e?.type === 'intent_router_result' || e?.type === 'intent_router_end') {
          const intents = e.intents;
          if (intents && intents.length) {
            proc.root.meta = `意图：${intents.join('、')}`;
            setSummary(`意图：${intents.join('、')}`);
          }
        } else if (e?.type === 'intent_dispatch') {
          const label = e.intent === 'site_query' ? '站内查询' : e.intent === 'site_docs' ? '本站说明与政策' : '无关话题';
          setSummary(`派发：${label}`);
          const node = newProcNode({ type: 'dispatch', title: label, status: 'doing' });
          proc.root.children.push(node);
        } else if (e?.type === 'agent_run_start') {
          const title = e.agent_id === 'site_docs' ? '本站说明与政策 Agent' : `${e.domain || e.agent_id} Agent`;
          setSummary(`运行 ${title}…`);
          const agentNode = newProcNode({ type: 'agent', title, status: 'doing' });
          proc.root.children.push(agentNode);
          proc.currentAgent = agentNode;
        } else if (e?.type === 'agent_run_end') {
          if (proc.currentAgent) proc.currentAgent.status = 'done';
        } else if (e?.type === 'agent_merge') {
          setSummary('合并多意图回答…');
          const parts = e.parts || [];
          if (parts.length) {
            const mergeNode = newProcNode({ type: 'merge', title: `合并：${parts.join('、')}`, status: 'done' });
            proc.root.children.push(mergeNode);
          }
        } else if (e?.type === 'orchestrator_route') {
          setSummary(`选择领域：${e.domain}`);
          proc.root.meta = (proc.root.meta ? proc.root.meta + '；' : '') + `domain=${e.domain}`;
        } else if (e?.type === 'agent_selected') {
          setSummary(`使用 ${e.domain} Agent 处理中…`);
        } else if (e?.type === 'llm_request_start') {
          setSummary('分析问题并制定检索计划…');
          const llmNode = newProcNode({
            type: 'llm',
            title: 'LLM：分析/决策',
            status: 'doing',
          });
          (proc.currentRound || proc.currentAgent || proc.root).children.push(llmNode);
          proc.currentLLMCall = llmNode;
        } else if (e?.type === 'llm_tool_calls') {
          pendingToolCalls = e.count || 0;
          setSummary(`决定调用工具（${pendingToolCalls}）…`);
          const planNode = newProcNode({
            type: 'plan',
            title: `决定调用工具：${pendingToolCalls} 个`,
            status: 'done',
          });
          (proc.currentRound || proc.currentAgent || proc.root).children.push(planNode);
        } else if (e?.type === 'llm_request_end') {
          if (proc.currentLLMCall) {
            proc.currentLLMCall.status = 'done';
            if (typeof e.ms === 'number') proc.currentLLMCall.meta = `耗时 ${e.ms}ms`;
            proc.currentLLMCall = null;
          }
          if (!pendingToolCalls) setSummary('模型已返回，等待下一步…');
        } else if (e?.type === 'orchestrator_fallback') {
          setSummary('遇到异常，切换到 Search Agent 重试…');
          if (proc.currentAgent) proc.currentAgent.status = 'error';
        } else if (e?.type === 'llm_round_start') {
          const roundNode = newProcNode({
            type: 'round',
            title: `模型推理 Round ${e.round}`,
            status: 'doing',
          });
          (proc.currentAgent || proc.root).children.push(roundNode);
          proc.currentRound = roundNode;
          setSummary(`Round ${e.round}：开始推理…`);
        } else if (e?.type === 'tool_start') {
          const name = e.name;
          const args = e.args || {};
          const q = args.query || args.q;
          const meta = q ? `query=${String(q).slice(0, 60)}` : '';
          const toolNode = newProcNode({
            type: 'tool',
            title: `调用工具：${name || 'unknown'}`,
            status: 'doing',
            meta,
          });
          (proc.currentRound || proc.currentAgent || proc.root).children.push(toolNode);
          if (e.tool_call_id) proc.toolCallNodes[e.tool_call_id] = toolNode;
          setSummary(`正在调用工具：${name || 'unknown'}…`);

          if (name === 'global_search' || name === 'multi_keyword_search') {
            setSummary(`正在全站搜索：${q || args.keywords?.join?.(' ') || '…'}`);
          } else if (String(name || '').startsWith('search_')) {
            setSummary(`正在搜索：${q || '…'}`);
          } else if (name === 'get_site_doc') {
            setSummary(`正在获取本站文档：${args.doc_key || '…'}`);
          } else if (name === 'get_course_score_list') {
            setSummary('正在读取课程评价/评分…');
          } else if (String(name || '').startsWith('batch_')) {
            setSummary(`正在批量获取：${name}…`);
          } else if (String(name || '').includes('_detail')) {
            setSummary('正在读取详情…');
          } else if (String(name || '').includes('_list')) {
            setSummary('正在读取列表…');
          } else {
            setSummary('正在获取数据…');
          }
        } else if (e?.type === 'tool_end') {
          pendingToolCalls = Math.max(0, pendingToolCalls - 1);
          const s = e.summary || null;
          const toolNode = e.tool_call_id ? proc.toolCallNodes[e.tool_call_id] : null;
          if (toolNode) {
            toolNode.status = e.ok ? 'done' : 'error';
            if (s && s.ok) {
              const used = s.used_query ? `used_query=${s.used_query}` : '';
              const n = typeof s.results_len === 'number'
                ? s.results_len
                : (typeof s.count === 'number' ? s.count : null);
              toolNode.meta = [toolNode.meta, n != null ? `results=${n}` : '', used].filter(Boolean).join(' | ');
            }
            const resultNode = newProcNode({
              type: 'tool_result',
              title: '工具结果：已接收',
              status: e.ok ? 'done' : 'error',
              meta: s && s.ok ? (toolNode.meta || '') : '',
            });
            toolNode.children.push(resultNode);
          }
          if (pendingToolCalls === 0) {
            setSummary('正在分析工具结果并生成回答…');
            const synthNode = newProcNode({ type: 'synth', title: '综合分析与生成回答', status: 'doing' });
            (proc.currentRound || proc.currentAgent || proc.root).children.push(synthNode);
          }
        } else if (e?.type === 'llm_final') {
          setSummary('已生成回答');
          if (proc.currentRound) proc.currentRound.status = 'done';
          if (proc.currentAgent) proc.currentAgent.status = 'done';
          proc.root.status = 'done';
        } else if (e?.type === 'orchestrator_done') {
          setSummary('已完成回答');
        }
        scheduleRender();
        if (assistantMsg.generating && proc.expanded) {
          scrollProcessPanelToBottom(assistantMsg.id);
        }
      },
    });
    const raw = result?.final?.content || '(无输出)';
    assistantMsg.content = linkifyInternalRoutes(raw);
  } catch (e) {
    if (e?.name === 'AbortError') {
      assistantMsg.content = '已停止。';
    } else {
      assistantMsg.content = '请求失败：' + (e?.message || 'unknown_error');
      emit('alert', { state: true, color: 'error', title: 'Agent错误', content: assistantMsg.content });
    }
  } finally {
    loading.value = false;
    abortController = null;
    assistantMsg.generating = false;
    if (proc.root.status === 'doing') {
      proc.root.status = assistantMsg.content ? 'done' : 'error';
    }
    if (proc.root.status === 'done') {
      proc.summary = '已完成回答';
    } else if (proc.root.status === 'error' && !proc.summary) {
      proc.summary = '执行失败';
    }
    if (assistantMsg._dbId) await updateMessageContent(assistantMsg._dbId, assistantMsg.content);
    await loadSessions();
    // 执行完成后默认收起过程面板（用户可点击“已完成思考”展开查看）
    proc.expanded = false;
    scheduleRender();
    scrollToBottom();
  }
};

const linkifyInternalRoutes = (text) => {
  const s = String(text || '');
  // Convert bare internal routes into markdown links.
  // 1) "#/path" -> [#/path](#/path)
  // 2) "/course/123" -> [#/course/123](#/course/123) (same for article/post/section/author)
  const linkedHash = s.replace(
    /(^|[\s(])(#\/[a-zA-Z0-9_/-]+)(?=$|[\s),.，。!?！？])/g,
    (m, prefix, route) => (prefix === '(' ? m : `${prefix}[${route}](${route})`)
  );
  return linkedHash.replace(
    /(^|[\s(])((?:\/)(?:article|post|course|section|author)\/[a-zA-Z0-9_/-]+)(?=$|[\s),.，。!?！？])/g,
    (m, prefix, path) => {
      if (prefix === '(') return m;
      const route = `#${path}`;
      return `${prefix}[${route}](${route})`;
    }
  );
};

onMounted(async () => {
  themeColor.value =
    getComputedStyle(document.documentElement).getPropertyValue('--theme-color').trim() ||
    '#9c0c13';
  mdReady.value = true;
  const titleElement = document.getElementById('web-title');
  if (titleElement) {
    titleElement.innerText = 'Agent';
  }
  await loadSessions();
  const last = selfDefineLocalStorage.getItem(LAST_SESSION_KEY);
  if (last) {
    const id = Number(last);
    if (id && sessions.value.some((s) => s.id === id)) await loadSession(id);
  } else if (sessions.value.length) {
    await loadSession(sessions.value[0].id);
  }
  scrollToBottom();
});
</script>

<style scoped>
/* 固定视口高度，避免整页在 router-view-container 里滚动导致左侧栏一起动 */
.agent-layout {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  max-height: 100%;
  overflow: hidden;
  background: #f8f8f8;
}

.agent-layout--mobile {
  height: 100vh;
  height: 100dvh;
}

.agent-sidebar {
  width: 280px;
  min-width: 280px;
  height: 100%;
  background: #ffffff;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
}

.agent-sidebar--mobile {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
  transform: translateX(-100%);
  transition: transform 0.2s ease;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.08);
}

.agent-sidebar--mobile.agent-sidebar--open {
  transform: translateX(0);
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 99;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid #eee;
}

.sidebar-title {
  font-weight: 600;
  font-size: 15px;
}

.sidebar-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.sidebar-list::-webkit-scrollbar,
.message-container::-webkit-scrollbar {
  width: 1px;
  height: 1px;
}

.sidebar-list::-webkit-scrollbar-thumb,
.message-container::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 1px;
}

.sidebar-list,
.message-container {
  scrollbar-width: thin;
}

.sidebar-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 10px 14px;
  cursor: pointer;
  position: relative;
  border-radius: 8px;
  margin: 0 8px;
}

.sidebar-item:hover {
  background: #f5f5f5;
}

.sidebar-item--active {
  background: #f0f0f0;
}

.sidebar-item-title {
  font-size: 14px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  padding-right: 24px;
}

.sidebar-item-time {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.sidebar-item-delete {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
}

.sidebar-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px 8px 14px;
  border-top: 1px solid #eee;
  flex-shrink: 0;
  gap: 4px;
}

.sidebar-footer-hint {
  font-size: 12px;
  color: #999;
  flex: 1;
  min-width: 0;
}

.sidebar-footer-btn {
  flex-shrink: 0;
}

.row-actions {
  display: flex;
  flex-direction: row;
  gap: 10px;
}

.agent-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background: #ffffff;
}

.agent-shell {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  width: 100%;
  padding: 14px;
  box-sizing: border-box;
  overflow: hidden;
}

.agent-top {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  position: sticky;
  top: 0;
  z-index: 10;
  background: #ffffff;
  padding: 10px 0;
  border-bottom: 1px solid #ececec;
}

/* 移动端：由 App 的 special-nav 提供返回/首页，顶部栏更紧凑 */
.agent-top--mobile {
  margin-bottom: 8px;
  padding: 6px 0;
}

.agent-config-alert {
  margin-top: 8px;
}

.message-container {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 4px 2px;
  margin-top: 8px;
  padding-bottom: 140px;
}

/* 移动端：与底部导航、输入栏留出安全距离 */
.message-container--mobile {
  margin-top: 8px;
  padding-bottom: calc(140px + env(safe-area-inset-bottom));
}

.message-row {
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;
}

.row-user {
  justify-content: flex-end;
}

.row-user .message-avatar--user {
  order: 1;
  flex-shrink: 0;
}

.row-user .message-bubble {
  order: 0;
}

.row-assistant {
  justify-content: flex-start;
}

.row-assistant .message-avatar--bot {
  flex-shrink: 0;
}

.message-avatar {
  margin-top: 2px;
}

.message-bubble {
  max-width: 80%;
  padding: 10px 12px;
  border-radius: 14px;
}

.row-assistant .message-bubble {
  background: #ffffff;
  border: 1px solid #eeeeee;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.assistant-content {
  white-space: normal;
}

.process-header {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
  margin: 6px 0 10px;
  padding: 6px 10px;
  border-radius: 999px;
  background: #f6f6f6;
  border: 1px solid #efefef;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.process-header:hover {
  background: #efefef;
  border-color: #e5e5e5;
}

.process-header-chevron {
  transition: transform 0.2s ease;
}

.process-header-text {
  color: #8a8a8a;
}

/* 流程面板展开/收起 */
.process-panel-enter-active,
.process-panel-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
  transform-origin: top;
}

.process-panel-enter-from,
.process-panel-leave-to {
  opacity: 0;
  transform: scaleY(0.95);
}

.process-panel {
  border-left: 2px solid #eeeeee;
  margin: 0 0 12px 2px;
  padding: 6px 0;
  max-height: 300px;
  overflow: auto;
}

.process-summary {
  color: #8a8a8a;
  margin: -6px 0 10px;
  transition: opacity 0.15s ease;
}

.process-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding: 2px 0;
  animation: process-row-in 0.25s ease backwards;
}

@keyframes process-row-in {
  from {
    opacity: 0;
    transform: translateX(-6px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.process-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #cfcfcf;
  flex: 0 0 auto;
  transition: background 0.2s ease;
}

.process-dot-doing {
  background: var(--theme-color);
  animation: process-dot-pulse 1.2s ease-in-out infinite;
}

@keyframes process-dot-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.process-dot-done {
  background: #2e7d32;
}

.process-dot-error {
  background: #c62828;
}

.process-text {
  color: #555555;
}

.process-meta {
  color: #9a9a9a;
  margin-left: 6px;
}

.editor {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: sticky;
  bottom: 0;
  background: #ffffff;
  padding-top: 10px;
  padding-bottom: calc(10px + env(safe-area-inset-bottom));
  box-sizing: border-box;
  border-top: 1px solid #f0f0f0;
}

/* 移动端：底部安全区与紧凑间距（底部导航由 App 的 margin-bottom 已留出） */
.editor--mobile {
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
}

.editor-row {
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: flex-end;
}

.editor-input :deep(textarea) {
  scroll-margin-bottom: 120px;
}

.editor-input {
  flex: 1;
}

.send-btn {
  height: 40px;
  min-width: 78px;
}

.message-bubble :deep(.md-editor-preview) {
  background: transparent !important;
  line-height: 1.55;
  font-size: var(--font-size-medium);
}

.message-bubble :deep(.md-editor-preview-wrapper) {
  padding: 0 !important;
}

.message-bubble :deep(.md-editor) {
  border: none !important;
}

.message-bubble :deep(.md-editor-preview p) {
  margin: 0.35em 0;
}

.message-bubble :deep(.md-editor-preview ul),
.message-bubble :deep(.md-editor-preview ol) {
  margin: 0.35em 0;
  padding-left: 1.2em;
}

.message-bubble :deep(.md-editor-preview li) {
  margin: 0.2em 0;
}

.message-bubble :deep(.md-editor-preview h1),
.message-bubble :deep(.md-editor-preview h2),
.message-bubble :deep(.md-editor-preview h3),
.message-bubble :deep(.md-editor-preview h4) {
  margin: 0.5em 0 0.25em;
  line-height: 1.25;
}

/* PC 端聊天区占满对话列表右侧全部空间，不限制最大宽度 */

@media screen and (max-width: 1000px) {
  .agent-shell {
    width: 100%;
  }
  .message-bubble {
    max-width: 92%;
  }
  .send-btn {
    min-width: 70px;
  }
}
</style>
