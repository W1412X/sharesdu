<template>
  <v-dialog
    v-model="visible"
    :max-width="isMobile ? undefined : 600"
    :fullscreen="isMobile"
    persistent
    scrollable
    content-class="agent-config-dialog"
    @after-enter="onOpened"
  >
    <v-card class="agent-config-card" :class="{ 'agent-config-card--mobile': isMobile }">
      <!-- 顶部标题栏（固定） -->
      <div class="config-header">
        <v-icon icon="mdi-robot-outline" :color="'var(--theme-color)'" class="mr-2" />
        <span class="config-header-title">{{ title }}</span>
        <v-spacer />
        <v-btn aria-label="关闭 Agent 设置" icon="mdi-close" variant="text" size="small" @click="close" />
      </div>

      <!-- 可滚动内容区 -->
      <div class="config-body">
        <p class="config-desc">{{ description }}</p>

        <!-- 保存方式 -->
        <section class="config-section">
          <div class="section-label">API Key 保存方式</div>
          <v-radio-group
            v-model="draft.storageMode"
            inline
            hide-details
            density="compact"
            color="var(--theme-color)"
          >
            <v-radio label="仅本次会话" value="session" />
            <v-radio label="浏览器持久保存" value="local" />
          </v-radio-group>
          <v-alert
            type="warning"
            variant="tonal"
            density="compact"
            class="config-warn"
          >
            你填写的自定义 Base URL 都会收到此 API Key，请只使用可信服务地址。
          </v-alert>
        </section>

        <!-- 连接配置 -->
        <section class="config-section">
          <div class="section-label">连接配置</div>
          <v-text-field
            v-model="draft.baseUrl"
            label="Base URL（OpenAI 兼容）"
            density="compact"
            variant="outlined"
            placeholder="https://api.openai.com/v1"
            hide-details="auto"
            class="mb-3"
          />
          <div class="model-field">
            <v-combobox
              v-model="draft.model"
              :items="modelOptions"
              label="Model"
              density="compact"
              variant="outlined"
              placeholder="gpt-4o"
              hide-details="auto"
              clearable
              :loading="modelsLoading"
              class="model-field-input"
            />
            <v-btn
              :loading="modelsLoading"
              :disabled="!canLoadModels"
              variant="tonal"
              color="var(--theme-color)"
              size="small"
              class="model-refresh-btn"
              aria-label="刷新可选模型列表"
              @click="loadModels()"
            >
              <v-icon icon="mdi-refresh" />
              <v-tooltip activator="parent" location="top">刷新模型列表</v-tooltip>
            </v-btn>
          </div>
          <div class="model-hint" :class="modelsError ? 'model-hint--error' : ''">
            <template v-if="modelsLoading">正在获取模型列表…</template>
            <template v-else-if="modelsError">{{ modelsError }}</template>
            <template v-else-if="modelOptions.length">
              已加载 {{ modelOptions.length }} 个模型，可下拉选择或直接输入
            </template>
            <template v-else>点击右侧按钮加载模型列表，或直接输入模型名称</template>
          </div>
          <v-text-field
            v-model="draft.apiKey"
            :type="showApiKey ? 'text' : 'password'"
            label="API Key"
            density="compact"
            variant="outlined"
            placeholder="sk-..."
            hide-details="auto"
            class="mt-3"
            :append-inner-icon="showApiKey ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showApiKey = !showApiKey"
          />
        </section>

        <!-- 生成与检索 -->
        <section class="config-section">
          <div class="section-label">生成与检索</div>
          <div class="slider-row">
            <span class="slider-label">Temperature</span>
            <v-slider
              v-model="draft.temperature"
              :min="0"
              :max="1"
              :step="0.05"
              density="compact"
              hide-details
              color="var(--theme-color)"
              class="slider-input"
            />
            <span class="slider-value">{{ Number(draft.temperature).toFixed(2) }}</span>
          </div>
          <div class="field-grid">
            <v-text-field
              v-model.number="draft.maxRounds"
              label="工具调用最大轮数"
              density="compact"
              variant="outlined"
              type="number"
              :min="1"
              :max="AGENT_LLM_LIMITS.maxRounds"
              hint="单次对话中可进行工具调用的最大轮数"
              persistent-hint
            />
            <v-text-field
              v-model.number="draft.contextTurns"
              label="上下文记忆轮数"
              density="compact"
              variant="outlined"
              type="number"
              :min="0"
              :max="AGENT_LLM_LIMITS.contextTurns"
              hint="携带最近 n 轮对话；0 表示不携带历史"
              persistent-hint
            />
          </div>
        </section>

        <!-- 连接测试 -->
        <section class="config-section">
          <div class="connection-row">
            <v-btn
              :loading="testing"
              :disabled="testing"
              variant="outlined"
              color="var(--theme-color)"
              prepend-icon="mdi-connection"
              @click="testConnection"
            >
              测试连接与工具调用
            </v-btn>
            <span
              v-if="testMessage"
              class="text-small connection-msg"
              :class="testOk ? 'test-ok' : 'test-error'"
            >{{ testMessage }}</span>
          </div>
        </section>

        <!-- 高级配置 -->
        <v-expansion-panels v-model="advancedOpen" class="agent-config-advanced" variant="accordion">
          <v-expansion-panel>
            <v-expansion-panel-title>
              <div class="d-flex flex-column">
                <span>高级配置</span>
                <span class="text-caption advanced-caption">低频参数、预算与记忆策略</span>
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div class="field-grid">
                <v-text-field
                  v-model.number="draft.maxTokens"
                  label="Max Tokens"
                  density="compact"
                  variant="outlined"
                  type="number"
                  :min="64"
                  :max="AGENT_LLM_LIMITS.maxTokens"
                  hint="更长回答或更复杂的工具调用"
                  persistent-hint
                />
                <v-text-field
                  v-model.number="draft.maxToolCalls"
                  label="单轮工具调用总数上限"
                  density="compact"
                  variant="outlined"
                  type="number"
                  :min="1"
                  :max="AGENT_LLM_LIMITS.maxToolCalls"
                />
                <v-text-field
                  v-model.number="draft.maxTotalTokens"
                  label="总 Token 预算"
                  density="compact"
                  variant="outlined"
                  type="number"
                  :min="512"
                  :max="AGENT_LLM_LIMITS.maxTotalTokens"
                />
                <v-text-field
                  v-model.number="draft.maxTotalMs"
                  label="最大总耗时（毫秒）"
                  density="compact"
                  variant="outlined"
                  type="number"
                  :min="10000"
                  :max="AGENT_LLM_LIMITS.maxTotalMs"
                />
                <v-text-field
                  v-model.number="draft.maxToolResultBytes"
                  label="工具结果回灌字节上限"
                  density="compact"
                  variant="outlined"
                  type="number"
                  :min="4096"
                  :max="AGENT_LLM_LIMITS.maxToolResultBytes"
                />
                <v-text-field
                  v-model.number="draft.toolTimeoutMs"
                  label="单个工具超时（毫秒）"
                  density="compact"
                  variant="outlined"
                  type="number"
                  :min="1000"
                  :max="AGENT_LLM_LIMITS.toolTimeoutMs"
                />
                <v-text-field
                  v-model.number="draft.toolConcurrency"
                  label="工具并发数"
                  density="compact"
                  variant="outlined"
                  type="number"
                  :min="1"
                  :max="AGENT_LLM_LIMITS.toolConcurrency"
                />
                <v-text-field
                  v-model.number="draft.memoryNotesLimit"
                  label="记忆备注保留数"
                  density="compact"
                  variant="outlined"
                  type="number"
                  :min="0"
                  :max="AGENT_LLM_LIMITS.memoryNotesLimit"
                  hint="过多会影响提示词长度"
                  persistent-hint
                />
                <v-text-field
                  v-model.number="draft.memoryEntityLimit"
                  label="已确认实体上限"
                  density="compact"
                  variant="outlined"
                  type="number"
                  :min="0"
                  :max="AGENT_LLM_LIMITS.memoryEntityLimit"
                  hint="结构化记忆保留的已确认实体数"
                  persistent-hint
                />
              </div>
              <v-switch
                v-model="draft.structuredMemory"
                label="启用结构化记忆"
                density="compact"
                inset
                hide-details
                color="var(--theme-color)"
                class="mt-1"
              />
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>

      <!-- 底部操作栏（固定） -->
      <div class="config-footer">
        <v-btn
          v-if="showGoToAgent"
          color="grey"
          variant="text"
          @click="handleGoToAgent"
        >
          {{ goToAgentText }}
        </v-btn>
        <v-spacer />
        <v-btn color="grey" variant="text" @click="handleReset">{{ resetText }}</v-btn>
        <v-btn color="var(--theme-color)" variant="flat" @click="handleSave">{{ saveText }}</v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { useDevice } from '@/app/composables';
