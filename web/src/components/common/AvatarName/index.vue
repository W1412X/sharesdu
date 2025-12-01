<!-- 头像名称组件主入口 - 根据设备类型动态加载 PC 端或移动端组件 -->
<template>
    <avatar-name-pc v-if="deviceType === 'desktop'" 
        :init-data="initData" 
        :size="size" 
        :color="color" 
        :clickable="clickable" 
        :if-show-name="ifShowName" 
        :name-size="nameSize" 
        :lazy="lazy">
    </avatar-name-pc>
    <avatar-name-mobile v-else 
        :init-data="initData" 
        :size="size" 
        :color="color" 
        :clickable="clickable" 
        :if-show-name="ifShowName" 
        :name-size="nameSize" 
        :lazy="lazy">
    </avatar-name-mobile>
</template>
<script>
import { globalProperties } from '@/main';
import AvatarNamePc from './pc.vue';
import AvatarNameMobile from './mobile.vue';

export default {
    name: 'AvatarName',
    props: {
        initData: {
            type: Object,
            default: function () {
                return {
                    id: null,
                    name: null,
                }
            }
        },
        size: {
            type: String,
            default: '30'
        },
        color: {
            type: String,
            default: '#000'
        },
        clickable: {
            type: Boolean,
            default: true
        },
        ifShowName: {
            type: Boolean,
            default: true
        },
        nameSize: {
            type: String,
            default: '16'
        },
        lazy: {
            type: Boolean,
            default: true
        }
    },
    setup() {
        const deviceType = globalProperties.$deviceType;
        return {
            deviceType,
        }
    },
    components: {
        AvatarNamePc,
        AvatarNameMobile,
    },
}
</script>
<style scoped>
/* 主入口组件不需要样式，样式在各子组件中定义 */
</style>

