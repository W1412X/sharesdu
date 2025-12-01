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
                        类型:<span class="key-text">
                            <with-link-container :init-data="{'content':data.type,'keywords':this.searchQuery}" :clickable="false">
                            </with-link-container>
                        </span>
                    </div>
                    <div class="text-small info-item">
                        学院:<span class="key-text">
                            <with-link-container :init-data="{'content':data.college,'keywords':this.searchQuery}" :clickable="false">
                            </with-link-container>
                        </span>
                    </div>
                </div>
                <div class="info-row">
                    <div class="text-small info-item">
                        上课:<span class="key-text">
                            <with-link-container :init-data="{'content':data.attendMethod,'keywords':this.searchQuery}" :clickable="false">
                            </with-link-container>
                        </span>
                    </div>
                    <div class="text-small info-item">
                        考核:<span class="key-text">
                            <with-link-container :init-data="{'content':data.examineMethod,'keywords':this.searchQuery}" :clickable="false">
                            </with-link-container>
                        </span>
                    </div>
                </div>
                <div class="text-tiny time">
                    <span>{{ this.data.publishTime }}</span>
                </div>
            </div>
            <div class="score-container">
                <div class="text-title score">
                    {{ data.score }}
                </div>
                <div class="text-min score-num">
                    {{ data.evaluateNum }}个评价
                </div>
            </div>
        </div>
    </v-card>
</template>
<script>
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
        return {}
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
}

.container {
    display: flex;
    flex-direction: row;
    padding: 4px;
    gap: 2px;
    align-items: center;
}

.name-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.name {
    flex: 0 0 auto;
    max-width: 100%;
    margin-bottom: 2px;
    line-height: 1.4;
    max-height: 2.8em;
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
    gap: 1px;
    margin-top: 2px;
}

.info-item {
    color: #8a8a8a;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
    min-width: 0;
}

.time {
    color: #8a8a8a;
    margin-top: 6px;
    display: flex;
    align-items: center;
}

.score-container {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 8px;
    min-width: 80px;
}

.score {
    font-weight: bold;
    color: var(--theme-color);
    text-align: center;
}

.score-num {
    color: #8a8a8a;
    text-align: center;
    margin-top: 4px;
}
</style>

