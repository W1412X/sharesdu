<template>
    <div class="container">
        <div
            class="name text-medium"
        >
            <avatar-name v-if="data.authorId" :initData="{id:data.authorId,name:data.authorName}"></avatar-name>
        </div>
        <div
             @click="click"
            class="comment text-medium"
        >
            {{ data.content }}
        </div>
        <div
            class="bottom-bar"
        >
            <div class="time text-small">
                <v-icon size="18" icon="mdi-clock-outline" style="margin-right: 5px;"></v-icon>
                <span>{{ this.data.publishTime }}</span>
            </div>
            <v-spacer></v-spacer>
            <div class="bottom-btn-container">
                <like-button @alert="alert" @set_loading="setLoading" :size="'20'" :id="this.data.id" :state="this.data.ifLike" :type="'reply'"></like-button>
            </div>
            <div class="like-num text-small">
                {{ this.data.likeNum }}
            </div>
            <div style="margin-right: 10px;">
                <alert-button :size="'20'" :id="this.data.id" :type="'reply'"></alert-button>
            </div>
        </div>
        <div class="bottom-line"></div>
    </div>
</template>
<script>
import AlertButton from './AlertButton.vue';
import LikeButton from './LikeButton.vue';
import AvatarName from './AvatarName.vue';
export default {
    name: 'PostComment',
    props: {
        initData: {
            type: Object,
            default: () => {
                return {
                    id: null,
                    authorName: null,
                    publishTime: null,
                    likeNum: null,
                    content: null,
                    authorId:null,
                }
            }
        }
    },
    components:{
        AlertButton,
        LikeButton,
        AvatarName,
    },
    data(){
        const data=this.initData;
        return{
            data,
        }
    },
    methods: {
        click(){
            window.alert("sss");
        },
        alert(msg){
            this.$emit('alert',msg);
        },
        setLoading(msg){
            this.$emit('set_loading',msg);
        },
    }
}
</script>
<style scoped>
.bottom-bar{
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-top: 5px;
}
.bottom-line{
    margin-top: 5px;
    border-bottom: #8a8a8a 1px solid;
}
.column-center{
    display: flex;
    flex-direction: row;
    align-items: center;
}
.like-num{
    display: flex;
    align-items: center;
    height: 100%;
    margin-left: 3px;
    margin-right: 15px;
    margin-top: 2px;
    max-width: 100px;
    align-items: center;
    color: grey;
    white-space:nowrap; 
    overflow:hidden;
    text-overflow:ellipsis;
}
@media screen and (min-width: 600px) {
    .container{
        width: 900px;
        display: flex;
        flex-direction: column;
        padding-top: 15px;
        padding-left: 15px;
        padding-right: 15px;
    }
    .name{
        width: 100%;
        display: flex;
        margin-bottom: 5px;
    }
    .time{
        flex-direction: row;
        display: flex;
        color: grey;
        width: fit-content;
        margin-right: 5px;
        align-items: center;
    }
}

@media screen and (max-width: 600px) {
    .container{
        width: 100%;
        display: flex;
        flex-direction: column;
        padding-top: 10px;
        padding-left: 10px;
        padding-right: 10px;
    }
    .name{
        width: 100%;
        display: flex;
        margin-bottom: 5px;
    }
    .time{
        flex-direction: row;
        display: flex;
        margin-top: 5px;
        color: grey;
        width: fit-content;
        margin-right: 5px;
        align-items: center;
    }
}
</style>