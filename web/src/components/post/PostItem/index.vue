<!-- 帖子项组件主入口 - 根据设备类型动态加载 PC 端或移动端组件 -->
<template>
    <post-item-pc v-if="deviceType === 'desktop'" :init-data="initData" :if-parent-author="ifParentAuthor" :search-query="searchQuery" @alert="alert" @set-post-top="setPostTop"></post-item-pc>
    <post-item-mobile v-else :init-data="initData" :if-parent-author="ifParentAuthor" :search-query="searchQuery" @alert="alert" @set-post-top="setPostTop"></post-item-mobile>
</template>
<script>
import { globalProperties } from '@/main';
import PostItemPc from './pc.vue';
import PostItemMobile from './mobile.vue';

export default {
    name: 'PostItem',
    props: {
        initData: {
            type: Object,
            required: true,
        },
        ifParentAuthor: {
            type: Boolean,
            default: false,
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
        PostItemPc,
        PostItemMobile,
    },
    methods: {
        alert(msg) {
            this.$emit('alert', msg);
        },
        setPostTop(data) {
            this.$emit('set-post-top', data);
        },
    },
}
</script>
<style scoped>
/* 主入口组件不需要样式，样式在各子组件中定义 */
</style>

