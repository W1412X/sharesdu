<!--star button-->
<template>
    <v-card class="card" variant="tonal" :color="ifStarType ? themeColor : 'white'">
        <div class="star-item-row">
            <div class="star-item-main" @click="click">
                <div class="div-2">
                    <v-icon :color="ifStarType ? themeColor : 'grey'" :icon="getIcon(this.data.type)" class="item-icon"/>
                    <div class="div-1">
                        <div class="title-container title">
                            {{ data.title }}
                        </div>
                        <div class="time-container text-small">
                            {{ data.time }}
                        </div>
                    </div>
                </div>
            </div>
            <v-btn
                v-if="showUnstar"
                class="star-item-unstar"
                icon
                variant="text"
                size="small"
                :loading="unstarLoading"
                :disabled="unstarLoading"
                aria-label="取消收藏"
                @click.stop="handleUnstar"
            >
                <v-icon size="20" color="#8a8a8a">mdi-star-off-outline</v-icon>
                <v-tooltip activator="parent" location="top">取消收藏</v-tooltip>
            </v-btn>
        </div>
    </v-card>
</template>

<script>
import { globalProperties } from '@/main';
import { formatRelativeTime, getCancelLoadMsg, getLoadMsg, getNormalErrorAlert, getNormalWarnAlert, getReplyContentWithoutHeader, openPage } from '@/utils/other';
import { unstarContent } from '@/api/modules/star';

export default {
    props: {
        initData: {
            type: Object,
            default: () => {
                return {
                    type: null,//article,course,post
                    id: null,
                    title: null,
                    time: null,
                }
            }
        },
        ifStarType: {
            type: Boolean,
            default: true,
        },
        /** 传入收藏夹 ID 时显示取消收藏，并调用带 folder_id 的 unstar */
        folderId: {
            type: [String, Number],
            default: null,
        },
    },
    setup() {
        const themeColor = globalProperties.$themeColor;
        return {
            themeColor,
        }
    },
    data() {
        const data = this.initData;
        if (data.type == 'reply') {
            data.title = getReplyContentWithoutHeader(data.title);
        }
        if (data.time) {
            data.time = formatRelativeTime(data.time);
        }
        return {
            data,
            ifStar: true,
            unstarLoading: false,
        };
    },
    computed: {
        showUnstar() {
            return this.folderId != null && this.folderId !== '';
        },
    },
    components: {
    },
    methods: {
        contentTypeNum() {
            switch (this.data.type) {
                case 'article':
                    return 1;
                case 'course':
                    return 0;
                case 'post':
                    return 2;
                default:
                    return -1;
            }
        },
        async handleUnstar() {
            const t = this.contentTypeNum();
            if (t < 0) {
                this.$emit('alert', getNormalErrorAlert('无法取消该类型的收藏'));
                return;
            }
            this.unstarLoading = true;
            this.$emit('set_loading', getLoadMsg('正在取消收藏...', -1));
            try {
                const res = await unstarContent(t, this.data.id, this.folderId);
                if (res.status === 200 || res.status === 201) {
                    this.$emit('alert', getNormalWarnAlert('取消收藏成功'));
                    this.$emit('unstarred');
                } else {
                    this.$emit('alert', getNormalErrorAlert(res.message || '取消失败'));
                }
            } finally {
                this.unstarLoading = false;
                this.$emit('set_loading', getCancelLoadMsg());
            }
        },
        click() {
            switch (this.data.type) {
                case 'article':
                    openPage("url", { url: "#/article/" + this.data.id });
                    break;
                case 'course':
                    openPage("url", { url: "#/course/" + this.data.id });
                    break;
                case 'post':
                    openPage("url", { url: "#/post/" + this.data.id });
                    break;
                case 'reply':
                    openPage("url", { url: "#/post/" + this.data.postId });
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
                case 'reply':
                    return "mdi-reply-outline";
            }
            return "mdi-star"
        },
    }
}
</script>
<style scoped>
.card {
    display: flex !important;
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
    margin: 0 !important;
}

.star-item-row {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    width: 100%;
    min-width: 0;
}

.star-item-main {
    flex: 1;
    min-width: 0;
    cursor: pointer;
}

.star-item-unstar {
    flex-shrink: 0;
    align-self: center;
    margin-right: 2px;
}

.div-2 {
    width: 100%;
    max-width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    min-width: 0;
    overflow: hidden;
}

.div-1 {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    overflow: hidden;
}

.title-container {
    color: #000;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    max-width: 100%;
}

.time-container {
    color: grey;
    margin-top: 4px;
    font-size: var(--font-size-tiny);
}

.item-icon {
    margin-right: 12px;
    flex-shrink: 0;
}

/* PC 端样式 */
@media screen and (min-width: 1000px) {
    .card {
        padding: 8px 12px;
    }
}

/* 移动端样式 */
@media screen and (max-width: 1000px) {
    .card {
        padding: 6px 10px;
    }
}
</style>
