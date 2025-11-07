<template>
    <div style="width: 100%;height: 100%;flex-direction: row;align-items: center;justify-content: center;">
        <v-empty-state :color="color" text-color="" :icon="icon">
            <span :style="{ color: color }">{{text}}</span>
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
        }
    },
}
</script>