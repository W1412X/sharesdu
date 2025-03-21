<template>
    <LoadingView :initial-data="loadingMsg"></LoadingView>
    <v-dialog v-model="ifShowDialog" style="width: 100%;height:100%;justify-content: center;">
      <div v-if="ifShowComment" style="width: 100%;height:100%;justify-content: center;display: flex">
        <v-card class="dialog-card">
            <div class="title-bold">
                评论帖子
            </div>
            <SensitiveTextArea v-model="inputingComment"  style="margin-top: 10px;" variant="outlined" density="compact" label="输入评论内容"/>
            <div class="dialog-bottom-btn-bar">
                <v-btn @click="submitComment" variant="text">发表</v-btn>
                <v-btn @click="setCommentState(false)" variant="text">取消</v-btn>
            </div>
        </v-card>
      </div>
      <div v-if="ifShowTmpParentReply" style="width: 100%;height:100%;justify-content: center;display: flex;">
        <div style="display: flex;flex-direction: column;">
            <div style="display: flex;flex-direction: row-reverse;">
                <v-btn @click="closeParentReply" color="#00000000" variant="text" size="25">
                    <v-icon type="mdi" icon="mdi-close" :color="themeColor"></v-icon>
                </v-btn>
            </div>
            <reply-item v-if="ifShowTmpParentReply" :post-id="this.post.id" :init-data="this.tmpParentReply" @show_parent="getParentReply" @reply="addReply" @alert="alert" @set_loading="setLoading"></reply-item>
        </div>
      </div>
    </v-dialog>
    <div class="full-center">
        <div>
            <div class="top-bar">
                <div class="top-bar-msg-div">
                    <div class="full-column-center text-medium name-font">
                        <avatar-name v-if="this.post.authorId" :init-data="{id:this.post.authorId,name:post.authorName}"></avatar-name>
                    </div>
                    <v-spacer></v-spacer>
                    <div class="column-center padding-right-5px">
                        
                    </div>
                    <div class="column-center padding-right-5px">
                        <star-button @alert="alert" @set_loading="setLoading" :state="post.ifStar" :type="'post'" :id="post.id"></star-button>
                    </div>
                </div>
                <div class="title-container title-bold">
                    {{ post.title }}
                </div>
                <div class="detail-text text-medium">
                    {{ post.content }}
                </div>
                <div class="full-column-center text-small grey-font">
                    <div class="comment-star-display-div">
                        <div class="row-right-20px-column-center">
                            <v-icon class="icon-right-5px" color="#8a8a8a" icon="mdi-heart"
                                size="18"></v-icon>
                            <div class="column-center">
                                {{ post.likeNum }}
                            </div>
                        </div>
                        <div class="row-right-20px-column-center">
                            <v-icon class="icon-right-5px" color="#8a8a8a" icon="mdi-comment"
                                size="16"></v-icon>
                            <div class="column-center">
                                {{ post.replyNum }}
                            </div>
                        </div>
                        <div class="row-right-20px-column-center">
                            <v-icon class="icon-right-5px" color="#8a8a8a" icon="mdi-eye"
                                size="16"></v-icon>
                            <div class="column-center">
                                {{ post.viewNum }}
                            </div>
                        </div>
                        <v-spacer></v-spacer>
                        <div class="time-div grey-font text-small">
                            <v-icon class="icon-right-5px" color="#8a8a8a" icon="mdi-clock"
                                size="17"></v-icon>
                            <div class="column-center">
                                {{ post.publishTime }}
                            </div>
                        </div>
                    </div>
                </div>
                <v-btn v-if="this.post.relativeLink!==null" @click="toRelativePage" class="link-btn" variant="tonal" :color="themeColor">{{ relativeText }}</v-btn>
            </div>
            <div class="bottom-bar">
                <div class="column-center user-name text-medium">
                    {{ userName }}
                </div>
                <v-spacer class="spacer"></v-spacer>
                <div class="row-reverse">
                    <div v-if="userId!=post.authorId" class="column-center margin-right-15px">
                        <alert-button :type="'post'" :id="post.id"></alert-button>
                    </div>
                    <div v-else class="column-center margin-right-15px">
                        <delete-button @delete="deleteSelf" :id="this.post.id" :type="'post'" :size="24" @alert="alert" @set_loading="setLoading"></delete-button>
                    </div>
                    <div class="column-center padding-right-5px">
                        <like-button v-if="post.id!==null" :type="'post'" :id="post.id" @alert="alert" @set_loading="setLoading" :state="post.ifLike"></like-button>
                    </div>
                    <div class="column-center padding-right-10px">
                        <v-btn elevation="0" @click="setCommentState(true)" icon class="bottom-btn">
                            <v-icon size="23" icon="mdi-comment-outline"></v-icon>
                        </v-btn>
                    </div>
                </div>
            </div>
            <div class="comments-container">
            <div class="column-div">
                <reply-item v-for="comment in replyList" :init-data="comment" @show_parent="getParentReply" @reply="addReply" :post-id="this.post.id" :key="comment.id" @alert="alert" @set_loading="setLoading">
                </reply-item>
                <v-btn variant="tonal" class="load-btn" @click="loadMoreReply">加载更多</v-btn>
            </div>
        </div>
        </div>
    </div>
