<!-- PC 端板块项组件 -->
<template>
    <v-card class="card" :variant="data.ifTop?'variant':'none'" :color="data.ifTop?themeColor:'none'" @click="click()">
        <v-chip v-if="data.ifTop" width="100%" variant="tonal" :color="themeColor" class="text-tiny-bold" style="border-radius: 0px;max-height: 28px;width: 100%;justify-content: center;">
            <v-icon size="20">mdi-format-vertical-align-top</v-icon>
            <span style="margin-left: 10px;" class="text-small-bold">置顶</span>
        </v-chip>
        <div class="container">
            <img-card :width="140" :height="130" class="img" :lazy-src="lazyImgUrl" :src="data.coverLink"
                cover aspect-ratio="7/6"></img-card>
            <div class="row-div padding-left-5">
                <div class="title title-container key-text">
                    <with-link-container :init-data="{'content':data.title}" :clickable="false">
                    </with-link-container>
                </div>
                <div class="text-small summary-container key-text">
                    <with-link-container :init-data="{'content':data.summary}" :clickable="false">
                    </with-link-container>
                </div>
                <v-spacer></v-spacer>
                <div class="text-small bottom-bar">
                    <div class="bottom-item section-name" :style="{ color: themeColor }">
                        <v-icon icon="mdi-bulletin-board" size="18" style="margin-top: 2px;"></v-icon>
                        {{ data.sectionName }}
                    </div>
                    <v-spacer></v-spacer>
                    <div class="bottom-item publish-time">
                        <v-icon icon="mdi-clock-outline" size="18" style="margin-top: 2px;"></v-icon>
                        {{ data.publishTime }}
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
import WithLinkContainer from '@/components/common/WithLinkContainer.vue';

export default {
    name: 'SectionItemPc',
    props: {
        initData: {
            type: Object,
            required: true,
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
        click() {
            if (!this.data.id) {
                openPage("url", { url: "#/error/无法找到此资源" });
                return;
            }
            // 跳转到板块编辑页面
            openPage("url", { url: "#/section_editor/" + this.data.id });
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
    cursor: pointer;
}

.card:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
    flex: 1;
    min-width: 0;
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
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-clamp: 1;
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
    width: 100%;
    display: flex;
    flex-direction: row;
    color: #8a8a8a;
    align-items: center;
    margin-top: 12px;
}

.bottom-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 4px;
    margin-right: 20px;
}

.section-name {
    font-weight: 500;
}

@media screen and (max-width: 1000px) {
    .card {
        width: 100vw;
        border-radius: 0;
        border-bottom: 1px solid #eeeeee;
    }
}
</style>

