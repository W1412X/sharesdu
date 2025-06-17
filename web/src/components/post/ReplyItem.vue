<template>
    <v-dialog v-model="ifShowDialog"
        style="display: flex;flex-direction: row;align-items: center;justify-content: center;width: 100%;height: 100%;">
        <div style="width: 100%;height:100%;justify-content: center;display: flex">
            <v-card v-if="ifShowReplyEditor" class="dialog-card">
                <div class="title-bold">
                    回复评论
                </div>
                <div class="row-div">
                    <SensitiveTextArea v-model="replyContent" style="margin-top: 10px;" variant="outlined" density="compact"
                    label="输入评论内容" />
                    <EmojiPicker @emoji="addEmoji"></EmojiPicker>
                </div>
                <div class="dialog-bottom-btn-bar">
                    <v-btn @click="reply" variant="text">发表</v-btn>
                    <v-btn @click="setReplyEditorState(false)" variant="text">取消</v-btn>
                </div>
            </v-card>
        </div>

    </v-dialog>
    <v-card elevation="0" v-if="!ifDeleted" class="container">
        <div v-if="data.postTitle" class="text-medium-bold post-title-div"> {{ '回复帖子: '+data.postTitle }}</div>
        <div v-if="!ifPreview" class="name text-medium">
            <avatar-name v-if="data.authorId" :initData="{ id: data.authorId, name: data.authorName }"></avatar-name>
        </div>
        <div @click="click" class="comment text-medium content">
            <span v-if="this.ifChild == true" @click="showParent" class="text-medium-bold"
                :style="{ 'color': themeColor }">{{ parentAuthorName + '： ' }}</span>
            <with-link-container :initData="{'content':data.content}" class="key-text"></with-link-container>
        </div>
        <div class="bottom-bar">
            <div class="time text-small">
                <v-icon size="18" icon="mdi-clock-outline" style="margin-right: 5px;"></v-icon>
                <span>{{ this.data.publishTime }}</span>
            </div>
            <v-spacer></v-spacer>
            <div v-if="!ifPreview" class="bottom-btn-container">
                <like-button @alert="alert" @set_loading="setLoading" :size="'20'" :id="this.data.id"
                    :state="this.data.ifLike" :type="'reply'"></like-button>
            </div>
            <div class="like-num text-small">
                {{ this.data.likeNum }}
            </div>
            <div v-if="!ifPreview" style="margin-right: 10px;">
                <v-btn @click="setReplyEditorState(true)" elevation="0" icon :style="{
                    'width': '20px',
                    'height': '20px',
                    'color': '#8a8a8a',
                    'background-color': 'rgba(0,0,0,0)',
                    'margin-bottom': '5px'
                }">
                    <v-icon :size="'23'" icon="mdi-reply-outline"></v-icon>
                </v-btn>
            </div>
            <div v-if="userId != data.authorId" style="margin-right: 10px;">
                <alert-button :size="'20'" :id="this.data.id" :type="'reply'"></alert-button>
            </div>
            <div v-else style="margin-right: 10px;">
                <delete-button @delete="deleteSelf" :id="this.data.id" :type="'reply'" :size="20" @alert="alert"
                    @set_loading="setLoading"></delete-button>
            </div>
        </div>
    </v-card>
