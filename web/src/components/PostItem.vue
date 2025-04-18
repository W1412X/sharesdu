<template>
    <v-card class="card" elevation="0">
        <div class="row-div">
            <div class="text-small bottom-bar avatar-name-column-center">
                <avatar-name v-if="data.authorId" :initData="{id:data.authorId,name:data.authorName}"></avatar-name>
                <v-spacer></v-spacer>
                <div v-if="data.likeNum!=null" class="bottom-item">
                    <v-icon icon="mdi-heart" size="19"></v-icon>
                    <div>{{ data.likeNum }}</div>
                </div>
                <div v-if="data.viewNum!=null" class="bottom-item">
                    <v-icon icon="mdi-eye" size="20"></v-icon>
                    <div>{{ data.viewNum }}</div>
                </div>
                <div v-if="data.replyNum!=null" class="bottom-item">
                    <v-icon icon="mdi-comment" size="18" style="margin-top: 2px;"></v-icon>
                    <div>{{ data.replyNum }}</div>
                </div>
            </div>
            <div @click="click()" class="title title-container">{{ data.title }}</div>
            <!--
             <div class="text-small detail-container">{{ data.content }}</div>
            -->
            <div @click="click()" class="text-medium detail-expand">{{ data.content }}</div>
            <div class="row-div-scroll">
                <img-card v-for="(img,index) in data.imgList" :height="100" :width="100" :src="img" :key="index"></img-card>
            </div>
        </div>
    </v-card>
</template>
<script>
import { globalProperties } from '@/main';
import AvatarName from '@/components/AvatarName.vue';
import { ref } from 'vue';
import { copy, extractStringsInBrackets, getLinkInPost, getPostWithoutLink, openNewPage, removeStringsInBrackets } from '@/utils/other';
import ImgCard from './ImgCard.vue';
export default {
    name: 'PostItem',
    components: {
        AvatarName,
        ImgCard,
    },
    props: {
        initData: {
            type: Object,
            default: () => {
                return {
                    id: null,
                    title: null,
                    content: null,
                    viewNum: null,
                    replyNum: null,
                    authorName: null,
                    authorId:null,
                }
            }
        }
    },
    setup() {
        const themeColor = globalProperties.$themeColor;
        const lazyImgUrl = globalProperties.$lazyImgUrl;
        const deviceType = globalProperties.$deviceType;
        const loadState=ref(false);
        const setLoadState=(state)=>{
            loadState.value=state;
        }
        return {
            deviceType,
            lazyImgUrl,
            themeColor,
            loadState,
            setLoadState,
        }
    },
    data() {
        return {
            data:{},
        }
    },
    methods:{
        click(){
            /**
             * to post page
             */
            if(this.data.id==null){//no id param
                this.$router.push({
                    name:'ErrorPage',
                    params:{
                        reason:"未指定资源！"
                    }
                })
                return;
            }
            openNewPage("#/post/"+this.data.id)
        },
    },
    mounted(){
        this.data =copy(this.initData);
        let link=getLinkInPost(this.data.content);
        let content=getPostWithoutLink(this.data.content);
        let imgList=extractStringsInBrackets(content);
        content=removeStringsInBrackets(content);
        this.data.link=link;
        this.data.content=content;
        this.data.imgList=imgList;
    }
}
</script>
<style scoped>
.avatar-name-column-center{
    display: flex;
    align-items: center;
    margin-top:5px;
    margin-bottom:5px;
}
.row-div-scroll{
    margin: 5px;
    display: flex;
    flex-direction: row;
    overflow-x: scroll;
    width: 100%;
}
@media screen and (min-width: 1000px) {
    .card {
        width: 750px;
        margin-top: 5px;
        padding-top: 5px;
        padding-left: 5px;
        padding-right: 5px;
        padding-bottom: 15px;
        border-bottom: #eeeeee 1px solid;
        border-radius: 0px;
    }
    .row-div {
        display: flex;
        flex-direction: column;
    }
    .title-container {
        max-width: 700px;
        height: 27px;
        white-space: pre-line;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .detail-container {
        max-width: 730px;
        white-space: pre-line;
        word-break: break-all;
        overflow: hidden;
        color: #8a8a8a;
        line-height: 1.2;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
        text-overflow: ellipsis;
    }
    .detail-expand{
        max-width: 730px;
        white-space: pre-line;
        word-break: break-all;
        color: #6a6a6a;
        overflow: hidden;
        line-height: 1.2;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        text-overflow: ellipsis;
    }
    .bottom-bar {
        width: 740px;
        display: flex;
        flex-direction: row;
        color: #8a8a8a;
        margin-left: 5px;
    }
    .author{
        color: var(--theme-color);
    }
    .bottom-item {
        align-items: center;
        display: flex;
        flex-direction: row;
        margin-right: 20px;
    }
}

@media screen and (max-width: 1000px) {
    .card {
        border-bottom: #eeeeee 1px solid;
        border-radius: 0px;
        padding-top: 5px;
        padding-left: 5px;
        padding-right: 5px;
        padding-bottom: 15px;
        width: 100vw;
        margin-top: 1px;
    }
    .row-div {
        width: 100%;
        display: flex;
        flex-direction: column;
    }
    .title-container {
        max-width: 90vw;
        height: 27px;
        white-space: pre-line;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .detail-container {
        color: #8a8a8a;
        padding-top: 2px;
        white-space: pre-line;
        word-break: break-all;
        overflow: hidden;
        color: #8a8a8a;
        line-height: 1.2;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        text-overflow: ellipsis;
    }
    .detail-expand{
        color: #6a6a6a;
        padding-top: 2px;
        white-space: pre-line;
        word-break: break-all;
        overflow: hidden;
        line-height: 1.2;
        display: -webkit-box;
        -webkit-box-orient: vertical;
    }
    .bottom-bar {
        display: flex;
        flex-direction: row;
        align-items: center;
        color: #8a8a8a;
        margin-left: 5px;
        margin-top: 8px;
    }
    .author{
        color:var(--theme-color);
    }
    .bottom-item {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin-right: 10px;
    }
}
</style>