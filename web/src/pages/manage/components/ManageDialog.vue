<template>
  <v-dialog :model-value="ifShowDialog" @update:model-value="$emit('update:ifShowDialog', $event)" class="dialog">
    <div class="dialog-card-container">
      <div v-if="ifShowWebCard" style="display: flex; flex-direction: column; justify-content: center;">
        <web-card :url="nowShowUrl"></web-card>
        <div style="display: flex; flex-direction: row;">
          <v-spacer></v-spacer>
          <v-btn :color="themeColor" @click="$emit('confirm')" text="确认操作" />
          <v-spacer></v-spacer>
          <v-btn :color="themeColor" @click="$emit('cancel')" text="取消操作" />
          <v-spacer></v-spacer>
        </div>
      </div>
      <course-history-card
        v-if="ifShowCourseHistory"
        :id="itemId"
        :type="'admin'"
        @close="$emit('close-course-history')"
        @set_loading="$emit('set-loading', $event)"
        @alert="$emit('alert', $event)">
      </course-history-card>
    </div>
  </v-dialog>
</template>

<script setup>
import WebCard from '@/components/manage/WebCard.vue';
import CourseHistoryCard from '@/components/course/CourseHistoryCard.vue';

defineProps({
  ifShowDialog: {
    type: Boolean,
    required: true,
  },
  ifShowWebCard: {
    type: Boolean,
    required: true,
  },
  ifShowCourseHistory: {
    type: Boolean,
    required: true,
  },
  nowShowUrl: {
    type: String,
    default: null,
  },
  itemId: {
    type: String,
    default: null,
  },
  themeColor: {
    type: String,
    required: true,
  },
});

defineEmits(['confirm', 'cancel', 'close-course-history', 'set-loading', 'alert', 'update:ifShowDialog']);
</script>

<style scoped>
.dialog-card-container {
  display: flex;
  justify-content: center;
}
</style>

