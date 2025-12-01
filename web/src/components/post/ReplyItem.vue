<template>
    <v-dialog v-model="ifShowDialog" class="reply-dialog">
        <div class="dialog-wrapper">
            <v-card v-if="ifShowReplyEditor" class="dialog-card">
                <div class="title-bold">
                    回复评论
                </div>
                <div class="row-div editor-row">
                    <SensitiveTextArea v-model="replyContent" class="reply-textarea" variant="outlined" density="compact"
                    label="输入评论内容" />
                    <EmojiPicker @emoji="addEmoji"></EmojiPicker>
                </div>
                <div class="dialog-bottom-btn-bar">
                    <v-btn @click="reply" variant="text" class="dialog-action-btn primary">发表</v-btn>
                    <v-btn @click="setReplyEditorState(false)" variant="text" class="dialog-action-btn">取消</v-btn>
                </div>
            </v-card>
        </div>

    </v-dialog>
    <v-card elevation="0" v-if="!ifDeleted" class="container">
        <div v-if="data.postTitle" class="text-medium-bold post-title-div"> {{ '回复帖子: '+data.postTitle }}</div>
        <div v-if="!ifPreview" class="name text-medium meta-row">
            <avatar-name v-if="data.authorId" :initData="{ id: data.authorId, name: data.authorName }"></avatar-name>
            <div class="meta-divider"></div>
            <div class="time text-small muted">
                <v-icon size="16" icon="mdi-clock-outline"></v-icon>
                <span>{{ this.data.publishTime }}</span>
            </div>
        </div>
        <div @click="click" class="comment text-medium content comment-body">
            <span v-if="this.ifChild == true" @click="showParent" class="text-medium-bold"
                :style="{ 'color': themeColor }">{{ parentAuthorName + '： ' }}</span>
            <div class="content-wrapper-container">
                <div ref="contentContainer"
                    :class="['content-wrapper', { collapsed: isCollapsed && showToggle }]">
                    <with-link-container :initData="{'content':data.content}" class="key-text"></with-link-container>
                </div>
                <div v-if="showToggle && isCollapsed" class="content-gradient"></div>
            </div>
            <div v-if="showToggle" class="collapse-toggle text-small" :style="{ color: themeColor }"
                @click.stop="toggleCollapse">
                {{ isCollapsed ? '展开' : '收起' }}
                <v-icon size="16" :icon="isCollapsed ? 'mdi-chevron-down' : 'mdi-chevron-up'"></v-icon>
            </div>
        </div>
        <div class="bottom-bar">
            <div class="bottom-actions text-small">
                <div v-if="!ifPreview" class="bottom-btn-container">
                    <like-button @alert="alert" @set_loading="setLoading" :size="'20'" :id="this.data.id"
                        :state="this.data.ifLike" :type="'reply'"></like-button>
                </div>
                <div class="like-num text-small">
                    {{ this.data.likeNum }}
                </div>
            </div>
            <div class="bottom-time text-small muted" v-if="ifPreview">
                <v-icon size="16" icon="mdi-clock-outline"></v-icon>
                <span>{{ this.data.publishTime }}</span>
            </div>
            <v-spacer></v-spacer>
            <div v-if="!ifPreview" class="bottom-icon-btn">
                <v-btn @click="setReplyEditorState(true)" elevation="0" icon class="icon-btn">
                    <v-icon :size="'23'" icon="mdi-reply-outline"></v-icon>
                </v-btn>
            </div>
            <div v-if="userId != data.authorId" class="bottom-icon-btn">
                <alert-button :size="'20'" :id="this.data.id" :type="'reply'"></alert-button>
            </div>
            <div v-else class="bottom-icon-btn">
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
import { addHeaderToReply, formatRelativeTime, getAuthorNameFromReply, getCancelLoadMsg, getLoadMsg, getNormalErrorAlert, getNormalSuccessAlert, getNormalWarnAlert, getParentReplyIdFromReply, getReplyContentWithoutHeader, openPage } from '@/utils/other';
import { createReplyUnderPost } from '@/api/modules/post';
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
        if (data.publishTime) {
            data.publishTime = formatRelativeTime(data.publishTime);
        }
        return {
            data,
            ifDeleted: false,
            ifChild: false,
            parentAuthorName: null,
            parentReplyId: null,
            childReplys: [],
            replyContent: "",
            isCollapsed: true,
            showToggle: false,
        }
    },
    methods: {
        addEmoji(emoji){
            this.replyContent+=emoji;
        },
        click() {
            if(this.ifPreview){
                openPage("router",{
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
        toggleCollapse() {
            if (!this.showToggle) {
                return;
            }
            this.isCollapsed = !this.isCollapsed;
        },
        evaluateContent() {
            this.$nextTick(() => {
                if (typeof window === 'undefined') {
                    return;
                }
                const el = this.$refs.contentContainer;
                if (!el) {
                    this.showToggle = false;
                    this.isCollapsed = false;
                    return;
                }
                const computedStyle = window.getComputedStyle(el);
                let lineHeightValue = parseFloat(computedStyle.lineHeight);
                if ((!lineHeightValue || isNaN(lineHeightValue)) && computedStyle.fontSize) {
                    const fontSize = parseFloat(computedStyle.fontSize);
                    if (fontSize && !isNaN(fontSize)) {
                        lineHeightValue = fontSize * 1.2;
                    }
                }
                if (!lineHeightValue || isNaN(lineHeightValue)) {
                    this.showToggle = false;
                    this.isCollapsed = false;
                    return;
                }
                const maxVisibleHeight = lineHeightValue * 3 + 1;
                const scrollHeight = el.scrollHeight;
                const needCollapse = scrollHeight - maxVisibleHeight > 1;
                const previousShowToggle = this.showToggle;
                this.showToggle = needCollapse;
                if (!needCollapse) {
                    this.isCollapsed = false;
                } else if (!previousShowToggle) {
                    this.isCollapsed = true;
                }
            });
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
    watch: {
        'data.content': {
            handler() {
                this.evaluateContent();
            },
            immediate: true,
        }
    },
    mounted() {
        this.evaluateContent();
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
.comment-body {
    padding: 12px 14px;
    border-radius: 10px;
}
.content-wrapper {
    width: 100%;
}
.content-wrapper-container{
    position: relative;
    width: 100%;
}
.content-wrapper.collapsed {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    overflow: hidden;
}
.content-gradient{
    pointer-events: none;
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 32px;
    background: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.85) 65%, rgba(255,255,255,1) 100%);
}
.collapse-toggle {
    display: flex;
    align-items: center;
    width: fit-content;
    cursor: pointer;
    margin-top: 6px;
    gap: 2px;
}
.reply-dialog {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
}
.dialog-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
}
.dialog-card {
    padding: 10px;
    display: flex;
    max-width: 400px;
    flex-direction: column;
}
.reply-textarea {
    margin-top: 10px;
    flex: 1;
}
.editor-row {
    gap: 10px;
    align-items: stretch;
}
.dialog-bottom-btn-bar {
    display: flex;
    flex-direction: row-reverse;
    gap: 8px;
    margin-top: 12px;
}
.dialog-action-btn {
    min-width: 72px;
    color: #666666;
}
.dialog-action-btn.primary {
    color: var(--theme-color);
}
.meta-row {
    display: flex;
    align-items: center;
    gap: 12px;
    color: #666666;
}
.meta-divider {
    width: 1px;
    height: 14px;
    background-color: rgba(0, 0, 0, 0.08);
}
.muted {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #8a8a8a;
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
.bottom-actions {
    display: flex;
    align-items: center;
    gap: 10px;
}
.bottom-time {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-left: 10px;
}
.bottom-icon-btn {
    margin-right: 10px;
    display: flex;
}
.icon-btn {
    width: 28px;
    height: 28px;
    color: #8a8a8a;
    background-color: transparent;
}
.icon-btn:hover {
    background-color: rgba(0, 0, 0, 0.05);
}

@media screen and (min-width: 1000px) {
    .content-gradient{
        background: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.9) 65%, rgba(255,255,255,1) 100%);
    }
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
        transition: background-color 0.2s ease;
        width: 880px;
        display: flex;
        flex-direction: column;
        padding-top: 10px;
        padding-left: 10px;
        padding-right: 10px;
        border-bottom: 0.5px #dddddd solid;
        border-radius: 0px;
    }
    .container:hover {
        background-color: rgba(0, 0, 0, 0.04);
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
    .content-gradient{
        background: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.85) 65%, rgba(255,255,255,1) 100%);
    }
    .container {
        width: 100%;
        transition: background-color 0.2s ease;
        display: flex;
        flex-direction: column;
        padding-top: 10px;
        padding-left: 10px;
        padding-right: 10px;
        border-bottom: 0.5px #dddddd solid;
        border-radius: 0px;
    }
    .container:hover {
        background-color: rgba(0, 0, 0, 0.04);
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