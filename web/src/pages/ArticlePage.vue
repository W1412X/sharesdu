<template>
    <v-dialog v-model="ifShowDialog" class="full-screen dialog">
        <div class="dialog-card-container">
            <post-editor v-if="ifShowPostEditor" 
            @close="closeDialog" @add_post="addPost" @set_loading="setLoading" @alert="alert" 
            :type-msg="{type:'article',id:this.article.id}"></post-editor>
        </div>
    </v-dialog>
    <div class="full-center">
        <div>
            <v-chip v-if="article.ifTop&&!ifMaster" width="100%" variant="tonal" :color="themeColor" style="border-radius: 0px;max-height: 28px;width: 100%;justify-content: center;">
                    <v-icon size="20">mdi-format-vertical-align-top</v-icon>
                    <span style="margin-left: 10px;" class="text-small-bold">置顶文章</span>
                    <v-tooltip activator="parent">此文章为网站置顶文章</v-tooltip>
            </v-chip>
            <v-btn @click="setArticleTop" :loading="loading.top" :disabled="loading.top" v-if="ifMaster" width="100%" variant="tonal" :color="article.ifTop?'grey':themeColor" style="max-height: 28px;width: 100%;justify-content: center;">
                <v-icon size="20">mdi-format-vertical-align-top</v-icon>
                <span style="margin-left: 10px;" class="text-small-bold">{{ article.ifTop?'取消置顶':'置顶此文章' }}</span>
                <v-tooltip activator="parent">作为管理员，您可以设置是否置顶此文章</v-tooltip>
            </v-btn>
            <div class="top-bar">
                <div class="title-container">
                    <div class="title">
                        <p class="title-big-bold">
                            {{ article.title }}
                        </p>
                    </div>
                    <v-spacer></v-spacer>
                    <div class="title-right-type">
                        <span v-if="article.type === '原创'">原创</span>
                        <span v-if="article.type === '转载'" @click="toOriginLink">转载</span>
                    </div>
                </div>
                <div class="top-bar-msg-div">
                    <div class="full-column-center text-medium grey-font">
                        <avatar-name v-if="article.authorId" :init-data="{id:article.authorId,name:article.authorName}">
                        </avatar-name>
                    </div>
                    <v-spacer></v-spacer>
                    <div class="full-column-center text-small grey-font">
                        <div class="row-div-reverse">
                            <div class="row-right-20px">
                                <v-icon class="icon-right-5px" color="#8a8a8a" icon="mdi-star" size="18"></v-icon>
                                <div class="column-center">
                                    {{ article.starCount }}
                                </div>
                            </div>
                            <div class="row-right-20px">
                                <v-icon class="icon-right-5px" color="#8a8a8a" icon="mdi-comment" size="16"></v-icon>
                                <div class="column-center">
                                    {{ article.replyCount }}
                                </div>
                            </div>
                            <div class="row-right-20px">
                                <v-icon class="icon-right-5px" color="#8a8a8a" icon="mdi-eye" size="17"></v-icon>
                                <div class="column-center">
                                    {{ article.viewCount }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row-div">
                    <div class="row-right-20px" style="margin: 2px;">
                        <div class="column-center text-small grey-font">
                            {{ article.publishTime }}
                        </div> 
                        <v-icon class="icon-left-5px" color="#8a8a8a" icon="mdi-clock-outline" size="17"></v-icon>
                    </div>
                </div>
                <div class="top-bar-msg-div">
                    <div class="before-text text-small">
                        标签：
                    </div>
                    <tag-button v-for="(tag, index) in article.tags" :data="tag" :key="index"></tag-button>
                </div>
                <div v-if="this.article.sourceUrl" class="source-bar-container">
                    <source-bar :article-id="this.article.id" :article-title="this.article.title"></source-bar>
                </div>
            </div>
            <article-display v-if="loadState" class="margin-bottom-40px" :init-data="displayMsg"></article-display>
            <div class="bottom-bar">
                <div class="column-center user-name text-medium">
                    {{ userName }}
                </div>
                <v-spacer class="spacer"></v-spacer>
                <div class="row-reverse">

                    <div v-if="ifMaster"  class="column-center padding-right-5px">
                        <manage-button :id="this.article.id" :type="'article'" size="23"></manage-button>
                    </div>
                    <div v-if="userId!=article.authorId" class="column-center padding-right-5px">
                        <alert-button :id="this.article.id" :type="'article'"></alert-button>
                    </div>
                    <div v-else class="row-div">
                        <div  class="column-center padding-right-5px">
                            <v-btn elevation="0" @click="edit" icon class="bottom-btn">
                                <v-icon icon="mdi-pencil-outline" size="23"></v-icon>
                            </v-btn>
                        </div>
                        <div  class="column-center padding-right-5px">
                            <delete-button @delete="deleteSelf" :id="this.article.id" :type="'article'" :size="24" @alert="alert" @set_loading="setLoading"></delete-button>
                        </div>
                    </div>
                    <div class="column-center padding-right-10px">
                        <v-btn elevation="0" @click="comment" icon class="bottom-btn">
                            <v-icon icon="mdi-comment-outline" size="23"></v-icon>
                        </v-btn>
                    </div>
                    <div class="column-center padding-right-10px">
                        <star-button v-if="article.id!==null" @alert="alert" @set_loading="setLoading" :type="'article'" :id="article.id" :state="article.ifStar"></star-button>
                    </div>
                    <div class="column-center padding-right-5px">
                        <like-button v-if="article.id!==null" @alert="alert" @set_loading="setLoading" :id="this.article.id" :type="'article'" :state="article.ifLike"></like-button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <v-overlay v-model="ifShowComment" class="posts-dialog">
        <div id="post-container" class="posts-container">
            <div class="column-div">
                <v-btn @click="setPostEditorState(true)" variant="tonal" :color="themeColor">
                    发表帖子
                </v-btn>
                <post-item v-for="(item) in postItems" :init-data="item" :key="item.id" :if-parent-author="userId==article.authorId" @alert="alert" @set_post_top="setPostTop">
                </post-item>
                <v-btn @click="loadMorePost" :loading="this.loading.post" :disabled="loading.post" variant="tonal" class="load-btn">加载更多</v-btn>
            </div>
        </div>
    </v-overlay>
</template>
<script>
import TagButton from '@/components/TagButton.vue';
import { globalProperties } from '@/main.js';
import SourceBar from '@/components/SourceBar.vue';
import ArticleDisplay from '@/components/ArticleDisplay.vue';
import { getCookie } from '@/utils/cookie';
import StarButton from '@/components/StarButton.vue';
import AlertButton from '@/components/AlertButton.vue';
import { computed, ref } from 'vue';
import PostItem from '@/components/PostItem.vue';
import PostEditor from '@/components/PostEditor.vue';
import AvatarName from '@/components/AvatarName.vue';
import { copy, formatImageLinkInArticle, getCancelLoadMsg, getLoadMsg, getNormalErrorAlert, getNormalSuccessAlert, openNewPage, responseToArticle } from '@/utils/other';
import { getArticleDetail, getPostListByArticleId } from '@/axios/article';
import LikeButton from '@/components/LikeButton.vue';
import DeleteButton from '@/components/DeleteButton.vue';
import { addHistory } from '@/utils/history';
import ManageButton from '@/components/ManageButton.vue';
import { setArticleTop } from '@/axios/top';
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
        AvatarName,
        DeleteButton,
        LikeButton,
        ManageButton,
    },
    setup() {
        const themeColor = globalProperties.$themeColor;
        const loadingMsg = {
            state: false,
            text: '加载中...',
            progress: -1
        }
        const ifMaster=getCookie('ifMaster');
        /**
         * get user msg
         */
        var userName = getCookie('userName');
        const userId=getCookie('userId');
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
            userId,
            themeColor,
            loadingMsg,
            userName,
            ifShowComment,
            setPostEditorState,
            ifShowDialog,
            ifShowPostEditor,
            setCommentState,
            ifMaster,
        }
    },
    data() {
        return {
            articleResponse:null,
            article: {
                id: "",
                title: "",
                content:"",
                summary: "",
                coverLink:"",
                originLink:"",
                tags:"",
                type:"",
                authorName:"",
                authorId:"",
                likeCount:"",
                starCount:"",
                viewCount:"",
                replyCount:"",
                hotScore:"",
                sourceUrl:"",
                publishTime:"",
                ifLike:false,
                ifStar:false,
            },
            editorType:"html",
            postItems:[],
            postPageNum:1,
            displayMsg:computed(()=>{
                return {
                    type:this.editorType,
                    content:this.article.content,
                }
            }),
            loadState:false,
            loading:{
                post:false,
                top:false,
            }
        }
    },
    beforeRouteLeave (to, from, next) {
            //use session storage to save memory now  
            let scanMsg={};
            scanMsg.articleResponse=this.articleResponse;
            scanMsg.articleResponse.article_detail.if_top=this.article.ifTop;
            scanMsg.postItems=this.postItems;
            scanMsg.postPageNum=this.postPageNum;
            scanMsg.commentState=this.ifShowComment;
            let key='articleScanMsg|'+this.article.id;
            if(scanMsg.commentState){
                let postScrollTop=document.getElementById("post-container").scrollTop;
                scanMsg.postScrollTop=postScrollTop;
            }
            sessionStorage.setItem(key,JSON.stringify(scanMsg));
            next();
    },
    methods: {
        addPost(item){
            this.postItems.unshift(item);
        },
        comment(){
            this.setCommentState(true);
            if(this.postPageNum==1){
                this.loadMorePost();
            }
        },
        deleteSelf(){
            this.$router.push({
                name:"IndexPage",
            })
        },
        edit(){
            this.setLoading(getLoadMsg("正在加载编辑器..."))
            this.$router.push({
                name:"EditorPage",
                params:{
                    id:this.article.id,
                }
            })
        },
        async loadMorePost(){
            this.loading.post=true;
            let response=await getPostListByArticleId(this.article.id,this.postPageNum);
            if(response.status==200){
                for(let i=0;i<response.post_list.length;i++){
                    this.postItems.push({
                        id:response.post_list[i].post_id,
                        title:response.post_list[i].post_title,
                        content:response.post_list[i].post_content,
                        authorId:response.post_list[i].poster_id,
                        authorName:response.post_list[i].poster_name,
                        viewNum:response.post_list[i].view_count,
                        likeNum:response.post_list[i].like_count,
                        replyNum:response.post_list[i].reply_count,
                        publishTime:response.post_list[i].publish_time,
                        ifLike:response.post_list[i].if_like,
                        ifStar:response.post_list[i].if_star,
                        ifTop:response.post_list[i].if_top,
                    });
                }
                this.postPageNum++;
            }else{
                this.alert(getNormalErrorAlert(response.message));
            }
            this.loading.post=false;
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
        toOriginLink(){
            openNewPage(this.article.originLink);
        },
        async setArticleTop(){
            if (!this.ifMaster) {
                this.alert(getNormalErrorAlert("您不是管理员，无法执行此操作"));
                return;
            }
            this.loading.top = true;
            let response = await setArticleTop(this.article.id, !this.article.ifTop);
            this.loading.top = false;
            if (response.status == 200) {
                this.article.ifTop = !this.article.ifTop;
                //update
                sessionStorage.removeItem('indexScanMsg');
                let key='articleScanMsg|'+this.article.id;
                sessionStorage.removeItem(key);
                this.alert(getNormalSuccessAlert(this.article.ifTop ? "置顶成功" : "取消置顶成功"));
            } else {
                this.alert(getNormalErrorAlert(response.message));
            }
        },
        setPostTop(msg){//{id state}  
            console.log(msg)
            /**
             * no need to copy
             */
            let toOpPost=null;
            let index=-1;
            for(let i=0;i<this.postItems.length;i++){
                if(this.postItems[i].id==msg.id){
                    toOpPost=copy(this.postItems[i]);
                    index=i;
                    break;
                }
            }
            console.log(toOpPost)
            if(toOpPost){
                toOpPost.ifTop=msg.top;
                console.log(toOpPost);
                this.postItems.splice(index,1);
                if(msg.top){
                    this.postItems.unshift(toOpPost);
                }else{
                    //set the first behind top
                    let ifAdd=false;
                    for(let i=0;i<this.postItems.length;i++){
                        if(!this.postItems[i].ifTop){
                            this.postItems.splice(i,0,toOpPost);
                            ifAdd=true;
                            break;
                        }
                    }
                    if(!ifAdd){
                        this.postItems.push(toOpPost);
                    }
                }
                console.log(toOpPost);
            }

        },
    },
    async mounted() {
        if(sessionStorage.getItem('articleScanMsg|'+this.$route.params.id)){
            let scanMsg=JSON.parse(sessionStorage.getItem('articleScanMsg|'+this.$route.params.id));
            this.articleResponse=scanMsg.articleResponse;
            [this.article,this.editorType]=await responseToArticle(scanMsg.articleResponse);
            this.setLoading(getLoadMsg("正在获取文章图片..."));
            this.article.content=await formatImageLinkInArticle(this.article.content);
            this.setLoading(getCancelLoadMsg());
            this.postItems=scanMsg.postItems;
            this.postPageNum=scanMsg.postPageNum;
            this.setCommentState(scanMsg.commentState);
            this.loadState=true;
            setTimeout(()=>{
                if(scanMsg.commentState){
                    document.getElementById("post-container").scrollTop=scanMsg.postScrollTop;
                }
            },10)
            //add to history
            document.getElementById('web-title').innerText='文章 | '+this.article.title;
            await addHistory("article",this.article.id,this.article.title);
            return;
        }
        this.setLoading(getCancelLoadMsg());
        /**
         * get the route params and fetch data
         */
        if(this.$route.params.id){
            this.setLoading(getLoadMsg("正在加载文章信息..."));
            let response=await getArticleDetail(this.$route.params.id);
            this.setLoading(getCancelLoadMsg());
            if(response.status==200){
                this.articleResponse=response;
                [this.article,this.editorType]=await responseToArticle(response);
                this.loadState=true;
                //add to history
                await addHistory("article",this.article.id,this.article.title);
                document.getElementById('web-title').innerText='文章 | '+this.article.title;
            }else{
                this.alert(getNormalErrorAlert(response.message));
                this.$router.push({name:"ErrorPage",params:{reason:response.message}})
            }
        }else{
            this.$router.push({name:"ErrorPage",params:{reason:"缺少参数"}})
        }
        this.setLoading(getCancelLoadMsg());
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
.load-btn{
    width: 100%;
}
.icon-right-5px {
    margin-right: 5px;
}
.icon-left-5px {
    margin-left: 5px;
}
.row-div-reverse{
    overflow-x: scroll;
    max-width: 100%;
    display: flex;
    flex-direction: row-reverse;
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
    align-items: center;
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
    align-items: center;
    flex-direction: row;
}

.before-text {
    font-weight: bold;
    min-width: 45px;
    color: grey;
}

.grey-font {
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
@media screen and (min-width: 1000px) {
    .full-center {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        height: 100%;
    }
    .bottom-bar {
        display: flex;
        width: 1000px;
        flex-direction: row;
        position: fixed;
        bottom: 0;
        height: 40px;
        z-index:99;
        border: #8a8a8a 1px solid;
        background-color: #ffffff;
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

@media screen and (max-width: 1000px) {
    .full-center {
        width: 100vw;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        height: 100vh;
    }
    .bottom-bar {
        display: flex;
        width: 100vw;
        flex-direction: row;
        position: fixed;
        bottom: 0;
        height: 40px;
        z-index:99;
        border: #8a8a8a 1px solid;
        background-color: #ffffff;
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