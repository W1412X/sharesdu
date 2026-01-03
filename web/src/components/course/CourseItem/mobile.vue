<!-- 移动端课程项组件 -->
<template>
    <v-card class="card" @click="click()">
        <div class="container">
            <div class="name-container">
                <div class="text-title-bold name key-text">
                    <with-link-container :init-data="{'content':data.name,'keywords':this.searchQuery}" :clickable="false">
                    </with-link-container>
                </div>
                <div class="info-row">
                    <div class="text-small info-item">
                        <v-icon icon="mdi-book-open-outline" size="14" :color="'#8a8a8a'" class="info-icon"></v-icon>
                        <span class="info-label">类型:</span>
                        <span class="key-text info-value">
                            <with-link-container :init-data="{'content':data.type,'keywords':this.searchQuery}" :clickable="false">
                            </with-link-container>
                        </span>
                    </div>
                    <div class="text-small info-item">
                        <v-icon icon="mdi-domain" size="14" :color="'#8a8a8a'" class="info-icon"></v-icon>
                        <span class="info-label">学院:</span>
                        <span class="key-text info-value">
                            <with-link-container :init-data="{'content':data.college,'keywords':this.searchQuery}" :clickable="false">
                            </with-link-container>
                        </span>
                    </div>
                </div>
                <div class="info-row">
                    <div class="text-small info-item">
                        <v-icon icon="mdi-account-group-outline" size="14" :color="'#8a8a8a'" class="info-icon"></v-icon>
                        <span class="info-label">上课:</span>
                        <span class="key-text info-value">
                            <with-link-container :init-data="{'content':data.attendMethod,'keywords':this.searchQuery}" :clickable="false">
                            </with-link-container>
                        </span>
                    </div>
                    <div class="text-small info-item">
                        <v-icon icon="mdi-format-list-checkbox" size="14" :color="'#8a8a8a'" class="info-icon"></v-icon>
                        <span class="info-label">考核:</span>
                        <span class="key-text info-value">
                            <with-link-container :init-data="{'content':data.examineMethod,'keywords':this.searchQuery}" :clickable="false">
                            </with-link-container>
                        </span>
                    </div>
                </div>
                <div class="text-tiny time">
                    <v-icon icon="mdi-clock-outline" size="11" :color="'#8a8a8a'"></v-icon>
                    <span>{{ this.data.publishTime }}</span>
                </div>
            </div>
            <div class="score-container">
                <div class="score-wrapper">
                <div class="text-title-bold score">
                    {{ data.score }}
                </div>
                <div class="text-min score-num">
                    {{ data.evaluateNum }}个评价
                    </div>
                </div>
            </div>
        </div>
    </v-card>
</template>
<script>
import { globalProperties } from '@/main';
import { formatRelativeTime, openPage, roundNumber } from '@/utils/other';
import WithLinkContainer from '../../common/WithLinkContainer.vue';

export default {
    name: 'CourseItemMobile',
    components: {
        WithLinkContainer,
    },
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
        const themeColor = globalProperties.$themeColor;
        return {
            themeColor,
        }
    },
    data() {
        const data = this.initData;
        data.score = roundNumber(data.score, 1);
        if (data.publishTime) {
            data.publishTime = formatRelativeTime(data.publishTime);
        }
        return {
            data,
        }
    },
    methods: {
        click() {
            openPage("url", { url: "#/course/" + this.data.id })
        }
    }
}
</script>
<style scoped>
.card {
    width: 100vw;
    margin-top: 4px;
    border-bottom: 0.5px solid #eeeeee;
    border-radius: 0px;
    cursor: pointer;
}

.container {
    display: flex;
    flex-direction: row;
    padding: 8px;
    gap: 8px;
    align-items: center;
}

.name-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    gap: 4px;
}

.name {
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

.info-row {
    display: flex;
    flex-direction: row;
    gap: 8px;
    flex-wrap: wrap;
}

.info-item {
    display: flex;
    align-items: center;
    color: #8a8a8a;
    flex: 1;
    min-width: 0;
    gap: 2px;
}

.info-icon {
    flex-shrink: 0;
}

.info-label {
    flex-shrink: 0;
    white-space: nowrap;
}

.info-value {
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.time {
    display: flex;
    align-items: center;
    color: #8a8a8a;
    gap: 3px;
    margin-top: 1px;
}

.score-container {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px 10px;
    border-left: 1px solid #eeeeee;
    min-width: 65px;
}

.score-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
}

.score {
    color: var(--theme-color);
    text-align: center;
    line-height: 1.2;
}

.score-num {
    color: #8a8a8a;
    text-align: center;
}
</style>

