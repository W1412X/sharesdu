<template>
    <article-item v-if="data.itemType=='article'" :init-data="data" :search-query="query"></article-item>
    <post-item v-else-if="data.itemType=='post'" :init-data="data" :search-query="query"></post-item>
    <course-item v-else-if="data.itemType=='course'" :init-data="data" :search-query="query"></course-item>
    <div v-else-if="data.itemType=='reply'" @click="clickReply" >
        <reply-item :init-data="data"></reply-item>
    </div>
    
</template>
<script>
import { copy, formatRelativeTime, openPage } from '@/utils/other';
import ArticleItem from '@/components/article/ArticleItem.vue';
import PostItem from '@/components/post/PostItem.vue';
import CourseItem from '@/components/course/CourseItem.vue';
import { globalProperties } from '@/main';
import ReplyItem from '@/components/post/ReplyItem.vue';

export default{
    props:{
        initData:{
            type:Object,
            default:()=>{
                return {}
            }
        },
        query:{
            type:Array,
            default:()=>{
                return []
            }
        }
    },
    components:{
        ArticleItem,
        PostItem,
        CourseItem,
        ReplyItem,
    },
    setup(){
        const themeColor=globalProperties.$themeColor;
        return {
            themeColor,
        }
    },
    data(){
        let data=copy(this.initData);
        if (data["publishTime"]) {
            data["publishTime"]=formatRelativeTime(data["publishTime"]);
        }
        return {
            data,
        }
    },
    methods:{
        clickReply(){
            if(this.data.itemType=="reply"){
                openPage("router",{
                    name:'PostPage',
                    params:{
                        id:this.data.postId,
                    }
                })
            }
        }
    },
    mounted(){
    }
}
</script>
<style scoped>
</style>