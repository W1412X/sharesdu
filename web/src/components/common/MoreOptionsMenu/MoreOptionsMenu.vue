<template>
  <!-- PC 端「更多操作」下拉菜单：与移动端底部抽屉（BottomActionMenu）共用选项与动作逻辑 -->
  <v-menu location="bottom end" :close-on-content-click="true">
    <template #activator="{ props: menuActivatorProps }">
      <v-btn
        elevation="0"
        icon
        v-bind="menuActivatorProps"
        :style="{
          'width': size + 'px',
          'height': size + 'px',
          'color': '#8a8a8a',
          'background-color': 'rgba(0,0,0,0)',
        }"
      >
        <v-icon :size="size" icon="mdi-dots-horizontal"></v-icon>
        <v-tooltip activator="parent">更多操作</v-tooltip>
      </v-btn>
    </template>
    <v-list density="compact" class="more-menu-list">
      <v-list-item
        v-for="(option, index) in options"
        :key="index"
        @click="handleClick(option)"
      >
        <template #prepend>
          <v-icon :icon="option.icon" size="20" :color="option.danger ? '#e53935' : themeColor"></v-icon>
        </template>
        <v-list-item-title :class="{ 'more-option-danger-text': option.danger }">{{ option.text }}</v-list-item-title>
      </v-list-item>
      <v-list-item v-if="options.length === 0" disabled>
        <v-list-item-title>暂无可用操作</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>

  <!-- 操作确认对话框（举报 / 删除确认 / 课程编辑） -->
  <v-dialog v-model="ifShowDialog" style="display: flex;flex-direction: row;align-items: center;justify-content: center;width: 100%;height: 100%;">
    <course-editor
      v-if="ifShowCourseEditor"
      :initData="{
        id: data?.id,
        name: data?.name,
        teacher: data?.teacher,
        type: data?.type,
        campus: data?.campus,
        college: data?.college,
        credit: data?.credit,
        attendMethod: data?.attendMethod,
        examineMethod: data?.examineMethod,
      }"
      @close="closeCourseEditor"
    ></course-editor>
    <report-card v-if="ifShowReportCard" :type="itemType" :id="itemId" @close="closeReportCard"></report-card>
    <delete-confirm-card v-if="ifShowDeleteConfirmCard" :type="itemType" :id="itemId" @close="closeDeleteConfirmCard"></delete-confirm-card>
  </v-dialog>

  <!-- 移动端下载确认弹窗（兜底，正常由移动端抽屉触发） -->
  <mobile-download-confirm-dialog
    v-model="ifShowMobileDownloadDialog"
    @confirm="confirmMobileDownload"
    @cancel="cancelMobileDownload"
  />
</template>

<script setup>
import { computed } from 'vue';
import { globalProperties } from '@/main';
import { buildMoreOptions } from './useMoreOptions';
import { useMoreOptionActions } from './useMoreOptionActions';
import CourseEditor from '@/components/course/CourseEditor.vue';
import ReportCard from '@/components/report/ReportCard.vue';
import DeleteConfirmCard from '@/components/common/DeleteConfirmCard.vue';
import MobileDownloadConfirmDialog from './MobileDownloadConfirmDialog.vue';

const props = defineProps({
  itemType: {
    type: String,
    required: true,
  },
  data: {
    type: Object,
    default: null,
  },
  // 文章是否为 Markdown 编辑器类型（决定是否展示 MD 复制/下载选项）
  ifMd: {
    type: Boolean,
    default: false,
  },
  size: {
    type: String,
    default: '23',
  },
});

const emit = defineEmits(['alert', 'set-loading']);

const themeColor = globalProperties.$themeColor;

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

const options = computed(() => buildMoreOptions(props.itemType, props.data, { ifMd: props.ifMd }));
const itemId = computed(() => props.data?.id);

const handleClick = (option) => {
  handleOption(option, {
    itemType: props.itemType,
    data: props.data,
    emit,
    // v-menu 点击选项后自动关闭，无需手动 close
    close: () => {},
  });
};
</script>

<style scoped>
.more-menu-list {
  border-radius: 12px;
  padding: 6px;
}

.more-option-danger-text {
  color: #e53935;
}
</style>