</template>
<script>
import { globalProperties } from '@/main.js';
import { getCookie } from '@/utils/cookie';
import StarButton from '@/components/StarButton.vue';
import AlertButton from '@/components/AlertButton.vue';
import { computed, ref } from 'vue';
import SensitiveTextArea from '@/components/SensitiveTextArea.vue';
import AvatarName from '@/components/AvatarName.vue';
import { getCancelLoadMsg, getLinkInPost, getLoadMsg, getNormalErrorAlert, getNormalInfoAlert, getNormalSuccessAlert, getNormalWarnAlert, getPostWithoutLink } from '@/utils/other';
import { createReplyUnderPost, getPostDetailById, getReplyDetailById, getReplyListByPostId } from '@/axios/post';
import LikeButton from '@/components/LikeButton.vue';
import ReplyItem from '@/components/ReplyItem.vue';
import DeleteButton from '@/components/DeleteButton.vue';
export default {
    name: 'PostPage',
    components: {
        StarButton,
        AlertButton,
        ReplyItem,
        SensitiveTextArea,
        AvatarName,
        LikeButton,
        DeleteButton,
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
        const ifShowComment = ref(false);
        const ifShowTmpParentReply=ref(false);
        const ifShowDialog=computed(()=>{
            return ifShowComment.value || ifShowTmpParentReply.value;
        });
        const userId=getCookie('userId');
        const setCommentState = (state) => {
            ifShowComment.value = state;
        }
        const setTmpParentReplyState = (state) => {
            ifShowTmpParentReply.value = state;
        }
        return {
            themeColor,
            loadingMsg,
            userName,
            ifShowComment,
            setCommentState,
            ifShowDialog,
            userId,
            setTmpParentReplyState,
            ifShowTmpParentReply,
        }
    },
    data() {
        const relativeText=computed(()=>{
            if(this.post.relativeLink.includes("course")){
                return "关联课程";
            }else{
                return "关联文章";
            }
        })
        return {
            inputingComment:'',
            post: {
                id: null,
                title: null,
                content: null,
                starNum: null,
                replyNum: null,
                authorName: null,
                authorId:null,
                relativeLink:null,
                publishTime: null,
            },
            relativeText,
            replyList: [],
            replyPageNum:1,
            tmpParentReply:null
        }
    },
    methods: {
        async submitComment(){
            /**
             * need post comment
             */
            if(this.inputingComment==""){
                this.alert(getNormalWarnAlert("评论内容不能为空"));
                return;
            }
            this.setLoading(getLoadMsg("正在提交评论..."));
            let response=await createReplyUnderPost(this.post.id,this.inputingComment);
            this.setLoading(getCancelLoadMsg());
            if(response.status==200||response.status==201){
                this.alert(getNormalSuccessAlert("评论成功"));
                this.replyList.unshift({
                    id:response.reply_id,
                    content:this.inputingComment,
                    authorName:getCookie("userName"),
                    authorId:getCookie("userId"),
                    likeNum:0,
                    publishTime:new Date().toLocaleString(),
                })
                this.setCommentState(false);
            }else{
                this.alert(getNormalErrorAlert(response.message));
            }
        },
        addReply(tmp){
            this.replyList.unshift(
                tmp
            )
        },
        setLoading(msg){
            this.$emit('set_loading',msg);
        },
        alert(msg){
            this.$emit('alert',msg);
        },
        deleteSelf(){
            this.$router.push({
                name:"IndexPage",
            })
        },
        toRelativePage(){
            window.open(this.post.relativeLink,"_blank")
        },
        async loadMoreReply(){
            this.setLoading(getLoadMsg("正在加载评论..."));
            let response=await getReplyListByPostId(this.post.id,this.replyPageNum);
            this.setLoading(getCancelLoadMsg());
            if(response.status==200){
                for(let i=0;i<response.reply_list.length;i++){
                    let reply={
                        id:response.reply_list[i].reply_id,
                        content:response.reply_list[i].reply_content,
                        authorName:response.reply_list[i].replier_name,
                        authorId:response.reply_list[i].replier_id,
                        likeNum:response.reply_list[i].like_count,
                        publishTime:response.reply_list[i].publish_time,
                    }
                    this.replyList.push(reply);
                }
                if(response.reply_list.length==0){
                    this.alert(getNormalInfoAlert("没有更多回复了"));
                }else{
                    this.replyPageNum++;
                }
            }else{
                this.alert(getNormalErrorAlert(response.message));
            }
        },
        async getParentReply(id){
            if(id==null){
                this.alert(getNormalErrorAlert("无父级回复"));
                return;
            }
            //to ensure the state
            this.setTmpParentReplyState(false);
            this.tmpParentReply=null;

            this.setLoading(getLoadMsg("正在加载..."));
            let response=await getReplyDetailById(id);
            this.setLoading(getCancelLoadMsg());
            if(response.status==200||response.status==201){
                this.alert(getNormalSuccessAlert("加载成功"));
                this.tmpParentReply={
                    id:response.reply_detail.reply_id,
                    content:response.reply_detail.reply_content,
                    authorName:response.reply_detail.replier_name,
                    authorId:response.reply_detail.replier_id,
                    likeNum:response.reply_detail.like_count,
                    publishTime:response.reply_detail.publish_time,
                }
                this.setTmpParentReplyState(true);
            }else{
                this.alert(getNormalErrorAlert(response.message));
            }
        },
        closeParentReply() {
            this.setTmpParentReplyState(false);
            this.tmpParentReply=null;
        },
    },
    async mounted() {
        this.setLoading(getCancelLoadMsg());
        /**
         * get the route params and fetch data
         */
        if(!this.$route.params.id){
            this.$router.push({
                name:"ErrorPage",
                params:{
                    reason:"未指定资源参数!"
                }
            })
            return;
        }
        this.setLoading(getLoadMsg("正在加载帖子信息..."));
        let response=await getPostDetailById(this.$route.params.id);
        this.setLoading(getCancelLoadMsg());
        if(response.status==200){
            this.post.authorId=response.post_detail.poster_id;
            this.post.authorName=response.post_detail.poster_name;
            this.post.id=response.post_detail.post_id;
            this.post.title=response.post_detail.post_title;
            this.post.content=getPostWithoutLink(response.post_detail.post_content);
            this.post.relativeLink=getLinkInPost(response.post_detail.post_content);
            this.post.likeNum=response.post_detail.like_count;
            this.post.replyNum=response.post_detail.reply_count;
            this.post.viewNum=response.post_detail.view_count;
            this.post.publishTime=response.post_detail.publish_time;
            this.post.ifLike=response.post_detail.if_like;
        }else{
            this.alert(getNormalErrorAlert(response.message));
            this.$router.push({
                name:"ErrorPage",
                params:{
                    reason:response.message
                }
            });
            return;
        }
        this.loadMoreReply();
    },
}
</script>
<style scoped>
.column-center {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
}
.dialog-bottom-btn-bar{
    padding:10px;
    display: flex;
    flex-direction: row-reverse;
}
.margin-bottom-40px {
    margin-bottom: 40px;
}

