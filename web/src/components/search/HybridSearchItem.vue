<!--star button-->
<template>
    <v-card @click="click()" class="card" elevation="1" variant="outlined" :color="'#dddddd'">
        <div class="div-2">
            <v-icon :color="'#8a8a8a'" :icon="getIcon(this.data.type)" style="margin-right: 20px;margin-left: 5pxz;"/>
            <div v-if="data.type=='article'" class="div-1">
                <div class="title-container title-bold key-text">
                    <with-link-container :initData="{'content':data.articleTitle,'keywords':query}"></with-link-container>
                </div>
                <div class="msg-container text-medium key-text">
                    <with-link-container :initData="{'content':data.articleSummary,'keywords':query}"></with-link-container>
                </div>
                <div class="time-container text-small">
                    <with-link-container :initData="{'content':'@'+data.articleAuthor,'keywords':query}"></with-link-container>
                </div>
            </div>
            <div v-if="data.type=='post'" class="div-1">
                <div class="title-container title-bold key-text">
                    <with-link-container :initData="{'content':data.postTitle,'keywords':query}"></with-link-container>
                </div>
                <div class="msg-container text-medium key-text">
                    <with-link-container :initData="{'content':data.postContent,'keywords':query}" :type="'post'"></with-link-container>
                </div>
                <div class="time-container text-small">
                    <with-link-container :initData="{'content':'@'+data.postAuthor,'keywords':query}"></with-link-container>
                </div>
            </div>
            <div v-if="data.type=='reply'" class="div-1">
                <div class="title-container title-bold">
                    {{'回复帖子: ' }}
                    <with-link-container :initData="{'content':data.replyPostTitle,'keywords':query}"></with-link-container>
                </div>
                <div class="msg-container text-medium key-text">
                    <with-link-container :initData="{'content':data.replyContent,'keywords':query}"></with-link-container>
                </div>
            </div>
            <div v-if="data.type=='course'" class="div-1">
                <div class="title-container title-bold key-text">
                    <with-link-container :initData="{'content':data.courseName,'keywords':query}"></with-link-container>
                </div>
                <div class="msg-container text-medium">
                    {{'授课教师: ' }} <with-link-container :initData="{'content':data.courseTeacher,'keywords':query}"></with-link-container>
                </div>
                <div class="msg-container text-medium">
                    {{'开设学院: '  }}<with-link-container :initData="{'content':data.courseCollege,'keywords':query}"></with-link-container>
                </div>
            </div>
        </div>
    </v-card>
</template>

<script>
import { globalProperties } from '@/main';
import WithLinkContainer from '../common/WithLinkContainer.vue';
import { openPage } from '@/utils/other';

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
    components:{
        WithLinkContainer,
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
    methods: {
        click(){
            switch(this.data.type){
                case 'article':
                    openPage("url",{url:"#/article/"+this.data.id})
                    break;
                case 'course':
                    openPage("url",{url:"#/course/"+this.data.id})
                    break;
                case 'post':
                    openPage("url",{url:"#/post/"+this.data.id})
                    break;
                case 'reply':
                    openPage("url",{url:"#/post/"+this.data.replyPostId})
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