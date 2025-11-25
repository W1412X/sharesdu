<template>
  <div class="item-container">
    <template v-if="courseList.length > 0">
      <course-item 
        v-for="item in courseList" 
        :key="item.id" 
        :init-data="item"
      ></course-item>
    </template>
    <LoadMoreButton
      :all-load="allLoad"
      :loading="loading"
      :theme-color="themeColor"
      @load-more="$emit('load-more')"
    />
    <nothing-view 
      v-if="!loading && courseList.length == 0" 
      icon="mdi-school-outline" 
      text="暂无课程" 
      :icon-size="80"
      text-size="18px"
      min-height="300px"
    ></nothing-view>
  </div>
</template>

<script setup>
import LoadMoreButton from './LoadMoreButton.vue';
import CourseItem from '@/components/course/CourseItem.vue';
import NothingView from '@/components/common/NothingView.vue';

defineProps({
  courseList: {
    type: Array,
    required: true,
  },
  themeColor: {
    type: String,
    required: true,
  },
  allLoad: {
    type: Boolean,
    required: true,
  },
  loading: {
    type: Boolean,
    required: true,
  },
});

defineEmits(['load-more']);
</script>

<style scoped>
/** desktop */
@media screen and (min-width: 1000px) {
  .item-container {
    margin-bottom: 50px;
    display: flex;
    width: 750px;
    flex-direction: column;
    background-color: white;
  }
}

/** mobile */
@media screen and (max-width: 1000px) {
  .item-container {
    margin-bottom: 50px;
    display: flex;
    flex-direction: column;
    background-color: white;
  }
}
</style>


