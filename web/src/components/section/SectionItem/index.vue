<!-- 板块项组件主入口 - 根据设备类型动态加载 PC 端或移动端组件 -->
<template>
    <section-item-pc v-if="deviceType === 'desktop'" :init-data="initData"></section-item-pc>
    <section-item-mobile v-else :init-data="initData"></section-item-mobile>
</template>
<script>
import { globalProperties } from '@/main';
import SectionItemPc from './pc.vue';
import SectionItemMobile from './mobile.vue';

export default {
    name: 'SectionItem',
    props: {
        initData: {
            type: Object,
            default: () => {
                return {
                    id: null,
                    title: null,
                    summary: null,
                    coverLink: null,
                    publishTime: null,
                    sectionName: null,
                    ifTop: false,
                    postCount: 0, // 帖子数量
                }
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
        SectionItemPc,
        SectionItemMobile,
    },
}
</script>
<style scoped>
/* 主入口组件不需要样式，样式在各子组件中定义 */
</style>
