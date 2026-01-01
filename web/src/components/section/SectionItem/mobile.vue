<!-- 移动端板块项组件 - 小红书风格 -->
<template>
    <v-card class="section-card" @click="handleClick">
        <!-- 图片区域 -->
        <div class="image-container">
            <img-card 
                :width="1000" 
                :height="750" 
                @click="handleImgClick"
                :lazy-src="lazyImgUrl" 
                :src="data.coverLink"
                :clickable="false"
                cover 
                aspect-ratio="4/3"
            ></img-card>
        </div>
        
        <!-- 信息区域 -->
        <div class="info-container">
            <!-- 板块名称 -->
            <div class="section-name">
                {{ data.sectionName || '未命名板块' }}
            </div>
            
            <!-- 底部统计信息 -->
            <div class="stats-row">
                <!-- 创建时间 -->
                <div class="stat-item">
                    <v-icon icon="mdi-clock-outline" size="14" class="stat-icon"></v-icon>
                    <span class="stat-text">{{ formattedPublishTime }}</span>
                </div>
                
                <v-spacer></v-spacer>
                
                <!-- 帖子数量 -->
                <div class="stat-item">
                    <v-icon icon="mdi-comment-text-outline" size="14" class="stat-icon"></v-icon>
                    <span class="stat-text">{{ data.postCount || 0 }}</span>
                </div>
            </div>
        </div>
    </v-card>
</template>
<script>
import { globalProperties } from '@/main';
import { openPage } from '@/utils/other';
import { formatRelativeTime } from '@/utils/format';
import { defineAsyncComponent } from 'vue';

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
        return {
            lazyImgUrl,
        }
    },
    data() {
        return {
            data: this.initData,
        }
    },
    computed: {
        formattedPublishTime() {
            return formatRelativeTime(this.data.publishTime);
        }
    },
    components: {
        ImgCard: defineAsyncComponent(() => import('@/components/common/ImgCard.vue')),
    },
    methods: {
        handleImgClick() {
            this.handleClick();
        },
        handleClick() {
            if (!this.data.id) {
                openPage("url", { url: "#/error/无法找到此资源" });
                return;
            }
            // 跳转到板块页面
            openPage("url", { url: "#/section/" + this.data.id });
        }
    }
}
</script>
<style scoped>
.section-card {
    width: calc(50% - 4px);
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.2s ease;
    background-color: #fff;
    display: flex;
    flex-direction: column;
}

.section-card:active {
    transform: scale(0.98);
    background-color: rgba(0, 0, 0, 0.02);
}

.image-container {
    width: 100%;
    position: relative;
    overflow: hidden;
    background-color: #f5f5f5;
    aspect-ratio: 4 / 3;
}

.image-container :deep(.img-card-container) {
    width: 100%;
    height: 100%;
}

.image-container :deep(.v-img) {
    width: 100%;
    height: 100%;
    min-height: unset !important;
    max-height: unset !important;
    min-width: unset !important;
    max-width: unset !important;
}

.info-container {
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.section-name {
    font-size: var(--font-size-small);
    font-weight: 600;
    color: #333;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.stats-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
}

.stat-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 3px;
    color: #8a8a8a;
}

.stat-icon {
    flex-shrink: 0;
}

.stat-text {
    font-size: var(--font-size-tiny);
    line-height: 1;
}
</style>
