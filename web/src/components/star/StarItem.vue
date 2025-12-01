<!--star button-->
<template>
    <v-card @click="click()" class="card" variant="tonal" :color="ifStarType?themeColor:'white'">
        <div class="div-2">
            <v-icon :color="ifStarType?themeColor:'grey'" :icon="getIcon(this.data.type)" class="item-icon"/>
            <div class="div-1">
                <div class="title-container title">
                    {{ data.title }}
                </div>
                <div class="time-container text-small">
                    {{ data.time }}
                </div>
            </div>
        </div>
    </v-card>
</template>

<script>
import { globalProperties } from '@/main';
import { formatRelativeTime, getReplyContentWithoutHeader, openPage } from '@/utils/other';

export default {
    props: {
        initData: {
            type: Object,
            default: () => {
                return {
                    type: null,//article,course,post
                    id: null,
                    title: null,
                    time: null,
                }
            }
        },
        ifStarType:{
            type: Boolean,
            default: true,
        }
    },
    setup(){
        const themeColor=globalProperties.$themeColor;
        return {
            themeColor,
        }
    },
    data() {
        const data = this.initData;
        if(data.type=='reply'){
            data.title=getReplyContentWithoutHeader(data.title);
        }
        if (data.time) {
            data.time = formatRelativeTime(data.time);
        }
        return {
            data,
            ifStar: true,
        };
    },
    components: {
    },
    methods: {
        click(){
            switch(this.data.type){
                case 'article':
                    openPage("url",{url:"#/article/"+this.data.id});
                    break;
                case 'course':
                    openPage("url",{url:"#/course/"+this.data.id});
                    break;
                case 'post':
                    openPage("url",{url:"#/post/"+this.data.id});
                    break;
                case 'reply':
                    openPage("url",{url:"#/post/"+this.data.postId});
            }
        },
        getIcon(type) {
            switch (type) {
                case 'article':
                    return 'mdi-file-document-outline';
                case 'course':
                    return 'mdi-book-outline';
                case 'post':
                    return "mdi-comment-question-outline";
                case 'reply':
                    return "mdi-reply-outline";
            }
            return "mdi-star"
        },
    }
}
</script>
<style scoped>
.card {
    display: flex !important;
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    box-sizing: border-box !important;
    overflow: hidden !important; /* 防止内容溢出 */
    margin: 0 !important;
}

.div-2 {
    width: 100%;
    max-width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    min-width: 0; /* 允许 flex 子元素收缩 */
    overflow: hidden; /* 防止内容溢出 */
}

.div-1 {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0; /* 允许 flex 子元素收缩 */
    overflow: hidden;
}

.title-container {
    color: #000;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    max-width: 100%;
}

.time-container {
    color: grey;
    margin-top: 4px;
    font-size: var(--font-size-tiny);
}

.item-icon {
    margin-right: 12px;
    flex-shrink: 0; /* 图标不收缩 */
}

/* PC 端样式 */
@media screen and (min-width: 1000px) {
    .card {
        padding: 8px 12px;
    }
}

/* 移动端样式 */
@media screen and (max-width: 1000px) {
    .card {
        padding: 6px 10px;
    }
}
</style>