<!-- 移动端帖子项组件 -->
<template>
    <v-card class="card" @click="click()" :variant="data.ifTop?'variant':'none'" :color="data.ifTop?themeColor:'none'" elevation="0">
        <div v-if="initData.ifTop" elevation="0" width="100%" class="text-tiny-bold" :style="{'border-radius': '0px', 'height': '2px', 'width': '100%', 'justify-content': 'center','background-color': themeColor}">
        </div>
        <div class="container">
            <div class="author-container">
                <avatar-name :initData="{id:data.authorId,name:data.authorName}"></avatar-name>
            </div>
            <div class="text-title-bold title-container key-text">
                <with-link-container :init-data="{'content':data.title,'keywords':this.searchQuery}" :clickable="false">
                </with-link-container>
            </div>
            <div class="text-medium detail-expand-wrapper">
                <div class="detail-expand-container">
                    <div ref="detailContent"
                        :class="['detail-expand', 'key-text', 'link-text', { collapsed: isContentCollapsed && showContentToggle }]">
                        <with-link-container :init-data="{'content':data.content,'keywords':this.searchQuery}" :clickable="false"
                            :type="'post'">
                        </with-link-container>
                    </div>
                    <div v-if="showContentToggle && isContentCollapsed" class="detail-gradient"></div>
                </div>
                <div v-if="showContentToggle" class="collapse-toggle text-tiny" :style="{ color: themeColor }"
                    @click.stop="toggleContentCollapse">
                    {{ isContentCollapsed ? '展开' : '收起' }}
                    <v-icon size="14" :icon="isContentCollapsed ? 'mdi-chevron-down' : 'mdi-chevron-up'"></v-icon>
                </div>
            </div>
            <grid-image-gallery 
                v-if="data.imgList && data.imgList.length > 0"
                :image-list="data.imgList"
                @image-click="handleImageClick"
            ></grid-image-gallery>
            <!-- 图片查看器 -->
            <image-viewer
                v-model="showImageViewer"
                :image-list="data.imgList"
                :initial-index="currentImageIndex"
                @close="showImageViewer = false"
            ></image-viewer>
            <div class="text-tiny bottom-bar-mobile">
                <template v-if="mobileStatsText">
                    <v-spacer></v-spacer>
                    <span class="mobile-stats">{{ mobileStatsText }}</span>
                </template>
            </div>
        </div>
    </v-card>