import { AGENT_LLM_LIMITS, getDefaultAgentLLMConfig, normalizeAgentLLMConfig, validateAgentLLMConfig } from '@/agent/config';
import { createOpenAICompatibleClient } from '@/agent/llm/openaiCompatible';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  config: {
    type: Object,
    default: () => getDefaultAgentLLMConfig(),
  },
  title: {
    type: String,
    default: 'Agent 模型配置（本地存储）',
  },
  description: {
    type: String,
    default: '网站不提供 Key；请自行填写。配置仅保存在浏览器本地（LocalStorage）。',
  },
  saveText: {
    type: String,
    default: '保存',
  },
  resetText: {
    type: String,
    default: '重置为默认',
  },
  showGoToAgent: {
    type: Boolean,
    default: false,
  },
  goToAgentText: {
    type: String,
    default: '前往对话',
  },
});

const emit = defineEmits(['update:modelValue', 'save', 'reset', 'go-to-agent']);

const { ifMobile: isMobile } = useDevice();

const visible = computed({
  get: () => props.modelValue,
  set: (next) => emit('update:modelValue', !!next),
});
const showApiKey = ref(false);
const advancedOpen = ref([]);
const testing = ref(false);
const testMessage = ref('');
const testOk = ref(false);
const modelOptions = ref([]);
const modelsLoading = ref(false);
const modelsError = ref('');
const draft = reactive({ ...getDefaultAgentLLMConfig() });

