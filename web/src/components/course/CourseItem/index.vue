<!-- 课程项组件主入口 - 根据设备类型动态加载 PC 端或移动端组件 -->
<template>
    <course-item-pc v-if="deviceType === 'desktop'" :init-data="initData" :search-query="searchQuery"></course-item-pc>
    <course-item-mobile v-else :init-data="initData" :search-query="searchQuery"></course-item-mobile>
</template>
<script>
import { globalProperties } from '@/main';
import CourseItemPc from './pc.vue';
import CourseItemMobile from './mobile.vue';

export default {
    name: 'CourseItem',
    props: {
        initData: {
            type: Object,
            required: true,
        },
        searchQuery: {
            type: Array,
            default: () => [],
        }
    },
    setup() {
        const deviceType = globalProperties.$deviceType;
        return {
            deviceType,
        }
    },
    components: {
        CourseItemPc,
        CourseItemMobile,
    },
}
</script>
<style scoped>
/* 主入口组件不需要样式，样式在各子组件中定义 */
</style>

