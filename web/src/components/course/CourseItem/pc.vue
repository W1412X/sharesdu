<!-- PC 端课程项组件 -->
<template>
    <v-card class="card" elevation="1" @click="click()">
        <div class="row-div">
            <div class="name-container">
                <div class="name text-title-bold key-text">
                    <with-link-container :init-data="{'content':data.name,'keywords':this.searchQuery}" :clickable="false">
                    </with-link-container>
                </div>
                <div class="info-group">
                    <div class="text-small info-item">
                        <v-icon icon="mdi-book-open-outline" size="16" :color="'#8a8a8a'" class="info-icon"></v-icon>
                        <span class="info-label">课程类型:</span>
                        <span class="key-text info-value">
                            <with-link-container :init-data="{'content':data.type,'keywords':this.searchQuery}" :clickable="false">
                            </with-link-container>
                        </span>
                    </div>
                    <div class="text-small info-item">
                        <v-icon icon="mdi-domain" size="16" :color="'#8a8a8a'" class="info-icon"></v-icon>
                        <span class="info-label">开设学院:</span>
                        <span class="key-text info-value">
                            <with-link-container :init-data="{'content':data.college,'keywords':this.searchQuery}" :clickable="false">
                            </with-link-container>
                        </span>
                    </div>
                </div>
                <div class="info-group">
                    <div class="text-small info-item">
                        <v-icon icon="mdi-account-group-outline" size="16" :color="'#8a8a8a'" class="info-icon"></v-icon>
                        <span class="info-label">上课方式:</span>
                        <span class="key-text info-value">
                            <with-link-container :init-data="{'content':data.attendMethod,'keywords':this.searchQuery}" :clickable="false">
                            </with-link-container>
                        </span>
                    </div>
                    <div class="text-small info-item">
                        <v-icon icon="mdi-format-list-checkbox" size="16" :color="'#8a8a8a'" class="info-icon"></v-icon>
                        <span class="info-label">考核方式:</span>
                        <span class="key-text info-value">
                            <with-link-container :init-data="{'content':data.examineMethod,'keywords':this.searchQuery}" :clickable="false">
                            </with-link-container>
                        </span>
                    </div>
                </div>
                <div class="text-tiny time">
                    <v-icon icon="mdi-clock-outline" size="12" :color="'#8a8a8a'"></v-icon>
                    <span>{{ this.data.publishTime }}</span>
                </div>
            </div>
            <div class="score-container">
                <div class="score-wrapper">
                    <div class="text-title-bold score">
                        {{ data.score }}
                    </div>
                    <div class="text-small score-num">
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
    name: 'CourseItemPc',
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
    width: 750px;
    padding: 12px 16px;
    margin-top: 5px;
    cursor: pointer;
    transition: box-shadow 0.2s;
}

.card:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.row-div {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 20px;
}

.name-container {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
    gap: 8px;
}

.name {
    min-height: 27px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.4;
    margin-bottom: 4px;
}

.info-group {
    display: flex;
    flex-direction: row;
    gap: 24px;
    flex-wrap: wrap;
}

.info-item {
    display: flex;
    align-items: center;
    color: #8a8a8a;
    min-width: 0;
    flex: 1;
    gap: 4px;
}

.info-icon {
    flex-shrink: 0;
    margin-right: 2px;
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
    gap: 4px;
    margin-top: 4px;
}

.score-container {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 16px;
    border-left: 1px solid #eeeeee;
    min-width: 120px;
}

.score-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
}

.score {
    color: var(--theme-color);
    line-height: 1.2;
}

.score-num {
    color: #8a8a8a;
    text-align: center;
}
</style>