// 需要 Base URL 与 API Key 才能拉取模型列表
const canLoadModels = computed(() => !!draft.baseUrl && !!draft.apiKey && !modelsLoading.value);

const syncDraft = () => {
  const next = normalizeAgentLLMConfig(props.config || {});
  Object.assign(draft, next);
};

/**
 * 拉取可选模型列表。auto=true 表示自动触发（打开弹窗时），
 * 条件不满足时静默返回，不打扰用户；手动点击刷新时给出明确提示。
 */
const loadModels = async ({ auto = false } = {}) => {
  if (modelsLoading.value) return;
  if (!draft.baseUrl || !draft.apiKey) {
    if (!auto) modelsError.value = '请先填写 Base URL 与 API Key';
    return;
  }
  modelsLoading.value = true;
  modelsError.value = '';
  try {
    const client = createOpenAICompatibleClient(normalizeAgentLLMConfig(draft));
    const models = await client.listModels();
    modelOptions.value = models.map((item) => item?.id).filter(Boolean);
    if (!modelOptions.value.length) {
      modelsError.value = '未返回任何模型，可直接输入模型名称';
    }
  } catch (error) {
    modelsError.value = `模型列表加载失败：${error?.message || 'unknown_error'}`;
  } finally {
    modelsLoading.value = false;
  }
};

const onOpened = () => {
  syncDraft();
  // 打开时若已具备凭据则自动加载一次，避免下拉为空
  if (!modelOptions.value.length && draft.baseUrl && draft.apiKey) {
    loadModels({ auto: true });
  }
};

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      syncDraft();
      advancedOpen.value = [];
      testMessage.value = '';
    } else {
      showApiKey.value = false;
      modelsError.value = '';
    }
  },
  { immediate: true }
);

watch(
  () => props.config,
  () => {
    if (props.modelValue) syncDraft();
  },
  { deep: true }
);

const close = () => {
  visible.value = false;
};

const handleSave = () => {
  const next = normalizeAgentLLMConfig(draft);
  emit('save', next);
};

const handleReset = () => {
  emit('reset');
};

