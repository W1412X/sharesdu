<template>
    <v-card class="card" @click="click()">
        <div class="column-div">
            <img-card :width="deviceType === 'desktop'?140:95" :height="deviceType === 'desktop'?130:95" class="img" :lazy-src="lazyImgUrl" :src="data.coverLink"
                cover aspect-ratio="7/6"></img-card>
            <div class="row-div padding-left-5">
                <div class="title title-container">{{ data.title }}</div>
                <div class="text-small summary-container">{{ data.summary }}</div>
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
import { openNewPage } from '@/utils/other';
import ImgCard from './ImgCard.vue';
export default {
    name: 'ArticleItem',
    props: {
        initData: {
            type: Object,
            default: () => {
                return {
                    id: null,
                    title: null,
                    summary: null,
                    starNum: null,
                    viewNum: null,
                    likeNum: null,
                    articleTags:null,
                    publishTime: null,
                    hotScore:null,
                    comment: null,
                    authorName: null,
                    authorId:null,
                    coverLink:null,
                    type:null,

                }
            }
        }
    },
    setup() {
        const lazyImgUrl = globalProperties.$lazyImgUrl;
        const deviceType = globalProperties.$deviceType;
        return {
            deviceType,
            lazyImgUrl,
        }
    },
    data() {
        const data = this.initData;
        return {
            data,
        }
    },
    components:{
        ImgCard,
    },
    methods:{
        click(){
            /**
             * open a new tab and go
             */
            if(!this.data.id){//no id param
                openNewPage("#/error/无法找到此资源");
            }
            openNewPage("#/article/"+this.data.id);
        }
    }
}
</script>
<style scoped>
.padding-left-5 {
    padding: 5px;
}
@media screen and (min-width: 1000px) {
    .card {
        padding: 5px;
        width: 750px;
        margin-top: 5px;
    }

    .column-div {
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
    }

    .title-container {
        max-width: 550px;
        height: 27px;
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
}

@media screen and (max-width: 1000px) {
    .card {
        width: 100vw;
        margin-top: 5px;
    }

    .column-div {
        display: flex;
        flex-direction: row;
        padding: 5px;
        height: 105px;
    }

    .row-div {
        width: 100%;
        display: flex;
        flex-direction: column;
    }

    .title-container {
        max-width: 90vw;
        height: 35px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .summary-container {
        color: #8a8a8a;
        padding-top: 5px;
        white-space: normal;
        word-break: break-all;
        overflow: hidden;
        color: #8a8a8a;
        line-height: 1.2;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        text-overflow: ellipsis;
    }

    .bottom-bar {
        display: flex;
        flex-direction: row;
        color: #8a8a8a;
        align-items: center;
    }

    .bottom-item {
        display: flex;
        flex-direction: row;
        margin-right: 10px;
    }
}
</style>