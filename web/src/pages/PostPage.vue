<template>
    <v-dialog v-model="ifShowDialog" class="post-dialog">
        <div v-if="ifShowComment" class="dialog-layer">
            <v-card class="dialog-card comment-dialog-card">
                <div class="title-bold">
                    评论帖子
                </div>
                <div class="row-div editor-row">
                    <SensitiveTextArea v-model="inputingComment" class="comment-textarea" variant="outlined"
                        density="compact" label="输入评论内容" />
                    <EmojiPicker @emoji="addEmoji"></EmojiPicker>
                </div>
                <div class="dialog-bottom-btn-bar">
                    <v-btn :disabled="loading.submitReply" :loading="loading.submitReply" @click="submitComment"
                        variant="text" class="dialog-action-btn primary">发表</v-btn>
                    <v-btn @click="setCommentState(false)" variant="text" class="dialog-action-btn">取消</v-btn>
                </div>
            </v-card>
        </div>
        <div v-if="ifShowTmpParentReply" class="dialog-layer parent-reply-layer">
            <div class="parent-reply-wrapper">
                <div class="parent-reply-header">
                    <v-btn @click="closeParentReply" color="#00000000" variant="text" size="25" class="close-btn">
                        <v-icon type="mdi" icon="mdi-close" :color="themeColor"></v-icon>
                        <v-tooltip activator="parent">关闭</v-tooltip>
                    </v-btn>
                </div>
                <reply-item v-if="ifShowTmpParentReply" :post-id="this.post.id" :init-data="this.tmpParentReply"
                    @show_parent="getParentReply" @reply="addReply" @alert="alert"
                    @set_loading="setLoading"></reply-item>
            </div>
        </div>
    </v-dialog>
    <div class="full-center">
        <div class="column-div">
            <part-loading-view :state="!loadState.post" class="top-bar" :text="'正在加载帖子信息...'"></part-loading-view>
            <div v-if="loadState.post" class="top-bar surface-card">
                <div class="top-bar-msg-div">
                    <div class="full-column-center text-medium name-font">
                        <avatar-name v-if="this.post.authorId"
                            :init-data="{ id: this.post.authorId, name: post.authorName }"></avatar-name>
                    </div>
                    <v-spacer></v-spacer>
                    <div class="column-center padding-right-5px">

                    </div>
                    <div class="column-center padding-right-5px">
                        <star-button @alert="alert" @set_loading="setLoading" :state="post.ifStar" :type="'post'"
                            :id="post.id"></star-button>
                    </div>
                </div>
                <div class="title-container title-bold">
                    {{ post.title }}
                </div>
                <div class="detail-text text-medium detail-panel">
                    <WithLinkContainer :init-data="{ content: post.content }" :type="'post'"></WithLinkContainer>
                </div>
                <div class="row-div-scroll">
                    <img-card v-for="(img, index) in post.imgList" :height="140" :width="140" :src="img"
                        :key="index"></img-card>
                </div>
                <div class="full-column-center text-small grey-font">
                    <div class="comment-star-display-div">
                        <div class="row-right-20px-column-center">
                            <v-icon class="icon-right-5px" color="#8a8a8a" icon="mdi-heart" size="18"></v-icon>
                            <div class="column-center">
                                {{ post.likeNum }}
                            </div>
                        </div>
                        <div class="row-right-20px-column-center">
                            <v-icon class="icon-right-5px" color="#8a8a8a" icon="mdi-comment" size="16"></v-icon>
                            <div class="column-center">
                                {{ post.replyNum }}
                            </div>
                        </div>
                        <div class="row-right-20px-column-center">
                            <v-icon class="icon-right-5px" color="#8a8a8a" icon="mdi-eye" size="16"></v-icon>
                            <div class="column-center">
                                {{ post.viewNum }}
                            </div>
                        </div>
                        <v-spacer></v-spacer>
                        <div class="time-div grey-font text-small">
                            <v-icon class="icon-right-5px" color="#8a8a8a" icon="mdi-clock" size="17"></v-icon>
                            <div class="column-center">
                                {{ post.publishTime }}
                            </div>
                        </div>
                    </div>
                </div>
                <v-btn v-if="this.post.relativeLink !== null" @click="toRelativePage" class="link-btn" variant="tonal"
                    :color="themeColor">{{ relativeText }}</v-btn>
            </div>
            <div class="bottom-bar toolbar">
                <div class="column-center user-name text-medium">
                    {{ userName }}
                </div>
                <v-spacer class="spacer"></v-spacer>
                <div class="row-reverse">
                    <div v-if="userId != post.authorId" class="column-center margin-right-15px">
                        <alert-button :type="'post'" :id="post.id"></alert-button>
                    </div>
                    <div v-else class="column-center margin-right-15px">
                        <delete-button @delete="deleteSelf" :id="this.post.id" :type="'post'" :size="24" @alert="alert"
                            @set_loading="setLoading"></delete-button>
                    </div>
                    <div class="column-center padding-right-5px">
                        <like-button v-if="post.id !== null" :type="'post'" :id="post.id" @alert="alert"
                            @set_loading="setLoading" :state="post.ifLike"></like-button>
                    </div>
                    <div class="column-center padding-right-10px">
                        <v-btn elevation="0" @click="setCommentState(true)" icon class="bottom-btn icon-btn">
                            <v-icon size="23" icon="mdi-comment-outline"></v-icon>
                            <v-tooltip activator="parent">添加评论</v-tooltip>
                        </v-btn>
                    </div>
                </div>
            </div>
            <div id="comments-container" class="comments-container surface-card">
                <div class="column-div">
                    <template v-if="replyList.length > 0">
                        <reply-item v-for="comment in replyList" :init-data="comment" @show_parent="getParentReply"
                            @reply="addReply" :post-id="this.post.id" :key="comment.id" @alert="alert"
                            @set_loading="setLoading">
                        </reply-item>
                        <v-btn v-if="!allLoad.reply" :loading="loading.loadReply" :disabled="loading.loadReply"
                            variant="text" class="load-btn" :color="themeColor" @click="loadMoreReply">加载更多</v-btn>
                    </template>
                    <nothing-view v-else
                        icon="mdi-comment-outline" 
                        text="暂无回复" 
                        :icon-size="80"
                        text-size="18px"
                        min-height="300px"></nothing-view>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { globalProperties } from '@/main.js';
