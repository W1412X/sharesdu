<!-- PC 端课程项组件 -->
<template>
    <v-card class="card" @click="click()">
        <div class="row-div">
            <div class="name-container">
                <div class="name title key-text">
                    <with-link-container :init-data="{'content':data.name,'keywords':this.searchQuery}" :clickable="false">
                    </with-link-container>
                </div>
                <div class="row-div">
                    <div class="text-small msg">
                        课程类型:<span class="key-text">
                            <with-link-container :init-data="{'content':data.type,'keywords':this.searchQuery}" :clickable="false">
                            </with-link-container>
                        </span>
                    </div>
                    <div class="text-small msg">
                        开设学院:<span class="key-text">
                            <with-link-container :init-data="{'content':data.college,'keywords':this.searchQuery}" :clickable="false">
                            </with-link-container>
                        </span>
                    </div>
                </div>
                <div class="row-div">
                    <div class="text-small msg">
                        上课方式:<span class="key-text">
                            <with-link-container :init-data="{'content':data.attendMethod,'keywords':this.searchQuery}" :clickable="false">
                            </with-link-container>
                        </span>
                    </div>
                    <div class="text-small msg">
                        考核方式:<span class="key-text">
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
                <div class="title score">
                    {{ data.score }}
                </div>
                <div class="text-small score-num">
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
.time {
    color: #8a8a8a;
    align-items: center;
    margin-top: 2px;
    display: flex;
    height: 100%;
    width: fit-content;
    flex-direction: row-reverse;
    overflow-x: auto;
}

.card {
    width: 750px;
    padding: 10px;
    margin-top: 5px;
}

.row-div {
    display: flex;
    height: 100%;
    flex-direction: row;
    overflow-x: auto;
}

.name-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 450px;
    height: 100%;
}

.name {
    width: 450px;
    min-height: 27px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    justify-self: center;
    line-clamp: 1;
}

.score-container {
    margin-left: 50px;
    width: 250px;
    padding: 10px;
    display: grid;
}

.score {
    font-weight: bold;
    color: var(--theme-color);
    justify-self: center;
}

.score-num {
    color: grey;
    justify-self: center;
}

.msg {
    color: #8a8a8a;
    width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 4px;
}
</style>

