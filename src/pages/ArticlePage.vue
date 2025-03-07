<template>
    <LoadingView :initial-data="loadingMsg"></LoadingView>
    <v-dialog v-model="ifShowDialog" class="full-screen dialog">
        <div class="dialog-card-container">
            <post-editor v-if="ifShowPostEditor" @close="closeDialog"></post-editor>
        </div>
    </v-dialog>
    <div class="full-center">
        <div>
            <div class="top-bar">
                <div class="title-container">
                    <div class="title">
                        <p class="title-big-bold">
                            {{ article.title }}
                        </p>
                    </div>
                    <v-spacer></v-spacer>
                    <div class="title-right-type">
                        {{ article.type }}
                    </div>
                </div>
                <div class="top-bar-msg-div">
                    <div class="full-column-center text-medium grey-font">
                        作者: {{ article.author }}
                    </div>
                    <v-spacer></v-spacer>
                    <div class="full-column-center text-small grey-font">
                        <div class="row-div">
                            <div class="row-right-20px">
                                <v-icon class="icon-right-5px" color="#8a8a8a" icon="mdi-star"
                                    size="18"></v-icon>
                                <div class="column-center">
                                    {{ article.star }}
                                </div>
                            </div>
                            <div class="row-right-20px">
                                <v-icon class="icon-right-5px" color="#8a8a8a" icon="mdi-comment"
                                    size="16"></v-icon>
                                <div class="column-center">
                                    {{ article.comment }}
                                </div>
                            </div>
                            <div class="row-right-20px">
                                <v-icon class="icon-right-5px" color="#8a8a8a" icon="mdi-clock"
                                    size="17"></v-icon>
                                <div class="column-center">
                                    {{ article.time }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="top-bar-msg-div">
                    <div class="before-text text-small">
                        标签：
                    </div>
                    <tag-button v-for="(tag, index) in article.tags" :data="tag" :key="index"></tag-button>
                </div>
                <div class="source-bar-container">
                    <source-bar :init-data="article.source"></source-bar>
                </div>
            </div>
            <article-display class="margin-bottom-40px" :init-data="article"></article-display>
            <div class="bottom-bar">
                <div class="column-center user-name text-medium">
                    {{ userName }}
                </div>
                <v-spacer class="spacer"></v-spacer>
                <div class="row-reverse">
                    <div class="column-center padding-right-10px">
                        <star-button></star-button>
                    </div>
                    <div class="column-center padding-right-5px">
                        <alert-button></alert-button>
                    </div>
                    <div class="column-center padding-right-10px">
                        <v-btn elevation="0" @click="comment" icon class="bottom-btn">
                            <v-icon icon="mdi-comment-outline"></v-icon>
                        </v-btn>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <v-overlay v-model="ifShowComment" class="posts-dialog">  
        <div class="posts-container">
                <div class="column-div">
                    <v-btn @click="setPostEditorState(true)" variant="tonal" :color="themeColor">
                        发表帖子
                    </v-btn>
                    <post-item 
                        v-for="(item,index) in postItems"
                        :init-data="item"
                        :key="index">
                    </post-item>
                </div>
            </div>
    </v-overlay>
</template>
<script>
import TagButton from '@/components/TagButton.vue';
import { globalProperties } from '@/main.js';
import { articleShort,postItemLong } from '@/utils/data'
import SourceBar from '@/components/SourceBar.vue';
import ArticleDisplay from '@/components/ArticleDisplay.vue';
import { getCookie } from '@/utils/cookie';
import StarButton from '@/components/StarButton.vue';
import AlertButton from '@/components/AlertButton.vue';
import { computed, ref } from 'vue';
import PostItem from '@/components/PostItem.vue';
import PostEditor from '@/components/PostEditor.vue';
export default {
    name: 'ArticlePage',
    components: {
        TagButton,
        SourceBar,
        ArticleDisplay,
        StarButton,
        AlertButton,
        PostItem,
        PostEditor,
    },
    setup() {
        const themeColor = globalProperties.$themeColor;
        const loadingMsg = {
            state: false,
            text: '加载中...',
            progress: -1
        }
        /**
         * get user msg
         */
        var userName = getCookie('userName');
        if (userName == null) {
            userName = "游客";
        }
        /**
         * posts list visibility control here
         */
        const ifShowComment= ref(false);
        const ifShowPostEditor=ref(false);
        const ifShowDialog=computed(()=>{
            return ifShowPostEditor.value;
        })
        const setPostEditorState=(state)=>{
            ifShowPostEditor.value=state;
        }
        const setCommentState=(state)=>{
            ifShowComment.value=state;
        }
        return {
            themeColor,
            loadingMsg,
            userName,
            ifShowComment,
            setPostEditorState,
            ifShowDialog,
            ifShowPostEditor,
            setCommentState,
        }
    },
    data() {
        return {
            article: {
                id: null,
                title: null,
                detail: null,
                star: null,
                comment: null,
                author: null,
                editor: null,//the ditor type used(md or html)
                type: null,//origin/reprint
                content: null,
                time: null,
                tags: null,
                source: {
                    name: null,
                    link: null
                }
            },
            postItems:[],
        }
    },
    methods: {
        comment(){
            this.setCommentState(true);
        },
        closeDialog(){
            this.setPostEditorState(false);
        },
        alert(msg){
            this.$emit("alert",msg);
        },
        setLoading(msg){
            this.$emit("set_loading",msg);
        },
    },
    mounted() {
        /**
         * get the route params and fetch data
         */
        this.article = articleShort;
        /**
         * the tags format is divided by ,
         * so convert it into list here
         */
        try{
            this.article.tags = this.article.tags.split(",");
        }catch(e){
            /**
             * do nothing
             */
            console.log(this.article.tags);
        }
        /**
         * test the posts
         */
        for(let i=0;i<15;i++){
            console.log(postItemLong);
            this.postItems.push(postItemLong)
        }
    },
}
</script>
<style scoped>
.show-post-btn{
    width: 100%;
}
.column-center {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
}

.margin-bottom-40px {
    margin-bottom: 40px;
}

.bottom-bar {
    display: flex;
    width: 1000px;
    flex-direction: row;
    position: fixed;
    bottom: 0;
    height: 40px;
    border: #8a8a8a 1px solid;
    background-color: #ffffff;
}
.bottom-btn{
    width: 23px;
    height: 23px;
    color:#8a8a8a;
    background-color:rgba(0, 0, 0,0);
}
.row-right-20px {
    display: flex;
    flex-direction: row;
    margin-right: 20px;
    align-items: center;
}

.icon-right-5px {
    margin-right: 5px;
}

.dialog-card-container {
        display: flex;
        justify-content: center;
}

.top-bar-msg-div {
    margin-top: 5px;
    display: flex;
    flex-direction: row;
    padding-bottom: 5px;
    overflow-x: scroll;
}

.source-bar-container {
    width: 100%;
}

.padding-right-5px {
    padding-right: 5px;
}
.padding-right-10px {
    padding-right: 10px;
}
.full-column-center {
    display: flex;
    height: 100%;
    flex-direction: column;
    justify-content: center;
}

.row-div {
    overflow-x: scroll;
    max-width: 100%;
    display: flex;
    flex-direction: row;
}

.before-text {
    font-weight: bold;
    min-width: 45px;
    color: grey;
}

.grey-font {
    min-width: 200px;
    white-space: nowrap;
    word-break: break-all;
    overflow: hidden;
    color: grey;
}

.theme-color-font {
    color: var(--theme-color)
}

.column-div{
    display: flex;
    flex-direction: column;
}
@media screen and (min-width: 600px) {
    .full-center {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        height: 100%;
    }

    .top-bar {
        border: grey 1px solid;
        width: 1000px;
        padding-left: 20px;
        padding-right: 20px;
        padding-top: 5px;
        padding-bottom: 5px;
    }

    .title-container {
        width: 980px;
        display: flex;
        flex-direction: row;
    }
    .title{
        width:750px;
        white-space: normal;
        word-break: break-all;
        overflow: hidden;
    }
    .title-right-type{
        margin-right: 30px;
        font-size: 20px;
        color:var(--theme-color);
        font-weight: bold;
    }
    .user-name {
        margin-left: 10px;
        max-width: 300px;
        color: var(--theme-color);
    }
    .row-reverse {
        display: flex;
        flex-direction: row-reverse;
    }
    .posts-dialog{
        padding:0px;
        display: flex;
        flex-direction: row-reverse;
    }
    .posts-container{
        background-color: #ffffff;
        border-top: #8a8a8a 1px solid;
        width: 752px;
        padding:1px;
        height: 100vh;
        overflow-y: scroll;
    }
}

@media screen and (max-width: 600px) {
    .full-center {
        width: 100vw;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        height: 100vh;
    }

    .top-bar {
        border: grey 1px solid;
        width: 100vw;
        padding-left: 2vw;
        padding-right: 2vw;
        padding-top: 1vw;
        padding-bottom: 1vw;
    }

    .title-container {
        width: 98vw;
        display: flex;
        flex-direction: row;
    }
    .title{
        width: 75vw;
        white-space: normal;
        word-break: break-all;
        overflow:hidden;
    }
    .title-right-type{
        margin-right: 3vw;
        font-size: 20px;
        color:var(--theme-color);
        font-weight: bold;
    }
    .user-name {
        margin-left: 2vw;
        width: 30vw;
        color: var(--theme-color);
    }

    .spacer {
        max-width: 30vw;
        font-size: 0px;
    }
    .row-reverse {
        display: flex;
        flex-direction: row-reverse;
        width: 40vw;
    }
    .posts-dialog{
        padding:0px;
        display: flex;
        flex-direction: column-reverse;
    }
    .posts-container{
        background-color: #ffffff;
        border-top: #8a8a8a 1px solid;
        width: 100vw;
        height: 60vh;
        overflow-y: scroll;
        border-radius: 5px;
    }
}
</style>