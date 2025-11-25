<template>
  <v-select
    v-model="localSearchType"
    label="搜索类型"
    density="compact"
    variant="outlined"
    style="max-width: 100px; min-width: 100px;"
    :items="['全部', '文章', '帖子', '微服务', '课程', '回复']"
    :hide-details="true"
  />
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['update:modelValue']);

const localSearchType = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});
</script>
