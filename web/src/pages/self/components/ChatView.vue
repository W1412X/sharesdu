<template>
  <div>
    <loading-content-wrapper
      :load-state="loadState.message"
      loading-text="正在加载聊天列表..."
      variant="list"
      :item-count="4"
      min-height="240px"
    >
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
        v-else
        icon="mdi-chat-outline"
        text="暂无私信"
        :icon-size="80"
        text-size="18px"
        min-height="300px"
      ></nothing-view>
    </loading-content-wrapper>
  </div>
</template>

<script setup>
import ChatItem from '@/components/chat/ChatItem.vue';
import NothingView from '@/components/common/NothingView.vue';
import LoadingContentWrapper from '@/components/common/LoadingContentWrapper.vue';

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
