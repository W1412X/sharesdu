<template>
    <div class="nothing-view-container" :style="{ width: width, height: height, minHeight: minHeight }">
        <v-empty-state :color="color" text-color="" :icon="icon" :icon-size="iconSize">
            <span :style="{ color: textColor || color, fontSize: textSize }">{{text}}</span>
        </v-empty-state>
    </div>
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
</style>