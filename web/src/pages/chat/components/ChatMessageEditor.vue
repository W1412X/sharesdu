<template>
  <div v-if="receiverId" class="message-editor row-div">
    <sensitive-text-area
      rows="1"
      variant="outlined"
      density="compact"
      :model-value="editingMessage"
      @update:model-value="$emit('update:editingMessage', $event)">
    </sensitive-text-area>
    <div class="send-btn-container">
      <v-btn
        :loading="loading.send"
        :disabled="loading.send"
        @click="$emit('send')"
        icon="mdi-send"
        size="40"
        variant="text"
        :color="themeColor">
      </v-btn>
    </div>
  </div>
</template>

<script setup>
import SensitiveTextArea from '@/components/common/SensitiveTextArea.vue';

defineProps({
  receiverId: {
    type: [String, Number],
    default: null,
  },
  editingMessage: {
    type: String,
    default: '',
  },
  loading: {
    type: Object,
    default: () => ({}),
  },
  themeColor: {
    type: String,
    required: true,
  },
});

defineEmits([
  'update:editingMessage',
  'send',
]);
</script>

<style scoped>
.message-editor {
  width: 100%;
  display: flex;
  max-height: 50px;
  flex-direction: row;
  padding: 5px;
  bottom: 0px;
  background-color: white;
  border-top: 1px solid #aaaaaa;
}

.send-btn-container {
  height: 100%;
  padding-left: 5px;
  padding-right: 5px;
  align-items: center;
}

.row-div {
  display: flex;
  flex-direction: row;
}

@media screen and (max-width: 1000px) {
  .message-editor {
    width: 100vw;
    padding: 5px;
    display: flex;
    max-height: 50px;
    bottom: 0px;
    flex-direction: row;
    border-top: 1px solid #aaaaaa;
    background-color: white;
  }
}
</style>

