<template>
    <div style="display: flex; flex-direction: column" class="total-container" :style="inputStyle" @click="globalClick">
        <div style="display: flex;flex-direction: row;align-items: center;margin: 10px;">
            <div style="display: flex;flex-direction: row;align-items: center;width: 150px;">
                <v-icon icon="mdi-fire" size="20" style="margin-right: 3px;" color="#ff3848"></v-icon>
                <span class="text-small-bold" style="color:#ff3848">全站热搜</span>
            </div>
            <v-spacer></v-spacer>
        </div>
        <div class="item-container" :style="inputStyle">
            <div v-for="(item, index) in this.items" :key="index" @click="upReccommend(item.text)" :color="getFireColor(item.hotScore)" :text="item.text" variant="text"
                class="history-btn">
                <div style="display: flex;flex-direction: row;align-items: center;width:100%">
                    <span :style="{'color':getFireColor(item.hotScore)}" class="text-medium-bold">{{ item.rock}}</span>
                    <span style="width: 8px;"></span>
                    <span :style="{'color':getFireColor(item.hotScore)}" class="text-medium">{{item.text }}</span>
                <v-spacer></v-spacer>
                <span class="text-tiny" :style="{'color':getFireColor(hotScore)}"> {{ item.hotScore }}</span>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { globalProperties } from '@/main';
import { reactive } from 'vue';
import { createEventBus, getEventBus } from '@/utils/eventBus';
import { getFireColor } from '../js/utils';
export default {
    props:{
        inputStyle:{
            type:Object,
            default:()=>{
                return {}
            }
        }
    },
    setup() {
        const themeColor = globalProperties.$themeColor;
        let items = reactive([
            {
                rock:1,
                hotScore:1920,
                text:"测试使用热度1"
            },
            {
                rock:2,
                hotScore:960,
                text:"测试使用热度2"
            },
            {
                rock:3,
                hotScore:480,
                text:"测试使用热度3"
            },
            {
                rock:4,
                hotScore:240,
                text:"测试使用热度1"
            },
            {
                rock:5,
                hotScore:120,
                text:"测试使用热度2"
            },
            {
                rock:6,
                hotScore:80,
                text:"测试使用热度3"
            },
            {
                rock:7,
                hotScore:40,
                text:"测试使用热度1"
            },
            {
                rock:8,
                hotScore:20,
                text:"测试使用热度2"
            },
            {
                rock:9,
                hotScore:0,
                text:"测试使用热度3"
            },
        ]);
        let eventBus=getEventBus("search-suggestion-show");
        return {
            themeColor,
            items,
            eventBus
        }
    },
    data() {
        return {
        }
    },
    methods: {
        globalClick(){
            this.eventBus.emit('child-click',true);
        },
        getFireColor(hotScore){
            return getFireColor(hotScore);
        },
        upReccommend(item){
            if(this.inputStyle.width=='100vw'){//searchMobilePage
                if(!getEventBus("global-search-input")){
                    createEventBus("global-search-input");
                }
                let eventBus=getEventBus("global-search-input");
                eventBus.emit("fill-search-input",item);
            }else{
                this.$emit("fill-search-input",item);
            }
        }
    }
}
</script>
<style scoped>
.history-btn {
    height: 28px;
    min-width: 0px;
    width: 100%;
    padding-top: 0px;
    padding-right: 3px;
    padding-bottom: 1px;
    margin-bottom: 5px;
    margin-left: 3px;
    margin-right: 3px;
}

.delete-history-btn {
    border-radius: 50px;
    height: 15px;
    margin: 5px;
    font-size: 12px;
    color: #8a8a8a;
    font-weight: 600;
    padding-top: 0px;
    margin-right: 0px;
    padding-right: 0px;
    margin-left: 10px;
}

@media screen and (max-width: 1000px) {
    .total-container {
        width: 60vw;
    }
    .item-container{
        padding: 5px;
        width: 60vw;
        padding-right: 10px;

    }
}

@media screen and (min-width: 1000px) {
    .total-container {
        width: 400px;
    }
    .item-container{
        width: 400px;
        padding-right: 10px;
        padding: 5px;
    }
}
</style>