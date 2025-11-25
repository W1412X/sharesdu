<template>
  <v-tabs v-model="itemType" fixed-tabs class="select-bar">
    <v-tab
      class="tab"
      :style="{
        background: 'rgba(255,255,255,1)',
        color: itemType === 'article' ? '#000000' : '#8a8a8a',
      }"
      height="40px"
      value="article"
      text="文章"
    ></v-tab>
    <v-tab
      class="tab"
      :style="{
        background: 'rgba(255,255,255,1)',
        color: itemType === 'post' ? '#000000' : '#8a8a8a',
      }"
      height="40px"
      value="post"
      text="帖子"
    ></v-tab>
    <v-tab
      class="tab"
      :style="{
        background: 'rgba(255,255,255,1)',
        color: itemType === 'reply' ? '#000000' : '#8a8a8a',
      }"
      height="40px"
      value="reply"
      text="回复"
    ></v-tab>
  </v-tabs>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: 'article',
  },
});

const emit = defineEmits(['update:modelValue']);

const itemType = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});
</script>

<style scoped>
.select-bar {
  margin-bottom: 10px;
}
</style>

