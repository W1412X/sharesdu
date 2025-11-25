<template>
  <div v-if="searchType === '课程'" class="course-select-container">
    <v-btn
      variant="outlined"
      :color="ifCourseFilter ? themeColor : 'grey'"
      @click="ifCourseFilter = !ifCourseFilter"
      prepend-icon="mdi-filter-menu-outline"
    >
      筛选
    </v-btn>
    <span
      v-if="!ifCourseFilter"
      :style="{ color: themeColor, 'margin-left': '20px' }"
      class="text-medium"
    >
      通过
      <span class="text-medium-bold">学院/类型</span>
      筛选课程
    </span>
    <v-autocomplete
      v-if="ifCourseFilter"
      hide-details
      v-model="localCourseCollege"
      style="margin-left: 10px;"
      :min-width="'150px'"
      label="开设学院"
      density="compact"
      :items="colleges"
      variant="outlined"
    />
    <v-select
      v-if="ifCourseFilter"
      hide-details
      v-model="localCourseType"
      style="margin-left: 10px;"
      :min-width="'100px'"
      label="课程类型"
      density="compact"
      variant="outlined"
      :items="['全部', '必修', '选修', '限选']"
    />
    <v-select
      v-if="ifCourseFilter"
      hide-details
      v-model="localCourseMethod"
      style="margin-left: 10px;"
      :min-width="'100px'"
      label="教学类型"
      density="compact"
      variant="outlined"
      :items="['全部', '线上', '线下', '混合']"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  searchType: {
    type: String,
    required: true,
  },
  ifCourseFilter: {
    type: Boolean,
    required: true,
  },
  courseCollege: {
    type: String,
    required: true,
  },
  courseType: {
    type: String,
    required: true,
  },
  courseMethod: {
    type: String,
    required: true,
  },
  colleges: {
    type: Array,
    required: true,
  },
  themeColor: {
    type: String,
    required: true,
  },
});

const emit = defineEmits([
  'update:if-course-filter',
  'update:course-college',
  'update:course-type',
  'update:course-method',
]);

const ifCourseFilter = computed({
  get: () => props.ifCourseFilter,
  set: (value) => emit('update:if-course-filter', value),
});

const localCourseCollege = computed({
  get: () => props.courseCollege,
  set: (value) => emit('update:course-college', value),
});

const localCourseType = computed({
  get: () => props.courseType,
  set: (value) => emit('update:course-type', value),
});

const localCourseMethod = computed({
  get: () => props.courseMethod,
  set: (value) => emit('update:course-method', value),
});
</script>

<style scoped>
.course-select-container {
  display: flex;
  flex-direction: row;
  overflow-x: auto;
  padding: 6px;
  margin-right: 30px;
  max-width: none;
  flex: 1;
  align-items: center;
}
</style>
