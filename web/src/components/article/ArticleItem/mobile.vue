<!-- 移动端文章项组件 -->
<template>
    <v-card class="card" :variant="data.ifTop?'variant':'none'" :color="data.ifTop?themeColor:'none'" @click="click()">
        <div v-if="data.ifTop" elevation="0" width="100%" class="text-tiny-bold" :style="{'border-radius': '0px', 'height': '2px', 'width': '100%', 'justify-content': 'center','background-color': themeColor}">
        </div>
        <div class="container">
            <img-card :width="90" :clickable="false" :height="90" class="img" :lazy-src="lazyImgUrl" :src="data.coverLink"
                cover aspect-ratio="1/1" @click="handleImgClick"></img-card>
            <div class="row-div padding-left-5">
                <div class="text-title-bold title-container key-text">
                    <with-link-container :init-data="{'content':data.title,'keywords':this.searchQuery}" :clickable="false">
                    </with-link-container>
                </div>
                <div class="text-small summary-container key-text">
                    <with-link-container :init-data="{'content':data.summary,'keywords':this.searchQuery}" :clickable="false">
                    </with-link-container>
                </div>
                <div class="text-tiny bottom-bar-mobile">
                    <span v-if="data.authorName != null" class="mobile-author">@{{ data.authorName }}</span>
                    <v-spacer></v-spacer>
                    <template v-if="mobileStatsText">
                        <span v-if="data.authorName != null" class="mobile-separator"></span>
                        <span class="mobile-stats">{{ mobileStatsText }}</span>
                    </template>
                </div>
            </div>
        </div>
    </v-card>
</template>
<script>
import { globalProperties } from '@/main';
import { openPage } from '@/utils/other';
import { defineAsyncComponent } from 'vue';
import WithLinkContainer from '../../common/WithLinkContainer.vue';

export default {
    name: 'ArticleItemMobile',
    props: {
        initData: {
            type: Object,
            required: true,
        },
        searchQuery: {
            type: Array,
            default: () => [],
        }
    },
    setup() {
        const lazyImgUrl = globalProperties.$lazyImgUrl;
        const themeColor = globalProperties.$themeColor;
        return {
            themeColor,
            lazyImgUrl,
        }
    },
    data() {
        const data = this.initData;
        return {
            data,
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
            if (this.data.viewNum != null) {
                stats.push('浏览 '+formatNumber(this.data.viewNum));
            }
            if (this.data.starNum != null) {
                stats.push('收藏 '+formatNumber(this.data.starNum));
            }
            if (this.data.hotScore != null) {
                stats.push('热度 '+formatNumber(this.data.hotScore));
            }
            if (this.data.replyNum != null) {
                stats.push('回复 '+formatNumber(this.data.replyNum));
            }
            return stats.join(' · ');
        },
    },
    components: {
        ImgCard: defineAsyncComponent(() => import('@/components/common/ImgCard.vue')),
        WithLinkContainer,
    },
    methods: {
        handleImgClick() {
            this.click();
        },
        click() {
            if (!this.data.id) {
                openPage("url", { url: "#/error/无法找到此资源" });
                return;
            }
            openPage("url", { url: "#/article/" + this.data.id });
        }
    }
}
</script>
<style scoped>
.padding-left-5 {
    padding: 5px;
}

.card {
    width: 100vw;
    margin-top: 4px;
    border-radius: 0;
    border-bottom: 1px solid #eeeeee;
}

.container {
    display: flex;
    flex-direction: row;
    padding: 3px;
    gap: 12px;
}

.row-div {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-width: 0; /* 允许 flex 子元素收缩 */
}

.title-container {
    flex: 0 0 auto;
    max-width: 90%;
    margin-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.summary-container {
    flex: 1;
    color: #8a8a8a;
    padding-top: 4px;
    margin-bottom: 4px;
    white-space: normal;
    word-break: break-all;
    overflow: hidden;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    text-overflow: ellipsis;
}

.bottom-bar-mobile {
    flex: 0 0 auto;
    display: flex;
    flex-direction: row;
    align-items: center;
    color: #8a8a8a;
    margin-top: auto;
    padding-top: 4px;
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

.img {
    flex-shrink: 0;
    border-radius: 8px;
    overflow: hidden;
}
</style>