const testConnection = async () => {
  const config = normalizeAgentLLMConfig(draft);
  const validation = validateAgentLLMConfig(config);
  if (!validation.ok) {
    testOk.value = false;
    testMessage.value = '请先填写 Base URL、Model 和 API Key';
    return;
  }
  testing.value = true;
  testMessage.value = '';
  try {
    const client = createOpenAICompatibleClient(config);
    const models = await client.listModels();
    modelOptions.value = models.map((item) => item?.id).filter(Boolean);
    const response = await client.createChatCompletion({
      model: config.model,
      messages: [{ role: 'user', content: '请调用 sharesdu_connection_probe 工具，不要直接回答。' }],
      tools: [{
        type: 'function',
        function: {
          name: 'sharesdu_connection_probe',
          description: '连接测试工具',
          parameters: { type: 'object', properties: {}, additionalProperties: false },
        },
      }],
      tool_choice: 'auto',
      temperature: 0,
      max_tokens: 64,
    });
    const supportsTools = Boolean(response?.choices?.[0]?.message?.tool_calls?.length);
    testOk.value = supportsTools;
    testMessage.value = supportsTools
      ? `连接正常，支持工具调用；发现 ${modelOptions.value.length} 个模型`
      : `连接正常，但当前模型未返回工具调用；发现 ${modelOptions.value.length} 个模型`;
  } catch (error) {
    testOk.value = false;
    testMessage.value = `测试失败：${error?.message || 'unknown_error'}`;
  } finally {
    testing.value = false;
  }
};

const handleGoToAgent = () => {
  emit('go-to-agent');
  close();
};

// 暴露供模板 refresh 按钮点击（保持与模板解耦，直接绑定）
defineExpose({ loadModels });
</script>

<style scoped>
.agent-config-card {
  display: flex;
  flex-direction: column;
  max-height: 88vh;
  border-radius: 12px;
  overflow: hidden;
}

.agent-config-card--mobile {
  max-height: 100%;
  height: 100%;
  border-radius: 0;
}

/* 固定头部 */
.config-header {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.config-header-title {
  font-size: 16px;
  font-weight: 600;
}

/* 可滚动主体 */
.config-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px;
}

.config-desc {
  font-size: 13px;
  color: #6b6b6b;
  margin: 0 0 12px;
  line-height: 1.5;
}

.config-section {
  margin-bottom: 18px;
}

.section-label {
  font-size: 13px;
  font-weight: 600;
  color: #444;
  margin-bottom: 10px;
  padding-left: 8px;
  border-left: 3px solid var(--theme-color);
  line-height: 1.2;
}

.config-warn {
  margin-top: 8px;
  font-size: 12px;
}

/* 模型选择 + 刷新按钮 */
.model-field {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.model-field-input {
  flex: 1;
  min-width: 0;
}

.model-refresh-btn {
  flex-shrink: 0;
  margin-top: 2px;
}

.model-hint {
  font-size: 12px;
  color: #8a8a8a;
  margin-top: 4px;
  padding-left: 2px;
  min-height: 16px;
  line-height: 1.4;
}

.model-hint--error {
  color: var(--color-error);
}

/* Temperature 滑块行 */
.slider-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.slider-label {
  font-size: 13px;
  color: #555;
  flex-shrink: 0;
  width: 96px;
}

.slider-input {
  flex: 1;
}

.slider-value {
  font-size: 13px;
  color: #333;
  font-variant-numeric: tabular-nums;
  width: 40px;
  text-align: right;
  flex-shrink: 0;
}

/* 数字字段两列网格 */
.field-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 14px;
}

.connection-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.connection-msg {
  line-height: 1.4;
}

.agent-config-advanced {
  margin-top: 4px;
}

.advanced-caption {
  color: #8a8a8a;
}

/* 固定底部操作栏 */
.config-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #eee;
  flex-shrink: 0;
  background: #ffffff;
}

.test-ok { color: var(--color-success); }
.test-error { color: var(--color-error); }

/* 移动端：单列布局，滑块标签换行更紧凑 */
@media screen and (max-width: 1000px) {
  .field-grid {
    grid-template-columns: 1fr;
  }
  .slider-label {
    width: auto;
  }
}
</style>
