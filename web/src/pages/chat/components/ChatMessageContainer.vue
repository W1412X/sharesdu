<template>
  <div id="message-container" class="message-container">
    <div class="tip-text-btn">
      <v-btn
        v-if="receiverId"
        variant="text"
        style="max-height: 25px;"
        :loading="loading.loadFrontier"
        :disabled="loading.loadFrontier"
        @click="$emit('load-frontier')"
        class="text-tiny">
        查看更早的消息
      </v-btn>
    </div>
    <chat-message
      v-for="(message) in messages"
      :key="message.id"
      :init-data="message"
      @recall="$emit('recall', $event)"
      @alert="$emit('alert', $event)"
      @set_loading="$emit('set_loading', $event)">
    </chat-message>
  </div>
</template>

<script setup>
import ChatMessage from '@/components/chat/ChatMessage.vue';

defineProps({
  receiverId: {
    type: [String, Number],
    default: null,
  },
  messages: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Object,
    default: () => ({}),
  },
});

defineEmits([
  'load-frontier',
  'recall',
  'alert',
  'set_loading',
]);
</script>

<style scoped>
.tip-text-btn {
  width: 100%;
  justify-content: center;
  display: flex;
  margin-top: 10px;
  color: #8a8a8a;
  text-decoration: underline;
}

.message-container {
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

@media screen and (max-width: 1000px) {
  .message-container {
    width: 100vw;
    display: flex;
    flex: 1;
    flex-direction: column;
    overflow-y: auto;
    overflow-x: hidden;
  }
}
</style>

