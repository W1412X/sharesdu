<!-- 移动端 Markdown 下载确认弹窗（在 App 内下载可能无效，提示用户） -->
<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    style="width: 100%; height: 100%; justify-content: center;"
  >
    <div v-if="modelValue" style="width: 100%; height: 100%; justify-content: center; display: flex;">
      <v-card class="download-dialog-card">
        <span class="title-bold">提示</span>
        <span class="text-small">在 App 中下载若无法生效，可先复制 Markdown，或在浏览器中打开本页后下载。</span>
        <div class="download-dialog-actions">
          <v-spacer />
          <v-btn density="compact" variant="outlined" @click="$emit('cancel')">取消</v-btn>
          <v-btn
            density="compact"
            variant="outlined"
            color="primary"
            style="margin-left: 10px;"
            @click="$emit('confirm')"
          >继续下载</v-btn>
        </div>
      </v-card>
    </div>
  </v-dialog>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['update:modelValue', 'confirm', 'cancel']);
</script>

<style scoped>
.download-dialog-card {
  padding: 20px;
  display: flex;
  flex-direction: column;
  max-width: 90vw;
}

.download-dialog-actions {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