import { getCookie } from '@/utils/cookie';
import StarButton from '@/components/star/StarButton.vue';
import AlertButton from '@/components/report/AlertButton.vue';
import { computed, ref } from 'vue';
import SensitiveTextArea from '@/components/common/SensitiveTextArea.vue';
import AvatarName from '@/components/common/AvatarName.vue';
import { extractImageLinksInBrackets, getCancelLoadMsg, getLinkInPost, getLoadMsg, getNormalErrorAlert, getNormalInfoAlert, getNormalSuccessAlert, getNormalWarnAlert, isElementAtBottom, openPage } from '@/utils/other';
import { createReplyUnderPost, getPostDetailById, getReplyDetailById, getReplyListByPostId } from '@/api/modules/post';
import LikeButton from '@/components/common/LikeButton.vue';
import ReplyItem from '@/components/post/ReplyItem.vue';
import DeleteButton from '@/components/common/DeleteButton.vue';
import NothingView from '@/components/common/NothingView.vue';
import { addHistory } from '@/utils/history';
import EmojiPicker from '@/components/common/EmojiPicker.vue';
import ImgCard from '@/components/common/ImgCard.vue';
import PartLoadingView from '@/components/common/PartLoadingView.vue';
import { selfDefinedSessionStorage } from '@/utils/sessionStorage';
import WithLinkContainer from '@/components/common/WithLinkContainer.vue';
import { acquireLock, getLock, releaseLock } from '@/utils/lock';
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
        NothingView,
        EmojiPicker,
        ImgCard,
        PartLoadingView,
        WithLinkContainer,
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
        let userName = getCookie('userName');
        if (userName == null) {
            userName = "游客";
        }
        /**
         * posts list visibility control here
         */
        const ifShowComment = ref(false);
        const ifShowTmpParentReply = ref(false);
        const ifShowDialog = computed(() => {
            return ifShowComment.value || ifShowTmpParentReply.value;
        });
        const userId = getCookie('userId');
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
    beforeRouteLeave(to, from, next) {
        try {
            if (!getCookie("userName")) {
                next();
                return;
            }
            let scanMsg = {};
            scanMsg.scrollTop = document.scrollingElement.scrollTop;
            scanMsg.pageNum = {
                reply: this.replyPageNum,
            }
            let key = 'postScanMsg|' + this.post.id;
            selfDefinedSessionStorage.setItem(key, JSON.stringify(scanMsg));
            next()
        } catch (e) {
            next();
        }
    },
    data() {
        const relativeText = computed(() => {
            if (this.post.relativeLink.includes("course")) {
                return "关联课程";
            } else {
                return "关联文章";
            }
        })
        return {
            inputingComment: '',
            post: {
                id: null,
                title: null,
                content: null,
                starNum: null,
                replyNum: null,
                authorName: null,
                authorId: null,
                relativeLink: null,
                publishTime: null,
            },
            relativeText,
            replyList: [],
            replyPageNum: 1,
            tmpParentReply: null,
            loading: {
                loadReply: false,
                submitReply: false,
            },
            loadState: {
                post: false,
            },
            allLoad: {
                reply: false,
            },
            lastPageNum: null,
        }
    },
    methods: {
        addEmoji(emoji) {
            this.inputingComment += emoji;
        },
        async submitComment() {
            /**
             * need post comment
             */
            if (this.inputingComment == "") {
                this.alert(getNormalWarnAlert("评论内容不能为空"));
                return;
            }
            this.loading.submitReply = true;
            let response = await createReplyUnderPost(this.post.id, this.inputingComment);
            this.loading.submitReply = false;
            if (response.status == 200 || response.status == 201) {
                this.alert(getNormalSuccessAlert("评论成功"));
                this.replyList.unshift({
                    id: response.reply_id,
                    content: this.inputingComment,
                    authorName: getCookie("userName"),
                    authorId: getCookie("userId"),
                    likeNum: 0,
                    publishTime: new Date().toLocaleString(),
                })
                this.setCommentState(false);
            } else {
                this.alert(getNormalErrorAlert(response.message));
            }
        },
        addReply(tmp) {
            this.replyList.unshift(
                tmp
            )
        },
        setLoading(msg) {
            this.$emit('set_loading', msg);
        },
        alert(msg) {
            this.$emit('alert', msg);
        },
        deleteSelf() {
            openPage("router",{
                name: "IndexPage",
            })
        },
        toRelativePage() {
            openPage("url",{url:this.post.relativeLink});
        },
        async loadMoreReply() {
            if (this.allLoad.reply) {
                return;
            }
            await acquireLock('post-load-reply' + this.post.id);
            this.loading.loadReply = true;
            let response = await getReplyListByPostId(this.post.id, this.replyPageNum);
            this.loading.loadReply = false;
            releaseLock('post-load-reply' + this.post.id)
            if (response.status == 200) {
                for (let i = 0; i < response.reply_list.length; i++) {
                    let reply = {
                        id: response.reply_list[i].reply_id,
                        content: response.reply_list[i].reply_content,
                        authorName: response.reply_list[i].replier_name,
                        authorId: response.reply_list[i].replier_id,
                        likeNum: response.reply_list[i].like_count,
                        publishTime: response.reply_list[i].publish_time,
                    }
                    this.replyList.push(reply);
                }
                if (response.reply_list.length == 0) {
                    this.alert(getNormalInfoAlert("没有更多回复了"));
                } else {
                    this.replyPageNum++;
                }
                if (response.total_pages <= response.current_page) {
                    this.allLoad.reply = true;
                }
            } else {
                this.alert(getNormalErrorAlert(response.message));
            }
            while (this.lastPageNum != null && this.lastPageNum.reply > this.replyPageNum) {
                await this.loadMoreReply();
            }
        },
        async getParentReply(id) {
            if (id == null) {
                this.alert(getNormalErrorAlert("无父级回复"));
                return;
            }
            //to ensure the state
            this.setTmpParentReplyState(false);
            this.tmpParentReply = null;

            this.setLoading(getLoadMsg("正在加载..."));
            let response = await getReplyDetailById(id);
            this.setLoading(getCancelLoadMsg());
            if (response.status == 200 || response.status == 201) {
                this.alert(getNormalSuccessAlert("加载成功"));
                this.tmpParentReply = {
                    id: response.reply_detail.reply_id,
                    content: response.reply_detail.reply_content,
                    authorName: response.reply_detail.replier_name,
                    authorId: response.reply_detail.replier_id,
                    likeNum: response.reply_detail.like_count,
                    publishTime: response.reply_detail.publish_time,
                }
                this.setTmpParentReplyState(true);
            } else {
                this.alert(getNormalErrorAlert(response.message));
            }
        },
        closeParentReply() {
            this.setTmpParentReplyState(false);
            this.tmpParentReply = null;
        },
        glideLoad() {
            // prevent load when other load unfinished
            if (getLock('post-load-reply' + this.post.id)) {
                return;
            }
            if (isElementAtBottom(document.getElementById("comments-container"))) {
                this.loadMoreReply();
            }
        },
        async initPost(){
            this.loadState.post = false;
            let response = await getPostDetailById(this.$route.params.id);
            this.loadState.post = true;
            if (response.status == 200) {
                this.post.authorId = response.post_detail.poster_id;
                this.post.authorName = response.post_detail.poster_name;
                this.post.id = response.post_detail.post_id;
                this.post.title = response.post_detail.post_title;
                this.post.content=response.post_detail.post_content;
                this.post.imgList = extractImageLinksInBrackets(this.post.content);
                this.post.relativeLink = getLinkInPost(response.post_detail.post_content);
                this.post.likeNum = response.post_detail.like_count;
                this.post.replyNum = response.post_detail.reply_count;
                this.post.viewNum = response.post_detail.view_count;
                this.post.publishTime = response.post_detail.publish_time;
                this.post.ifLike = response.post_detail.if_like;
                await addHistory("post", this.post.id, this.post.title);
                document.getElementById('web-title').innerText = '帖子 | ' + this.post.title;
            } else {
                this.alert(getNormalErrorAlert(response.message));
                openPage("router",{
                    name: "ErrorPage",
                    params: {
                        reason: response.message
                    }
                });
                return;
            }
        }
    },
    async mounted() {
        this.setLoading(getCancelLoadMsg());
        /**
         * get the route params and fetch data
         */
        if (!this.$route.params.id) {
            openPage("router",{
                name: "ErrorPage",
                params: {
                    reason: "未指定资源参数!"
                }
            })
            return;
        }
        this.post.id=this.$route.params.id;
        await Promise.all([this.initPost(),this.loadMoreReply()])
        /**
         * restore scan state
         */
        let restoreTop=0;
        if (selfDefinedSessionStorage.getItem('postScanMsg|' + this.$route.params.id)) {
            let scanMsg = JSON.parse(selfDefinedSessionStorage.getItem('postScanMsg|' + this.$route.params.id));
            this.lastPageNum = scanMsg.pageNum;
            restoreTop = scanMsg.scrollTop;
            await this.loadMoreReply();
        }else{
            await this.loadMoreReply();
        }
        document.scrollingElement.scrollTop=restoreTop;
        /**
         * add roll listener
         */
        window.addEventListener('scroll', this.glideLoad)
    },
    unmounted() {
        window.removeEventListener('scroll', this.glideLoad);
    },
}
</script>
<style scoped>
.post-dialog {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}
.dialog-layer {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
}
.comment-dialog-card {
    max-width: 520px;
}
.editor-row {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    gap: 12px;
    margin-top: 10px;
}
.comment-textarea {
    flex: 1;
}
.dialog-action-btn {
    min-width: 80px;
    color: #666666;
}
.dialog-action-btn.primary {
    color: var(--theme-color);
}
.parent-reply-layer {
    align-items: flex-start;
}
.parent-reply-wrapper {
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.parent-reply-header {
    display: flex;
    flex-direction: row-reverse;
}
.close-btn {
    color: #8a8a8a;
}
.surface-card {
    border-radius: 12px;
    background-color: #ffffff;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);
}
.detail-panel {
    padding: 12px 16px;
    border-radius: 10px;
    background-color: rgba(0, 0, 0, 0.02);
}
.toolbar {
    box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.06);
    border: 1px solid rgba(0, 0, 0, 0.08);
}
.icon-btn {
    width: 32px;
    height: 32px;
    color: #8a8a8a;
    background-color: transparent;
}
.icon-btn:hover {
    background-color: rgba(0, 0, 0, 0.04);
}
.column-center {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
}

.dialog-bottom-btn-bar {
    padding: 10px;
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

.dialog-card {
    padding: 10px;
    display: flex;
    flex-direction: column;
}

.row-div {
    display: flex;
    flex-direction: row;
    align-items: center;
}

.row-div-scroll {
    margin: 5px;
    display: flex;
    flex-direction: row;
    align-items: center;
    overflow-x: auto;
    width: 100%;
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

.detail-text {
    width: 100%;
    margin-top: 0px;
    margin-bottom: 5px;
    white-space: pre-line;
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
    overflow-x: auto;
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
    overflow-x: auto;
    max-width: 100%;
    display: flex;
    flex-direction: row-reverse;
}

.grey-font {
    min-width: 200px;
    white-space: pre-line;
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
    background-color: white;
}

@media screen and (min-width: 1000px) {
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
        white-space: pre-line;
        word-break: break-all;
        overflow: hidden;
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
    }

    .name-font {
        font-weight: bold;
        width: 400px;
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
        white-space: pre-line;
        word-break: break-all;
        overflow: hidden;
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
        border-radius: 5px;
        margin-bottom: 40px;
    }

    .name-font {
        font-weight: bold;
        width: 40vw;
    }
}
</style>