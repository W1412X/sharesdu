<!--star button-->
<template>
    <v-card @click="click()" class="card" elevation="1" variant="outlined" :color="'#dddddd'">
        <div class="div-2">
            <v-icon :color="'#8a8a8a'" :icon="getIcon(this.data.type)" style="margin-right: 20px;margin-left: 5pxz;"/>
            <div v-if="data.type=='article'" class="div-1">
                <div class="title-container title-bold key-text">
                    {{ data.articleTitle }}
                </div>
                <div class="msg-container text-medium key-text">
                    {{ data.articleSummary }}
                </div>
                <div class="time-container text-small">
                    @{{ data.articleAuthor }}
                </div>
            </div>
            <div v-if="data.type=='post'" class="div-1">
                <div class="title-container title-bold key-text">
                    {{ data.postTitle }}
                </div>
                <div class="msg-container text-medium key-text">
                    {{ data.postContent }}
                </div>
                <div class="time-container text-small">
                    @{{ data.postAuthor }}
                </div>
            </div>
            <div v-if="data.type=='reply'" class="div-1">
                <div class="title-container title-bold">
                    {{'回复帖子: ' }}
                    <span class="key-text">{{ data.replyPostTitle }}</span>
                </div>
                <div class="msg-container text-medium key-text">
                    {{ data.replyContent }}
                </div>
            </div>
            <div v-if="data.type=='course'" class="div-1">
                <div class="title-container title-bold key-text">
                    {{ data.courseName }}
                </div>
                <div class="msg-container text-medium">
                    {{'授课教师: ' }} <span class="key-text">{{ data.courseTeacher }}</span>
                </div>
                <div class="msg-container text-medium">
                    {{'开设学院: '  }}<span class="key-text">{{ data.courseCollege }}</span>
                </div>
            </div>
        </div>
    </v-card>
</template>

<script>
import { globalProperties } from '@/main';
import { adjustAlpha, openNewPage } from '@/utils/other';

export default {
    props: {
        initData: {
            type: Object,
            default: () => {
                return {
                    type: null,//article,course,post,reply
                    id: null,
                    //article
                    articleTitle:"",
                    articleSummary:"",
                    articleAuthor:"",
                    //post
                    postTitle:"",
                    postContent:"",
                    postAuthor:"",
                    //reply
                    replyContent:"",
                    replyPostId:"",
                    replyPostTitle:"",
                    //course
                    courseName:"",
                    courseCollege:"",
                    courseTeacher:"",
                }
            }
        },
        query:{
            type:Array,
            default:()=>{
                return [];
            },
        }
    },
    setup(){
        const themeColor=globalProperties.$themeColor;
        return {
            themeColor,
        }
    },
    data() {
        const data = this.initData;
        return {
            data
        };
    },
    components: {
    },
    methods: {
        click(){
            switch(this.data.type){
                case 'article':
                    openNewPage("#/article/"+this.data.id)
                    break;
                case 'course':
                    openNewPage("#/course/"+this.data.id);
                    break;
                case 'post':
                    openNewPage("#/post/"+this.data.id);
                    break;
                case 'reply':
                    openNewPage("#/post",this.data.replyPostId);
                    break;
                default:
                    break;
            }
        },
        getIcon(type) {
            switch (type) {
                case 'article':
                    return 'mdi-file-document-outline';
                case 'course':
                    return 'mdi-book-outline';
                case 'post':
                    return "mdi-comment-question-outline";
                case "reply":
                    return "mdi-reply-outline";
            }
            return "mdi-star";
        },
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
    .title-container{
        color: #000;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 80%;
    }
    .time-container{
        color:grey;
        margin-top:0px;
    }
    .msg-container{
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
        text-overflow: ellipsis;
        white-space: normal;
        word-break: break-all;
        overflow: hidden;
        color: #8a8a8a;
        margin: 2px;
        line-height: 1.2;
    }
@media screen and (min-width: 1000px) {
    .card {
        padding: 10px;
        width: 750px;
        border-radius: 0px;
    }
    .div-1 {
        width: 100%;
        display: flex;
        flex-direction: column;
    }
    .div-2{
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
    }
}

@media screen and (max-width: 1000px) {
    .card {
        padding: 10px;
        width: 100vw;
        border-radius: 0px;
    }
    .div-1 {
        width: 100%;
        display: flex;
        flex-direction: column;
    }
    .div-2{
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
    }
}
</style>