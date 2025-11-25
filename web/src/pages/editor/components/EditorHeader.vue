<template>
  <div class="editor-header">
    <v-btn @click="$emit('shift-editor-type')" class="editor-type-btn" variant="tonal">
      {{ editorBtnText }}
    </v-btn>
    <sensitive-text-field
      class="title-input"
      :density="deviceType === 'mobile' ? 'compact' : 'comfortable'"
      variant="outlined"
      label="编辑文章标题"
      rows="1"
      v-model="localTitle"
      :error="localTitle.length > 50"
      :error-messages="localTitle.length > 50 ? '标题长度不能超过50个字符' : ''"
      :counter="50"
      :counter-value="localTitle.length"
      @update:model-value="$emit('update:title', $event)"
    ></sensitive-text-field>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import SensitiveTextField from '@/components/common/SensitiveTextField.vue';

const props = defineProps({
  editorBtnText: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: '',
  },
  deviceType: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['shift-editor-type', 'update:title']);

const localTitle = ref(props.title || '');

watch(
  () => props.title,
  (newVal) => {
    localTitle.value = newVal || '';
  },
  { immediate: true }
);

watch(localTitle, (newVal) => {
  emit('update:title', newVal);
});
</script>

<style scoped>
.editor-header {
  display: flex;
  flex-direction: column;
  height: fit-content;
  gap: 10px;
}

.editor-type-btn {
  width: 100%;
}

.title-input {
  margin-top: 10px;
}

@media screen and (max-width: 1000px) {
  .editor-type-btn {
    height: 30px;
  }
}
</style>


