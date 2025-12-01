<template>
    <div class="container">
        <div class="row-div">
            <avatar-name v-if="data.authorId" :initData="{
                name:data.authorName,
                id:data.authorId
            }"></avatar-name>
        </div>
        <div style="display: flex; align-items: center">
            <v-rating :model-value="data.score" size="small" density="compact"
                class="rating-div"
                :color="themeColor" :disabled="true"></v-rating>
        </div>
        <div class="text-medium comment-expand-wrapper">
            <div class="comment-expand-container">
                <div ref="commentContent" :class="['comment-expand', 'support-line-feed', { collapsed: isContentCollapsed && showContentToggle }]">
                    <with-link-container :initData="{
                        'content':data.comment
                    }"></with-link-container>
                </div>
                <div v-if="showContentToggle && isContentCollapsed" class="comment-gradient"></div>
            </div>
            <div v-if="showContentToggle" class="comment-collapse-toggle text-small" :style="{ color: themeColor }"
                @click.stop="toggleContentCollapse">
                {{ isContentCollapsed ? '展开' : '收起' }}
                <v-icon size="18" :icon="isContentCollapsed ? 'mdi-chevron-down' : 'mdi-chevron-up'"></v-icon>
            </div>
        </div>
        <div style="display:flex;flex-direction: row;margin-top:5px;color:#8a8a8a">
            <span class="text-small">{{ data.time }}</span>
            <v-spacer></v-spacer>
            <!--
            <like-button :id="data.id" :type="'evaluation'" style="margin-right:10px;"></like-button>
            -->
            <alert-button :id="data.id" :type="'evaluation'"></alert-button>
        </div>
    </div>
</template>
<script>
import AlertButton from '@/components/report/AlertButton.vue';
import AvatarName from '@/components/common/AvatarName';
import { globalProperties } from '@/main';
import { formatRelativeTime } from '@/utils/other';
import WithLinkContainer from '../common/WithLinkContainer.vue';
export default {
    name: 'CourseComment',
    props: {
        initData: {
            type: Object,
            default: function () {
                return {
                    id: null,
                    authorName: null,
                    authorProfileUrl:null,
                    authorId:null,
                    score: null,
                    comment: null,
                    time: null,
                }
            }
        }
    },
    components: {
        AlertButton,
        AvatarName,
        WithLinkContainer,
    },
    setup() {
        const themeColor=globalProperties.$themeColor;
        return {
            themeColor,
            deviceType: globalProperties.$deviceType,
        }
    },
    data() {
        const data=this.initData;
        if (data.time) {
            data.time = formatRelativeTime(data.time);
        }
        return {
            data,
            isContentCollapsed: true,
            showContentToggle: false,
        }
    },
    methods: {
        toggleContentCollapse() {
            if (!this.showContentToggle) {
                return;
            }
            this.isContentCollapsed = !this.isContentCollapsed;
        },
        evaluateCommentContent() {
            this.$nextTick(() => {
                if (typeof window === 'undefined') {
                    return;
                }
                const el = this.$refs.commentContent;
                if (!el) {
                    this.showContentToggle = false;
                    this.isContentCollapsed = false;
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
                    this.showContentToggle = false;
                    this.isContentCollapsed = false;
                    return;
                }
                const maxVisibleHeight = lineHeightValue * 3 + 1;
                const scrollHeight = el.scrollHeight;
                const needCollapse = scrollHeight - maxVisibleHeight > 1;
                const previousShowToggle = this.showContentToggle;
                this.showContentToggle = needCollapse;
                if (!needCollapse) {
                    this.isContentCollapsed = false;
                } else if (!previousShowToggle) {
                    this.isContentCollapsed = true;
                }
            });
        }
    },
    watch: {
        'data.comment': {
            handler() {
                this.evaluateCommentContent();
            },
            immediate: true,
        }
    },
    mounted() {
        this.evaluateCommentContent();
    }
}
</script>
<style scoped>
.row-div{
    display: flex; 
    flex-direction: row;
}
.name{
    margin-left: 10px;
    display: flex;
    align-items: center;
}
.rating-div{
    margin-top: 0px;
    margin-bottom: 2px;
    margin-left: 5px;
}
.comment-expand-wrapper{
    width: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
    cursor: pointer;
}
.comment-expand-container{
    position: relative;
    width: 100%;
}
.comment-expand{
    color: #6a6a6a;
    line-height: 1.2;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    word-break: break-word;
    white-space: pre-line;
}
.comment-expand.collapsed{
    -webkit-line-clamp: 3;
    line-clamp: 3;
    overflow: hidden;
}
.comment-gradient{
    pointer-events: none;
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 32px;
    background: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.85) 65%, rgba(255,255,255,1) 100%);
}
.comment-collapse-toggle{
    display: flex;
    align-items: center;
    width: fit-content;
    cursor: pointer;
    margin-top: 4px;
    gap: 2px;
}
@media screen and (min-width: 1000px) {
    .container {
        width: 800px;
        border-top: #8a8a8a solid 1px;
        display: flex;
        flex-direction: column;
        padding: 10px;
        background-color: #ffffff;
    }
    .comment-gradient{
        background: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.9) 65%, rgba(255,255,255,1) 100%);
    }
}

@media screen and (max-width: 1000px) {
    .container {
        width: 100vw;
        border-top: #8a8a8a solid 1px;
        display: flex;
        flex-direction: column;
        padding: 10px;
        background-color: #ffffff;
    }
    .comment-gradient{
        background: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.85) 65%, rgba(255,255,255,1) 100%);
    }
}
</style>