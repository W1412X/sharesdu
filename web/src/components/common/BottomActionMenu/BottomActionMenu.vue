<template>
  <v-dialog v-model="ifShowDialog" style="display: flex;flex-direction: row;align-items: center;justify-content: center;width: 100%;height: 100%;">
    <course-editor v-if="ifShowCourseEditor" :initData="{
      id:course.id,
      name:course.name,
      teacher:course.teacher,
      type:course.type,
      campus:course.campus,
      college:course.college,
      credit:course.credit,
      attendMethod:course.attendMethod,
      examineMethod:course.examineMethod,
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
            <v-icon :icon="option.icon" :color="option.iconColor || themeColor" size="24"></v-icon>
            <div class="menu-option-text text-medium">{{ option.text }}</div>
          </div>
        </v-card>
      </div>
    </v-sheet>
  </v-bottom-sheet>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { globalProperties } from '@/main';
import CourseEditor from '@/components/course/CourseEditor.vue';
import { moreOptionEventBus } from '@/utils/eventBus';
import useOptionShowSheet from './useShowState';
import ReportCard from '@/components/report/ReportCard.vue';
import DeleteConfirmCard from '../DeleteConfirmCard.vue';
import { openPage } from '@/utils/navigation';
import { getNormalSuccessAlert } from '@/utils/alert';
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'action']);
const typeNow=ref(null);
const postData=ref(null);
const articleData=ref(null);
const courseData=ref(null);
const sectionData=ref(null);
const ifShowReportCard = ref(false);
const ifShowDeleteConfirmCard = ref(false);
const ifShowCourseEditor = ref(false);
const course = computed(() => courseData.value || {});
const ifShowDialog = computed(()=>{
  return ifShowReportCard.value || ifShowDeleteConfirmCard.value || ifShowCourseEditor.value;
})
const sheetToShow=computed(()=>{
  switch(typeNow.value){
    case "post":
      return useOptionShowSheet("post",postData.value?.authorId);
    case "article":
      return useOptionShowSheet("article",articleData.value?.authorId);
    case "course":
      return useOptionShowSheet("course",courseData.value?.authorId);
    case "section":
      return useOptionShowSheet("section",sectionData.value?.authorId);
    default:
      return [];
  }
})
const itemId=computed(()=>{
  switch(typeNow.value){
    case "post":
      return postData.value?.id;
    case "article":
      return articleData.value?.id;
    case "course":
      return courseData.value?.id;
    case "section":
      return sectionData.value?.id;
    default:
      return null;
  }
})
const itemType=computed(()=>{
  return typeNow.value;
})
const themeColor = globalProperties.$themeColor;
const closeReportCard=(()=>{
  ifShowReportCard.value = false;
  })
const closeDeleteConfirmCard=(()=>{
  ifShowDeleteConfirmCard.value = false;
  })
const closeCourseEditor=(()=>{
  ifShowCourseEditor.value = false;
  })
const ifShow = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const close = () => {
  emit('update:modelValue', false);
};
const handleOptionClick = (option) => {
  switch(option.type){
    case "post-alert":
      ifShowReportCard.value = true;
      break;
    case "article-alert":
      ifShowReportCard.value = true;
      break;
    case "course-alert":
      ifShowReportCard.value = true;
      break;
    case "course-edit":
      ifShowCourseEditor.value = true;
      break;
    case "section-edit":
      openPage("router",{
        name:"SectionEditorPage",
        params:{
          id:sectionData.value?.id,
        }
      });
      break;
    case "section-delete":
      ifShowDeleteConfirmCard.value = true;
      break;
    case "section-share":
      navigator.clipboard.writeText(window.location.href) 
      emit('alert',getNormalSuccessAlert("复制成功"));
      break;
    case "article-edit":
      openPage("router",{
        name:"EditorPage",
        params:{
          id:articleData.value?.id,
        }
      });
      break;
    case "course-share":
      navigator.clipboard.writeText(window.location.href) 
      emit('alert',getNormalSuccessAlert("复制成功"));
      break;
    case "article-share":
      navigator.clipboard.writeText(window.location.href) 
      emit('alert',getNormalSuccessAlert("复制成功"));
      break;
    case "post-share":
      navigator.clipboard.writeText(window.location.href) 
      emit('alert',getNormalSuccessAlert("复制成功"));
      break;
    case "post-delete":
      ifShowDeleteConfirmCard.value = true;
      break;
    case "article-delete":
      ifShowDeleteConfirmCard.value = true;
      break;
    case "course-manage":
      openPage("router",{
        name:"ManagePage",
        query:{
          init_type:"course",
          init_id:courseData.value?.id,
        }
      });
      break;
    case "article-manage":
      openPage("router",{
        name:"ManagePage",
        query:{
          init_type:"article",
          init_id:articleData.value?.id,
        }
      });
      break;
  }
  close();
};

onMounted(() => {
  moreOptionEventBus.on("post",(data) => {
  typeNow.value = 'post';
  postData.value = data;
  });
  moreOptionEventBus.on("article",(data) => {
    typeNow.value = 'article';
    articleData.value = data;
  });
  moreOptionEventBus.on("course",(data) => {
    typeNow.value = 'course';
    courseData.value = data;
  });
  moreOptionEventBus.on("section",(data) => {
    typeNow.value = 'section';
    sectionData.value = data;
  });
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
</style>