.time-div {
    display: flex;
    flex-direction: row;
    margin-top: 5px;
    align-items: center;
}

.dialog-card{
    padding: 10px;
    display: flex;
    flex-direction: column;
}
.bottom-bar {
    display: flex;
    width: 900px;
    flex-direction: row;
    position: fixed;
    bottom: 0;
    height: 40px;
    border: #8a8a8a 1px solid;
    background-color: #ffffff;
    z-index: 1000;
}

.bottom-btn {
    width: 23px;
    height: 23px;
    color: #8a8a8a;
    background-color: rgba(0, 0, 0, 0);
}

.detail-text{
    width: 100%;
    margin-top: 0px;
    margin-bottom: 5px;
    white-space: normal;
    word-break: break-all;
    overflow: hidden;
}

.row-right-20px-column-center {
    display: flex;
    margin-top: 5px;
    align-items: center;
    flex-direction: row;
    margin-right: 20px;
}

.icon-right-5px {
    margin-right: 5px;
}

.top-bar-msg-div {
    margin-top: 5px;
    display: flex;
    flex-direction: row;
    padding-bottom: 5px;
    overflow-x: scroll;
}

.padding-right-5px {
    padding-right: 5px;
}

.padding-right-10px {
    padding-right: 10px;
}
.margin-right-15px {
    margin-right: 20px;
}
.full-column-center {
    display: flex;
    height: 100%;
    flex-direction: column;
    justify-content: center;
}

.comment-star-display-div {
    overflow-x: scroll;
    max-width: 100%;
    display: flex;
    flex-direction: row-reverse;
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

.column-div {
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
        width: 900px;
        padding-left: 20px;
        padding-right: 20px;
        padding-top: 5px;
        padding-bottom: 5px;
    }

    .title-container {
        width: 750px;
        white-space: normal;
        word-break: break-all;
        overflow:hidden;
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

    .posts-dialog {
        padding: 0px;
        display: flex;
        flex-direction: row-reverse;
    }

    .comments-container {
        background-color: #ffffff;
        border-top: #8a8a8a 1px solid;
        width: 100%;
        padding: 1px;
        margin-bottom: 40px;
        height: fit-content;
        overflow-y: scroll;
    }

    .name-font {
        font-weight: bold;
        width: 400px;
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
        white-space: normal;
        word-break: break-all;
        overflow:hidden;
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

    .posts-dialog {
        padding: 0px;
        display: flex;
        flex-direction: column-reverse;
    }

    .comments-container {
        background-color: #ffffff;
        border-top: #8a8a8a 1px solid;
        width: 100vw;
        height: fit-content;
        overflow-y: scroll;
        border-radius: 5px;
        margin-bottom: 40px;
    }

    .name-font {
        font-weight: bold;
        width: 40vw;
    }
}
</style>