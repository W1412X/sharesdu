<template>
  <div>
    <div style="width: 100%;display: flex;flex-direction: row;">
      <v-spacer></v-spacer>
      <v-btn
        :loading="loading.clearNotification"
        :disabled="loading.clearNotification"
        @click="handleClearNotification"
        prepend-icon="mdi-delete"
        color="grey"
        class="text-small"
        variant="text"
        text="清空此页通知"
      ></v-btn>
    </div>
    <template v-if="notificationList.length > 0">
      <notification-item
        v-for="(item, index) in notificationList"
        :key="index"
        :init-data="item"
        @alert="handleAlert"
        @set_loading="handleSetLoading"
      ></notification-item>
      <v-btn
        :loading="loading.loadNotification"
        :disabled="loading.loadNotification"
        @click="handleLoadMore"
        variant="tonal"
        rounded
        width="100%"
      >
        加载更多
      </v-btn>
    </template>
    <nothing-view
      v-else
      icon="mdi-bell-outline"
      text="暂无通知"
      :icon-size="80"
      text-size="18px"
      min-height="300px"
    ></nothing-view>
  </div>
</template>

<script setup>
import NotificationItem from '@/components/user/NotificationItem.vue';
import NothingView from '@/components/common/NothingView.vue';

// Props
defineProps({
  notificationList: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Object,
    default: () => ({
      loadNotification: false,
      clearNotification: false,
    }),
  },
});

// Emits
const emit = defineEmits(['alert', 'set-loading', 'clear-notification', 'load-more']);

// 处理方法
const handleAlert = (msg) => {
  emit('alert', msg);
};

const handleSetLoading = (msg) => {
  emit('set-loading', msg);
};

const handleClearNotification = () => {
  emit('clear-notification');
};

const handleLoadMore = () => {
  emit('load-more');
};
</script>

