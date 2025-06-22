<!--star button-->
<template>
    <v-card @click="click()" class="card" elevation="1" variant="tonal" :color="ifStarType?themeColor:'white'">
        <div class="div-2">
            <v-icon :color="ifStarType?themeColor:'grey'" :icon="getIcon(this.data.type)" style="margin-right: 20px;margin-left: 5pxz;"/>
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
import { getReplyContentWithoutHeader, openPage } from '@/utils/other';

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
    .title-container{
        color: #000;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 80%;
    }
    .time-container{
        color:grey;
        margin-top:0px;
    }
@media screen and (min-width: 1000px) {
    .card {
        padding: 5px;
        width: 100%;
    }
    .div-1 {
        width: 100%;
        display: flex;
        flex-direction: column;
    }
    .div-2{
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
    }
}

@media screen and (max-width: 1000px) {
    .card {
        padding: 3px;
        width: 100%;
    }
    .div-1 {
        width: 100%;
        display: flex;
        flex-direction: column;
    }
    .div-2{
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
    }
}
</style>