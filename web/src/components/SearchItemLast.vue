<template>
    <v-card class="card" elevation="1" @click="click">
        <div v-if="needIcon" class="icon-container">
            <v-icon :color="'#8a8a8a'" size="30">
                {{ icon }}
            </v-icon>
        </div>
        <div class="column-div">
            <div class="text-title-bold single-line">
                {{ data.title }}
            </div>
            <div class="tag-container">
                <span class="text-small-bold grey-text">标签：</span>
                <tag-button v-for="tag in data.tags" :key="tag.id" :data="tag" variant="outlined"/>
                <span v-if="data.tags.length==0" class="text-small-bold grey-text">无标签 o_o</span>
            </div>
            <div class="text-medium summary-container">
                {{ data.summary==""?"作者很懒没有添加简介 o_o":data.summary }}
            </div>
            <div ></div>
        </div>
    </v-card>
</template>
<script>
import { globalProperties } from '@/main';
import { copy, getNormalWarnAlert } from '@/utils/other';
import { computed } from 'vue';
import TagButton from './TagButton.vue';

export default{
    props:{
        initData:{
            type:Object,
            default:()=>{
                return {
                }
            }
        },
        needIcon:{
            type:Boolean,
            default:true,
        }
    },
    setup(){
        const themeColor=globalProperties.$themeColor;
        return {
            themeColor,
        }
    },
    components:{
        TagButton,
    },
    data(){
        let data=copy(this.initData);
        let icon=computed(()=>{
            switch(this.data.itemType){
                case 'article':
                    return "mdi-file-document";
                case 'post':
                    return "mdi-post";
                case 'course':
                    return "mdi-book";
                case 'reply':
                    return "mdi-reply";
                default:
                    return "mdi-magnify";
                }
            });
        return {
            data,
            icon,
        }
    },
    methods:{
        click(){
            switch(this.data.itemType){
                case 'article':
                    this.$router.push({
                        name:'ArticlePage',
                        params:{
                            id:this.data.id
                        }
                    })
                    break;
                case 'post':
                    this.$router.push({
                        name:'PostPage',
                        params:{
                            id:this.data.id
                        },
                    });
                    break;
                case 'course':
                    this.$router.push({
                        name:'CoursePage',
                        params:{
                            id:this.data.id
                        },
                    });
                    break;
                case 'reply':
                    this.$router.push({
                        name:'PostPage',
                        params:{
                            id:this.data.postId
                        },
                    });
                    break;
                default:
                    this.alert(getNormalWarnAlert("无必要参数"));
            }
        }
    },
    mounted(){

    }
}
</script>
<style scoped>
.column-div{
    display: flex;
    flex-direction: column;
}
.icon-container{
    height: 100%;
    align-items: center;
    padding: 5px;
}
.tag-container{
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-top: 5px;
    margin-bottom: 8px;
    overflow-x: scroll;
}
.bottom-container{
    display: flex;
    width: 100%;
    flex-direction: row;
    
}
.grey-text{
    color: #8a8a8a;
}
@media screen and (min-width: 1000px) {
    .card {
        padding: 10px;
        width: 750px;
        margin-top: 5px;
        display: flex;
        flex-direction: row;
    }
    .full-center {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        height: 100%;
    }
    .single-line{
        white-space:nowrap; 
        overflow:hidden;
        text-overflow:ellipsis;
        width: 100%;
        max-width: 100%;
    }
    .no-constrain-line{
        max-width: 730px;
        white-space: pre-line;
        word-break: break-all;
        overflow: hidden;
        color: #8a8a8a;
        line-height: 1.1;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
        text-overflow: ellipsis;
    }
    .summary-container {
        max-width: 590px;
        white-space: normal;
        word-break: break-all;
        overflow: hidden;
        color: #8a8a8a;
        line-height: 1.2;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        text-overflow: ellipsis;
    }
}

@media screen and (max-width: 1000px) {
    .card {
        width: 100vw;
        padding: 10px;
        margin-top: 2px;
        display: flex;
        flex-direction: row;
    }
    .full-center {
        width: 100vw;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        height: 100vh;
    }
    .single-line{
        white-space:nowrap; 
        overflow:hidden;
        text-overflow:ellipsis;
        width: 100%;
        max-width: 100%;
    }
    .no-constrain-line {
        color: #8a8a8a;
        padding-top: 2px;
        white-space: pre-line;
        word-break: break-all;
        overflow: hidden;
        color: #8a8a8a;
        line-height: 1.1;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        text-overflow: ellipsis;
    }
    .summary-container {
        white-space: normal;
        word-break: break-all;
        overflow: hidden;
        color: #8a8a8a;
        line-height: 1.2;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        text-overflow: ellipsis;
    }
}
</style>