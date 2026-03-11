<template>
  <div class="column-list">
    <v-btn
      @click="showAgentConfigDialog = true"
      prepend-icon="mdi-robot-outline"
      color="grey"
      variant="outlined"
      text="Agent对话"
    ></v-btn>
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
            v-model="cfg.baseUrl"
            label="Base URL（OpenAI兼容）"
            density="compact"
            variant="outlined"
            placeholder="https://api.openai.com/v1"
          />
          <v-text-field
            v-model="cfg.model"
            label="Model"
            density="compact"
            variant="outlined"
            placeholder="gpt-4o-mini"
          />
          <v-text-field
            v-model="cfg.apiKey"
            :type="showApiKey ? 'text' : 'password'"
            label="API Key"
            density="compact"
            variant="outlined"
            placeholder="sk-..."
            :append-inner-icon="showApiKey ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showApiKey = !showApiKey"
          />
          <div class="text-small mt-1 mb-1" style="color: #6b6b6b;">Temperature: {{ cfg.temperature }}</div>
          <v-slider
            v-model="cfg.temperature"
            :min="0"
            :max="1"
            :step="0.05"
            density="compact"
            color="var(--theme-color)"
          />
          <v-text-field
            v-model.number="cfg.maxTokens"
            label="Max Tokens"
            density="compact"
            variant="outlined"
            type="number"
            :min="64"
            :max="4096"
          />
          <v-text-field
            v-model.number="cfg.maxRounds"
            label="Max Rounds（工具调用最大轮数）"
            density="compact"
            variant="outlined"
            type="number"
            :min="1"
            :max="32"
            hint="单次对话中 LLM 可进行工具调用的最大轮数"
            persistent-hint
          />
          <div class="row-actions mt-3">
            <v-btn color="var(--theme-color)" variant="flat" @click="saveCfg">保存</v-btn>
            <v-btn color="grey" variant="outlined" @click="resetCfg">重置为默认</v-btn>
            <v-btn color="grey" variant="tonal" @click="goToAgentAndClose">前往对话</v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-btn
      @click="handleToUrl('/#/document/to_know')"
      prepend-icon="mdi-bulletin-board"
      color="grey"
      variant="outlined"
      text="入站须知"
    ></v-btn>
    <v-btn
      @click="handleToUrl('/#/document/privacy')"
      prepend-icon="mdi-lock-outline"
      color="grey"
      variant="outlined"
      text="隐私政策"
    ></v-btn>
    <v-btn
      @click="handleToUrl('/#/document/about_us')"
      prepend-icon="mdi-information-variant"
      color="grey"
      variant="outlined"
      text="关于我们"
    ></v-btn>
    <v-btn
      @click="handleToUrl('/#/developer')"
      prepend-icon="mdi-code-braces"
      color="grey"
      variant="outlined"
      text="开发者文档"
    ></v-btn>
    <v-btn
      :loading="loading.loadBlock"
      :disabled="loading.loadBlock"
      @click="handleShowBlockList"
      prepend-icon="mdi-account-cancel"
      color="grey"
      variant="outlined"
      text="黑名单"
    ></v-btn>
    <v-btn
      @click="handleToUrl('/#/welcome')"
      prepend-icon="mdi-application-outline"
      color="grey"
      variant="outlined"
      text="下载APP"
    ></v-btn>
    <v-btn
      @click="handleShowColorSelector"
      prepend-icon="mdi-account-box"
      color="grey"
      variant="outlined"
      text="个性化主题"
    ></v-btn>
    <v-btn
      @click="handleToggleDarkMode"
      :prepend-icon="darkModeEnabled ? 'mdi-weather-night' : 'mdi-weather-sunny'"
      color="grey"
      variant="outlined"
      :text="darkModeEnabled ? '黑夜模式' : '白天模式'"
    ></v-btn>

    <v-divider class="my-4"></v-divider>

    <v-snackbar v-model="snack.show" :color="snack.color" timeout="2000">
      {{ snack.text }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { toggleDarkMode, isDarkModeEnabled } from '@/utils/darkMode';
import { getAgentLLMConfig, getDefaultAgentLLMConfig, setAgentLLMConfig, clearAgentLLMConfig } from '@/agent/config';

// Props
defineProps({
  loading: {
    type: Object,
    default: () => ({
      loadBlock: false,
    }),
  },
});

// Emits
const emit = defineEmits(['to-url', 'show-block-list', 'show-color-selector']);

// 暗色模式状态
const darkModeEnabled = ref(false);
const showApiKey = ref(false);

const cfg = ref(getAgentLLMConfig());
const snack = ref({ show: false, text: '', color: 'success' });
const showAgentConfigDialog = ref(false);

// 初始化暗色模式状态
onMounted(() => {
  darkModeEnabled.value = isDarkModeEnabled();
});

// 处理方法
const handleToUrl = (url) => {
  emit('to-url', url);
};

const handleShowBlockList = () => {
  emit('show-block-list');
};

const handleShowColorSelector = () => {
  emit('show-color-selector');
};

const handleToggleDarkMode = () => {
  darkModeEnabled.value = toggleDarkMode();
};

const saveCfg = () => {
  setAgentLLMConfig(cfg.value);
  snack.value = { show: true, text: '已保存 Agent 配置', color: 'success' };
};

const resetCfg = () => {
  clearAgentLLMConfig();
  cfg.value = getDefaultAgentLLMConfig();
  snack.value = { show: true, text: '已重置为默认配置', color: 'info' };
};

const onAgentConfigDialogOpen = () => {
  cfg.value = getAgentLLMConfig();
};

const goToAgentAndClose = () => {
  showAgentConfigDialog.value = false;
  emit('to-url', '/#/agent');
};
</script>

<style scoped>
@media screen and (min-width: 1000px) {
  .column-list {
    width: 750px;
    display: flex;
    flex-direction: column;
  }
}

@media screen and (max-width: 1000px) {
  .column-list {
    width: 100%;
    display: flex;
    flex-direction: column;
  }
}

.row-actions {
  display: flex;
  flex-direction: row;
  gap: 10px;
}
</style>
