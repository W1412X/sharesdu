<!--star button-->
<template>
    <v-card 
        @click="click()" 
        class="card" 
        elevation="2" 
        variant="outlined"
        :class="{'card-hover': true}"
    >
        <div class="card-content">
            <div class="icon-wrapper">
                <v-icon 
                    color="#9E9E9E" 
                    :icon="getIcon(data.type)" 
                    class="type-icon"
                />
            </div>
            <div v-if="data.type=='article'" class="content-wrapper">
                <div class="title-container title-bold key-text">
                    <with-link-container :initData="{'content':data.articleTitle,'keywords':query}"></with-link-container>
                </div>
                <div class="msg-container text-medium key-text">
                    <with-link-container :initData="{'content':data.articleSummary,'keywords':query}"></with-link-container>
                </div>
                <div class="meta-container text-small">
                    <with-link-container :initData="{'content':'@'+data.articleAuthor,'keywords':query}"></with-link-container>
                </div>
            </div>
            <div v-if="data.type=='post'" class="content-wrapper">
                <div class="title-container title-bold key-text">
                    <with-link-container :initData="{'content':data.postTitle,'keywords':query}"></with-link-container>
                </div>
                <div class="msg-container text-medium key-text">
                    <with-link-container :initData="{'content':data.postContent,'keywords':query}" :type="'post'"></with-link-container>
                </div>
                <div class="meta-container text-small">
                    <with-link-container :initData="{'content':'@'+data.postAuthor,'keywords':query}"></with-link-container>
                </div>
            </div>
            <div v-if="data.type=='reply'" class="content-wrapper">
                <div class="title-container title-bold">
                    <span class="reply-label">回复帖子: </span>
                    <with-link-container :initData="{'content':data.replyPostTitle,'keywords':query}"></with-link-container>
                </div>
                <div class="msg-container text-medium key-text">
                    <with-link-container :initData="{'content':data.replyContent,'keywords':query}"></with-link-container>
                </div>
            </div>
            <div v-if="data.type=='course'" class="content-wrapper">
                <div class="title-container title-bold key-text">
                    <with-link-container :initData="{'content':data.courseName,'keywords':query}"></with-link-container>
                </div>
                <div class="info-row text-medium">
                    <span class="info-label">授课教师: </span>
                    <with-link-container :initData="{'content':data.courseTeacher,'keywords':query}"></with-link-container>
                </div>
                <div class="info-row text-medium">
                    <span class="info-label">开设学院: </span>
                    <with-link-container :initData="{'content':data.courseCollege,'keywords':query}"></with-link-container>
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
/* 卡片基础样式 - 简洁高级风格 */
.card {
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid rgba(0, 0, 0, 0.08);
    background-color: #ffffff;
    margin-bottom: 1px;
}

.card-hover:hover {
    background-color: #fafafa;
    border-color: rgba(0, 0, 0, 0.12);
}

.card-content {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 14px;
}

.icon-wrapper {
    flex-shrink: 0;
    display: flex;
    align-items: flex-start;
    padding-top: 1px;
}

.type-icon {
    opacity: 0.6;
}

.content-wrapper {
    flex: 1;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
}

.title-container {
    color: #212121;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 500;
    line-height: 1.5;
    letter-spacing: -0.01em;
}

.reply-label {
    color: #757575;
    font-weight: 400;
}

.msg-container {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    text-overflow: ellipsis;
    white-space: normal;
    word-break: break-word;
    overflow: hidden;
    color: #616161;
    line-height: 1.6;
    margin: 0;
}

.meta-container {
    color: #9E9E9E;
    margin-top: 2px;
    font-size: 13px;
    line-height: 1.4;
}

.info-row {
    color: #757575;
    line-height: 1.5;
    margin: 0;
    font-size: 14px;
}

.info-label {
    color: #9E9E9E;
    margin-right: 4px;
}

/* PC端样式 */
@media screen and (min-width: 1000px) {
    .card {
        padding: 14px 16px;
        width: 750px;
        border-radius: 0px;
    }
    
    .card-content {
        gap: 16px;
    }
    
    .type-icon {
        font-size: 22px;
    }
    
    .title-container {
        font-size: 15px;
    }
    
    .msg-container {
        font-size: 14px;
        -webkit-line-clamp: 3;
    }
    
    .meta-container {
        font-size: 13px;
    }
    
    .info-row {
        font-size: 14px;
    }
}

/* 移动端样式 */
@media screen and (max-width: 1000px) {
    .card {
        padding: 12px;
        width: 100vw;
        border-radius: 0px;
        margin-bottom: 0;
    }
    
    .card-content {
        gap: 12px;
    }
    
    .type-icon {
        font-size: 20px;
    }
    
    .title-container {
        font-size: 14px;
        max-width: 100%;
    }
    
    .msg-container {
        font-size: 13px;
        -webkit-line-clamp: 2;
    }
    
    .meta-container {
        font-size: 12px;
    }
    
    .info-row {
        font-size: 13px;
    }
}
</style>