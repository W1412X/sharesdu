<template>
  <v-dialog
    v-model="visible"
    max-width="500"
    persistent
    content-class="agent-config-dialog"
    @after-enter="syncDraft"
  >
    <v-card class="pa-4">
      <v-card-title class="d-flex align-center">
        <v-icon icon="mdi-robot-outline" class="mr-2" />
        {{ title }}
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" size="small" @click="close" />
      </v-card-title>
      <v-card-text>
        <div class="text-small mb-3" style="color: #6b6b6b;">
          {{ description }}
        </div>
        <v-text-field
          v-model="draft.baseUrl"
          label="Base URL（OpenAI兼容）"
          density="compact"
          variant="outlined"
          placeholder="https://api.openai.com/v1"
        />
        <v-text-field
          v-model="draft.model"
          label="Model"
          density="compact"
          variant="outlined"
          placeholder="gpt-4o-mini"
        />
        <v-text-field
          v-model="draft.apiKey"
          :type="showApiKey ? 'text' : 'password'"
          label="API Key"
          density="compact"
          variant="outlined"
          placeholder="sk-..."
          :append-inner-icon="showApiKey ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append-inner="showApiKey = !showApiKey"
        />
        <div class="text-small mt-1 mb-1" style="color: #6b6b6b;">Temperature: {{ draft.temperature }}</div>
        <v-slider
          v-model="draft.temperature"
          :min="0"
          :max="1"
          :step="0.05"
          density="compact"
          color="var(--theme-color)"
        />
        <v-text-field
          v-model.number="draft.maxTokens"
          label="Max Tokens"
          density="compact"
          variant="outlined"
          type="number"
          :min="64"
          :max="8192"
        />
        <v-text-field
          v-model.number="draft.maxRounds"
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
          v-model.number="draft.contextTurns"
          label="上下文记忆轮数"
          density="compact"
          variant="outlined"
          type="number"
          :min="0"
          :max="20"
          hint="请求时携带最近 n 轮（用户+助手）对话；0 表示不携带历史"
          persistent-hint
        />
        <v-switch
          v-model="draft.structuredMemory"
          label="启用结构化记忆"
          density="compact"
          inset
          color="var(--theme-color)"
        />
        <v-text-field
          v-model.number="draft.memoryNotesLimit"
          label="记忆备注保留数"
          density="compact"
          variant="outlined"
          type="number"
          :min="0"
          :max="50"
          hint="会话记忆中保留多少条备注，过多会影响提示词长度"
          persistent-hint
        />
        <v-text-field
          v-model.number="draft.memoryEntityLimit"
          label="已确认实体上限"
          density="compact"
          variant="outlined"
          type="number"
          :min="0"
          :max="50"
          hint="结构化记忆里保留多少个已确认实体"
          persistent-hint
        />
        <div class="row-actions mt-3">
          <v-btn color="var(--theme-color)" variant="flat" @click="handleSave">{{ saveText }}</v-btn>
          <v-btn color="grey" variant="outlined" @click="handleReset">{{ resetText }}</v-btn>
          <v-btn
            v-if="showGoToAgent"
            color="grey"
            variant="tonal"
            @click="handleGoToAgent"
          >
            {{ goToAgentText }}
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { getDefaultAgentLLMConfig, normalizeAgentLLMConfig } from '@/agent/config';

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

const visible = computed({
  get: () => props.modelValue,
  set: (next) => emit('update:modelValue', !!next),
});
const showApiKey = ref(false);
const draft = reactive({ ...getDefaultAgentLLMConfig() });

const syncDraft = () => {
  const next = normalizeAgentLLMConfig(props.config || {});
  Object.assign(draft, next);
};

watch(
  () => props.modelValue,
  (open) => {
    if (open) syncDraft();
    else showApiKey.value = false;
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

const handleGoToAgent = () => {
  emit('go-to-agent');
  close();
};
</script>
