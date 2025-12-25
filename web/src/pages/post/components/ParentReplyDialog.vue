<template>
  <div v-if="ifShow" class="dialog-layer">
    <div class="parent-reply-wrapper">
      <div class="parent-reply-header">
        <v-btn
          @click="$emit('close')"
          :color="themeColor"
          size="25"
          class="close-btn"
        >
          <v-icon type="mdi" icon="mdi-close" :color="'white'"></v-icon>
          <v-tooltip activator="parent">关闭</v-tooltip>
        </v-btn>
        <v-spacer></v-spacer>
      </div>
      <reply-item
        v-if="parentReply"
        :post-id="postId"
        :init-data="parentReply"
        @show_parent="$emit('show-parent', $event)"
        @reply="$emit('reply', $event)"
        @alert="$emit('alert', $event)"
        @set_loading="$emit('set-loading', $event)"
      ></reply-item>
    </div>
  </div>
</template>

<script setup>
import ReplyItem from '@/components/post/ReplyItem.vue';

defineProps({
  ifShow: {
    type: Boolean,
    required: true,
  },
  parentReply: {
    type: Object,
    default: null,
  },
  postId: {
    type: String,
    required: true,
  },
  themeColor: {
    type: String,
    required: true,
  },
});

defineEmits(['close', 'show-parent', 'reply', 'alert', 'set-loading']);
</script>

<style scoped>
.dialog-layer {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.parent-reply-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.parent-reply-header {
  display: flex;
  background-color: auto;
  flex-direction: row-reverse;
}

.close-btn {
  color: #8a8a8a;
}

@media screen and (max-width: 1000px) {
  .parent-reply-wrapper {
    max-width: 90vw;
  }
}
</style>


