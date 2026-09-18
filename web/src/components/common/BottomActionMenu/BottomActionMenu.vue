<template>
  <v-dialog v-model="ifShowDialog" style="display: flex;flex-direction: row;align-items: center;justify-content: center;width: 100%;height: 100%;">
    <course-editor v-if="ifShowCourseEditor" :initData="{
      id:courseData?.id,
      name:courseData?.name,
      teacher:courseData?.teacher,
      type:courseData?.type,
      campus:courseData?.campus,
      college:courseData?.college,
      credit:courseData?.credit,
      attendMethod:courseData?.attendMethod,
      examineMethod:courseData?.examineMethod,
    }" @close="closeCourseEditor">
    </course-editor>
    <report-card v-if="ifShowReportCard" :type="itemType" :id="itemId" @close="closeReportCard">
    </report-card>
    <delete-confirm-card v-if="ifShowDeleteConfirmCard" :type="itemType" :id="itemId" @close="closeDeleteConfirmCard">
    </delete-confirm-card>
  </v-dialog>
  <v-bottom-sheet v-model="ifShow" class="action-menu">
    <v-sheet class="menu-sheet">
      <div class="menu-header">
        <div class="menu-title text-title-bold">{{ title?title:'更多信息' }}</div>
        <v-btn icon="mdi-close" variant="text" @click="close" size="small"></v-btn>
      </div>
      <div class="menu-options">
        <v-card
          v-for="(option, index) in sheetToShow"
          :key="index"
          class="menu-option-card"
          @click="handleOptionClick(option)"
          variant="text"
        >
          <div class="menu-option-content">
            <v-icon :icon="option.icon" :color="option.danger ? '#e53935' : themeColor" size="24"></v-icon>
            <div class="menu-option-text text-medium" :class="{ 'menu-option-danger-text': option.danger }">{{ option.text }}</div>
          </div>
        </v-card>
      </div>
    </v-sheet>
  </v-bottom-sheet>
  <!-- 移动端 Markdown 下载确认弹窗 -->
  <mobile-download-confirm-dialog
    v-model="ifShowMobileDownloadDialog"
    @confirm="confirmMobileDownload"
    @cancel="cancelMobileDownload"
  />
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { globalProperties } from '@/main';
import CourseEditor from '@/components/course/CourseEditor.vue';
import { moreOptionEventBus } from '@/utils/eventBus';
import { buildMoreOptions } from '@/components/common/MoreOptionsMenu/useMoreOptions';
import { useMoreOptionActions } from '@/components/common/MoreOptionsMenu/useMoreOptionActions';
import MobileDownloadConfirmDialog from '@/components/common/MoreOptionsMenu/MobileDownloadConfirmDialog.vue';
import ReportCard from '@/components/report/ReportCard.vue';
import DeleteConfirmCard from '../DeleteConfirmCard.vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue', 'alert', 'set-loading']);

const typeNow = ref(null);
const postData = ref(null);
const articleData = ref(null);
const courseData = ref(null);
const sectionData = ref(null);

const {
  ifShowReportCard,
  ifShowDeleteConfirmCard,
  ifShowCourseEditor,
  ifShowDialog,
  ifShowMobileDownloadDialog,
  handleOption,
  confirmMobileDownload,
  cancelMobileDownload,
  closeReportCard,
  closeDeleteConfirmCard,
  closeCourseEditor,
} = useMoreOptionActions();

const currentData = computed(() => {
  switch (typeNow.value) {
    case 'post':
      return postData.value;
    case 'article':
      return articleData.value;
    case 'course':
      return courseData.value;
    case 'section':
      return sectionData.value;
    default:
      return null;
  }
});

const sheetToShow = computed(() => buildMoreOptions(typeNow.value, currentData.value));

const itemId = computed(() => currentData.value?.id);
const itemType = computed(() => typeNow.value);

const themeColor = globalProperties.$themeColor;

const ifShow = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const close = () => {
  emit('update:modelValue', false);
};

const handleOptionClick = (option) => {
  handleOption(option, {
    itemType: typeNow.value,
    data: currentData.value,
    emit,
    close,
  });
};

const onPostData = (data) => {
  typeNow.value = 'post';
  postData.value = data;
};
const onArticleData = (data) => {
  typeNow.value = 'article';
  articleData.value = data;
};
const onCourseData = (data) => {
  typeNow.value = 'course';
  courseData.value = data;
};
const onSectionData = (data) => {
  typeNow.value = 'section';
  sectionData.value = data;
};

onMounted(() => {
  moreOptionEventBus.on('post', onPostData);
  moreOptionEventBus.on('article', onArticleData);
  moreOptionEventBus.on('course', onCourseData);
  moreOptionEventBus.on('section', onSectionData);
});

onUnmounted(() => {
  moreOptionEventBus.off('post', onPostData);
  moreOptionEventBus.off('article', onArticleData);
  moreOptionEventBus.off('course', onCourseData);
  moreOptionEventBus.off('section', onSectionData);
});
</script>

<style scoped>
.action-menu {
  z-index: 100;
}

.menu-sheet {
  border-radius: 24px 24px 0 0;
  padding: 24px 20px;
  padding-bottom: calc(24px + env(safe-area-inset-bottom));
  background: #ffffff;
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.menu-title {
  color: rgba(0, 0, 0, 0.87);
  font-size: 18px;
  letter-spacing: -0.2px;
}

.menu-options {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.menu-option-card {
  border-radius: 14px;
  padding: 14px 16px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  background: rgba(0, 0, 0, 0.01);
  border: 1px solid transparent;
  position: relative;
  overflow: hidden;
}

.menu-option-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.02) 0%, rgba(0, 0, 0, 0.01) 100%);
  opacity: 0;
  transition: opacity 0.25s ease;
}

.menu-option-card:hover {
  background: rgba(0, 0, 0, 0.03);
  border-color: rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.menu-option-card:hover::before {
  opacity: 1;
}

.menu-option-card:active {
  transform: translateY(0) scale(0.99);
  background: rgba(0, 0, 0, 0.05);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.menu-option-content {
  display: flex;
  align-items: center;
  gap: 14px;
  position: relative;
  z-index: 1;
}

.menu-option-content :deep(.v-icon) {
  transition: transform 0.2s ease;
}

.menu-option-card:hover .menu-option-content :deep(.v-icon) {
  transform: scale(1.1);
}

.menu-option-text {
  color: rgba(0, 0, 0, 0.87);
  font-weight: 500;
  font-size: 15px;
  flex: 1;
  letter-spacing: -0.1px;
  transition: color 0.2s ease;
}

.menu-option-card:hover .menu-option-text {
  color: rgba(0, 0, 0, 0.95);
}

.menu-option-danger-text {
  color: #e53935;
}
</style>
