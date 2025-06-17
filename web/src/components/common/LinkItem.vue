<template>
    <span style="padding-left: 2px;padding-right:2px;" prepend-icon="mdi-link-variant" :style="{'color':color}"
        @click="click()">
        <v-tooltip activator="parent">{{ this.data.link }}</v-tooltip>
        <v-progress-circular v-if="loadState" :size="18" :rotate="360" indeterminate :color="themeColor" style="margin-right: 5px;margin-left: 5px;" :width="2"></v-progress-circular> 
        <span>
            <v-icon v-if="!loadState" :color="color" icon="mdi-link-variant" size="18" ></v-icon>
        </span>
        {{ text }}
    </span>
</template>
<script>
import { globalProperties } from '@/main';
import { isExactlySameOrigin, openNewPage, waitSecond } from '@/utils/other';


export default {
    name: 'LinkItem',
    setup() {
        let themeColor = globalProperties.$themeColor;
        return {
            themeColor,
        }
    },
    props: {
        initData: {
            type: Object,
            default: () => {
                return {
                }
            }
        },
        clickable: {
            type: Boolean,
            default: true
        }
    },
    data() {
        let data = this.initData;
        return {
            data,
            color: this.themeColor,
            text:"加载中...",
            loadState:true,
        }
    },
    methods: {
        async checkLink(url) {
            try {
                const response = await fetch(url, {
                    method: 'HEAD'
                });
                console.log(response);
                if (response.ok) {
                    console.log(`Link is accessible: ${url}`);
                    return true;
                } else {
                    console.log(`Link is not accessible: ${url}`);
                    return false;
                }
            } catch (error) {
                console.error(`Error fetching link: ${url}`, error);
                return false;
            }

        },
        click(){
            if(this.clickable){
                if(!isExactlySameOrigin(this.data.link)){
                    if(window.confirm("此链接为外部链接，是否跳转？")){
                        openNewPage(this.data.link);
                    }
                }
            }else{
                return;
            }
        }
    },
    async mounted() {
        this.loadState=true;
        this.text="检测中...";
        await waitSecond(0.5);
        this.loadState=false;
        if(isExactlySameOrigin(this.initData.link)){
            this.text='本站链接';
        }else{
            this.text='外部链接';
        }
        this.color=this.themeColor;
    }
}
</script>
<style scoped> 

.span{
    padding:2px;
    width: fit-content;
    height: 100%;
}
</style>