</template>
<script>
import { globalProperties } from '@/main';
import { ref } from 'vue';
import { copy, extractImageLinksInBrackets, getLinkInPost, getNormalErrorAlert, getNormalWarnAlert, openPage } from '@/utils/other';
import GridImageGallery from '@/components/common/GridImageGallery/index.vue';
import ImageViewer from '@/components/common/ImageViewer.vue';
import { setPostTopInArticle, setPostTopInCourse } from '@/api/modules/top';
import WithLinkContainer from '../../common/WithLinkContainer.vue';
import AvatarName from '../../common/AvatarName';
export default {
    name: 'PostItemMobile',
    components: {
        GridImageGallery,
        ImageViewer,
        WithLinkContainer,
        AvatarName,
    },
    props: {
        initData: {
            type: Object,
            required: true,
        },
        ifParentAuthor: {
            type: Boolean,
            default: false,
        },
        searchQuery: {
            type: Array,
            default: () => [],
        }
    },
    setup() {
        const themeColor = globalProperties.$themeColor;
        const loadState = ref(false);
        const setLoadState = (state) => {
            loadState.value = state;
        }
        return {
            themeColor,
            loadState,
            setLoadState,
        }
    },
    data() {
        return {
            data: {},
            loading: {
                top: false,
                untop: false,
            },
            parent: {
                type: null,
                id: null,
            },
            isContentCollapsed: true,
            showContentToggle: false,
            showImageViewer: false,
            currentImageIndex: 0,
        }
    },
    computed: {
        // 移动端统计信息文字（点分隔）
        mobileStatsText() {
            const formatNumber = (num) => {
                if (!num && num !== 0) return '';
                if (num < 1000) return num.toString();
                if (num < 10000) return (num / 1000).toFixed(1) + 'k';
                return (num / 10000).toFixed(1) + 'w';
            };
            
            const stats = [];
            if (this.data.likeNum != null) {
                stats.push('点赞 ' + formatNumber(this.data.likeNum));
            }
            if (this.data.viewNum != null) {
                stats.push('浏览 ' + formatNumber(this.data.viewNum));
            }
            if (this.data.replyNum != null) {
                stats.push('回复 ' + formatNumber(this.data.replyNum));
            }
            return stats.join(' · ');
        },
    },
    methods: {
        alert(msg) {
            this.$emit('alert', msg);
        },
        click() {
            if (this.data.id == null) {
                openPage("router", {
                    name: 'ErrorPage',
                    params: {
                        reason: "未指定资源！"
                    }
                })
                return;
            }
            openPage("url", { url: "#/post/" + this.data.id })
        },
        async top() {
            this.loading.top = true;
            let response = null;
            if (this.parent.type && this.parent.id) {
                switch (this.parent.type) {
                    case 'article':
                        response = await setPostTopInArticle(this.data.id, true);
                        break;
                    case 'course':
                        response = await setPostTopInCourse(this.data.id, true);
                        break;
                    default:
                        response = {
                            status: -1,
                            message: "type error",
                        }
                }
                if (response.status == 200) {
                    this.$emit("set-post-top", {
                        id: this.data.id,
                        top: true,
                    });
                } else {
                    this.alert(getNormalErrorAlert(response.message))
                }
            } else {
                this.alert(getNormalWarnAlert("请设置父级类型和父级ID"));
            }
            this.loading.top = false;
        },
        async unTop() {
            this.loading.untop = true;
            let response = null;
            if (this.parent.type && this.parent.id) {
                switch (this.parent.type) {
                    case 'article':
                        response = await setPostTopInArticle(this.data.id, false);
                        break;
                    case 'course':
                        response = await setPostTopInCourse(this.data.id, false);
                        break;
                    default:
                        response = {
                            status: -1,
                            message: "type error",
                        }
                }
                if (response.status == 200) {
                    this.$emit("set-post-top", {
                        id: this.data.id,
                        top: false,
                    });
                } else {
                    this.alert(getNormalErrorAlert(response.message))
                }
            } else {
                this.alert(getNormalWarnAlert("请设置父级类型和父级ID"));
            }
            this.loading.untop = false;
        },
        toggleContentCollapse() {
            if (!this.showContentToggle) {
                return;
            }
            this.isContentCollapsed = !this.isContentCollapsed;
        },
        evaluateDetailContent() {
            this.$nextTick(() => {
                if (typeof window === 'undefined') {
                    return;
                }
                const el = this.$refs.detailContent;
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
                        lineHeightValue = fontSize * 1.4;
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
        },
        handleImageClick({ index }) {
            this.currentImageIndex = index;
            this.showImageViewer = true;
        }
    },
    watch: {
        'data.content': {
            handler() {
                this.evaluateDetailContent();
            },
            immediate: true,
        }
    },
    mounted() {
        this.evaluateDetailContent();
    },
    beforeMount() {
        this.data = copy(this.initData);
        let link = getLinkInPost(this.data.content);
        let imgList = extractImageLinksInBrackets(this.data.content);
        this.data.link = link;
        this.data.imgList = imgList;
        if (link) {
            this.parent.type = link.split('/')[1];
            this.parent.id = link.split('/')[2];
        }
    },
}
</script>
<style scoped>
.detail-expand-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
}

.detail-expand.collapsed {
    -webkit-line-clamp: 3;
    line-clamp: 3;
    overflow: hidden;
}

.detail-expand-container {
    position: relative;
    width: 100%;
}

.detail-gradient {
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
    margin-top: 4px;
    gap: 2px;
}


.card {
    border-bottom: 0.5px solid #eeeeee;
    border-radius: 0px;
    width: 100vw;
    margin-top: 4px;
    cursor: pointer;
}

.container {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 8px 12px;
    gap: 6px;
}

.author-container {
    padding-bottom: 4px;
}

.title-container {
    flex: 0 0 auto;
    max-width: 100%;
    line-height: 1.3;
    max-height: 2.6em;
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    text-overflow: ellipsis;
}

.detail-expand {
    color: #8a8a8a;
    white-space: pre-line;
    word-break: break-all;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    text-overflow: ellipsis;
}

.bottom-bar-mobile {
    flex: 0 0 auto;
    display: flex;
    flex-direction: row;
    align-items: center;
    color: #8a8a8a;
    padding-top: 2px;
    line-height: 1.2;
}

.mobile-author {
    color: rgba(0, 0, 0, 0.6);
    font-weight: 500;
}

.mobile-separator {
    margin: 0 6px;
    color: #8a8a8a;
}

.mobile-stats {
    color: #8a8a8a;
}
</style>

