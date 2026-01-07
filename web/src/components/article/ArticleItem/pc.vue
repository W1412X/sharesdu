<!-- PC 端文章项组件 -->
<template>
    <v-card class="card" :variant="data.ifTop?'variant':'none'" :color="data.ifTop?themeColor:'none'" @click="click()">
        <v-chip v-if="data.ifTop" width="100%" variant="tonal" :color="themeColor" class="text-tiny-bold" style="border-radius: 0px;max-height: 28px;width: 100%;justify-content: center;">
            <v-icon size="20">mdi-format-vertical-align-top</v-icon>
            <span style="margin-left: 10px;" class="text-small-bold">置顶</span>
        </v-chip>
        <div class="container">
            <img-card :width="140" :clickable="false" :height="130" class="img" :lazy-src="lazyImgUrl" :src="data.coverLink"
                cover aspect-ratio="7/6" @click="handleImgClick"></img-card>
            <div class="row-div padding-left-5">
                <div class="text-title title-container key-text">
                    <with-link-container :init-data="{'content':data.title,'keywords':this.searchQuery}" :clickable="false">
                    </with-link-container>
                </div>
                <div class="text-small summary-container key-text">
                    <with-link-container :init-data="{'content':data.summary,'keywords':this.searchQuery}" :clickable="false">
                    </with-link-container>
                </div>
                <v-spacer></v-spacer>
                <div class="text-small bottom-bar">
                    <div v-if="data.authorName != null" class="bottom-item">
                    @{{ data.authorName }}
                    </div>
                    <v-spacer></v-spacer>
                    <div v-if="data.starNum != null" class="bottom-item">
                        <v-icon icon="mdi-star" size="20"></v-icon>
                        {{ data.starNum }}
                    </div>
                    <div v-if="data.hotScore != null" class="bottom-item">
                        <v-icon icon="mdi-fire" size="20"></v-icon>
                        {{ data.hotScore }}
                    </div>
                    <div v-if="data.replyNum != null" class="bottom-item">
                        <v-icon icon="mdi-message-reply" size="18"></v-icon>
                        {{ data.replyNum }}
                    </div>
                    <div v-if="data.viewNum != null" class="bottom-item">
                        <v-icon icon="mdi-eye" size="18" style="margin-top: 2px;"></v-icon>
                        {{ data.viewNum }}
                    </div>
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
    name: 'ArticleItemPc',
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
    width: 750px;
    margin-top: 5px;
}

.container {
    padding: 5px;
    display: flex;
    flex-direction: row;
    height: 130px;
}

.row-div {
    display: flex;
    flex-direction: column;
}

.img {
    margin: 5px;
    max-width: 150px;
    max-height: 120px;
    flex-shrink: 0;
    border-radius: 4px;
    overflow: hidden;
}

.title-container {
    max-width: 550px;
    height: 27px;
    margin-bottom: 5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.summary-container {
    max-width: 590px;
    white-space: normal;
    word-break: break-all;
    overflow: hidden;
    color: #8a8a8a;
    line-height: 1.2;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    text-overflow: ellipsis;
}

.bottom-bar {
    width: 580px;
    display: flex;
    flex-direction: row;
    color: #8a8a8a;
    align-items: center;
    margin-top: 12px;
}

.bottom-item {
    display: flex;
    flex-direction: row;
    margin-right: 20px;
}
</style>

