<!-- 文章项组件主入口 - 根据设备类型动态加载 PC 端或移动端组件 -->
<template>
    <article-item-pc v-if="deviceType === 'desktop'" :init-data="initData" :search-query="searchQuery"></article-item-pc>
    <article-item-mobile v-else :init-data="initData" :search-query="searchQuery"></article-item-mobile>
</template>
<script>
import { globalProperties } from '@/main';
import ArticleItemPc from './pc.vue';
import ArticleItemMobile from './mobile.vue';

export default {
    name: 'ArticleItem',
    props: {
        initData: {
            type: Object,
            default: () => {
                return {
                    id: null,
                    title: null,
                    summary: null,
                    starNum: null,
                    viewNum: null,
                    likeNum: null,
                    articleTags: null,
                    publishTime: null,
                    hotScore: null,
                    comment: null,
                    authorName: null,
                    authorId: null,
                    coverLink: null,
                    type: null,
                }
            }
        },
        searchQuery: {
            type: Array,
            default: () => {
                return [];
            }
        }
    },
    setup() {
        const deviceType = globalProperties.$deviceType;
        return {
            deviceType,
        }
    },
    components: {
        ArticleItemPc,
        ArticleItemMobile,
    },
}
</script>
<style scoped>
/* 主入口组件不需要样式，样式在各子组件中定义 */
</style>

