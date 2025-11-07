<template>
    <div style="display: flex; flex-direction: column" class="total-container" :style="inputStyle" @click="globalClick">
        <div style="display: flex;flex-direction: row;align-items: center;margin: 10px;">
            <div style="display: flex;flex-direction: row;align-items: center;width: 150px;">
                <v-icon icon="mdi-clock-outline" size="20" style="margin-right: 3px;" color="grey"></v-icon>
                <span class="text-small" style="color:grey">历史搜索</span>
            </div>
        </div>
        <div class="item-container" :style="inputStyle">
            <v-btn v-for="(item, index) in this.items" :key="index" :color="'grey'" :text="item" variant="text"
                class="history-btn" @click="upHistory(item)">
                {{ item }}
                <v-spacer></v-spacer>
                <v-btn size="15" variant="tonal" class="delete-history-btn" @click="deleteHistory(item)">
                    ✕
                </v-btn>
            </v-btn>
        </div>
        <NothingView v-if="items.length==0" :color="hexToRgba('#8a8a8a',0.5)" text="暂无历史记录" icon="mdi-clock"></NothingView>
    </div>
</template>
<script>
import { globalProperties } from '@/main';
import { deleteSearchHistory, getSearchHistory } from '../js/utils';
import { createEventBus, getEventBus } from '@/utils/eventBus';
import NothingView from '../../NothingView.vue';
import { hexToRgba } from '@/utils/other';

export default {
    props:{
        inputStyle:{
            type:Object,
            default:()=>{
                return {};
            },
        }
    },
    setup() {
        const themeColor = globalProperties.$themeColor;
        let eventBus=getEventBus("search-suggestion-show");
        return {
            themeColor,
            eventBus
        }
    },
    components:{
        NothingView,
    },
    data() {
        return {
            items:getSearchHistory(),
        }
    },
    methods: {
        deleteHistory(item=null) {
            let tmp=[];
            let arr=this.items;
            for (let i=0;i<arr.length;i++) {
                if(arr[i]!=item){
                    tmp.push(arr[i]);
                }
            }
            this.items=tmp;
            deleteSearchHistory(item);
        },
        hexToRgba(hex,opacity){
            return hexToRgba(hex,opacity);
        },
        upHistory(item){
            if(this.inputStyle.width=='100vw'){//searchMobilePage
                if(!getEventBus("global-search-input")){
                    createEventBus("global-search-input");
                }
                let eventBus=getEventBus("global-search-input");
                eventBus.emit("fill-search-input",item);
            }else{
                this.$emit("fill-search-input",item);
            }
        },
        globalClick(){
            this.eventBus.emit('child-click',true);
        }
    }
}
</script>
<style scoped>
.history-btn {
    height: 28px;
    min-width: 0px;
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
        width: 60vw;
        padding: 5px;
        padding-right: 10px;
    }
}

@media screen and (min-width: 1000px) {
    .total-container {
        width: 400px;
    }
    .item-container{
        width: 400px;
        padding: 5px;
        padding-right: 10px;
    }
}
</style>