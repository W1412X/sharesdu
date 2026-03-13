<template>
  <div class="full-center">
    <div class="agent-shell">
      <div class="agent-top" :class="{ 'agent-top--mobile': isMobile }">
        <v-btn
          v-if="!isMobile"
          icon="mdi-arrow-left"
          variant="text"
          :color="themeColor"
          @click="toHome"
        />
        <div class="page-title-bold">AI问答</div>
        <v-spacer></v-spacer>
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
                  />
                </div>
                <div v-if="m.process && m.process.summary" class="process-summary text-tiny">
                  {{ m.process.summary }}
                </div>
                <div
                  v-if="m.process && m.process.expanded"
                  class="process-panel"
                  :data-process-panel="m.id"
                >
                  <div
                    v-for="row in flattenProcess(m.process.root)"
                    :key="row.id"
                    class="process-row"
                    :style="{ paddingLeft: `${10 + row.depth * 14}px` }"
                  >
                    <div class="process-dot" :class="`process-dot-${row.status}`"></div>
                    <div class="text-tiny process-text">{{ row.title }}</div>
                    <div v-if="row.meta" class="text-tiny process-meta">{{ row.meta }}</div>
                  </div>
                </div>
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
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { openPage } from '@/utils/other';
import { getDeviceType } from '@/utils/device';
import { getAgentLLMConfig, validateAgentLLMConfig } from '@/agent/config';
import { createOrchestrator } from '@/agent/orchestrator';
import { MdPreview } from 'md-editor-v3';
import 'md-editor-v3/lib/preview.css';

defineOptions({ name: 'AgentPage' });

// 移动端与帖子/文章等一致：由 App 的 special-nav 提供返回/首页，页面内不重复展示返回按钮
const isMobile = computed(() => getDeviceType() === 'mobile');

const emit = defineEmits(['alert', 'set_loading']);

const themeColor = ref('#9c0c13');
const mdReady = ref(false);

const messages = ref([
  {
    id: `m_${Date.now()}`,
    role: 'assistant',
    content: '我可以帮你在站内查文章/帖子/回复/课程，并把结果整理成要点。\n\n- 先在 **Self → 设置** 配置模型参数与 API Key\n- 然后在这里提问（仅信息获取，不做发布/修改）',
  },
]);

const input = ref('');
const loading = ref(false);
let abortController = null;

const cfg = computed(() => getAgentLLMConfig());
const configOk = computed(() => validateAgentLLMConfig(cfg.value).ok);

const orchestrator = createOrchestrator();

const getScrollContainer = () => {
  const el = document.getElementById('router-view-container');
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

const toHome = () => {
  openPage('router', { name: 'IndexPage' });
};

const toSelfSetting = () => {
  openPage('router', { name: 'SelfPage' });
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

  const userMsg = { id: `u_${Date.now()}`, role: 'user', content: text };
  messages.value.push(userMsg);

  const history = messages.value
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content }));

  const assistantMsg = reactive({
    id: `a_${Date.now()}`,
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

onMounted(() => {
  themeColor.value =
    getComputedStyle(document.documentElement).getPropertyValue('--theme-color').trim() ||
    '#9c0c13';
  mdReady.value = true;
  const titleElement = document.getElementById('web-title');
  if (titleElement) {
    titleElement.innerText = 'Agent';
  }
  scrollToBottom();
});
</script>

<style scoped>
.full-center {
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: stretch;
  /* cover scroll container; avoid showing parent's white background on short content / overscroll */
  min-height: 100vh;
  min-height: 100dvh;
  background: #ffffff;
}

.agent-shell {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: 14px;
  box-sizing: border-box;
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
  overflow: visible;
  padding: 4px 2px;
  margin-top: 50px;
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
  margin-bottom: 10px;
}

.row-user {
  justify-content: flex-end;
}

.row-assistant {
  justify-content: flex-start;
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
}

.process-header-text {
  color: #8a8a8a;
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
}

.process-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding: 2px 0;
}

.process-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #cfcfcf;
  flex: 0 0 auto;
}

.process-dot-doing {
  background: var(--theme-color);
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

@media screen and (min-width: 1000px) {
  .agent-shell {
    width: 900px;
  }
}

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