</template>
<script>
import AlertButton from '@/components/report/AlertButton.vue';
import LikeButton from '@/components/common/LikeButton.vue';
import AvatarName from '@/components/common/AvatarName.vue';
import { getCookie } from '@/utils/cookie';
import DeleteButton from '@/components/common/DeleteButton.vue';
import { globalProperties } from '@/main';
import { computed, ref } from 'vue';
import SensitiveTextArea from '@/components/common/SensitiveTextArea.vue';
import { addHeaderToReply, getAuthorNameFromReply, getCancelLoadMsg, getLoadMsg, getNormalErrorAlert, getNormalSuccessAlert, getNormalWarnAlert, getParentReplyIdFromReply, getReplyContentWithoutHeader } from '@/utils/other';
import { createReplyUnderPost } from '@/axios/post';
import EmojiPicker from '@/components/common/EmojiPicker.vue';
import WithLinkContainer from '../common/WithLinkContainer.vue';
export default {
    name: 'ReplyItem',
    props: {
        initData: {
            type: Object,
            default: () => {
                return {
                    id: null,
                    authorName: null,
                    publishTime: null,
                    likeNum: null,
                    content: null,
                    authorId: null,
                }
            }
        },
        postId: {
            type: String,
            default: null
        },
        ifPreview:{
            type: Boolean,
            default: false,
        },
    },
    setup() {
        const themeColor = globalProperties.$themeColor;
        const userId = getCookie("userId");
        const ifShowReplyEditor = ref(false);
        const ifShowDialog = computed(() => {
            return ifShowReplyEditor.value;
        })
        const setReplyEditorState = (state) => {
            ifShowReplyEditor.value = state;
        }
        return {
            userId,
            themeColor,
            ifShowDialog,
            ifShowReplyEditor,
            setReplyEditorState,
        };
    },
    components: {
        AlertButton,
        LikeButton,
        AvatarName,
        DeleteButton,
        SensitiveTextArea,
        EmojiPicker,
        WithLinkContainer,
    },
    data() {
        const data = this.initData;
        return {
            data,
            ifDeleted: false,
            ifChild: false,
            parentAuthorName: null,
            parentReplyId: null,
            childReplys: [],
            replyContent: "",
        }
    },
    methods: {
        addEmoji(emoji){
            this.replyContent+=emoji;
        },
        click() {
            if(this.ifPreview){
                this.$router.push({
                    name: 'PostPage',
                    params: {
                        id: this.data.id,
                    }
                });
            }
        },
        alert(msg) {
            this.$emit('alert', msg);
        },
        setLoading(msg) {
            this.$emit('set_loading', msg);
        },
        deleteSelf() {
            this.ifDeleted = true;
        },
        showParent() {
            this.$emit('show_parent', this.parentReplyId);
        },
        async reply() {
            if (this.replyContent.length <= 5) {
                this.alert(getNormalWarnAlert("评论内容过短"));
                return;
            }
            let content = addHeaderToReply(this.replyContent, this.data.authorName, this.data.id);
            this.setLoading(getLoadMsg("正在提交评论..."));
            let response = await createReplyUnderPost(this.postId, content, this.data.id);
            this.setLoading(getCancelLoadMsg());
            if (response.status == 200 || response.status == 201) {
                this.alert(getNormalSuccessAlert("评论成功"));
                this.replyContent = "";
                this.$emit("reply", {
                    id: response.reply_id,
                    content: content,
                    authorName: getCookie("userName"),
                    authorId: getCookie("userId"),
                    likeNum: 0,
                    publishTime: new Date().toLocaleString(),
                })
                this.setReplyEditorState(false);
            } else {
                this.alert(getNormalErrorAlert(response.message));
            }
        }
    },
    async created() {
        //deal with the reply with parent  
        if (this.data.content.startsWith("@")) {
            try {
                this.parentAuthorName = getAuthorNameFromReply(this.data.content);
                this.parentReplyId = getParentReplyIdFromReply(this.data.content);
                this.data.content = getReplyContentWithoutHeader(this.data.content);
                this.ifChild = true;
            } catch (e) {
                return;
            }
        }
    }
}
</script>
<style scoped>
.bottom-bar {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-top: 5px;
}

.bottom-line {
    margin-top: 5px;
    border-bottom: #8a8a8a 1px solid;
}
.row-div{
    display: flex;
    flex-direction: row;
    align-items: center;
}
.column-center {
    display: flex;
    flex-direction: row;
    align-items: center;
}
.content{
    white-space: pre-line;
}
.dialog-card {
    padding: 10px;
    display: flex;
    max-width: 400px;
    flex-direction: column;
}

.dialog-bottom-btn-bar {
    display: flex;
    flex-direction: row-reverse;
}

.like-num {
    display: flex;
    align-items: center;
    height: 100%;
    margin-left: 3px;
    margin-right: 15px;
    margin-top: 2px;
    max-width: 100px;
    align-items: center;
    color: grey;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

@media screen and (min-width: 1000px) {
    .post-title-div{
        color:grey;
        max-width: 80%;
        margin-top: 5px;
        margin-bottom: 5px;
        width: fit-content;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .container {
        width: 100%;
        display: flex;
        flex-direction: column;
        padding-top: 10px;
        padding-left: 10px;
        padding-right: 10px;
        border-bottom: 0.5px #dddddd solid;
        border-radius: 0px;
    }

    .name {
        width: 100%;
        display: flex;
        margin-bottom: 5px;
    }

    .time {
        flex-direction: row;
        display: flex;
        color: grey;
        width: fit-content;
        margin-right: 5px;
        align-items: center;
    }
}

@media screen and (max-width: 1000px) {
    .container {
        width: 100%;
        display: flex;
        flex-direction: column;
        padding-top: 10px;
        padding-left: 10px;
        padding-right: 10px;
        border-bottom: 0.5px #dddddd solid;
        border-radius: 0px;
    }
    .post-title-div{
        color:grey;
        margin-top: 5px;
        margin-bottom: 5px;
        max-width: 80vw;
        width: fit-content;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .name {
        width: 100%;
        display: flex;
        margin-bottom: 5px;
    }

    .time {
        flex-direction: row;
        display: flex;
        margin-top: 5px;
        color: grey;
        width: fit-content;
        margin-right: 5px;
        align-items: center;
    }
}
</style>