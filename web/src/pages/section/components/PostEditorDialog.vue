<template>
  <v-dialog :model-value="ifShow" @update:model-value="$emit('update:if-show', $event)" class="full-screen dialog">
    <div class="dialog-card-container">
      <post-editor
        v-if="ifShow"
        @close="$emit('close')"
        @add_post="$emit('add-post', $event)"
        @set_loading="$emit('set-loading', $event)"
        @alert="$emit('alert', $event)"
        :type-msg="{ type: 'article', id: sectionId }"
      />
    </div>
  </v-dialog>
</template>

<script setup>
import PostEditor from '@/components/post/PostEditor.vue';

defineProps({
  ifShow: {
    type: Boolean,
    required: true,
  },
  sectionId: {
    type: String,
    required: true,
  },
});

defineEmits(['update:if-show', 'close', 'add-post', 'set-loading', 'alert']);
</script>

<style scoped>
.dialog-card-container {
  display: flex;
  justify-content: center;
}
</style>

