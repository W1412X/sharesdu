<template>
    <transition name="fade" appear>
        <div v-if="show" class="nothing-view-container" :style="{ width: width, height: height, minHeight: minHeight }">
        <v-empty-state :color="color" text-color="" :icon="icon" :icon-size="iconSize">
            <span :style="{ color: textColor || color, fontSize: textSize }">{{text}}</span>
        </v-empty-state>
    </div>
    </transition>
</template>
<script>
import { hexToRgba } from '@/utils/other';

export default{
    props:{
        text:{
            type:String,
            default:"这里什么也没有"
        },
        icon:{
            type:String,
            default:"mdi-help"
        },
        color:{
            type:String,
            default:hexToRgba('#8a8a8a',0.2)
        },
        textColor:{
            type:String,
            default:null
        },
        iconSize:{
            type:[Number, String],
            default:64
        },
        textSize:{
            type:String,
            default:"16px"
        },
        width:{
            type:String,
            default:"100%"
        },
        height:{
            type:String,
            default:"100%"
        },
        minHeight:{
            type:String,
            default:"200px"
        },
        show:{
            type:Boolean,
            default:true
        }
    },
}
</script>
<style scoped>
.nothing-view-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}

/* 过渡动画 */
.fade-enter-active {
    transition: opacity 0.2s ease-in;
}

.fade-leave-active {
    transition: opacity 0.15s ease-out;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
    opacity: 1;
}
</style>