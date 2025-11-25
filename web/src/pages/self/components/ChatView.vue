<template>
  <div>
    <part-loading-view :state="!loadState.message" :text="'正在加载聊天列表...'"></part-loading-view>
    <div v-if="loadState.message">
      <template v-if="chatList.length > 0">
        <chat-item
          v-for="(item, index) in chatList"
          :init-data="item"
          :key="index"
          style="margin: 5px;"
          @alert="handleAlert"
        ></chat-item>
      </template>
      <nothing-view
        v-else-if="chatList.length == 0 && !loadState.message"
        icon="mdi-chat-outline"
        text="暂无私聊"
        :icon-size="80"
        text-size="18px"
        min-height="300px"
      ></nothing-view>
    </div>
  </div>
</template>

<script setup>
import ChatItem from '@/components/chat/ChatItem.vue';
import PartLoadingView from '@/components/common/PartLoadingView.vue';
import NothingView from '@/components/common/NothingView.vue';

// Props
defineProps({
  chatList: {
    type: Array,
    default: () => [],
  },
  loadState: {
    type: Object,
    default: () => ({
      message: false,
    }),
  },
});

// Emits
const emit = defineEmits(['alert']);

// 处理方法
const handleAlert = (msg) => {
  emit('alert', msg);
};
</script>

