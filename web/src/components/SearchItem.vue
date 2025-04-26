<template>
    <article-item v-if="data.itemType=='article'" :init-data="data"></article-item>
    <post-item v-else-if="data.itemType=='post'" :init-data="data"></post-item>
    <course-item v-else-if="data.itemType=='course'" :init-data="data"></course-item>
    <div v-else-if="data.itemType=='reply'" @click="clickReply" >
        <reply-item :init-data="data"></reply-item>
    </div>
    
</template>
<script>
import { adjustAlpha, copy } from '@/utils/other';
import ArticleItem from './ArticleItem.vue';
import PostItem from './PostItem.vue';
import CourseItem from './CourseItem.vue';
import { globalProperties } from '@/main';
import ReplyItem from './ReplyItem.vue';

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
        return {
            data:copy(this.initData),
        }
    },
    methods:{
        clickReply(){
            if(this.data.itemType=="reply"){
                this.$router.push({
                    name:'PostPage',
                    params:{
                        id:this.data.postId,
                    }
                })
            }
        }
    },
    mounted(){
        let styledQuery=[];
        for(let i=0;i<this.query.length;i++){
            styledQuery.push(`<span style="font-weight:bold;color:`+adjustAlpha(this.themeColor,0.9)+`">${this.query[i]}</span>`);
        }
        let elements=this.$el.getElementsByClassName("key-text");
        for(let i=0;i<this.query.length;i++){
            for(let u=0;u<elements.length;u++){
                elements[u].innerHTML=elements[u].innerHTML.replaceAll(this.query[i],styledQuery[i]);
            }
        }
    }
}
</script>
<style scoped>
</style>