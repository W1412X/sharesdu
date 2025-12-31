<!-- 移动端板块项组件 -->
<template>
    <v-card class="card" :variant="data.ifTop?'variant':'none'" :color="data.ifTop?themeColor:'none'" @click="click()">
        <div v-if="data.ifTop" elevation="0" width="100%" class="text-tiny-bold" :style="{'border-radius': '0px', 'height': '2px', 'width': '100%', 'justify-content': 'center','background-color': themeColor}">
        </div>
        <div class="container">
            <img-card :width="90" :height="90" class="img" :lazy-src="lazyImgUrl" :src="data.coverLink"
                cover aspect-ratio="1/1"></img-card>
            <div class="row-div padding-left-5">
                <div class="text-title-bold title-container key-text">
                    <with-link-container :init-data="{'content':data.title}" :clickable="false">
                    </with-link-container>
                </div>
                <div class="text-small summary-container key-text">
                    <with-link-container :init-data="{'content':data.summary}" :clickable="false">
                    </with-link-container>
                </div>
                <div class="text-tiny bottom-bar-mobile">
                    <div class="section-name-mobile">
                        <v-icon icon="mdi-bulletin-board" size="14"></v-icon>
                        <span>{{ data.sectionName }}</span>
                    </div>
                    <v-spacer></v-spacer>
                    <div class="publish-time-mobile">
                        <v-icon icon="mdi-clock-outline" size="14"></v-icon>
                        <span>{{ data.publishTime }}</span>
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
    name: 'SectionItemMobile',
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
    width: 100vw;
    margin-top: 4px;
    border-radius: 0;
    border-bottom: 1px solid #eeeeee;
    cursor: pointer;
}

.card:active {
    background-color: rgba(0, 0, 0, 0.05);
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
    min-width: 0;
}

.title-container {
    flex: 0 0 auto;
    max-width: 100%;
    margin-bottom: 2px;
    line-height: 1.1;
    max-height: 2.8em;
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
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

.section-name-mobile {
    display: flex;
    align-items: center;
    gap: 4px;
    font-weight: 500;
}

.publish-time-mobile {
    display: flex;
    align-items: center;
    gap: 4px;
}

.img {
    flex-shrink: 0;
    border-radius: 8px;
    overflow: hidden;
}
</style>

